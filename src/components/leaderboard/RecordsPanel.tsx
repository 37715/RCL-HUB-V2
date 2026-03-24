'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Season, Tier } from '@/types'
import * as Flags from 'country-flag-icons/react/3x2'
import { PLAYER_FLAGS } from '@/data/flags'
import styles from './RecordsPanel.module.css'

function getFlagCode(username: string): string | null {
  const base = username.toLowerCase().replace(/@.*$/, '').trim()
  return PLAYER_FLAGS[base] ?? null
}

function FlagIcon({ code }: { code: string }) {
  const Component = (Flags as Record<string, React.ComponentType<{ style?: React.CSSProperties }>>)[code]
  if (!Component) return null
  return <Component style={{ width: 16, height: 'auto', borderRadius: 2, opacity: 0.85 }} />
}

type Category = 'score' | 'kd' | 'streak' | 'addict' | 'speed'

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'score',  label: 'Top Score' },
  { id: 'kd',    label: 'Best K/D' },
  { id: 'streak', label: 'Win Streak' },
  { id: 'addict', label: 'Addict' },
  { id: 'speed',  label: 'Fastest Win' },
]

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

const MEDAL_COLORS = ['#e8ff47', '#b0bec5', '#cd7f32']
const PLAYBACK_BASE = 'https://www.armanelgtron.tk/playback/?id='

// ---------------------------------------------------------------------------
// Types matching the /api/records response
// ---------------------------------------------------------------------------
interface RecordsData {
  score: Array<{ username: string; tier: Tier; matches: number; winRate: number; score: number; matchId: string }>
  kd: Array<{ username: string; tier: Tier; matches: number; winRate: number; bestKd: number; kills: number; deaths: number; matchId: string }>
  streak: Array<{ username: string; tier: Tier; matches: number; winRate: number; maxStreak: number }>
  addict: Array<{ username: string; tier: Tier; matches: number; winRate: number; elo: number }>
  speed: Array<{ id: string; date: string; duration: number; teams: string[][] }>
  computedAt: number
}

