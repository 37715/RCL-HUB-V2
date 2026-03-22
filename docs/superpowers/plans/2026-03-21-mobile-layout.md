# Mobile Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adapt the RCL leaderboard for mobile with two-line rows, a persistent bottom nav bar, scrollable controls, and bottom-sheet panels.

**Architecture:** Pure CSS-first approach — mobile behaviour is gated behind `@media (max-width: 768px)` rules. New JSX elements added to `LeaderboardEntry` for the mobile-specific rows (hidden on desktop via CSS). A new `MobileBottomNav` component lives inside `LeaderboardClient` and is hidden on desktop. A custom `rcl:openmenu` DOM event bridges the bottom nav's Menu button to the Nav sidebar without prop drilling.

**Tech Stack:** Next.js 14 App Router, CSS Modules, React 18, no new dependencies.

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `src/app/layout.tsx` | Add viewport meta tag |
| Modify | `.gitignore` | Add `.superpowers/` |
| Modify | `src/components/layout/Nav.module.css` | Hide links at ≤768px |
| Modify | `src/components/layout/Nav.tsx` | Listen for `rcl:openmenu` custom event |
| Modify | `src/components/leaderboard/LeaderboardEntry.tsx` | Add `mobileRow2`, `mobileRow3` JSX children |
| Modify | `src/components/leaderboard/LeaderboardEntry.module.css` | Mobile grid layout (3-col 2-row), hide desktop cells, style mobile rows |
| Modify | `src/components/leaderboard/LeaderboardControls.module.css` | Scrollable tabs + compact chip filters at ≤768px |
| Modify | `src/components/leaderboard/LeaderboardControls.tsx` | Hide Records/MatchHistory buttons on mobile (CSS) |
| Create | `src/components/leaderboard/MobileBottomNav.tsx` | Board / Matches / Records / Mazing / Menu nav |
| Create | `src/components/leaderboard/MobileBottomNav.module.css` | Bottom nav styles, desktop hidden |
| Modify | `src/components/leaderboard/LeaderboardClient.tsx` | Render `<MobileBottomNav>`, add bottom padding class |
| Modify | `src/components/leaderboard/LeaderboardClient.module.css` | Add mobile bottom padding, fix `tableSection` |

---

## Task 1: Foundation — viewport meta + gitignore

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `.gitignore`

- [ ] **Step 1: Add viewport meta tag**

  In `src/app/layout.tsx`, add inside `<head>`:

  ```tsx
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ```

  Full head block becomes:
  ```tsx
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script dangerouslySetInnerHTML={{ __html: `try{var s=JSON.parse(localStorage.getItem('rcl_settings')||'{}');if(s.laggyMode)document.documentElement.setAttribute('data-low-perf','')}catch(e){}` }} />
  </head>
  ```

- [ ] **Step 2: Update .gitignore**

  Append to `.gitignore`:
  ```
  # Visual companion brainstorm files
  .superpowers/
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/app/layout.tsx .gitignore
  git commit -m "chore: add viewport meta tag and ignore .superpowers dir"
  ```

---

## Task 2: Nav — hide links on mobile, wire Menu event

**Files:**
- Modify: `src/components/layout/Nav.module.css`
- Modify: `src/components/layout/Nav.tsx`

- [ ] **Step 1: Hide nav links at ≤768px**

  In `Nav.module.css`, update the existing `@media (max-width: 768px)` block:

  ```css
  @media (max-width: 768px) {
    .brand { padding: 0 20px; font-size: 22px; }
    .links { display: none; }
    .menuBtn { padding: 0 20px; }
  }
  ```

