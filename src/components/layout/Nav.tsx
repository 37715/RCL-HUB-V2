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

export default function Nav() {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const handler = () => setSidebarOpen(true)
    window.addEventListener('rcl:openmenu', handler)
    return () => window.removeEventListener('rcl:openmenu', handler)
  }, [])

  return (
    <>
      <nav className={styles.nav}>
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
