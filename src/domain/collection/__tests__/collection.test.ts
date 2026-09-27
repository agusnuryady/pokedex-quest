import {
  addCatch, caughtCount, chooseStarter, emptyCollection, gainLevel, getPartner, markSeen,
  MAX_LEVEL, seenCount, setPartner, STARTER_LEVEL,
} from '../collection';

const now = new Date('2026-09-27T10:00:00Z');
const later = new Date('2026-09-28T10:00:00Z');

describe('collection', () => {
  it('chooses a starter as partner at the starter level', () => {
    const state = chooseStarter(emptyCollection(), 4, 'charmander', now);
    expect(state.partnerId).toBe(4);
    expect(getPartner(state)).toMatchObject({ speciesId: 4, level: STARTER_LEVEL, timesCaught: 1 });
    expect(state.seen[4]).toBe(true);
  });

  it('rejects non-starters and ignores a second starter pick', () => {
    expect(() => chooseStarter(emptyCollection(), 25, 'pikachu', now)).toThrow();
    const once = chooseStarter(emptyCollection(), 1, 'bulbasaur', now);
    expect(chooseStarter(once, 7, 'squirtle', now)).toBe(once);
  });

  it('counts repeat catches and keeps the highest level and first date', () => {
    let state = addCatch(emptyCollection(), { speciesId: 16, name: 'pidgey', level: 3 }, now);
    state = addCatch(state, { speciesId: 16, name: 'pidgey', level: 7 }, later);
    state = addCatch(state, { speciesId: 16, name: 'pidgey', level: 5 }, later);
    expect(state.caught[16]).toEqual({
      speciesId: 16, name: 'pidgey', level: 7, timesCaught: 3, firstCaughtAt: now.toISOString(),
    });
    expect(caughtCount(state)).toBe(1);
  });

  it('tracks seen separately from caught', () => {
    const state = markSeen(markSeen(emptyCollection(), 19), 19);
    expect(seenCount(state)).toBe(1);
    expect(caughtCount(state)).toBe(0);
  });

  it('only lets caught Pokémon become the partner', () => {
    const state = addCatch(emptyCollection(), { speciesId: 16, name: 'pidgey', level: 3 }, now);
    expect(setPartner(state, 16).partnerId).toBe(16);
    expect(() => setPartner(state, 150)).toThrow();
  });

  it('levels up and caps at the max level', () => {
    let state = addCatch(emptyCollection(), { speciesId: 16, name: 'pidgey', level: 99 }, now);
    state = gainLevel(state, 16, 5);
    expect(state.caught[16]!.level).toBe(MAX_LEVEL);
    expect(gainLevel(state, 999)).toBe(state);
  });

  it('never mutates the previous state', () => {
    const before = emptyCollection();
    const snapshot = JSON.stringify(before);
    addCatch(before, { speciesId: 1, name: 'bulbasaur', level: 5 }, now);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
