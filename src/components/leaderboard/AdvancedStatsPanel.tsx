'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Player, Season, Tier } from '@/types'
import type { PlayerHistoryMatch } from '@/lib/rclApi'
import styles from './AdvancedStatsPanel.module.css'

interface Props {
  player: Player | null
  rank: number | null
  season: Season
  isOpen: boolean
  onClose: () => void
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

// ── ELO Graph ──────────────────────────────────────────────

function EloGraph({ matches, color }: { matches: PlayerHistoryMatch[]; color: string }) {
  const chronological = [...matches].reverse()
  const elos = chronological.map((m) => m.exitRating).filter((e) => e > 0)
  if (elos.length < 2) return <div className={styles.graphEmpty}>Not enough data</div>

  const W = 600; const H = 160
  const PL = 52; const PR = 16; const PT = 12; const PB = 24
  const iW = W - PL - PR; const iH = H - PT - PB

  const min = Math.min(...elos); const max = Math.max(...elos)
  const range = max - min || 1

  const pts = elos.map((e, i) => ({
    x: PL + (i / (elos.length - 1)) * iW,
    y: PT + (1 - (e - min) / range) * iH,
  }))

  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = pts[i - 1]
    const cpx = ((p.x + prev.x) / 2).toFixed(1)
    return `${acc} C ${cpx} ${prev.y.toFixed(1)} ${cpx} ${p.y.toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }, '')

  const fillPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(PT + iH).toFixed(1)} L ${PL} ${(PT + iH).toFixed(1)} Z`
  const last = pts[pts.length - 1]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={styles.graphSvg} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`eloFill_${color.slice(1)}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = PT + t * iH
        const val = Math.round(max - t * range)
        return (
          <g key={t}>
            <line x1={PL} x2={W - PR} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="rgba(255,255,255,0.3)">{val}</text>
          </g>
        )
      })}
      <path d={fillPath} fill={`url(#eloFill_${color.slice(1)})`} />
      <path d={linePath} stroke={color} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="3.5" fill={color} />
      <circle cx={last.x} cy={last.y} r="6" fill={color} fillOpacity="0.2" />
    </svg>
  )
}

// ── Stat bar ──────────────────────────────────────────────

function StatBar({ label, value, display, color }: { label: string; value: number; display: string; color: string }) {
  return (
    <div className={styles.statBar}>
      <div className={styles.statBarHeader}>
        <span className={styles.statBarLabel}>{label}</span>
        <span className={styles.statBarValue}>{display}</span>
      </div>
      <div className={styles.statBarTrack}>
        <div className={styles.statBarFill} style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
      </div>
    </div>
  )
}

// ── Match history table ───────────────────────────────────

function MatchTable({ matches }: { matches: PlayerHistoryMatch[] }) {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize))
  const visible = matches.slice(page * pageSize, page * pageSize + pageSize)

  function fmtDate(d: string) {
    const num = Number(d)
    const dt = !isNaN(num) && num > 1e9 ? new Date(num * 1000) : new Date(d)
    if (isNaN(dt.getTime())) return d
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })
  }

  function changeColor(c: string) {
    return c.startsWith('+') ? '#4eff91' : c.startsWith('-') ? '#ff3d6e' : 'var(--muted)'
  }

  return (
    <div className={styles.matchSection}>
      <div className={styles.matchHeader}>
        <span className={styles.matchTitle}>Match History</span>
        <div className={styles.paginator}>
          <button className={styles.pageBtn} onClick={() => setPage((p) => p - 1)} disabled={page === 0}>‹</button>
          <span className={styles.pageInfo}>{page + 1} / {totalPages}</span>
          <button className={styles.pageBtn} onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages - 1}>›</button>
        </div>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Match</th>
              <th>Teammate</th>
              <th>Exit ELO</th>
              <th>Change</th>
              <th>Team</th>
              <th>Indv</th>
              <th>Played%</th>
              <th>Alive%</th>
              <th>Score</th>
              <th>K/D</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m, i) => (
              <tr key={m.matchId || i}>
                <td className={styles.tdDate}>{fmtDate(m.date)}</td>
                <td className={styles.tdTeammate}>{m.teammates.join(', ') || '—'}</td>
                <td>{m.exitRating}</td>
                <td style={{ color: changeColor(m.change), fontWeight: 700 }}>{m.change}</td>
                <td>{m.teamPlace || '—'}</td>
                <td>{m.place || '—'}</td>
                <td>{m.playedPct > 0 ? `${m.playedPct}%` : '—'}</td>
                <td>{m.alivePct  > 0 ? `${m.alivePct}%`  : '—'}</td>
                <td>{m.score > 0 ? m.score.toLocaleString() : '—'}</td>
                <td style={{ color: Number(m.kd) >= 2 ? '#4eff91' : Number(m.kd) < 1 ? '#ff3d6e' : '#ffe94e' }}>{m.kd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────

export default function AdvancedStatsPanel({ player, rank, season, isOpen, onClose }: Props) {
  const [history, setHistory] = useState<PlayerHistoryMatch[]>([])
  const [histLoading, setHistLoading] = useState(false)

  useEffect(() => {
    if (!player || !isOpen) return
    setHistory([])
    setHistLoading(true)
    fetch(`/api/player/history?username=${encodeURIComponent(player.username)}&season=${season}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { setHistory(Array.isArray(data) ? data : []); setHistLoading(false) })
      .catch(() => setHistLoading(false))
  }, [player?.username, season, isOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const tierColor = player ? TIER_COLORS[player.tier] : 'var(--accent)'

  const avgAlivePct = history.length > 0
    ? Math.round(history.reduce((s, m) => s + m.alivePct, 0) / history.length)
    : null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.panelOuter}>
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {!player ? (
            <div className={styles.empty}>
              <span className={styles.emptyTitle}>Select a Player</span>
              <span className={styles.emptyText}>Click any row in the leaderboard to view detailed statistics.</span>
            </div>
          ) : histLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.loadingPulse} />
            </div>
          ) : (
            <div className={styles.body}>

              {/* ── Left column ── */}
              <div className={styles.left}>
                {/* Header */}
                <div className={styles.playerHead}>
                  <div className={styles.playerHeadInfo}>
                    <div className={styles.playerNameRow}>
                    {rank != null && <span className={styles.playerRank}>#{rank}</span>}
                    <span className={styles.playerName} style={{ color: tierColor }}>{player.username}</span>
                  </div>
                    <div className={styles.tierRow}>
                      <Image src={RANK_IMAGES[player.tier]} alt={player.tier} width={20} height={20} />
                      <span className={styles.tierLabel} style={{ color: tierColor }}>{player.tier}</span>
                      <span className={styles.matchCount}>{player.matches} m</span>
                    </div>
                  </div>
                  <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {/* Stat bars */}
                <div className={styles.statSection}>
                  <StatBar label="ELO" value={(player.elo / 2800) * 100} display={player.elo.toLocaleString()} color={tierColor} />
                  <StatBar label="K/D" value={(player.kd / 4) * 100} display={player.kd > 0 ? player.kd.toFixed(2) : '—'} color="#4eff91" />
                  <StatBar label="Win Rate" value={player.winRate}
                    display={`${player.winRate.toFixed(1)}%`}
                    color={player.winRate >= 50 ? '#4eff91' : player.winRate >= 40 ? '#ffe94e' : '#ff3d6e'} />
                  <StatBar label="Avg Score" value={(player.avgScore / 800) * 100}
                    display={player.avgScore > 0 ? player.avgScore.toLocaleString() : '—'} color="#8b4fc8" />
                  <StatBar label="Avg Position" value={((4 - player.avgPosition) / 3) * 100}
                    display={player.avgPosition > 0 ? player.avgPosition.toFixed(1) : '—'} color="#00d4ff" />
                  <StatBar
                    label="Avg Alive %"
                    value={avgAlivePct ?? 0}
                    display={avgAlivePct != null ? `${avgAlivePct}%` : '—'}
                    color={avgAlivePct != null ? (avgAlivePct >= 70 ? '#4eff91' : avgAlivePct >= 50 ? '#ffe94e' : '#ff3d6e') : 'rgba(255,255,255,0.15)'}
                  />
                </div>

                {/* Placement */}
                <div className={styles.statSection}>
                  <span className={styles.sectionLabel}>Placement</span>
                  {([
                    { label: '1st', count: player.wins,   color: '#4eff91' },
                    { label: '2nd', count: player.second, color: '#ffe94e' },
                    { label: '3rd', count: player.third,  color: '#ff9a3c' },
                    { label: '4th+', count: player.losses, color: '#ff3d6e' },
                  ]).map((p) => {
                    const pct = player.matches > 0 ? (p.count / player.matches) * 100 : 0
                    return (
                      <div key={p.label} className={styles.placementRow}>
                        <span className={styles.placementLabel} style={{ color: p.color }}>{p.label}</span>
                        <div className={styles.placementBar}><div style={{ width: `${pct}%`, background: p.color, height: '100%' }} /></div>
                        <span className={styles.placementPct}>{pct.toFixed(0)}%</span>
                        <span className={styles.placementCount}>{p.count}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Delta */}
                <div className={styles.deltaBox}>
                  <span className={styles.deltaLabel}>Rating Δ</span>
                  <span className={styles.deltaVal} style={{ color: player.ratingDelta >= 0 ? '#4eff91' : '#ff3d6e' }}>
                    {player.ratingDelta >= 0 ? '+' : ''}{player.ratingDelta}
                  </span>
                  <span className={styles.highScoreLabel}>High Score</span>
                  <span className={styles.highScoreVal}>{player.highScore > 0 ? player.highScore.toLocaleString() : '—'}</span>
                </div>
              </div>

              {/* ── Right column ── */}
              <div className={styles.right}>
                {/* ELO graph */}
                <div className={styles.graphSection}>
                  <div className={styles.graphHeader}>
                    <span className={styles.sectionLabel}>ELO Progression</span>
                    {history.length > 0 && (
                      <span className={styles.graphMeta}>last {Math.min(50, history.length)} matches</span>
                    )}
                  </div>
                  <div className={styles.graphBox}>
                    {history.length > 0
                      ? <EloGraph matches={history.slice(0, 50)} color={tierColor} />
                      : <div className={styles.graphEmpty}>No history available</div>
                    }
                  </div>
                </div>

                <MatchTable matches={history} />
              </div>

            </div>
          )}
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
