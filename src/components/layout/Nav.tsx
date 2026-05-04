'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'
import Sidebar from './Sidebar'

const NAV_LINKS = [
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'Resources', href: '/tutorials' },
  { label: 'Mazing', href: '/mazing' },
]

const FEATURED_LINK = { label: 'Tronnies', href: '/tronnies' }

export default function Nav() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const handler = () => setSidebarOpen(true)
    window.addEventListener('rcl:openmenu', handler)
    return () => window.removeEventListener('rcl:openmenu', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY
      if (current <= 0) setHidden(false)
      else if (current > 60) setHidden(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`${styles.nav} ${hidden ? styles.navHidden : ''}`}>
        {/* Logo */}
        <Link href="/leaderboard" className={styles.brand}>
          RCL
        </Link>

        {/* Links */}
        <div className={styles.links}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${pathname.startsWith(link.href) ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={FEATURED_LINK.href}
            className={`${styles.link} ${styles.featured} ${pathname.startsWith(FEATURED_LINK.href) ? styles.featuredActive : ''}`}
          >
            <span className={styles.featuredDot} />
            {FEATURED_LINK.label}
          </Link>
        </div>

        {/* Menu button — pushed right */}
        <button
          className={`${styles.menuBtn} ${sidebarOpen ? styles.menuBtnOpen : ''}`}
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={styles.menuBtnLabel}>rcl</span>
          <span className={styles.menuBtnIcon}>{sidebarOpen ? '−' : '+'}</span>
        </button>
      </nav>

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  )
}
