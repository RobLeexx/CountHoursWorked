import { useState } from 'react';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Pressable, StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/theme';
import { formatDate, fromDateKey, toDateKey } from '@/utils';

import { AppText } from '../atoms/AppText';

export type DateFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useAppTheme();
  const [showPicker, setShowPicker] = useState(false);
  const selectedDate = value ? fromDateKey(value) : new Date();

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowPicker(false);

    if (event.type === 'dismissed' || !date) {
      return;
    }

    onChange(toDateKey(date));
  };

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" color="muted">
        {label}
      </AppText>
      <Pressable
        onPress={() => setShowPicker(true)}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.surfaceMuted,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <AppText>{formatDate(selectedDate)}</AppText>
      </Pressable>

      {showPicker ? <DateTimePicker mode="date" value={selectedDate} onChange={handleChange} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  field: {
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
});
