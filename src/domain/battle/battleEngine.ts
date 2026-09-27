import { randomInt, type Rng } from '../random';
import type { Combatant, Move } from './combatant';
import { calculateDamage } from './damage';
import { describeEffectiveness, type EffectivenessLabel } from './typeChart';

export type Side = 'player' | 'wild';
export type BattleStatus = 'ongoing' | 'won' | 'lost' | 'fled';

export type BattleEvent =
  | { kind: 'attack'; side: Side; moveName: string; damage: number; effectiveness: EffectivenessLabel }
  | { kind: 'faint'; side: Side }
  | { kind: 'flee'; success: boolean };

export interface BattleState {
  status: BattleStatus;
  turn: number;
  player: Combatant;
  wild: Combatant;
  /** Events of the most recent turn only, in order — what the UI animates. */
  lastTurn: BattleEvent[];
}

export type BattleAction = { type: 'attack'; moveIndex: number } | { type: 'run' };

export const FLEE_CHANCE_WHEN_SLOWER = 0.5;

export function startBattle(player: Combatant, wild: Combatant): BattleState {
  return { status: 'ongoing', turn: 0, player, wild, lastTurn: [] };
}

const other = (side: Side): Side => (side === 'player' ? 'wild' : 'player');

/** Faster side moves first; a speed tie is a coin flip. */
export function turnOrder(player: Combatant, wild: Combatant, rng: Rng): [Side, Side] {
  if (player.stats.speed === wild.stats.speed) return rng() < 0.5 ? ['player', 'wild'] : ['wild', 'player'];
  return player.stats.speed > wild.stats.speed ? ['player', 'wild'] : ['wild', 'player'];
}

export function canFlee(player: Combatant, wild: Combatant, rng: Rng): boolean {
  return player.stats.speed >= wild.stats.speed || rng() < FLEE_CHANCE_WHEN_SLOWER;
}

function performAttack(state: BattleState, side: Side, move: Move, rng: Rng, events: BattleEvent[]): BattleState {
  const attacker = state[side];
  const defenderSide = other(side);
  const defender = state[defenderSide];
  const { damage, effectiveness } = calculateDamage(attacker, defender, move, rng);
  const hp = Math.max(0, defender.hp - damage);

  events.push({ kind: 'attack', side, moveName: move.name, damage, effectiveness: describeEffectiveness(effectiveness) });
  const next: BattleState = { ...state, [defenderSide]: { ...defender, hp } };
  if (hp > 0) return next;

  events.push({ kind: 'faint', side: defenderSide });
  return { ...next, status: defenderSide === 'wild' ? 'won' : 'lost' };
}

const pickWildMove = (wild: Combatant, rng: Rng): Move => wild.moves[randomInt(rng, 0, wild.moves.length - 1)]!;

export function resolveTurn(state: BattleState, action: BattleAction, rng: Rng): BattleState {
  if (state.status !== 'ongoing') return state;
  const events: BattleEvent[] = [];
  let next: BattleState = { ...state, turn: state.turn + 1 };

  if (action.type === 'run') {
    const success = canFlee(state.player, state.wild, rng);
    events.push({ kind: 'flee', success });
    if (success) return { ...next, status: 'fled', lastTurn: events };
    // A failed escape gives the wild Pokémon a free hit.
    next = performAttack(next, 'wild', pickWildMove(next.wild, rng), rng, events);
    return { ...next, lastTurn: events };
  }

  const playerMove = state.player.moves[action.moveIndex];
  if (!playerMove) throw new Error(`Invalid move index ${action.moveIndex}`);
  const moves: Record<Side, Move> = { player: playerMove, wild: pickWildMove(state.wild, rng) };

  for (const side of turnOrder(state.player, state.wild, rng)) {
    next = performAttack(next, side, moves[side], rng, events);
    if (next.status !== 'ongoing') break;
  }
  return { ...next, lastTurn: events };
}
