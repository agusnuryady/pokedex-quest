import type { PokemonSummary } from '../models';

export interface PokedexFilter {
  query: string;
  /** Ids allowed by the selected type, or null for all types. */
  allowedIds: ReadonlySet<number> | null;
}

/** "  #025 " → "025", "Mr Mime" → "mr-mime" (API slugs use hyphens). */
export const normalizeQuery = (query: string): string =>
  query.trim().toLowerCase().replace(/^#/, '').replace(/[\s.]+/g, '-').replace(/-+$/, '');

/** Numeric queries match the exact dex number; text matches anywhere in the name. */
export function matchesQuery(pokemon: PokemonSummary, normalized: string): boolean {
  if (!normalized) return true;
  if (/^\d+$/.test(normalized)) return pokemon.id === Number(normalized);
  return pokemon.name.includes(normalized);
}

export function filterPokedex(index: readonly PokemonSummary[], filter: PokedexFilter): PokemonSummary[] {
  const normalized = normalizeQuery(filter.query);
  return index.filter(
    (p) => (filter.allowedIds === null || filter.allowedIds.has(p.id)) && matchesQuery(p, normalized),
  );
}

/** First `page` pages — the list grows as the user scrolls. */
export const paginate = <T>(items: readonly T[], page: number, pageSize: number): T[] =>
  items.slice(0, Math.max(1, page) * pageSize);
