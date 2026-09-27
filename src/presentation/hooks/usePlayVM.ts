import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_ENCOUNTER_CONFIG, rollEncounter, type WildEncounter } from '@/domain/map/encounter';
import { move, type Direction } from '@/domain/map/movement';
import { getViewport, tileAt, type Position, type TileKind } from '@/domain/map/terrain';
import type { Rng } from '@/domain/random';
import { selectPartner, useGameStore } from '@/state/gameStore';
import { sessionRng } from '@/shared/sessionRng';

export const TILE_LABELS: Record<TileKind, string> = {
  grass: 'Short grass',
  tallGrass: 'Tall grass. Wild Pokémon hide here.',
  path: 'Footpath',
  sand: 'Sandy shore',
  water: 'Water',
  tree: 'Forest',
};

interface Options {
  cols: number;
  rows: number;
  /** Called once when a wild Pokémon appears. The screen uses it to open the battle. */
  onEncounter: (encounter: WildEncounter) => void;
  /** Injected for tests; the app uses a fresh seed every session. */
  rng?: Rng;
}

/** View model for Play: walking, the visible window of the world, and wild encounters. */
export function usePlayVM({ cols, rows, onEncounter, rng }: Options) {
  const seed = useGameStore((s) => s.world.seed);
  const position = useGameStore((s) => s.world.position);
  const partner = useGameStore(selectPartner);
  const inBattle = useGameStore((s) => s.encounter !== null);

  const [random] = useState<Rng>(() => rng ?? sessionRng);
  const [facing, setFacing] = useState<Direction>('down');
  /** The partner walks one tile behind the player. */
  const [follower, setFollower] = useState<Position | null>(null);

  const viewport = useMemo(() => getViewport(position, cols, rows, seed), [position, cols, rows, seed]);
  const currentTile = tileAt(position.x, position.y, seed);

  const step = useCallback(
    (direction: Direction) => {
      const state = useGameStore.getState();
      if (state.encounter !== null || state.partnerId === null) return;
      setFacing(direction);

      const from = state.world.position;
      const result = move(from, direction, state.world.seed);
      if (!result.moved) return;

      state.moveTo(result.position);
      setFollower(from);

      const partnerLevel = state.caught[state.partnerId]?.level ?? 5;
      const encounter = rollEncounter(
        { tile: result.tile, stepsSinceLastEncounter: useGameStore.getState().world.stepsSinceLastEncounter, partnerLevel },
        random,
        DEFAULT_ENCOUNTER_CONFIG,
      );
      if (encounter) {
        state.startEncounter(encounter);
        onEncounter(encounter);
      }
    },
    [onEncounter, random],
  );

  // Where the partner stands, relative to the viewport's top-left tile (null if off-screen).
  const followerCell =
    follower && (follower.x !== position.x || follower.y !== position.y)
      ? { col: follower.x - viewport.origin.x, row: follower.y - viewport.origin.y }
      : null;

  return {
    viewport,
    playerCell: { col: position.x - viewport.origin.x, row: position.y - viewport.origin.y },
    followerCell,
    facing,
    position,
    currentTile,
    tileLabel: TILE_LABELS[currentTile],
    partner,
    canMove: partner !== null && !inBattle,
    step,
  };
}
