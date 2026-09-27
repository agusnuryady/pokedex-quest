import { Image } from 'expo-image';
import { Redirect, router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Combatant, Move } from '@/domain/battle/combatant';
import { AppText, Button, ErrorState, HpBar, LoadingState, TypeBadge } from '@/presentation/components';
import { useBattleVM } from '@/presentation/hooks/useBattleVM';
import { useGameStore } from '@/state/gameStore';
import { readableTextOn } from '@/shared/color';
import { formatName } from '@/shared/format';
import { palette, radius, spacing, typeColors } from '@/shared/theme';

export default function BattleScreen() {
  // A battle can only be opened from a real encounter, never by typing the URL.
  const [startedWithoutEncounter] = useState(() => useGameStore.getState().encounter === null);
  const vm = useBattleVM();
  const navigation = useNavigation();

  // Leaving by the back button or gesture counts as running away, so the map never gets stuck.
  useEffect(() => navigation.addListener('beforeRemove', () => useGameStore.getState().endEncounter()), [navigation]);

  if (startedWithoutEncounter) return <Redirect href="/" />;

  const backToMap = () => router.back();
  const viewCatch = () => {
    const id = vm.wild?.speciesId;
    router.back();
    if (id) router.push({ pathname: '/pokemon/[id]', params: { id: String(id) } });
  };

  if (vm.phase === 'error') {
    return (
      <SafeAreaView style={styles.page}>
        <ErrorState message="The wild Pokémon slipped away while loading. Check your connection." onRetry={vm.retry} />
        <View style={styles.footer}><Button label="Back to the map" variant="secondary" onPress={backToMap} /></View>
      </SafeAreaView>
    );
  }
  if (vm.phase === 'loading' || !vm.player || !vm.wild) {
    return <SafeAreaView style={styles.page}><LoadingState label="Something is rustling in the grass" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.column}>
        <View style={styles.arena}>
          <View style={styles.sideTop}>
            <InfoCard fighter={vm.wild} name={`Wild ${vm.names.wild}`} hp={vm.wildHp} />
            <Image source={vm.wild.artworkUrl} style={styles.art} contentFit="contain" accessibilityLabel={vm.names.wild} />
          </View>
          <View style={styles.sideBottom}>
            <Image source={vm.player.artworkUrl} style={styles.art} contentFit="contain" accessibilityLabel={vm.names.player} />
            <InfoCard fighter={vm.player} name={vm.names.player} hp={vm.playerHp} />
          </View>
        </View>

        <View style={styles.messageBox} accessibilityLiveRegion="polite">
          <AppText variant="subtitle">{vm.message}</AppText>
        </View>

        {vm.phase === 'ended' ? (
          <View style={styles.actions}>
            {vm.status === 'won' ? <Button label={`See ${vm.names.wild}`} onPress={viewCatch} /> : null}
            <Button label="Back to the map" variant={vm.status === 'won' ? 'secondary' : 'primary'} onPress={backToMap} />
          </View>
        ) : (
          <View style={styles.actions}>
            <View style={styles.moves}>
              {vm.player.moves.map((move, i) => (
                <MoveButton key={move.name} move={move} disabled={vm.phase !== 'choosing'} onPress={() => vm.attack(i)} />
              ))}
            </View>
            <Button label="Run" variant="danger" disabled={vm.phase !== 'choosing'} onPress={vm.run} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function InfoCard({ fighter, name, hp }: { fighter: Combatant; name: string; hp: number }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <AppText variant="subtitle" numberOfLines={1} style={styles.flex}>{name}</AppText>
        <AppText variant="number" color={palette.ink}>{`Lv ${fighter.level}`}</AppText>
      </View>
      <View style={styles.cardTypes}>{fighter.types.map((t) => <TypeBadge key={t} type={t} />)}</View>
      <HpBar hp={hp} maxHp={fighter.maxHp} />
    </View>
  );
}

function MoveButton({ move, disabled, onPress }: { move: Move; disabled: boolean; onPress: () => void }) {
  const color = typeColors[move.type];
  const text = readableTextOn(color);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${move.name}, ${formatName(move.type)} type, power ${move.power}`}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.move, { backgroundColor: color }, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <AppText variant="subtitle" color={text}>{move.name}</AppText>
      <AppText variant="caption" color={text}>{`${formatName(move.type)}, power ${move.power}`}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.paper },
  column: { flex: 1, width: '100%', maxWidth: 560, alignSelf: 'center', padding: spacing.lg, gap: spacing.lg },
  flex: { flex: 1 },
  arena: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: '#DCEBD2',
    borderWidth: 2,
    borderColor: palette.ink,
  },
  sideTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sideBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  art: { width: 120, height: 120 },
  card: {
    flex: 1,
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.fog,
  },
  cardTitle: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  cardTypes: { flexDirection: 'row', gap: spacing.xs },
  messageBox: {
    minHeight: 64,
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: palette.white,
    borderWidth: 2,
    borderColor: palette.ink,
  },
  actions: { gap: spacing.md },
  moves: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  move: { flexGrow: 1, flexBasis: 140, padding: spacing.md, borderRadius: radius.card, gap: 2 },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  footer: { padding: spacing.lg },
});
