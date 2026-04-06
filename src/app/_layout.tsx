import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ToastHost } from '@/components';
import { AppProvider } from '@/context';
import { useAppTheme } from '@/theme';

function RootNavigator() {
  const theme = useAppTheme();

  return (
    <>
      <StatusBar style={theme.statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        <Stack.Screen name="(main)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <ToastHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
