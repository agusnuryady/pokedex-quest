import { createContext, useContext, type ReactNode } from 'react';
import { pokemonRepository, type PokemonRepository } from '@/data';

/**
 * Dependency injection for the data layer. The app uses the default repository;
 * tests and previews pass an in-memory one.
 */
const RepositoryContext = createContext<PokemonRepository>(pokemonRepository);

export function RepositoryProvider({ repository, children }: { repository: PokemonRepository; children: ReactNode }) {
  return <RepositoryContext.Provider value={repository}>{children}</RepositoryContext.Provider>;
}

export const useRepository = (): PokemonRepository => useContext(RepositoryContext);
