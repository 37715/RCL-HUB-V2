// Server-only module — never import this in 'use client' files

export type UiSeason = 1 | 2 | 3 | 4
export type UiRegion = 'eu' | 'na' | 'combined'
export type UiPeriod = 'all' | 'weekly'

export interface LeaderboardRow {
  rank: number
  name: string
  elo: number
  latestChange: number
  lastActive: string
  matches: number
  kd: number
  avgPosition: number
  avgScore: number
  highScore: number
  pos1Rate: number // percent 0-100
  pos2Rate: number
  pos3Rate: number
  pos4Rate: number
}

export interface SumobarRow {
  name: string
  elo: number
  matches: number
  pos1Rate: number
  pos2Rate: number
  pos3Rate: number
  pos4Rate: number
  lastActive: string
  kd: number // kills / deaths ratio (0 = not available)
}

export interface MatchSummary {
  id: string
  date: string
  roundCount: number
  totalTimeSeconds: number
  winner: string
  server?: string
  region?: string
}

export interface PlayerHistoryMatch {
  matchId: string
  date: string
  teamPlace: number
  place: number      // individual place
  score: number
  kills: number
  deaths: number
  kd: string
  entryRating: number
  exitRating: number
  change: string
  teammates: string[]
  playedPct: number  // 0-100
  alivePct: number   // 0-100
}

export interface PlayerProfileData {
  username: string
  elo: number
  rank: number
  matches: MatchSummary[]
  history: PlayerHistoryMatch[]
  summary: {
    avgKd: string
    avgScore: number
    winRate: number
    totalMatches: number
    wins: number
  }
}

// ---------------------------------------------------------------------------
// Season config
// ---------------------------------------------------------------------------
export const SEASON_CONFIG: Record<UiSeason, { start: string; end: string; apiId: string }> = {
  1: { start: '2023-01-01', end: '2023-12-31', apiId: 'tst24' },
  2: { start: '2024-01-01', end: '2024-12-31', apiId: 'tst24' },
  3: { start: '2025-01-01', end: '2025-12-31', apiId: 'tst24' },
  4: { start: '2026-01-01', end: '2026-12-31', apiId: 'tst' },
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------
function regionSuffix(region: UiRegion): string {
  if (region === 'eu') return '-eu'
  if (region === 'na') return '-us'
  return ''
}

function weeklyDates(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now)
  start.setDate(now.getDate() - 6)
  const end = new Date(now)
  end.setDate(now.getDate() + 1)
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  }
}

const NAME_REPLACEMENTS: [RegExp, string][] = [
  [/cuckold/gi, 'apple'],
]

export function sanitizeName(name: string): string {
  let out = name
  for (const [pattern, replacement] of NAME_REPLACEMENTS) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .trim()
}

