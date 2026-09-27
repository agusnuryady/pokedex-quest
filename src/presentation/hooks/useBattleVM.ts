import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveTurn, startBattle, type BattleAction, type BattleState } from '@/domain/battle/battleEngine';
import { createCombatant } from '@/domain/battle/combatant';
import { MAX_LEVEL } from '@/domain/collection/collection';
import type { Rng } from '@/domain/random';
import { selectPartner, useGameStore } from '@/state/gameStore';
import { formatName } from '@/shared/format';
import { sessionRng } from '@/shared/sessionRng';
import { tuning } from '@/shared/tuning';
import { buildTurnFrames, type BattleFrame } from '../battle/battleFrames';
import { useRepository } from '../providers/RepositoryProvider';
import { pokemonQueries } from '../queries/pokemonQueries';

export type BattlePhase = 'loading' | 'error' | 'choosing' | 'animating' | 'ended';

interface Options {
  rng?: Rng;
  /** Delay between messages. Tests pass 0. */
  frameMs?: number;
}

export const DEFAULT_FRAME_MS = tuning.battleMessageMs;

/** Save the result the moment it is known, so closing the app mid-animation can't lose a catch. */
function recordOutcome(state: BattleState): string | null {
  const store = useGameStore.getState();
  if (state.status === 'won') {
    store.recordCatch({ speciesId: state.wild.speciesId, name: state.wild.name, level: state.wild.level });
    store.rewardPartner();
    const newLevel = Math.min(MAX_LEVEL, state.player.level + 1);
    const grew = newLevel > state.player.level ? ` ${formatName(state.player.name)} grew to Lv ${newLevel}.` : '';
    return `You caught ${formatName(state.wild.name)}!${grew}`;
  }
  if (state.status === 'lost') return `${formatName(state.player.name)} needs a rest. It will be ready for the next battle.`;
  return null;
}

/** View model for a battle against the wild Pokémon stored in `gameStore.encounter`. */
export function useBattleVM({ rng, frameMs = DEFAULT_FRAME_MS }: Options = {}) {
  const repo = useRepository();
  const encounter = useGameStore((s) => s.encounter);
  const partner = useGameStore(selectPartner);
  const [random] = useState<Rng>(() => rng ?? sessionRng);

  const wildQuery = useQuery({ ...pokemonQueries.detail(repo, encounter?.speciesId ?? 0), enabled: encounter !== null });
  const partnerQuery = useQuery({ ...pokemonQueries.detail(repo, partner?.speciesId ?? 0), enabled: partner !== null });

  // The opening position is derived from loaded data; state only holds what happened since.
  const opening = useMemo(() => {
    if (!encounter || !partner || !wildQuery.data || !partnerQuery.data) return null;
    return startBattle(createCombatant(partnerQuery.data, partner.level), createCombatant(wildQuery.data, encounter.level));
  }, [encounter, partner, wildQuery.data, partnerQuery.data]);

  const [played, setPlayed] = useState<BattleState | null>(null);
  const battle = played ?? opening;
  const [frame, setFrame] = useState<BattleFrame | null>(null);
  const [animating, setAnimating] = useState(false);
  const [outcomeMessage, setOutcomeMessage] = useState<string | null>(null);
  const recorded = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const names = useMemo(
    () => (battle ? { player: formatName(battle.player.name), wild: formatName(battle.wild.name) } : { player: '', wild: '' }),
    [battle],
  );

  const act = useCallback(
    (action: BattleAction) => {
      if (!battle || animating || battle.status !== 'ongoing') return;
      const next = resolveTurn(battle, action, random);
      const frames = buildTurnFrames(battle, next.lastTurn, names);
      let outcome: string | null = null;
      if (next.status !== 'ongoing' && !recorded.current) {
        recorded.current = true;
        outcome = recordOutcome(next);
      }
      setPlayed(next);
      setAnimating(true);

      const lastHp = { playerHp: next.player.hp, wildHp: next.wild.hp };
      const sequence = outcome ? [...frames, { message: outcome, ...lastHp }] : frames;
      sequence.forEach((f, i) => timers.current.push(setTimeout(() => setFrame(f), i * frameMs)));
      const doneAt = Math.max(0, sequence.length - 1) * frameMs + frameMs / 2;
      timers.current.push(
        setTimeout(() => {
          setAnimating(false);
          if (next.status !== 'ongoing') setOutcomeMessage(sequence.at(-1)?.message ?? null);
        }, doneAt),
      );
    },
    [battle, animating, names, random, frameMs],
  );

  /** Leaving always clears the encounter, which also restarts the grace period on the map. */
  const leave = useCallback(() => useGameStore.getState().endEncounter(), []);

  const openingFrame: BattleFrame | null = opening
    ? { message: `A wild ${formatName(opening.wild.name)} appeared!`, playerHp: opening.player.hp, wildHp: opening.wild.hp }
    : null;
  const shown = frame ?? openingFrame;

  let phase: BattlePhase;
  if (wildQuery.error || partnerQuery.error) phase = 'error';
  else if (!battle) phase = 'loading';
  else if (animating) phase = 'animating';
  else if (battle.status !== 'ongoing') phase = 'ended';
  else phase = 'choosing';

  return {
    hasEncounter: encounter !== null,
    phase,
    status: battle?.status ?? 'ongoing',
    player: battle?.player ?? null,
    wild: battle?.wild ?? null,
    names,
    message: shown?.message ?? '',
    playerHp: shown?.playerHp ?? 0,
    wildHp: shown?.wildHp ?? 0,
    outcomeMessage,
    attack: (moveIndex: number) => act({ type: 'attack', moveIndex }),
    run: () => act({ type: 'run' }),
    leave,
    retry: () => {
      void wildQuery.refetch();
      void partnerQuery.refetch();
    },
  };
}
