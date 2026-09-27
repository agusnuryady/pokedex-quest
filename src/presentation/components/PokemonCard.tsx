import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { formatDexNumber, formatName } from '@/shared/format';
import { palette, radius, spacing } from '@/shared/theme';
import { AppText } from './AppText';

interface Props {
  id: number;
  name: string;
  artworkUrl: string;
  /** Extra line under the name, e.g. "Lv 12". */
  detail?: string;
  caught?: boolean;
  onPress?: (id: number) => void;
}

/** Grid cell shared by the Glossary and the Collection. Memoised because lists render hundreds. */
export const PokemonCard = memo(function PokemonCard({ id, name, artworkUrl, detail, caught, onPress }: Props) {
  const label = `${formatName(name)}, ${formatDexNumber(id)}${caught ? ', caught' : ''}`;
  return (
    <Pressable
      onPress={() => onPress?.(id)}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <AppText variant="number">{formatDexNumber(id)}</AppText>
        {caught && <View style={styles.caught} testID="caught-marker" />}
      </View>
      <Image source={artworkUrl} style={styles.art} contentFit="contain" transition={150} recyclingKey={String(id)} accessibilityIgnoresInvertColors />
      <AppText variant="subtitle" numberOfLines={1}>{formatName(name)}</AppText>
      {detail ? <AppText variant="caption">{detail}</AppText> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.fog,
  },
  pressed: { borderColor: palette.moss },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  caught: { width: 10, height: 10, borderRadius: radius.pill, backgroundColor: palette.moss },
  art: { width: '100%', aspectRatio: 1, marginVertical: spacing.sm },
});
