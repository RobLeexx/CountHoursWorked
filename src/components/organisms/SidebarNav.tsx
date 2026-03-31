import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ROUTES } from '@/constants';
import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';

import { AppText } from '../atoms/AppText';

type SidebarItem = {
  label: string;
  route: (typeof ROUTES)[keyof typeof ROUTES];
  icon: keyof typeof Ionicons.glyphMap;
};

type SidebarNavProps = {
  isOpen: boolean;
  currentRoute: string;
  onClose: () => void;
};

export function SidebarNav({ isOpen, currentRoute, onClose }: SidebarNavProps) {
  const { t } = useAppContext();
  const theme = useAppTheme();
  const [isVisible, setIsVisible] = useState(isOpen);
  const progress = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  const items: SidebarItem[] = [
    { label: t('sidebar.home'), route: ROUTES.home, icon: 'home-outline' },
    { label: t('sidebar.projects'), route: ROUTES.projects, icon: 'briefcase-outline' },
    { label: t('sidebar.projections'), route: ROUTES.projections, icon: 'stats-chart-outline' },
    { label: t('sidebar.conversions'), route: ROUTES.conversions, icon: 'swap-horizontal-outline' },
  ];

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }

    Animated.timing(progress, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isOpen) {
        setIsVisible(false);
      }
    });
  }, [isOpen, progress]);

  const panelAnimatedStyle = {
    transform: [
      {
        translateX: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [-280, 0],
        }),
      },
    ],
  };

  const backdropAnimatedStyle = {
    opacity: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Modal animationType="none" transparent visible={isVisible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.panel,
            panelAnimatedStyle,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <SafeAreaView edges={['top', 'bottom']} style={styles.panelSafeArea}>
            <View style={styles.panelHeader}>
              <AppText variant="title" weight="bold">
                {t('header.home')}
              </AppText>
              <Pressable accessibilityLabel={t('common.close')} onPress={onClose} style={styles.closeButton}>
                <Ionicons color={theme.colors.text} name="close-outline" size={26} />
              </Pressable>
            </View>

            <View style={styles.itemList}>
              {items.map((item) => {
                const isActive = currentRoute === item.route;

                return (
                  <Pressable
                    key={item.label}
                    onPress={() => {
                      onClose();
                      router.replace(item.route);
                    }}
                    style={[
                      styles.item,
                      {
                        backgroundColor: isActive ? theme.colors.primarySoft : theme.colors.surfaceMuted,
                        borderColor: isActive ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  >
                    <Ionicons color={isActive ? theme.colors.primary : theme.colors.text} name={item.icon} size={22} />
                    <AppText color={isActive ? 'primary' : 'text'} weight="semibold">
                      {item.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </SafeAreaView>
        </Animated.View>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  backdropPressable: {
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    flex: 1,
  },
  panel: {
    borderRightWidth: 1,
    width: 280,
  },
  panelSafeArea: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  panelHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    minHeight: 56,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 52,
  },
  itemList: {
    gap: 10,
  },
  item: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 18,
  },
});
