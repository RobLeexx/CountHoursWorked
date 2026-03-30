import { StyleSheet, View } from 'react-native';

import { useAppContext } from '@/context';
import type { CurrencyTotals } from '@/utils';
import { useAppTheme } from '@/theme';
import { formatCurrency } from '@/utils';

import { AppText } from '../atoms/AppText';

type SummaryItemProps = {
  label: string;
  value: string;
};

export type SummaryProps = {
  dailyHours: number;
  dailyEarnings: CurrencyTotals;
  weeklyEarnings: CurrencyTotals;
  monthlyEarnings: CurrencyTotals;
};

function formatTotals(value: CurrencyTotals, locale: string) {
  const entries = Object.entries(value).filter(([, total]) => typeof total === 'number' && total > 0);

  if (entries.length === 0) {
    return '0.00';
  }

  return entries.map(([currency, total]) => formatCurrency(total ?? 0, locale, currency as 'EUR' | 'USD')).join('\n');
}

function SummaryItem({ label, value }: SummaryItemProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.item,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText variant="bodySmall" color="muted">
        {label}
      </AppText>
      <AppText variant="title" weight="bold">
        {value}
      </AppText>
    </View>
  );
}

export function Summary({
  dailyHours,
  dailyEarnings,
  weeklyEarnings,
  monthlyEarnings,
}: SummaryProps) {
  const { locale, t } = useAppContext();

  return (
    <View style={styles.grid}>
      <SummaryItem label={t('summary.hoursToday')} value={dailyHours.toFixed(2)} />
      <SummaryItem label={t('summary.todayEarnings')} value={formatTotals(dailyEarnings, locale)} />
      <SummaryItem label={t('summary.weekEarnings')} value={formatTotals(weeklyEarnings, locale)} />
      <SummaryItem label={t('summary.monthEarnings')} value={formatTotals(monthlyEarnings, locale)} />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    minWidth: '47%',
    padding: 16,
  },
});
