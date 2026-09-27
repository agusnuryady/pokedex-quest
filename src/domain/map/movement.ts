import { isWalkable, tileAt, type Position, type TileKind } from './terrain';

export type Direction = 'up' | 'down' | 'left' | 'right';

const DELTAS: Record<Direction, Position> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export interface MoveResult {
  position: Position;
  moved: boolean;
  /** Tile the player is standing on after the move (unchanged if blocked). */
  tile: TileKind;
}

export function move(from: Position, direction: Direction, seed: number): MoveResult {
  const delta = DELTAS[direction];
  const target = { x: from.x + delta.x, y: from.y + delta.y };
  const targetTile = tileAt(target.x, target.y, seed);
  if (!isWalkable(targetTile)) {
    return { position: from, moved: false, tile: tileAt(from.x, from.y, seed) };
  }
  return { position: target, moved: true, tile: targetTile };
}
