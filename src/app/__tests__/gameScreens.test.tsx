import { router } from 'expo-router';
import { act, fireEvent, screen, waitFor } from 'expo-router/testing-library';
import { InMemoryPokemonRepository } from '@/data/repositories/InMemoryPokemonRepository';
import { isWalkable, tileAt, type Position } from '@/domain/map/terrain';
import { DEFAULT_WORLD_SEED, useGameStore } from '@/state/gameStore';
import { getPathname, renderApp } from '@/test-utils/router';

// A fixed "random" source: every tall-grass step finds a Pokémon, and every roll is predictable.
jest.mock('@/shared/sessionRng', () => ({ sessionRng: () => 0 }));

const SEED = DEFAULT_WORLD_SEED;
const place = (position: Position) =>
  useGameStore.setState({ world: { seed: SEED, position, stepsSinceLastEncounter: 10 } });

/** A walkable tile whose right-hand neighbour matches. */
function findStart(predicate: (tile: ReturnType<typeof tileAt>) => boolean): Position {
  for (let x = -100; x < 100; x++)
    for (let y = -100; y < 100; y++)
      if (isWalkable(tileAt(x, y, SEED)) && predicate(tileAt(x + 1, y, SEED))) return { x, y };
  throw new Error('no start found');
}

const tap = async (label: string) => {
  const button = screen.getByRole('button', { name: label });
  await fireEvent(button, 'pressIn');
  await fireEvent(button, 'pressOut');
};

beforeEach(() => {
  jest.useFakeTimers();
  useGameStore.getState().resetGame();
});
afterEach(() => jest.useRealTimers());

