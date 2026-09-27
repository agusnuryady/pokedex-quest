import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { ApiError, pokemonRepository, type PokemonRepository } from '@/data';
import { RepositoryProvider } from './RepositoryProvider';

/** Pokémon data never changes, so cache it for the whole session and only retry transient errors. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: 1000 * 60 * 60,
        retry: (failureCount, error) =>
          failureCount < 2 && (!(error instanceof ApiError) || error.isRetryable),
      },
    },
  });
}

interface Props {
  children: ReactNode;
  repository?: PokemonRepository;
  queryClient?: QueryClient;
}

export function AppProviders({ children, repository = pokemonRepository, queryClient }: Props) {
  const [client] = useState(() => queryClient ?? createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <RepositoryProvider repository={repository}>{children}</RepositoryProvider>
    </QueryClientProvider>
  );
}
