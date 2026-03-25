import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components';
import { ROUTES } from '@/constants';
import { useAppTheme } from '@/theme';

export default function NotFoundScreen() {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText variant="title">Page not found</AppText>
        <AppText color="muted">
          The route exists in the project foundation, but this specific path does not.
        </AppText>
        <Link href={ROUTES.home} asChild>
          <AppButton title="Back to home" />
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 24,
  },
});

