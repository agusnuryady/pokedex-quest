import type { PokemonType } from '@/domain/models';
import type { TileKind } from '@/domain/map/terrain';

/**
 * Visual direction: a field researcher's notebook, not a red gadget.
 * Moss for the wild, pollen for catch moments, berry for danger. Ink on pale paper.
 */
export const palette = {
  ink: '#1E2A3A',
  inkSoft: '#56627A',
  paper: '#F7F8F4',
  fog: '#E3E7E0',
  moss: '#2F6B4F',
  mossDeep: '#1F4A36',
  pollen: '#F5C542',
  berry: '#B8323A',
  white: '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

/** Radius follows hierarchy: chips are pills, cards are soft, the game frame is sharp. */
export const radius = { sharp: 2, card: 14, pill: 999 } as const;

export const typeScale = { caption: 12, body: 15, title: 20, display: 32 } as const;

/** Widely used community type colours, so players recognise them instantly. */
export const typeColors: Record<PokemonType, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#B7B7CE', fairy: '#D685AD',
};

export const tileColors: Record<TileKind, string> = {
  grass: '#8CC66D',
  tallGrass: '#4E9A4A',
  path: '#D9C38F',
  sand: '#EFE0A8',
  water: '#4F8FCB',
  tree: '#2C5A34',
};

export const theme = { palette, spacing, radius, typeScale, typeColors, tileColors } as const;
export type Theme = typeof theme;
