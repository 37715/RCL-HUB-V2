'use client'

import React, { useState, useEffect } from 'react'
import css from './TutorialsSidebar.module.css'

interface Topic { title: string; slug: string }
interface Section { title: string; slug: string; comingSoon: boolean; topics: Topic[] }

export default function TutorialsSidebar({ sections }: { sections: Section[] }) {
  const [openSlug, setOpenSlug] = useState<string>(sections[0]?.slug ?? '')
  const [active, setActive] = useState<string>('')
  const [hovered, setHovered] = useState<string>('')

  // Scroll-spy: track which topic is in view
  useEffect(() => {
    const slugs = sections.flatMap(s => s.topics.map(t => t.slug))
    const visible = new Set<string>()
    const observers: IntersectionObserver[] = []

    slugs.forEach(slug => {
      const el = document.getElementById(slug)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) visible.add(slug)
          else visible.delete(slug)
          const first = slugs.find(s => visible.has(s))
          if (first) {
            setActive(first)
            // Auto-open the section containing the active topic
            const parent = sections.find(s => s.topics.some(t => t.slug === first))
            if (parent) setOpenSlug(parent.slug)
          }
        },
        { rootMargin: '-10% 0px -60% 0px', threshold: 0 }
      )
      observer.observe(el)
      observers.push(observer)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [sections])

  return (
    <nav
      className={css.sidebar}
      style={{
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
        overflowY: 'auto',
        borderRight: '1px solid var(--line)',
        padding: '40px 0',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-barlow), sans-serif',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color: 'var(--accent)',
        padding: '0 24px',
        marginBottom: '8px',
        display: 'block',
      }}>Resources</span>

      {sections.map(section => {
        const isOpen = openSlug === section.slug

        return (
          <div key={section.slug}>
            {/* Section header — clickable accordion toggle */}
            <button
              onClick={() => setOpenSlug(isOpen ? '' : section.slug)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 24px',
                background: isOpen ? 'rgba(255,255,255,0.03)' : 'transparent',
                border: 'none',
                borderLeft: `2px solid ${isOpen ? 'var(--accent)' : 'transparent'}`,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.15s',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-barlow), sans-serif',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '1px',
                color: isOpen ? 'var(--text)' : 'rgba(240,240,240,0.45)',
                transition: 'color 0.15s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {section.title}
                {section.comingSoon && (
                  <span style={{
                    fontSize: '8px',
                    letterSpacing: '1.5px',
                    color: 'rgba(240,240,240,0.25)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '2px 6px',
                    fontWeight: 700,
                  }}>SOON</span>
                )}
              </span>
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
              >
                <polyline points="2,3.5 5,6.5 8,3.5" stroke={isOpen ? 'var(--accent)' : 'rgba(240,240,240,0.3)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Topics list */}
            {isOpen && (
              <div style={{ paddingBottom: '8px' }}>
                {section.comingSoon ? (
                  <span style={{
                    display: 'block',
                    padding: '10px 24px 10px 28px',
                    fontFamily: 'var(--font-barlow), sans-serif',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: 'rgba(240,240,240,0.2)',
                    letterSpacing: '0.5px',
                  }}>Content coming soon</span>
                ) : (
                  section.topics.map(topic => {
                    const isActive = active === topic.slug
                    const isHov = hovered === topic.slug
                    return (
                      <a
                        key={topic.slug}
                        href={`#${topic.slug}`}
                        onMouseEnter={() => setHovered(topic.slug)}
                        onMouseLeave={() => setHovered('')}
                        style={{
                          display: 'block',
                          padding: '8px 24px 8px 28px',
                          fontFamily: 'var(--font-barlow), sans-serif',
                          fontSize: '13px',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'var(--accent)' : isHov ? 'var(--text)' : 'var(--muted)',
                          textDecoration: 'none',
                          borderLeft: `2px solid ${isActive ? 'var(--accent)' : isHov ? 'rgba(240,240,240,0.2)' : 'transparent'}`,
                          background: isHov && !isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                          transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                          marginLeft: '0',
                        }}
                      >
                        {topic.title}
                      </a>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )
      })}
    </nav>
  )
}
