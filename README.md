# Pokédex Quest

A mobile Pokédex you can play. Browse every Pokémon from [PokéAPI](https://pokeapi.co), then walk an endless map, meet wild Pokémon in the tall grass, battle them, and add them to your collection.

Built with React Native and Expo as a take-home assessment for a Frontend / Mobile Developer role.

## Try it

| Platform | Link | Notes |
|---|---|---|
| Web | _Coming on day 3_ | Opens in any browser, nothing to install |
| Android | _Coming on day 3_ | Download the APK and allow installs from your browser |
| iOS | Use the web link | App Store and TestFlight are out of scope |

## Features

| Area | What it does | Status |
|---|---|---|
| Glossary | Every Pokémon with instant search by name or number, a type filter, paged scrolling, and a detail page with stats, abilities and description | Done |
| Collection | Pokémon you've caught and seen, and your battle partner, which you can change from any caught Pokémon's page | Done |
| Play | An infinite, procedurally generated map with lakes, forests, trails and tall grass. Move with a D-pad; wild Pokémon appear in tall grass | Game rules done, screen in progress |
| Battle | One-on-one, turn-based: pick an attack or run. Type effectiveness and speed matter. Win to catch it | Game rules done, screen in progress |

## Architecture at a glance

The code is split into four layers with one-way dependencies. The domain layer is pure TypeScript with no React, network or storage, so every game rule is unit-tested in isolation.

```
presentation  →  state  →  data  →  domain
(screens, view models)  (Zustand, TanStack Query)  (PokéAPI, mappers)  (pure game rules)
```

Screens follow MVVM: route files are views, hooks are view models, and the domain is the model.

Some choices worth a look:

- **The infinite map is a formula.** `tileAt(x, y, seed)` computes any tile from seeded noise, so the world never ends and is never stored.
- **All randomness is injected.** Encounters and battles take a seeded random generator, so tests can replay exact scenarios.
- **Battle is a pure reducer.** `resolveTurn(state, action, rng)` returns the next state and a list of events for the UI to animate.
- **One data contract.** The UI depends on a `PokemonRepository` interface, with a PokéAPI implementation and an offline one.

Read the full [architecture document](docs/ARCHITECTURE.md) and the [decision records](docs/adr).

## Getting started

Requirements: Node.js 22 and npm.

```bash
npm install
npm run web       # open in the browser
npm start         # scan the QR code with Expo Go on your phone
```

To run fully offline against fixtures:

```bash
EXPO_PUBLIC_USE_MOCK_API=true npm run web
```

### Scripts

| Command | What it does |
|---|---|
| `npm run web` | Start the app in a browser |
| `npm start` | Start the Expo dev server for Expo Go |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Run tests with a coverage report |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run validate` | Lint, typecheck and test, as CI does |
| `npm run build:web` | Export the static web build to `dist/` |

## Testing

140 tests across 18 suites cover the domain, data, state and presentation layers, including component tests and view-model tests with React Native Testing Library. Overall coverage is 97% of statements. CI fails if coverage drops below 90% for the domain and view models, or below 85% for the data layer.

| Area | Examples of what is tested |
|---|---|
| Random | Same seed gives the same sequence; weighted picks match their weights |
| Terrain | Same world for the same seed; all six terrain kinds appear; most of the map is walkable; spawn is always on land |
| Movement | Water and trees block every direction |
| Encounters | Only in tall grass; a break after each battle; the real rate stays close to 12%; legendaries are rarer |
| Type chart | Known matchups, dual types (4× and 0.25×), immunities |
| Battle | Turn order, speed ties, winning, losing, successful and failed escapes |
| Collection | Starter pick, repeat catches, partner rules, level cap, no mutation |
| Data | DTO mapping, unit conversion, flavor-text cleanup, timeouts, HTTP and network errors |
| Search | Name and number matching (`#025`, `Mr. Mime`), type filter combined with search, paging |
| Components | Type chips select and clear, cards report presses and caught state, stat bars never overflow, disabled buttons don't fire |
| View models | Glossary paging, search and type filter, error then retry, detail page progress and partner switch, collection ordering and counts |

## Development process

- **Branching:** short-lived feature branches merged into `main` through pull requests.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- **CI:** GitHub Actions runs lint, typecheck, tests with coverage, and a web build on every push and pull request.
- **Decisions:** recorded as ADRs in `docs/adr`.
- **Changes:** listed in [CHANGELOG.md](CHANGELOG.md).

## Tech stack

Expo SDK 57, React Native 0.86, TypeScript (strict), Expo Router, TanStack Query, Zustand, AsyncStorage, expo-image, Bricolage Grotesque (display type), Jest with `jest-expo` and React Native Testing Library, ESLint, GitHub Actions, EAS Build, and Vercel.

## Credits

Pokémon data and sprites come from [PokéAPI](https://pokeapi.co). Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc. This is a non-commercial fan project made for a technical assessment and is not affiliated with or endorsed by them.
