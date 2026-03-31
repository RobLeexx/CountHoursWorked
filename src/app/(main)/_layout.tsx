import { useEffect, useRef, useState } from 'react';
import { router, Stack, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Animated, Easing, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROUTES } from '@/constants';
import { Header, SidebarNav } from '@/components';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';

type StackHeaderProps = {
  routeName: string;
  canGoBack: boolean;
  onOpenSidebar: () => void;
};

function StackHeader({ routeName, canGoBack, onOpenSidebar }: StackHeaderProps) {
  const { isHeaderCompact, t } = useAppContext();
  const theme = useAppTheme();
  const progress = useRef(new Animated.Value(isHeaderCompact ? 1 : 0)).current;
  const isRootRoute = routeName === 'index' || routeName === 'projects' || routeName === 'projections' || routeName === 'conversions';

  useEffect(() => {
    Animated.timing(progress, {
      toValue: isHeaderCompact ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [isHeaderCompact, progress]);

  const titleMap = {
    index: t('sidebar.home'),
    projects: t('sidebar.projects'),
    projections: t('sidebar.projections'),
    conversions: t('sidebar.conversions'),
    settings: t('header.settings'),
  } as const;

  const title = titleMap[routeName as keyof typeof titleMap] ?? t('header.home');
  const leftAction = isRootRoute ? (
    <Pressable
      accessibilityLabel={t('header.openMenu')}
      onPress={onOpenSidebar}
      style={styles.iconButton}
    >
      <Ionicons color={theme.colors.text} name="menu-outline" size={22} />
    </Pressable>
  ) : canGoBack ? (
    <Pressable
      accessibilityLabel={t('header.goBack')}
      onPress={() => router.back()}
      style={styles.iconButton}
    >
      <Ionicons color={theme.colors.text} name="chevron-back" size={22} />
    </Pressable>
  ) : undefined;

  const rightAction =
    isRootRoute ? (
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
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ({ route, back }) => (
            <StackHeader
              routeName={route.name}
              canGoBack={Boolean(back)}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          ),
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
          name="projects"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="projections"
          options={{
            title: '',
          }}
        />
        <Stack.Screen
          name="conversions"
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
      <SidebarNav currentRoute={pathname} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
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
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 52,
    paddingHorizontal: 10,
  },
});
