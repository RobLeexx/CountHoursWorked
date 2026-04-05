import { useAppContext } from '@/context';

export function useSettings() {
  const {
    language,
    locale,
    resetData,
    setLanguage,
    setSummaryDisplayPreference,
    setSummaryDisplayPreset,
    setThemeMode,
    setWeekStart,
    summaryDisplayPreferences,
    summaryDisplayPreset,
    t,
    themeMode,
    weekStart,
  } = useAppContext();

  return {
    language,
    setLanguage,
    summaryDisplayPreferences,
    setSummaryDisplayPreference,
    summaryDisplayPreset,
    setSummaryDisplayPreset,
    themeMode,
    setThemeMode,
    weekStart,
    setWeekStart,
    locale,
    t,
    resetData,
  };
}
