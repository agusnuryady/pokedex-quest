import type { PokemonSummary } from '../../models';
import { filterPokedex, matchesQuery, normalizeQuery, paginate } from '../search';

const p = (id: number, name: string): PokemonSummary => ({ id, name, artworkUrl: '' });
const index = [p(1, 'bulbasaur'), p(25, 'pikachu'), p(122, 'mr-mime'), p(250, 'ho-oh'), p(252, 'treecko')];

describe('normalizeQuery', () => {
  it.each([
    ['  Pikachu ', 'pikachu'],
    ['#025', '025'],
    ['Mr. Mime', 'mr-mime'],
    ['mr mime', 'mr-mime'],
    ['', ''],
  ])('%j → %j', (input, expected) => expect(normalizeQuery(input)).toBe(expected));
});

describe('matchesQuery', () => {
  it('matches numbers exactly, ignoring leading zeros', () => {
    expect(matchesQuery(p(25, 'pikachu'), '025')).toBe(true);
    expect(matchesQuery(p(250, 'ho-oh'), '25')).toBe(false);
  });

  it('matches text anywhere in the name', () => {
    expect(matchesQuery(p(1, 'bulbasaur'), 'saur')).toBe(true);
    expect(matchesQuery(p(1, 'bulbasaur'), 'chu')).toBe(false);
  });
});

describe('filterPokedex', () => {
  it('returns everything for an empty query and no type', () => {
    expect(filterPokedex(index, { query: '', allowedIds: null })).toHaveLength(5);
  });

  it('combines the query with the type filter', () => {
    const grass = new Set([1, 252]);
    expect(filterPokedex(index, { query: '', allowedIds: grass }).map((x) => x.id)).toEqual([1, 252]);
    expect(filterPokedex(index, { query: 'tree', allowedIds: grass }).map((x) => x.id)).toEqual([252]);
    expect(filterPokedex(index, { query: 'pika', allowedIds: grass })).toEqual([]);
  });

  it('finds names typed the way players write them', () => {
    expect(filterPokedex(index, { query: 'Mr. Mime', allowedIds: null }).map((x) => x.id)).toEqual([122]);
  });
});

describe('paginate', () => {
  const items = Array.from({ length: 70 }, (_, i) => i);
  it('grows by one page at a time', () => {
    expect(paginate(items, 1, 30)).toHaveLength(30);
    expect(paginate(items, 2, 30)).toHaveLength(60);
    expect(paginate(items, 3, 30)).toHaveLength(70);
  });
  it('always shows at least the first page', () => expect(paginate(items, 0, 30)).toHaveLength(30));
});
