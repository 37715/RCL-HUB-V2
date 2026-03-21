import { NextRequest, NextResponse } from 'next/server'
import { getPlayerHistory, type UiSeason } from '@/lib/rclApi'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const username = searchParams.get('username') ?? ''
  const seasonRaw = parseInt(searchParams.get('season') ?? '4')
  const season = (seasonRaw >= 1 && seasonRaw <= 4 ? seasonRaw : 4) as UiSeason

  if (!username) return NextResponse.json([])

  try {
    const matches = await getPlayerHistory(username, season)
    return NextResponse.json(matches)
  } catch (err) {
    console.error('[/api/player/history]', err)
    return NextResponse.json([], { status: 502 })
  }
}
