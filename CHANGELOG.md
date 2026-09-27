# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Project setup: Expo SDK 57, Expo Router, TypeScript strict, ESLint, Jest.
- Domain layer: seeded random generator, infinite procedural terrain, movement and collision, wild encounters with rarity weighting, 18-type chart, damage formula, battle engine, and collection rules.
- Data layer: HTTP client with timeouts and typed errors, PokéAPI DTOs and mappers, repository interface with PokéAPI and offline implementations.
- Persisted game store (Zustand and AsyncStorage).
- Glossary: every species with instant search by name or number, a type filter, paged scrolling, and caught markers.
- Pokémon detail page: artwork, types, category, description, height, weight, abilities, base stats, and the player's progress, with a "Make partner" action.
- Collection: caught Pokémon in dex order, a partner card, and caught and seen counts.
- Play: choose a starter partner, then explore the infinite map with a D-pad (tap or hold) or the keyboard on web. The partner follows one step behind, and a status bar shows the partner and the ground underfoot.
- Battle: wild encounters in tall grass open a turn-based battle with animated HP bars, type-coloured move buttons, effectiveness messages, running away, and catching on a win. The partner gains a level per catch. Battles open only from a real encounter, not the URL, and results save before the victory animation plays (ADR 0006).
- Start over: erase progress from the bottom of Collection with a two-tap confirm that works on web and native.
- Reusable components: AppText, Button, ConfirmButton, DPad, HpBar, MapGrid, PokemonCard, SearchField, StarterPicker, StatBar, TypeBadge, TypeFilterBar, Screen, and shared loading, error and empty states.
- View models for every screen; repository injection through React context; shared query definitions.
- Original app icon, Android adaptive and monochrome icons, splash screen and favicon, based on the in-game trainer token.
- Bricolage Grotesque display typeface.
- A crash screen with a Reload button instead of a blank page.
- `src/shared/tuning.ts` for walking speed, encounter rate and battle message speed.
- Unit, component and view-model tests with Jest and React Native Testing Library, with coverage thresholds enforced in CI.
- Architecture document, six ADRs, deployment guide, pull request template, GitHub Actions CI, and EAS and Vercel configuration.

### Fixed

- Saved progress now loads before the app appears. Previously a returning player could briefly see the starter picker, and choosing a starter there would overwrite their save.
- The splash screen stays up until fonts and saved progress are ready, instead of flashing a blank screen.
