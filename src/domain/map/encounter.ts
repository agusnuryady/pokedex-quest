import { pickWeighted, randomInt, type Rng } from '../random';
import { canEncounterOn, type TileKind } from './terrain';

export interface EncounterConfig {
  /** Chance per step on tall grass. */
  rate: number;
  /** Steps after a battle during which nothing can appear (stops back-to-back fights). */
  graceSteps: number;
  /** Wild Pokémon are drawn from national dex ids 1..poolMaxId. */
  poolMaxId: number;
  /** Relative spawn weight for special ids. Unlisted ids use `defaultWeight`. */
  rarity: Readonly<Record<number, number>>;
  defaultWeight: number;
}

const LEGENDARY = 1;
const RARE = 4;

export const DEFAULT_ENCOUNTER_CONFIG: EncounterConfig = {
  rate: 0.12,
  graceSteps: 4,
  poolMaxId: 151,
  defaultWeight: 20,
  rarity: {
    // Starter lines
    1: RARE, 2: RARE, 3: RARE, 4: RARE, 5: RARE, 6: RARE, 7: RARE, 8: RARE, 9: RARE,
    // Fossils and big rares
    131: RARE, 142: RARE, 143: RARE, 147: RARE, 148: RARE, 149: RARE,
    // Legendaries and mythicals
    144: LEGENDARY, 145: LEGENDARY, 146: LEGENDARY, 150: LEGENDARY, 151: LEGENDARY,
  },
};

export interface WildEncounter {
  speciesId: number;
  level: number;
}

export interface EncounterInput {
  tile: TileKind;
  stepsSinceLastEncounter: number;
  partnerLevel: number;
}

export function buildSpawnTable(config: EncounterConfig): { item: number; weight: number }[] {
  return Array.from({ length: config.poolMaxId }, (_, index) => {
    const id = index + 1;
    return { item: id, weight: config.rarity[id] ?? config.defaultWeight };
  });
}

/** Wild level stays close to the partner's so battles are fair. */
export function rollWildLevel(rng: Rng, partnerLevel: number): number {
  const min = Math.max(2, partnerLevel - 2);
  const max = Math.min(100, partnerLevel + 2);
  return randomInt(rng, min, Math.max(min, max));
}

export function rollEncounter(
  input: EncounterInput,
  rng: Rng,
  config: EncounterConfig = DEFAULT_ENCOUNTER_CONFIG,
  spawnTable = buildSpawnTable(config),
): WildEncounter | null {
  if (!canEncounterOn(input.tile)) return null;
  if (input.stepsSinceLastEncounter < config.graceSteps) return null;
  if (rng() >= config.rate) return null;
  return {
    speciesId: pickWeighted(rng, spawnTable),
    level: rollWildLevel(rng, input.partnerLevel),
  };
}
