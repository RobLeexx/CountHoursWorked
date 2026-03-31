import type { Href } from 'expo-router';

export const ROUTES = {
  home: '/' as Href,
  projects: '/projects' as Href,
  projections: '/projections' as Href,
  conversions: '/conversions' as Href,
  demo: '/demo' as Href,
  settings: '/settings' as Href,
} as const;
