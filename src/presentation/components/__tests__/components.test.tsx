import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../Button';
import { PokemonCard } from '../PokemonCard';
import { SearchField } from '../SearchField';
import { StatBar } from '../StatBar';
import { ErrorState, MessageState } from '../StateViews';
import { TypeBadge } from '../TypeBadge';
import { TypeFilterBar } from '../TypeFilterBar';

describe('TypeBadge', () => {
  it('shows the formatted type name', async () => {
    await render(<TypeBadge type="electric" />);
    expect(screen.getByText('Electric')).toBeOnTheScreen();
  });

  it('is a selectable button when pressable', async () => {
    const onPress = jest.fn();
    await render(<TypeBadge type="fire" selected={false} onPress={onPress} />);
    const chip = screen.getByRole('button', { name: 'Fire type' });
    expect(chip).not.toBeSelected();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalled();
  });
});

describe('TypeFilterBar', () => {
  it('selects a type and clears it when tapped again', async () => {
    const onChange = jest.fn();
    const { rerender } = await render(<TypeFilterBar selected={null} onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'All types' })).toBeSelected();
    await fireEvent.press(screen.getByRole('button', { name: 'Water type' }));
    expect(onChange).toHaveBeenLastCalledWith('water');

    await rerender(<TypeFilterBar selected="water" onChange={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Water type' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });
});

describe('PokemonCard', () => {
  const props = { id: 25, name: 'pikachu', artworkUrl: 'https://example.com/25.png' };

  it('shows the number and formatted name, and reports presses with the id', async () => {
    const onPress = jest.fn();
    await render(<PokemonCard {...props} onPress={onPress} />);
    expect(screen.getByText('#0025')).toBeOnTheScreen();
    expect(screen.getByText('Pikachu')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Pikachu, #0025' }));
    expect(onPress).toHaveBeenCalledWith(25);
  });

  it('marks caught Pokémon visually and for screen readers', async () => {
    await render(<PokemonCard {...props} caught detail="Lv 7" />);
    expect(screen.getByTestId('caught-marker')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Pikachu, #0025, caught' })).toBeOnTheScreen();
    expect(screen.getByText('Lv 7')).toBeOnTheScreen();
  });
});

describe('StatBar', () => {
  it('fills in proportion to the value', async () => {
    await render(<StatBar label="Speed" value={51} max={255} />);
    expect(screen.getByLabelText('Speed 51')).toBeOnTheScreen();
    expect(screen.getByTestId('stat-fill')).toHaveStyle({ width: '20%' });
  });

  it('never overflows the track', async () => {
    await render(<StatBar label="HP" value={999} />);
    expect(screen.getByTestId('stat-fill')).toHaveStyle({ width: '100%' });
  });
});

describe('SearchField', () => {
  it('reports typing and offers a clear button only when there is text', async () => {
    const onChange = jest.fn();
    const { rerender } = await render(<SearchField value="" onChangeText={onChange} />);
    expect(screen.queryByRole('button', { name: 'Clear search' })).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Search Pokémon'), 'pika');
    expect(onChange).toHaveBeenCalledWith('pika');

    await rerender(<SearchField value="pika" onChangeText={onChange} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChange).toHaveBeenLastCalledWith('');
  });
});

describe('Button', () => {
  it('does not fire when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Make partner" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Make partner' });
    expect(button).toBeDisabled();
    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('state views', () => {
  it('ErrorState offers a retry', async () => {
    const onRetry = jest.fn();
    await render(<ErrorState message="Check your connection." onRetry={onRetry} />);
    expect(screen.getByText("Couldn't load Pokémon")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('MessageState hides the action when there is no handler', async () => {
    await render(<MessageState title="Empty" message="Nothing here." actionLabel="Go" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

