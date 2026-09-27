import { Stack, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { renderRouter } from 'expo-router/testing-library';
import type { PokemonRepository } from '@/data';
import { InMemoryPokemonRepository } from '@/data/repositories/InMemoryPokemonRepository';
import { AppProviders } from '@/presentation/providers/AppProviders';
import CollectionScreen from '@/app/(tabs)/collection';
import GlossaryScreen from '@/app/(tabs)/glossary';
import PlayScreen from '@/app/(tabs)/index';
import TabsLayout from '@/app/(tabs)/_layout';
import BattleScreen from '@/app/battle';
import PokemonDetailScreen from '@/app/pokemon/[id]';
import { createTestQueryClient } from './render';

let currentPathname = '';

/** The router's current path. Replaces expo-router's toHavePathname, which RNTL v14's async render breaks. */
export const getPathname = () => currentPathname;

function PathnameProbe() {
  const pathname = usePathname();
  useEffect(() => {
    currentPathname = pathname;
  }, [pathname]);
  return null;
}

/**
 * Mounts the real app: every real route and the real tab bar, inside a real router.
 * Only the root layout is swapped, to inject the offline repository and skip
 * font loading and the splash screen.
 */
export async function renderApp(initialUrl = '/', repository: PokemonRepository = new InMemoryPokemonRepository()) {
  const queryClient = createTestQueryClient();
  function TestRootLayout() {
    return (
      <AppProviders repository={repository} queryClient={queryClient}>
        <PathnameProbe />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="battle" options={{ headerShown: false }} />
        </Stack>
      </AppProviders>
    );
  }
  return renderRouter(
    {
      _layout: TestRootLayout,
      '(tabs)/_layout': TabsLayout,
      '(tabs)/index': PlayScreen,
      '(tabs)/collection': CollectionScreen,
      '(tabs)/glossary': GlossaryScreen,
      'pokemon/[id]': PokemonDetailScreen,
      battle: BattleScreen,
    },
    { initialUrl },
  );
}
