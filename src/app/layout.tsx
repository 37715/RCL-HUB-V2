import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
  themeColor: '#e8ff47',
}
import './globals.css'
import Nav from '@/components/layout/Nav'
import AmbientBackground from '@/components/layout/AmbientBackground'
import MobileBottomNav from '@/components/leaderboard/MobileBottomNav'
import PWAInstallBanner from '@/components/layout/PWAInstallBanner'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hub.retrocyclesleague.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: 'RCL — Retrocycles League',
    template: '%s | RCL',
  },
  description: 'The official competitive leaderboard for Retrocycles League. Track ELO ratings, match history, player stats, records, and rankings across all game modes.',
  keywords: ['Retrocycles', 'RCL', 'Retrocycles League', 'leaderboard', 'competitive', 'ELO', 'rankings', 'TST', 'Sumobar', 'Fortress'],
  authors: [{ name: 'RCL' }],
  creator: 'RCL',

  openGraph: {
    type: 'website',
    siteName: 'Retrocycles League',
    title: 'RCL — Retrocycles League',
    description: 'The official competitive leaderboard for Retrocycles League. Track ELO ratings, match history, player stats, records, and rankings.',
    url: SITE_URL,
    locale: 'en_GB',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'RCL — Retrocycles League',
    description: 'The official competitive leaderboard for Retrocycles League. Track ELO ratings, match history, player stats, and rankings.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icons/apple-touch-icon.png',
  },

  manifest: '/manifest.webmanifest',

  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title: 'RCL',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script dangerouslySetInnerHTML={{ __html: `try{var s=JSON.parse(localStorage.getItem('rcl_settings')||'{}');if(s.laggyMode)document.documentElement.setAttribute('data-low-perf','')}catch(e){}` }} />
      </head>
      <body>
        <AmbientBackground />
        <Nav />
        <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
        <PWAInstallBanner />
        <MobileBottomNav />
      </body>
    </html>
  )
}