// Extract a human-readable "last active" string from raw cell text.
// The cell may contain a numeric prefix (e.g. a record ID) before the
// relative date string, so we search for recognisable patterns first.
function extractLastActive(raw: string): string {
  const text = raw.trim()
  if (!text) return 'unknown'

  // Pattern: "X unit(s) ago" — pick this up even if preceded by other text
  const relMatch = text.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i)
  if (relMatch) {
    const n = relMatch[1]
    const unit = relMatch[2].toLowerCase()
    if (unit.startsWith('second')) return `${n}s ago`
    if (unit.startsWith('minute')) return `${n}m ago`
    if (unit.startsWith('hour')) return `${n}h ago`
    if (unit.startsWith('day')) return n === '1' ? '1d ago' : `${n}d ago`
    if (unit.startsWith('week')) return n === '1' ? '1w ago' : `${n}w ago`
    if (unit.startsWith('month')) return n === '1' ? '1mo ago' : `${n}mo ago`
    if (unit.startsWith('year')) return n === '1' ? '1y ago' : `${n}y ago`
  }

  if (/just\s*now/i.test(text)) return 'just now'

  // Fallback: try to parse whatever is in the cell as an ISO date
  // Use the first token that looks like a date (YYYY-MM-DD)
  const isoMatch = text.match(/\d{4}-\d{2}-\d{2}/)
  const candidate = isoMatch ? isoMatch[0] : text
  const d = new Date(candidate)
  if (!isNaN(d.getTime())) {
    const diff = Date.now() - d.getTime()
    if (diff < 0) return 'unknown'
    const hours = Math.floor(diff / 3_600_000)
    const days = Math.floor(diff / 86_400_000)
    if (diff < 60_000) return 'just now'
    if (hours < 1) return `${Math.floor(diff / 60_000)}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return '1d ago'
    if (days > 365) return '>1y ago'
    return `${days}d ago`
  }

  return 'unknown'
}

// Extract aria-valuenow from progress-bar divs in a chunk of HTML
function extractPlacementRates(html: string): { p1: number; p2: number; p3: number } {
  const bars: Array<{ value: number; title: string }> = []

  const barPattern = /<div[^>]*class="[^"]*progress-bar[^"]*"[^>]*>/gi
  let m: RegExpExecArray | null
  while ((m = barPattern.exec(html)) !== null) {
    const tag = m[0]
    const valueMatch = /aria-valuenow="([\d.]+)"/.exec(tag)
    const titleMatch = /title="([^"]*)"/.exec(tag)
    if (valueMatch) {
      bars.push({ value: parseFloat(valueMatch[1]), title: titleMatch?.[1] ?? '' })
    }
  }

  let p1 = 0,
    p2 = 0,
    p3 = 0
  for (const bar of bars) {
    const t = bar.title.toLowerCase()
    if (t.startsWith('3rd') || t.startsWith('3.') || t.startsWith('3 ')) {
      p3 = bar.value
    } else if (t.startsWith('2nd') || t.startsWith('2.') || t.startsWith('2 ')) {
      p2 = bar.value
    } else if (p1 === 0 && bar.value > 0) {
      p1 = bar.value
    }
  }

  return { p1, p2, p3 }
}


// ---------------------------------------------------------------------------
// HTML rankings parser
// ---------------------------------------------------------------------------
function parseRankingsHtml(html: string, minMatches: number): LeaderboardRow[] {
  const results: LeaderboardRow[] = []
  let uiIndex = 0

  // Split on </tr> — each block contains exactly one <tr ... > ... </tr>
  const trBlocks = html.split(/<\/tr>/i)

  for (const block of trBlocks) {
    const trIdx = block.lastIndexOf('<tr')
    if (trIdx === -1) continue
    const rowHtml = block.slice(trIdx)

    // Extract TD inner HTML
    const tds: string[] = []
    const tdBlocks = rowHtml.split(/<\/td>/i)
    for (const tdBlock of tdBlocks) {
      const tdIdx = tdBlock.lastIndexOf('<td')
      if (tdIdx === -1) continue
      const tagEnd = tdBlock.indexOf('>', tdIdx)
      if (tagEnd === -1) continue
      tds.push(tdBlock.slice(tagEnd + 1))
    }

    if (tds.length < 3) continue

    // Col 0: rank — must be a number to skip header rows
    const rankText = stripTags(tds[0]).replace(/[^\d]/g, '')
    const rank = parseInt(rankText)
    if (isNaN(rank)) continue

    // Col 1: player name
    const name = sanitizeName(stripTags(tds[1]).trim())
    if (!name) continue

    // Col 2: ELO
    const elo = parseFloat(stripTags(tds[2]).replace(/[,\s]/g, '')) || 1500

    // Col 3: latest rating change (may have +/- sign)
    const changeRaw = stripTags(tds[3]).replace(/[^\d.\-+]/g, '')
    const latestChange = parseFloat(changeRaw) || 0

    // Col 4: date text → relative
    const dateText = stripTags(tds[4]).trim()
    const lastActive = extractLastActive(dateText)

    // Wide table (≥ 11 cols): all stats are in explicit numeric columns.
    // Narrow table (< 11 cols): placement rates come from progress bars only.
    let matches = 0
    let kd = 0
    let avgPosition = 0
    let avgScore = 0
    let highScore = 0
    let p1 = 0, p2 = 0, p3 = 0

    // Placement rates always live in progress bars (col 5 in both wide and narrow).
    // Wide table (≥ 11 cols) additionally has explicit numeric stats in later cols:
    //   [5]=progress bars  [6]=matches  [7]=avgPos  [8]=avgScore  [9]=highScore  [10]=K/D
    const bars = extractPlacementRates(rowHtml)
    p1 = bars.p1; p2 = bars.p2; p3 = bars.p3

    if (tds.length >= 11) {
      matches     = parseInt(stripTags(tds[6]).replace(/[^\d]/g, '')) || 0
      avgPosition = parseFloat(stripTags(tds[7])) || 0
      avgScore    = parseInt(stripTags(tds[8]).replace(/[^\d]/g, '')) || 0
      highScore   = parseInt(stripTags(tds[9]).replace(/[^\d]/g, '')) || 0
      kd          = parseFloat(stripTags(tds[10])) || 0
    }

    const p4 = Math.max(0, 100 - p1 - p2 - p3)

    // Skip rows that don't meet minimum matches requirement
    if (matches > 0 && matches < minMatches) continue

    results.push({
      rank: uiIndex + 1,
      name,
      elo: Math.round(elo),
      latestChange: Math.round(latestChange),
      lastActive,
      matches,
      kd: Math.round(kd * 100) / 100,
      avgPosition: Math.round(avgPosition * 10) / 10,
      avgScore,
      highScore,
      pos1Rate: Math.round(p1 * 10) / 10,
      pos2Rate: Math.round(p2 * 10) / 10,
      pos3Rate: Math.round(p3 * 10) / 10,
      pos4Rate: Math.round(p4 * 10) / 10,
    })

    uiIndex++
  }

  return results
}

// ---------------------------------------------------------------------------
// Public API functions
// ---------------------------------------------------------------------------

export async function getLeaderboardRows(
  season: UiSeason,
  region: UiRegion,
  period: UiPeriod = 'all',
): Promise<LeaderboardRow[]> {
  const cfg = SEASON_CONFIG[season]
  const suffix = regionSuffix(region)
  const apiId = cfg.apiId + suffix
  const minMatches = period === 'weekly' ? 1 : 10

  let datel: string, date: string
  if (period === 'weekly') {
    const w = weeklyDates()
    datel = w.start
    date = w.end
  } else {
    datel = cfg.start
    date = cfg.end
  }

  const url = `https://corsapi.armanelgtron.tk/rankings/daterange.php?datel=${datel}&date=${date}&id=${apiId}`
  let res = await fetch(url, { next: { revalidate: 300 } })
  // Retry once on gateway errors (upstream occasionally 504s under load)
  if (res.status === 504 || res.status === 502 || res.status === 503) {
    await new Promise((r) => setTimeout(r, 1500))
    res = await fetch(url, { next: { revalidate: 300 } })
  }
  if (!res.ok) throw new Error(`Rankings fetch failed: ${res.status}`)
  const html = await res.text()
  return parseRankingsHtml(html, minMatches)
}

