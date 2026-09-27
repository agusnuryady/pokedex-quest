# Pokédex Quest

A mobile Pokédex you can play. Browse every Pokémon from [PokéAPI](https://pokeapi.co), then walk an endless map, meet wild Pokémon in the tall grass, battle them, and add them to your collection.

Built with React Native and Expo as a take-home assessment for a Frontend / Mobile Developer role.

## Try it

| Platform | Link | Notes |
|---|---|---|
| Web | **[Open Pokédex Quest](https://YOUR-VERCEL-URL)** | Any browser, nothing to install. Keyboard: arrow keys or WASD |
| Android | **[Install the APK](https://YOUR-EAS-BUILD-URL)** | Android will ask you to allow the install and may show a Play Protect warning: choose "Install anyway" |
| iOS | Use the web link | App Store and TestFlight are out of scope |

How these are built and published is in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Features

| Area | What it does | Status |
|---|---|---|
| Glossary | Every Pokémon with instant search by name or number, a type filter, paged scrolling, and a detail page with stats, abilities and description | Done |
| Collection | Pokémon you've caught and seen, and your battle partner, which you can change from any caught Pokémon's page | Done |
| Play | Pick Bulbasaur, Charmander or Squirtle as your partner, then explore an infinite, procedurally generated map of lakes, forests, trails and tall grass. Walk with the on-screen D-pad (hold to keep walking) or the arrow keys and WASD on web. Your partner follows one step behind | Done |
| Battle | Wild Pokémon appear in tall grass. Fight one-on-one, turn by turn: pick an attack or run. Type effectiveness and speed matter, and HP bars drop as each hit lands. Win to catch it, and your partner gains a level | Done |

## How to play

1. Open the Play tab and choose a partner.
2. Walk with the D-pad, or the arrow keys or WASD on a keyboard.
3. Step into the dark green tall grass. Wild Pokémon appear there, usually within 20 steps.
4. Pick an attack each turn. A move that matches the wild Pokémon's weakness does double damage. Run if the fight looks bad.
5. Win to catch it. Your partner gains a level, and the catch appears in Collection and is marked in the Glossary.

Progress is saved on the device, so it survives closing the app or the browser. To reset, scroll to the bottom of Collection and tap **Start over** twice.

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

203 tests across 28 suites cover every layer, from pure game rules up to whole screens. Screen tests mount the real app (every route and the real tab bar) inside a real router, then tap and type the way a person would. Overall coverage is 98% of statements. CI fails if coverage drops below 90% for the domain and view models, or below 85% for the data layer and screens.

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
| Game view models | Starter choice, movement and collision, the partner following, encounters in tall grass, a full battle won with a catch and level-up, running away, the result saved only once |
| Game components | D-pad tap and hold-to-walk timing, keyboard controls on web only, HP bar colours, map layout, two-tap confirm for Start over |
| Persistence | A saved game is restored from device storage; an in-progress battle is never saved |
| Screens | Tab bar icons and switching; Glossary search, type filter, empty state and caught markers; detail page stats and partner switch; Collection empty state, partner card and Start over; starter pick and walking; stepping into tall grass opens a battle; winning, catching, running away, load errors; a typed-in `/battle` URL is sent back to the map; the crash screen |

## Development process

- **Branching:** short-lived feature branches merged into `main` through pull requests.
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- **CI:** GitHub Actions runs lint, typecheck, tests with coverage, and a web build on every push and pull request.
- **Decisions:** recorded as ADRs in `docs/adr`.
- **Changes:** listed in [CHANGELOG.md](CHANGELOG.md).
- **Pull requests:** a template asks for test steps and a validation checklist.
- **Tuning:** every number that affects how the game feels (walking speed, encounter rate, battle message speed) lives in `src/shared/tuning.ts`.

## Troubleshooting

**Errors mentioning files like `._index.tsx`.** macOS creates hidden `._name` files when a project lives on an exFAT or other non-Apple drive. The project already ignores them in git, Metro, ESLint and Jest. To remove existing ones, run `find . -name '._*' -type f -not -path './node_modules/*' -delete`. Keeping the project on the Mac's internal disk avoids them entirely.

**Typecheck errors about route names.** Expo Router generates route types in `.expo/`. After adding or renaming screens, run `rm -rf .expo` and start the app again.

## Tech stack

Expo SDK 57, React Native 0.86, TypeScript (strict), Expo Router, expo-splash-screen, @expo/vector-icons (Ionicons), TanStack Query, Zustand, AsyncStorage, expo-image, Bricolage Grotesque (display type), Jest with `jest-expo` and React Native Testing Library, ESLint, GitHub Actions, EAS Build, and Vercel.

## Credits

Pokémon data and sprites come from [PokéAPI](https://pokeapi.co). Pokémon and Pokémon character names are trademarks of Nintendo, Creatures Inc. and GAME FREAK inc. This is a non-commercial fan project made for a technical assessment and is not affiliated with or endorsed by them.
