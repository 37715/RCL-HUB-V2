'use client'

import { useEffect, useRef, useState } from 'react'
import type { Player, GameMode, StatsMode, SortKey, SortDir } from '@/types'
import LeaderboardEntry from './LeaderboardEntry'
import styles from './LeaderboardTable.module.css'

interface Props {
  players: Player[]
  mode: GameMode
  statsMode: StatsMode
  sortBy: SortKey
  sortDir: SortDir
  trapOverall?: boolean
  onSort: (key: SortKey) => void
  onPlayerClick: (player: Player) => void
}

interface ColDef {
  label: string
  sortKey?: SortKey
}

const SIMPLE_COLS: ColDef[] = [
  { label: '#' },
  { label: 'PLAYER' },
  { label: 'ELO', sortKey: 'elo' },
  { label: 'K/D', sortKey: 'kd' },
  { label: 'LAST ACTIVE' },
  { label: 'MATCHES', sortKey: 'matches' },
  { label: 'WIN DISTRIBUTION' },
  { label: 'RANK' },
]

const ADV_COLS: ColDef[] = [
  { label: '#' },
  { label: 'PLAYER' },
  { label: 'WIN RATE', sortKey: 'winRate' },
  { label: 'AVG POS', sortKey: 'avgPosition' },
  { label: 'AVG SCORE' },
  { label: 'HIGH SCORE', sortKey: 'highScore' },
  { label: 'RATING Δ' },
  { label: 'RANK' },
]

const TRAP_COLS: ColDef[] = [
  { label: '#' },
  { label: 'PLAYER' },
  { label: 'BEST TIME', sortKey: 'elo' },
  { label: 'ATTEMPTS', sortKey: 'matches' },
  { label: 'LAST RUN' },
  { label: 'TARGET' },
  { label: 'MARGIN' },
  { label: 'RANK' },
]

const TRAP_OVERALL_COLS: ColDef[] = [
  { label: '#' },
  { label: 'PLAYER' },
  { label: 'RATING', sortKey: 'elo' },
  { label: 'ATTEMPTS', sortKey: 'matches' },
  { label: 'LAST RUN' },
  { label: 'AVG SCORE' },
  { label: 'BEST TIME' },
  { label: 'RANK' },
]

export default function LeaderboardTable({
  players,
  mode,
  statsMode,
  sortBy,
  sortDir,
  trapOverall = false,
  onSort,
  onPlayerClick,
}: Props) {
  const [scanning, setScanning] = useState(false)
  const [headerKey, setHeaderKey] = useState(0)
  const prevMode = useRef(statsMode)

  useEffect(() => {
    if (prevMode.current !== statsMode) {
      setScanning(true)
      setHeaderKey(k => k + 1)
      const t = setTimeout(() => setScanning(false), 500)
      prevMode.current = statsMode
      return () => clearTimeout(t)
    }
  }, [statsMode])

  const cols =
    mode === 'trap-survival' ? (trapOverall ? TRAP_OVERALL_COLS : TRAP_COLS) : SIMPLE_COLS

  return (
    <div className={styles.wrap}>
      {/* Header — identical grid to entry rows */}
      <div className={styles.header} key={headerKey}>
        {cols.map((col, i) => {
          const isActive = col.sortKey === sortBy
          const isLast = i === cols.length - 1
          return (
            <div
              key={i}
              className={`${styles.th} ${col.sortKey ? styles.thSortable : ''} ${isActive ? styles.thActive : ''} ${i === 0 ? styles.thRank : ''} ${isLast ? styles.thLast : ''}`}
              onClick={() => col.sortKey && onSort(col.sortKey)}
            >
              {col.label}
              {col.sortKey && (
                <span className={styles.sortIcon}>
                  {isActive ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Rows */}
      <div>
        {players.map((player, index) => (
          <LeaderboardEntry
            key={player.id}
            player={player}
            rank={index + 1}
            mode={mode}
            trapOverall={trapOverall}
            statsMode={statsMode}
            index={index}
            onClick={() => onPlayerClick(player)}
          />
        ))}
      </div>

      {scanning && <div className={styles.scanline} />}
    </div>
  )
}
