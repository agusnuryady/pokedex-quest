import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import type { Direction } from '@/domain/map/movement';

export const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  W: 'up', S: 'down', A: 'left', D: 'right',
};

/** Arrow keys and WASD on web, only while this screen is in front. Holding a key repeats natively. */
export function useKeyboardControls(onStep: (direction: Direction) => void, enabled: boolean) {
  const focused = useIsFocused();
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled || !focused) return;
    const handler = (event: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[event.key];
      if (!direction) return;
      event.preventDefault(); // stop arrow keys scrolling the page
      onStep(direction);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onStep, enabled, focused]);
}
