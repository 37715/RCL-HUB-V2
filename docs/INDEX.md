# Docs Index

Central map of project documentation. Update entries here when adding new docs.

## Top-level
- `DEVLOG.md` — Running log of meaningful changes and known issues. Update after every meaningful change.
- `pwa-setup.md` — PWA installation / manifest / icon setup notes.

## Areas
- `superpowers/plans/` — Larger feature plans / RFC-style docs.
  - `2026-03-21-mobile-layout.md` — Mobile layout plan.

## Code map (for quick navigation)
- `src/app/` — Next.js App Router pages.
  - `mazing/` — Maze archive (Finite / Infinite / Community) with video modal + playback controls.
  - `leaderboard/`, `tronnies/`, `tutorials/`, `player/`, `settings/`, `support/`, `about/`, `api/`.
- `src/components/` — Shared UI (`layout/`, `leaderboard/`).
- `src/data/` — Static data (e.g. `mazes`).
- `src/types/` — Shared TS types.
- `src/lib/` — Utilities.
- `assets/` — Source assets (mazes, profiles, ranks, …); built copies go to `public/assets/`.