describe('Play screen', () => {
  it('asks a new player to choose a partner, then shows the map', async () => {
    await renderApp('/');
    expect(screen.getByText('Choose your partner')).toBeOnTheScreen();
    // The starter cards appear once their data loads.
    await waitFor(() => expect(screen.getByRole('button', { name: 'Choose Squirtle' })).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Choose Squirtle' }));

    await waitFor(() => expect(screen.getByTestId('map-grid')).toBeOnTheScreen());
    expect(screen.getByText('Squirtle')).toBeOnTheScreen();
    expect(screen.getByText('Lv 5')).toBeOnTheScreen();
    expect(screen.getByTestId('player-token')).toBeOnTheScreen();
    for (const d of ['up', 'down', 'left', 'right']) expect(screen.getByRole('button', { name: `Move ${d}` })).toBeOnTheScreen();
  });

  it('walks when a D-pad button is tapped', async () => {
    useGameStore.getState().chooseStarter(7, 'squirtle');
    const start = findStart((t) => t === 'grass' || t === 'path');
    place(start);
    await renderApp('/');
    await tap('Move right');
    expect(useGameStore.getState().world.position).toEqual({ x: start.x + 1, y: start.y });
  });

  it('describes the ground underfoot', async () => {
    useGameStore.getState().chooseStarter(7, 'squirtle');
    const beside = findStart((t) => t === 'tallGrass');
    useGameStore.setState({ world: { seed: SEED, position: { x: beside.x + 1, y: beside.y }, stepsSinceLastEncounter: 0 } });
    await renderApp('/');
    expect(screen.getByText('Tall grass. Wild Pokémon hide here.')).toBeOnTheScreen();
  });
});

describe('Encounter and battle', () => {
  const enterBattle = async () => {
    useGameStore.getState().chooseStarter(4, 'charmander');
    place(findStart((t) => t === 'tallGrass'));
    await renderApp('/');
    await tap('Move right');
    await waitFor(() => expect(getPathname()).toBe('/battle'));
    await waitFor(() => expect(screen.getByText('A wild Bulbasaur appeared!')).toBeOnTheScreen());
  };

  it('opens a battle when a wild Pokémon appears in tall grass', async () => {
    await enterBattle();
    expect(screen.getByText('Wild Bulbasaur')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ember, Fire type, power 60' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tackle, Normal type, power 40' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Run' })).toBeOnTheScreen();
    expect(screen.getAllByRole('progressbar').length).toBe(2);
    expect(useGameStore.getState().seen[1]).toBe(true);
  });

  it('plays a turn with messages, locking the buttons until it finishes', async () => {
    await enterBattle();
    await fireEvent.press(screen.getByRole('button', { name: 'Ember, Fire type, power 60' }));
    await waitFor(() => expect(screen.getByText('Charmander used Ember!')).toBeOnTheScreen());
    expect(screen.getByRole('button', { name: 'Run' })).toBeDisabled();
    await act(async () => jest.advanceTimersByTime(900));
    expect(screen.getByText("It's super effective!")).toBeOnTheScreen();
  });

  it('catches the wild Pokémon after winning, then returns to the map', async () => {
    await enterBattle();
    for (let turn = 0; turn < 15 && !screen.queryByText(/You caught/); turn++) {
      await waitFor(() => expect(screen.getByRole('button', { name: 'Run' })).toBeEnabled());
      await fireEvent.press(screen.getByRole('button', { name: 'Ember, Fire type, power 60' }));
      await act(async () => jest.advanceTimersByTime(5000));
    }
    expect(screen.getByText('You caught Bulbasaur! Charmander grew to Lv 6.')).toBeOnTheScreen();
    expect(useGameStore.getState().caught[1]).toBeDefined();

    await fireEvent.press(screen.getByRole('button', { name: 'Back to the map' }));
    await waitFor(() => expect(getPathname()).toBe('/'));
    expect(useGameStore.getState().encounter).toBeNull();
    expect(screen.getByText('Lv 6')).toBeOnTheScreen();
  });

  it('offers to open the caught Pokémon’s page', async () => {
    await enterBattle();
    for (let turn = 0; turn < 15 && !screen.queryByText(/You caught/); turn++) {
      await waitFor(() => expect(screen.getByRole('button', { name: 'Run' })).toBeEnabled());
      await fireEvent.press(screen.getByRole('button', { name: 'Ember, Fire type, power 60' }));
      await act(async () => jest.advanceTimersByTime(5000));
    }
    await fireEvent.press(screen.getByRole('button', { name: 'See Bulbasaur' }));
    await waitFor(() => expect(getPathname()).toBe('/pokemon/1'));
    await waitFor(() => expect(screen.getByText('In your collection')).toBeOnTheScreen());
  });

  it('shows an error with a way back if the Pokémon fail to load', async () => {
    const offline = new InMemoryPokemonRepository();
    offline.getPokemon = () => Promise.reject(new Error('offline'));
    useGameStore.getState().chooseStarter(4, 'charmander');
    await renderApp('/', offline);
    await act(async () => {
      useGameStore.getState().startEncounter({ speciesId: 16, level: 3 });
      router.push('/battle');
    });
    await waitFor(() => expect(screen.getByText("Couldn't load Pokémon")).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Back to the map' }));
    await waitFor(() => expect(getPathname()).toBe('/'));
    expect(useGameStore.getState().encounter).toBeNull();
  });

  it('runs away without catching anything', async () => {
    await enterBattle();
    await fireEvent.press(screen.getByRole('button', { name: 'Run' }));
    await waitFor(() => expect(screen.getByText('Got away safely!')).toBeOnTheScreen());
    await act(async () => jest.advanceTimersByTime(1000));
    await fireEvent.press(screen.getByRole('button', { name: 'Back to the map' }));
    await waitFor(() => expect(getPathname()).toBe('/'));
    expect(useGameStore.getState().caught[1]).toBeUndefined();
  });

  it('sends a typed-in /battle URL back to the map', async () => {
    useGameStore.getState().chooseStarter(4, 'charmander');
    await renderApp('/battle');
    await waitFor(() => expect(getPathname()).toBe('/'));
    expect(screen.getByTestId('map-grid')).toBeOnTheScreen();
  });
});
