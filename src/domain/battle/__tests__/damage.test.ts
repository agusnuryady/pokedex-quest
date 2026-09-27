import { makeCombatant, constantRng } from '@/test-utils/factories';
import { signatureMove, TACKLE } from '../combatant';
import { calculateDamage } from '../damage';

describe('calculateDamage', () => {
  const water = makeCombatant({ types: ['water'] });
  const fire = makeCombatant({ types: ['fire'] });
  const ghost = makeCombatant({ types: ['ghost'] });
  const max = constantRng(0.9999);

  it('does zero damage when the defender is immune', () => {
    expect(calculateDamage(water, ghost, TACKLE, max)).toEqual({ damage: 0, effectiveness: 0, isStab: false });
  });

  it('applies super effectiveness and STAB', () => {
    const neutral = calculateDamage(water, water, TACKLE, max).damage;
    const strong = calculateDamage(water, fire, signatureMove('water'), max);
    expect(strong.isStab).toBe(true);
    expect(strong.effectiveness).toBe(2);
    expect(strong.damage).toBeGreaterThan(neutral * 2);
  });

  it('always deals at least 1 when not immune', () => {
    const weak = makeCombatant({ types: ['normal'] }, 2, { attack: 1 });
    const tank = makeCombatant({ types: ['rock'] }, 100, { defense: 999 });
    expect(calculateDamage(weak, tank, TACKLE, constantRng(0)).damage).toBe(1);
  });

  it('varies by at most 15% with the random roll', () => {
    const low = calculateDamage(water, water, TACKLE, constantRng(0)).damage;
    const high = calculateDamage(water, water, TACKLE, max).damage;
    expect(low).toBeLessThanOrEqual(high);
    expect(low).toBeGreaterThanOrEqual(Math.floor(high * 0.85) - 1);
  });

  it('uses special stats for special moves', () => {
    const specialist = makeCombatant({ types: ['psychic'] }, 10, { specialAttack: 200, attack: 1 });
    const special = calculateDamage(specialist, water, signatureMove('psychic'), max).damage;
    const physical = calculateDamage(specialist, water, TACKLE, max).damage;
    expect(special).toBeGreaterThan(physical);
  });
});
