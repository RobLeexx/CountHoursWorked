import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppInput, type AppInputProps } from '../atoms/AppInput';
import { AppText } from '../atoms/AppText';

export type FormFieldProps = AppInputProps & {
  label: string;
  hint?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FormField({ label, hint, error, containerStyle, ...inputProps }: FormFieldProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <AppText variant="bodySmall" weight="semibold">
          {label}
        </AppText>
        {hint ? (
          <AppText variant="bodySmall" color="muted" align="right">
            {hint}
          </AppText>
        ) : null}
      </View>

      <AppInput hasError={Boolean(error)} {...inputProps} />

      {error ? (
        <AppText variant="bodySmall" color="danger">
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
