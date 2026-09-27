import { bulbasaurDto, bulbasaurSpeciesDto, pokemonListDto } from '../fixtures/pokeApiFixtures';
import { cleanFlavorText, mapPokemon, mapSpecies, mapSummary, parseIdFromUrl } from '../mappers/pokemonMapper';

describe('parseIdFromUrl', () => {
  it('reads the id with or without a trailing slash', () => {
    expect(parseIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25);
    expect(parseIdFromUrl('https://pokeapi.co/api/v2/pokemon/10033')).toBe(10033);
  });

  it('throws on a url without an id', () => {
    expect(() => parseIdFromUrl('https://pokeapi.co/api/v2/pokemon/')).toThrow();
  });
});

describe('mapSummary', () => {
  it('builds the artwork url from the id', () => {
    expect(mapSummary(pokemonListDto.results[0]!)).toEqual({
      id: 1,
      name: 'bulbasaur',
      artworkUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    });
  });
});

describe('mapPokemon', () => {
  const pokemon = mapPokemon(bulbasaurDto);

  it('maps types in slot order', () => {
    expect(pokemon.types).toEqual(['grass', 'poison']);
  });

  it('maps stat names to camelCase keys', () => {
    expect(pokemon.stats).toEqual({ hp: 45, attack: 49, defense: 49, specialAttack: 65, specialDefense: 65, speed: 45 });
  });

  it('converts decimetres and hectograms to metres and kilograms', () => {
    expect(pokemon.heightM).toBe(0.7);
    expect(pokemon.weightKg).toBe(6.9);
  });

  it('marks hidden abilities', () => {
    expect(pokemon.abilities).toEqual([
      { name: 'overgrow', isHidden: false },
      { name: 'chlorophyll', isHidden: true },
    ]);
  });

  it('drops unknown types instead of crashing', () => {
    const weird = { ...bulbasaurDto, types: [{ slot: 1, type: { name: 'shadow', url: 'x/1/' } }] };
    expect(mapPokemon(weird).types).toEqual([]);
  });
});

describe('mapSpecies', () => {
  it('picks the English genus and cleaned flavor text', () => {
    expect(mapSpecies(bulbasaurSpeciesDto)).toEqual({
      id: 1,
      genus: 'Seed Pokémon',
      flavorText: 'Carries a seed on its back since the day it hatched.',
      isLegendary: false,
      isMythical: false,
    });
  });
});

describe('cleanFlavorText', () => {
  it('removes form feeds, newlines and soft hyphens', () => {
    expect(cleanFlavorText('A\fB\nC  D\u00ad\nE')).toBe('A B C DE');
  });
});
