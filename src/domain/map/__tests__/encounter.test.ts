import { createRng } from '../../random';
import { sequenceRng } from '@/test-utils/factories';
import { buildSpawnTable, DEFAULT_ENCOUNTER_CONFIG, rollEncounter, rollWildLevel } from '../encounter';

const base = { tile: 'tallGrass' as const, stepsSinceLastEncounter: 10, partnerLevel: 10 };

describe('rollEncounter', () => {
  it('never triggers outside tall grass', () => {
    expect(rollEncounter({ ...base, tile: 'grass' }, () => 0)).toBeNull();
    expect(rollEncounter({ ...base, tile: 'path' }, () => 0)).toBeNull();
  });

  it('respects the grace period after a battle', () => {
    expect(rollEncounter({ ...base, stepsSinceLastEncounter: 1 }, () => 0)).toBeNull();
  });

  it('triggers when the roll is below the rate', () => {
    const result = rollEncounter(base, sequenceRng([0.01, 0.5, 0.5]));
    expect(result).not.toBeNull();
    expect(result!.speciesId).toBeGreaterThanOrEqual(1);
    expect(result!.speciesId).toBeLessThanOrEqual(151);
  });

  it('does not trigger when the roll is above the rate', () => {
    expect(rollEncounter(base, () => 0.99)).toBeNull();
  });

  it('hits roughly the configured rate over many steps', () => {
    const rng = createRng(5);
    let hits = 0;
    for (let i = 0; i < 20_000; i++) if (rollEncounter(base, rng)) hits++;
    const rate = hits / 20_000;
    expect(rate).toBeGreaterThan(DEFAULT_ENCOUNTER_CONFIG.rate - 0.02);
    expect(rate).toBeLessThan(DEFAULT_ENCOUNTER_CONFIG.rate + 0.02);
  });
});

describe('buildSpawnTable', () => {
  it('makes legendaries much rarer than regular Pokémon', () => {
    const table = buildSpawnTable(DEFAULT_ENCOUNTER_CONFIG);
    expect(table).toHaveLength(151);
    const weightOf = (id: number) => table.find((e) => e.item === id)!.weight;
    expect(weightOf(150)).toBeLessThan(weightOf(16));
  });
});

describe('rollWildLevel', () => {
  it('stays within ±2 of the partner level', () => {
    const rng = createRng(9);
    for (let i = 0; i < 500; i++) {
      const level = rollWildLevel(rng, 20);
      expect(level).toBeGreaterThanOrEqual(18);
      expect(level).toBeLessThanOrEqual(22);
    }
  });

  it('clamps to a minimum of 2 and maximum of 100', () => {
    expect(rollWildLevel(() => 0, 1)).toBe(2);
    expect(rollWildLevel(() => 0.9999, 100)).toBe(100);
  });
});
