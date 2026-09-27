import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import type { Direction } from '@/domain/map/movement';
import type { TileKind, Viewport } from '@/domain/map/terrain';
import { config } from '@/shared/config';
import { palette, radius, tileColors } from '@/shared/theme';

interface Cell {
  col: number;
  row: number;
}

interface Props {
  viewport: Viewport;
  tileSize: number;
  player: Cell;
  facing: Direction;
  follower: Cell | null;
  partnerId: number | null;
}

/** Small details that make each terrain readable at a glance, without images. */
const Tile = memo(function Tile({ kind, size }: { kind: TileKind; size: number }) {
  const base = { width: size, height: size, backgroundColor: tileColors[kind] };
  switch (kind) {
    case 'tallGrass':
      return (
        <View style={[base, styles.center]}>
          <View style={[styles.blades, { width: size * 0.5, height: size * 0.35, borderColor: palette.mossDeep }]} />
        </View>
      );
    case 'tree':
      return (
        <View style={[base, styles.center]}>
          <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size, backgroundColor: '#3E7A45' }} />
        </View>
      );
    case 'water':
      return (
        <View style={[base, styles.center]}>
          <View style={{ width: size * 0.4, height: 2, borderRadius: 1, backgroundColor: '#8DB8E2' }} />
        </View>
      );
    default:
      return <View style={base} />;
  }
});

const Row = memo(
  function Row({ tiles, size }: { tiles: TileKind[]; size: number; rowKey: string }) {
    return <View style={styles.row}>{tiles.map((kind, i) => <Tile key={i} kind={kind} size={size} />)}</View>;
  },
  (a, b) => a.rowKey === b.rowKey && a.size === b.size,
);

const FACING_ROTATION: Record<Direction, string> = { up: '180deg', down: '0deg', left: '90deg', right: '-90deg' };

/** The visible window of the world, with the player in the middle and the partner one step behind. */
export function MapGrid({ viewport, tileSize, player, facing, follower, partnerId }: Props) {
  const width = viewport.rows[0]!.length * tileSize;
  const height = viewport.rows.length * tileSize;
  const at = (cell: Cell) => ({ left: cell.col * tileSize, top: cell.row * tileSize, width: tileSize, height: tileSize });

  return (
    <View style={[styles.map, { width, height }]} accessibilityLabel="Map" testID="map-grid">
      {viewport.rows.map((tiles, i) => (
        <Row key={i} tiles={tiles} size={tileSize} rowKey={tiles.join(',')} />
      ))}

      {follower && partnerId !== null ? (
        <Image
          source={`${config.spriteBaseUrl}/${partnerId}.png`}
          style={[styles.absolute, at(follower), { transform: [{ scale: 1.5 }] }]}
          contentFit="contain"
          accessibilityLabel="Your partner"
        />
      ) : null}

      {/* The player: an original trainer token, facing the last direction moved. */}
      <View style={[styles.absolute, styles.center, at(player)]} testID="player-token">
        <View style={[styles.token, { width: tileSize * 0.72, height: tileSize * 0.72 }]}>
          <View style={[styles.pointer, { transform: [{ rotate: FACING_ROTATION[facing] }] }]}>
            <View style={styles.pointerTip} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  map: { overflow: 'hidden', borderRadius: radius.sharp, borderWidth: 2, borderColor: palette.ink, backgroundColor: tileColors.grass },
  row: { flexDirection: 'row' },
  center: { alignItems: 'center', justifyContent: 'center' },
  blades: { borderLeftWidth: 2, borderRightWidth: 2, borderTopWidth: 0, borderBottomWidth: 2, borderRadius: 1 },
  absolute: { position: 'absolute' },
  token: {
    borderRadius: radius.pill,
    backgroundColor: palette.pollen,
    borderWidth: 3,
    borderColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  pointerTip: {
    width: 0,
    height: 0,
    marginBottom: 2,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: palette.ink,
  },
});
