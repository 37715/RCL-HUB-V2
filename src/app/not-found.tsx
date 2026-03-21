import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '48px',
    }}>
      <span style={{
        fontFamily: 'var(--font-bebas)',
        fontSize: '120px',
        lineHeight: 1,
        color: 'var(--accent)',
        textShadow: '0 0 40px rgba(232,255,71,0.25)',
        letterSpacing: '8px',
      }}>404</span>
      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '2.5px',
        textTransform: 'uppercase',
        color: 'rgba(240,240,240,0.35)',
        margin: 0,
      }}>page not found</p>
      <Link href="/leaderboard" style={{
        marginTop: '24px',
        fontFamily: 'var(--font-barlow)',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'var(--muted)',
        textDecoration: 'none',
        border: '1px solid var(--line)',
        padding: '10px 24px',
        transition: 'color 0.15s, border-color 0.15s',
      }}>← back to leaderboard</Link>
    </div>
  )
}
