import { constantRng, makeCombatant, sequenceRng } from '@/test-utils/factories';
import { canFlee, resolveTurn, startBattle, turnOrder } from '../battleEngine';

const fast = makeCombatant({ id: 25, name: 'fast', types: ['electric'] }, 10, { speed: 100 });
const slow = makeCombatant({ id: 74, name: 'slow', types: ['water'] }, 10, { speed: 10 });

describe('turnOrder', () => {
  it('lets the faster Pokémon act first', () => {
    expect(turnOrder(fast, slow, constantRng(0.5))).toEqual(['player', 'wild']);
    expect(turnOrder(slow, fast, constantRng(0.5))).toEqual(['wild', 'player']);
  });

  it('breaks speed ties with the rng', () => {
    expect(turnOrder(fast, fast, constantRng(0.1))).toEqual(['player', 'wild']);
    expect(turnOrder(fast, fast, constantRng(0.9))).toEqual(['wild', 'player']);
  });
});

describe('resolveTurn', () => {
  it('has both sides attack in one turn and reduces HP', () => {
    const next = resolveTurn(startBattle(fast, slow), { type: 'attack', moveIndex: 0 }, constantRng(0.5));
    expect(next.turn).toBe(1);
    expect(next.lastTurn.filter((e) => e.kind === 'attack')).toHaveLength(2);
    expect(next.lastTurn[0]).toMatchObject({ kind: 'attack', side: 'player' });
    expect(next.wild.hp).toBeLessThan(slow.maxHp);
    expect(next.player.hp).toBeLessThan(fast.maxHp);
  });

  it('wins when the wild Pokémon faints, and the wild side does not strike back', () => {
    const almostDown = { ...slow, hp: 1 };
    const next = resolveTurn(startBattle(fast, almostDown), { type: 'attack', moveIndex: 1 }, constantRng(0.5));
    expect(next.status).toBe('won');
    expect(next.wild.hp).toBe(0);
    expect(next.lastTurn.map((e) => e.kind)).toEqual(['attack', 'faint']);
    expect(next.player.hp).toBe(fast.maxHp);
  });

  it('loses when the player faints', () => {
    const fragile = { ...slow, hp: 1 };
    const next = resolveTurn(startBattle(fragile, fast), { type: 'attack', moveIndex: 0 }, constantRng(0.5));
    expect(next.status).toBe('lost');
    expect(next.lastTurn.at(-1)).toEqual({ kind: 'faint', side: 'player' });
  });

  it('ignores actions after the battle has ended', () => {
    const ended = { ...startBattle(fast, slow), status: 'won' as const };
    expect(resolveTurn(ended, { type: 'attack', moveIndex: 0 }, constantRng(0.5))).toBe(ended);
  });

  it('throws on an invalid move index', () => {
    expect(() => resolveTurn(startBattle(fast, slow), { type: 'attack', moveIndex: 9 }, constantRng(0.5))).toThrow();
  });
});

describe('running away', () => {
  it('always escapes when faster', () => {
    expect(canFlee(fast, slow, constantRng(0.99))).toBe(true);
    const next = resolveTurn(startBattle(fast, slow), { type: 'run' }, constantRng(0.99));
    expect(next.status).toBe('fled');
  });

  it('gives the wild Pokémon a free hit when escape fails', () => {
    const next = resolveTurn(startBattle(slow, fast), { type: 'run' }, sequenceRng([0.9, 0.5, 0.5]));
    expect(next.status).toBe('ongoing');
    expect(next.lastTurn[0]).toEqual({ kind: 'flee', success: false });
    expect(next.lastTurn[1]).toMatchObject({ kind: 'attack', side: 'wild' });
    expect(next.player.hp).toBeLessThan(slow.maxHp);
  });
});
