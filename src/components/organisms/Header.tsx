import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../atoms/AppText';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  rightAction?: ReactNode;
};

export function Header({ title, subtitle, rightAction }: HeaderProps) {
  return (
    <View style={styles.container}>
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

      {rightAction ? <View style={styles.action}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    gap: 16,
  },
  content: {
    gap: 8,
  },
  subtitle: {
    maxWidth: 560,
  },
  action: {
    alignSelf: 'flex-start',
  },
});
