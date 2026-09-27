import { act, waitFor } from '@testing-library/react-native';
import { isWalkable, tileAt, type Position } from '@/domain/map/terrain';
import { DEFAULT_WORLD_SEED, useGameStore } from '@/state/gameStore';
import { constantRng } from '@/test-utils/factories';
import { renderHookWithProviders } from '@/test-utils/render';
import { useBattleVM } from '../useBattleVM';
import { usePlayVM } from '../usePlayVM';
import { useStarterVM } from '../useStarterVM';

const SEED = DEFAULT_WORLD_SEED;

/** A walkable tile whose right-hand neighbour matches `predicate`. */
function findStart(predicate: (tile: ReturnType<typeof tileAt>) => boolean): Position {
  for (let x = -100; x < 100; x++) {
    for (let y = -100; y < 100; y++) {
      if (isWalkable(tileAt(x, y, SEED)) && predicate(tileAt(x + 1, y, SEED))) return { x, y };
    }
  }
  throw new Error('no start found');
}

function placePlayer(position: Position, stepsSinceLastEncounter = 10) {
  useGameStore.setState({ world: { seed: SEED, position, stepsSinceLastEncounter } });
}

beforeEach(() => useGameStore.getState().resetGame());

describe('useStarterVM', () => {
  it('loads the three starters and lets the player choose one', async () => {
    const { result } = await renderHookWithProviders(() => useStarterVM());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    expect(result.current.starters.map((s) => s.name)).toEqual(['bulbasaur', 'charmander', 'squirtle']);
    expect(result.current.starters[1]!.types).toEqual(['fire']);

    await act(async () => result.current.choose(4, 'charmander'));
    expect(useGameStore.getState().partnerId).toBe(4);
  });
});

describe('usePlayVM', () => {
  const setup = async (rngValue: number, onEncounter = jest.fn()) => {
    const hook = await renderHookWithProviders(() =>
      usePlayVM({ cols: 9, rows: 11, onEncounter, rng: constantRng(rngValue) }),
    );
    return { ...hook, onEncounter };
  };

  it('does not move before a starter is chosen', async () => {
    const start = findStart(isWalkable);
    placePlayer(start);
    const { result } = await setup(0.99);
    expect(result.current.canMove).toBe(false);
    await act(async () => result.current.step('right'));
    expect(useGameStore.getState().world.position).toEqual(start);
  });

  it('keeps the player centred in the viewport', async () => {
    useGameStore.getState().chooseStarter(7, 'squirtle');
    const { result } = await setup(0.99);
    expect(result.current.viewport.rows).toHaveLength(11);
    expect(result.current.playerCell).toEqual({ col: 4, row: 5 });
  });

  it('walks onto open ground, turns to face the way it moved, and leaves the partner behind', async () => {
    useGameStore.getState().chooseStarter(7, 'squirtle');
    const start = findStart((t) => t === 'grass' || t === 'path');
    placePlayer(start);
    const { result, onEncounter } = await setup(0);
    await act(async () => result.current.step('right'));
    expect(useGameStore.getState().world.position).toEqual({ x: start.x + 1, y: start.y });
    expect(result.current.facing).toBe('right');
    expect(result.current.followerCell).toEqual({ col: 3, row: 5 });
    expect(onEncounter).not.toHaveBeenCalled();
  });

  it('turns but stays put when blocked', async () => {
    useGameStore.getState().chooseStarter(7, 'squirtle');
    const start = findStart((t) => !isWalkable(t));
    placePlayer(start);
    const { result } = await setup(0);
    await act(async () => result.current.step('right'));
    expect(useGameStore.getState().world.position).toEqual(start);
    expect(result.current.facing).toBe('right');
  });

  it('triggers an encounter in tall grass and stops movement until the battle ends', async () => {
    useGameStore.getState().chooseStarter(7, 'squirtle');
    placePlayer(findStart((t) => t === 'tallGrass'));
    const { result, onEncounter } = await setup(0);
    await act(async () => result.current.step('right'));

    expect(onEncounter).toHaveBeenCalledTimes(1);
    const encounter = useGameStore.getState().encounter;
    expect(encounter).toEqual(onEncounter.mock.calls[0]![0]);
    expect(useGameStore.getState().seen[encounter!.speciesId]).toBe(true);
    expect(result.current.canMove).toBe(false);

    const before = useGameStore.getState().world.position;
    await act(async () => result.current.step('right'));
    expect(useGameStore.getState().world.position).toEqual(before);
  });
});

describe('useBattleVM', () => {
  const render = () => renderHookWithProviders(() => useBattleVM({ rng: constantRng(0.5), frameMs: 0 }));

  beforeEach(() => {
    useGameStore.getState().chooseStarter(4, 'charmander');
    useGameStore.getState().startEncounter({ speciesId: 1, level: 5 });
  });

  it('sets up both fighters and announces the wild Pokémon', async () => {
    const { result } = await render();
    await waitFor(() => expect(result.current.phase).toBe('choosing'));
    expect(result.current.names).toEqual({ player: 'Charmander', wild: 'Bulbasaur' });
    expect(result.current.message).toBe('A wild Bulbasaur appeared!');
    expect(result.current.player!.moves.map((m) => m.name)).toEqual(['Tackle', 'Ember']);
    expect(result.current.wildHp).toBe(result.current.wild!.maxHp);
  });

  it('catches the wild Pokémon on a win and levels up the partner', async () => {
    const { result } = await render();
    await waitFor(() => expect(result.current.phase).toBe('choosing'));
    for (let turn = 0; turn < 20 && result.current.phase !== 'ended'; turn++) {
      await act(async () => result.current.attack(1)); // Ember: super effective on grass
      await waitFor(() => expect(result.current.phase).not.toBe('animating'));
    }
    expect(result.current.status).toBe('won');
    expect(result.current.outcomeMessage).toBe('You caught Bulbasaur! Charmander grew to Lv 6.');
    const state = useGameStore.getState();
    expect(state.caught[1]).toMatchObject({ level: 5, timesCaught: 1 });
    expect(state.caught[4]!.level).toBe(6);
  });

  it('records the outcome only once', async () => {
    const { result } = await render();
    await waitFor(() => expect(result.current.phase).toBe('choosing'));
    for (let turn = 0; turn < 20 && result.current.phase !== 'ended'; turn++) {
      await act(async () => result.current.attack(1));
      await waitFor(() => expect(result.current.phase).not.toBe('animating'));
    }
    await act(async () => result.current.attack(1));
    expect(useGameStore.getState().caught[1]!.timesCaught).toBe(1);
    expect(useGameStore.getState().caught[4]!.level).toBe(6);
  });

  it('runs away without catching anything, and leaving clears the encounter', async () => {
    const { result } = await render();
    await waitFor(() => expect(result.current.phase).toBe('choosing'));
    await act(async () => result.current.run()); // Charmander is faster, so escape always works
    await waitFor(() => expect(result.current.phase).toBe('ended'));
    expect(result.current.status).toBe('fled');
    expect(result.current.message).toBe('Got away safely!');
    expect(useGameStore.getState().caught[1]).toBeUndefined();

    await act(async () => result.current.leave());
    expect(useGameStore.getState().encounter).toBeNull();
  });

  it('reports when there is no encounter to fight', async () => {
    useGameStore.getState().endEncounter();
    const { result } = await render();
    expect(result.current.hasEncounter).toBe(false);
    expect(result.current.phase).toBe('loading');
    // The partner's data still loads in the background; let it settle inside act.
    await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  });
});
