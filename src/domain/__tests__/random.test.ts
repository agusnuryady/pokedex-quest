import { createRng, hash2d, pickWeighted, randomInt } from '../random';
import { sequenceRng } from '@/test-utils/factories';

describe('createRng', () => {
  it('is deterministic for the same seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('produces different sequences for different seeds', () => {
    expect(createRng(1)()).not.toEqual(createRng(2)());
  });

  it('stays within [0, 1)', () => {
    const rng = createRng(7);
    for (let i = 0; i < 10_000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hash2d', () => {
  it('is stable for the same coordinates and seed', () => {
    expect(hash2d(10, -5, 99)).toBe(hash2d(10, -5, 99));
  });

  it('varies across neighbouring coordinates', () => {
    const values = new Set([hash2d(0, 0, 1), hash2d(1, 0, 1), hash2d(0, 1, 1), hash2d(-1, 0, 1)]);
    expect(values.size).toBe(4);
  });
});

describe('randomInt', () => {
  it('covers both bounds inclusively', () => {
    expect(randomInt(() => 0, 3, 7)).toBe(3);
    expect(randomInt(() => 0.9999, 3, 7)).toBe(7);
  });
});

describe('pickWeighted', () => {
  const table = [
    { item: 'common', weight: 9 },
    { item: 'rare', weight: 1 },
  ];

  it('picks by cumulative weight', () => {
    expect(pickWeighted(sequenceRng([0.5]), table)).toBe('common');
    expect(pickWeighted(sequenceRng([0.95]), table)).toBe('rare');
  });

  it('roughly matches the weights over many rolls', () => {
    const rng = createRng(123);
    let rare = 0;
    for (let i = 0; i < 10_000; i++) if (pickWeighted(rng, table) === 'rare') rare++;
    expect(rare / 10_000).toBeGreaterThan(0.08);
    expect(rare / 10_000).toBeLessThan(0.12);
  });

  it('throws on an empty table', () => {
    expect(() => pickWeighted(() => 0.5, [])).toThrow();
  });
});
