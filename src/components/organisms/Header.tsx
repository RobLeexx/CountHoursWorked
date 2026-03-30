import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../atoms/AppText';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  compact?: boolean;
};

export function Header({ title, subtitle, leftAction, rightAction, compact = false }: HeaderProps) {
  return (
    <View style={[styles.container, compact ? styles.containerCompact : null]}>
      {leftAction ? <View style={[styles.side, compact ? styles.sideCompact : null]}>{leftAction}</View> : null}

      <View style={styles.content}>
        <AppText variant="heading" weight="bold">
          {title}
        </AppText>
        {subtitle ? (
          <AppText color="muted" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>

      {rightAction ? <View style={[styles.side, compact ? styles.sideCompact : null]}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
    minHeight: 46,
  },
  containerCompact: {
    gap: 10,
    minHeight: 34,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  subtitle: {
    maxWidth: 560,
  },
  side: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 42,
  },
  sideCompact: {
    minWidth: 34,
  },
});
