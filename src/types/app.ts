export type ThemeMode = 'light' | 'dark';
export type AppLanguage = 'en' | 'es';
export type CurrencyCode = 'EUR' | 'USD';
export type WeekStart = 'monday' | 'sunday';
export type SummaryMetricKey = 'today' | 'week' | 'month' | 'projection';
export type SummaryDisplayMode = 'hours' | 'earnings';
export type SummaryDisplayPreferences = Record<SummaryMetricKey, SummaryDisplayMode>;
export type SummaryDisplayPreset = 'hours' | 'earnings' | 'custom';
