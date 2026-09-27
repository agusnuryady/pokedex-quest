import { makePokemon } from '@/test-utils/factories';
import { buildMoveset, createCombatant, scaleHp, scaleStat, TACKLE } from '../combatant';

describe('stat scaling', () => {
  it('matches the simplified main-series formulas', () => {
    expect(scaleHp(45, 5)).toBe(19); // floor(450/100)=4 + 5 + 10
    expect(scaleStat(49, 5)).toBe(9); // floor(490/100)=4 + 5
  });

  it('grows with level', () => {
    expect(scaleStat(80, 50)).toBeGreaterThan(scaleStat(80, 10));
  });
});

describe('buildMoveset', () => {
  it('gives Tackle plus one move per type', () => {
    const moves = buildMoveset(['grass', 'poison']);
    expect(moves.map((m) => m.name)).toEqual([TACKLE.name, 'Vine Whip', 'Poison Sting']);
    expect(moves[1]!.category).toBe('special');
    expect(moves[2]!.category).toBe('physical');
  });
});

describe('createCombatant', () => {
  it('starts at full HP', () => {
    const c = createCombatant(makePokemon({ types: ['fire'] }), 12);
    expect(c.hp).toBe(c.maxHp);
    expect(c.level).toBe(12);
    expect(c.moves).toHaveLength(2);
  });
});
