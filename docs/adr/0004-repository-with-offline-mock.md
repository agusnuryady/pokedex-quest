# 0004. Repository interface with PokéAPI and offline implementations

Date: 2026-09-27 · Status: Accepted

## Context

The UI needs Pokémon data from PokéAPI. Tests must not depend on the network, and development should continue when the API is slow or unreachable.

## Decision

The presentation layer depends only on a `PokemonRepository` interface. There are two implementations: `PokeApiPokemonRepository`, which fetches and maps real responses, and `InMemoryPokemonRepository`, which serves trimmed real fixtures and returns a playable placeholder for any other id. `src/data/index.ts` is the only place that chooses between them, controlled by `EXPO_PUBLIC_USE_MOCK_API`.

Raw API shapes (DTOs) are converted to domain models by mappers, so a change in PokéAPI's response format is contained in one file.

The Glossary loads the full name index in a single request and filters on the device, rather than paging through the API. This makes search instant and avoids one request per list row.

## Consequences

- The data layer is tested with fake HTTP clients and fixtures, with no network access.
- The whole game runs offline for demos.
- Fixtures must be kept in sync with the real API shape. Mapper tests catch drift.
