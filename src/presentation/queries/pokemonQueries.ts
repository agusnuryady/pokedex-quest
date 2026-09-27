import { queryOptions } from '@tanstack/react-query';
import type { PokemonRepository } from '@/data';
import type { PokemonType } from '@/domain/models';

/** One place for query keys and fetchers, so screens never build keys by hand. */
export const pokemonKeys = {
  all: ['pokemon'] as const,
  index: () => [...pokemonKeys.all, 'index'] as const,
  detail: (id: number) => [...pokemonKeys.all, 'detail', id] as const,
  species: (id: number) => [...pokemonKeys.all, 'species', id] as const,
  byType: (type: PokemonType) => [...pokemonKeys.all, 'type', type] as const,
};

export const pokemonQueries = {
  index: (repo: PokemonRepository) =>
    queryOptions({ queryKey: pokemonKeys.index(), queryFn: () => repo.listIndex() }),
  detail: (repo: PokemonRepository, id: number) =>
    queryOptions({ queryKey: pokemonKeys.detail(id), queryFn: () => repo.getPokemon(id) }),
  species: (repo: PokemonRepository, id: number) =>
    queryOptions({ queryKey: pokemonKeys.species(id), queryFn: () => repo.getSpecies(id) }),
  idsByType: (repo: PokemonRepository, type: PokemonType) =>
    queryOptions({ queryKey: pokemonKeys.byType(type), queryFn: () => repo.listIdsByType(type) }),
};
