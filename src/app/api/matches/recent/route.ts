import { NextResponse } from 'next/server'
import { getRecentMatches } from '@/lib/rclApi'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '20')
    const matches = await getRecentMatches({ page, limit })
    return NextResponse.json(matches)
  } catch (err) {
    console.error('[/api/matches/recent]', err)
    return NextResponse.json([])
  }
}