- [ ] **Step 2: Listen for rcl:openmenu custom event**

  In `Nav.tsx`, first update the React import to include `useEffect`:

  ```tsx
  import { useState, useEffect } from 'react'
  ```

  Then add a `useEffect` inside the component body (after the `useState`):

  ```tsx
  useEffect(() => {
    const handler = () => setSidebarOpen(true)
    window.addEventListener('rcl:openmenu', handler)
    return () => window.removeEventListener('rcl:openmenu', handler)
  }, [])
  ```

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/layout/Nav.module.css src/components/layout/Nav.tsx
  git commit -m "feat(mobile): hide nav links on mobile, wire rcl:openmenu event"
  ```

---

## Task 3: LeaderboardEntry — two-line mobile rows + advanced line 3

**Files:**
- Modify: `src/components/leaderboard/LeaderboardEntry.tsx`
- Modify: `src/components/leaderboard/LeaderboardEntry.module.css`

This is the core mobile layout change. On desktop everything is unchanged. On mobile (≤768px):
- Row switches from 8-column grid to a 3-column × 2-row grid: `44px 1fr auto`
- `rankCell` spans both rows (vertically centred)
- `playerCell` sits col 2 row 1
- ELO `dc` sits col 3 row 1
- All other desktop cells are `display:none`
- A new `mobileRow2` div (col 2–3, row 2) shows K/D · matches · last active
- The existing `subRow` (advanced stats strip) needs its mobile indent fixed

- [ ] **Step 1: Add mobileRow2 and mobileRow3 JSX**

  In `LeaderboardEntry.tsx`, inside the `.row` div, append after the `tierCell` div:

  ```tsx
  {/* Mobile-only row 2: K/D · matches · last active */}
  <div className={styles.mobileRow2}>
    <span style={{ color: player.kd > 0 ? kdColor : 'var(--muted)', fontWeight: 700 }}>
      {player.kd > 0 ? player.kd.toFixed(2) : '—'} K/D
    </span>
    <span className={styles.mobileSep}>·</span>
    <span>{player.matches}M</span>
    <span className={styles.mobileSep}>·</span>
    <span>{player.lastActive}</span>
  </div>
  ```

  Note: `mobileRow2` is hidden on desktop via CSS (`display: none`). It only renders visually on mobile.

- [ ] **Step 2: Add mobile advanced row to subRowInner in TSX**

  The existing `subRowInner` already contains the 5 advanced stats. We do NOT change its JSX — we fix it with CSS only in the next step.

- [ ] **Step 3: Add mobile CSS to LeaderboardEntry.module.css**

  Add a new `.mobileRow2` rule (hidden on desktop) and a `@media (max-width: 768px)` block at the bottom of the file:

  ```css
  /* ── Mobile row 2 — hidden on desktop ── */
  .mobileRow2 {
    display: none;
  }

  @media (max-width: 768px) {
    /* Switch row to 3-column 2-row grid */
    .row {
      grid-template-columns: 44px 1fr auto;
      grid-template-rows: auto auto;
      column-gap: 10px;
      row-gap: 0;
      padding: 10px 16px;
      min-height: auto;
    }

    /* Rank spans both rows, centred */
    .rankCell {
      grid-column: 1;
      grid-row: 1 / 3;
      align-self: center;
      padding-left: 0;
    }

    .rankNum {
      font-size: 22px;
    }

    /* Player cell: row 1 col 2 (auto-placed) */
    .playerCell {
      padding-right: 8px;
      gap: 8px;
    }

    .avatar {
      width: 28px;
      height: 28px;
      font-size: 11px;
    }

    .username {
      font-size: 14px;
    }

    /* ELO: row 1 col 3 (auto-placed) */
    /* dc is 3rd child — auto-placed correctly */

    /* Hide all desktop-only columns */
    .dc:nth-child(4),
    .dc:nth-child(5),
    .dc:nth-child(6),
    .dc:nth-child(7),
    .tierCell {
      display: none;
    }

    /* Mobile row 2: K/D · matches · last active */
    .mobileRow2 {
      display: flex;
      align-items: center;
      gap: 5px;
      grid-column: 2 / span 2;
      grid-row: 2;
      padding-bottom: 2px;
      font-family: var(--font-mono), monospace;
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 0.5px;
    }

    /* Advanced sub-row: remove desktop indent, use compact layout */
    .subRowInner {
      padding: 6px 16px 8px 54px;
      flex-wrap: wrap;
      gap: 0;
    }

    .subStat {
      padding: 4px 10px 0;
      flex: none;
    }

    .subRowOpen {
      max-height: 80px;
    }
  }
  ```

  Important: `dc:nth-child(4)` counts from 1 among all children of `.row`. The children in order are: `rankCell`(1), `playerCell`(2), `dc elo`(3), `dc kd`(4), `dc lastActive`(5), `dc matches`(6), `dc winDist`(7), `tierCell`(8), `mobileRow2`(9). So nth-child(4) through (7) targets kd/lastActive/matches/winDist correctly. `tierCell` is a separate class, handled explicitly.

- [ ] **Step 4: Fix the mobileSep class**

  Add to `LeaderboardEntry.module.css` (outside the media query, near other utility styles):

  ```css
  .mobileSep {
    color: rgba(255, 255, 255, 0.2);
    font-size: 10px;
  }
  ```

- [ ] **Step 5: Verify in browser**

  Open the leaderboard on a mobile viewport (375px). Each row should show:
  - Line 1: rank number | flag/avatar + name | ELO (tier-coloured)
  - Line 2 (indented under name): K/D · matches · last active

  Toggle "Advanced Stats" — each row should grow to show a 3rd line with Win Rate, Avg Pos, Avg Score, High Score, Rating Δ.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/leaderboard/LeaderboardEntry.tsx src/components/leaderboard/LeaderboardEntry.module.css
  git commit -m "feat(mobile): two-line leaderboard rows with optional advanced line"
  ```

