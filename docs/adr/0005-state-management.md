# 0005. TanStack Query for server data, Zustand for game state

Date: 2026-09-27 · Status: Accepted

## Context

The app has two kinds of state. Server data (Pokémon details, species, the name index) is fetched and cached. Game state (caught Pokémon, seen Pokémon, partner, world position) belongs to the player and must survive app restarts.

## Decision

TanStack Query handles server data with `staleTime: Infinity`, because Pokémon data does not change, and retries only transient errors. Zustand with the persist middleware holds game state in AsyncStorage (localStorage on web). The store contains no rules: every action calls a pure function from `src/domain/collection`.

Redux Toolkit was considered and rejected as heavier than this app needs. Keeping server data out of the game store also avoids hand-written loading and error flags.

## Consequences

- Progress persists across restarts on every platform.
- Collection rules are tested once, in the domain, and the store test only checks the wiring.
- Two state libraries instead of one, each used for the job it is designed for.
