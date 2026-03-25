import type { PropsWithChildren } from 'react';
import { StyleSheet, Text as NativeText, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/theme';

const VARIANTS = {
  body: { fontSize: 16, lineHeight: 24 },
  bodySmall: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 13, lineHeight: 18, letterSpacing: 0.4, textTransform: 'uppercase' as const },
  title: { fontSize: 24, lineHeight: 32 },
  heading: { fontSize: 32, lineHeight: 40 },
} as const;

type TextVariant = keyof typeof VARIANTS;
type TextColor = 'text' | 'muted' | 'primary' | 'danger' | 'success' | 'inverse';
type TextWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type AppTextProps = PropsWithChildren<
  TextProps & {
    variant?: TextVariant;
    color?: TextColor;
    weight?: TextWeight;
    align?: TextStyle['textAlign'];
    style?: StyleProp<TextStyle>;
  }
>;

export function AppText({
  children,
  variant = 'body',
  color = 'text',
  weight = 'regular',
  align = 'left',
  style,
  ...props
}: AppTextProps) {
  const theme = useAppTheme();

  return (
    <NativeText
      style={[
        styles.base,
        VARIANTS[variant],
        {
          color: theme.colors[color],
          fontWeight: theme.typography.fontWeights[weight],
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </NativeText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'System',
  },
});

