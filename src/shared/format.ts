import type { StatName } from '@/domain/models';

/** API slugs that don't title-case cleanly. */
const NAME_OVERRIDES: Record<string, string> = {
  'mr-mime': 'Mr. Mime',
  'mr-rime': 'Mr. Rime',
  'mime-jr': 'Mime Jr.',
  'nidoran-f': 'Nidoran ♀',
  'nidoran-m': 'Nidoran ♂',
  farfetchd: "Farfetch'd",
  sirfetchd: "Sirfetch'd",
  'ho-oh': 'Ho-Oh',
  'porygon-z': 'Porygon-Z',
  'type-null': 'Type: Null',
  'jangmo-o': 'Jangmo-o',
  'hakamo-o': 'Hakamo-o',
  'kommo-o': 'Kommo-o',
  flabebe: 'Flabébé',
};

const capitalize = (word: string): string => (word ? word[0]!.toUpperCase() + word.slice(1) : word);

/** "mr-mime" → "Mr. Mime", "iron-valiant" → "Iron Valiant". */
export function formatName(slug: string): string {
  return NAME_OVERRIDES[slug] ?? slug.split('-').filter(Boolean).map(capitalize).join(' ');
}

/** 25 → "#0025" */
export const formatDexNumber = (id: number): string => `#${String(id).padStart(4, '0')}`;

export const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  attack: 'Attack',
  defense: 'Defense',
  specialAttack: 'Sp. Atk',
  specialDefense: 'Sp. Def',
  speed: 'Speed',
};

export const formatHeight = (metres: number): string => `${metres.toFixed(1)} m`;
export const formatWeight = (kg: number): string => `${kg.toFixed(1)} kg`;
