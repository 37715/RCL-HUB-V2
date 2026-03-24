import { NextRequest, NextResponse } from 'next/server'
import {
  getLeaderboardRows,
  getMatchHistory,
  getMatchDetails,
  getPlayerHistory,
  sanitizeName,
  type UiSeason,
  type PlayerHistoryMatch,
} from '@/lib/rclApi'
import type { Tier } from '@/types'

function getTier(elo: number): Tier {
  if (elo < 1400) return 'bronze'
  if (elo < 1600) return 'silver'
  if (elo < 1900) return 'gold'
  if (elo < 2100) return 'platinum'
  if (elo < 2200) return 'diamond'
  if (elo < 2300) return 'master'
  if (elo < 2400) return 'grandmaster'
  return 'legend'
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

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------
interface ScoreRecord {
  username: string; tier: Tier; matches: number; winRate: number
  score: number; matchId: string
}
interface KdRecord {
  username: string; tier: Tier; matches: number; winRate: number
  bestKd: number; kills: number; deaths: number; matchId: string
}
interface StreakRecord {
  username: string; tier: Tier; matches: number; winRate: number
  maxStreak: number
}
interface AddictRecord {
  username: string; tier: Tier; matches: number; winRate: number; elo: number
}
interface SpeedRecord {
  id: string; date: string; duration: number; teams: string[][]
}
interface RecordsData {
  score: ScoreRecord[]
  kd: KdRecord[]
  streak: StreakRecord[]
  addict: AddictRecord[]
  speed: SpeedRecord[]
  computedAt: number
}

// ---------------------------------------------------------------------------
// In-memory cache (survives across requests in standalone mode)
// ---------------------------------------------------------------------------
interface CacheEntry { data: RecordsData; timestamp: number }
const cache = new Map<number, CacheEntry>()
const pending = new Map<number, Promise<RecordsData>>()
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

async function computeRecords(season: UiSeason): Promise<RecordsData> {
  // 1. Full leaderboard (period='all' already filters to >=10 matches)
  const leaderboard = await getLeaderboardRows(season, 'combined', 'all')
  const playerNames = leaderboard.map(r => r.name)
  const playerInfo = new Map(leaderboard.map(r => [r.name, r]))

  // 2. Fetch ALL player histories in batches of 15
  const histories = new Map<string, PlayerHistoryMatch[]>()
  const BATCH = 15
  for (let i = 0; i < playerNames.length; i += BATCH) {
    const batch = playerNames.slice(i, i + BATCH)
    const results = await Promise.allSettled(
      batch.map(name => getPlayerHistory(name, season))
    )
    for (let j = 0; j < batch.length; j++) {
      const r = results[j]
      histories.set(batch[j], r.status === 'fulfilled' ? r.value : [])
    }
  }

  // 3. Best single-match score
  const score: ScoreRecord[] = playerNames
    .map(name => {
      const info = playerInfo.get(name)!
      const best = computeBestMatchScore(histories.get(name) ?? [])
      return {
        username: name, tier: getTier(info.elo),
        matches: info.matches, winRate: info.pos1Rate,
        score: best.score || info.highScore, matchId: best.matchId,
      }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)

  // 4. Best single-match K/D — checks EVERY qualified player (fixes missing records)
  const kd: KdRecord[] = playerNames
    .map(name => {
      const info = playerInfo.get(name)!
      const best = computeBestMatchKd(histories.get(name) ?? [])
      return {
        username: name, tier: getTier(info.elo),
        matches: info.matches, winRate: info.pos1Rate,
        bestKd: best.kd, kills: best.kills, deaths: best.deaths, matchId: best.matchId,
      }
    })
    .filter(r => r.bestKd > 0)
    .sort((a, b) => b.bestKd - a.bestKd)
    .slice(0, 10)

  // 5. Longest win streak
  const streak: StreakRecord[] = playerNames
    .map(name => {
      const info = playerInfo.get(name)!
      return {
        username: name, tier: getTier(info.elo),
        matches: info.matches, winRate: info.pos1Rate,
        maxStreak: computeMaxStreak(histories.get(name) ?? []),
      }
    })
    .filter(r => r.maxStreak > 0)
    .sort((a, b) => b.maxStreak - a.maxStreak)
    .slice(0, 10)

  // 6. Most matches played
  const addict: AddictRecord[] = [...leaderboard]
    .sort((a, b) => b.matches - a.matches)
    .slice(0, 10)
    .map(r => ({
      username: r.name, tier: getTier(r.elo),
      matches: r.matches, winRate: r.pos1Rate, elo: r.elo,
    }))

  // 7. Fastest wins
  const pages = await Promise.allSettled(
    [1, 2, 3, 4, 5].map(p => getMatchHistory('tst', p))
  )
  const allMatches = pages.flatMap(r => (r.status === 'fulfilled' ? r.value : []))
  const top10Speed = allMatches
    .filter(m => m.totalTimeSeconds > 60)
    .sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds)
    .slice(0, 10)

  const details = await Promise.allSettled(top10Speed.map(m => getMatchDetails(m.id)))
  const speed: SpeedRecord[] = top10Speed.map((m, i) => {
    const detail = details[i].status === 'fulfilled' ? details[i].value : null
    const rawTeams: Record<string, unknown>[] =
      detail && Array.isArray((detail as Record<string, unknown>).teams)
        ? ((detail as Record<string, unknown>).teams as Record<string, unknown>[])
        : []
    const teams: string[][] = rawTeams.map(t => {
      const rawPlayers: Record<string, unknown>[] = Array.isArray(t.players)
        ? (t.players as Record<string, unknown>[])
        : []
      return rawPlayers
        .map(p => sanitizeName(String(p.nickname ?? p.username ?? p.player ?? '').trim()))
        .filter(Boolean)
    })
    return { id: m.id, date: m.date, duration: m.totalTimeSeconds, teams }
  })

  return { score, kd, streak, addict, speed, computedAt: Date.now() }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const seasonRaw = parseInt(searchParams.get('season') ?? '4')
  const season = (seasonRaw >= 1 && seasonRaw <= 4 ? seasonRaw : 4) as UiSeason

  // Serve from cache if fresh
  const cached = cache.get(season)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data)
  }

  // Deduplicate concurrent requests for the same season
  let promise = pending.get(season)
  if (!promise) {
    promise = computeRecords(season)
    pending.set(season, promise)
  }

  try {
    const data = await promise
    cache.set(season, { data, timestamp: Date.now() })
    return NextResponse.json(data)
  } catch (err) {
    console.error('[/api/records]', err)
    if (cached) return NextResponse.json(cached.data)
    return NextResponse.json(
      { score: [], kd: [], streak: [], addict: [], speed: [], computedAt: 0 },
      { status: 502 },
    )
  } finally {
    pending.delete(season)
  }
}
