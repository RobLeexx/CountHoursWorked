import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/theme';

import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type AppButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
}: AppButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled || loading;

  const variantStyles: Record<ButtonVariant, { container: ViewStyle; textColor: 'inverse' | 'primary' | 'text' }> = {
    primary: {
      container: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
      },
      textColor: 'inverse',
    },
    secondary: {
      container: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderStrong,
      },
      textColor: 'text',
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      textColor: 'primary',
    },
  };

  const indicatorColor = variantStyles[variant].textColor === 'inverse' ? theme.colors.inverse : theme.colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          opacity: isDisabled ? 0.6 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        variantStyles[variant].container,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={indicatorColor} />
          <AppText color={variantStyles[variant].textColor} weight="semibold" style={textStyle}>
            {title}
          </AppText>
        </View>
      ) : (
        <AppText color={variantStyles[variant].textColor} weight="semibold" style={textStyle}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

