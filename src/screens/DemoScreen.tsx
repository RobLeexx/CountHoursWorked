import { Redirect } from 'expo-router';

import { ROUTES } from '@/constants';

export function DemoScreen() {
  return <Redirect href={ROUTES.home} />;
}
