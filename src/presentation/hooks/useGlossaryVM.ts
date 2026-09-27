import { useQuery } from '@tanstack/react-query';
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import type { PokemonType } from '@/domain/models';
import { filterPokedex, paginate } from '@/domain/pokedex/search';
import { useGameStore } from '@/state/gameStore';
import { useRepository } from '../providers/RepositoryProvider';
import { pokemonQueries } from '../queries/pokemonQueries';

export const GLOSSARY_PAGE_SIZE = 40;

export type LoadStatus = 'loading' | 'error' | 'ready';

/** View model for the Glossary: search, type filter, paging, and caught markers. */
export function useGlossaryVM() {
  const repo = useRepository();
  const [query, setQueryState] = useState('');
  const [type, setTypeState] = useState<PokemonType | null>(null);
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query);
  const caught = useGameStore((s) => s.caught);

  const indexQuery = useQuery(pokemonQueries.index(repo));
  const typeQuery = useQuery({
    ...pokemonQueries.idsByType(repo, type ?? 'normal'),
    enabled: type !== null,
  });

  const allowedIds = useMemo(
    () => (type !== null && typeQuery.data ? new Set(typeQuery.data) : null),
    [type, typeQuery.data],
  );

  const results = useMemo(
    () => filterPokedex(indexQuery.data ?? [], { query: deferredQuery, allowedIds }),
    [indexQuery.data, deferredQuery, allowedIds],
  );

  const visible = useMemo(() => paginate(results, page, GLOSSARY_PAGE_SIZE), [results, page]);

  // Changing the search or filter starts again from the first page.
  const setQuery = useCallback((text: string) => {
    setQueryState(text);
    setPage(1);
  }, []);
  const setType = useCallback((next: PokemonType | null) => {
    setTypeState(next);
    setPage(1);
  }, []);

  const hasMore = visible.length < results.length;
  const loadMore = useCallback(() => {
    if (hasMore) setPage((p) => p + 1);
  }, [hasMore]);

  const typeLoading = type !== null && typeQuery.isPending;
  const failed = indexQuery.error ?? (type !== null ? typeQuery.error : null);
  const status: LoadStatus = failed ? 'error' : indexQuery.isPending || typeLoading ? 'loading' : 'ready';

  const retry = useCallback(() => {
    void indexQuery.refetch();
    if (type !== null) void typeQuery.refetch();
  }, [indexQuery, typeQuery, type]);

  const isCaught = useCallback((id: number) => caught[id] !== undefined, [caught]);

  return {
    status,
    errorMessage: failed ? 'Check your connection and try again.' : null,
    query,
    setQuery,
    type,
    setType,
    items: visible,
    totalCount: indexQuery.data?.length ?? 0,
    resultCount: results.length,
    hasMore,
    loadMore,
    retry,
    isCaught,
  };
}
