'use client'

import { useEffect, useState } from 'react'

const GAME_MODES = ['TST', '1v1', 'Sumobar', 'Fortress']
const REGIONS = ['Combined', 'EU', 'NA']
const PERIODS = ['All Time', 'Weekly']
const STATS_VIEWS = ['Simple', 'Advanced']

export const SETTINGS_KEY = 'rcl_settings'

export interface RCLSettings {
  laggyMode: boolean
  gameMode: string
  region: string
  period: string
  statsView: string
}

const DEFAULTS: RCLSettings = {
  laggyMode: false,
  gameMode: 'TST',
  region: 'Combined',
  period: 'All Time',
  statsView: 'Simple',
}

function OptionGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        color: 'rgba(232,255,71,0.45)',
        letterSpacing: '2px',
        textTransform: 'uppercase',
      }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              letterSpacing: '1px',
              padding: '8px 18px',
              background: value === opt ? 'rgba(232,255,71,0.12)' : 'transparent',
              border: `1px solid ${value === opt ? 'rgba(232,255,71,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: value === opt ? 'var(--accent)' : 'rgba(240,240,240,0.4)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              if (value !== opt) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
                e.currentTarget.style.color = 'rgba(240,240,240,0.7)'
              }
            }}
            onMouseLeave={(e) => {
              if (value !== opt) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.color = 'rgba(240,240,240,0.4)'
              }
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<RCLSettings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) setSettings({ ...DEFAULTS, ...JSON.parse(stored) })
    } catch {}
  }, [])

  function update<K extends keyof RCLSettings>(key: K, value: RCLSettings[K]) {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      // Apply laggy mode immediately without needing to save
      if (key === 'laggyMode') {
        if (value) {
          document.documentElement.setAttribute('data-low-perf', '')
        } else {
          document.documentElement.removeAttribute('data-low-perf')
          // Force style recalculation so the browser restarts all animations immediately
          void document.documentElement.offsetWidth
        }
      }
      return next
    })
    setSaved(false)
  }

  function save() {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function reset() {
    setSettings(DEFAULTS)
    localStorage.removeItem(SETTINGS_KEY)
    setSaved(false)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '80px 0 120px', position: 'relative' }}>

      {/* Header */}
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
        }}>02 — settings</p>
        <h1 style={{
          fontFamily: 'var(--font-bebas)',
          fontSize: 'clamp(64px, 10vw, 120px)',
          letterSpacing: '6px',
          color: 'var(--text)',
          lineHeight: 0.9,
          margin: 0,
        }}>
          your<br />
          <span style={{ color: 'var(--accent)', textShadow: '0 0 60px rgba(232,255,71,0.3)' }}>settings</span>
        </h1>
      </div>

      {/* Settings content */}
      <div style={{ maxWidth: '780px', padding: '0 48px', display: 'flex', flexDirection: 'column', gap: '56px' }}>

        {/* Section: Performance */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'rgba(232,255,71,0.35)',
            letterSpacing: '2px',
            flexShrink: 0,
            paddingTop: '6px',
            width: '32px',
          }}>00</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              marginBottom: '14px',
              lineHeight: 1,
            }}>performance</p>
            <label style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              cursor: 'pointer',
            }}>
              <div
                onClick={() => update('laggyMode', !settings.laggyMode)}
                style={{
                  width: '20px',
                  height: '20px',
                  flexShrink: 0,
                  marginTop: '1px',
                  border: `1px solid ${settings.laggyMode ? 'rgba(232,255,71,0.5)' : 'rgba(255,255,255,0.2)'}`,
                  borderRadius: '4px',
                  background: settings.laggyMode ? 'rgba(232,255,71,0.15)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  color: 'var(--accent)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  userSelect: 'none',
                }}
              >
                {settings.laggyMode ? '✓' : ''}
              </div>
              <div>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text)',
                  marginBottom: '4px',
                  cursor: 'pointer',
                }}
                  onClick={() => update('laggyMode', !settings.laggyMode)}
                >my computer is laggy</p>
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'rgba(240,240,240,0.35)',
                  lineHeight: 1.6,
                }}>
                  hides background animations, blurs, and visual effects that may cause slowdowns.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Section: Leaderboard defaults */}
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
          <div style={{ flex: 1 }}>
            <p style={{
              fontFamily: 'var(--font-bebas)',
              fontSize: '28px',
              letterSpacing: '3px',
              color: 'var(--accent)',
              marginBottom: '6px',
              lineHeight: 1,
            }}>leaderboard defaults</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'rgba(240,240,240,0.35)',
              marginBottom: '28px',
              lineHeight: 1.6,
            }}>
              these filters will be pre-selected when you open the leaderboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <OptionGroup label="Game Mode" options={GAME_MODES} value={settings.gameMode} onChange={(v) => update('gameMode', v)} />
              <OptionGroup label="Region" options={REGIONS} value={settings.region} onChange={(v) => update('region', v)} />
              <OptionGroup label="Period" options={PERIODS} value={settings.period} onChange={(v) => update('period', v)} />
              <OptionGroup label="Stats View" options={STATS_VIEWS} value={settings.statsView} onChange={(v) => update('statsView', v)} />
            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Section: Account */}
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
            }}>account</p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'rgba(240,240,240,0.65)',
              lineHeight: 1.9,
              marginBottom: '20px',
            }}>
              create an account and log in with{' '}
              <span style={{
                color: 'var(--accent)',
                background: 'rgba(232,255,71,0.08)',
                padding: '1px 6px',
                borderRadius: '3px',
                fontSize: '12px',
              }}>/login {'<user>'}@rcl</span>{' '}
              in-game to get into pickup or ranked play.
            </p>
            <a
              href="https://retrocyclesleague.com/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                color: 'var(--accent)',
                textDecoration: 'none',
                padding: '10px 20px',
                border: '1px solid rgba(232,255,71,0.25)',
                borderRadius: '6px',
                background: 'rgba(232,255,71,0.05)',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(232,255,71,0.1)'
                e.currentTarget.style.borderColor = 'rgba(232,255,71,0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(232,255,71,0.05)'
                e.currentTarget.style.borderColor = 'rgba(232,255,71,0.25)'
              }}
            >
              go to home ↗
            </a>
          </div>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

        {/* Save / Reset */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingLeft: '72px' }}>
          <button
            onClick={save}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '12px 28px',
              background: saved ? 'rgba(232,255,71,0.15)' : 'rgba(232,255,71,0.08)',
              border: `1px solid ${saved ? 'rgba(232,255,71,0.5)' : 'rgba(232,255,71,0.25)'}`,
              color: 'var(--accent)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {saved ? '✓ saved' : 'save settings'}
          </button>
          <button
            onClick={reset}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              padding: '12px 20px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(240,240,240,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'
              e.currentTarget.style.color = 'rgba(240,240,240,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'rgba(240,240,240,0.3)'
            }}
          >
            reset
          </button>
        </div>

      </div>
    </div>
  )
}
