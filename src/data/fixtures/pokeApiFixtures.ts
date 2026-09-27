/**
 * Trimmed copies of real PokéAPI v2 responses (shapes and stat values are real;
 * unused fields removed). Used by unit tests and by the offline mock repository.
 */
import type { PokemonDto, PokemonListDto, PokemonSpeciesDto, TypeDto } from '../api/pokeApi.dto';

const API = 'https://pokeapi.co/api/v2';
const ART = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';
const res = (kind: string, name: string, id: number) => ({ name, url: `${API}/${kind}/${id}/` });

type StatTuple = [hp: number, atk: number, def: number, spa: number, spd: number, spe: number];

function pokemon(
  id: number,
  name: string,
  types: string[],
  [hp, atk, def, spa, spd, spe]: StatTuple,
  abilities: [string, string],
  height: number,
  weight: number,
): PokemonDto {
  const statNames = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
  return {
    id,
    name,
    height,
    weight,
    types: types.map((t, i) => ({ slot: i + 1, type: res('type', t, i + 1) })),
    stats: [hp, atk, def, spa, spd, spe].map((base_stat, i) => ({
      base_stat,
      stat: res('stat', statNames[i]!, i + 1),
    })),
    abilities: [
      { ability: res('ability', abilities[0], 1), is_hidden: false, slot: 1 },
      { ability: res('ability', abilities[1], 2), is_hidden: true, slot: 3 },
    ],
    sprites: {
      front_default: `${ART}/${id}.png`,
      other: { 'official-artwork': { front_default: `${ART}/other/official-artwork/${id}.png` } },
    },
  };
}

export const bulbasaurDto = pokemon(1, 'bulbasaur', ['grass', 'poison'], [45, 49, 49, 65, 65, 45], ['overgrow', 'chlorophyll'], 7, 69);
export const charmanderDto = pokemon(4, 'charmander', ['fire'], [39, 52, 43, 60, 50, 65], ['blaze', 'solar-power'], 6, 85);
export const squirtleDto = pokemon(7, 'squirtle', ['water'], [44, 48, 65, 50, 64, 43], ['torrent', 'rain-dish'], 5, 90);
export const pikachuDto = pokemon(25, 'pikachu', ['electric'], [35, 55, 40, 50, 50, 90], ['static', 'lightning-rod'], 4, 60);

export const pokemonFixtures: PokemonDto[] = [bulbasaurDto, charmanderDto, squirtleDto, pikachuDto];

export const pokemonListDto: PokemonListDto = {
  count: 6,
  next: null,
  previous: null,
  results: [
    res('pokemon', 'bulbasaur', 1),
    res('pokemon', 'charmander', 4),
    res('pokemon', 'squirtle', 7),
    res('pokemon', 'pikachu', 25),
    res('pokemon', 'venusaur-mega', 10033), // alternate form — must be filtered out
    res('pokemon', 'charizard-mega-x', 10034),
  ],
};

export const bulbasaurSpeciesDto: PokemonSpeciesDto = {
  id: 1,
  is_legendary: false,
  is_mythical: false,
  genera: [
    { genus: 'たねポケモン', language: res('language', 'ja', 1) },
    { genus: 'Seed Pokémon', language: res('language', 'en', 9) },
  ],
  flavor_text_entries: [
    // Old game text uses \f page breaks, hard wraps and soft hyphens — the mapper cleans these.
    { flavor_text: 'Carries a seed\non its back\fsince the day it hat\u00ad\nched.', language: res('language', 'en', 9), version: res('version', 'red', 1) },
    { flavor_text: 'Texto de prueba.', language: res('language', 'es', 7), version: res('version', 'x', 23) },
  ],
};

export const grassTypeDto: TypeDto = {
  id: 12,
  name: 'grass',
  pokemon: [
    { slot: 1, pokemon: res('pokemon', 'bulbasaur', 1) },
    { slot: 1, pokemon: res('pokemon', 'venusaur-mega', 10033) },
  ],
};
