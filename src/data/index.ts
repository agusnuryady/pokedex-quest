import { config } from '@/shared/config';
import { createHttpClient } from './api/httpClient';
import { InMemoryPokemonRepository } from './repositories/InMemoryPokemonRepository';
import { PokeApiPokemonRepository } from './repositories/PokeApiPokemonRepository';
import type { PokemonRepository } from './repositories/PokemonRepository';

/** Composition root: the single place that decides which implementation the app uses. */
export const pokemonRepository: PokemonRepository = config.useMockApi
  ? new InMemoryPokemonRepository()
  : new PokeApiPokemonRepository(createHttpClient(config.pokeApiBaseUrl, config.requestTimeoutMs));

export type { PokemonRepository };
export { ApiError } from './api/httpClient';