export async function getPlayerLeaderboardRow(
  username: string,
  season: UiSeason,
): Promise<LeaderboardRow | null> {
  // Fetch the full table and find the player by name (case-insensitive)
  const rows = await getLeaderboardRows(season, 'combined', 'all')
  const lower = username.toLowerCase()
  return rows.find((r) => r.name.toLowerCase() === lower) ?? null
}


export async function getMatchHistory(
  mode: 'tst' | 'sbt' = 'tst',
  page = 1,
): Promise<MatchSummary[]> {
  const url = `https://retrocyclesleague.com/api/history/${mode}?page=${page}`
  const res = await fetch(url, { next: { revalidate: 120 } })
  if (!res.ok) throw new Error(`Match history fetch failed: ${res.status}`)
  const data = await res.json()
  const list: Record<string, unknown>[] = Array.isArray(data)
    ? data
    : ((data.matches ?? data.data ?? []) as Record<string, unknown>[])
  return list.map((m) => ({
    id: String(m.id ?? ''),
    date: String(m.date ?? ''),
    roundCount: Number(m.roundCount ?? 0),
    totalTimeSeconds: Number(m.totalTimeSeconds ?? m.totalTime ?? 0),
    winner: String(m.winner ?? ''),
    server: m.server ? String(m.server) : undefined,
    region: m.region ? String(m.region) : undefined,
  }))
}

export async function getMatchDetails(matchId: string): Promise<Record<string, unknown> | null> {
  const url = `https://retrocyclesleague.com/api/history/tst?id=${encodeURIComponent(matchId)}`
  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null
  return res.json()
}

