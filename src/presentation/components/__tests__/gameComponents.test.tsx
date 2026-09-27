import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { getViewport } from '@/domain/map/terrain';
import { palette } from '@/shared/theme';
import { CONFIRM_WINDOW_MS, ConfirmButton } from '../ConfirmButton';
import { DPad, HOLD_REPEAT_MS } from '../DPad';
import { HpBar, hpColor } from '../HpBar';
import { MapGrid } from '../MapGrid';
import { StarterPicker } from '../StarterPicker';

describe('hpColor', () => {
  it('goes from moss to pollen to berry as HP drops', () => {
    expect(hpColor(1)).toBe(palette.moss);
    expect(hpColor(0.4)).toBe(palette.pollen);
    expect(hpColor(0.1)).toBe(palette.berry);
  });
});

describe('HpBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('exposes HP to screen readers and shows the numbers', async () => {
    await render(<HpBar hp={12} maxHp={40} />);
    await act(async () => jest.advanceTimersByTime(600)); // let the slide animation finish
    expect(screen.getByRole('progressbar', { name: 'HP 12 of 40' })).toBeOnTheScreen();
    expect(screen.getByText('12 / 40')).toBeOnTheScreen();
  });
});

describe('DPad', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('steps once on tap', async () => {
    const onStep = jest.fn();
    await render(<DPad onStep={onStep} />);
    const up = screen.getByRole('button', { name: 'Move up' });
    await fireEvent(up, 'pressIn');
    await fireEvent(up, 'pressOut');
    expect(onStep).toHaveBeenCalledTimes(1);
    expect(onStep).toHaveBeenCalledWith('up');
  });

  it('keeps walking while held and stops on release', async () => {
    const onStep = jest.fn();
    await render(<DPad onStep={onStep} />);
    const right = screen.getByRole('button', { name: 'Move right' });
    await fireEvent(right, 'pressIn');
    await act(async () => jest.advanceTimersByTime(HOLD_REPEAT_MS * 3));
    expect(onStep).toHaveBeenCalledTimes(4);
    await fireEvent(right, 'pressOut');
    await act(async () => jest.advanceTimersByTime(HOLD_REPEAT_MS * 3));
    expect(onStep).toHaveBeenCalledTimes(4);
  });

  it('is disabled during a battle', async () => {
    await render(<DPad onStep={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Move left' })).toBeDisabled();
  });
});

describe('MapGrid', () => {
  it('draws the player and, once it has moved, the partner', async () => {
    const viewport = getViewport({ x: 0, y: 0 }, 9, 11, 1);
    const props = { viewport, tileSize: 32, player: { col: 4, row: 5 }, facing: 'down' as const, partnerId: 7 };
    const { rerender } = await render(<MapGrid {...props} follower={null} />);
    expect(screen.getByTestId('player-token')).toHaveStyle({ left: 128, top: 160 });
    expect(screen.queryByLabelText('Your partner')).toBeNull();

    await rerender(<MapGrid {...props} follower={{ col: 3, row: 5 }} />);
    expect(screen.getByLabelText('Your partner')).toBeOnTheScreen();
    expect(screen.getByTestId('map-grid')).toHaveStyle({ width: 288, height: 352 });
  });
});

describe('StarterPicker', () => {
  it('chooses a starter by id and name', async () => {
    const onChoose = jest.fn();
    const starters = [
      { id: 1, name: 'bulbasaur', types: ['grass' as const, 'poison' as const], artworkUrl: '' },
      { id: 4, name: 'charmander', types: ['fire' as const], artworkUrl: '' },
    ];
    await render(<StarterPicker starters={starters} onChoose={onChoose} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Choose Charmander' }));
    expect(onChoose).toHaveBeenCalledWith(4, 'charmander');
  });
});

describe('ConfirmButton', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('asks for a second tap before acting', async () => {
    const onConfirm = jest.fn();
    await render(<ConfirmButton label="Start over" confirmLabel="Tap again to erase" onConfirm={onConfirm} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Start over' }));
    expect(onConfirm).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByRole('button', { name: 'Tap again to erase' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Start over' })).toBeOnTheScreen();
  });

  it('disarms itself if the second tap never comes', async () => {
    const onConfirm = jest.fn();
    await render(<ConfirmButton label="Start over" confirmLabel="Tap again to erase" onConfirm={onConfirm} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Start over' }));
    await act(async () => jest.advanceTimersByTime(CONFIRM_WINDOW_MS + 10));
    await fireEvent.press(screen.getByRole('button', { name: 'Start over' }));
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
