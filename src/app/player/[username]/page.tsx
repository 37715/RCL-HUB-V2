import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPlayerLeaderboardRow, getPlayerHistory } from '@/lib/rclApi'
import MatchHistoryTable from './MatchHistoryTable'

export const revalidate = 120

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const decoded = decodeURIComponent(params.username)
  return {
    title: decoded,
    description: `${decoded}'s RCL player profile — ELO rating, win rate, match history, and season stats.`,
    openGraph: {
      title: `${decoded} | RCL Player Profile`,
      description: `${decoded}'s RCL player profile — ELO rating, win rate, match history, and season stats.`,
    },
  }
}

interface Props {
  params: { username: string }
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    position: 'relative',
    padding: 'clamp(24px, 5vw, 48px) clamp(16px, 6vw, 64px) 80px',
  },
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--muted)',
    textDecoration: 'none',
    marginBottom: '48px',
    transition: 'color 0.15s',
  } as React.CSSProperties,
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  eyebrowLine: { width: '40px', height: '1px', background: 'var(--accent)' },
  eyebrowText: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '5px',
    color: 'var(--accent)',
    textTransform: 'uppercase',
  } as React.CSSProperties,
  heroTitle: {
    fontFamily: 'var(--font-bebas), sans-serif',
    fontSize: 'clamp(56px, 8vw, 110px)',
    lineHeight: '0.9',
    letterSpacing: '2px',
    background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '48px',
    wordBreak: 'break-word',
  } as React.CSSProperties,
  statCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '16px',
    marginBottom: '56px',
  },
  statCard: {
    background: 'var(--card)',
    border: '1px solid var(--card-border)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statLabel: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '3px',
    textTransform: 'uppercase',
    color: 'var(--muted)',
  } as React.CSSProperties,
  statValue: {
    fontFamily: 'var(--font-bebas), sans-serif',
    fontSize: '36px',
    letterSpacing: '1px',
    color: 'var(--text)',
    lineHeight: '1',
  },
  sectionTitle: {
    fontFamily: 'var(--font-bebas), sans-serif',
    fontSize: '28px',
    letterSpacing: '3px',
    color: 'var(--text)',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--line)',
  },
  noData: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '13px',
    fontWeight: 300,
    letterSpacing: '1px',
    color: 'rgba(240,240,240,0.25)',
    fontStyle: 'italic',
    marginTop: '32px',
    lineHeight: '1.6',
  },
}


export default async function PlayerProfilePage({ params }: Props) {
  const { username } = params
  const decoded = decodeURIComponent(username)

  // Fetch data server-side — current season (4 = 2026)
  const [leaderboardRow, historyMatches] = await Promise.allSettled([
    getPlayerLeaderboardRow(decoded, 4),
    getPlayerHistory(decoded, 4),
  ])

  const row = leaderboardRow.status === 'fulfilled' ? leaderboardRow.value : null
  const history = historyMatches.status === 'fulfilled' ? historyMatches.value : []

  // Lobby ELO (avg entry rating of all match participants) is embedded in each
  // history match already — average across the recent matches shown in the table.
  const lobbyElos = history.slice(0, 20).map((m) => m.lobbyAvgElo).filter((v) => v > 0)
  const avgOfAvgs = lobbyElos.length > 0
    ? Math.round(lobbyElos.reduce((a, b) => a + b, 0) / lobbyElos.length)
    : null

  const statCards = [
    { label: 'ELO Rating', value: row ? row.elo.toLocaleString() : '—' },
    { label: 'Rank', value: row ? `#${row.rank}` : '—' },
    { label: 'Win Rate', value: row ? `${row.pos1Rate.toFixed(1)}%` : '—' },
    { label: 'Matches', value: row ? (row.matches > 0 ? String(row.matches) : '—') : '—' },
    { label: 'Avg Match ELO', value: avgOfAvgs != null ? avgOfAvgs.toLocaleString() : '—' },
  ]

  return (
    <div style={styles.page}>
      <Link href="/leaderboard" style={styles.backLink}>
        ← Back to Leaderboard
      </Link>

      <div style={styles.eyebrow}>
        <div style={styles.eyebrowLine} />
        <span style={styles.eyebrowText}>Player Profile · S4 2026</span>
      </div>
      <h1 style={styles.heroTitle}>{decoded}</h1>

      {/* Stat cards */}
      <div style={styles.statCards}>
        {statCards.map((card, i) => (
          <div key={i} style={styles.statCard}>
            <span style={styles.statLabel}>{card.label}</span>
            <span style={styles.statValue}>{card.value}</span>
          </div>
        ))}
      </div>

      {/* Match history */}
      <div>
        <h2 style={styles.sectionTitle}>Match History</h2>

        {history.length > 0 ? (
          <MatchHistoryTable history={history} />
        ) : (
          <p style={styles.noData}>
            {row
              ? 'No match history available for this season.'
              : 'Player not found in the current season rankings.'}
          </p>
        )}
      </div>
    </div>
  )
}
