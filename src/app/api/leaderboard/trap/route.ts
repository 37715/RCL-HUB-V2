import { NextResponse } from 'next/server'
import type { Player, Tier } from '@/types'

const OVERALL_MAP = '__overall__'

const TIER_ORDER = ['basic', 'intermediate', 'advanced', 'expert', 'demon'] as const
type TrapTier = (typeof TIER_ORDER)[number]

type TrapDifficultyParam = 'all' | TrapTier

const TIER_WEIGHT: Record<TrapTier, number> = {
  basic: 0.6,
  intermediate: 0.9,
  advanced: 1.7,
  expert: 3.6,
  demon: 6.2,
}

type MapSummary = {
  mapResource: string
  mapName: string | null
  difficultyLabel: string | null
  survivalTargetSeconds: number | null
  runCount: number
}

type RunRow = {
  playerName?: string
  survivedSeconds?: number
  survivalTargetSeconds?: number | null
  cleared?: boolean
  endedAt?: string
  difficultyLabel?: string | null
  mapResource?: string
}

type AttemptRow = {
  playerName?: string
  attempts?: number
  uniqueMaps?: number
  latestRunAt?: string | null
}

/**
 * Trap run rows live in the **rcl-dashboard** Postgres, served at `GET /api/trap-survival/records`.
 * On the UK prod host, outbound HTTPS to `retrocyclesleague.com` often fails (connection refused),
 * so we try local blue/green dashboard ports before the public URL. Override with
 * `RCL_TRAP_SURVIVAL_RECORDS_BASE_URL` when the hub runs off-box.
 */
function trapRecordsBaseCandidates(): string[] {
  const fromEnv = process.env.RCL_TRAP_SURVIVAL_RECORDS_BASE_URL?.trim()
  if (fromEnv) return [fromEnv.replace(/\/$/, '')]
  return [
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'https://retrocyclesleague.com',
  ]
}

function normalizeTier(label: string | null | undefined): TrapTier | null {
  if (!label) return null
  const s = label.trim().toLowerCase()
  if ((TIER_ORDER as readonly string[]).includes(s)) return s as TrapTier
  if (s.startsWith('demon')) return 'demon'
  if (s.startsWith('expert')) return 'expert'
  if (s.startsWith('advanced')) return 'advanced'
  if (s.startsWith('intermediate')) return 'intermediate'
  if (s.startsWith('basic')) return 'basic'
  return null
}

function parseDifficulty(raw: string | null): TrapDifficultyParam {
  const v = (raw || 'all').trim().toLowerCase()
  if (v === 'all') return 'all'
  if ((TIER_ORDER as readonly string[]).includes(v)) return v as TrapTier
  return 'all'
}

function canonicalTrapUsername(name: string): string {
  const k = name.trim().toLowerCase()
  if (k === 'nanu_nanu@forums' || k === 'nanu\\_nanu@forums' || k === 'nanu\\\\_nanu@forums') {
    return 'nanu@forums'
  }
  return name.trim()
}

function emptyPayload(
  difficulty: TrapDifficultyParam,
  mapResource: string,
): {
  selectedDifficulty: TrapDifficultyParam
  selectedMapResource: string
  selectedMapName: string | null
  difficulties: { value: string; label: string; mapCount: number }[]
  maps: { mapResource: string; mapName: string; survivalTargetSeconds: number | null; runCount: number }[]
  players: Player[]
} {
  return {
    selectedDifficulty: difficulty,
    selectedMapResource: mapResource,
    selectedMapName: null,
    difficulties: [{ value: 'all', label: 'Overall', mapCount: 0 }],
    maps: [],
    players: [],
  }
}

async function fetchTrapJson(query: string): Promise<Record<string, unknown>> {
  const bases = trapRecordsBaseCandidates()
  let lastErr: Error | null = null
  for (const base of bases) {
    const url = `${base}/api/trap-survival/records?authOnly=true&${query}`
    try {
      const res = await fetch(url, { next: { revalidate: 45 } })
      if (!res.ok) {
        lastErr = new Error(`trap records ${res.status} from ${base}`)
        continue
      }
      return (await res.json()) as Record<string, unknown>
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e))
    }
  }
  throw lastErr ?? new Error('trap records: no reachable upstream')
}

