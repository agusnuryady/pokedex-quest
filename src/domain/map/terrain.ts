import { hash2d } from '../random';

/**
 * The world is infinite because nothing is stored: every tile is a pure function of
 * (x, y, seed). The same seed always produces the same world, so only the player's
 * position and the seed need to be persisted.
 */
export type TileKind = 'grass' | 'tallGrass' | 'path' | 'sand' | 'water' | 'tree';

export interface Position {
  x: number;
  y: number;
}

const WALKABLE: Record<TileKind, boolean> = {
  grass: true,
  tallGrass: true,
  path: true,
  sand: true,
  water: false,
  tree: false,
};

export const isWalkable = (tile: TileKind): boolean => WALKABLE[tile];

/** Wild Pokémon only appear in tall grass, like the original games. */
export const canEncounterOn = (tile: TileKind): boolean => tile === 'tallGrass';

const smoothstep = (t: number): number => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Bilinear value noise over a lattice of `cellSize` tiles. Output in [0, 1). */
function valueNoise(x: number, y: number, seed: number, cellSize: number): number {
  const gx = Math.floor(x / cellSize);
  const gy = Math.floor(y / cellSize);
  const tx = smoothstep(x / cellSize - gx);
  const ty = smoothstep(y / cellSize - gy);
  const top = lerp(hash2d(gx, gy, seed), hash2d(gx + 1, gy, seed), tx);
  const bottom = lerp(hash2d(gx, gy + 1, seed), hash2d(gx + 1, gy + 1, seed), tx);
  return lerp(top, bottom, ty);
}

/** Two octaves: big landmasses plus smaller detail. */
function fractalNoise(x: number, y: number, seed: number): number {
  return valueNoise(x, y, seed, 16) * 0.7 + valueNoise(x, y, seed + 101, 5) * 0.3;
}

export const TERRAIN_THRESHOLDS = {
  water: 0.3,
  sand: 0.34,
  forest: 0.74,
  tallGrassMoisture: 0.52,
  pathBand: 0.025,
  scatteredTree: 0.965,
} as const;

export function tileAt(x: number, y: number, seed: number): TileKind {
  const t = TERRAIN_THRESHOLDS;
  const elevation = fractalNoise(x, y, seed);
  if (elevation < t.water) return 'water';
  if (elevation < t.sand) return 'sand';
  if (elevation > t.forest) return 'tree';

  // A narrow band of a third noise field draws winding footpaths through the land.
  if (Math.abs(valueNoise(x, y, seed + 707, 12) - 0.5) < t.pathBand) return 'path';

  if (hash2d(x, y, seed + 31) > t.scatteredTree) return 'tree';

  const moisture = fractalNoise(x, y, seed + 409);
  return moisture > t.tallGrassMoisture ? 'tallGrass' : 'grass';
}

export interface Viewport {
  /** World coordinate of the top-left tile. */
  origin: Position;
  /** rows[row][col] */
  rows: TileKind[][];
}

/** The window of tiles around `center`. Only visible tiles are ever computed. */
export function getViewport(center: Position, cols: number, rows: number, seed: number): Viewport {
  const origin = { x: center.x - Math.floor(cols / 2), y: center.y - Math.floor(rows / 2) };
  const grid: TileKind[][] = [];
  for (let row = 0; row < rows; row++) {
    const line: TileKind[] = [];
    for (let col = 0; col < cols; col++) line.push(tileAt(origin.x + col, origin.y + row, seed));
    grid.push(line);
  }
  return { origin, rows: grid };
}

/** Spiral outward from `start` to find a safe spawn point. */
export function findNearestWalkable(start: Position, seed: number, maxRadius = 64): Position {
  if (isWalkable(tileAt(start.x, start.y, seed))) return start;
  for (let r = 1; r <= maxRadius; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dy = -r; dy <= r; dy++) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; // ring only
        const candidate = { x: start.x + dx, y: start.y + dy };
        if (isWalkable(tileAt(candidate.x, candidate.y, seed))) return candidate;
      }
    }
  }
  throw new Error(`No walkable tile within ${maxRadius} of (${start.x}, ${start.y})`);
}
