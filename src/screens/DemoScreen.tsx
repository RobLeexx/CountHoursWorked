import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton, AppText, FormField, MainLayout } from '@/components';
import { ROUTES } from '@/constants';
import { ExamplePostCard } from '@/features/demo';
import { useDebounce } from '@/hooks';
import { useAppTheme } from '@/theme';
import { isEmailValid } from '@/utils';

export function DemoScreen() {
  const router = useRouter();
  const theme = useAppTheme();
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const emailError = email.length > 0 && !isEmailValid(email) ? 'Enter a valid email address.' : undefined;

  return (
    <MainLayout
      title="Demo"
      subtitle="Examples of form composition, reusable hooks, feature modules, and a typed API layer."
    >
      <View
        style={[
          styles.section,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <FormField
          autoCapitalize="none"
          autoCorrect={false}
          error={emailError}
          hint="Validation example"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="hello@company.com"
          value={email}
        />

        <FormField
          hint="Debounced hook example"
          label="Search term"
          onChangeText={setSearch}
          placeholder="Type to update after 400ms"
          value={search}
        />

        <AppText color="muted">Debounced value: {debouncedSearch || 'Start typing to test it.'}</AppText>
      </View>

      <ExamplePostCard />

      <AppButton title="Back to home" onPress={() => router.replace(ROUTES.home)} variant="secondary" />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 20,
  },
});