---

## Task 4: LeaderboardControls — scrollable tabs + compact filters on mobile

**Files:**
- Modify: `src/components/leaderboard/LeaderboardControls.module.css`

On mobile:
- Mode tabs row: horizontally scrollable, no scrollbar, smaller font
- Filter row: horizontally scrollable chip row
- Records and MatchHistory action buttons: hidden (they live in the bottom nav)
- Advanced Stats button: stays, but compact (icon only at very small sizes)

- [ ] **Step 1: Add mobile CSS**

  Append to `LeaderboardControls.module.css`:

  ```css
  @media (max-width: 768px) {
    .controls {
      padding: 0;
      gap: 0;
    }

    /* Mode tabs: horizontal scroll */
    .modeTabs {
      overflow-x: auto;
      scrollbar-width: none;
      padding: 0 16px;
    }

    .modeTabs::-webkit-scrollbar {
      display: none;
    }

    .modeTab {
      font-size: 14px;
      letter-spacing: 2px;
      padding: 12px 20px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Filter row: horizontal scroll */
    .filterRow {
      overflow-x: auto;
      scrollbar-width: none;
      flex-wrap: nowrap;
      padding: 10px 16px;
      gap: 8px;
      align-items: center;
      border-top: 1px solid var(--line);
    }

    .filterRow::-webkit-scrollbar {
      display: none;
    }

    /* Filter groups: inline, no label text */
    .filterGroup {
      gap: 0;
      flex-shrink: 0;
    }

    .filterLabel {
      display: none;
    }

    .filterBtn {
      padding: 7px 12px;
      font-size: 11px;
      letter-spacing: 1.5px;
    }

    /* Keep dividers hidden (already done at 900px) */

    /* Hide Records and MatchHistory from the filter row — they live in bottom nav */
    /* These are the first two .advancedBtn elements */
    .advancedBtn:nth-of-type(1),
    .advancedBtn:nth-of-type(2) {
      display: none;
    }

    /* Advanced Stats button: compact */
    .advancedBtn {
      padding: 7px 12px;
      font-size: 11px;
      letter-spacing: 1.5px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .spacer {
      display: none;
    }
  }
  ```

  Note: `advancedBtn:nth-of-type` won't work reliably across elements. Instead, add specific classes to the Records and MatchHistory buttons in the TSX in the next step.

