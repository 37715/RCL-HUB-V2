import { NextResponse } from 'next/server'
import { getRecentMatches } from '@/lib/rclApi'

export async function GET() {
  try {
    const matches = await getRecentMatches()
    return NextResponse.json(matches)
  } catch (err) {
    console.error('[/api/matches/recent]', err)
    return NextResponse.json([], { status: 502 })
  }
}
