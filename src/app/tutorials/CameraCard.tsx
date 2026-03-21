'use client'

import React, { useState } from 'react'
import Image from 'next/image'

interface Props {
  name: string
  image: string
  config: string
  index: number
}

export default function CameraCard({ name, image, config, index }: Props) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(config).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '3fr 2fr',
      border: '1px solid var(--card-border)',
      background: 'var(--card)',
      overflow: 'hidden',
      minWidth: 0,
    }}>
      {/* Image */}
      <div style={{
        position: 'relative',
        aspectRatio: '16/9',
        background: '#080808',
        borderRight: '1px solid var(--card-border)',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        <Image
          src={image}
          alt={`${name} camera perspective`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="60vw"
          priority={index === 0}
        />
        {/* Name overlay on image */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32px 28px 20px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
        }}>
          <span style={{
            fontFamily: 'var(--font-bebas), sans-serif',
            fontSize: '42px',
            letterSpacing: '4px',
            color: '#fff',
            lineHeight: 1,
          }}>{name}</span>
        </div>
      </div>

      {/* Config panel */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--card-border)',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: 'rgba(240,240,240,0.35)',
          }}>autoexec.cfg</span>

          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: copied ? '#4eff91' : 'var(--muted)',
              background: 'none',
              border: `1px solid ${copied ? 'rgba(78,255,145,0.3)' : 'rgba(255,255,255,0.08)'}`,
              padding: '5px 12px',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            {copied ? (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <rect x="3" y="3" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M7 3V2a1 1 0 00-1-1H2a1 1 0 00-1 1v4a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Code */}
        <pre style={{
          fontFamily: 'var(--font-mono), monospace',
          fontSize: '12px',
          lineHeight: '2',
          color: 'rgba(232,255,71,0.8)',
          background: 'transparent',
          padding: '20px 24px',
          margin: 0,
          whiteSpace: 'pre-wrap' as const,
          wordBreak: 'break-word' as const,
          overflowY: 'auto',
          flex: 1,
        }}>{config}</pre>
      </div>
    </div>
  )
}
