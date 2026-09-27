import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/presentation/providers/AppProviders';
import { palette } from '@/shared/theme';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: palette.ink,
          headerStyle: { backgroundColor: palette.paper },
          contentStyle: { backgroundColor: palette.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
