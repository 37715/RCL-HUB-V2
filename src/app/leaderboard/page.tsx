import type { Metadata } from 'next'
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description: 'Live ELO rankings across all RCL game modes — TST, Sumobar, Fortress, and 1v1. Filter by region, season, and time period.',
  openGraph: {
    title: 'RCL Leaderboard',
    description: 'Live ELO rankings across all RCL game modes — TST, Sumobar, Fortress, and 1v1.',
  },
}

export default function LeaderboardPage() {
  return <LeaderboardClient />
}
