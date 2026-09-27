import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { PokemonType } from '@/domain/models';
import { withAlpha } from '@/shared/color';
import { formatName } from '@/shared/format';
import { palette, radius, spacing, typeColors } from '@/shared/theme';
import { AppText } from './AppText';
import { TypeBadge } from './TypeBadge';

export interface StarterOption {
  id: number;
  name: string | null;
  types: PokemonType[];
  artworkUrl: string;
}

interface Props {
  starters: StarterOption[];
  onChoose: (id: number, name: string) => void;
}

export function StarterPicker({ starters, onChoose }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <AppText variant="body" color={palette.inkSoft} style={styles.intro}>
        Choose a partner to explore with. It fights by your side and grows stronger with every catch.
      </AppText>
      <View style={styles.grid}>
        {starters.map((s) => {
          const name = s.name ? formatName(s.name) : '';
          const tint = typeColors[s.types[0] ?? 'normal'];
          return (
            <Pressable
              key={s.id}
              disabled={!s.name}
              onPress={() => s.name && onChoose(s.id, s.name)}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${name}`}
              style={({ pressed }) => [styles.card, { backgroundColor: withAlpha(tint, 0.16) }, pressed && { borderColor: tint }]}
            >
              <Image source={s.artworkUrl} style={styles.art} contentFit="contain" />
              <AppText variant="title">{name}</AppText>
              <View style={styles.types}>{s.types.map((t) => <TypeBadge key={t} type={t} />)}</View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  intro: { maxWidth: 520, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    flexGrow: 1,
    flexBasis: 200,
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  art: { width: 140, height: 140 },
  types: { flexDirection: 'row', gap: spacing.sm },
});
