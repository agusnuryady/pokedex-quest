import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { renderRouter } from 'expo-router/testing-library';
import { useGameStore } from '@/state/gameStore';
import GlossaryScreen from '../(tabs)/glossary';
import TabsLayout from '../(tabs)/_layout';
import RootLayout, { ErrorBoundary } from '../_layout';

describe('Root layout', () => {
  beforeEach(() => useGameStore.getState().resetGame());

  it('renders the app once saved progress and fonts have loaded', async () => {
    await renderRouter(
      { _layout: RootLayout, '(tabs)/_layout': TabsLayout, '(tabs)/index': () => null, '(tabs)/collection': () => null, '(tabs)/glossary': GlossaryScreen },
      { initialUrl: '/glossary' },
    );
    await waitFor(() => expect(screen.getByRole('header', { name: 'Glossary' })).toBeOnTheScreen());
  });
});

describe('ErrorBoundary', () => {
  it('replaces a crashed screen with a message and a Reload button', async () => {
    const retry = jest.fn().mockResolvedValue(undefined);
    await render(<ErrorBoundary error={new Error('boom')} retry={retry} />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText('The app hit an unexpected error. Your progress is saved.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Reload' }));
    expect(retry).toHaveBeenCalled();
  });
});
