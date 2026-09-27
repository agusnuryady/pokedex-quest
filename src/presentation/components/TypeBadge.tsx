import { Pressable, StyleSheet, View } from 'react-native';
import type { PokemonType } from '@/domain/models';
import { readableTextOn } from '@/shared/color';
import { formatName } from '@/shared/format';
import { palette, radius, spacing, typeColors } from '@/shared/theme';
import { AppText } from './AppText';

interface Props {
  type: PokemonType;
  /** Filter chips: unselected chips are outlined, selected ones are filled. */
  selected?: boolean;
  onPress?: () => void;
}

export function TypeBadge({ type, selected = true, onPress }: Props) {
  const color = typeColors[type];
  const filled = { backgroundColor: color, borderColor: color };
  const outlined = { backgroundColor: palette.white, borderColor: palette.fog };
  const content = (
    <View style={[styles.badge, selected ? filled : outlined]}>
      {!selected && <View style={[styles.dot, { backgroundColor: color }]} />}
      <AppText variant="caption" color={selected ? readableTextOn(color) : palette.ink} style={styles.label}>
        {formatName(type)}
      </AppText>
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }} accessibilityLabel={`${formatName(type)} type`}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: radius.pill },
  label: { fontWeight: '600' },
});
