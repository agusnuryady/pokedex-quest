/**
 * Deterministic randomness. Every random decision in the game goes through an `Rng`
 * so the game can be replayed and unit tested with a fixed seed.
 */
export type Rng = () => number; // returns a float in [0, 1)

/** mulberry32 — small, fast, good-enough PRNG for games. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stateless hash of integer coordinates → [0, 1). Used for infinite terrain. */
export function hash2d(x: number, y: number, seed: number): number {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const randomInt = (rng: Rng, min: number, max: number): number =>
  Math.floor(rng() * (max - min + 1)) + min;

export const randomFloat = (rng: Rng, min: number, max: number): number => rng() * (max - min) + min;

export function pickWeighted<T>(rng: Rng, items: readonly { item: T; weight: number }[]): T {
  const total = items.reduce((sum, entry) => sum + entry.weight, 0);
  if (items.length === 0 || total <= 0) throw new Error('pickWeighted: no items with positive weight');
  let roll = rng() * total;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll < 0) return entry.item;
  }
  return items[items.length - 1]!.item;
}
