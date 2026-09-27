import { renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import { KEY_TO_DIRECTION, useKeyboardControls } from '../useKeyboardControls';

let mockFocused = true;
jest.mock('expo-router', () => ({ useIsFocused: () => mockFocused }));

type Handler = (event: { key: string; preventDefault: () => void }) => void;
let handlers: Handler[] = [];
const press = (key: string) => {
  const preventDefault = jest.fn();
  handlers.forEach((h) => h({ key, preventDefault }));
  return preventDefault;
};

const originalOS = Platform.OS;
beforeEach(() => {
  handlers = [];
  mockFocused = true;
  Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  (globalThis as unknown as { window: object }).window = globalThis;
  Object.assign(globalThis, {
    addEventListener: jest.fn((_type: string, h: Handler) => handlers.push(h)),
    removeEventListener: jest.fn((_type: string, h: Handler) => (handlers = handlers.filter((x) => x !== h))),
  });
});
afterEach(() => Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true }));

describe('useKeyboardControls', () => {
  it('maps arrow keys and WASD in either case', () => {
    expect([KEY_TO_DIRECTION.ArrowUp, KEY_TO_DIRECTION.a, KEY_TO_DIRECTION.D]).toEqual(['up', 'left', 'right']);
  });

  it('steps on movement keys and stops the page scrolling', async () => {
    const onStep = jest.fn();
    await renderHook(() => useKeyboardControls(onStep, true));
    const prevented = press('ArrowLeft');
    expect(onStep).toHaveBeenCalledWith('left');
    expect(prevented).toHaveBeenCalled();
  });

  it('ignores other keys', async () => {
    const onStep = jest.fn();
    await renderHook(() => useKeyboardControls(onStep, true));
    expect(press('Enter')).not.toHaveBeenCalled();
    expect(onStep).not.toHaveBeenCalled();
  });

  it('does nothing while disabled, off-screen, or on native', async () => {
    const onStep = jest.fn();
    await renderHook(() => useKeyboardControls(onStep, false));
    mockFocused = false;
    await renderHook(() => useKeyboardControls(onStep, true));
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
    mockFocused = true;
    await renderHook(() => useKeyboardControls(onStep, true));
    press('ArrowUp');
    expect(onStep).not.toHaveBeenCalled();
  });

  it('removes its listener on unmount', async () => {
    const { unmount } = await renderHook(() => useKeyboardControls(jest.fn(), true));
    expect(handlers).toHaveLength(1);
    await unmount();
    expect(handlers).toHaveLength(0);
  });
});