interface Props {
  season: Season
  isOpen: boolean
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

function fmtDate(d: string) {
  const num = Number(d)
  const dt = !isNaN(num) && num > 1e9 ? new Date(num * 1000) : new Date(d)
  if (isNaN(dt.getTime())) return d
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function valueColor(rank: number) {
  return rank === 1 ? 'var(--accent)' : rank <= 3 ? MEDAL_COLORS[rank - 1] : 'var(--text)'
}
function valueShadow(rank: number) {
  return rank === 1 ? '0 0 20px rgba(232,255,71,0.35)' : 'none'
}

// ---------------------------------------------------------------------------
// Presentational sub-components
// ---------------------------------------------------------------------------
function RankNum({ n }: { n: number }) {
  const color = n <= 3 ? MEDAL_COLORS[n - 1] : 'rgba(240,240,240,0.2)'
  return (
    <span className={styles.rankNum} style={{ color, textShadow: n === 1 ? '0 0 12px rgba(232,255,71,0.4)' : 'none' }}>
      {String(n).padStart(2, '0')}
    </span>
  )
}

function ReplayLink({ matchId }: { matchId: string }) {
  if (!matchId) return null
  return (
    <a
      href={`${PLAYBACK_BASE}${encodeURIComponent(matchId)}`}
      target="_blank"
      rel="noreferrer"
      className={styles.replayBtn}
      title="Watch replay"
      onClick={(e) => e.stopPropagation()}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.7001 21.3351C16.5281 21.4998 14.9996 21.4998 12.9501 21.4998H11.0501C7.01955 21.4998 5.0043 21.4998 3.75218 20.2476C2.50006 18.9955 2.50006 16.9803 2.50006 12.9498V11.0498C2.50006 7.01925 2.50006 5.00399 3.75218 3.75187C5.0043 2.49976 7.01955 2.49976 11.0501 2.49976H12.9501C16.9806 2.49976 18.9958 2.49976 20.2479 3.75187C21.5001 5.00399 21.5001 7.01925 21.5001 11.0498V12.9498C21.5001 14.158 21.5001 15.1851 21.4663 16.0648C21.4393 16.7699 21.4258 17.1224 21.1588 17.2541C20.8918 17.3859 20.5932 17.1746 19.9958 16.752L18.6501 15.7998" />
        <path d="M14.9453 12.3948C14.7686 13.0215 13.9333 13.4644 12.2629 14.3502C10.648 15.2064 9.8406 15.6346 9.18992 15.4625C8.9209 15.3913 8.6758 15.2562 8.47812 15.07C8 14.6198 8 13.7465 8 12C8 10.2535 8 9.38018 8.47812 8.92995C8.6758 8.74381 8.9209 8.60868 9.18992 8.53753C9.8406 8.36544 10.648 8.79357 12.2629 9.64983C13.9333 10.5356 14.7686 10.9785 14.9453 11.6052C15.0182 11.8639 15.0182 12.1361 14.9453 12.3948Z" />
      </svg>
    </a>
  )
}

function PlayerRow({
  rank, username, tier, value, sub, matchId,
}: { rank: number; username: string; tier: Tier; value: string; sub?: string; matchId?: string }) {
  const flagCode = getFlagCode(username)
  return (
    <div className={styles.row}>
      <RankNum n={rank} />
      <div className={styles.rowInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {flagCode && <FlagIcon code={flagCode} />}
          <span className={styles.rowName}>{username}</span>
        </div>
        {sub && <span className={styles.rowSub}>{sub}</span>}
      </div>
      <span className={styles.rowValue} style={{ color: valueColor(rank), textShadow: valueShadow(rank) }}>
        {value}
      </span>
      {matchId ? <ReplayLink matchId={matchId} /> : <div className={styles.rowBadge}>
        <Image src={RANK_IMAGES[tier]} alt={tier} width={28} height={28} />
      </div>}
      {matchId && <div className={styles.rowBadge}>
        <Image src={RANK_IMAGES[tier]} alt={tier} width={28} height={28} />
      </div>}
    </div>
  )
}

function PlayerNames({ names }: { names: string[] }) {
  if (!names.length) return <span>—</span>
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {names.map((name, i) => {
        const code = getFlagCode(name)
        return (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <span style={{ opacity: 0.4 }}>&amp;</span>}
            {code && <FlagIcon code={code} />}
            {name}
          </span>
        )
      })}
    </span>
  )
}

function SpeedRow({ rank, match }: { rank: number; match: RecordsData['speed'][0] }) {
  const winners = match.teams[0] ?? []
  const losers  = match.teams[1] ?? []
  const losersStr  = losers.length  ? losers.join(' & ')  : '—'

  return (
    <div className={styles.row}>
      <RankNum n={rank} />
      <div className={styles.rowInfo}>
        <span className={styles.rowName}><PlayerNames names={winners} /></span>
        <span className={styles.rowSub}>vs {losersStr} · {fmtDate(match.date)}</span>
      </div>
      <span className={styles.rowValue} style={{ color: valueColor(rank), textShadow: valueShadow(rank) }}>
        {fmtDuration(match.duration)}
      </span>
      <ReplayLink matchId={match.id} />
    </div>
  )
}

function Loading() {
  return (
    <div className={styles.loading}>
      <div className={styles.loadingDots}><span /><span /><span /></div>
      <span className={styles.loadingText}>loading records</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function RecordsPanel({ season, isOpen, onClose }: Props) {
  const [category, setCategory] = useState<Category>('score')
  const [records, setRecords] = useState<RecordsData | null>(null)
  const [loading, setLoading] = useState(false)
  const lastFetch = useRef<{ season: Season; time: number }>({ season: 0 as Season, time: 0 })

  useEffect(() => {
    if (!isOpen) {
      setCategory('score')
      return
    }

    const { season: prevSeason, time } = lastFetch.current
    if (prevSeason === season && records && Date.now() - time < 5 * 60 * 1000) return

    setLoading(true)
    fetch(`/api/records?season=${season}`)
      .then(r => r.json())
      .then((data: RecordsData) => {
        setRecords(data)
        lastFetch.current = { season, time: Date.now() }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [isOpen, season]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.outer}>
          <motion.div
            className={styles.panel}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--accent)', flexShrink: 0 }}>
                  <path d="M10 2L6 4H2v4c0 4 3.5 7.5 8 8 4.5-.5 8-4 8-8V4h-4L10 2z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none"/>
                  <path d="M7 13h6M10 13v3M7 16h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span className={styles.title}>Records</span>
                <span className={styles.meta}>top 10 · all time</span>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            <div className={styles.tabs}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.tab} ${category === cat.id ? styles.tabActive : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className={styles.body}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className={styles.list}
                >
                  {loading && <Loading />}

                  {!loading && category === 'score' && (
                    <>
                      <div className={styles.listLabel}>highest single-match score</div>
                      {(records?.score ?? []).map((r, i) => (
                        <PlayerRow key={r.username} rank={i + 1}
                          username={r.username} tier={r.tier}
                          value={r.score.toLocaleString()}
                          sub={`${r.matches} matches · ${r.winRate.toFixed(1)}% wr`}
                          matchId={r.matchId} />
                      ))}
                    </>
                  )}

                  {!loading && category === 'kd' && (
                    <>
                      <div className={styles.listLabel}>best k/d ratio in a single match</div>
                      {(records?.kd ?? []).map((r, i) => (
                        <PlayerRow key={r.username} rank={i + 1}
                          username={r.username} tier={r.tier}
                          value={r.bestKd % 1 === 0 ? `${r.bestKd}.00` : r.bestKd.toFixed(2)}
                          sub={`${r.kills}K / ${r.deaths}D`}
                          matchId={r.matchId} />
                      ))}
                    </>
                  )}

                  {!loading && category === 'streak' && (
                    <>
                      <div className={styles.listLabel}>longest win streak ever recorded</div>
                      {(records?.streak ?? []).map((s, i) => (
                        <PlayerRow key={s.username} rank={i + 1}
                          username={s.username} tier={s.tier}
                          value={`${s.maxStreak}W`}
                          sub={`${s.matches} matches · ${s.winRate.toFixed(1)}% wr`} />
                      ))}
                    </>
                  )}

                  {!loading && category === 'addict' && (
                    <>
                      <div className={styles.listLabel}>most matches played</div>
                      {(records?.addict ?? []).map((p, i) => (
                        <PlayerRow key={p.username} rank={i + 1}
                          username={p.username} tier={p.tier}
                          value={p.matches.toLocaleString()}
                          sub={`${p.winRate.toFixed(1)}% win rate · elo ${p.elo}`} />
                      ))}
                    </>
                  )}

                  {!loading && category === 'speed' && (
                    <>
                      <div className={styles.listLabel}>shortest match duration</div>
                      {(records?.speed ?? []).map((m, i) => (
                        <SpeedRow key={m.id || i} rank={i + 1} match={m} />
                      ))}
                      {(records?.speed ?? []).length === 0 && (
                        <div className={styles.empty}>no match data available</div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
