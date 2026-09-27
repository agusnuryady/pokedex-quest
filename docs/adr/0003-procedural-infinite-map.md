# 0003. Infinite map computed from seeded noise, rendered as a View grid

Date: 2026-09-27 · Status: Accepted

## Context

Play mode needs a map the player can walk forever. Storing tiles would grow without bound. Rendering must work on Android, iOS and web.

## Decision

Tiles are a pure function, `tileAt(x, y, seed)`, built from two-octave value noise: elevation decides water, sand, land and forest; moisture decides tall grass; a narrow band of a third noise field draws footpaths. The screen renders only the visible window from `getViewport()` as a grid of plain React Native Views.

React Native Skia was considered. It would render faster, but on web it needs an extra WebAssembly download and setup, and the grid is small (around 15 × 25 tiles), so plain Views are fast enough.

## Consequences

- The world is infinite and costs no memory. Only the seed and player position are persisted.
- The same seed always reproduces the same world, which makes terrain testable and bugs reproducible.
- Terrain cannot be edited. That is fine for this game.
- If rendering is slow on low-end Android, the fallback is memoised tile rows, and Skia remains an option later.
