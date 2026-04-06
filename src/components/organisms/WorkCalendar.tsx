import { useCallback, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppContext } from '@/context';
import type { WorkLog } from '@/types';
import { useAppTheme } from '@/theme';
import { formatMonthLabel, getCurrentMonthDays, getWeekdayLabels, toDateKey } from '@/utils';

import { AppIconButton } from '../atoms/AppIconButton';
import { AppText } from '../atoms/AppText';

export type WorkCalendarProps = {
  selectedDate: string;
  visibleMonth: Date;
  holidayDates: string[];
  paydayColors: Partial<Record<string, string>>;
  workLogs: WorkLog[];
  onSelectDate: (dateKey: string) => void;
  onOpenDate: (dateKey: string) => void;
  onChangeMonth: (direction: 'previous' | 'next') => void;
};

const DOUBLE_TAP_DELAY_MS = 280;

export function WorkCalendar({
  selectedDate,
  visibleMonth,
  holidayDates,
  paydayColors,
  workLogs,
  onSelectDate,
  onOpenDate,
  onChangeMonth,
}: WorkCalendarProps) {
  const { language, locale, t, weekStart } = useAppContext();
  const theme = useAppTheme();
  const monthDays = useMemo(() => getCurrentMonthDays(visibleMonth, weekStart), [visibleMonth, weekStart]);
  const weekdayLabels = useMemo(() => getWeekdayLabels(language, weekStart), [language, weekStart]);
  const loggedDates = useMemo(() => new Set(workLogs.map((log) => log.date)), [workLogs]);
  const holidayDateSet = useMemo(() => new Set(holidayDates), [holidayDates]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const lastTapRef = useRef<{ dateKey: string; timestamp: number }>({
    dateKey: '',
    timestamp: 0,
  });

  const handleDayPress = useCallback(
    (dateKey: string) => {
      const now = Date.now();
      const isDoubleTap =
        lastTapRef.current.dateKey === dateKey && now - lastTapRef.current.timestamp <= DOUBLE_TAP_DELAY_MS;

      onSelectDate(dateKey);

      if (isDoubleTap) {
        lastTapRef.current = { dateKey: '', timestamp: 0 };
        onOpenDate(dateKey);
        return;
      }

      lastTapRef.current = { dateKey, timestamp: now };
    },
    [onOpenDate, onSelectDate],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.monthRow}>
        <AppIconButton
          accessibilityLabel={t('calendar.previousMonth')}
          icon="chevron-back"
          onPress={() => onChangeMonth('previous')}
          style={styles.monthButton}
        />
        <AppText
          variant="title"
          weight="bold"
          align="center"
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          numberOfLines={1}
          style={styles.monthLabel}
        >
          {formatMonthLabel(visibleMonth, locale)}
        </AppText>
        <AppIconButton
          accessibilityLabel={t('calendar.nextMonth')}
          icon="chevron-forward"
          onPress={() => onChangeMonth('next')}
          style={styles.monthButton}
        />
      </View>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekdayWrapper}>
            <AppText variant="bodySmall" color="muted" align="center" style={styles.weekdayCell}>
              {label}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {monthDays.map((day) => {
          const isSelected = day.dateKey === selectedDate;
          const hasLogs = loggedDates.has(day.dateKey);
          const isHoliday = holidayDateSet.has(day.dateKey);
          const paydayColor = paydayColors[day.dateKey];
          const isPayday = Boolean(paydayColor);
          const showTodayRing = day.dateKey === todayKey && !isSelected;
          const backgroundColor = isHoliday
            ? isSelected
              ? theme.colors.warning
              : theme.colors.warningSoft
            : isPayday
              ? paydayColor
              : isSelected
                ? theme.colors.primary
                : theme.colors.surfaceMuted;
          const dayTextStyle = !isSelected && isHoliday ? { color: theme.colors.warning } : undefined;
          const showInverseContent = isSelected || isHoliday || isPayday;

          return (
            <View key={day.dateKey} style={styles.dayWrapper}>
              <Pressable
                onPress={() => handleDayPress(day.dateKey)}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor,
                    borderColor: showTodayRing ? theme.colors.primary : 'transparent',
                    opacity: day.isCurrentMonth ? 1 : 0.45,
                  },
                ]}
              >
                <AppText
                  color={showInverseContent ? 'inverse' : 'text'}
                  weight={isSelected || day.isToday ? 'semibold' : 'regular'}
                  style={dayTextStyle}
                >
                  {day.dayNumber}
                </AppText>

                <View
                  style={[
                    styles.marker,
                    {
                      backgroundColor: hasLogs
                        ? showInverseContent
                          ? theme.colors.inverse
                          : theme.colors.primary
                        : 'transparent',
                    },
                  ]}
                />
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  monthButton: {
    flexShrink: 0,
  },
  monthLabel: {
    flex: 1,
    minWidth: 0,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginHorizontal: -4,
  },
  weekdayWrapper: {
    paddingHorizontal: 4,
    width: '14.2857%',
  },
  weekdayCell: {
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    rowGap: 8,
  },
  dayWrapper: {
    paddingHorizontal: 4,
    width: '14.2857%',
  },
  dayCell: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    minHeight: 52,
    justifyContent: 'center',
    width: '100%',
  },
  marker: {
    borderRadius: 999,
    height: 6,
    width: 6,
  },
});
