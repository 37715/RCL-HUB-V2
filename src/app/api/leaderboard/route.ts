import { NextRequest, NextResponse } from 'next/server'
import {
  getLeaderboardRows,
  getSumobarLeaderboard,
  type UiSeason,
  type UiRegion,
  type UiPeriod,
} from '@/lib/rclApi'
import { OVO_PLAYERS } from '@/data/players'
import type { Player, Tier } from '@/types'

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

function regionDisplay(region: UiRegion): 'eu' | 'na' {
  return region === 'na' ? 'na' : 'eu'
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode = (searchParams.get('mode') ?? 'tst') as 'tst' | '1v1' | 'sumobar'
  const seasonRaw = parseInt(searchParams.get('season') ?? '4')
  const season = (seasonRaw >= 1 && seasonRaw <= 4 ? seasonRaw : 4) as UiSeason
  const region = (searchParams.get('region') ?? 'combined') as UiRegion
  const period = (searchParams.get('period') ?? 'all') as UiPeriod

  if (mode === '1v1') return NextResponse.json(OVO_PLAYERS)

  try {
    if (mode === 'sumobar') {
      const rows = await getSumobarLeaderboard(season, region)
      const players: Player[] = rows.map((r, i) => {
        const tier = getTier(r.elo)
        const wins   = r.matches > 0 ? Math.round((r.pos1Rate / 100) * r.matches) : 0
        const second = r.matches > 0 ? Math.round((r.pos2Rate / 100) * r.matches) : 0
        const third  = r.matches > 0 ? Math.round((r.pos3Rate / 100) * r.matches) : 0
        const losses = Math.max(0, r.matches - wins - second - third)
        const avgPos = r.pos1Rate > 0
          ? (1 * r.pos1Rate + 2 * r.pos2Rate + 3 * r.pos3Rate + 4 * r.pos4Rate) / 100
          : 0
        return {
          id: `sumo-live-s${season}-${i}`,
          username: r.name, tag: '', region: regionDisplay(region), tier,
          elo: r.elo, kd: r.kd, lastActive: r.lastActive, matches: r.matches,
          wins, second, third, losses,
          winRate: r.pos1Rate, avgPosition: Math.round(avgPos * 10) / 10,
          avgScore: 0, highScore: 0, ratingDelta: 0,
        }
      })
      return NextResponse.json(players)
    }

    // TST — K/D, avgPosition, avgScore, highScore all come from the HTML table directly
    const allRows = await getLeaderboardRows(season, region, period)
    const rows = allRows.filter((r) => r.matches > 0)

    const players: Player[] = rows.map((r, i) => {
      const tier   = getTier(r.elo)
      const wins   = r.matches > 0 ? Math.round((r.pos1Rate / 100) * r.matches) : 0
      const second = r.matches > 0 ? Math.round((r.pos2Rate / 100) * r.matches) : 0
      const third  = r.matches > 0 ? Math.round((r.pos3Rate / 100) * r.matches) : 0
      const losses = Math.max(0, r.matches - wins - second - third)
      return {
        id: `tst-live-s${season}-${region}-${i}`,
        username: r.name, tag: '', region: regionDisplay(region), tier,
        elo: r.elo, kd: r.kd, lastActive: r.lastActive, matches: r.matches,
        wins, second, third, losses,
        winRate: r.pos1Rate, avgPosition: r.avgPosition,
        avgScore: r.avgScore, highScore: r.highScore, ratingDelta: r.latestChange,
      }
    })
    return NextResponse.json(players)
  } catch (err) {
    console.error('[/api/leaderboard]', err)
    return NextResponse.json({ error: 'Failed to fetch leaderboard data' }, { status: 502 })
  }
}
