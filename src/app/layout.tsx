import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/layout/Nav'
import AmbientBackground from '@/components/layout/AmbientBackground'

export const metadata: Metadata = {
  title: 'RCL — Retrocycles League',
  description: 'The official competitive leaderboard for Retrocycles League',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Apply low-perf mode before first paint to avoid flash */}
        <script dangerouslySetInnerHTML={{ __html: `try{var s=JSON.parse(localStorage.getItem('rcl_settings')||'{}');if(s.laggyMode)document.documentElement.setAttribute('data-low-perf','')}catch(e){}` }} />
      </head>
      <body>
        <AmbientBackground />
        <Nav />
        <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>
      </body>
    </html>
  )
}
