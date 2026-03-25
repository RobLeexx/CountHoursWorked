import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, FormField, MainLayout } from '@/components';
import { ROUTES } from '@/constants';
import { useAppContext } from '@/context';
import { useToggle } from '@/hooks';
import { useAppTheme } from '@/theme';
import { formatDate } from '@/utils';

export function HomeScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const { userName, setUserName, themeMode, toggleThemeMode } = useAppContext();
  const foundationNotes = useToggle(false);

  return (
    <MainLayout
      title="Home"
      subtitle="A clean Expo Router foundation with Atomic Design, theme tokens, context, hooks, and API-ready layers."
      rightAction={
        <AppButton
          fullWidth={false}
          onPress={toggleThemeMode}
          title={themeMode === 'light' ? 'Dark preview' : 'Light preview'}
          variant="ghost"
        />
      }
    >
      <View
        style={[
          styles.panel,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText variant="label" color="primary">
          Welcome
        </AppText>
        <AppText variant="title" weight="bold">
          Hello, {userName || 'there'}.
        </AppText>
        <AppText color="muted">Today is {formatDate(new Date())}.</AppText>
        <AppText color="muted">
          Theme mode is currently <AppText weight="semibold">{themeMode}</AppText>.
        </AppText>
      </View>

      <FormField
        hint="Global context example"
        label="Display name"
        onChangeText={setUserName}
        placeholder="Add a friendly name"
        value={userName}
      />

      <AppButton title="Open demo screen" onPress={() => router.push(ROUTES.demo)} />

      <AppButton
        fullWidth={false}
        onPress={foundationNotes.toggle}
        title={foundationNotes.value ? 'Hide notes' : 'Show foundation notes'}
        variant="secondary"
      />

      {foundationNotes.value ? (
        <View
          style={[
            styles.panel,
            {
              backgroundColor: theme.colors.surfaceMuted,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <AppText weight="semibold">What is already wired in:</AppText>
          <AppText color="muted">
            Typed routing, context, theme tokens, hooks, API client, services, and reusable
            components.
          </AppText>
        </View>
      ) : null}
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
});

