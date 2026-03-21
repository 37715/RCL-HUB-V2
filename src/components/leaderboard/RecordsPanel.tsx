'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { Player, Season, Tier } from '@/types'
import type { PlayerHistoryMatch } from '@/lib/rclApi'
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

interface FastMatch {
  id: string
  date: string
  duration: number
  teams: string[][]
}

interface StreakResult {
  username: string
  tier: Tier
  maxStreak: number
}

interface MatchKdResult {
  username: string
  tier: Tier
  bestKd: number
  kills: number
  deaths: number
  matchId: string
}

interface MatchScoreResult {
  username: string
  tier: Tier
  score: number
  matchId: string
}

interface Props {
  season: Season
  isOpen: boolean
  onClose: () => void
}

function computeMaxStreak(matches: PlayerHistoryMatch[]): number {
  const sorted = [...matches].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  let max = 0, cur = 0
  for (const m of sorted) {
    if (m.teamPlace === 1) { cur++; max = Math.max(max, cur) }
    else cur = 0
  }
  return max
}

function computeBestMatchKd(matches: PlayerHistoryMatch[]): { kd: number; kills: number; deaths: number; matchId: string } {
  let best = { kd: 0, kills: 0, deaths: 0, matchId: '' }
  for (const m of matches) {
    if (m.kills === 0 && m.deaths === 0) continue
    const kd = m.deaths === 0 ? m.kills : m.kills / m.deaths
    if (kd > best.kd) best = { kd, kills: m.kills, deaths: m.deaths, matchId: m.matchId }
  }
  return best
}

