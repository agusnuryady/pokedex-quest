import { useMemo } from 'react';
import { selectCaughtCount, selectPartner, selectSeenCount, useGameStore } from '@/state/gameStore';
import { artworkUrlFor } from '@/shared/config';

/** View model for the Collection: caught Pokémon in dex order, the partner, and progress counts. */
export function useCollectionVM() {
  const caught = useGameStore((s) => s.caught);
  const partner = useGameStore(selectPartner);
  const caughtCount = useGameStore(selectCaughtCount);
  const seenCount = useGameStore(selectSeenCount);
  const startOver = useGameStore((s) => s.resetGame);

  const entries = useMemo(
    () =>
      Object.values(caught)
        .sort((a, b) => a.speciesId - b.speciesId)
        .map((c) => ({
          ...c,
          artworkUrl: artworkUrlFor(c.speciesId),
          detail: c.timesCaught > 1 ? `Lv ${c.level}, caught ${c.timesCaught} times` : `Lv ${c.level}`,
          isPartner: partner?.speciesId === c.speciesId,
        })),
    [caught, partner],
  );

  return {
    entries,
    partner: partner ? { ...partner, artworkUrl: artworkUrlFor(partner.speciesId) } : null,
    caughtCount,
    seenCount,
    isEmpty: entries.length === 0,
    /** Erase all progress and return to the starter choice. */
    startOver,
  };
}
