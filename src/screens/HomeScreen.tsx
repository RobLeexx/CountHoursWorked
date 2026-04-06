import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';

import { AppButton, AppText, DayDetails, MainLayout, Summary, WorkCalendar } from '@/components';
import { useAppContext } from '@/context';
import { useProjects, useWorkLogs } from '@/hooks';
import { useAppTheme } from '@/theme';
import { addMonths, calculateMonthlyProjection, fromDateKey, toDateKey } from '@/utils';

const SHEET_ANIMATION_DURATION_MS = 220;
const SHEET_HIDDEN_OFFSET = 520;

export function HomeScreen() {
  const { holidayDates, isHydrated, t, toggleHoliday } = useAppContext();
  const { projects } = useProjects();
  const theme = useAppTheme();
  const today = useMemo(() => new Date(), []);
  const [selectedDate, setSelectedDate] = useState(toDateKey(today));
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isDayDetailsMounted, setDayDetailsMounted] = useState(false);
  const sheetAnimation = useRef(new Animated.Value(0)).current;
  const {
    workLogs,
    dayLogs,
    setHoursForProject,
    clearHoursForProject,
    dailyHours,
    weeklyHours,
    monthlyHours,
    dailyEarningsByCurrency,
    weeklyEarningsByCurrency,
    monthlyEarningsByCurrency,
  } = useWorkLogs(selectedDate);
  const projectIds = useMemo(() => new Set(projects.map((project) => project.id)), [projects]);
  const monthlyProjection = useMemo(
    () => calculateMonthlyProjection(projects, workLogs, holidayDates, visibleMonth),
    [holidayDates, projects, visibleMonth, workLogs],
  );

  const syncSelectedDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    const date = fromDateKey(dateKey);
    setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  }, []);

  const getPreferredProjectIdForDate = useCallback((dateKey: string) => {
    const existingDayLog = workLogs.find((log) => log.date === dateKey && projectIds.has(log.projectId));

    if (existingDayLog) {
      return existingDayLog.projectId;
    }

    if (projects.some((project) => project.id === selectedProjectId)) {
      return selectedProjectId;
    }

    return projects[0]?.id ?? '';
  }, [projectIds, projects, selectedProjectId, workLogs]);

  const openDayDetails = useCallback((dateKey: string) => {
    syncSelectedDate(dateKey);
    setSelectedProjectId(getPreferredProjectIdForDate(dateKey));
    setDayDetailsMounted(true);
  }, [getPreferredProjectIdForDate, syncSelectedDate]);

  const closeDayDetails = useCallback(() => {
    Animated.timing(sheetAnimation, {
      toValue: 0,
      duration: SHEET_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setDayDetailsMounted(false);
      }
    });
  }, [sheetAnimation]);

  useEffect(() => {
    if (!isDayDetailsMounted) {
      sheetAnimation.setValue(0);
      return;
    }

    Animated.timing(sheetAnimation, {
      toValue: 1,
      duration: SHEET_ANIMATION_DURATION_MS,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [isDayDetailsMounted, sheetAnimation]);

  useEffect(() => {
    if (projects.length === 0) {
      setSelectedProjectId('');
      return;
    }

    if (!projects.some((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const changeMonth = useCallback((direction: 'previous' | 'next') => {
    const nextMonth = addMonths(visibleMonth, direction === 'previous' ? -1 : 1);
    setVisibleMonth(nextMonth);
    setSelectedDate(toDateKey(nextMonth));
  }, [visibleMonth]);

  const sheetTranslateY = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [SHEET_HIDDEN_OFFSET, 0],
  });

  return (
    <View style={styles.screen}>
      <MainLayout contentContainerStyle={styles.content} showHeader={false} title={t('header.home')}>
        {!isHydrated ? <AppText color="muted">{t('common.loadingSavedData')}</AppText> : null}

        <WorkCalendar
          selectedDate={selectedDate}
          visibleMonth={visibleMonth}
          holidayDates={holidayDates}
          workLogs={workLogs}
          onSelectDate={syncSelectedDate}
          onOpenDate={openDayDetails}
          onChangeMonth={changeMonth}
        />

        <Summary
          dailyHours={dailyHours}
          weeklyHours={weeklyHours}
          monthlyHours={monthlyHours}
          dailyEarnings={dailyEarningsByCurrency}
          weeklyEarnings={weeklyEarningsByCurrency}
          monthlyEarnings={monthlyEarningsByCurrency}
          monthlyProjectionHours={monthlyProjection.totalProjectedHours}
          monthlyProjectionEarnings={monthlyProjection.totalProjectedEarningsByCurrency}
          projectionMonth={visibleMonth}
        />
      </MainLayout>

      {isDayDetailsMounted ? (
        <View pointerEvents="box-none" style={styles.sheetLayer}>
          <Pressable style={styles.sheetBackdropPressable} onPress={closeDayDetails}>
            <Animated.View
              style={[
                styles.sheetBackdrop,
                {
                  opacity: sheetAnimation,
                },
              ]}
            />
          </Pressable>

          <Animated.View
            style={[
              styles.sheetContainer,
              {
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.sheetHandleWrapper}>
              <View
                style={[
                  styles.sheetHandle,
                  {
                    backgroundColor: theme.colors.borderStrong,
                  },
                ]}
              />
            </View>
            <DayDetails
              selectedDate={selectedDate}
              projects={projects}
              dayLogs={dayLogs}
              isHoliday={holidayDates.includes(selectedDate)}
              selectedProjectId={selectedProjectId}
              onSelectProject={setSelectedProjectId}
              onSaveHours={setHoursForProject}
              onClearHours={clearHoursForProject}
              onToggleHoliday={() => toggleHoliday(selectedDate)}
            />
            <View
              style={[
                styles.sheetActions,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <AppButton
                title={t('common.close')}
                onPress={closeDayDetails}
                variant="secondary"
              />
            </View>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: 16,
  },
  sheetLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheetBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheetContainer: {
    padding: 16,
    paddingTop: 8,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetHandle: {
    borderRadius: 999,
    height: 5,
    width: 44,
  },
  sheetActions: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
});
