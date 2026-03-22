import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'RCL — Retrocycles League'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#06060A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Arial Black", Impact, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(232,255,71,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,255,71,0.03) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #e8ff47, transparent)',
            boxShadow: '0 0 40px rgba(232,255,71,0.6)',
          }}
        />

        {/* Bottom accent bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'rgba(232,255,71,0.15)',
          }}
        />

        {/* Corner marks */}
        <div style={{ position: 'absolute', top: '32px', left: '48px', width: '20px', height: '20px', borderTop: '2px solid rgba(232,255,71,0.4)', borderLeft: '2px solid rgba(232,255,71,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', top: '32px', right: '48px', width: '20px', height: '20px', borderTop: '2px solid rgba(232,255,71,0.4)', borderRight: '2px solid rgba(232,255,71,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '32px', left: '48px', width: '20px', height: '20px', borderBottom: '2px solid rgba(232,255,71,0.4)', borderLeft: '2px solid rgba(232,255,71,0.4)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: '32px', right: '48px', width: '20px', height: '20px', borderBottom: '2px solid rgba(232,255,71,0.4)', borderRight: '2px solid rgba(232,255,71,0.4)', display: 'flex' }} />

        {/* Glow behind text */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '300px',
            background: 'radial-gradient(ellipse, rgba(232,255,71,0.07) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* RCL badge */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid rgba(232,255,71,0.25)',
            padding: '10px 28px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span
            style={{
              fontSize: '18px',
              fontWeight: 900,
              letterSpacing: '6px',
              color: 'rgba(232,255,71,0.6)',
              textTransform: 'uppercase',
            }}
          >
            retrocycles league
          </span>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: '120px',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#e8ff47',
            lineHeight: 1,
            textShadow: '0 0 80px rgba(232,255,71,0.4)',
            display: 'flex',
            marginBottom: '24px',
          }}
        >
          RCL
        </div>

        {/* Divider */}
        <div
          style={{
            width: '200px',
            height: '1px',
            background: 'rgba(232,255,71,0.3)',
            marginBottom: '24px',
            display: 'flex',
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: '22px',
            fontWeight: 400,
            letterSpacing: '6px',
            color: 'rgba(240,240,240,0.55)',
            textTransform: 'uppercase',
            fontFamily: 'Arial, sans-serif',
            display: 'flex',
          }}
        >
          competitive leaderboard &amp; stats
        </div>

        {/* URL pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            fontSize: '14px',
            letterSpacing: '3px',
            color: 'rgba(232,255,71,0.4)',
            fontFamily: 'monospace',
            display: 'flex',
          }}
        >
          hub.retrocyclesleague.com
        </div>
      </div>
    ),
    { ...size }
  )
}
