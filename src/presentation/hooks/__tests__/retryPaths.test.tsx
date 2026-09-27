import { act, waitFor } from '@testing-library/react-native';
import type { PokemonRepository } from '@/data';
import { InMemoryPokemonRepository } from '@/data/repositories/InMemoryPokemonRepository';
import { useGameStore } from '@/state/gameStore';
import { constantRng } from '@/test-utils/factories';
import { renderHookWithProviders } from '@/test-utils/render';
import { useBattleVM } from '../useBattleVM';
import { useStarterVM } from '../useStarterVM';

/** A repository whose getPokemon fails until `heal()` is called. */
function flakyRepo() {
  const real = new InMemoryPokemonRepository();
  let broken = true;
  const repo: PokemonRepository = {
    listIndex: () => real.listIndex(),
    getSpecies: (id) => real.getSpecies(id),
    listIdsByType: (t) => real.listIdsByType(t),
    getPokemon: (id) => (broken ? Promise.reject(new Error('offline')) : real.getPokemon(id)),
  };
  return { repo, heal: () => (broken = false) };
}

beforeEach(() => useGameStore.getState().resetGame());

it('useStarterVM recovers after a failed load', async () => {
  const { repo, heal } = flakyRepo();
  const { result } = await renderHookWithProviders(() => useStarterVM(), repo);
  await waitFor(() => expect(result.current.status).toBe('error'));
  heal();
  await act(async () => result.current.retry());
  await waitFor(() => expect(result.current.status).toBe('ready'));
});

it('useBattleVM shows an error and recovers when the Pokémon fail to load', async () => {
  useGameStore.getState().chooseStarter(7, 'squirtle');
  useGameStore.getState().startEncounter({ speciesId: 25, level: 5 });
  const { repo, heal } = flakyRepo();
  const { result } = await renderHookWithProviders(() => useBattleVM({ rng: constantRng(0.5), frameMs: 0 }), repo);
  await waitFor(() => expect(result.current.phase).toBe('error'));
  heal();
  await act(async () => result.current.retry());
  await waitFor(() => expect(result.current.phase).toBe('choosing'));
  expect(result.current.names.wild).toBe('Pikachu');
});
