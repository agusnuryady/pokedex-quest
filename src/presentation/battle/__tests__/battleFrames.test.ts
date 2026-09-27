import { startBattle, type BattleEvent } from '@/domain/battle/battleEngine';
import { makeCombatant } from '@/test-utils/factories';
import { buildTurnFrames } from '../battleFrames';

const player = { ...makeCombatant({ name: 'squirtle' }), hp: 30, maxHp: 30 };
const wild = { ...makeCombatant({ name: 'pidgey' }), hp: 20, maxHp: 20 };
const before = startBattle(player, wild);
const names = { player: 'Squirtle', wild: 'Pidgey' };

describe('buildTurnFrames', () => {
  it('drops HP one hit at a time, in order', () => {
    const events: BattleEvent[] = [
      { kind: 'attack', side: 'player', moveName: 'Water Gun', damage: 8, effectiveness: 'neutral' },
      { kind: 'attack', side: 'wild', moveName: 'Gust', damage: 5, effectiveness: 'neutral' },
    ];
    expect(buildTurnFrames(before, events, names)).toEqual([
      { message: 'Squirtle used Water Gun!', playerHp: 30, wildHp: 12 },
      { message: 'Wild Pidgey used Gust!', playerHp: 25, wildHp: 12 },
    ]);
  });

  it('adds effectiveness and faint messages', () => {
    const events: BattleEvent[] = [
      { kind: 'attack', side: 'player', moveName: 'Thunder Shock', damage: 99, effectiveness: 'super-effective' },
      { kind: 'faint', side: 'wild' },
    ];
    expect(buildTurnFrames(before, events, names).map((f) => f.message)).toEqual([
      'Squirtle used Thunder Shock!',
      "It's super effective!",
      'Wild Pidgey fainted!',
    ]);
    expect(buildTurnFrames(before, events, names).at(-1)!.wildHp).toBe(0);
  });

  it('describes immunity and weak hits', () => {
    const immune: BattleEvent[] = [{ kind: 'attack', side: 'wild', moveName: 'Tackle', damage: 0, effectiveness: 'immune' }];
    expect(buildTurnFrames(before, immune, names)[1]!.message).toBe('It had no effect.');
    const weak: BattleEvent[] = [{ kind: 'attack', side: 'wild', moveName: 'Tackle', damage: 1, effectiveness: 'not-very-effective' }];
    expect(buildTurnFrames(before, weak, names)[1]!.message).toBe("It's not very effective.");
  });

  it('narrates running away', () => {
    expect(buildTurnFrames(before, [{ kind: 'flee', success: true }], names)[0]!.message).toBe('Got away safely!');
    expect(buildTurnFrames(before, [{ kind: 'flee', success: false }], names)[0]!.message).toBe("Couldn't get away!");
  });
});
