import { isWalkable, tileAt } from '@/domain/map/terrain';
import { selectCaughtCount, selectHasStarter, selectPartner, useGameStore } from '../gameStore';

const store = () => useGameStore.getState();

beforeEach(() => store().resetGame());

describe('gameStore', () => {
  it('spawns the player on a walkable tile', () => {
    const { seed, position } = store().world;
    expect(isWalkable(tileAt(position.x, position.y, seed))).toBe(true);
  });

  it('runs the starter → catch → level-up flow', () => {
    expect(selectHasStarter(store())).toBe(false);
    store().chooseStarter(7, 'squirtle');
    expect(selectPartner(store())).toMatchObject({ speciesId: 7, level: 5 });

    store().recordCatch({ speciesId: 16, name: 'pidgey', level: 4 });
    store().rewardPartner();
    expect(selectCaughtCount(store())).toBe(2);
    expect(selectPartner(store())!.level).toBe(6);
  });

  it('counts steps and resets the encounter counter', () => {
    const start = store().world.position;
    store().moveTo({ x: start.x + 1, y: start.y });
    store().moveTo({ x: start.x + 2, y: start.y });
    expect(store().world.stepsSinceLastEncounter).toBe(2);
    store().resetEncounterCounter();
    expect(store().world.stepsSinceLastEncounter).toBe(0);
  });
});
