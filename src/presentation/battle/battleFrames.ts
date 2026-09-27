import type { BattleEvent, BattleState, Side } from '@/domain/battle/battleEngine';

/** One step of the battle animation: a message and the HP bars to show with it. */
export interface BattleFrame {
  message: string;
  playerHp: number;
  wildHp: number;
}

export interface BattleNames {
  player: string;
  wild: string;
}

const other = (side: Side): Side => (side === 'player' ? 'wild' : 'player');

const EFFECTIVENESS_MESSAGE = {
  'super-effective': "It's super effective!",
  'not-very-effective': "It's not very effective.",
  immune: 'It had no effect.',
  neutral: null,
} as const;

/**
 * Turns one resolved turn into frames. HP drops one hit at a time, so the bars
 * move in the same order the messages appear, even though the engine resolves the turn at once.
 */
export function buildTurnFrames(before: BattleState, events: readonly BattleEvent[], names: BattleNames): BattleFrame[] {
  const hp: Record<Side, number> = { player: before.player.hp, wild: before.wild.hp };
  const name = (side: Side) => (side === 'player' ? names.player : `Wild ${names.wild}`);
  const frames: BattleFrame[] = [];
  const push = (message: string) => frames.push({ message, playerHp: hp.player, wildHp: hp.wild });

  for (const event of events) {
    switch (event.kind) {
      case 'attack': {
        const target = other(event.side);
        hp[target] = Math.max(0, hp[target] - event.damage);
        push(`${name(event.side)} used ${event.moveName}!`);
        const note = EFFECTIVENESS_MESSAGE[event.effectiveness];
        if (note) push(note);
        break;
      }
      case 'faint':
        push(`${name(event.side)} fainted!`);
        break;
      case 'flee':
        push(event.success ? 'Got away safely!' : "Couldn't get away!");
        break;
    }
  }
  return frames;
}
