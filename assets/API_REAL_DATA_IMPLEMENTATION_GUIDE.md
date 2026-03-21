# API Real-Data Implementation Guide

This is the canonical handoff for replacing mocked/fake leaderboard data with real Retrocycles data in this project.

It documents:
- Every API endpoint currently used by the app
- Exactly how each endpoint is queried
- How response fields are parsed and transformed
- Ranking/placement math and UI numbering behavior
- Known caveats and mismatch risks
- A practical migration checklist for another agent

---

## 1) Architecture Reality Check

The app currently uses **three live data sources** in `src/lib/rclApi.ts`:

1. Rankings HTML source (legacy style, parsed in browser):
   - `https://corsapi.armanelgtron.tk/rankings`
2. Match history + match details JSON source:
   - `https://retrocyclesleague.com/api/history`
3. Sumobar JSON API source:
   - `https://retrocyclesleague.com/api/v1/sumobar`

Important: there is also an older backend contract doc in `docs/RCL_API.md` describing `/api/v1/leaderboard` style routes. That contract is useful conceptually, but **the current live frontend implementation is built around the three sources above**.

---

## 2) Type System and Query Dimensions

Core types from `src/lib/types.ts`:

- `Season`: `"2023" | "2024" | "2025" | "2026"`
- `LeaderboardSeason`: `Season | "weekly"`
- `Region`: `"combined" | "us" | "eu"`
- `Mode`: `"tst" | "sbt"` (only `tst` is actively used for history/details)

Season mapping used for rankings/sumobar date windows (`SEASONS` in `src/lib/rclApi.ts`):

- `2026` -> `start=2026-01-01`, `end=2026-12-31`, `apiId=tst`
- `2025` -> `start=2025-01-01`, `end=2025-12-31`, `apiId=tst24`
- `2024` -> `start=2024-01-01`, `end=2024-12-31`, `apiId=tst24`
- `2023` -> `start=2023-01-01`, `end=2023-12-31`, `apiId=tst24`

Region suffixing for rankings:
- combined: no suffix
- us: `-us`
- eu: `-eu`

So effective ranking IDs become:
- `tst`, `tst-us`, `tst-eu`
- `tst24`, `tst24-us`, `tst24-eu`

---

## 3) Endpoint Catalog (Everything Currently Used)

## A) Rankings Table (HTML, parsed)

Base:
- `https://corsapi.armanelgtron.tk/rankings`

### A1. Seasonal/Weekly leaderboard table

Generated URL pattern:
- `GET /rankings/daterange.php?datel=YYYY-MM-DD&date=YYYY-MM-DD&id={apiId}`

Examples:
- Yearly 2026 combined:
  - `https://corsapi.armanelgtron.tk/rankings/daterange.php?datel=2026-01-01&date=2026-12-31&id=tst`
- Yearly 2025 EU:
  - `https://corsapi.armanelgtron.tk/rankings/daterange.php?datel=2025-01-01&date=2025-12-31&id=tst24-eu`
- Weekly combined:
  - `datel=today-6days`, `date=tomorrow`, `id=tst`

Used by:
- `getLeaderboardRows(...)`
- `getPlayerLeaderboardRank(username, season)` (rank lookup only)

Parsing behavior (`getLeaderboardRows`):
- Fetches HTML
- Uses `DOMParser` and reads `table tr`
- For each row:
  - `rank` from column 0 (fallback: row index)
  - `name` from column 1
  - `elo` from column 2 (fallback 1500)
  - `latestChange` from column 3
  - `changeDateText` from column 4 -> reduced to relative text (e.g. `"2 hours ago"`)
  - progress bars in column 5 used for placement rates and often match count extraction
  - supports two table shapes:
    - with explicit "played" column (`cells.length >= 11`)
    - without it (legacy table width)

Placement extraction:
- `pos1Rate` from first `.progress-bar[aria-valuenow]`
- `pos2Rate`, `pos3Rate` by checking progress bar `title` prefixes (`2nd`, `3rd`)
- `pos4Rate = max(0, 100 - pos1 - pos2 - pos3)`

Output shape:
- `LeaderboardRow` in app-normalized format:
  - `rank, name, elo, latestChange, lastActive, matches, winrate, avgPlace, avgScore, highScore, kd, pos1Rate..pos4Rate`

