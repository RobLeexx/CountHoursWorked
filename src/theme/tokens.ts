import type { ThemeMode } from '@/types';

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
} as const;

const borderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
} as const;

const sizes = {
  buttonHeight: 48,
  inputHeight: 48,
  maxContentWidth: 720,
} as const;

const sharedTokens = {
  spacing,
  borderRadius,
  typography,
  sizes,
} as const;

const lightTheme = {
  ...sharedTokens,
  colors: {
    primary: '#0F766E',
    primarySoft: '#CCFBF1',
    background: '#F7F9FC',
    surface: '#FFFFFF',
    surfaceMuted: '#F2F5F8',
    text: '#102A43',
    muted: '#627D98',
    inverse: '#FFFFFF',
    border: '#D9E2EC',
    borderStrong: '#9FB3C8',
    danger: '#D64545',
    success: '#2F855A',
    warning: '#D97706',
    warningSoft: '#FFEDD5',
  },
  statusBarStyle: 'dark' as const,
};

const darkTheme = {
  ...sharedTokens,
  colors: {
    primary: '#5EEAD4',
    primarySoft: '#123B3A',
    background: '#0F172A',
    surface: '#162033',
    surfaceMuted: '#1E293B',
    text: '#E2E8F0',
    muted: '#94A3B8',
    inverse: '#020617',
    border: '#334155',
    borderStrong: '#475569',
    danger: '#F87171',
    success: '#4ADE80',
    warning: '#F59E0B',
    warningSoft: '#3B2A10',
  },
  statusBarStyle: 'light' as const,
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type AppTheme = (typeof themes)[ThemeMode];

export const getTheme = (mode: ThemeMode): AppTheme => themes[mode];
