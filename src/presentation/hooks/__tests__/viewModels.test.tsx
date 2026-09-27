import { act, waitFor } from '@testing-library/react-native';
import type { PokemonRepository } from '@/data';
import { InMemoryPokemonRepository } from '@/data/repositories/InMemoryPokemonRepository';
import { useGameStore } from '@/state/gameStore';
import { renderHookWithProviders } from '@/test-utils/render';
import { useCollectionVM } from '../useCollectionVM';
import { GLOSSARY_PAGE_SIZE, useGlossaryVM } from '../useGlossaryVM';
import { usePokemonDetailVM } from '../usePokemonDetailVM';

beforeEach(() => useGameStore.getState().resetGame());

describe('useGlossaryVM', () => {
  it('loads the index and shows the first page', async () => {
    const { result } = await renderHookWithProviders(() => useGlossaryVM());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.totalCount).toBe(151);
    expect(result.current.items).toHaveLength(GLOSSARY_PAGE_SIZE);
    expect(result.current.hasMore).toBe(true);
  });

  it('loads more pages until the end', async () => {
    const { result } = await renderHookWithProviders(() => useGlossaryVM());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    for (let i = 0; i < 5; i++) await act(async () => result.current.loadMore());
    expect(result.current.items).toHaveLength(151);
    expect(result.current.hasMore).toBe(false);
  });

  it('filters by search and by type, and resets paging', async () => {
    const { result } = await renderHookWithProviders(() => useGlossaryVM());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    await act(async () => result.current.loadMore());

    await act(async () => result.current.setQuery('pika'));
    await waitFor(() => expect(result.current.items.map((p) => p.id)).toEqual([25]));

    await act(async () => {
      result.current.setQuery('');
      result.current.setType('fire');
    });
    await waitFor(() => expect(result.current.items.map((p) => p.id)).toEqual([4]));
    expect(result.current.resultCount).toBe(1);
  });

  it('marks caught Pokémon', async () => {
    useGameStore.getState().chooseStarter(1, 'bulbasaur');
    const { result } = await renderHookWithProviders(() => useGlossaryVM());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.isCaught(1)).toBe(true);
    expect(result.current.isCaught(2)).toBe(false);
  });

  it('reports an error and recovers on retry', async () => {
    const real = new InMemoryPokemonRepository();
    let fail = true;
    const flaky: PokemonRepository = {
      ...real,
      getPokemon: (id) => real.getPokemon(id),
      getSpecies: (id) => real.getSpecies(id),
      listIdsByType: (t) => real.listIdsByType(t),
      listIndex: () => (fail ? Promise.reject(new Error('offline')) : real.listIndex()),
    };
    const { result } = await renderHookWithProviders(() => useGlossaryVM(), flaky);
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.errorMessage).toMatch(/connection/);

    fail = false;
    await act(async () => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe('ready'));
  });
});

describe('usePokemonDetailVM', () => {
  it('combines API data with the player’s progress', async () => {
    useGameStore.getState().chooseStarter(1, 'bulbasaur');
    const { result } = await renderHookWithProviders(() => usePokemonDetailVM(1));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.pokemon?.name).toBe('bulbasaur');
    expect(result.current.stats.map((s) => s.label)).toEqual(['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed']);
    expect(result.current.totalStats).toBe(318);
    await waitFor(() => expect(result.current.species?.genus).toBe('Seed Pokémon'));
    expect(result.current.isPartner).toBe(true);
    expect(result.current.canMakePartner).toBe(false);
  });

  it('lets a caught, non-partner Pokémon become the partner', async () => {
    useGameStore.getState().chooseStarter(1, 'bulbasaur');
    useGameStore.getState().recordCatch({ speciesId: 25, name: 'pikachu', level: 6 });
    const { result } = await renderHookWithProviders(() => usePokemonDetailVM(25));
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.canMakePartner).toBe(true);
    await act(async () => result.current.makePartner());
    expect(useGameStore.getState().partnerId).toBe(25);
  });

  it('says whether an uncaught Pokémon appears in the wild', async () => {
    const { result: gen1 } = await renderHookWithProviders(() => usePokemonDetailVM(25));
    await waitFor(() => expect(gen1.current.status).toBe('ready'));
    expect(gen1.current.caught).toBeNull();
    expect(gen1.current.appearsInWild).toBe(true);

    const { result: later } = await renderHookWithProviders(() => usePokemonDetailVM(300));
    await waitFor(() => expect(later.current.status).toBe('ready'));
    expect(later.current.appearsInWild).toBe(false);
  });

  it('treats an invalid id as an error without fetching', async () => {
    const { result } = await renderHookWithProviders(() => usePokemonDetailVM(Number('abc')));
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toBe('This Pokémon does not exist.');
  });
});

describe('useCollectionVM', () => {
  it('is empty before the first catch', async () => {
    const { result } = await renderHookWithProviders(() => useCollectionVM());
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.partner).toBeNull();
  });

  it('lists catches in dex order with the partner and counts', async () => {
    const store = useGameStore.getState();
    store.chooseStarter(7, 'squirtle');
    store.recordCatch({ speciesId: 16, name: 'pidgey', level: 4 });
    store.recordCatch({ speciesId: 16, name: 'pidgey', level: 5 });
    store.recordCatch({ speciesId: 1, name: 'bulbasaur', level: 3 });
    store.recordSeen(19);

    const { result } = await renderHookWithProviders(() => useCollectionVM());
    expect(result.current.entries.map((e) => e.speciesId)).toEqual([1, 7, 16]);
    expect(result.current.entries[2]!.detail).toBe('Lv 5, caught 2 times');
    expect(result.current.partner).toMatchObject({ speciesId: 7, level: 5 });
    expect(result.current.entries.find((e) => e.isPartner)?.speciesId).toBe(7);
    expect(result.current).toMatchObject({ caughtCount: 3, seenCount: 4 });
  });

  it('starts over, erasing all progress', async () => {
    useGameStore.getState().chooseStarter(1, 'bulbasaur');
    const { result } = await renderHookWithProviders(() => useCollectionVM());
    expect(result.current.isEmpty).toBe(false);
    await act(async () => result.current.startOver());
    expect(result.current.isEmpty).toBe(true);
    expect(useGameStore.getState().partnerId).toBeNull();
  });
});