export async function getPlayerHistory(
  username: string,
  season: UiSeason,
): Promise<PlayerHistoryMatch[]> {
  const cfg = SEASON_CONFIG[season]
  let url: string
  if (season === 4) {
    url = `https://corsapi.armanelgtron.tk/rankings/?id=tst&type=history&mp=${encodeURIComponent(username)}`
  } else {
    url = `https://corsapi.armanelgtron.tk/rankings/?id=tst24&type=history&daterange=1&datel=${cfg.start}&date=${cfg.end}&mp=${encodeURIComponent(username)}`
  }

  const res = await fetch(url, { next: { revalidate: 120 } })
  if (!res.ok) throw new Error(`Player history fetch failed: ${res.status}`)
  const data = await res.json()
  const matchList: Record<string, unknown>[] = Array.isArray(data) ? data : []

  const matches: PlayerHistoryMatch[] = []
  for (const entry of matchList) {
    const players: Record<string, unknown>[] = Array.isArray(entry.players)
      ? (entry.players as Record<string, unknown>[])
      : []
    const playerRow = players.find(
      (p) => String(p.player ?? '').toLowerCase() === username.toLowerCase(),
    )
    if (!playerRow) continue

    const kd_raw: [number, number] = Array.isArray(playerRow.kd)
      ? (playerRow.kd as [number, number])
      : [0, 0]
    const kills = kd_raw[0] ?? 0
    const deaths = kd_raw[1] ?? 0
    const kdStr = deaths === 0 ? `${kills}.00` : (kills / deaths).toFixed(2)

    const entryRating = Number(playerRow.entryRating ?? 0)
    const exitRating = Number(playerRow.exitRating ?? entryRating)
    const change = exitRating - entryRating
    const changeStr = change >= 0 ? `+${change}` : String(change)

    // Individual place: sort all players by score desc
    const allSorted = [...players].sort(
      (a, b) => Number(b.score ?? 0) - Number(a.score ?? 0),
    )
    const individualPlace =
      allSorted.findIndex(
        (p) => String(p.player ?? '').toLowerCase() === username.toLowerCase(),
      ) + 1

    const teammates = players
      .filter(
        (p) =>
          String(p.team ?? '') === String(playerRow.team ?? '') &&
          String(p.player ?? '').toLowerCase() !== username.toLowerCase(),
      )
      .map((p) => sanitizeName(String(p.player ?? '')))

    const teamPlace = Number(playerRow.place ?? 0)

    const rawPlayed = Number(playerRow.played ?? 0)
    const rawAlive  = Number(playerRow.alive  ?? 0)
    // API returns ratios (0-1) or percentages (0-100) — normalise to 0-100
    const playedPct = Math.round((rawPlayed <= 1 ? rawPlayed * 100 : rawPlayed))
    const alivePct  = Math.round((rawAlive  <= 1 ? rawAlive  * 100 : rawAlive))

    matches.push({
      matchId: String(entry.id ?? entry._id ?? ''),
      date: String(entry.date ?? ''),
      teamPlace,
      place: individualPlace || teamPlace,
      score: Number(playerRow.score ?? 0),
      kills,
      deaths,
      kd: kdStr,
      entryRating,
      exitRating,
      change: changeStr,
      teammates,
      playedPct,
      alivePct,
    })
  }

  // Sort by date descending
  matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  return matches
}

export interface RecentMatchPlayer {
  name: string
  score: number
  kills: number
  deaths: number
  kd: string
}

export interface RecentMatchTeam {
  name: string       // e.g. "gold", "purple" — used for color
  place: number
  totalScore: number
  players: RecentMatchPlayer[]
}

export interface RecentMatch {
  id: string
  date: string
  roundCount: number
  duration: number   // seconds
  winner: string     // winning team name
  server?: string
  region?: string
  teams: RecentMatchTeam[]
}

export async function getRecentMatches(): Promise<RecentMatch[]> {
  // Step 1: fetch match list from the correct RCL API
  const summaries = await getMatchHistory('tst', 1)
  const recent = summaries.slice(0, 20)

  // Step 2: fetch full details for each match in parallel
  const details = await Promise.all(recent.map((s) => getMatchDetails(s.id)))

  const results: RecentMatch[] = []

  for (let i = 0; i < recent.length; i++) {
    const summary = recent[i]
    const detail = details[i]
    if (!detail) continue

    const rawTeams: Record<string, unknown>[] = Array.isArray(detail.teams)
      ? (detail.teams as Record<string, unknown>[])
      : []

    const teams: RecentMatchTeam[] = rawTeams.map((t, idx) => {
      // Authoritative team score direct from match detail
      const totalScore = Number(t.score ?? 0)

      const rawPlayers: Record<string, unknown>[] = Array.isArray(t.players)
        ? (t.players as Record<string, unknown>[])
        : []

      const players: RecentMatchPlayer[] = rawPlayers.map((p) => {
        const positions: Record<string, unknown>[] = Array.isArray(p.positions)
          ? (p.positions as Record<string, unknown>[])
          : []

        // Score derived per the API guide: kills*30 + holePoints per position
        const score = positions.reduce((sum, pos) => {
          return sum + Number(pos.kills ?? 0) * 30 + Number(pos.holePoints ?? pos.hole_points ?? 0)
        }, 0)
        const kills = positions.reduce((sum, pos) => sum + Number(pos.kills ?? 0), 0)
        const deaths = positions.reduce((sum, pos) => sum + Number(pos.deaths ?? 0), 0)
        const kdStr = deaths === 0 ? (kills > 0 ? `${kills}.00` : '0.00') : (kills / deaths).toFixed(2)

        return {
          name: sanitizeName(String(p.nickname ?? p.username ?? p.player ?? '')),
          score,
          kills,
          deaths,
          kd: kdStr,
        }
      })

      return {
        name: String(t.teamName ?? t.name ?? `Team ${idx + 1}`),
        place: idx + 1, // teams array is ordered by placement in the detail response
        totalScore,
        players,
      }
    })

    results.push({
      id: summary.id,
      date: summary.date,
      roundCount: summary.roundCount,
      duration: summary.totalTimeSeconds,
      winner: summary.winner,
      server: summary.server,
      region: summary.region,
      teams,
    })
  }

  return results
}

