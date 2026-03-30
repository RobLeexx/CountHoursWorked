import { useAppContext } from '@/context';

export function useSettings() {
  const { language, locale, resetData, setLanguage, setThemeMode, setWeekStart, t, themeMode, weekStart } =
    useAppContext();

  return {
    language,
    setLanguage,
    themeMode,
    setThemeMode,
    weekStart,
    setWeekStart,
    locale,
    t,
    resetData,
  };
}
