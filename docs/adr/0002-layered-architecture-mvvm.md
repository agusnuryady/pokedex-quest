# 0002. Layered architecture with an MVVM presentation layer

Date: 2026-09-27 · Status: Accepted

## Context

The brief asks for SDLC practice and a recognised pattern such as MVC or MVP, with reusable components, reusable functions and unit tests. Game rules (terrain, encounters, damage) are the riskiest logic and must be testable without rendering anything.

## Decision

Split the code into four layers with one-way dependencies: presentation → state → data → domain. The domain is pure TypeScript with no React, storage, or network imports. Screens use MVVM: route files are the View, custom hooks are the ViewModel, and the domain is the Model.

MVVM was chosen over MVC or MVP because React hooks already play the ViewModel role. Forcing controllers or presenter classes onto React would add ceremony without adding testability.

## Consequences

- All game rules are unit-tested in isolation. The domain has close to 100% coverage.
- Screens stay thin, so UI changes rarely touch logic.
- There is more indirection than a single-file prototype, which is an acceptable cost for an app assessed on structure.
