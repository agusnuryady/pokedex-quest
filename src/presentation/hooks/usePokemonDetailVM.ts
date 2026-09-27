import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { DEFAULT_ENCOUNTER_CONFIG } from '@/domain/map/encounter';
import type { StatName } from '@/domain/models';
import { useGameStore } from '@/state/gameStore';
import { STAT_LABELS } from '@/shared/format';
import { useRepository } from '../providers/RepositoryProvider';
import { pokemonQueries } from '../queries/pokemonQueries';
import type { LoadStatus } from './useGlossaryVM';

const STAT_ORDER: StatName[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];

/** View model for one Pokémon: API data plus the player's progress with it. */
export function usePokemonDetailVM(id: number) {
  const repo = useRepository();
  const valid = Number.isInteger(id) && id > 0;
  const pokemonQuery = useQuery({ ...pokemonQueries.detail(repo, id), enabled: valid });
  // Species adds the description. It is optional: the page still works if it fails.
  const speciesQuery = useQuery({ ...pokemonQueries.species(repo, id), enabled: valid });

  const caughtEntry = useGameStore((s) => s.caught[id]);
  const partnerId = useGameStore((s) => s.partnerId);
  const setPartnerAction = useGameStore((s) => s.setPartner);

  const pokemon = pokemonQuery.data;
  const stats = useMemo(
    () => (pokemon ? STAT_ORDER.map((key) => ({ key, label: STAT_LABELS[key], value: pokemon.stats[key] })) : []),
    [pokemon],
  );
  const totalStats = stats.reduce((sum, s) => sum + s.value, 0);

  let status: LoadStatus = 'ready';
  if (!valid || pokemonQuery.error) status = 'error';
  else if (pokemonQuery.isPending) status = 'loading';

  const makePartner = useCallback(() => setPartnerAction(id), [setPartnerAction, id]);

  return {
    status,
    errorMessage: valid ? "This Pokémon couldn't be loaded. Check your connection and try again." : 'This Pokémon does not exist.',
    retry: () => void pokemonQuery.refetch(),
    pokemon,
    species: speciesQuery.data ?? null,
    stats,
    totalStats,
    caught: caughtEntry ?? null,
    isPartner: partnerId === id,
    canMakePartner: caughtEntry !== undefined && partnerId !== id,
    makePartner,
    /** Only the first region's Pokémon appear in Play. */
    appearsInWild: id <= DEFAULT_ENCOUNTER_CONFIG.poolMaxId,
  };
}
