/** Raw PokéAPI v2 shapes. Only the fields this app reads are typed. */
export interface NamedResourceDto {
  name: string;
  url: string;
}

export interface PokemonListDto {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResourceDto[];
}

export interface PokemonDto {
  id: number;
  name: string;
  height: number; // decimetres
  weight: number; // hectograms
  types: { slot: number; type: NamedResourceDto }[];
  stats: { base_stat: number; stat: NamedResourceDto }[];
  abilities: { ability: NamedResourceDto; is_hidden: boolean; slot: number }[];
  sprites: {
    front_default: string | null;
    other?: { 'official-artwork'?: { front_default: string | null } };
  };
}

export interface PokemonSpeciesDto {
  id: number;
  is_legendary: boolean;
  is_mythical: boolean;
  genera: { genus: string; language: NamedResourceDto }[];
  flavor_text_entries: { flavor_text: string; language: NamedResourceDto; version: NamedResourceDto }[];
}

export interface TypeDto {
  id: number;
  name: string;
  pokemon: { slot: number; pokemon: NamedResourceDto }[];
}
