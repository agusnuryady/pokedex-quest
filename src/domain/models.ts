/**
 * Domain entities. These are the app's own shapes — the UI never sees raw PokéAPI DTOs.
 */
export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting', 'poison', 'ground',
  'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
] as const;

export type PokemonType = (typeof POKEMON_TYPES)[number];

export type StatName = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

export type BaseStats = Record<StatName, number>;

/** Lightweight entry used by lists (no extra network call per row). */
export interface PokemonSummary {
  id: number;
  name: string;
  artworkUrl: string;
}

export interface PokemonAbility {
  name: string;
  isHidden: boolean;
}

export interface Pokemon extends PokemonSummary {
  types: PokemonType[];
  stats: BaseStats;
  abilities: PokemonAbility[];
  heightM: number;
  weightKg: number;
  spriteUrl: string | null;
}

export interface PokemonSpecies {
  id: number;
  genus: string;
  flavorText: string;
  isLegendary: boolean;
  isMythical: boolean;
}

export const isPokemonType = (value: string): value is PokemonType =>
  (POKEMON_TYPES as readonly string[]).includes(value);
