import { POKEMON_TYPES } from '../../models';
import { describeEffectiveness, getTypeEffectiveness } from '../typeChart';

describe('getTypeEffectiveness', () => {
  it.each([
    ['water', ['fire'], 2],
    ['fire', ['water'], 0.5],
    ['electric', ['ground'], 0],
    ['normal', ['ghost'], 0],
    ['grass', ['water', 'ground'], 4],
    ['fire', ['water', 'rock'], 0.25],
    ['ice', ['grass', 'flying'], 4],
    ['fighting', ['normal'], 2],
    ['psychic', ['psychic'], 0.5],
    ['water', ['normal'], 1],
  ] as const)('%s vs %j = %s', (attack, defender, expected) => {
    expect(getTypeEffectiveness(attack, defender)).toBe(expected);
  });

  it('only ever returns valid multipliers for single types', () => {
    for (const a of POKEMON_TYPES) {
      for (const d of POKEMON_TYPES) expect([0, 0.5, 1, 2]).toContain(getTypeEffectiveness(a, [d]));
    }
  });
});

describe('describeEffectiveness', () => {
  it('labels multipliers', () => {
    expect(describeEffectiveness(0)).toBe('immune');
    expect(describeEffectiveness(0.5)).toBe('not-very-effective');
    expect(describeEffectiveness(1)).toBe('neutral');
    expect(describeEffectiveness(4)).toBe('super-effective');
  });
});
