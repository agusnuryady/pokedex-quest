import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { POKEMON_TYPES, type PokemonType } from '@/domain/models';
import { palette, radius, spacing } from '@/shared/theme';
import { AppText } from './AppText';
import { TypeBadge } from './TypeBadge';

interface Props {
  selected: PokemonType | null;
  onChange: (type: PokemonType | null) => void;
}

/** Horizontal type chips. Tapping the active chip clears the filter. */
export function TypeFilterBar({ selected, onChange }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <Pressable onPress={() => onChange(null)} accessibilityRole="button" accessibilityState={{ selected: selected === null }} accessibilityLabel="All types">
        <View style={[styles.all, selected === null && styles.allSelected]}>
          <AppText variant="caption" color={selected === null ? palette.white : palette.ink} style={styles.allLabel}>
            All types
          </AppText>
        </View>
      </Pressable>
      {POKEMON_TYPES.map((type) => (
        <TypeBadge key={type} type={type} selected={selected === type} onPress={() => onChange(selected === type ? null : type)} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.xs },
  all: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.fog,
    backgroundColor: palette.white,
  },
  allSelected: { backgroundColor: palette.ink, borderColor: palette.ink },
  allLabel: { fontWeight: '600' },
});
