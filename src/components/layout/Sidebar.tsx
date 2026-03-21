'use client'

import Link from 'next/link'
import styles from './Sidebar.module.css'

type SidebarItem =
  | { num: string; label: string; desc: string; href: string; external?: boolean }
  | { num: string; label: string; desc: string; href?: undefined }

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    num: '01',
    label: 'home',
    desc: 'the home of competitive retrocycles.',
    href: 'https://retrocyclesleague.com/',
    external: true,
  },
  {
    num: '02',
    label: 'settings',
    desc: 'manage your account, preferences, and display options.',
    href: '/settings',
  },
  {
    num: '03',
    label: 'about',
    desc: 'what is rcl and where is it going.',
    href: '/about',
  },
  {
    num: '04',
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
  return (
    <>
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
        onClick={onClose}
      />
      <div className={`${styles.panel} ${open ? styles.panelOpen : ''}`}>
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
        </nav>

        <div className={styles.footer}>
          <span className={styles.footerText}>retrocyclesleague.com</span>
        </div>
      </div>
    </>
  )
}
