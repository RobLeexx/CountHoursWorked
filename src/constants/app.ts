export const APP_CONFIG = {
  appName: 'Count Hours Worked',
  apiBaseUrl: 'https://jsonplaceholder.typicode.com',
  defaultUserName: 'Teammate',
} as const;

export const STORAGE_KEYS = {
  themeMode: 'theme-mode',
  language: 'language',
  weekStart: 'week-start',
  summaryDisplayPreset: 'summary-display-preset',
  summaryDisplayPreferences: 'summary-display-preferences',
  projects: 'projects',
  workLogs: 'work-logs',
  holidayDates: 'holiday-dates',
} as const;
