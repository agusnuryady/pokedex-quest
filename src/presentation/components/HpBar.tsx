import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme';
import { AppText } from './AppText';

export const hpColor = (ratio: number): string =>
  ratio > 0.5 ? palette.moss : ratio > 0.2 ? palette.pollen : palette.berry;

interface Props {
  hp: number;
  maxHp: number;
  showNumbers?: boolean;
}

/** HP bar that slides to its new value, changing colour as it drops. */
export function HpBar({ hp, maxHp, showNumbers = true }: Props) {
  const ratio = maxHp > 0 ? Math.min(1, Math.max(0, hp / maxHp)) : 0;
  const [width] = useState(() => new Animated.Value(ratio));

  useEffect(() => {
    Animated.timing(width, { toValue: ratio, duration: 450, useNativeDriver: false }).start();
  }, [ratio, width]);

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={`HP ${hp} of ${maxHp}`} accessibilityValue={{ min: 0, max: maxHp, now: hp }}>
      <View style={styles.track}>
        <Animated.View
          testID="hp-fill"
          style={[
            styles.fill,
            { backgroundColor: hpColor(ratio), width: width.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
      {showNumbers ? <AppText variant="number" style={styles.numbers}>{`${hp} / ${maxHp}`}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 10, borderRadius: radius.pill, backgroundColor: palette.fog, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
  numbers: { marginTop: spacing.xs, textAlign: 'right' },
});
