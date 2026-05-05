'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Player, Tier } from '@/types'
import type { RecentMatch, RecentMatchTeam } from '@/lib/rclApi'
import styles from './RecentMatchesPanel.module.css'

interface Props {
  players: Player[]
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

const TEAM_COLORS: Record<string, string> = {
  gold:    '#f5c528',
  yellow:  '#f5c528',
  purple:  '#a855f7',
  violet:  '#a855f7',
  blue:    '#3b9eff',
  red:     '#ff3d6e',
  green:   '#4eff91',
  orange:  '#ff9a3c',
  cyan:    '#4ecdc4',
  teal:    '#4ecdc4',
  ugly:    '#40e0d0',
  pink:    '#f472b6',
  white:   '#e0e0e0',
  silver:  '#b0bec5',
  black:   '#888',
}

function getTeamColor(name: string): string {
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (lower.includes(key)) return color
  }
  return 'rgba(255,255,255,0.4)'
}

function fmtDate(d: string) {
  const num = Number(d)
  const dt = !isNaN(num) && num > 1e9 ? new Date(num * 1000) : new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', {
    weekday: 'short', day: '2-digit', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

function fmtDuration(secs: number): string {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}

const PLACE_LABELS = ['1ST', '2ND', '3RD', '4TH']

function TeamCard({ team, isWinner, playerLookup }: {
  team: RecentMatchTeam
  isWinner: boolean
  playerLookup: Map<string, Tier>
}) {
  const color = getTeamColor(team.name)
  const placeLabel = PLACE_LABELS[team.place - 1] ?? `${team.place}TH`

  return (
    <div className={styles.teamCard} style={{ borderTopColor: color }}>
      <div className={styles.teamHeader}>
        <div className={styles.teamNameRow}>
          <span className={styles.teamPlace} style={{ color }}>{placeLabel}</span>
          <span className={styles.teamName} style={{ color }}>{team.name}</span>
        </div>
        <span className={styles.teamScore}>{team.totalScore > 0 ? team.totalScore.toLocaleString() : '—'}</span>
      </div>

      <div className={styles.teamPlayers}>
        {team.players.map((p, i) => {
          const tier = playerLookup.get(p.name.toLowerCase())
          const rankImg = tier ? RANK_IMAGES[tier] : null
          return (
            <div key={i} className={styles.playerRow}>
              <div className={styles.playerNameRow}>
                {rankImg
                  ? <Image src={rankImg} alt={tier ?? ''} width={28} height={28} className={styles.rankIcon} />
                  : <span className={styles.rankUnknown}>?</span>
                }
                <span className={styles.playerName}>{p.name}</span>
              </div>
              <div className={styles.playerStats}>
                <div className={styles.playerKdBlock}>
                  <span style={{ color: '#4eff91' }}>{p.kills}</span>
                  <span className={styles.kdSlash}>/</span>
                  <span style={{ color: '#ff3d6e' }}>{p.deaths}</span>
                  <span className={styles.kdRatio} style={{
                    color: Number(p.kd) >= 2 ? '#4eff91' : Number(p.kd) < 1 ? '#ff3d6e' : '#ffe94e'
                  }}>{p.kd}</span>
                </div>
                {p.score > 0 && <span className={styles.playerScore}>{p.score.toLocaleString()}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RecentMatchesPanel({ players, isOpen, onClose }: Props) {
  const [matches, setMatches] = useState<RecentMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasNext, setHasNext] = useState(false)

  const playerLookup = new Map(players.map((p) => [p.username.toLowerCase(), p.tier]))

  useEffect(() => {
    if (!isOpen) return
    setPage(1)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const limit = 10
    const ac = new AbortController()
    setMatches([])
    setHasNext(false)
    setLoading(true)

    fetch(`/api/matches/recent?page=${page}&limit=${limit}`, { signal: ac.signal })
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? (data as RecentMatch[]) : []
        setMatches(list)
        // We don't have total count; infer "next page exists" if we got a full page.
        setHasNext(list.length >= limit)
        setLoading(false)
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return
        setLoading(false)
      })

    return () => ac.abort()
  }, [isOpen, page])

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.outer}>
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <span className={styles.title}>Recent Matches</span>
                <span className={styles.meta}>page {page}</span>
                {!loading && matches.length > 0 && <span className={styles.meta}>{matches.length} matches</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  className={styles.closeBtn}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={loading || page <= 1}
                  aria-label="Previous page"
                  title="Previous page"
                >
                  ‹
                </button>
                <button
                  className={styles.closeBtn}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading || !hasNext}
                  aria-label="Next page"
                  title={hasNext ? 'Next page' : 'No more matches'}
                >
                  ›
                </button>
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
              </div>
            </div>

            <div className={styles.body}>
              {loading ? (
                <div className={styles.loadingState}><div className={styles.loadingPulse} /></div>
              ) : matches.length === 0 ? (
                <div className={styles.empty}>No recent matches found</div>
              ) : (
                <div className={styles.matchList}>
                  {matches.map((match, i) => (
                    <div key={match.id || i} className={styles.matchCard}>

                      {/* Match header */}
                      <div className={styles.matchMeta}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                          <span style={{
                            fontFamily: 'var(--font-barlow), sans-serif',
                            fontSize: '9px',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            color: 'var(--accent)',
                          }}>
                            #{i + 1}
                          </span>
                          <span className={styles.matchDate}>{fmtDate(match.date)}</span>
                        </div>
                        <div className={styles.matchMetaRight}>
                          {match.server && <span className={styles.matchStat}><span className={styles.statLabel}>Server</span><span className={styles.statVal}>{match.server}</span></span>}
                          {match.region && <span className={styles.matchStat}><span className={styles.statLabel}>Region</span><span className={styles.statVal}>{match.region.toUpperCase()}</span></span>}
                          {match.roundCount > 0 && <span className={styles.matchStat}><span className={styles.statLabel}>Rounds</span><span className={styles.statVal}>{match.roundCount}</span></span>}
                          {match.duration > 0 && <span className={styles.matchStat}><span className={styles.statLabel}>Duration</span><span className={styles.statVal}>{fmtDuration(match.duration)}</span></span>}
                        </div>
                      </div>

                      {/* 2×2 team grid */}
                      <div className={styles.teamsGrid}>
                        {match.teams.map((team, j) => (
                          <TeamCard
                            key={j}
                            team={team}
                            isWinner={!!match.winner && team.name.toLowerCase().includes(match.winner.toLowerCase())}
                            playerLookup={playerLookup}
                          />
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
