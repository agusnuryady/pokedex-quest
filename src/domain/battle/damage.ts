import { randomFloat, type Rng } from '../random';
import type { Combatant, Move } from './combatant';
import { getTypeEffectiveness } from './typeChart';

export const STAB_MULTIPLIER = 1.5;
export const MIN_VARIANCE = 0.85;

export interface DamageResult {
  damage: number;
  effectiveness: number;
  isStab: boolean;
}

export function calculateDamage(attacker: Combatant, defender: Combatant, move: Move, rng: Rng): DamageResult {
  const effectiveness = getTypeEffectiveness(move.type, defender.types);
  const isStab = attacker.types.includes(move.type);
  if (effectiveness === 0) return { damage: 0, effectiveness, isStab };

  const [attack, defense] =
    move.category === 'physical'
      ? [attacker.stats.attack, defender.stats.defense]
      : [attacker.stats.specialAttack, defender.stats.specialDefense];

  const base = Math.floor(((((2 * attacker.level) / 5 + 2) * move.power * attack) / defense) / 50) + 2;
  const modifier = (isStab ? STAB_MULTIPLIER : 1) * effectiveness * randomFloat(rng, MIN_VARIANCE, 1);
  return { damage: Math.max(1, Math.floor(base * modifier)), effectiveness, isStab };
}
