import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppButton, AppText } from '@/components';
import { useAppTheme } from '@/theme';

import { useExamplePost } from '../hooks/useExamplePost';

export function ExamplePostCard() {
  const theme = useAppTheme();
  const { post, loading, error, reload, details } = useExamplePost();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <AppText variant="title">Feature + service example</AppText>
      <AppText color="muted">
        This card lives inside a feature folder and consumes a reusable service through a custom
        hook.
      </AppText>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={theme.colors.primary} />
          <AppText color="muted">Loading example content from the API layer...</AppText>
        </View>
      ) : null}

      {error ? (
        <View style={styles.state}>
          <AppText color="danger">{error}</AppText>
          <AppButton title="Try again" onPress={reload} variant="secondary" />
        </View>
      ) : null}

      {post && !loading ? (
        <View style={styles.state}>
          <AppText weight="semibold">{post.title}</AppText>
          {details.value ? <AppText color="muted">{post.body}</AppText> : null}
          <AppButton
            title={details.value ? 'Hide details' : 'Show details'}
            onPress={details.toggle}
            variant="ghost"
            fullWidth={false}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  loadingState: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  state: {
    gap: 12,
  },
});

