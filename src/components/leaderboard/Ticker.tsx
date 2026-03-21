'use client'

import { useEffect, useState } from 'react'
import type { Player } from '@/types'

interface TickerItem {
  text: string
  highlight: string
  up: boolean | null
}

function deriveItems(players: Player[]): TickerItem[] {
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
    fetch('/api/leaderboard?mode=tst&season=4&region=combined&period=all')
      .then(r => r.ok ? r.json() : [])
      .then((players: Player[]) => {
        const derived = deriveItems(Array.isArray(players) ? players : [])
        if (derived.length > 0) setItems(derived)
      })
      .catch(() => {})
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