### A2. Player history list (JSON from rankings service)

Generated URL pattern:
- 2026:
  - `GET /rankings/?id=tst&type=history&mp={username}`
- 2023/2024/2025:
  - `GET /rankings/?id=tst24&type=history&daterange=1&datel={season}-01-01&date={season}-12-31&mp={username}`

Used by:
- `getPlayerProfileView(...)`

Expected payload:
- Array of match objects with `players[]`, each player containing fields like:
  - `player`, `team`, `place`, `score`, `alive`, `played`, `entryRating`, `exitRating`, `kd: [kills,deaths]`

How it is transformed:
- Finds the row where `p.player === username`
- Computes per-match row fields:
  - `change = exitRating - entryRating` (signed string)
  - `teamPlace = entry.place`
  - `individualPlace` computed by sorting all players by `score` desc and taking player index + 1
  - `played` / `alive` converted to `%` strings
  - `kd = kills/deaths` (or `kills.00` when deaths=0)
  - `teammates` from same-team players
- Sorts matches by match date descending

Summary math:
- `avgKd = totalKills / totalDeaths`
- `avgScore = round(totalScore / matchCount)`
- `avgAlive = average(alive ratio)` -> percent string
- `winRate = round((wins / matchCount) * 100)`
- `rageQuit = 100 - avgPlayedRatio*100`
- `latestElo` from latest match `exitRating` fallback `entryRating`

---

## B) Match History + Match Details (JSON)

Base:
- `https://retrocyclesleague.com/api/history`

### B1. Match list pages

URL pattern:
- `GET /api/history/{mode}?page={page}`
- Current mode usage: `tst`

Example:
- `https://retrocyclesleague.com/api/history/tst?page=1`

Used by:
- `getMatchHistory(mode, page)`
- Leaderboard match-history overlay (loads page 1 first)

Mapped list fields:
- `id`
- `date`
- `roundCount`
- `totalTimeSeconds` (`totalTime` alias accepted)
- `winner`

### B2. Match detail by ID

URL pattern:
- `GET /api/history/tst?id={matchId}`

Example:
- `https://retrocyclesleague.com/api/history/tst?id=6938f0afa70919054cbae32a`

Used by:
- `getMatchDetails(matchId)`
- Leaderboard overlay details for team/player table
- Tronnies 2025 featured-match data derivation (offline/manual workflow)

Expected detail shape (loosely typed):
- `{ teams: [{ teamName, score, players: [{ nickname|username, positions[] }] }] }`

Player score derivation used in overlay:
- Per position:
  - `score += kills * 30 + holePoints`
- Totals:
  - `kills = sum(position.kills)`
  - `deaths = sum(position.deaths)`
  - `kd = kills/deaths` (or `kills.00` if deaths=0)

Critical caveat:
- For authoritative **team scores**, use `teams[].score` from match-detail payload.
- Do not trust ranking-history player score sums as team-score truth for all use cases.

---

## C) Sumobar API (JSON)

Base:
- `https://retrocyclesleague.com/api/v1/sumobar`

Auth fallback behavior (`fetchSumobarJson`):
- First request: no auth header
- If `401`/`403`, retry with:
  1) `X-RCL-Sumobar-Token: {token}`
  2) then `Authorization: Bearer {token}`
- Token source:
  - `SUMOBAR_API_TOKEN` or `NEXT_PUBLIC_SUMOBAR_API_TOKEN`

### C1. Sumobar leaderboard

URL pattern:
- `GET /sumobar/leaderboard?limit={n}&offset={n}&min_matches={n}&[region={us|eu}]&datel=YYYY-MM-DD&date=YYYY-MM-DD`

Used by:
- `getSumobarLeaderboard(...)`
- Sumobar leaderboard rank lookup in profile view

Normalization logic:
- Input rows are loosely shaped; app maps aliases:
  - `player_auth` fallback `player_name`
  - `elo` fallback `rating`
  - `avg_position` fallback `avg_place`
  - `updated_at` fallback `last_active`
- Placement rates are inferred from many possible key names:
  - `place_1_rate`, `position1_rate`, `p1_count`, etc. through place 8
