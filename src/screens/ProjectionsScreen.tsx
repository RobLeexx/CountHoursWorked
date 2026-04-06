import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIconButton, AppText, MainLayout } from '@/components';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';
import type { CurrencyCode } from '@/types';
import { addMonths, calculateMonthlyProjection, formatCurrency, formatMonthLabel } from '@/utils';
import type { CurrencyTotals } from '@/utils';

type ProjectionRow = {
  key: string;
  label: string;
  value: string;
};

function formatHours(value: number) {
  return Number(value.toFixed(2)).toString();
}

function formatSignedHours(value: number) {
  const normalizedValue = Number(value.toFixed(2));

  if (normalizedValue > 0) {
    return `+${normalizedValue}`;
  }

  return normalizedValue.toString();
}

function formatSignedCurrency(value: number, locale: string, currency: CurrencyCode) {
  if (value > 0) {
    return `+${formatCurrency(value, locale, currency)}`;
  }

  return formatCurrency(value, locale, currency);
}

function buildCurrencyRows(
  currencies: CurrencyCode[],
  label: string,
  suffix: string,
  totals: CurrencyTotals,
  locale: string,
  formatter: (value: number, locale: string, currency: CurrencyCode) => string,
): ProjectionRow[] {
  return currencies.map((currency) => ({
    key: `${currency}-${suffix}`,
    label: `${label} (${currency})`,
    value: formatter(totals[currency] ?? 0, locale, currency),
  }));
}

function renderProjectionRows(rows: ProjectionRow[]) {
  return rows.map((row) => (
    <View key={row.key} style={styles.row}>
      <AppText color="muted" style={styles.rowLabel}>
        {row.label}
      </AppText>
      <AppText variant="title" weight="bold" align="right" style={styles.rowValue}>
        {row.value}
      </AppText>
    </View>
  ));
}

export function ProjectionsScreen() {
  const { holidayDates, locale, projects, t, workLogs } = useAppContext();
  const theme = useAppTheme();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const projection = calculateMonthlyProjection(projects, workLogs, holidayDates, visibleMonth);
  const currencies = Array.from(
    new Set([
      ...Object.keys(projection.baseProjectedEarningsByCurrency),
      ...Object.keys(projection.holidayExtraEarningsByCurrency),
      ...Object.keys(projection.loggedDayAdjustmentEarningsByCurrency),
      ...Object.keys(projection.totalProjectedEarningsByCurrency),
    ]),
  ) as CurrencyCode[];
  const hasProjectionData = currencies.length > 0 || projection.totalProjectedHours > 0;
  const loggedAdjustmentDisplayHours = Number(
    (projection.holidayExtraHours + projection.loggedDayAdjustmentHours).toFixed(2),
  );
  const loggedAdjustmentDisplayEarnings: CurrencyTotals = currencies.reduce<CurrencyTotals>((totals, currency) => {
    totals[currency] = Number(
      (
        (projection.holidayExtraEarningsByCurrency[currency] ?? 0) +
        (projection.loggedDayAdjustmentEarningsByCurrency[currency] ?? 0)
      ).toFixed(2),
    );
    return totals;
  }, {});
  const hourRows: ProjectionRow[] = [
    {
      key: 'base-hours',
      label: t('projections.estimatedMonthHours'),
      value: formatHours(projection.baseProjectedHours),
    },
    {
      key: 'holiday-extra-hours',
      label: t('projections.holidayExtraHours'),
      value: formatSignedHours(projection.holidayExtraHours),
    },
    {
      key: 'logged-adjustment-hours',
      label: t('projections.loggedDayAdjustmentHours'),
      value: formatSignedHours(loggedAdjustmentDisplayHours),
    },
    {
      key: 'final-total-hours',
      label: t('projections.finalTotalHours'),
      value: formatHours(projection.totalProjectedHours),
    },
  ];
  const baseEarningRows = buildCurrencyRows(
    currencies,
    t('projections.estimatedMonthEarnings'),
    'base',
    projection.baseProjectedEarningsByCurrency,
    locale,
    formatCurrency,
  );
  const holidayExtraEarningRows = buildCurrencyRows(
    currencies,
    t('projections.holidayExtraEarnings'),
    'extra',
    projection.holidayExtraEarningsByCurrency,
    locale,
    formatSignedCurrency,
  );
  const loggedAdjustmentEarningRows = buildCurrencyRows(
    currencies,
    t('projections.loggedDayAdjustmentEarnings'),
    'adjustment',
    loggedAdjustmentDisplayEarnings,
    locale,
    formatSignedCurrency,
  );
  const totalEarningRows = buildCurrencyRows(
    currencies,
    t('projections.finalTotalEarnings'),
    'total',
    projection.totalProjectedEarningsByCurrency,
    locale,
    formatCurrency,
  );

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
        <View style={styles.monthRow}>
          <AppIconButton
            accessibilityLabel={t('calendar.previousMonth')}
            icon="chevron-back"
            onPress={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, -1))}
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
            onPress={() => setVisibleMonth((currentMonth) => addMonths(currentMonth, 1))}
            style={styles.monthButton}
          />
        </View>
        <AppText variant="title" weight="bold">
          {t('projections.estimatedMonthHours')}
        </AppText>
        {renderProjectionRows(hourRows)}
        <AppText variant="title" weight="bold">
          {t('projections.estimatedMonthEarnings')}
        </AppText>
        {!hasProjectionData ? (
          <AppText color="muted">{t('projections.noEstimation')}</AppText>
        ) : (
          renderProjectionRows(baseEarningRows)
        )}
        {renderProjectionRows(holidayExtraEarningRows)}
        {renderProjectionRows(loggedAdjustmentEarningRows)}
        {renderProjectionRows(totalEarningRows)}
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
  row: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  rowLabel: {
    flex: 1,
  },
  rowValue: {
    flexShrink: 0,
    minWidth: 84,
  },
});
