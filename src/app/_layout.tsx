import {
  BricolageGrotesque_500Medium,
  BricolageGrotesque_700Bold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MessageState } from '@/presentation/components';
import { AppProviders } from '@/presentation/providers/AppProviders';
import { useStoreHydrated } from '@/state/gameStore';
import { fonts, palette } from '@/shared/theme';

// Keep the splash screen up until fonts and saved progress are ready, instead of flashing a blank screen.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_500Medium,
    BricolageGrotesque_700Bold,
    ...Ionicons.font, // tab icons, loaded up front so they don't pop in
  });
  const saveLoaded = useStoreHydrated();
  // Wait for saved progress before showing anything. If fonts fail, carry on with system fonts.
  const ready = saveLoaded && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

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
        <Stack.Screen name="battle" options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }} />
      </Stack>
    </AppProviders>
  );
}

/** Shown instead of a blank screen if anything below crashes while rendering. Progress is kept. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View style={{ flex: 1, backgroundColor: palette.paper }}>
      <MessageState
        title="Something went wrong"
        message="The app hit an unexpected error. Your progress is saved."
        actionLabel="Reload"
        onAction={() => void retry()}
      />
    </View>
  );
}
