import { useAppContext } from '@/context';

import { getTheme } from './tokens';

export function useAppTheme() {
  const { themeMode } = useAppContext();

  return getTheme(themeMode);
}