export async function getSumobarLeaderboard(
  season: UiSeason,
  region: UiRegion,
  limit = 100,
  offset = 0,
): Promise<SumobarRow[]> {
  const cfg = SEASON_CONFIG[season]
  let url = `https://retrocyclesleague.com/api/v1/sumobar/leaderboard?limit=${limit}&offset=${offset}&min_matches=1&datel=${cfg.start}&date=${cfg.end}`
  if (region !== 'combined') {
    url += `&region=${region === 'na' ? 'us' : region}`
  }

  const token =
    process.env.SUMOBAR_API_TOKEN ?? process.env.NEXT_PUBLIC_SUMOBAR_API_TOKEN ?? ''

  async function doFetch(headers: HeadersInit = {}): Promise<Response> {
    return fetch(url, { headers, next: { revalidate: 300 } })
  }

  let res = await doFetch()
  if ((res.status === 401 || res.status === 403) && token) {
    res = await doFetch({ 'X-RCL-Sumobar-Token': token })
    if (res.status === 401 || res.status === 403) {
      res = await doFetch({ Authorization: `Bearer ${token}` })
    }
  }
  if (!res.ok) throw new Error(`Sumobar fetch failed: ${res.status}`)

  const json = await res.json()
  const rows: Record<string, unknown>[] = Array.isArray(json)
    ? json
    : ((json.rows ?? json.data ?? []) as Record<string, unknown>[])

  return rows.map((r) => {
    const name = sanitizeName(String(r.player_auth ?? r.player_name ?? r.name ?? ''))
    const elo = Number(r.elo ?? r.rating ?? 1500)
    const matches = Number(r.matches ?? r.games ?? 0)
    const lastActive = extractLastActive(String(r.updated_at ?? r.last_active ?? ''))

    const rawP1 = Number(r.place_1_rate ?? r.position1_rate ?? r.p1_count ?? 0)
    const rawP2 = Number(r.place_2_rate ?? r.position2_rate ?? r.p2_count ?? 0)
    const rawP3 = Number(r.place_3_rate ?? r.position3_rate ?? r.p3_count ?? 0)

    let p1 = rawP1,
      p2 = rawP2,
      p3 = rawP3
    if (p1 <= 1 && p2 <= 1 && p3 <= 1 && p1 + p2 + p3 <= 1) {
      // fractions → percentages
      p1 *= 100
      p2 *= 100
      p3 *= 100
    } else if (matches > 0 && p1 + p2 + p3 > 100) {
      // raw counts → percentages
      p1 = (p1 / matches) * 100
      p2 = (p2 / matches) * 100
      p3 = (p3 / matches) * 100
    }
    const p4 = Math.max(0, 100 - p1 - p2 - p3)

    const kills = Number(r.kills ?? r.total_kills ?? 0)
    const deaths = Number(r.deaths ?? r.total_deaths ?? 0)
    const kd = deaths > 0 ? kills / deaths : kills > 0 ? kills : 0

    return {
      name,
      elo: Math.round(elo),
      matches,
      pos1Rate: Math.round(p1 * 10) / 10,
      pos2Rate: Math.round(p2 * 10) / 10,
      pos3Rate: Math.round(p3 * 10) / 10,
      pos4Rate: Math.round(p4 * 10) / 10,
      lastActive,
      kd: Math.round(kd * 100) / 100,
    }
  })
}
