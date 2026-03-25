import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

import { Header } from '../organisms/Header';

export type MainLayoutProps = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function MainLayout({
  title,
  subtitle,
  rightAction,
  children,
  contentContainerStyle,
}: MainLayoutProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            padding: theme.spacing.lg,
          },
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { maxWidth: theme.sizes.maxContentWidth }]}>
          <Header title={title} subtitle={subtitle} rightAction={rightAction} />
          <View style={styles.body}>{children}</View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    gap: 24,
    paddingBottom: 40,
  },
  inner: {
    alignSelf: 'center',
    gap: 24,
    width: '100%',
  },
  body: {
    gap: 16,
  },
});
