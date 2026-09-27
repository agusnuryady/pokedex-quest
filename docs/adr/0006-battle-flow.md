# 0006. Encounters live in the store, and battle results save immediately

Date: 2026-09-27 · Status: Accepted

## Context

A battle starts when the player steps into tall grass and the encounter roll succeeds. The battle screen needs to know which Pokémon appeared and at what level. On web, anything passed in the URL can be edited, and on Android the back button can close the battle at any moment, including mid-animation.

## Decision

The encounter is stored in the game store (`startEncounter`), not passed as a route parameter. The battle screen reads it from there and redirects to the map if there is none, so a battle can only begin from a real encounter. The encounter is not persisted, so reopening the app never resumes a half-finished battle.

The battle engine resolves a whole turn at once. The screen then plays the turn back as a sequence of frames (`buildTurnFrames`), each a message plus the HP values to show with it, so the bars drop in the same order as the messages. The result (catch and level-up) is saved the moment the engine decides it, before the animation plays, and a guard ensures it is saved only once.

Leaving the battle by any route (button, back button, or gesture) clears the encounter, and doing so mid-battle counts as running away. This also restarts the four-step break before the next encounter.

## Consequences

- Typing `/battle` into the address bar cannot be used to catch a chosen Pokémon.
- Closing the app during the victory animation cannot lose a catch.
- The map can never get stuck in "in battle" mode after an unexpected exit.
- Animation timing lives only in the view model. The engine stays instant and fully unit-tested.
