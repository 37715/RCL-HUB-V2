import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Retrocycles League',
    short_name: 'RCL',
    description: 'The official competitive leaderboard for Retrocycles League.',
    start_url: '/leaderboard',
    scope: '/',
    display: 'standalone',
    background_color: '#06060A',
    theme_color: '#e8ff47',
    orientation: 'portrait-primary',
    categories: ['games', 'sports'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
