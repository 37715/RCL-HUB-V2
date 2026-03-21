export default function SupportPage() {
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
        }}>05 — support</p>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(64px, 10vw, 120px)',
          letterSpacing: '6px',
          color: 'var(--text)',
          lineHeight: 0.9,
          margin: 0,
        }}>
          get<br />
          <span style={{ color: 'var(--accent)', textShadow: '0 0 60px rgba(232,255,71,0.3)' }}>help</span>
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

        {/* Main block */}
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
            }}>discord</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'rgba(240,240,240,0.65)',
              lineHeight: 1.9,
              marginBottom: '32px',
            }}>
              for help or questions about rcl, the leaderboard, or the hub, reach out on discord.
            </p>

            {/* Contact cards */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {['vllis', 'syn_acc'].map((name) => (
                <div key={name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 20px',
                  background: 'rgba(232,255,71,0.04)',
                  border: '1px solid rgba(232,255,71,0.15)',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                    boxShadow: '0 0 10px rgba(232,255,71,0.6)',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    color: 'var(--text)',
                    letterSpacing: '1px',
                  }}>{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