function readRecentMaps(json: Record<string, unknown>): MapSummary[] {
  const raw = json.recentMaps
  if (!Array.isArray(raw)) return []
  const out: MapSummary[] = []
  for (const row of raw) {
    if (!row || typeof row !== 'object') continue
    const r = row as Record<string, unknown>
    const mapResource = String(r.mapResource ?? '')
    if (!mapResource) continue
    out.push({
      mapResource,
      mapName: r.mapName == null ? null : String(r.mapName),
      difficultyLabel: r.difficultyLabel == null ? null : String(r.difficultyLabel),
      survivalTargetSeconds:
        r.survivalTargetSeconds == null ? null : Number(r.survivalTargetSeconds),
      runCount: Number(r.runCount ?? 0),
    })
  }
  return out
}

function filterMapsByDifficulty(maps: MapSummary[], difficulty: TrapDifficultyParam): MapSummary[] {
  if (difficulty === 'all') return maps
  return maps.filter((m) => normalizeTier(m.difficultyLabel) === difficulty)
}

function tierCounts(maps: MapSummary[]): Record<TrapTier, number> {
  const counts: Record<TrapTier, number> = {
    basic: 0,
    intermediate: 0,
    advanced: 0,
    expert: 0,
    demon: 0,
  }
  const seen = new Set<string>()
  for (const m of maps) {
    const t = normalizeTier(m.difficultyLabel)
    if (!t) continue
    if (seen.has(m.mapResource)) continue
    seen.add(m.mapResource)
    counts[t] += 1
  }
  return counts
}

function buildDifficulties(allMaps: MapSummary[]) {
  const counts = tierCounts(allMaps)
  const totalUnique = new Set(allMaps.map((m) => m.mapResource)).size
  const difficulties: { value: string; label: string; mapCount: number }[] = [
    { value: 'all', label: 'Overall', mapCount: totalUnique },
  ]
  for (const t of TIER_ORDER) {
    if (counts[t] > 0) {
      difficulties.push({
        value: t,
        label: t.charAt(0).toUpperCase() + t.slice(1),
        mapCount: counts[t],
      })
    }
  }
  return difficulties
}

function mapPickerOptions(difficulty: TrapDifficultyParam, filteredMaps: MapSummary[]) {
  const maps: {
    mapResource: string
    mapName: string
    survivalTargetSeconds: number | null
    runCount: number
  }[] = []

  if (difficulty !== 'all') {
    const tierLabel = difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    maps.push({
      mapResource: OVERALL_MAP,
      mapName: `Overall Rating (${tierLabel})`,
      survivalTargetSeconds: null,
      runCount: 0,
    })
  }

  const seen = new Set<string>()
  for (const m of filteredMaps) {
    if (seen.has(m.mapResource)) continue
    seen.add(m.mapResource)
    maps.push({
      mapResource: m.mapResource,
      mapName: m.mapName || m.mapResource.split('/').pop() || m.mapResource,
      survivalTargetSeconds: m.survivalTargetSeconds,
      runCount: m.runCount,
    })
  }
  return maps
}

function tierForTrap(): Tier {
  return 'platinum'
}

function basePlayer(username: string, partial: Partial<Player>): Player {
  const u = canonicalTrapUsername(username)
  return {
    id: u,
    username: u,
    tag: 'Trap',
    region: 'eu',
    tier: tierForTrap(),
    elo: 0,
    kd: 0,
    lastActive: '—',
    matches: 0,
    wins: 0,
    second: 0,
    third: 0,
    losses: 0,
    winRate: 0,
    avgPosition: 0,
    avgScore: 0,
    highScore: 0,
    ratingDelta: 0,
    ...partial,
  }
}