- `toPercentages(...)` handles input that may be:
  - fractions (0..1)
  - percentages
  - raw counts
  - arbitrary sums (normalized to 100)

Output shape:
- `SumobarLeaderboardResponse`
  - `rows: SumobarLeaderboardRow[]`
  - `pagination: { limit, offset, returned }`

### C2. Sumobar match history

URL pattern:
- `GET /sumobar/matches?limit={n}&offset={n}`

Used by:
- `getSumobarMatches(...)`
- Sumobar match-history overlay
- Sumobar profile mode

Mapped fields:
- match:
  - `matchId`, `roundsPlayed`, `winnerTeam`, `winnerPlayers[]`, `endedAt`, `players[]`
- player:
  - `playerName`, `team`, `kills`, `deaths`, `score`, `roundsPlayed`, `avgPlace`, `kd`

Error wrapping:
- Any fetch/parse error becomes:
  - `"Match history is temporarily unavailable. Please try again later."`

---

## 4) Exactly How Ranking Numbers Are Produced

There are multiple rank concepts in UI. This is important.

### 4.1 TST leaderboard table rank column

Pipeline:
1. Parse rank from HTML table row (source rank)
2. Filter rows by minimum matches:
   - yearly boards: `matches >= 10`
   - weekly board: `matches >= 1`
3. Apply current sort (default `elo desc`)
4. Reassign displayed rank as `index + 1`

Result:
- Displayed rank is **post-filter/post-sort UI rank**, not always the original source rank.

### 4.2 Profile page leaderboard rank

`getPlayerLeaderboardRank(...)`:
- Reads the rankings HTML table for the selected season
- Finds exact username (case-insensitive)
- Returns table rank cell (`cells[0]`) fallback row index

Result:
- Profile rank is closer to **source rank snapshot**, independent of profile match sorting.

### 4.3 Sumobar leaderboard rank

In main sumobar table:
- Display rank is page-relative index:
  - `displayRank = currentPageOffset + rowIndex + 1`

In sumobar profile:
- Rank is found by loading up to first 500 leaderboard rows and matching `playerAuth` case-insensitive.

---

## 5) "Make Fake Data Real" Map by UI Surface

Use this section as your build checklist.

### Leaderboard page (`src/leaderboard/LeaderboardApp.tsx`)

Real-data sources:
- TST board: `getLeaderboardRows(...)`
- Match-history modal:
  - list: `getMatchHistory("tst", 1)`
  - details: `getMatchDetails(matchId)` per match
- Sumobar board/history (currently feature-flagged off):
  - `getSumobarLeaderboard(...)`
  - `getSumobarMatches(...)`

Match-history score rendering:
- Team score from `detail.teams[].score`
- Player score/KD derived from `positions[]`

### Profile page (`src/profile/ProfileApp.tsx`)

Modes:
- `tst` -> `getPlayerProfileView({ username, season })`
- `sumobar` -> `getPlayerSumobarProfileView(username)`

TST profile includes:
- Seasonal history rows
- Summary block
- Leaderboard rank lookup
- ELO progression chart (from `exitRating` values)

### Tronnies page (`src/tronnies/Tronnies2025Page.tsx`)

Current status:
- Uses static snapshots from `src/tronnies/closestTstMatches.ts`

If making dynamic/real:
- Rebuild snapshots from live APIs:
  - Match list paging: `getMatchHistory("tst", page)`
  - Per-match detail: `getMatchDetails(id)`
- Keep tie-break/selection rules explicit in code (closest spread, highest total points, highest rated lobby, monthly counts)

---

## 6) Derived Metrics and Formulas (Canonical)

- `winrate` (leaderboard row): `pos1Rate / 100`
- `pos4Rate`: `max(0, 100 - pos1Rate - pos2Rate - pos3Rate)`
- `match player score` (detail overlay): `sum(kills*30 + holePoints)` over positions
- `profile row kd`: `kills/deaths`, fallback `kills.00` if deaths=0
- `profile avgKd`: `sumKills / sumDeaths`
- `profile winRate`: `round((wins / matches) * 100)`
- `profile rageQuit`: `100 - average(playedRatio)*100`

