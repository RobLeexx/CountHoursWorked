import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText, MainLayout } from '@/components';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';
import { calculateMonthlyProjectionTotals, formatCurrency } from '@/utils';

export function ProjectionsScreen() {
  const { holidayDates, locale, projects, t, workLogs } = useAppContext();
  const theme = useAppTheme();
  const projectionTotals = useMemo(
    () => calculateMonthlyProjectionTotals(projects, workLogs, holidayDates),
    [holidayDates, projects, workLogs],
  );
  const projectionEntries = Object.entries(projectionTotals).filter(([, value]) => typeof value === 'number' && value > 0);

  return (
    <MainLayout showHeader={false} title={t('sidebar.projections')}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText variant="title" weight="bold">
          {t('projections.estimatedMonthEarnings')}
        </AppText>
        {projectionEntries.length === 0 ? (
          <AppText color="muted">{t('projections.noEstimation')}</AppText>
        ) : (
          projectionEntries.map(([currency, value]) => (
            <View key={currency} style={styles.row}>
              <AppText color="muted">{currency}</AppText>
              <AppText variant="title" weight="bold">
                {formatCurrency(value ?? 0, locale, currency as 'EUR' | 'USD')}
              </AppText>
            </View>
          ))
        )}
      </View>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
