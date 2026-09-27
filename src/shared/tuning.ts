import { DEFAULT_ENCOUNTER_CONFIG, type EncounterConfig } from '@/domain/map/encounter';

/**
 * Every number that changes how the game feels, in one place.
 * Adjust these after play-testing; nothing else needs to change.
 */
export const tuning = {
  /** Milliseconds between steps while a D-pad button is held. Lower is faster. */
  walkRepeatMs: 170,
  /** Milliseconds each battle message stays on screen. */
  battleMessageMs: 900,
  /** Chance of a wild Pokémon per step in tall grass (0–1). */
  encounterRate: 0.12,
  /** Steps after a battle before another wild Pokémon can appear. */
  encounterGraceSteps: 4,
} as const;

export const gameEncounterConfig: EncounterConfig = {
  ...DEFAULT_ENCOUNTER_CONFIG,
  rate: tuning.encounterRate,
  graceSteps: tuning.encounterGraceSteps,
};
