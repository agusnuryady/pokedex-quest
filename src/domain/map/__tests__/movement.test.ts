import { move, type Direction } from '../movement';
import { isWalkable, tileAt, type Position } from '../terrain';

const SEED = 20260927;

/** Scan the world for a walkable tile that has a blocked neighbour in `direction`. */
function findEdge(direction: Direction): Position {
  const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
  for (let x = -200; x < 200; x++) {
    for (let y = -200; y < 200; y++) {
      if (isWalkable(tileAt(x, y, SEED)) && !isWalkable(tileAt(x + d[0]!, y + d[1]!, SEED))) return { x, y };
    }
  }
  throw new Error('no edge found');
}

describe('move', () => {
  it('moves one tile when the target is walkable', () => {
    for (let x = -200; x < 200; x++) {
      if (isWalkable(tileAt(x, 0, SEED)) && isWalkable(tileAt(x + 1, 0, SEED))) {
        const result = move({ x, y: 0 }, 'right', SEED);
        expect(result).toEqual({ position: { x: x + 1, y: 0 }, moved: true, tile: tileAt(x + 1, 0, SEED) });
        return;
      }
    }
    throw new Error('no walkable pair found');
  });

  it.each<Direction>(['up', 'down', 'left', 'right'])('is blocked by water and trees going %s', (direction) => {
    const from = findEdge(direction);
    const result = move(from, direction, SEED);
    expect(result.moved).toBe(false);
    expect(result.position).toEqual(from);
  });
});
