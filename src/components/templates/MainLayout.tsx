import { useEffect, useRef, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type NativeSyntheticEvent, type NativeScrollEvent, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';

import { Header } from '../organisms/Header';

export type MainLayoutProps = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
  showHeader?: boolean;
  children: ReactNode;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function MainLayout({
  title,
  subtitle,
  rightAction,
  showHeader = true,
  children,
  contentContainerStyle,
}: MainLayoutProps) {
  const theme = useAppTheme();
  const { setHeaderCompact } = useAppContext();
  const isCompactRef = useRef(false);

  useEffect(() => {
    return () => {
      isCompactRef.current = false;
      setHeaderCompact(false);
    };
  }, [setHeaderCompact]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (showHeader) {
      return;
    }

    const nextCompact = event.nativeEvent.contentOffset.y > 24;

    if (nextCompact !== isCompactRef.current) {
      isCompactRef.current = nextCompact;
      setHeaderCompact(nextCompact);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
      edges={showHeader ? [] : ['top']}
    >
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          {
            padding: theme.spacing.lg,
          },
          contentContainerStyle,
        ]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { maxWidth: theme.sizes.maxContentWidth }]}>
          {showHeader ? <Header title={title} subtitle={subtitle} rightAction={rightAction} /> : null}
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
