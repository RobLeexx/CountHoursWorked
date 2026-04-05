import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppContext } from '@/context';
import type { CurrencyTotals } from '@/utils';
import { useAppTheme } from '@/theme';
import { formatCurrency, formatMonthName } from '@/utils';

import { AppText } from '../atoms/AppText';

type SummaryItemProps = {
  hoursLabel: string;
  earningsLabel: string;
  hoursValue: string;
  earningsValue: string;
};

export type SummaryProps = {
  dailyHours: number;
  weeklyHours: number;
  monthlyHours: number;
  dailyEarnings: CurrencyTotals;
  weeklyEarnings: CurrencyTotals;
  monthlyEarnings: CurrencyTotals;
  monthlyProjectionHours: number;
  monthlyProjectionEarnings: CurrencyTotals;
  projectionMonth: Date;
};

function formatTotals(value: CurrencyTotals, locale: string) {
  const entries = Object.entries(value).filter(([, total]) => typeof total === 'number' && total > 0);

  if (entries.length === 0) {
    return '0.00';
  }

  return entries.map(([currency, total]) => formatCurrency(total ?? 0, locale, currency as 'EUR' | 'USD')).join('\n');
}

function formatHours(value: number) {
  return Number(value.toFixed(2)).toString();
}

function SummaryItem({ hoursLabel, earningsLabel, hoursValue, earningsValue }: SummaryItemProps) {
  const theme = useAppTheme();
  const [showEarnings, setShowEarnings] = useState(false);
  const label = showEarnings ? earningsLabel : hoursLabel;
  const value = showEarnings ? earningsValue : hoursValue;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => setShowEarnings((currentValue) => !currentValue)}
      style={({ pressed }) => [
        styles.item,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <AppText variant="bodySmall" color="muted">
        {label}
      </AppText>
      <AppText variant="title" weight="bold">
        {value}
      </AppText>
    </Pressable>
  );
}

export function Summary({
  dailyHours,
  weeklyHours,
  monthlyHours,
  dailyEarnings,
  weeklyEarnings,
  monthlyEarnings,
  monthlyProjectionHours,
  monthlyProjectionEarnings,
  projectionMonth,
}: SummaryProps) {
  const { locale, t } = useAppContext();
  const projectionMonthName = formatMonthName(projectionMonth, locale);
  const items = useMemo(
    () => [
      {
        key: 'today',
        hoursLabel: t('summary.hoursToday'),
        earningsLabel: t('summary.todayEarnings'),
        hoursValue: formatHours(dailyHours),
        earningsValue: formatTotals(dailyEarnings, locale),
      },
      {
        key: 'week',
        hoursLabel: t('summary.hoursWeek'),
        earningsLabel: t('summary.weekEarnings'),
        hoursValue: formatHours(weeklyHours),
        earningsValue: formatTotals(weeklyEarnings, locale),
      },
      {
        key: 'month',
        hoursLabel: t('summary.hoursMonth'),
        earningsLabel: t('summary.monthEarnings'),
        hoursValue: formatHours(monthlyHours),
        earningsValue: formatTotals(monthlyEarnings, locale),
      },
      {
        key: 'projection',
        hoursLabel: t('summary.monthProjectionHours', { month: projectionMonthName }),
        earningsLabel: t('summary.monthProjectionEarnings', { month: projectionMonthName }),
        hoursValue: formatHours(monthlyProjectionHours),
        earningsValue: formatTotals(monthlyProjectionEarnings, locale),
      },
    ],
    [
      dailyEarnings,
      dailyHours,
      locale,
      monthlyEarnings,
      monthlyHours,
      monthlyProjectionEarnings,
      monthlyProjectionHours,
      projectionMonthName,
      t,
      weeklyEarnings,
      weeklyHours,
    ],
  );

  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <SummaryItem
          key={item.key}
          hoursLabel={item.hoursLabel}
          earningsLabel={item.earningsLabel}
          hoursValue={item.hoursValue}
          earningsValue={item.earningsValue}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  item: {
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: '48.5%',
    gap: 6,
    padding: 16,
  },
});
