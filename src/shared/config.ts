export const config = {
  pokeApiBaseUrl: 'https://pokeapi.co/api/v2',
  spriteBaseUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon',
  requestTimeoutMs: 10_000,
  /** PokéAPI ids >= 10000 are alternate forms (megas, regional forms). Glossary lists species only. */
  maxSpeciesId: 9_999,
  /** Set EXPO_PUBLIC_USE_MOCK_API=true to run fully offline against fixtures. */
  useMockApi: process.env.EXPO_PUBLIC_USE_MOCK_API === 'true',
} as const;

export const artworkUrlFor = (id: number): string =>
  `${config.spriteBaseUrl}/other/official-artwork/${id}.png`;