Sumobar-specific:
- `kdDiff` display uses `ratingChange` if present, else `(kills - deaths)`
- placement gradient uses 8-place rates if provided; otherwise estimated from avg position

---

## 7) Pagination and Data Window Rules

- TST leaderboard table UI page size: `100`
- TST profile table page/chunk reveal: 20 rows at a time (`show more`)
- Sumobar leaderboard fetch currently requests first 50 rows
- Sumobar profile rank lookup fetches up to 500 rows
- TST match-history overlay currently fetches page 1 only
- Tronnies yearly analyses historically required scanning deep history pages (not only early pages)

---

## 8) Known Data/Integration Gotchas

1. Rankings endpoint is HTML, not stable JSON.
   - Any table layout change can break parser assumptions.
2. Match-history endpoint and rankings history may disagree on some score-related fields.
   - For team score truth in match cards, prefer match-detail `teams[].score`.
3. Username matching is mostly case-insensitive in profile/rank lookups, but source data can vary in casing.
4. Weekly dates are generated client-side (today-based), so timezone/clock can affect window edges.
5. Sumobar may require token; missing token can silently downgrade to error state.
6. Some values can be null/missing (`avg_score`, `kd`, etc.); UI already has fallbacks, keep those.

---

## 9) Rank Tier Mapping (Visual + Logic)

Used by `getRankMeta(elo)` and `src/ranks/RanksApp.tsx`:

- bronze: `< 1400`
- silver: `1400 - 1599`
- gold: `1600 - 1899`
- platinum: `1900 - 2099`
- diamond: `2100 - 2199`
- master: `2200 - 2299`
- grandmaster: `2300 - 2399`
- legend: `2400+`

When ELO missing/invalid in places, fallbacks are used (commonly `1500` or `0` depending context).

---

## 10) Minimal Endpoint Reference (Copy/Paste Ready)

TST leaderboard HTML table:
- `GET https://corsapi.armanelgtron.tk/rankings/daterange.php?datel=2026-01-01&date=2026-12-31&id=tst`

TST player yearly history:
- `GET https://corsapi.armanelgtron.tk/rankings/?id=tst24&type=history&daterange=1&datel=2025-01-01&date=2025-12-31&mp=<username>`

TST match list:
- `GET https://retrocyclesleague.com/api/history/tst?page=1`

TST match detail:
- `GET https://retrocyclesleague.com/api/history/tst?id=<matchId>`

Sumobar leaderboard:
- `GET https://retrocyclesleague.com/api/v1/sumobar/leaderboard?limit=50&offset=0&min_matches=1&datel=2026-01-01&date=2026-12-31`

Sumobar matches:
- `GET https://retrocyclesleague.com/api/v1/sumobar/matches?limit=10&offset=0`

---

## 11) Migration Plan for Your Other Agent

If your redesigned leaderboard currently uses fake data, tell the other agent to do this in order:

1. Replace fake leaderboard rows with `getLeaderboardRows(...)` output.
2. Keep post-filter rank reindexing behavior (or intentionally remove it and document change).
3. Wire match-history modal with:
   - list from `getMatchHistory`
   - details from `getMatchDetails`
4. For profile pages:
   - use `getPlayerProfileView` for TST
   - preserve summary formulas exactly
5. If enabling sumobar:
   - set `SUMOBAR_ENABLED = true`
   - verify token handling if 401/403 appears
6. For any annual recap/featured match section:
   - derive from full-year history scan
   - use match-detail team scores for final presentation
7. Keep null-safe display fallbacks (`—`, `0`, empty lists) to avoid UI crashes.

---

## 12) Source-of-Truth Files

- API adapter and endpoint logic:
  - `src/lib/rclApi.ts`
- Shared data types:
  - `src/lib/types.ts`
- Leaderboard integration:
  - `src/leaderboard/LeaderboardApp.tsx`
- Profile integration:
  - `src/profile/ProfileApp.tsx`
- Tronnies static recap dataset:
  - `src/tronnies/closestTstMatches.ts`
- Tronnies rendering:
  - `src/tronnies/Tronnies2025Page.tsx`

If this guide and implementation ever diverge, treat `src/lib/rclApi.ts` as the final behavioral source.

