'use client'

import React, { useState, useEffect } from 'react'
import type { PlayerHistoryMatch } from '@/lib/rclApi'
import styles from './MatchHistoryTable.module.css'

type SortKey = 'date' | 'teamPlace' | 'place' | 'score' | 'kd' | 'change' | 'avgElo'
type SortDir = 'asc' | 'desc'

function eloColor(elo: number): string {
  if (elo >= 2200) return '#ff9aff' // amethyst/master — very strong lobby
  if (elo >= 2000) return '#6ddcff' // diamond — strong
  if (elo >= 1800) return '#e8ff47' // platinum — above average
  if (elo >= 1600) return '#a9ffb0' // gold — average
  return 'var(--muted)'              // below average
}

function placeLabel(place: number): string {
  if (place === 1) return '1st'
  if (place === 2) return '2nd'
  if (place === 3) return '3rd'
  return `${place}th`
}

function placeColor(place: number): string {
  if (place === 1) return '#4eff91'
  if (place === 2) return '#ffe94e'
  if (place === 3) return '#ff9a3c'
  return '#ff3d6e'
}

function ratingColor(change: string): string {
  if (change.startsWith('+')) return '#4eff91'
  if (change.startsWith('-')) return '#ff3d6e'
  return 'var(--muted)'
}

function fmtDate(d: string): string {
  const dt = new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
}

function sortMatches(matches: PlayerHistoryMatch[], key: SortKey, dir: SortDir): PlayerHistoryMatch[] {
  return [...matches].sort((a, b) => {
    let av: number, bv: number
    switch (key) {
      case 'date':      av = new Date(a.date).getTime(); bv = new Date(b.date).getTime(); break
      case 'teamPlace': av = a.teamPlace || 99;          bv = b.teamPlace || 99;          break
      case 'place':     av = a.place || 99;              bv = b.place || 99;              break
      case 'score':     av = a.score;                    bv = b.score;                    break
      case 'kd':        av = parseFloat(a.kd) || 0;     bv = parseFloat(b.kd) || 0;     break
      case 'change':    av = parseFloat(a.change) || 0; bv = parseFloat(b.change) || 0; break
      case 'avgElo':    av = a.lobbyAvgElo || -1;        bv = b.lobbyAvgElo || -1;        break
    }
    return dir === 'asc' ? av - bv : bv - av
  })
}

function ColHeader({ label, sortKey, active, dir, align = 'left', onSort }: {
  label: string; sortKey: SortKey; active: SortKey; dir: SortDir
  align?: 'left' | 'center' | 'right'; onSort: (key: SortKey) => void
}) {
  const isActive = active === sortKey
  return (
    <span
      onClick={() => onSort(sortKey)}
      style={{
        textAlign: align, cursor: 'pointer', userSelect: 'none',
        color: isActive ? 'var(--accent)' : 'var(--muted)',
        display: 'flex', alignItems: 'center',
        justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        gap: '4px',
      }}
    >
      {label}
      <span style={{ fontSize: '8px', opacity: isActive ? 1 : 0.3 }}>
        {isActive ? (dir === 'asc' ? '▲' : '▼') : '▼'}
      </span>
    </span>
  )
}

interface Props {
  history: PlayerHistoryMatch[]
}

export default function MatchHistoryTable({ history }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'teamPlace' || key === 'place' ? 'asc' : 'desc')
    }
  }

  const sorted = sortMatches(history, sortKey, sortDir)

  if (isMobile) {
    return (
      <div style={{ border: '1px solid var(--card-border)', background: 'var(--card)' }}>
        {sorted.slice(0, 20).map((match, i) => (
          <div key={match.matchId || i} className={styles.card}>
            <span className={styles.cardDate}>{fmtDate(match.date)}</span>
            <div className={styles.cardStats}>
              <span className={styles.cardStat} style={{ color: placeColor(match.teamPlace) }}>
                {match.teamPlace > 0 ? placeLabel(match.teamPlace) : '—'}
              </span>
              <span style={{ color: 'var(--card-border)' }}>·</span>
              <span className={styles.cardStat}>{match.kd} kd</span>
              {match.lobbyAvgElo > 0 && (
                <>
                  <span style={{ color: 'var(--card-border)' }}>·</span>
                  <span className={styles.cardStat} style={{ color: eloColor(match.lobbyAvgElo) }}>
                    lobby {match.lobbyAvgElo}
                  </span>
                </>
              )}
            </div>
            <span className={styles.cardDelta} style={{ color: ratingColor(match.change) }}>
              {match.change}
            </span>
          </div>
        ))}
        {history.length > 20 && (
          <p className={styles.noData} style={{ padding: '0 16px 12px' }}>
            Showing 20 of {history.length} matches.
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={styles.header}>
        <span>#</span>
        <ColHeader label="Date" sortKey="date" active={sortKey} dir={sortDir} onSort={handleSort} />
        <ColHeader label="Team" sortKey="teamPlace" active={sortKey} dir={sortDir} align="center" onSort={handleSort} />
        <ColHeader label="Indv" sortKey="place" active={sortKey} dir={sortDir} align="center" onSort={handleSort} />
        <ColHeader label="Score" sortKey="score" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
        <ColHeader label="K/D" sortKey="kd" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
        <ColHeader label="Lobby ELO" sortKey="avgElo" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
        <ColHeader label="Rating Δ" sortKey="change" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
      </div>
      {sorted.slice(0, 20).map((match, i) => (
        <div key={match.matchId || i} className={styles.row}>
          <span style={{ fontSize: '10px', letterSpacing: '1px' }}>{String(i + 1).padStart(2, '0')}</span>
          <span style={{ fontSize: '11px', color: 'var(--text)' }}>{fmtDate(match.date)}</span>
          <span style={{ textAlign: 'center', color: placeColor(match.teamPlace) }}>
            {match.teamPlace > 0 ? placeLabel(match.teamPlace) : '—'}
          </span>
          <span style={{ textAlign: 'center', color: placeColor(match.place) }}>
            {match.place > 0 ? placeLabel(match.place) : '—'}
          </span>
          <span style={{ textAlign: 'right' }}>{match.score > 0 ? match.score.toLocaleString() : '—'}</span>
          <span style={{ textAlign: 'right' }}>{match.kd}</span>
          <span style={{ textAlign: 'right', color: match.lobbyAvgElo > 0 ? eloColor(match.lobbyAvgElo) : 'var(--muted)' }}>
            {match.lobbyAvgElo > 0 ? match.lobbyAvgElo.toLocaleString() : '—'}
          </span>
          <span style={{ textAlign: 'right', color: ratingColor(match.change) }}>{match.change}</span>
        </div>
      ))}
      {history.length > 20 && (
        <p className={styles.noData}>Showing 20 of {history.length} matches.</p>
      )}
    </>
  )
}
