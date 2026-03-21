'use client'

import React, { useState } from 'react'

interface Props {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function CollapsibleSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  const [hovered, setHovered] = useState(false)

  const accent = hovered && !open

  return (
    <div style={{ marginBottom: '80px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: accent ? 'rgba(232,255,71,0.03)' : 'none',
          border: 'none',
          padding: '8px 0',
          margin: '0 0 ' + (open ? '32px' : '0'),
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
      >
        <span style={{
          fontFamily: 'var(--font-bebas), sans-serif',
          fontSize: '32px',
          letterSpacing: '4px',
          color: accent ? 'var(--accent)' : 'var(--text)',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          transition: 'color 0.15s',
        }}>{title}</span>

        <div style={{
          flex: 1,
          height: '1px',
          background: accent ? 'rgba(232,255,71,0.25)' : 'var(--line)',
          transition: 'background 0.15s',
        }} />

        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
          }}
        >
          <polyline
            points="3,5.5 8,10.5 13,5.5"
            stroke={accent ? 'var(--accent)' : 'var(--muted)'}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && <div>{children}</div>}
    </div>
  )
}
