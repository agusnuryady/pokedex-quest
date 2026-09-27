import { fireEvent, screen, waitFor } from 'expo-router/testing-library';
import { useGameStore } from '@/state/gameStore';
import { getPathname, renderApp } from '@/test-utils/router';

beforeEach(() => useGameStore.getState().resetGame());

describe('Tab bar', () => {
  it('shows the three tabs with labels and icons, highlighting the active one', async () => {
    await renderApp('/glossary');
    await waitFor(() => expect(screen.getByText('Pikachu')).toBeOnTheScreen());
    for (const label of ['Play', 'Collection', 'Glossary']) expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    expect(screen.getByTestId('tab-icon-glossary-active')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-icon-play-inactive')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-icon-collection-inactive')).toBeOnTheScreen();
  });

  it('switches tabs when tapped', async () => {
    await renderApp('/glossary');
    await waitFor(() => expect(screen.getByText('Pikachu')).toBeOnTheScreen());
    await fireEvent.press(screen.getByRole('button', { name: /Collection/ }));
    await waitFor(() => expect(getPathname()).toBe('/collection'));
    expect(screen.getByText('No Pokémon yet')).toBeOnTheScreen();
    expect(screen.getByTestId('tab-icon-collection-active')).toBeOnTheScreen();
  });
});
