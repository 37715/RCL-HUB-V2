'use client'

import React from 'react'
import Image from 'next/image'
import * as Flags from 'country-flag-icons/react/3x2'
import type { Player, GameMode, StatsMode, Tier } from '@/types'
import { PLAYER_FLAGS } from '@/data/flags'
import styles from './LeaderboardEntry.module.css'

interface Props {
  player: Player
  rank: number
  mode: GameMode
  statsMode: StatsMode
  index: number
  onClick: () => void
}

const RANK_IMAGES: Record<Tier, string> = {
  bronze:      '/assets/ranks/bronze.png',
  silver:      '/assets/ranks/silver.png',
  gold:        '/assets/ranks/gold.png',
  platinum:    '/assets/ranks/platinum.png',
  diamond:     '/assets/ranks/diamond-master-7.png',
  amethyst:    '/assets/ranks/diamond-amethyst-9.png',
  master:      '/assets/ranks/master.png',
  grandmaster: '/assets/ranks/grandmaster.png',
  legend:      '/assets/ranks/legend.png',
}

const TIER_COLORS: Record<Tier, string> = {
  bronze:      '#d4603a',
  silver:      '#b0bec5',
  gold:        '#f5c528',
  platinum:    '#4ecdc4',
  diamond:     '#89c4e1',
  amethyst:    '#8b4fc8',
  master:      '#e53535',
  grandmaster: '#f5c428',
  legend:      '#5de8df',
}

function hexRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getInitials(username: string): string {
  return username.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
}

function getFlagCode(username: string): string | null {
  // Strip @suffix (e.g. "viper@rcl" → "viper") before lookup
  const base = username.toLowerCase().replace(/@.*$/, '').trim()
  return PLAYER_FLAGS[base] ?? null
}

