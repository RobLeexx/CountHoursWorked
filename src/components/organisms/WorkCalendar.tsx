import { Pressable, StyleSheet, View } from 'react-native';

import type { WorkLog } from '@/types';
import { useAppTheme } from '@/theme';
import { WEEKDAY_LABELS, formatMonthLabel, getCurrentMonthDays, toDateKey } from '@/utils';

import { AppIconButton } from '../atoms/AppIconButton';
import { AppText } from '../atoms/AppText';

export type WorkCalendarProps = {
  selectedDate: string;
  visibleMonth: Date;
  holidayDates: string[];
  workLogs: WorkLog[];
  onSelectDate: (dateKey: string) => void;
  onChangeMonth: (direction: 'previous' | 'next') => void;
};

export function WorkCalendar({
  selectedDate,
  visibleMonth,
  holidayDates,
  workLogs,
  onSelectDate,
  onChangeMonth,
}: WorkCalendarProps) {
  const theme = useAppTheme();
  const monthDays = getCurrentMonthDays(visibleMonth);
  const loggedDates = new Set(workLogs.map((log) => log.date));
  const holidayDateSet = new Set(holidayDates);
  const todayKey = toDateKey(new Date());

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
          accessibilityLabel="Previous month"
          icon="chevron-back"
          onPress={() => onChangeMonth('previous')}
        />
        <AppText variant="title" weight="bold">
          {formatMonthLabel(visibleMonth)}
        </AppText>
        <AppIconButton
          accessibilityLabel="Next month"
          icon="chevron-forward"
          onPress={() => onChangeMonth('next')}
        />
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
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
          const showTodayRing = day.dateKey === todayKey && !isSelected;

          return (
            <View key={day.dateKey} style={styles.dayWrapper}>
              <Pressable
                onPress={() => onSelectDate(day.dateKey)}
                style={[
                  styles.dayCell,
                  {
                    backgroundColor: isHoliday
                      ? isSelected
                        ? theme.colors.warning
                        : theme.colors.warningSoft
                      : isSelected
                        ? theme.colors.primary
                        : theme.colors.surfaceMuted,
                    borderColor: showTodayRing ? theme.colors.primary : 'transparent',
                    opacity: day.isCurrentMonth ? 1 : 0.45,
                  },
                ]}
              >
                <AppText
                  color={isSelected || isHoliday ? 'inverse' : 'text'}
                  weight={isSelected || day.isToday ? 'semibold' : 'regular'}
                  style={!isSelected && isHoliday ? { color: theme.colors.warning } : undefined}
                >
                  {day.dayNumber}
                </AppText>

                <View
                  style={[
                    styles.marker,
                    {
                      backgroundColor: hasLogs
                        ? isSelected || isHoliday
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
    justifyContent: 'space-between',
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
