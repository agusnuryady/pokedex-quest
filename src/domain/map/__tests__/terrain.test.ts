import { findNearestWalkable, getViewport, isWalkable, tileAt, type TileKind } from '../terrain';

const SEED = 20260927;

describe('tileAt', () => {
  it('is a pure function of (x, y, seed)', () => {
    expect(tileAt(123, -456, SEED)).toBe(tileAt(123, -456, SEED));
  });

  it('generates every terrain kind across a large area', () => {
    const kinds = new Set<TileKind>();
    for (let x = -150; x < 150; x++) for (let y = -150; y < 150; y++) kinds.add(tileAt(x, y, SEED));
    expect([...kinds].sort()).toEqual(['grass', 'path', 'sand', 'tallGrass', 'tree', 'water']);
  });

  it('keeps most of the world walkable', () => {
    let walkable = 0;
    const size = 200;
    for (let x = 0; x < size; x++) for (let y = 0; y < size; y++) if (isWalkable(tileAt(x, y, SEED))) walkable++;
    expect(walkable / (size * size)).toBeGreaterThan(0.6);
  });

  it('works far from the origin (the map is infinite)', () => {
    expect(() => tileAt(1_000_000, -1_000_000, SEED)).not.toThrow();
  });

  it('produces a different world for a different seed', () => {
    let differences = 0;
    for (let x = 0; x < 50; x++) if (tileAt(x, 0, 1) !== tileAt(x, 0, 2)) differences++;
    expect(differences).toBeGreaterThan(0);
  });
});

describe('getViewport', () => {
  it('returns rows x cols tiles centred on the player', () => {
    const view = getViewport({ x: 10, y: 20 }, 9, 13, SEED);
    expect(view.rows).toHaveLength(13);
    expect(view.rows[0]).toHaveLength(9);
    expect(view.origin).toEqual({ x: 6, y: 14 });
    expect(view.rows[6]![4]).toBe(tileAt(10, 20, SEED));
  });
});

describe('findNearestWalkable', () => {
  it('returns a walkable position', () => {
    const spawn = findNearestWalkable({ x: 0, y: 0 }, SEED);
    expect(isWalkable(tileAt(spawn.x, spawn.y, SEED))).toBe(true);
  });

  it('finds a walkable tile even when starting in water', () => {
    let water: { x: number; y: number } | null = null;
    for (let x = 0; x < 300 && !water; x++) if (tileAt(x, 0, SEED) === 'water') water = { x, y: 0 };
    expect(water).not.toBeNull();
    const spawn = findNearestWalkable(water!, SEED);
    expect(isWalkable(tileAt(spawn.x, spawn.y, SEED))).toBe(true);
  });
});