function computeBestMatchScore(matches: PlayerHistoryMatch[]): { score: number; matchId: string } {
  let best = { score: 0, matchId: '' }
  for (const m of matches) {
    if (m.score > best.score) best = { score: m.score, matchId: m.matchId }
  }
  return best
}

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
  rank, player, value, sub, matchId,
}: { rank: number; player: Player; value: string; sub?: string; matchId?: string }) {
  const flagCode = getFlagCode(player.username)
  return (
    <div className={styles.row}>
      <RankNum n={rank} />
      <div className={styles.rowInfo}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {flagCode && <FlagIcon code={flagCode} />}
          <span className={styles.rowName}>{player.username}</span>
        </div>
        {sub && <span className={styles.rowSub}>{sub}</span>}
      </div>
      <span className={styles.rowValue} style={{ color: valueColor(rank), textShadow: valueShadow(rank) }}>
        {value}
      </span>
      {matchId ? <ReplayLink matchId={matchId} /> : <div className={styles.rowBadge}>
        <Image src={RANK_IMAGES[player.tier]} alt={player.tier} width={28} height={28} />
      </div>}
      {matchId && <div className={styles.rowBadge}>
        <Image src={RANK_IMAGES[player.tier]} alt={player.tier} width={28} height={28} />
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

function SpeedRow({ rank, match }: { rank: number; match: FastMatch }) {
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
      <span className={styles.loadingText}>computing records</span>
    </div>
  )
}

export default function RecordsPanel({ season, isOpen, onClose }: Props) {
  const [category, setCategory] = useState<Category>('score')

  // Always fetch season-wide players (period=all) regardless of the leaderboard's current filter
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [allPlayersFetched, setAllPlayersFetched] = useState(false)

  const [fastMatches, setFastMatches] = useState<FastMatch[]>([])
  const [fastLoading, setFastLoading] = useState(false)
  const [fastFetched, setFastFetched] = useState(false)

  const [streaks, setStreaks] = useState<StreakResult[]>([])
  const [streakLoading, setStreakLoading] = useState(false)
  const [streakFetched, setStreakFetched] = useState(false)

  const [matchKds, setMatchKds] = useState<MatchKdResult[]>([])
  const [matchKdLoading, setMatchKdLoading] = useState(false)
  const [matchKdFetched, setMatchKdFetched] = useState(false)

  const [matchScores, setMatchScores] = useState<MatchScoreResult[]>([])
  const [matchScoreLoading, setMatchScoreLoading] = useState(false)
  const [matchScoreFetched, setMatchScoreFetched] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setAllPlayersFetched(false); setAllPlayers([])
      setFastFetched(false); setFastMatches([])
      setStreakFetched(false); setStreaks([])
      setMatchKdFetched(false); setMatchKds([])
      setMatchScoreFetched(false); setMatchScores([])
      setCategory('score')
    }
  }, [isOpen])

  // Fetch all-season players when panel opens
  useEffect(() => {
    if (!isOpen || allPlayersFetched) return
    setAllPlayersFetched(true)
    const params = new URLSearchParams({ mode: 'tst', season: String(season), region: 'combined', period: 'all' })
    fetch(`/api/leaderboard?${params}`)
      .then((r) => r.json())
      .then((d: Player[]) => setAllPlayers(Array.isArray(d) ? d : []))
      .catch(() => setAllPlayers([]))
  }, [isOpen, allPlayersFetched, season])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Fetch fastest matches (with player names)
  useEffect(() => {
    if (category !== 'speed' || !isOpen || fastFetched) return
    setFastLoading(true); setFastFetched(true)
    fetch('/api/records')
      .then((r) => r.json())
      .then((d) => setFastMatches(d.fastest ?? []))
      .catch(() => setFastMatches([]))
      .finally(() => setFastLoading(false))
  }, [category, isOpen, fastFetched])

  // Win streaks
  useEffect(() => {
    if (category !== 'streak' || !isOpen || streakFetched || !allPlayers.length) return
    setStreakLoading(true); setStreakFetched(true)
    const top = [...allPlayers].filter((p) => p.matches >= 10).sort((a, b) => b.winRate - a.winRate).slice(0, 20)
    Promise.all(
      top.map((p) =>
        fetch(`/api/player/history?username=${encodeURIComponent(p.username)}&season=${season}`)
          .then((r) => r.json())
          .then((h: PlayerHistoryMatch[]) => ({ username: p.username, tier: p.tier, maxStreak: computeMaxStreak(h) }))
          .catch(() => ({ username: p.username, tier: p.tier, maxStreak: 0 }))
      )
    ).then((res) => {
      setStreaks(res.filter((r) => r.maxStreak > 0).sort((a, b) => b.maxStreak - a.maxStreak))
      setStreakLoading(false)
    })
  }, [category, isOpen, streakFetched, allPlayers, season])

  // Best single-match K/D
  useEffect(() => {
    if (category !== 'kd' || !isOpen || matchKdFetched || !allPlayers.length) return
    setMatchKdLoading(true); setMatchKdFetched(true)
    const top = [...allPlayers].filter((p) => p.matches >= 10).sort((a, b) => b.kd - a.kd).slice(0, 30)
    Promise.all(
      top.map((p) =>
        fetch(`/api/player/history?username=${encodeURIComponent(p.username)}&season=${season}`)
          .then((r) => r.json())
          .then((h: PlayerHistoryMatch[]) => {
            const best = computeBestMatchKd(h)
            return { username: p.username, tier: p.tier, bestKd: best.kd, kills: best.kills, deaths: best.deaths, matchId: best.matchId }
          })
          .catch(() => ({ username: p.username, tier: p.tier, bestKd: 0, kills: 0, deaths: 0, matchId: '' }))
      )
    ).then((res) => {
      setMatchKds(res.filter((r) => r.bestKd > 0).sort((a, b) => b.bestKd - a.bestKd).slice(0, 10))
      setMatchKdLoading(false)
    })
  }, [category, isOpen, matchKdFetched, allPlayers, season])

  // Best single-match score (fetched so we have matchId)
  useEffect(() => {
    if (category !== 'score' || !isOpen || matchScoreFetched || !allPlayers.length) return
    setMatchScoreLoading(true); setMatchScoreFetched(true)
    const top = [...allPlayers].sort((a, b) => b.highScore - a.highScore).slice(0, 20)
    Promise.all(
      top.map((p) =>
        fetch(`/api/player/history?username=${encodeURIComponent(p.username)}&season=${season}`)
          .then((r) => r.json())
          .then((h: PlayerHistoryMatch[]) => {
            const best = computeBestMatchScore(h)
            return { username: p.username, tier: p.tier, score: best.score || p.highScore, matchId: best.matchId }
          })
          .catch(() => ({ username: p.username, tier: p.tier, score: p.highScore, matchId: '' }))
      )
    ).then((res) => {
      setMatchScores(res.filter((r) => r.score > 0).sort((a, b) => b.score - a.score).slice(0, 10))
      setMatchScoreLoading(false)
    })
  }, [category, isOpen, matchScoreFetched, allPlayers, season])

  const addictRecords = useMemo(
    () => [...allPlayers].sort((a, b) => b.matches - a.matches).slice(0, 10),
    [allPlayers]
  )

  const playerFor = (username: string) => allPlayers.find((p) => p.username === username)

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
                  {category === 'score' && (
                    <>
                      <div className={styles.listLabel}>highest single-match score</div>
                      {matchScoreLoading ? <Loading /> : matchScores.map((r, i) => {
                        const p = playerFor(r.username)
                        if (!p) return null
                        return (
                          <PlayerRow key={r.username} rank={i + 1} player={p}
                            value={r.score.toLocaleString()}
                            sub={`${p.matches} matches · ${p.winRate.toFixed(1)}% wr`}
                            matchId={r.matchId} />
                        )
                      })}
                    </>
                  )}

                  {category === 'kd' && (
                    <>
                      <div className={styles.listLabel}>best k/d ratio in a single match</div>
                      {matchKdLoading ? <Loading /> : matchKds.map((r, i) => {
                        const p = playerFor(r.username)
                        if (!p) return null
                        return (
                          <PlayerRow key={r.username} rank={i + 1} player={p}
                            value={r.bestKd % 1 === 0 ? `${r.bestKd}.00` : r.bestKd.toFixed(2)}
                            sub={`${r.kills}K / ${r.deaths}D`}
                            matchId={r.matchId} />
                        )
                      })}
                    </>
                  )}

                  {category === 'streak' && (
                    <>
                      <div className={styles.listLabel}>longest win streak ever recorded</div>
                      {streakLoading ? <Loading /> : streaks.slice(0, 10).map((s, i) => {
                        const p = playerFor(s.username)
                        if (!p) return null
                        return (
                          <PlayerRow key={s.username} rank={i + 1} player={p}
                            value={`${s.maxStreak}W`}
                            sub={`${p.matches} matches · ${p.winRate.toFixed(1)}% wr`} />
                        )
                      })}
                    </>
                  )}

                  {category === 'addict' && (
                    <>
                      <div className={styles.listLabel}>most matches played</div>
                      {addictRecords.map((p, i) => (
                        <PlayerRow key={p.username} rank={i + 1} player={p}
                          value={p.matches.toLocaleString()}
                          sub={`${p.winRate.toFixed(1)}% win rate · elo ${p.elo}`} />
                      ))}
                    </>
                  )}

                  {category === 'speed' && (
                    <>
                      <div className={styles.listLabel}>shortest match duration</div>
                      {fastLoading ? <Loading /> : fastMatches.map((m, i) => (
                        <SpeedRow key={m.id || i} rank={i + 1} match={m} />
                      ))}
                      {!fastLoading && fastMatches.length === 0 && (
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
