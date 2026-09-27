import { artworkUrlFor } from '@/shared/config';
import { isPokemonType, type BaseStats, type Pokemon, type PokemonSpecies, type PokemonSummary, type StatName } from '@/domain/models';
import type { NamedResourceDto, PokemonDto, PokemonSpeciesDto } from '../api/pokeApi.dto';

const STAT_KEYS: Record<string, StatName> = {
  hp: 'hp',
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'specialAttack',
  'special-defense': 'specialDefense',
  speed: 'speed',
};

/** ".../pokemon/25/" → 25. PokéAPI list endpoints only give URLs, not ids. */
export function parseIdFromUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  if (!match?.[1]) throw new Error(`Cannot parse id from url: ${url}`);
  return Number(match[1]);
}

export function mapSummary(resource: NamedResourceDto): PokemonSummary {
  const id = parseIdFromUrl(resource.url);
  return { id, name: resource.name, artworkUrl: artworkUrlFor(id) };
}

export function mapStats(stats: PokemonDto['stats']): BaseStats {
  const result: BaseStats = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
  for (const entry of stats) {
    const key = STAT_KEYS[entry.stat.name];
    if (key) result[key] = entry.base_stat;
  }
  return result;
}

export function mapPokemon(dto: PokemonDto): Pokemon {
  const types = [...dto.types]
    .sort((a, b) => a.slot - b.slot)
    .map((entry) => entry.type.name)
    .filter(isPokemonType);
  return {
    id: dto.id,
    name: dto.name,
    types,
    stats: mapStats(dto.stats),
    abilities: dto.abilities.map((entry) => ({ name: entry.ability.name, isHidden: entry.is_hidden })),
    heightM: dto.height / 10,
    weightKg: dto.weight / 10,
    artworkUrl: dto.sprites.other?.['official-artwork']?.front_default ?? artworkUrlFor(dto.id),
    spriteUrl: dto.sprites.front_default,
  };
}

/** Flavor text from the old games contains form feeds, hard wraps and soft hyphens. */
export const cleanFlavorText = (text: string): string =>
  text.replace(/\u00ad\n/g, '').replace(/[\f\n\r\u00ad]+/g, ' ').replace(/\s+/g, ' ').trim();

export function mapSpecies(dto: PokemonSpeciesDto, language = 'en'): PokemonSpecies {
  const genus = dto.genera.find((g) => g.language.name === language)?.genus ?? '';
  const flavor = dto.flavor_text_entries.find((f) => f.language.name === language)?.flavor_text ?? '';
  return {
    id: dto.id,
    genus,
    flavorText: cleanFlavorText(flavor),
    isLegendary: dto.is_legendary,
    isMythical: dto.is_mythical,
  };
}