- [ ] **Step 2: Add mobileHide class to Records and MatchHistory buttons**

  In `LeaderboardControls.tsx`, add `styles.mobileHide` to the Records and MatchHistory `advancedBtn` elements:

  ```tsx
  <button
    className={`${styles.advancedBtn} ${recordsOpen ? styles.advancedActive : ''} ${styles.mobileHide}`}
    onClick={onRecordsOpen}
  >
  ```

  ```tsx
  <button
    className={`${styles.advancedBtn} ${matchHistoryOpen ? styles.advancedActive : ''} ${styles.mobileHide}`}
    onClick={onMatchHistoryOpen}
  >
  ```

  Add to `LeaderboardControls.module.css`:

  ```css
  @media (max-width: 768px) {
    .mobileHide {
      display: none;
    }
  }
  ```

  (Add this inside the existing `@media (max-width: 768px)` block you created in Step 1.)

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/leaderboard/LeaderboardControls.module.css src/components/leaderboard/LeaderboardControls.tsx
  git commit -m "feat(mobile): scrollable mode tabs and compact filter chips"
  ```

---

## Task 5: MobileBottomNav — new bottom navigation component

**Files:**
- Create: `src/components/leaderboard/MobileBottomNav.tsx`
- Create: `src/components/leaderboard/MobileBottomNav.module.css`
- Modify: `src/components/leaderboard/LeaderboardClient.tsx`
- Modify: `src/components/leaderboard/LeaderboardClient.module.css`

The bottom nav has 5 items: Board (leaderboard), Matches (opens RecentMatchesPanel), Records (opens RecordsPanel), Mazing (link to /mazing), Menu (fires `rcl:openmenu` event to open sidebar). It is `position: fixed; bottom: 0` and only visible at ≤768px.

- [ ] **Step 1: Create MobileBottomNav.tsx**

  ```tsx
  'use client'

  import Link from 'next/link'
  import { usePathname } from 'next/navigation'
  import styles from './MobileBottomNav.module.css'

  interface Props {
    matchHistoryOpen: boolean
    recordsOpen: boolean
    onMatchHistoryOpen: () => void
    onRecordsOpen: () => void
  }

  export default function MobileBottomNav({
    matchHistoryOpen,
    recordsOpen,
    onMatchHistoryOpen,
    onRecordsOpen,
  }: Props) {
    const pathname = usePathname()
    const isBoard = pathname.startsWith('/leaderboard')
    const isMazing = pathname.startsWith('/mazing')

    function openMenu() {
      window.dispatchEvent(new Event('rcl:openmenu'))
    }

    return (
      <nav className={styles.nav}>
        <Link href="/leaderboard" className={`${styles.item} ${isBoard && !matchHistoryOpen && !recordsOpen ? styles.active : ''}`}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
            <rect x="2" y="10" width="4" height="8" fill="currentColor" opacity="0.7" />
            <rect x="8" y="6" width="4" height="12" fill="currentColor" />
            <rect x="14" y="2" width="4" height="16" fill="currentColor" opacity="0.7" />
          </svg>
          <span>Board</span>
        </Link>

        <button className={`${styles.item} ${matchHistoryOpen ? styles.active : ''}`} onClick={onMatchHistoryOpen}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
            <line x1="10" y1="10" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="10" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Matches</span>
        </button>

        <button className={`${styles.item} ${recordsOpen ? styles.active : ''}`} onClick={onRecordsOpen}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
            <path d="M10 2L7 6H3v5c0 5 3.5 7.5 7 8.5 3.5-1 7-3.5 7-8.5V6h-4L10 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span>Records</span>
        </button>

        <Link href="/mazing" className={`${styles.item} ${isMazing ? styles.active : ''}`}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
            <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 7h2v2H7zM11 7h2v4h-2zM7 11h2v2H7zM11 13h2v2h-2z" fill="currentColor" opacity="0.7" />
          </svg>
          <span>Mazing</span>
        </Link>

        <button className={styles.item} onClick={openMenu}>
          <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
            <line x1="3" y1="6" x2="17" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span>Menu</span>
        </button>
      </nav>
    )
  }
  ```

- [ ] **Step 2: Create MobileBottomNav.module.css**

  ```css
  /* Hidden on desktop */
  .nav {
    display: none;
  }

  @media (max-width: 768px) {
    .nav {
      display: flex;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 56px;
      background: rgba(8, 8, 16, 0.97);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255, 255, 255, 0.10);
      z-index: 400;
      align-items: stretch;
    }

    .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-family: var(--font-barlow), sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.35);
      background: none;
      border: none;
      cursor: pointer;
      text-decoration: none;
      padding: 6px 4px;
      transition: color 0.15s;
      -webkit-tap-highlight-color: transparent;
    }

    .item:hover {
      color: rgba(255, 255, 255, 0.6);
    }

    .item.active {
      color: var(--accent);
    }

    .icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
    }
  }
  ```

- [ ] **Step 3: Render MobileBottomNav in LeaderboardClient**

  In `LeaderboardClient.tsx`:

  Add import at top:
  ```tsx
  import MobileBottomNav from './MobileBottomNav'
  ```

  Inside the `return`, add before the closing `</div>`:
  ```tsx
  <MobileBottomNav
    matchHistoryOpen={matchHistoryOpen}
    recordsOpen={recordsOpen}
    onMatchHistoryOpen={() => setMatchHistoryOpen(true)}
    onRecordsOpen={() => setRecordsOpen(true)}
  />
  ```

- [ ] **Step 4: Add bottom padding for mobile nav**

  In `LeaderboardClient.module.css`, update the `@media (max-width: 768px)` block:

  ```css
  @media (max-width: 768px) {
    .hero { padding: 32px 16px 0; }
    .heroInner { flex-direction: column; align-items: flex-start; padding-bottom: 20px; gap: 12px; }
    .heroRight { align-items: flex-start; }
    .tableSection { padding: 0 0 80px; }
    /* 80px bottom = 56px nav + 24px breathing room */
    .page { padding-bottom: 56px; }
  }
  ```

  Also update the hero font size to be less huge on mobile. In `LeaderboardClient.module.css`, the `.heroTitle` uses `clamp(72px, 10vw, 140px)` — this already scales down via `10vw` on small screens (375px → 37.5px) which is reasonable.

- [ ] **Step 5: Commit**
  ```bash
  git add src/components/leaderboard/MobileBottomNav.tsx src/components/leaderboard/MobileBottomNav.module.css src/components/leaderboard/LeaderboardClient.tsx src/components/leaderboard/LeaderboardClient.module.css
  git commit -m "feat(mobile): add persistent bottom navigation bar"
  ```

---

## Task 6: Panel bottom-sheet + z-index above bottom nav

**Files:**
- Modify: `src/components/leaderboard/RecordsPanel.module.css`
- Modify: `src/components/leaderboard/LeaderboardClient.module.css`
- Modify: `src/components/leaderboard/AdvancedStatsPanel.module.css`
- Modify: `src/components/leaderboard/RecentMatchesPanel.module.css`

`AdvancedStatsPanel` and `RecentMatchesPanel` already have bottom-sheet positioning at ≤768px. `RecordsPanel` does not — its `@media (max-width: 768px)` block only adjusts the inner row grid, leaving the panel centred rather than anchored to the bottom. All three panels use `z-index: 300`; the bottom nav is `z-index: 400`, so panels need to be raised to sit above it.

- [ ] **Step 1: Add bottom-sheet layout to RecordsPanel**

  In `RecordsPanel.module.css`, replace the existing `@media (max-width: 768px)` block with:

  ```css
  @media (max-width: 768px) {
    .outer {
      top: 0;
      padding: 0;
      align-items: flex-end;
      z-index: 500;
    }

    .panel {
      width: 100vw;
      max-height: 90dvh;
      border-left: none;
      border-right: none;
      border-bottom: none;
    }

    .row {
      grid-template-columns: 36px 1fr auto 26px;
      padding: 12px 16px;
      gap: 8px;
    }
    .rowBadge { display: none; }
    .rowValue { font-size: 22px; }
    .tab { padding: 12px 20px; }
    .header { padding: 18px 20px; }
    .listLabel { padding: 14px 20px 10px; }
  }
  ```

- [ ] **Step 2: Raise z-index on AdvancedStatsPanel and RecentMatchesPanel**

  In `AdvancedStatsPanel.module.css`, inside the existing `@media (max-width: 768px)` block, add:
  ```css
  .panelOuter { z-index: 500; }
  ```

  In `RecentMatchesPanel.module.css`, inside the existing `@media (max-width: 768px)` block, add:
  ```css
  .outer { z-index: 500; }
  ```

- [ ] **Step 3: Raise backdrop above bottom nav**

  In `LeaderboardClient.module.css`, inside the `@media (max-width: 768px)` block (already modified in Task 5), add:
  ```css
  .panelBackdrop { z-index: 450; }
  ```

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/leaderboard/LeaderboardClient.module.css src/components/leaderboard/AdvancedStatsPanel.module.css src/components/leaderboard/RecordsPanel.module.css src/components/leaderboard/RecentMatchesPanel.module.css
  git commit -m "fix(mobile): RecordsPanel bottom sheet + raise all panel z-index above nav"
  ```

