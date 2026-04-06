import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useAppContext } from '@/context';
import { useAppTheme } from '@/theme';

import { AppText } from '../atoms/AppText';

const TOAST_DURATION_MS = 2600;

export function ToastHost() {
  const { activeToast, dismissToast } = useAppContext();
  const theme = useAppTheme();
  const translateX = useRef(new Animated.Value(72)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [visibleToast, setVisibleToast] = useState(activeToast);

  useEffect(() => {
    if (!activeToast) {
      return;
    }

    setVisibleToast(activeToast);
    translateX.setValue(72);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        damping: 18,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 72,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisibleToast(null);
        dismissToast();
      });
    }, TOAST_DURATION_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [activeToast, dismissToast, opacity, translateX]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 72,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisibleToast(null);
      dismissToast();
    });
  };

  const tone = useMemo(() => {
    switch (visibleToast?.type) {
      case 'danger':
        return {
          accent: theme.colors.danger,
          background: theme.colors.surface,
          text: theme.colors.text,
        };
      case 'warning':
        return {
          accent: theme.colors.warning,
          background: theme.colors.surface,
          text: theme.colors.text,
        };
      case 'info':
        return {
          accent: theme.colors.primary,
          background: theme.colors.surface,
          text: theme.colors.text,
        };
      case 'success':
      default:
        return {
          accent: theme.colors.success,
          background: theme.colors.surface,
          text: theme.colors.text,
        };
    }
  }, [theme.colors.danger, theme.colors.primary, theme.colors.success, theme.colors.surface, theme.colors.text, theme.colors.warning, visibleToast?.type]);

  if (!visibleToast) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.host}>
      <Animated.View
        style={[
          styles.toastWrapper,
          {
            opacity,
            transform: [{ translateX }],
          },
        ]}
      >
        <Pressable
          onPress={handleDismiss}
          style={[
            styles.toastCard,
            {
              backgroundColor: tone.background,
              borderColor: theme.colors.border,
              shadowColor: tone.accent,
            },
          ]}
        >
          <View
            style={[
              styles.toastAccent,
              {
                backgroundColor: tone.accent,
              },
            ]}
          />
          <View style={styles.toastContent}>
            {visibleToast.title ? (
              <AppText weight="bold" style={{ color: tone.text }}>
                {visibleToast.title}
              </AppText>
            ) : null}
            <AppText style={{ color: tone.text }}>{visibleToast.message}</AppText>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  toastWrapper: {
    alignItems: 'flex-end',
  },
  toastCard: {
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    maxWidth: 320,
    minWidth: 220,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  toastAccent: {
    width: 6,
  },
  toastContent: {
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