function mapRunToPlayer(run: RunRow, attemptsByUser: Map<string, number>): Player {
  const rawName = String(run.playerName ?? '')
  const username = canonicalTrapUsername(rawName)
  const survived = Number(run.survivedSeconds ?? 0)
  const target =
    run.survivalTargetSeconds == null ? null : Number(run.survivalTargetSeconds)
  const cleared = !!run.cleared
  const margin = target == null ? null : survived - target
  const ended = run.endedAt ? String(run.endedAt) : ''
  const attempts = attemptsByUser.get(username.toLowerCase()) ?? 1

  return basePlayer(username, {
    elo: survived,
    bestSurvivalSeconds: survived,
    trapCleared: cleared,
    trapSurvivalTargetSeconds: target,
    trapMarginSeconds: margin,
    matches: attempts,
    lastActive: ended ? ended.slice(0, 10) : '—',
    wins: cleared ? 1 : 0,
    winRate: cleared ? 100 : 0,
  })
}

type PerMapAgg = {
  key: string
  display: string
  tierScores: Record<TrapTier, number[]>
  mapsTouched: Record<TrapTier, Set<string>>
  lastTs: number
  bestSurvival: number
}

function bumpAgg(
  aggs: Map<string, PerMapAgg>,
  run: RunRow,
  mapResource: string,
  mapTier: TrapTier | null,
) {
  const raw = String(run.playerName ?? '')
  const display = canonicalTrapUsername(raw)
  const key = display.toLowerCase()
  let agg = aggs.get(key)
  if (!agg) {
    agg = {
      key,
      display,
      tierScores: { basic: [], intermediate: [], advanced: [], expert: [], demon: [] },
      mapsTouched: {
        basic: new Set(),
        intermediate: new Set(),
        advanced: new Set(),
        expert: new Set(),
        demon: new Set(),
      },
      lastTs: 0,
      bestSurvival: 0,
    }
    aggs.set(key, agg)
  }

  const tier = normalizeTier(run.difficultyLabel) ?? mapTier
  if (!tier) return

  const target = Math.max(1, Number(run.survivalTargetSeconds ?? 1))
  const survived = Number(run.survivedSeconds ?? 0)
  const ratio = Math.min(2, survived / target) + (run.cleared ? 0.15 : 0)
  agg.tierScores[tier].push(ratio)
  agg.mapsTouched[tier].add(mapResource)
  agg.bestSurvival = Math.max(agg.bestSurvival, survived)
  const ts = run.endedAt ? Date.parse(String(run.endedAt)) : 0
  if (Number.isFinite(ts)) agg.lastTs = Math.max(agg.lastTs, ts)
}

