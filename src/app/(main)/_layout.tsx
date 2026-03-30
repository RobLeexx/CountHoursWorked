import { useEffect, useRef } from 'react';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROUTES } from '@/constants';
import { Header } from '@/components';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';

function StackHeader({ routeName, canGoBack }: { routeName: string; canGoBack: boolean }) {
  const { isHeaderCompact, t } = useAppContext();
  const theme = useAppTheme();
  const progress = useRef(new Animated.Value(isHeaderCompact ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isHeaderCompact ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isHeaderCompact, progress]);

  const title = routeName === 'settings' ? t('header.settings') : t('header.home');
  const leftAction = canGoBack ? (
    <Pressable
      accessibilityLabel={t('header.goBack')}
      onPress={() => router.back()}
      style={styles.iconButton}
    >
      <Ionicons color={theme.colors.text} name="chevron-back" size={22} />
    </Pressable>
  ) : undefined;

  const rightAction =
    routeName === 'index' ? (
      <Pressable
        accessibilityLabel={t('header.openSettings')}
        onPress={() => router.push(ROUTES.settings)}
        style={styles.iconButton}
      >
        <Ionicons color={theme.colors.text} name="settings-outline" size={20} />
      </Pressable>
    ) : undefined;

  const headerShellStyle = {
    paddingBottom: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [4, 1],
    }),
    paddingHorizontal: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [24, 18],
    }),
    paddingTop: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0],
    }),
  };

  const headerContentStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0.96],
    }),
    transform: [
      {
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 0.88],
        }),
      },
      {
        translateY: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -1],
        }),
      },
    ],
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <Animated.View style={[styles.headerShell, headerShellStyle]}>
        <Animated.View style={headerContentStyle}>
          <Header compact={isHeaderCompact} title={title} leftAction={leftAction} rightAction={rightAction} />
        </Animated.View>
      </Animated.View>
    </SafeAreaView>
  );
}

export default function MainLayoutGroup() {
  const theme = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ route, back }) => <StackHeader routeName={route.name} canGoBack={Boolean(back)} />,
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: '',
        }}
      />
      <Stack.Screen
        name="demo"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    borderBottomWidth: 0,
  },
  headerShell: {
    paddingBottom: 4,
    paddingHorizontal: 24,
    paddingTop: 1,
  },
  iconButton: {
    padding: 6,
  },
});
