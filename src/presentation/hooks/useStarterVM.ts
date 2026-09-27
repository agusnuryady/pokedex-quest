import { useQueries } from '@tanstack/react-query';
import { STARTER_IDS } from '@/domain/collection/collection';
import { useGameStore } from '@/state/gameStore';
import { artworkUrlFor } from '@/shared/config';
import { useRepository } from '../providers/RepositoryProvider';
import { pokemonQueries } from '../queries/pokemonQueries';

/** View model for choosing the first partner. */
export function useStarterVM() {
  const repo = useRepository();
  const chooseStarter = useGameStore((s) => s.chooseStarter);
  const results = useQueries({ queries: STARTER_IDS.map((id) => pokemonQueries.detail(repo, id)) });

  const starters = STARTER_IDS.map((id, i) => {
    const data = results[i]?.data;
    return { id, name: data?.name ?? null, types: data?.types ?? [], artworkUrl: artworkUrlFor(id) };
  });

  return {
    status: results.some((r) => r.error) ? 'error' : results.some((r) => r.isPending) ? 'loading' : 'ready',
    starters,
    choose: (id: number, name: string) => chooseStarter(id, name),
    retry: () => results.forEach((r) => void r.refetch()),
  } as const;
}
