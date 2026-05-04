'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './Sidebar.module.css'

function isStandalone() {
  if (typeof window === 'undefined') return true
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isMobile() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

type SidebarItem =
  | { num: string; label: string; desc: string; href: string; external?: boolean }
  | { num: string; label: string; desc: string; href?: undefined }

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    num: '01',
    label: 'tronnies',
    desc: 'the 2025 rewind — awards voted by players, remembered by everyone.',
    href: '/tronnies',
  },
  {
    num: '02',
    label: 'account',
    desc: 'manage your rcl profile, stats, and account settings.',
    href: 'https://retrocyclesleague.com/',
    external: true,
  },
  {
    num: '03',
    label: 'settings',
    desc: 'manage your account, preferences, and display options.',
    href: '/settings',
  },
  {
    num: '04',
    label: 'about',
    desc: 'what is rcl and where is it going.',
    href: '/about',
  },
  {
    num: '05',
    label: 'support',
    desc: 'for help or questions, reach out on discord. contact vllis or syn_acc.',
    href: '/support',
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

function ItemContent({ item }: { item: SidebarItem }) {
  return (
    <>
      <span className={styles.num}>{item.num}</span>
      <span className={styles.label}>{item.label}</span>
      <span className={styles.desc}>{item.desc}</span>
    </>
  )
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    setShowInstall(isMobile() && !isStandalone())
  }, [])

  function handleInstall() {
    onClose()
    setTimeout(() => window.dispatchEvent(new Event('rcl:pwa:install')), 300)
  }

  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <nav className={styles.inner}>
          {SIDEBAR_ITEMS.map((item, i) => {
            const cls = `${styles.item} ${open ? styles.itemVisible : ''}`
            const delay = { transitionDelay: open ? `${80 + i * 55}ms` : '0ms' }

            if (!item.href) {
              return (
                <div key={item.num} className={cls} style={delay}>
                  <ItemContent item={item} />
                </div>
              )
            }

            if (item.external) {
              return (
                <a key={item.num} href={item.href} className={cls} style={delay} onClick={onClose} target="_self">
                  <ItemContent item={item} />
                </a>
              )
            }

            return (
              <Link key={item.num} href={item.href} className={cls} style={delay} onClick={onClose}>
                <ItemContent item={item} />
              </Link>
            )
          })}

          {/* Install app — mobile only, hidden if already installed as PWA */}
          {showInstall && (() => {
            const i = SIDEBAR_ITEMS.length
            const cls = `${styles.item} ${open ? styles.itemVisible : ''}`
            const delay = { transitionDelay: open ? `${80 + i * 55}ms` : '0ms' }
            return (
              <button key="install" className={cls} style={delay} onClick={handleInstall}>
                <span className={styles.num}>0{i + 1}</span>
                <span className={styles.label}>install</span>
                <span className={styles.desc}>add rcl to your home screen as an app.</span>
              </button>
            )
          })()}
        </nav>

        <div className={styles.footer}>
          <span className={styles.footerText}>retrocyclesleague.com</span>
        </div>
      </div>
    </>
  )
}
