'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './MobileBottomNav.module.css'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const isBoard = pathname.startsWith('/leaderboard')
  const isMazing = pathname.startsWith('/mazing')
  const isResources = pathname.startsWith('/tutorials')

  function openMatches() {
    window.dispatchEvent(new Event('rcl:openmatches'))
  }

  return (
    <nav className={styles.nav}>
      <Link href="/leaderboard" className={`${styles.item} ${isBoard ? styles.active : ''}`}>
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <rect x="2" y="10" width="4" height="8" fill="currentColor" opacity="0.7" />
          <rect x="8" y="6" width="4" height="12" fill="currentColor" />
          <rect x="14" y="2" width="4" height="16" fill="currentColor" opacity="0.7" />
        </svg>
        <span>Board</span>
      </Link>

      <button className={styles.item} onClick={openMatches}>
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="10" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="10" x2="13" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>Matches</span>
      </button>

      <Link href="/mazing" className={`${styles.item} ${isMazing ? styles.active : ''}`}>
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 7h2v2H7zM11 7h2v4h-2zM7 11h2v2H7zM11 13h2v2h-2z" fill="currentColor" opacity="0.7" />
        </svg>
        <span>Mazing</span>
      </Link>

      <Link href="/tutorials" className={`${styles.item} ${isResources ? styles.active : ''}`}>
        <svg className={styles.icon} viewBox="0 0 20 20" fill="none">
          <rect x="4" y="2" width="12" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
          <line x1="7" y1="7" x2="13" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="10" x2="13" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="7" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <span>Resources</span>
      </Link>
    </nav>
  )
}
