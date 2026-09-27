import { createCombatant, type Combatant, type CombatStats } from '@/domain/battle/combatant';
import type { Pokemon } from '@/domain/models';
import type { Rng } from '@/domain/random';

export function makePokemon(overrides: Partial<Pokemon> = {}): Pokemon {
  return {
    id: 1,
    name: 'testmon',
    types: ['normal'],
    stats: { hp: 50, attack: 50, defense: 50, specialAttack: 50, specialDefense: 50, speed: 50 },
    abilities: [],
    heightM: 1,
    weightKg: 10,
    artworkUrl: 'https://example.com/1.png',
    spriteUrl: null,
    ...overrides,
  };
}

export function makeCombatant(
  overrides: Partial<Pokemon> = {},
  level = 10,
  statOverrides: Partial<CombatStats> = {},
): Combatant {
  const combatant = createCombatant(makePokemon(overrides), level);
  return { ...combatant, stats: { ...combatant.stats, ...statOverrides } };
}

/** An Rng that returns a fixed sequence (repeating the last value). */
export function sequenceRng(values: number[]): Rng {
  let i = 0;
  return () => values[Math.min(i++, values.length - 1)]!;
}

export const constantRng = (value: number): Rng => () => value;
