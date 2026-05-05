import type { Metadata } from 'next'
import LeaderboardClient from '@/components/leaderboard/LeaderboardClient'

export const metadata: Metadata = {
  title: 'Leaderboard',
  description:
    'Live RCL leaderboards across TST, Sumobar, Fortress, 1v1, and Trap Survival. Filter by mode, season, and map.',
  openGraph: {
    title: 'RCL Leaderboard',
    description:
      'Live RCL leaderboards across TST, Sumobar, Fortress, 1v1, and Trap Survival.',
  },
}

export default function LeaderboardPage() {
  return <LeaderboardClient />
}