function FlagIcon({ code, size = 28 }: { code: string; size?: number }) {
  const Component = (Flags as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[code]
  if (!Component) return null
  return <Component style={{ width: size, height: 'auto', borderRadius: 2 }} />
}

export default function LeaderboardEntry({ player, rank, mode, statsMode, index, onClick }: Props) {
  const flagCode = getFlagCode(player.username)
  const total   = player.matches || 1
  const winPct  = player.wins   / total * 100
  const secPct  = player.second / total * 100
  const thrPct  = player.third  / total * 100
  const lossPct = player.losses / total * 100

  const isAdv     = statsMode === 'advanced'
  const tierColor = TIER_COLORS[player.tier]
  const avatarBg  = hexRgba(tierColor, 0.14)
  const eloGlow   = `0 0 16px ${hexRgba(tierColor, 0.45)}`
  const rankClass = rank === 1 ? styles.rank1 : rank === 2 ? styles.rank2 : rank === 3 ? styles.rank3 : ''

  // red(kd≤1) → yellow(kd=1.5) → green(kd≥2)
  const kdColor = (() => {
    if (player.kd <= 0) return 'var(--muted)'
    const t = Math.max(0, Math.min(1, (player.kd - 1) / (2 - 1)))
    let r, g, b
    if (t < 0.5) {
      // red #ff3d6e → yellow #ffe94e
      const s = t / 0.5
      r = 255
      g = Math.round(61  * (1 - s) + 233 * s)
      b = Math.round(110 * (1 - s) + 78  * s)
    } else {
      // yellow #ffe94e → green #4eff91
      const s = (t - 0.5) / 0.5
      r = Math.round(255 * (1 - s) + 78  * s)
      g = Math.round(233 * (1 - s) + 255 * s)
      b = Math.round(78  * (1 - s) + 145 * s)
    }
    return `rgb(${r},${g},${b})`
  })()

  const wrColor     = player.winRate >= 50 ? '#4eff91' : player.winRate >= 40 ? '#ffe94e' : '#ff3d6e'
  const deltaColor  = player.ratingDelta >= 0 ? '#4eff91' : '#ff3d6e'
  const avgPosColor = player.avgPosition <= 2 ? '#4eff91' : '#ff9a3c'

  const topClass = rank <= 3 ? (styles[`top${rank}` as keyof typeof styles] ?? '') : ''

  return (
    <div
      className={`${styles.wrap} ${topClass}`}
      style={{
        animationDelay: `${index * 40}ms`,
        ['--tier-color' as string]: tierColor,
      }}
    >
      {/* ── Main row (always visible) ── */}
      <div className={styles.row} onClick={onClick}>
        {/* Col 1 — Rank */}
        <div className={styles.rankCell}>
          <span className={`${styles.rankNum} ${rankClass}`}>{rank}</span>
        </div>

        {/* Col 2 — Player */}
        <div className={styles.playerCell}>
          <div className={styles.avatar} style={{ background: flagCode ? 'transparent' : avatarBg }}>
            {flagCode
              ? <FlagIcon code={flagCode} size={28} />
              : <span style={{ color: tierColor }}>{getInitials(player.username)}</span>
            }
          </div>
          <div className={styles.playerInfo}>
            <span className={styles.username}>{player.username}</span>
            {player.tag && <span className={styles.playerMeta}>{player.tag}</span>}
          </div>
        </div>

        {/* Col 3 — ELO */}
        <div className={styles.dc}>
          <span style={{ fontFamily: 'var(--font-bebas)', fontSize: 24, letterSpacing: 1, color: tierColor, textShadow: eloGlow }}>
            {player.elo.toLocaleString()}
          </span>
        </div>

        {/* Col 4 — K/D */}
        <div className={styles.dc}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: player.kd > 0 ? kdColor : 'var(--muted)' }}>
            {player.kd > 0 ? player.kd.toFixed(2) : '—'}
          </span>
        </div>

        {/* Col 5 — Last Active */}
        <div className={styles.dc}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', letterSpacing: 1 }}>
            {player.lastActive}
          </span>
        </div>

        {/* Col 6 — Matches */}
        <div className={styles.dc}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', letterSpacing: 1 }}>
            {player.matches} matches
          </span>
        </div>

        {/* Col 7 — Win Distribution */}
        <div className={styles.dc}>
          <div className={styles.distWrap}>
            <span className={styles.distPct}>{winPct.toFixed(0)}% WIN</span>
            <div className={styles.distBar}>
              <div style={{ width: `${winPct}%`,  background: '#4eff91', height: '100%' }} />
              {mode !== '1v1' && <div style={{ width: `${secPct}%`,  background: '#ffe94e', height: '100%' }} />}
              {mode !== '1v1' && <div style={{ width: `${thrPct}%`,  background: '#ff9a3c', height: '100%' }} />}
              <div style={{ width: `${lossPct}%`, background: '#ff3d6e', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Col 8 — Tier */}
        <div className={styles.tierCell}>
          <Image src={RANK_IMAGES[player.tier]} alt={player.tier} width={30} height={30} style={{ objectFit: 'contain' }} />
          <span className={styles.tierName} style={{ color: tierColor }}>{player.tier}</span>
        </div>
      </div>

      {/* ── Advanced sub-row (slides in below when advanced mode active) ── */}
      <div className={`${styles.subRow} ${isAdv ? styles.subRowOpen : ''}`}>
        <div className={styles.subRowInner}>
          <div className={styles.subStat}>
            <span className={styles.subLabel}>Win Rate</span>
            <span className={styles.subValue} style={{ color: wrColor }}>{player.winRate.toFixed(1)}%</span>
          </div>
          <div className={styles.subDivider} />
          <div className={styles.subStat}>
            <span className={styles.subLabel}>Avg Position</span>
            <span className={styles.subValue} style={{ color: avgPosColor }}>{player.avgPosition.toFixed(1)}</span>
          </div>
          <div className={styles.subDivider} />
          <div className={styles.subStat}>
            <span className={styles.subLabel}>Avg Score</span>
            <span className={styles.subValue}>{player.avgScore.toLocaleString()}</span>
          </div>
          <div className={styles.subDivider} />
          <div className={styles.subStat}>
            <span className={styles.subLabel}>High Score</span>
            <span className={styles.subValue} style={{ color: 'var(--accent)' }}>{player.highScore.toLocaleString()}</span>
          </div>
          <div className={styles.subDivider} />
          <div className={styles.subStat}>
            <span className={styles.subLabel}>Rating Δ</span>
            <span className={styles.subValue} style={{ color: deltaColor }}>
              {player.ratingDelta >= 0 ? '+' : ''}{player.ratingDelta}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
