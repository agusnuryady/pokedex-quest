import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Collection from '@/domain/collection/collection';
import type { WildEncounter } from '@/domain/map/encounter';
import { findNearestWalkable, type Position } from '@/domain/map/terrain';

/**
 * Thin state container. All rules live in `domain/`; this file only wires
 * pure functions to React and persists the result on the device.
 */
interface WorldState {
  seed: number;
  position: Position;
  stepsSinceLastEncounter: number;
}

interface GameState extends Collection.CollectionState {
  world: WorldState;
  /**
   * The wild Pokémon currently being battled. Kept in state (not the URL) so a battle
   * can only start from a real encounter. Not persisted: reopening the app never resumes a battle.
   */
  encounter: WildEncounter | null;
  startEncounter(encounter: WildEncounter): void;
  endEncounter(): void;
  chooseStarter(speciesId: number, name: string): void;
  recordSeen(speciesId: number): void;
  recordCatch(entry: { speciesId: number; name: string; level: number }): void;
  setPartner(speciesId: number): void;
  rewardPartner(): void;
  moveTo(position: Position): void;
  resetEncounterCounter(): void;
  resetGame(): void;
}

export const DEFAULT_WORLD_SEED = 20260927;

const initialWorld = (seed = DEFAULT_WORLD_SEED): WorldState => ({
  seed,
  position: findNearestWalkable({ x: 0, y: 0 }, seed),
  stepsSinceLastEncounter: 0,
});

const collectionOf = (s: GameState): Collection.CollectionState => ({
  caught: s.caught,
  seen: s.seen,
  partnerId: s.partnerId,
});

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...Collection.emptyCollection(),
      world: initialWorld(),
      encounter: null,

      startEncounter: (encounter) => set(() => ({ encounter, ...Collection.markSeen(collectionOf(get()), encounter.speciesId) })),
      endEncounter: () => set((s) => ({ encounter: null, world: { ...s.world, stepsSinceLastEncounter: 0 } })),
      chooseStarter: (speciesId, name) =>
        set(Collection.chooseStarter(collectionOf(get()), speciesId, name, new Date())),
      recordSeen: (speciesId) => set(Collection.markSeen(collectionOf(get()), speciesId)),
      recordCatch: (entry) => set(Collection.addCatch(collectionOf(get()), entry, new Date())),
      setPartner: (speciesId) => set(Collection.setPartner(collectionOf(get()), speciesId)),
      rewardPartner: () => {
        const { partnerId } = get();
        if (partnerId !== null) set(Collection.gainLevel(collectionOf(get()), partnerId, 1));
      },
      moveTo: (position) =>
        set((s) => ({
          world: { ...s.world, position, stepsSinceLastEncounter: s.world.stepsSinceLastEncounter + 1 },
        })),
      resetEncounterCounter: () => set((s) => ({ world: { ...s.world, stepsSinceLastEncounter: 0 } })),
      resetGame: () => set({ ...Collection.emptyCollection(), world: initialWorld(), encounter: null }),
    }),
    {
      name: 'pokedex-quest/game',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ caught: s.caught, seen: s.seen, partnerId: s.partnerId, world: s.world }),
    },
  ),
);

// Selectors — components subscribe to the smallest slice they need.
export const selectPartner = (s: GameState) => Collection.getPartner(collectionOf(s));
export const selectCaughtCount = (s: GameState) => Collection.caughtCount(collectionOf(s));
export const selectSeenCount = (s: GameState) => Collection.seenCount(collectionOf(s));
export const selectHasStarter = (s: GameState) => s.partnerId !== null;

/**
 * True once saved progress has loaded from device storage. Storage is asynchronous, so
 * until then the store holds a fresh game; rendering it would briefly show a returning
 * player the starter picker, and tapping a starter there would overwrite their save.
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onChange) => useGameStore.persist.onFinishHydration(onChange),
    () => useGameStore.persist.hasHydrated(),
    () => useGameStore.persist.hasHydrated(),
  );
}
