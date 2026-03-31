import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../atoms/AppText';

export type HeaderProps = {
  title: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
  compact?: boolean;
};

export function Header({ title, leftAction, rightAction, compact = false }: HeaderProps) {
  return (
    <View style={[styles.container, compact ? styles.containerCompact : null]}>
      {leftAction ? <View style={[styles.side, compact ? styles.sideCompact : null]}>{leftAction}</View> : null}

      <View style={styles.content}>
        <AppText variant="heading" weight="bold">
          {title}
        </AppText>
      </View>

      {rightAction ? <View style={[styles.side, compact ? styles.sideCompact : null]}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: -30,
  },
  containerCompact: {
    minHeight: 34,
  },
  content: {
    justifyContent: 'center',
  },
  side: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'center',
    minWidth: 56,
  },
  sideCompact: {
    minWidth: 44,
  },
});