---

## Task 7: Smoke test and polish

- [ ] **Step 1: Test on 375px viewport (iPhone SE)**

  Open dev tools → iPhone SE (375×667). Verify:
  - [ ] Nav shows only RCL brand + menu button
  - [ ] Leaderboard rows are 2-line (rank | name | ELO / K/D · matches · date)
  - [ ] Toggling Advanced Stats adds a 3rd stats line to each row
  - [ ] Mode tabs scroll horizontally without wrapping
  - [ ] Filter chips appear in a single scrollable row
  - [ ] Bottom nav is visible at the bottom with 5 items
  - [ ] Tapping "Matches" opens the Recent Matches bottom sheet
  - [ ] Tapping "Records" opens the Records bottom sheet
  - [ ] Tapping "Menu" opens the sidebar
  - [ ] Tapping "Board" while a panel is open: panel stays on top (backdrop blocks)
  - [ ] Tapping the backdrop closes the panel

- [ ] **Step 2: Test on 768px viewport (tablet edge)**

  Verify the layout transitions cleanly — no broken states at exactly 768px.

- [ ] **Step 3: Test on desktop (1440px)**

  Verify nothing changed on desktop: 8-column rows, normal controls, no bottom nav visible.

- [ ] **Step 4: Final commit**
  ```bash
  git add -A
  git commit -m "feat: mobile-responsive leaderboard layout"
  ```
