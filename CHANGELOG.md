# Changelog

All notable changes to this project are listed here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

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
