import type { MazeGroup, CommunityMaze } from '@/types'

export const MAZE_GROUPS: MazeGroup[] = [
  {
    name: 'Finite',
    slug: 'finite',
    description: 'Fixed mazes with a defined path from start to finish.',
    color: '#00d4ff',
    difficulties: [
      { name: 'Basic',        slug: 'basic',        path: 'finite/basic',        count: 5, color: '#4eff91' },
      { name: 'Intermediate', slug: 'intermediate',  path: 'finite/intermediate', count: 6, color: '#e8ff47' },
      { name: 'Advanced',     slug: 'advanced',      path: 'finite/advanced',     count: 9, color: '#ff9a3c' },
      { name: 'Expert',       slug: 'expert',        path: 'finite/expert',       count: 8, color: '#00d4ff' },
      { name: 'Demon',        slug: 'demon',         path: 'finite/demon',        count: 9, color: '#ff3d6e' },
    ],
  },
  {
    name: 'Infinite',
    slug: 'infinite',
    description: 'Procedurally extended loops with no defined endpoint.',
    color: '#c084fc',
    difficulties: [
      { name: 'Intermediate', slug: 'intermediate', path: 'infinite/intermediate', count: 1, startAt: 5, color: '#e8ff47' },
      { name: 'Advanced',     slug: 'advanced',     path: 'infinite/advanced',     count: 4, color: '#ff9a3c' },
    ],
  },
]

export const COMMUNITY_MAZES: CommunityMaze[] = [
  {
    id: 'ellis-wince',
    title: 'Wince',
    author: 'Ellis',
    type: 'finite',
    difficulty: 'Demon+',
    difficultyColor: '#ff0044',
    src: '/assets/mazes/community/ellis - wince.webm',
  },
]
