# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Play: choose a starter partner, then explore the infinite map with a D-pad (tap or hold) or the keyboard on web. The partner follows one step behind, and a status bar shows the partner and the ground underfoot.
- Battle: wild encounters in tall grass open a turn-based battle with animated HP bars, type-coloured move buttons, effectiveness messages, running away, and catching on a win. The partner gains a level per catch.
- Encounters are held in the store rather than the URL, and battle results save before the animation plays (ADR 0006).
- Tests for the starter, play and battle view models, the D-pad hold timing, the keyboard controls, the HP bar and the map grid.
- Glossary: every species with instant search by name or number, a type filter, paged scrolling, and caught markers.
- Pokémon detail page: artwork, types, category, description, height, weight, abilities, base stats, and the player's progress, with a "Make partner" action.
- Collection: caught Pokémon in dex order, a partner card, and caught and seen counts.
- Reusable components: AppText, Button, PokemonCard, SearchField, StatBar, TypeBadge, TypeFilterBar, Screen, and shared loading, error and empty states.
- View models for Glossary, detail and Collection; repository injection through React context; shared query definitions.
- Bricolage Grotesque display typeface.
- Component and view-model tests with React Native Testing Library.
- Project setup: Expo SDK 57, Expo Router, TypeScript strict, ESLint, Jest.
- Domain layer: seeded random generator, infinite procedural terrain, movement and collision, wild encounters with rarity weighting, 18-type chart, damage formula, battle engine, and collection rules.
- Data layer: HTTP client with timeouts and typed errors, PokéAPI DTOs and mappers, repository interface with PokéAPI and offline implementations.
- Persisted game store (Zustand and AsyncStorage).
- Tab shell for Play, Collection and Glossary.
- Architecture document, five ADRs, GitHub Actions CI, EAS and Vercel configuration.
