import type { Href } from 'expo-router';

export const ROUTES = {
  home: '/' as Href,
  demo: '/demo' as Href,
  settings: '/settings' as Href,
} as const;