function overallRatingForAgg(
  agg: PerMapAgg,
  mapsAvailable: Record<TrapTier, number>,
  scope: TrapDifficultyParam,
): { elo: number; avgScore: number; mapsContributed: number } {
  const tiers: TrapTier[] =
    scope === 'all' ? [...TIER_ORDER] : [scope as TrapTier]

  let weighted = 0
  let wSum = 0
  let mapsContributed = 0

  for (const t of tiers) {
    const avail = Math.max(1, mapsAvailable[t] ?? 1)
    const scores = agg.tierScores[t]
    const mean = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    const coverage = agg.mapsTouched[t].size / avail
    const coverageFactor = Math.min(1, coverage / 0.45)
    const w = TIER_WEIGHT[t]
    weighted += w * mean * coverageFactor
    wSum += w
    mapsContributed += agg.mapsTouched[t].size
  }

  const maxRaw = wSum * 2.15
  const norm = maxRaw > 0 ? Math.min(100, (weighted / maxRaw) * 100) : 0
  const display = Math.round(norm * 10) / 10
  return { elo: Math.round(norm), avgScore: display, mapsContributed }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const difficulty = parseDifficulty(searchParams.get('difficulty'))
  const mapResource = searchParams.get('mapResource')?.trim() || OVERALL_MAP

  try {
    const listJson = await fetchTrapJson('mapLimit=100')
    const allMaps = readRecentMaps(listJson)
    const difficulties = buildDifficulties(allMaps)
    const filteredForTier = filterMapsByDifficulty(allMaps, difficulty)
    const maps = mapPickerOptions(difficulty, filteredForTier)

    const mapsAvailable = tierCounts(allMaps)

    if (mapResource !== OVERALL_MAP) {
      const [bestJson, attJson] = await Promise.all([
        fetchTrapJson(
          `mapResource=${encodeURIComponent(mapResource)}&bestPerPlayer=true&limit=120`,
        ),
        fetchTrapJson(
          `overallAttempts=true&attemptLimit=8000&mapResource=${encodeURIComponent(mapResource)}`,
        ),
      ])
      const records = Array.isArray(bestJson.records) ? (bestJson.records as RunRow[]) : []
      const attemptsRaw = Array.isArray(attJson.playerAttempts)
        ? (attJson.playerAttempts as AttemptRow[])
        : []
      const attemptsByUser = new Map<string, number>()
      for (const a of attemptsRaw) {
        const name = canonicalTrapUsername(String(a.playerName ?? ''))
        attemptsByUser.set(name.toLowerCase(), Math.max(0, Number(a.attempts ?? 0)))
      }

      const sorted = [...records].sort(
        (a, b) => Number(b.survivedSeconds ?? 0) - Number(a.survivedSeconds ?? 0),
      )
      const players: Player[] = sorted.map((r) => mapRunToPlayer(r, attemptsByUser))

      const meta = allMaps.find((m) => m.mapResource === mapResource)
      return NextResponse.json({
        selectedDifficulty: difficulty,
        selectedMapResource: mapResource,
        selectedMapName: meta?.mapName ?? null,
        difficulties,
        maps,
        players,
      })
    }

    const attemptQueryDifficulty =
      difficulty === 'all' ? '' : `&difficulty=${encodeURIComponent(difficulty)}`
    const attJson = await fetchTrapJson(`overallAttempts=true&attemptLimit=8000${attemptQueryDifficulty}`)
    const attemptsRaw = Array.isArray(attJson.playerAttempts)
      ? (attJson.playerAttempts as AttemptRow[])
      : []
    const attemptMap = new Map<string, AttemptRow>()
    for (const a of attemptsRaw) {
      const name = canonicalTrapUsername(String(a.playerName ?? ''))
      attemptMap.set(name.toLowerCase(), a)
    }

    const cap = 55
    const toScan = filteredForTier.filter((m, i, arr) => arr.findIndex((x) => x.mapResource === m.mapResource) === i).slice(0, cap)

    const aggs = new Map<string, PerMapAgg>()
    const chunk = 12
    for (let i = 0; i < toScan.length; i += chunk) {
      const slice = toScan.slice(i, i + chunk)
      const results = await Promise.all(
        slice.map(async (m) => {
          try {
            const j = await fetchTrapJson(
              `mapResource=${encodeURIComponent(m.mapResource)}&bestPerPlayer=true&limit=80`,
            )
            return Array.isArray(j.records) ? (j.records as RunRow[]) : []
          } catch {
            return [] as RunRow[]
          }
        }),
      )
      for (let j = 0; j < slice.length; j++) {
        const m = slice[j]
        const mapTier = normalizeTier(m.difficultyLabel)
        for (const run of results[j]) {
          bumpAgg(aggs, run, m.mapResource, mapTier)
        }
      }
    }

    const overallRows: Player[] = []
    for (const agg of Array.from(aggs.values())) {
      const { elo, avgScore, mapsContributed } = overallRatingForAgg(agg, mapsAvailable, difficulty)
      const att = attemptMap.get(agg.key)
      const attempts = Math.max(0, Number(att?.attempts ?? 0))
      const last = att?.latestRunAt ? String(att.latestRunAt).slice(0, 10) : '—'

      overallRows.push(
        basePlayer(agg.display, {
          elo,
          avgScore,
          trapOverallScore: avgScore,
          trapMapsContributed: mapsContributed,
          matches: attempts,
          bestSurvivalSeconds: agg.bestSurvival,
          lastActive: last,
        }),
      )
    }

    overallRows.sort((a, b) => (b.elo ?? 0) - (a.elo ?? 0))

    return NextResponse.json({
      selectedDifficulty: difficulty,
      selectedMapResource: OVERALL_MAP,
      selectedMapName: null,
      difficulties,
      maps,
      players: overallRows,
    })
  } catch (e) {
    console.error('[/api/leaderboard/trap]', e)
    return NextResponse.json(emptyPayload(difficulty, mapResource))
  }
}
