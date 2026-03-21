import { NextResponse } from 'next/server'
import { getMatchHistory, getMatchDetails, sanitizeName } from '@/lib/rclApi'

export const revalidate = 300

export async function GET() {
  try {
    // Fetch pages 1-5 in parallel to find fastest
    const pages = await Promise.allSettled(
      [1, 2, 3, 4, 5].map((p) => getMatchHistory('tst', p))
    )
    const all = pages.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))

    const top10 = all
      .filter((m) => m.totalTimeSeconds > 60)
      .sort((a, b) => a.totalTimeSeconds - b.totalTimeSeconds)
      .slice(0, 10)

    // Fetch match details for each to extract player names
    const details = await Promise.allSettled(top10.map((m) => getMatchDetails(m.id)))

    const fastest = top10.map((m, i) => {
      const detail = details[i].status === 'fulfilled' ? details[i].value : null
      const rawTeams: Record<string, unknown>[] = detail && Array.isArray((detail as Record<string, unknown>).teams)
        ? (detail as Record<string, unknown>).teams as Record<string, unknown>[]
        : []

      const teams: string[][] = rawTeams.map((t) => {
        const rawPlayers: Record<string, unknown>[] = Array.isArray(t.players)
          ? t.players as Record<string, unknown>[]
          : []
        return rawPlayers.map((p) => sanitizeName(String(p.nickname ?? p.username ?? p.player ?? '').trim())).filter(Boolean)
      })

      return {
        id: m.id,
        date: m.date,
        duration: m.totalTimeSeconds,
        teams, // teams[0] = winners, teams[1] = losers
      }
    })

    return NextResponse.json({ fastest })
  } catch (err) {
    console.error('[/api/records]', err)
    return NextResponse.json({ fastest: [] }, { status: 502 })
  }
}
