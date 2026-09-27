import { StyleSheet, View } from 'react-native';
import { palette, radius, spacing } from '@/shared/theme';
import { AppText } from './AppText';

interface Props {
  label: string;
  value: number;
  /** The highest base stat in the games is 255. */
  max?: number;
  color?: string;
}

export function StatBar({ label, value, max = 255, color = palette.moss }: Props) {
  const ratio = Math.min(1, Math.max(0, value / max));
  return (
    <View style={styles.row} accessible accessibilityLabel={`${label} ${value}`}>
      <AppText variant="caption" style={styles.label}>{label}</AppText>
      <AppText variant="number" style={styles.value}>{value}</AppText>
      <View style={styles.track}>
        <View testID="stat-fill" style={[styles.fill, { width: `${ratio * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  label: { width: 64 },
  value: { width: 32, textAlign: 'right', color: palette.ink },
  track: { flex: 1, height: 8, borderRadius: radius.pill, backgroundColor: palette.fog, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
