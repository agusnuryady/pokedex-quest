import { artworkUrlFor } from '@/shared/config';
import type { Pokemon, PokemonSpecies, PokemonType } from '@/domain/models';
import { bulbasaurSpeciesDto, pokemonFixtures } from '../fixtures/pokeApiFixtures';
import { mapPokemon, mapSpecies } from '../mappers/pokemonMapper';
import type { PokemonRepository } from './PokemonRepository';

/**
 * Offline implementation backed by fixtures. Unknown ids return a deterministic
 * placeholder, so the whole game loop (any encounter 1–151) runs with no network.
 */
export class InMemoryPokemonRepository implements PokemonRepository {
  private readonly byId = new Map<number, Pokemon>(pokemonFixtures.map((dto) => [dto.id, mapPokemon(dto)]));

  constructor(private readonly indexSize = 151) {}

  async listIndex() {
    return Array.from({ length: this.indexSize }, (_, i) => {
      const id = i + 1;
      return { id, name: this.byId.get(id)?.name ?? `pokemon-${id}`, artworkUrl: artworkUrlFor(id) };
    });
  }

  async getPokemon(idOrName: number | string): Promise<Pokemon> {
    const found =
      typeof idOrName === 'number'
        ? this.byId.get(idOrName)
        : [...this.byId.values()].find((p) => p.name === idOrName.trim().toLowerCase());
    if (found) return found;
    if (typeof idOrName === 'string') throw new Error(`Pokémon "${idOrName}" not found`);
    return placeholder(idOrName);
  }

  async getSpecies(id: number): Promise<PokemonSpecies> {
    if (id === bulbasaurSpeciesDto.id) return mapSpecies(bulbasaurSpeciesDto);
    return { id, genus: 'Unknown Pokémon', flavorText: 'No field notes yet.', isLegendary: false, isMythical: false };
  }

  async listIdsByType(type: PokemonType) {
    return [...this.byId.values()].filter((p) => p.types.includes(type)).map((p) => p.id);
  }
}

function placeholder(id: number): Pokemon {
  return {
    id,
    name: `pokemon-${id}`,
    types: ['normal'],
    stats: { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 },
    abilities: [],
    heightM: 1,
    weightKg: 10,
    artworkUrl: artworkUrlFor(id),
    spriteUrl: null,
  };
}
