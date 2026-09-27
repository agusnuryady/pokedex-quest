import { InMemoryPokemonRepository } from '../repositories/InMemoryPokemonRepository';

describe('InMemoryPokemonRepository', () => {
  const repo = new InMemoryPokemonRepository();

  it('lists a full Gen 1 index with fixture names where available', async () => {
    const index = await repo.listIndex();
    expect(index).toHaveLength(151);
    expect(index[0]).toMatchObject({ id: 1, name: 'bulbasaur' });
    expect(index[1]).toMatchObject({ id: 2, name: 'pokemon-2' });
  });

  it('returns fixtures by id and by name', async () => {
    await expect(repo.getPokemon(25)).resolves.toMatchObject({ name: 'pikachu', types: ['electric'] });
    await expect(repo.getPokemon(' Charmander ')).resolves.toMatchObject({ id: 4 });
  });

  it('returns a playable placeholder for unknown ids so the game works offline', async () => {
    const stub = await repo.getPokemon(99);
    expect(stub).toMatchObject({ id: 99, types: ['normal'] });
    expect(stub.stats.hp).toBeGreaterThan(0);
  });

  it('rejects unknown names', async () => {
    await expect(repo.getPokemon('missingno')).rejects.toThrow('not found');
  });

  it('returns fixture species and a fallback for the rest', async () => {
    await expect(repo.getSpecies(1)).resolves.toMatchObject({ genus: 'Seed Pokémon' });
    await expect(repo.getSpecies(50)).resolves.toMatchObject({ id: 50, isLegendary: false });
  });

  it('filters by type', async () => {
    await expect(repo.listIdsByType('grass')).resolves.toEqual([1]);
    await expect(repo.listIdsByType('dragon')).resolves.toEqual([]);
  });
});
