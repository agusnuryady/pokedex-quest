import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Direction } from '@/domain/map/movement';
import { palette, radius } from '@/shared/theme';
import { AppText } from './AppText';

export const HOLD_REPEAT_MS = 170;

interface Props {
  onStep: (direction: Direction) => void;
  disabled?: boolean;
}

const ARROWS: Record<Direction, string> = { up: '▲', down: '▼', left: '◀', right: '▶' };

/** Tap to take one step, hold to keep walking. */
export function DPad({ onStep, disabled }: Props) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);
  useEffect(() => {
    if (disabled) stop();
  }, [disabled]);

  const button = (direction: Direction) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Move ${direction}`}
      disabled={disabled}
      onPressIn={() => {
        onStep(direction);
        stop();
        timer.current = setInterval(() => onStep(direction), HOLD_REPEAT_MS);
      }}
      onPressOut={stop}
      style={({ pressed }) => [styles.key, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <AppText variant="subtitle" color={palette.white}>{ARROWS[direction]}</AppText>
    </Pressable>
  );

  return (
    <View style={styles.pad}>
      <View style={styles.line}>{button('up')}</View>
      <View style={styles.line}>
        {button('left')}
        <View style={styles.hub} />
        {button('right')}
      </View>
      <View style={styles.line}>{button('down')}</View>
    </View>
  );
}

const KEY = 56;
const styles = StyleSheet.create({
  pad: { alignItems: 'center' },
  line: { flexDirection: 'row', alignItems: 'center' },
  key: {
    width: KEY,
    height: KEY,
    margin: 2,
    borderRadius: radius.card,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hub: { width: KEY, height: KEY, margin: 2, borderRadius: radius.pill, backgroundColor: palette.fog },
  pressed: { backgroundColor: palette.mossDeep },
  disabled: { opacity: 0.4 },
});
