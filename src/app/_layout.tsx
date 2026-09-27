import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProviders } from '@/presentation/providers/AppProviders';
import { fonts, palette } from '@/shared/theme';

export default function RootLayout() {
  const [loaded, error] = useFonts({ BricolageGrotesque_500Medium, BricolageGrotesque_700Bold });
  // If fonts fail, carry on with system fonts rather than blocking the app.
  if (!loaded && !error) return null;

  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: palette.ink,
          headerStyle: { backgroundColor: palette.paper },
          headerTitleStyle: { fontFamily: fonts.display },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: palette.paper },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pokemon/[id]" options={{ title: '' }} />
      </Stack>
    </AppProviders>
  );
}
