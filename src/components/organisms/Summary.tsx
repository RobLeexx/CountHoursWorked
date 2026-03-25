import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { formatCurrency } from '@/utils';

import { AppText } from '../atoms/AppText';

type SummaryItemProps = {
  label: string;
  value: string;
};

export type SummaryProps = {
  dailyHours: number;
  dailyEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
};

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
  return (
    <View style={styles.grid}>
      <SummaryItem label="Hours today" value={dailyHours.toFixed(2)} />
      <SummaryItem label="Today earnings" value={formatCurrency(dailyEarnings)} />
      <SummaryItem label="Week earnings" value={formatCurrency(weeklyEarnings)} />
      <SummaryItem label="Month earnings" value={formatCurrency(monthlyEarnings)} />
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

