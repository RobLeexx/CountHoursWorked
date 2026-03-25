import { Stack } from 'expo-router';

export default function MainLayoutGroup() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

