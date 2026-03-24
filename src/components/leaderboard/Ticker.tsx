'use client'

import { useEffect, useState } from 'react'
import type { Player } from '@/types'

interface TickerItem {
  text: string
  highlight: string
  up: boolean | null
}

interface RecordsData {
  score: Array<{ username: string; score: number }>
  kd: Array<{ username: string; bestKd: number; kills: number; deaths: number }>
  streak: Array<{ username: string; maxStreak: number }>
  speed: Array<{ duration: number; teams: string[][] }>
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

function deriveItems(players: Player[], records: RecordsData | null): TickerItem[] {
  if (players.length === 0) return []
  const items: TickerItem[] = []

  const sorted = [...players].sort((a, b) => b.elo - a.elo)

  // Top 3 ELO
  sorted.slice(0, 3).forEach((p, i) => {
    const labels = ['leads the leaderboard', 'ranked 2nd', 'ranked 3rd']
    items.push({ text: `${p.username} ${labels[i]} with`, highlight: `${p.elo.toLocaleString()} ELO`, up: true })
  })

  // Highest K/D
  const topKd = [...players].filter(p => p.kd > 0).sort((a, b) => b.kd - a.kd)[0]
  if (topKd) items.push({ text: `${topKd.username} best K/D ratio`, highlight: topKd.kd.toFixed(2), up: true })

  // Best win rate (min 10 matches)
  const topWr = [...players].filter(p => p.matches >= 10).sort((a, b) => b.winRate - a.winRate)[0]
  if (topWr) items.push({ text: `${topWr.username} highest win rate`, highlight: `${topWr.winRate.toFixed(1)}%`, up: true })

  // Records — spliced in among the leaderboard stats
  if (records) {
    const r1 = records.score[0]
    if (r1) items.push({ text: `${r1.username} record match score`, highlight: r1.score.toLocaleString(), up: null })

    const r2 = records.kd[0]
    if (r2) items.push({ text: `${r2.username} record match K/D`, highlight: `${r2.bestKd % 1 === 0 ? `${r2.bestKd}.00` : r2.bestKd.toFixed(2)} (${r2.kills}K/${r2.deaths}D)`, up: null })

    const r3 = records.streak[0]
    if (r3) items.push({ text: `${r3.username} longest win streak`, highlight: `${r3.maxStreak} wins`, up: true })

    const r4 = records.speed[0]
    if (r4) {
      const winners = r4.teams[0] ?? []
      const name = winners.length > 0 ? winners.join(' & ') : 'unknown'
      items.push({ text: `${name} fastest win`, highlight: fmtDuration(r4.duration), up: null })
    }
  }

  // Most matches
  const topMatches = [...players].sort((a, b) => b.matches - a.matches)[0]
  if (topMatches) items.push({ text: `${topMatches.username} most active`, highlight: `${topMatches.matches} matches`, up: null })

  // Biggest rating gain
  const topGainer = [...players].filter(p => p.ratingDelta > 0).sort((a, b) => b.ratingDelta - a.ratingDelta)[0]
  if (topGainer) items.push({ text: `${topGainer.username} rating change`, highlight: `+${topGainer.ratingDelta}`, up: true })

  // Biggest drop
  const topDropper = [...players].filter(p => p.ratingDelta < 0).sort((a, b) => a.ratingDelta - b.ratingDelta)[0]
  if (topDropper) items.push({ text: `${topDropper.username} rating change`, highlight: `${topDropper.ratingDelta}`, up: false })

  // Highest score
  const topScore = [...players].sort((a, b) => b.highScore - a.highScore)[0]
  if (topScore && topScore.highScore > 0) items.push({ text: `${topScore.username} high score`, highlight: topScore.highScore.toLocaleString(), up: null })

  // Total matches played across board
  const totalMatches = players.reduce((sum, p) => sum + p.matches, 0)
  items.push({ text: 'total matches played this season', highlight: totalMatches.toLocaleString(), up: null })

  return items
}

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    const leaderboardP = fetch('/api/leaderboard?mode=tst&season=4&region=combined&period=all')
      .then(r => r.ok ? r.json() : [])
      .then((d: Player[]) => (Array.isArray(d) ? d : []))
      .catch(() => [] as Player[])

    const recordsP = fetch('/api/records?season=4')
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)

    Promise.all([leaderboardP, recordsP]).then(([players, records]) => {
      const derived = deriveItems(players, records as RecordsData | null)
      if (derived.length > 0) setItems(derived)
    })
  }, [])

  if (items.length === 0) return (
    <div style={{ height: '32px', borderBottom: '1px solid var(--line)' }} />
  )

  const doubled = [...items, ...items]

  return (
    <div style={{
      height: '32px',
      overflow: 'hidden',
      borderBottom: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
      background: 'rgba(255,255,255,0.01)',
    }}>
      <div style={{
        display: 'flex',
        animation: 'tickerScroll 60s linear infinite',
        whiteSpace: 'nowrap',
        willChange: 'transform',
      }}>
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--font-barlow), 'Barlow Condensed', sans-serif",
              fontSize: '11px',
              fontWeight: 400,
              letterSpacing: '2px',
              color: 'var(--muted)',
              padding: '0 32px',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {item.text}&nbsp;
            <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>
              {item.highlight}
            </strong>
            {item.up !== null && (
              <span style={{ color: item.up ? '#4eff91' : '#ff3d6e', fontSize: '9px' }}>
                {item.up ? '▲' : '▼'}
              </span>
            )}
            <span style={{
              display: 'inline-block',
              width: '3px',
              height: '3px',
              background: 'rgba(232,255,71,0.35)',
              transform: 'rotate(45deg)',
              marginLeft: '24px',
            }} />
          </span>
        ))}
      </div>
    </div>
  )
}
