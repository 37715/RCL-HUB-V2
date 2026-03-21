export type GameMode = 'tst' | '1v1' | 'sumobar' | 'fortress'
export type Season = 1 | 2 | 3 | 4
export type Region = 'eu' | 'na' | 'combined'
export type TimePeriod = 'all' | 'weekly'
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'amethyst' | 'master' | 'grandmaster' | 'legend'
export type StatsMode = 'simple' | 'advanced'
export type SortKey = 'elo' | 'kd' | 'matches' | 'winRate' | 'highScore' | 'avgPosition'
export type SortDir = 'asc' | 'desc'

export interface Player {
  id: string
  username: string
  tag: string
  region: 'eu' | 'na'
  tier: Tier
  elo: number
  kd: number
  lastActive: string
  matches: number
  wins: number
  second: number
  third: number
  losses: number
  winRate: number
  avgPosition: number
  avgScore: number
  highScore: number
  ratingDelta: number
}

export interface MazeDifficulty {
  name: string
  slug: string
  path: string    // folder path under /assets/mazes/
  count: number
  startAt?: number  // first file number (default 1)
  color: string
}

export interface MazeGroup {
  name: string
  slug: string
  description: string
  color: string
  difficulties: MazeDifficulty[]
}

export interface CommunityMaze {
  id: string
  title: string
  author: string
  type: 'finite' | 'infinite'
  difficulty: string   // display label e.g. "Demon+"
  difficultyColor: string
  src: string          // path under /assets/mazes/community/
}
