# Dev Log

Newest entries on top. Keep entries short and practical. Remove items once the underlying issue is resolved.

## 2026-05-05
- Mazing: added playback speed control to both maze video modals (`MazeModal` and `CommunityMazeModal`). New `SpeedControl` component offers 0.25×/0.5×/1×/1.5×/2× via a popover next to the duration label; tints active rate with the maze's category color. Styles added in `Mazing.module.css` (`.speedWrap`, `.speedBtn`, `.speedMenu`, `.speedOption`, `.speedOptionActive`).
- Repo bootstrap: `npm install` (74 packages). `npm run dev` runs on port 3001 (3000 already in use locally). `/mazing` returns 200, no compile errors.

## Known issues
- `npm install` reports 2 vulnerabilities (1 moderate, 1 high) — not addressed; run `npm audit` if needed.
- Dev port 3000 was busy on this machine, so Next picked 3001 automatically.
