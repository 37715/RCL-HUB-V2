'use client'

import React, { useState } from 'react'
import type { PlayerHistoryMatch } from '@/lib/rclApi'

type SortKey = 'date' | 'teamPlace' | 'place' | 'score' | 'kd' | 'change'
type SortDir = 'asc' | 'desc'

const GRID = '36px 1fr 70px 70px 80px 80px 100px'

const headerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: GRID,
  gap: '16px',
  padding: '6px 20px',
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: '9px',
  fontWeight: 700,
  letterSpacing: '2px',
  textTransform: 'uppercase',
  color: 'var(--muted)',
  marginBottom: '4px',
}

const rowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: GRID,
  alignItems: 'center',
  gap: '16px',
  padding: '14px 20px',
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  marginBottom: '6px',
  fontFamily: 'var(--font-mono), monospace',
  fontSize: '12px',
  color: 'var(--muted)',
}

const noDataStyle: React.CSSProperties = {
  fontFamily: 'var(--font-barlow), sans-serif',
  fontSize: '13px',
  fontWeight: 300,
  letterSpacing: '1px',
  color: 'rgba(240,240,240,0.25)',
  fontStyle: 'italic',
  marginTop: '32px',
  lineHeight: '1.6',
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

function sortMatches(matches: PlayerHistoryMatch[], key: SortKey, dir: SortDir): PlayerHistoryMatch[] {
  return [...matches].sort((a, b) => {
    let av: number, bv: number
    switch (key) {
      case 'date':
        av = new Date(a.date).getTime()
        bv = new Date(b.date).getTime()
        break
      case 'teamPlace':
        av = a.teamPlace || 99
        bv = b.teamPlace || 99
        break
      case 'place':
        av = a.place || 99
        bv = b.place || 99
        break
      case 'score':
        av = a.score
        bv = b.score
        break
      case 'kd':
        av = parseFloat(a.kd) || 0
        bv = parseFloat(b.kd) || 0
        break
      case 'change':
        av = parseFloat(a.change) || 0
        bv = parseFloat(b.change) || 0
        break
    }
    return dir === 'asc' ? av - bv : bv - av
  })
}

interface ColHeaderProps {
  label: string
  sortKey: SortKey
  active: SortKey
  dir: SortDir
  align?: 'left' | 'center' | 'right'
  onSort: (key: SortKey) => void
}

function ColHeader({ label, sortKey, active, dir, align = 'left', onSort }: ColHeaderProps) {
  const isActive = active === sortKey
  return (
    <span
      onClick={() => onSort(sortKey)}
      style={{
        textAlign: align,
        cursor: 'pointer',
        userSelect: 'none',
        color: isActive ? 'var(--accent)' : 'var(--muted)',
        display: 'flex',
        alignItems: 'center',
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

export default function MatchHistoryTable({ history }: { history: PlayerHistoryMatch[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      // for place columns, asc = better; for score/kd/rating, desc = better
      setSortDir(key === 'teamPlace' || key === 'place' ? 'asc' : 'desc')
    }
  }

  const sorted = sortMatches(history, sortKey, sortDir)

  return (
    <>
      <div style={headerStyle}>
        <span>#</span>
        <ColHeader label="Date" sortKey="date" active={sortKey} dir={sortDir} onSort={handleSort} />
        <ColHeader label="Team" sortKey="teamPlace" active={sortKey} dir={sortDir} align="center" onSort={handleSort} />
        <ColHeader label="Indv" sortKey="place" active={sortKey} dir={sortDir} align="center" onSort={handleSort} />
        <ColHeader label="Score" sortKey="score" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
        <ColHeader label="K/D" sortKey="kd" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
        <ColHeader label="Rating Δ" sortKey="change" active={sortKey} dir={sortDir} align="right" onSort={handleSort} />
      </div>
      {sorted.slice(0, 20).map((match, i) => (
        <div key={match.matchId || i} style={rowStyle}>
          <span style={{ fontSize: '10px', letterSpacing: '1px' }}>{String(i + 1).padStart(2, '0')}</span>
          <span style={{ fontSize: '11px', color: 'var(--text)' }}>
            {match.date ? new Date(match.date).toLocaleDateString() : '—'}
          </span>
          <span style={{ textAlign: 'center', color: placeColor(match.teamPlace) }}>
            {match.teamPlace > 0 ? placeLabel(match.teamPlace) : '—'}
          </span>
          <span style={{ textAlign: 'center', color: placeColor(match.place) }}>
            {match.place > 0 ? placeLabel(match.place) : '—'}
          </span>
          <span style={{ textAlign: 'right' }}>{match.score > 0 ? match.score.toLocaleString() : '—'}</span>
          <span style={{ textAlign: 'right' }}>{match.kd}</span>
          <span style={{ textAlign: 'right', color: ratingColor(match.change) }}>{match.change}</span>
        </div>
      ))}
      {history.length > 20 && (
        <p style={noDataStyle}>Showing 20 of {history.length} matches.</p>
      )}
    </>
  )
}
