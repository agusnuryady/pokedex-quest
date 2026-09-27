import { fireEvent, screen, waitFor } from 'expo-router/testing-library';
import { useGameStore } from '@/state/gameStore';
import { getPathname, renderApp } from '@/test-utils/router';

beforeEach(() => useGameStore.getState().resetGame());

const openGlossary = async () => {
  await renderApp('/glossary');
  await waitFor(() => expect(screen.getByText('Pikachu')).toBeOnTheScreen());
};

describe('Glossary screen', () => {
  it('lists Pokémon with their numbers and the total count', async () => {
    await openGlossary();
    expect(screen.getByText('151 Pokémon')).toBeOnTheScreen();
    expect(screen.getByText('Bulbasaur')).toBeOnTheScreen();
    expect(screen.getByText('#0001')).toBeOnTheScreen();
  });

  it('narrows the list as you type', async () => {
    await openGlossary();
    await fireEvent.changeText(screen.getByLabelText('Search Pokémon'), 'pika');
    await waitFor(() => expect(screen.queryByText('Bulbasaur')).toBeNull());
    expect(screen.getByText('Pikachu')).toBeOnTheScreen();
    expect(screen.getByText('1 match')).toBeOnTheScreen();
  });

  it('shows an empty state for no matches, with a way back', async () => {
    await openGlossary();
    await fireEvent.changeText(screen.getByLabelText('Search Pokémon'), 'zzz');
    await waitFor(() => expect(screen.getByText('No Pokémon found')).toBeOnTheScreen());
    await fireEvent.press(screen.getAllByRole('button', { name: 'Clear search' }).at(-1)!);
    await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeOnTheScreen());
  });

  it('filters by type chip', async () => {
    await openGlossary();
    await fireEvent.press(screen.getByRole('button', { name: 'Fire type' }));
    // The Fire list loads first (a spinner shows meanwhile), so wait for the result itself.
    await waitFor(() => expect(screen.getByText('Charmander')).toBeOnTheScreen());
    expect(screen.queryByText('Pikachu')).toBeNull();
    expect(screen.getByText('1 match in Fire')).toBeOnTheScreen();
  });

  it('marks caught Pokémon in the list', async () => {
    useGameStore.getState().chooseStarter(1, 'bulbasaur');
    await openGlossary();
    expect(screen.getByRole('button', { name: 'Bulbasaur, #0001, caught' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Pikachu, #0025' })).toBeOnTheScreen();
  });

  it('opens a detail page when a card is tapped', async () => {
    await openGlossary();
    await fireEvent.press(screen.getByRole('button', { name: 'Pikachu, #0025' }));
    await waitFor(() => expect(getPathname()).toBe('/pokemon/25'));
    await waitFor(() => expect(screen.getByText('Base stats')).toBeOnTheScreen());
  });
});

describe('Pokémon detail screen', () => {
  it('shows stats, facts and types', async () => {
    await renderApp('/pokemon/25');
    await waitFor(() => expect(screen.getByText('Base stats')).toBeOnTheScreen());
    expect(screen.getAllByText('Pikachu').length).toBeGreaterThan(0);
    expect(screen.getByText('Electric')).toBeOnTheScreen();
    expect(screen.getByLabelText('Speed 90')).toBeOnTheScreen();
    expect(screen.getByText('Total 320')).toBeOnTheScreen();
    expect(screen.getByText('0.4 m')).toBeOnTheScreen();
    expect(screen.getByText('Static, Lightning Rod (hidden)')).toBeOnTheScreen();
  });

  it('tells the player how to catch one they do not have', async () => {
    await renderApp('/pokemon/25');
    await waitFor(() => expect(screen.getByText('Not caught yet')).toBeOnTheScreen());
    expect(screen.getByText('Walk through tall grass in Play to find Pikachu.')).toBeOnTheScreen();
  });

  it('lets the player switch partner from the detail page', async () => {
    useGameStore.getState().chooseStarter(1, 'bulbasaur');
    useGameStore.getState().recordCatch({ speciesId: 25, name: 'pikachu', level: 7 });
    await renderApp('/pokemon/25');
    await waitFor(() => expect(screen.getByText('In your collection')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: 'Make partner' }));
    await waitFor(() => expect(screen.getByText('Your partner')).toBeOnTheScreen());
    expect(screen.queryByRole('button', { name: 'Make partner' })).toBeNull();
    expect(useGameStore.getState().partnerId).toBe(25);
  });

  it('shows the field notes from species data', async () => {
    await renderApp('/pokemon/1');
    await waitFor(() => expect(screen.getByText('Field notes')).toBeOnTheScreen());
    expect(screen.getByText('Seed Pokémon')).toBeOnTheScreen();
    expect(screen.getByText('Carries a seed on its back since the day it hatched.')).toBeOnTheScreen();
  });
});

describe('Collection screen', () => {
  it('points a new player to Play', async () => {
    await renderApp('/collection');
    expect(screen.getByText('No Pokémon yet')).toBeOnTheScreen();
    expect(screen.getByText('0 caught, 0 seen')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Go to Play' }));
    await waitFor(() => expect(getPathname()).toBe('/'));
  });

  it('shows the partner card and caught Pokémon with levels', async () => {
    const store = useGameStore.getState();
    store.chooseStarter(7, 'squirtle');
    store.recordCatch({ speciesId: 25, name: 'pikachu', level: 6 });
    store.recordCatch({ speciesId: 25, name: 'pikachu', level: 6 });
    await renderApp('/collection');
    expect(screen.getByText('2 caught, 2 seen')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Partner: Squirtle, level 5' })).toBeOnTheScreen();
    expect(screen.getByText('Lv 6, caught 2 times')).toBeOnTheScreen();
  });

  it('starts over only after a second tap', async () => {
    useGameStore.getState().chooseStarter(4, 'charmander');
    await renderApp('/collection');
    await fireEvent.press(screen.getByRole('button', { name: 'Start over' }));
    expect(useGameStore.getState().partnerId).toBe(4);
    await fireEvent.press(screen.getByRole('button', { name: 'Tap again to erase all progress' }));
    await waitFor(() => expect(getPathname()).toBe('/'));
    expect(useGameStore.getState().partnerId).toBeNull();
    await waitFor(() => expect(screen.getByText('Choose your partner')).toBeOnTheScreen());
  });
});
