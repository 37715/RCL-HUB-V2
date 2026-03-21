export default function AboutPage() {
  return (
    <div style={{
      minHeight: '100vh',
      padding: '80px 0 120px',
      position: 'relative',
    }}>
      {/* Page header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 48px 48px',
        marginBottom: '64px',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'rgba(232,255,71,0.5)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>04 — about</p>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(64px, 10vw, 120px)',
          letterSpacing: '6px',
          color: 'var(--text)',
          lineHeight: 0.9,
          margin: 0,
        }}>
          retrocycles<br />
          <span style={{ color: 'var(--accent)', textShadow: '0 0 60px rgba(232,255,71,0.3)' }}>league</span>
        </h1>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '780px',
        padding: '0 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: '56px',
      }}>

        {/* Block 1 */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'rgba(232,255,71,0.35)',
            letterSpacing: '2px',
            flexShrink: 0,
            paddingTop: '6px',
            width: '32px',
          }}>01</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              marginBottom: '14px',
              lineHeight: 1,
            }}>what is rcl</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'rgba(240,240,240,0.65)',
              lineHeight: 1.9,
              margin: 0,
            }}>
              rcl is the home of competitive retrocycles. this site is the hub and leaderboard
              for the community — a place to learn, check rankings, and follow the game.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Block 2 */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'rgba(232,255,71,0.35)',
            letterSpacing: '2px',
            flexShrink: 0,
            paddingTop: '6px',
            width: '32px',
          }}>02</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              marginBottom: '14px',
              lineHeight: 1,
            }}>the leaderboard</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'rgba(240,240,240,0.65)',
              lineHeight: 1.9,
              margin: 0,
            }}>
              the leaderboard tracks elo, stats, and rank tiers so you can see where you stand
              and follow other players.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Block 3 */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'rgba(232,255,71,0.35)',
            letterSpacing: '2px',
            flexShrink: 0,
            paddingTop: '6px',
            width: '32px',
          }}>03</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              marginBottom: '14px',
              lineHeight: 1,
            }}>the hub</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'rgba(240,240,240,0.65)',
              lineHeight: 1.9,
              margin: 0,
            }}>
              the hub is where you create an account, log in with{' '}
              <span style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
                background: 'rgba(232,255,71,0.08)',
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '12px',
              }}>/login {'<user>'}@rcl</span>{' '}
              in-game, and get into pickup or ranked play.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Block 4 — future */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'rgba(232,255,71,0.35)',
            letterSpacing: '2px',
            flexShrink: 0,
            paddingTop: '6px',
            width: '32px',
          }}>04</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              marginBottom: '14px',
              lineHeight: 1,
            }}>going forward</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'rgba(240,240,240,0.65)',
              lineHeight: 1.9,
              margin: 0,
            }}>
              rcl is building toward a clearer competitive landscape — structured seasons,
              tournaments, and better support for both casual and serious play.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
