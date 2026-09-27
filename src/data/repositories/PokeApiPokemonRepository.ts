import { config } from '@/shared/config';
import type { PokemonType } from '@/domain/models';
import type { HttpClient } from '../api/httpClient';
import type { PokemonDto, PokemonListDto, PokemonSpeciesDto, TypeDto } from '../api/pokeApi.dto';
import { mapPokemon, mapSpecies, mapSummary, parseIdFromUrl } from '../mappers/pokemonMapper';
import type { PokemonRepository } from './PokemonRepository';

/** Large enough to return the whole index in one call (~1,300 entries, ~60 KB). */
const INDEX_LIMIT = 100_000;

export class PokeApiPokemonRepository implements PokemonRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly maxSpeciesId: number = config.maxSpeciesId,
  ) {}

  async listIndex() {
    const dto = await this.http.getJson<PokemonListDto>(`/pokemon?limit=${INDEX_LIMIT}&offset=0`);
    return dto.results.map(mapSummary).filter((p) => p.id <= this.maxSpeciesId);
  }

  async getPokemon(idOrName: number | string) {
    const key = typeof idOrName === 'string' ? idOrName.trim().toLowerCase() : idOrName;
    return mapPokemon(await this.http.getJson<PokemonDto>(`/pokemon/${key}`));
  }

  async getSpecies(id: number) {
    return mapSpecies(await this.http.getJson<PokemonSpeciesDto>(`/pokemon-species/${id}`));
  }

  async listIdsByType(type: PokemonType) {
    const dto = await this.http.getJson<TypeDto>(`/type/${type}`);
    return dto.pokemon.map((entry) => parseIdFromUrl(entry.pokemon.url)).filter((id) => id <= this.maxSpeciesId);
  }
}
