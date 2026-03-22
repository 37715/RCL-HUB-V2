'use client'

import React from 'react'
import Image from 'next/image'
import css from './WallCard.module.css'

interface Props {
  name: string
  previewImage: string
  downloadPath?: string
  noDownloadReason?: string
  index: number
}

export default function WallCard({ name, previewImage, downloadPath, noDownloadReason, index }: Props) {
  return (
    <div className={css.card}>
      {/* Preview image */}
      <div className={css.imageWrap}>
        <Image
          src={previewImage}
          alt={`${name} wall preview`}
          fill
          style={{ objectFit: 'contain' }}
          sizes="(max-width: 768px) 100vw, 60vw"
          priority={index === 0}
        />
        {/* Name overlay */}
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

      {/* Right panel */}
      <div className={css.infoPanel}>
        <div>
          <span style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontSize: '9px',
            fontWeight: 700,
            letterSpacing: '3px',
            textTransform: 'uppercase' as const,
            color: 'rgba(240,240,240,0.35)',
            display: 'block',
            marginBottom: '10px',
          }}>Wall Texture</span>

          <p style={{
            fontFamily: 'var(--font-barlow), sans-serif',
            fontSize: '13px',
            fontWeight: 400,
            lineHeight: '1.7',
            color: 'rgba(240,240,240,0.55)',
            margin: 0,
          }}>
            {downloadPath
              ? <>Place the downloaded file inside your game&apos;s <span style={{ color: 'rgba(232,255,71,0.8)', fontWeight: 600 }}>textures</span> folder. The file must remain named <span style={{ color: 'rgba(232,255,71,0.8)', fontFamily: 'var(--font-mono), monospace', fontSize: '12px' }}>dir_wall.png</span> to work correctly.</>
              : noDownloadReason
            }
          </p>
        </div>

        {downloadPath ? (
          <a
            href={downloadPath}
            download="dir_wall.png"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              alignSelf: 'flex-start',
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '2px',
              textTransform: 'uppercase' as const,
              color: 'var(--accent)',
              border: '1px solid rgba(232,255,71,0.3)',
              padding: '12px 20px',
              textDecoration: 'none',
              background: 'rgba(232,255,71,0.04)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7M3.5 5.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 10.5h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Download dir_wall.png
          </a>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            alignSelf: 'flex-start',
            fontFamily: 'var(--font-barlow), sans-serif',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '2px',
            textTransform: 'uppercase' as const,
            color: 'rgba(240,240,240,0.2)',
            border: '1px solid rgba(255,255,255,0.06)',
            padding: '12px 20px',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <line x1="4" y1="4" x2="8" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              <line x1="8" y1="4" x2="4" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            No download
          </div>
        )}
      </div>
    </div>
  )
}
