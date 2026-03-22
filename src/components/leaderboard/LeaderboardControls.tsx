'use client'

import type { GameMode, Season, Region, TimePeriod, StatsMode } from '@/types'
import styles from './LeaderboardControls.module.css'

interface Props {
  gameMode: GameMode
  season: Season
  region: Region
  period: TimePeriod
  statsMode: StatsMode
  matchHistoryOpen?: boolean
  recordsOpen?: boolean
  onGameModeChange: (m: GameMode) => void
  onSeasonChange: (s: Season) => void
  onRegionChange: (r: Region) => void
  onPeriodChange: (p: TimePeriod) => void
  onStatsModeToggle: () => void
  onMatchHistoryOpen: () => void
  onRecordsOpen: () => void
}

const GAME_MODES: { label: string; value: GameMode }[] = [
  { label: 'TST', value: 'tst' },
  { label: 'SUMOBAR', value: 'sumobar' },
  { label: 'FORTRESS', value: 'fortress' },
  { label: '1V1', value: '1v1' },
]

const SEASONS: { label: string; value: Season }[] = [
  { label: 'S1', value: 1 },
  { label: 'S2', value: 2 },
  { label: 'S3', value: 3 },
  { label: 'S4', value: 4 },
]

const REGIONS: { label: string; value: Region }[] = [
  { label: 'ALL', value: 'combined' },
  { label: 'EU', value: 'eu' },
  { label: 'NA', value: 'na' },
]

const PERIODS: { label: string; value: TimePeriod }[] = [
  { label: 'ALL TIME', value: 'all' },
  { label: 'WEEKLY', value: 'weekly' },
]

export default function LeaderboardControls({
  gameMode, season, region, period, statsMode, matchHistoryOpen, recordsOpen,
  onGameModeChange, onSeasonChange, onRegionChange, onPeriodChange, onStatsModeToggle, onMatchHistoryOpen, onRecordsOpen,
}: Props) {
  return (
    <div className={styles.controls}>
      {/* Row 1: game mode tabs — underline grows from centre on hover */}
      <div className={styles.modeTabs}>
        {GAME_MODES.map((m) => (
          <button
            key={m.value}
            className={`${styles.modeTab} ${gameMode === m.value ? styles.modeTabActive : ''}`}
            onClick={() => onGameModeChange(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Row 2: filter row — only shown for TST which has real data */}
      <div className={styles.filterRow} style={{ visibility: gameMode === 'tst' ? 'visible' : 'hidden', pointerEvents: gameMode === 'tst' ? 'auto' : 'none' }}>
        {/* Filter chips — scrollable strip on mobile */}
        <div className={styles.filterChips}>
          {/* Season — hidden on mobile (S4 is always current) */}
          <div className={`${styles.filterGroup} ${styles.mobileHide}`}>
            <span className={styles.filterLabel}>Season</span>
            <div className={styles.buttonSet}>
              {SEASONS.map((s) => (
                <button
                  key={s.value}
                  className={`${styles.filterBtn} ${season === s.value ? styles.filterBtnActive : ''}`}
                  onClick={() => onSeasonChange(s.value)}
                >
                  <span className={styles.btnLabel}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.divider} ${styles.mobileHide}`} />

          {/* Region */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Region</span>
            <div className={styles.buttonSet}>
              {REGIONS.map((r) => (
                <button
                  key={r.value}
                  className={`${styles.filterBtn} ${region === r.value ? styles.filterBtnActive : ''}`}
                  onClick={() => onRegionChange(r.value)}
                >
                  <span className={styles.btnLabel}>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.divider} />

          {/* Period */}
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Period</span>
            <div className={styles.buttonSet}>
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  className={`${styles.filterBtn} ${period === p.value ? styles.filterBtnActive : ''}`}
                  onClick={() => onPeriodChange(p.value)}
                >
                  <span className={styles.btnLabel}>{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.spacer} />

        {/* Match History — desktop only */}
        <button
          className={`${styles.advancedBtn} ${matchHistoryOpen ? styles.advancedActive : ''} ${styles.mobileHide}`}
          onClick={onMatchHistoryOpen}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'block' }}>
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
            <line x1="6" y1="6" x2="6" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="6" y1="6" x2="8.5" y2="7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className={styles.btnLabel}>Match History</span>
          <div className={styles.activeDot} />
        </button>

        {/* Records + Advanced Stats — grouped side-by-side on mobile */}
        <div className={styles.btnGroup}>
          <button
            className={`${styles.advancedBtn} ${recordsOpen ? styles.advancedActive : ''}`}
            onClick={onRecordsOpen}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display: 'block' }}>
              <path d="M6 1L4 3H1v3c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V3H8L6 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
              <path d="M4 9.5h4M6 9.5V11M4 11h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <span className={styles.btnLabel}>Records</span>
            <div className={styles.activeDot} />
          </button>

          <button
            className={`${styles.advancedBtn} ${statsMode === 'advanced' ? styles.advancedActive : ''}`}
            onClick={onStatsModeToggle}
          >
            <div className={styles.barsIcon}>
              <span style={{ height: '6px' }} />
              <span style={{ height: '10px' }} />
              <span style={{ height: '8px' }} />
              <span style={{ height: '14px' }} />
            </div>
            <span className={styles.btnLabel}>Advanced Stats</span>
            <div className={styles.activeDot} />
          </button>
        </div>
      </div>
    </div>
  )
}
