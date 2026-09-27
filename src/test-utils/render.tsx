import { QueryClient } from '@tanstack/react-query';
import { render, renderHook } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import type { PokemonRepository } from '@/data';
import { InMemoryPokemonRepository } from '@/data/repositories/InMemoryPokemonRepository';
import { AppProviders } from '@/presentation/providers/AppProviders';

/** Fresh cache per test, no retries, so failures surface immediately. */
export const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });

function wrapperFor(repository: PokemonRepository) {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <AppProviders repository={repository} queryClient={queryClient}>{children}</AppProviders>;
  };
}

export function renderWithProviders(ui: ReactElement, repository: PokemonRepository = new InMemoryPokemonRepository()) {
  return render(ui, { wrapper: wrapperFor(repository) });
}

export function renderHookWithProviders<T>(hook: () => T, repository: PokemonRepository = new InMemoryPokemonRepository()) {
  return renderHook(hook, { wrapper: wrapperFor(repository) });
}
