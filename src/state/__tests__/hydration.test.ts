import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';
import { useGameStore, useStoreHydrated } from '../gameStore';

const KEY = 'pokedex-quest/game';

describe('persistence', () => {
  it('reports when saved progress has loaded', async () => {
    const { result } = await renderHook(() => useStoreHydrated());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('restores a saved game from device storage', async () => {
    const saved = {
      state: {
        caught: { 4: { speciesId: 4, name: 'charmander', level: 9, timesCaught: 1, firstCaughtAt: '2026-09-27T00:00:00.000Z' } },
        seen: { 4: true },
        partnerId: 4,
        world: { seed: 20260927, position: { x: 12, y: -3 }, stepsSinceLastEncounter: 2 },
      },
      version: 1,
    };
    await AsyncStorage.setItem(KEY, JSON.stringify(saved));
    await useGameStore.persist.rehydrate();

    const state = useGameStore.getState();
    expect(state.partnerId).toBe(4);
    expect(state.caught[4]!.level).toBe(9);
    expect(state.world.position).toEqual({ x: 12, y: -3 });
  });

  it('never saves an in-progress battle', async () => {
    useGameStore.getState().startEncounter({ speciesId: 25, level: 5 });
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(KEY);
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!).state).not.toHaveProperty('encounter');
    });
  });
});
