import type { BaseStats, Pokemon, PokemonType } from '../models';

export type MoveCategory = 'physical' | 'special';

export interface Move {
  name: string;
  type: PokemonType;
  power: number;
  category: MoveCategory;
}

export interface CombatStats {
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface Combatant {
  speciesId: number;
  name: string;
  types: PokemonType[];
  level: number;
  maxHp: number;
  hp: number;
  stats: CombatStats;
  moves: Move[];
  artworkUrl: string;
}

/** One signature move per type. Real move names, simplified to the same power. */
const TYPE_MOVES: Record<PokemonType, string> = {
  normal: 'Body Slam', fire: 'Ember', water: 'Water Gun', electric: 'Thunder Shock',
  grass: 'Vine Whip', ice: 'Ice Shard', fighting: 'Karate Chop', poison: 'Poison Sting',
  ground: 'Mud-Slap', flying: 'Gust', psychic: 'Confusion', bug: 'Bug Bite',
  rock: 'Rock Throw', ghost: 'Lick', dragon: 'Dragon Breath', dark: 'Bite',
  steel: 'Metal Claw', fairy: 'Fairy Wind',
};

/** Classic pre-Gen-4 rule: the move's type decides physical vs special. */
const PHYSICAL_TYPES: ReadonlySet<PokemonType> = new Set([
  'normal', 'fighting', 'poison', 'ground', 'flying', 'bug', 'rock', 'ghost', 'steel', 'dark',
]);

export const TACKLE: Move = { name: 'Tackle', type: 'normal', power: 40, category: 'physical' };
export const TYPE_MOVE_POWER = 60;

export function signatureMove(type: PokemonType): Move {
  return {
    name: TYPE_MOVES[type],
    type,
    power: TYPE_MOVE_POWER,
    category: PHYSICAL_TYPES.has(type) ? 'physical' : 'special',
  };
}

/** Tackle plus one move per own type (1–2 of them). */
export function buildMoveset(types: readonly PokemonType[]): Move[] {
  return [TACKLE, ...types.map(signatureMove)];
}

/** Simplified main-series formulas (no IVs, EVs, or natures). */
export const scaleHp = (base: number, level: number): number =>
  Math.floor((2 * base * level) / 100) + level + 10;

export const scaleStat = (base: number, level: number): number =>
  Math.floor((2 * base * level) / 100) + 5;

export function createCombatant(pokemon: Pokemon, level: number): Combatant {
  const s: BaseStats = pokemon.stats;
  const maxHp = scaleHp(s.hp, level);
  return {
    speciesId: pokemon.id,
    name: pokemon.name,
    types: pokemon.types,
    level,
    maxHp,
    hp: maxHp,
    artworkUrl: pokemon.artworkUrl,
    stats: {
      attack: scaleStat(s.attack, level),
      defense: scaleStat(s.defense, level),
      specialAttack: scaleStat(s.specialAttack, level),
      specialDefense: scaleStat(s.specialDefense, level),
      speed: scaleStat(s.speed, level),
    },
    moves: buildMoveset(pokemon.types),
  };
}
