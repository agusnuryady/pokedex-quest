/**
 * Collection rules as pure functions. The Zustand store only calls these,
 * so every rule is unit tested without React or storage.
 */
export interface CaughtPokemon {
  speciesId: number;
  name: string;
  level: number;
  timesCaught: number;
  firstCaughtAt: string; // ISO date
}

export interface CollectionState {
  caught: Record<number, CaughtPokemon>;
  seen: Record<number, true>;
  partnerId: number | null;
}

export const MAX_LEVEL = 100;
export const STARTER_LEVEL = 5;
export const STARTER_IDS = [1, 4, 7] as const; // Bulbasaur, Charmander, Squirtle

export const emptyCollection = (): CollectionState => ({ caught: {}, seen: {}, partnerId: null });

export function markSeen(state: CollectionState, speciesId: number): CollectionState {
  if (state.seen[speciesId]) return state;
  return { ...state, seen: { ...state.seen, [speciesId]: true } };
}

export function addCatch(
  state: CollectionState,
  entry: { speciesId: number; name: string; level: number },
  now: Date,
): CollectionState {
  const existing = state.caught[entry.speciesId];
  const caught: CaughtPokemon = existing
    ? { ...existing, timesCaught: existing.timesCaught + 1, level: Math.max(existing.level, entry.level) }
    : { ...entry, timesCaught: 1, firstCaughtAt: now.toISOString() };
  return markSeen({ ...state, caught: { ...state.caught, [entry.speciesId]: caught } }, entry.speciesId);
}

export function chooseStarter(state: CollectionState, speciesId: number, name: string, now: Date): CollectionState {
  if (!(STARTER_IDS as readonly number[]).includes(speciesId)) {
    throw new Error(`${speciesId} is not a starter`);
  }
  if (state.partnerId !== null) return state;
  return { ...addCatch(state, { speciesId, name, level: STARTER_LEVEL }, now), partnerId: speciesId };
}

export function setPartner(state: CollectionState, speciesId: number): CollectionState {
  if (!state.caught[speciesId]) throw new Error(`Cannot set partner: ${speciesId} is not caught`);
  return { ...state, partnerId: speciesId };
}

export function gainLevel(state: CollectionState, speciesId: number, amount = 1): CollectionState {
  const current = state.caught[speciesId];
  if (!current) return state;
  const level = Math.min(MAX_LEVEL, current.level + amount);
  return { ...state, caught: { ...state.caught, [speciesId]: { ...current, level } } };
}

export const getPartner = (state: CollectionState): CaughtPokemon | null =>
  state.partnerId === null ? null : (state.caught[state.partnerId] ?? null);

export const caughtCount = (state: CollectionState): number => Object.keys(state.caught).length;
export const seenCount = (state: CollectionState): number => Object.keys(state.seen).length;
