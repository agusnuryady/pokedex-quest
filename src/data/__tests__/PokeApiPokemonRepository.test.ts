import type { HttpClient } from '../api/httpClient';
import { bulbasaurDto, bulbasaurSpeciesDto, grassTypeDto, pokemonListDto } from '../fixtures/pokeApiFixtures';
import { PokeApiPokemonRepository } from '../repositories/PokeApiPokemonRepository';

function fakeHttp(routes: Record<string, unknown>): HttpClient & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    async getJson<T>(path: string) {
      calls.push(path);
      if (!(path in routes)) throw new Error(`Unexpected path ${path}`);
      return routes[path] as T;
    },
  };
}

describe('PokeApiPokemonRepository', () => {
  it('fetches the whole index in one call and drops alternate forms', async () => {
    const http = fakeHttp({ '/pokemon?limit=100000&offset=0': pokemonListDto });
    const index = await new PokeApiPokemonRepository(http).listIndex();
    expect(index.map((p) => p.id)).toEqual([1, 4, 7, 25]);
    expect(http.calls).toHaveLength(1);
  });

  it('normalises names before fetching a Pokémon', async () => {
    const http = fakeHttp({ '/pokemon/bulbasaur': bulbasaurDto });
    const pokemon = await new PokeApiPokemonRepository(http).getPokemon('  Bulbasaur ');
    expect(pokemon.name).toBe('bulbasaur');
  });

  it('fetches and maps species', async () => {
    const http = fakeHttp({ '/pokemon-species/1': bulbasaurSpeciesDto });
    await expect(new PokeApiPokemonRepository(http).getSpecies(1)).resolves.toMatchObject({ genus: 'Seed Pokémon' });
  });

  it('lists species ids by type', async () => {
    const http = fakeHttp({ '/type/grass': grassTypeDto });
    await expect(new PokeApiPokemonRepository(http).listIdsByType('grass')).resolves.toEqual([1]);
  });
});
