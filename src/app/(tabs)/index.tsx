import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import {
  AppText, DPad, ErrorState, LoadingState, MapGrid, Screen, StarterPicker,
} from '@/presentation/components';
import { useKeyboardControls } from '@/presentation/hooks/useKeyboardControls';
import { usePlayVM } from '@/presentation/hooks/usePlayVM';
import { useStarterVM } from '@/presentation/hooks/useStarterVM';
import { useGameStore } from '@/state/gameStore';
import { formatName } from '@/shared/format';
import { palette, radius, spacing } from '@/shared/theme';

export default function PlayScreen() {
  const hasPartner = useGameStore((s) => s.partnerId !== null);
  return hasPartner ? <World /> : <ChooseStarter />;
}

function ChooseStarter() {
  const vm = useStarterVM();
  return (
    <Screen title="Choose your partner">
      {vm.status === 'loading' && <LoadingState label="Waking the starters" />}
      {vm.status === 'error' && <ErrorState message="Check your connection and try again." onRetry={vm.retry} />}
      {vm.status === 'ready' && <StarterPicker starters={vm.starters} onChoose={vm.choose} />}
    </Screen>
  );
}

const TARGET_TILE = 40;
const MAP_PADDING = spacing.sm;
const odd = (n: number) => (n % 2 === 0 ? n - 1 : n);
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Fit an odd number of square tiles into the space available, so the player sits exactly in the centre. */
function gridFor(width: number, height: number) {
  const cols = odd(clamp(Math.floor(width / TARGET_TILE), 9, 15));
  const tileSize = Math.floor(width / cols);
  const rows = odd(clamp(Math.floor(height / tileSize), 7, 21));
  return { cols, rows, tileSize };
}

function World() {
  const [area, setArea] = useState({ width: 360, height: 440 });
  const { cols, rows, tileSize } = gridFor(area.width, area.height);
  const openBattle = useCallback(() => router.push('/battle'), []);
  const vm = usePlayVM({ cols, rows, onEncounter: openBattle });
  useKeyboardControls(vm.step, vm.canMove);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width - MAP_PADDING * 2;
    const height = e.nativeEvent.layout.height;
    if (Math.abs(width - area.width) > 1 || Math.abs(height - area.height) > 1) setArea({ width, height });
  };

  return (
    <Screen>
      <View style={styles.hud}>
        {vm.partner ? (
          <View style={styles.partnerChip}>
            <AppText variant="subtitle">{formatName(vm.partner.name)}</AppText>
            <AppText variant="number" color={palette.ink}>{`Lv ${vm.partner.level}`}</AppText>
          </View>
        ) : null}
        <AppText variant="caption" style={styles.tile} numberOfLines={1}>{vm.tileLabel}</AppText>
      </View>

      <View style={styles.mapArea} onLayout={onLayout}>
        <MapGrid
          viewport={vm.viewport}
          tileSize={tileSize}
          player={vm.playerCell}
          facing={vm.facing}
          follower={vm.followerCell}
          partnerId={vm.partner?.speciesId ?? null}
        />
      </View>

      <View style={styles.controls}>
        <DPad onStep={vm.step} disabled={!vm.canMove} />
        <AppText variant="caption" style={styles.hint}>
          Walk into the dark tall grass to find wild Pokémon. On a keyboard, use the arrow keys or WASD.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hud: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  partnerChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: palette.pollen,
  },
  tile: { flex: 1 },
  mapArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: MAP_PADDING, maxWidth: 640, width: '100%', alignSelf: 'center' },
  controls: { alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  hint: { textAlign: 'center', maxWidth: 320 },
});
