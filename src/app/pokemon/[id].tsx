import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  AppText, Button, ErrorState, LoadingState, StatBar, TypeBadge,
} from '@/presentation/components';
import { CONTENT_MAX_WIDTH } from '@/presentation/components/Screen';
import { usePokemonDetailVM } from '@/presentation/hooks/usePokemonDetailVM';
import { withAlpha } from '@/shared/color';
import { formatDexNumber, formatHeight, formatName, formatWeight } from '@/shared/format';
import { palette, radius, spacing, typeColors } from '@/shared/theme';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = usePokemonDetailVM(Number(id));
  const { pokemon, species } = vm;

  if (vm.status === 'loading') return <LoadingState label="Looking it up" />;
  if (vm.status === 'error' || !pokemon) return <ErrorState message={vm.errorMessage} onRetry={vm.retry} />;

  const tint = typeColors[pokemon.types[0] ?? 'normal'];
  const name = formatName(pokemon.name);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: name }} />

      <View style={[styles.hero, { backgroundColor: withAlpha(tint, 0.18) }]}>
        <Image source={pokemon.artworkUrl} style={styles.art} contentFit="contain" transition={200} accessibilityLabel={`${name} artwork`} />
        <AppText variant="number">{formatDexNumber(pokemon.id)}</AppText>
        <AppText variant="display" accessibilityRole="header">{name}</AppText>
        {species?.genus ? <AppText variant="body" color={palette.inkSoft}>{species.genus}</AppText> : null}
        <View style={styles.types}>
          {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
        </View>
      </View>

      <View style={styles.section}>
        <ProgressBlock vm={vm} name={name} />
      </View>

      {species?.flavorText ? (
        <View style={styles.section}>
          <AppText variant="title">Field notes</AppText>
          <AppText variant="body" style={styles.flavor}>{species.flavorText}</AppText>
        </View>
      ) : null}

      <View style={[styles.section, styles.facts]}>
        <Fact label="Height" value={formatHeight(pokemon.heightM)} />
        <Fact label="Weight" value={formatWeight(pokemon.weightKg)} />
        <Fact
          label="Abilities"
          value={pokemon.abilities.map((a) => `${formatName(a.name)}${a.isHidden ? ' (hidden)' : ''}`).join(', ') || 'Unknown'}
          wide
        />
      </View>

      <View style={styles.section}>
        <AppText variant="title">Base stats</AppText>
        <View style={styles.stats}>
          {vm.stats.map((s) => <StatBar key={s.key} label={s.label} value={s.value} />)}
        </View>
        <AppText variant="caption">{`Total ${vm.totalStats}`}</AppText>
      </View>
    </ScrollView>
  );
}

function ProgressBlock({ vm, name }: { vm: ReturnType<typeof usePokemonDetailVM>; name: string }) {
  if (vm.caught) {
    const times = vm.caught.timesCaught > 1 ? `, caught ${vm.caught.timesCaught} times` : '';
    return (
      <View style={styles.progress}>
        <View style={styles.progressText}>
          <AppText variant="subtitle">{vm.isPartner ? 'Your partner' : 'In your collection'}</AppText>
          <AppText variant="caption">{`Lv ${vm.caught.level}${times}`}</AppText>
        </View>
        {vm.canMakePartner ? <Button label="Make partner" variant="secondary" onPress={vm.makePartner} /> : null}
      </View>
    );
  }
  return (
    <View style={styles.progressText}>
      <AppText variant="subtitle">Not caught yet</AppText>
      <AppText variant="caption">
        {vm.appearsInWild
          ? `Walk through tall grass in Play to find ${name}.`
          : `${name} doesn't appear in Play. Only the first 151 Pokémon live in the wild.`}
      </AppText>
    </View>
  );
}

function Fact({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={[styles.fact, wide && styles.factWide]}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="subtitle">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.paper },
  content: { width: '100%', maxWidth: CONTENT_MAX_WIDTH / 1.4, alignSelf: 'center', paddingBottom: spacing.xxl },
  hero: { alignItems: 'center', padding: spacing.xl, margin: spacing.lg, borderRadius: radius.card, gap: spacing.xs },
  art: { width: 220, height: 220 },
  types: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  section: { marginHorizontal: spacing.lg, marginBottom: spacing.xl, gap: spacing.sm },
  flavor: { maxWidth: 640 },
  facts: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  fact: { minWidth: 100, gap: spacing.xs },
  factWide: { flexBasis: '100%' },
  stats: { gap: spacing.xs },
  progress: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, flexWrap: 'wrap' },
  progressText: { flex: 1, gap: spacing.xs, minWidth: 180 },
});
