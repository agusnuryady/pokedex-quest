import type { Pokemon, PokemonSpecies, PokemonSummary, PokemonType } from '@/domain/models';

/**
 * The only data contract the presentation layer knows about.
 * Swapping PokéAPI for fixtures, GraphQL, or a cache is a one-line change in `index.ts`.
 */
export interface PokemonRepository {
  /** Every species (name + id), fetched once and filtered client-side for instant search. */
  listIndex(): Promise<PokemonSummary[]>;
  getPokemon(idOrName: number | string): Promise<Pokemon>;
  getSpecies(id: number): Promise<PokemonSpecies>;
  listIdsByType(type: PokemonType): Promise<number[]>;
}
