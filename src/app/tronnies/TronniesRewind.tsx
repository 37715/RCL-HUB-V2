'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import styles from './tronnies.module.css'
import { SURVEY_DATA, type SurveyQuestion, type RewindGroup } from './rewindData'
import { TST_2025_STATS } from './tst2025Stats'

/* ── constants ── */

const GROUP_ORDER: RewindGroup[] = ['playstyle', 'personality', 'fortress', 'sumo']

const GROUP_META: Record<RewindGroup, { label: string; hue: number }> = {
  playstyle:   { label: 'Playstyle',   hue: 275 },
  personality: { label: 'Personality', hue: 330 },
  fortress:    { label: 'Fortress',    hue: 210 },
  sumo:        { label: 'Sumo',        hue: 145 },
}

const PROFILE_FILES: Record<string, string> = {
  ampz: 'ampz.webp',
  andrei: 'andrei.webp',
  apple: 'apple.webp',
  cadillac: 'cadillac.webp',
  cookie: 'cookie.webp',
  delinquent: 'delinquent.webp',
  deso: 'deso.webp',
  ellis: 'ellis.png',
  fini: 'fini.webp',
  fofo: 'fofo.webp',
  force: 'force.png',
  gazelle: 'gazelle.webp',
  hall: 'hall.webp',
  johnny: 'johnny.webp',
  koala: 'koala.webp',
  kronkleberry: 'kronkleberry.webp',
  magi: 'magi.webp',
  melon: 'melon.webp',
  mikemacx: 'mikemacx.webp',
  morbit: 'morbit.webp',
  n: 'n.webp',
  nanu: 'nanu.webp',
  nelg: 'nelg.webp',
  'ninja potato': 'ninjapotato.webp',
  noodles: 'noodles.webp',
  olive: 'olive.webp',
  orly: 'orly.webp',
  pizza: 'pizza.webp',
  sanity: 'sanity.webp',
  tj: 'tj.png',
  ugin: 'ugin.webp',
  wind: 'wind.webp',
  wolf: 'wolf.webp',
  deli: 'delinquent.webp',
  mr: 'ellis.png',
}

/* ── types ── */

type Slide =
  | { type: 'hero' }
  | { type: 'category'; group: RewindGroup; questionCount: number; responseCount: number }
  | { type: 'question'; question: SurveyQuestion; group: RewindGroup }
  | { type: 'stats' }
  | { type: 'outro'; totalQuestions: number; totalResponses: number }

/* ── helpers ── */

function getProfileSrc(name: string): string | null {
  const key = name.toLowerCase().trim()
  const file = PROFILE_FILES[key]
  return file ? `/profiles/${file}` : null
}

function parseNames(name: string): string[] {
  return name.includes(' and ') ? name.split(' and ').map(n => n.trim()) : [name]
}

function isStylizedMixedCase(name: string): boolean {
  for (let i = 0; i < name.length; i++) {
    if (/[A-Z]/.test(name[i]) && /[a-zA-Z]/.test(name[i - 1] || '')) return true
  }
  return false
}

function StyledName({ name }: { name: string }) {
  if (!isStylizedMixedCase(name)) return <>{name}</>
  return (
    <>
      {Array.from(name).map((ch, i) =>
        /[a-z]/.test(ch) ? <span key={i} className={styles.lowerCh}>{ch}</span> : ch,
      )}
    </>
  )
}

function buildSlides(): Slide[] {
  const slides: Slide[] = [{ type: 'hero' }]
  for (const group of GROUP_ORDER) {
    const questions = SURVEY_DATA.filter(q => q.group === group)
    const responseCount = questions.reduce((sum, q) => sum + q.responses, 0)
    slides.push({ type: 'category', group, questionCount: questions.length, responseCount })
    for (const q of questions) {
      slides.push({ type: 'question', question: q, group })
    }
  }
  const totalResponses = SURVEY_DATA.reduce((sum, q) => sum + q.responses, 0)
  slides.push({ type: 'stats' })
  slides.push({ type: 'outro', totalQuestions: SURVEY_DATA.length, totalResponses })
  return slides
}

function fmtMatchDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ── animation variants ── */

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 140 : -140,
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 1, 0.5, 1] },
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -140 : 140,
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.28, ease: [0.25, 1, 0.5, 1] },
  }),
}

const podiumDelays = [0.5, 1.1, 0.15]
const podiumCardVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.88, filter: 'blur(6px)' },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      delay: podiumDelays[i] || 0,
      duration: 0.65,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
}

const categoryTitleVariants = {
  hidden: { scale: 0.7, opacity: 0, filter: 'blur(12px)' },
  visible: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

/* ── sub-components ── */

function SingleAvatar({ name, size }: { name: string; size: number }) {
  const src = getProfileSrc(name)
  const initials = name.charAt(0).toUpperCase()

  if (!src) {
    return (
      <div className={styles.avatarPlaceholder} style={{ width: size, height: size, fontSize: size * 0.38 }}>
        {initials}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={name}
      className={styles.avatar}
      style={{ width: size, height: size }}
      draggable={false}
    />
  )
}

function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const names = parseNames(name)
  if (names.length > 1) {
    return (
      <div className={styles.avatarDuo}>
        {names.map((n, i) => <SingleAvatar key={i} name={n} size={size * 0.78} />)}
      </div>
    )
  }
  return <SingleAvatar name={names[0]} size={size} />
}

function Podium({ options, showAvatars }: { options: { name: string; percent: number }[]; showAvatars: boolean }) {
  const top3 = options.slice(0, 3)
  // Display order: [2nd, 1st, 3rd] so center is the winner
  const display = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3
  const rankMap = top3.length >= 3 ? [2, 1, 3] : [1, 2, 3]

  return (
    <div className={styles.podium}>
      {display.map((opt, i) => {
        const rank = rankMap[i]
        const rankClass = rank === 1 ? styles.gold : rank === 2 ? styles.silver : styles.bronze
        return (
          <motion.div
            key={`${opt.name}-${rank}`}
            className={`${styles.podiumCard} ${rankClass}`}
            custom={i}
            variants={podiumCardVariants}
            initial="hidden"
            animate="visible"
          >
            <span className={styles.rankBadge}>#{rank}</span>
            {showAvatars && (
              <div className={styles.podiumAvatar}>
                <Avatar name={opt.name} size={rank === 1 ? 84 : 64} />
              </div>
            )}
            <p className={styles.podiumName}><StyledName name={opt.name} /></p>
            <p className={styles.podiumPercent}>{opt.percent}%</p>
            <div className={styles.voteBar}>
              <motion.div
                className={styles.voteBarFill}
                initial={{ width: 0 }}
                animate={{ width: `${opt.percent}%` }}
                transition={{ delay: (podiumDelays[i] || 0) + 0.3, duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── main component ── */

export default function TronniesRewind() {
  const [started, setStarted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [dir, setDir] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const wheelTimer = useRef(0)
  const touchStart = useRef(0)
  const slides = useMemo(buildSlides, [])
  const router = useRouter()

  const total = slides.length
  const slide = slides[current]

  const hue = useMemo(() => {
    if (slide.type === 'question') return GROUP_META[slide.group].hue
    if (slide.type === 'category') return GROUP_META[slide.group].hue
    if (slide.type === 'hero') return 50
    if (slide.type === 'stats') return 50
    return 0
  }, [slide])

  const goNext = useCallback(() => {
    setCurrent(c => { if (c < total - 1) { setDir(1); return c + 1 } return c })
  }, [total])

  const goPrev = useCallback(() => {
    setCurrent(c => { if (c > 0) { setDir(-1); return c - 1 } return c })
  }, [])

  const handleStart = useCallback(() => {
    setStarted(true)
    setCurrent(0)
    setTimeout(() => {
      const el = containerRef.current
      if (el?.requestFullscreen) el.requestFullscreen().catch(() => {})
    }, 50)
  }, [])

  const handleExit = useCallback(() => {
    setStarted(false)
    setCurrent(0)
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [])

  const handleReplay = useCallback(() => {
    setCurrent(0)
    setDir(1)
  }, [])

  // Keyboard
  useEffect(() => {
    if (!started) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') { e.preventDefault(); goNext() }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
      else if (e.key === 'Escape') handleExit()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [started, goNext, goPrev, handleExit])

  // Mouse wheel
  useEffect(() => {
    if (!started) return
    const el = containerRef.current
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const now = Date.now()
      if (now - wheelTimer.current < 400 || Math.abs(e.deltaY) < 20) return
      wheelTimer.current = now
      if (e.deltaY > 0) goNext(); else goPrev()
    }
    el?.addEventListener('wheel', handler, { passive: false })
    return () => el?.removeEventListener('wheel', handler)
  }, [started, goNext, goPrev])

  // Touch swipe
  useEffect(() => {
    if (!started) return
    const el = containerRef.current
    const onStart = (e: TouchEvent) => { touchStart.current = e.touches[0].clientX }
    const onEnd = (e: TouchEvent) => {
      const diff = touchStart.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) { if (diff > 0) goNext(); else goPrev() }
    }
    el?.addEventListener('touchstart', onStart, { passive: true })
    el?.addEventListener('touchend', onEnd, { passive: true })
    return () => { el?.removeEventListener('touchstart', onStart); el?.removeEventListener('touchend', onEnd) }
  }, [started, goNext, goPrev])

  /* ── entry page ── */
  if (!started) {
    return (
      <div className={styles.entryPage}>
        <div className={styles.entryInner}>
          <p className={styles.entryEyebrow}>
            <span className={styles.eyebrowLine} />
            retrocycles league presents
          </p>
          <h1 className={styles.entryTitle}>
            TRONNIES
            <span className={styles.entryYear}>2025</span>
          </h1>
          <p className={styles.entryTagline}>voted by players, remembered by everyone.</p>
          <div className={styles.entryStats}>
            <div className={styles.entryStat}>
              <span className={styles.entryStatNum}>37</span>
              <span className={styles.entryStatLabel}>awards</span>
            </div>
            <div className={styles.entryStatDivider} />
            <div className={styles.entryStat}>
              <span className={styles.entryStatNum}>4</span>
              <span className={styles.entryStatLabel}>categories</span>
            </div>
            <div className={styles.entryStatDivider} />
            <div className={styles.entryStat}>
              <span className={styles.entryStatNum}>~1K</span>
              <span className={styles.entryStatLabel}>votes</span>
            </div>
          </div>
          <button className={styles.entryButton} onClick={handleStart}>
            <span>START REWIND</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 4L13 9L7 14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  /* ── fullscreen rewind ── */
  const catGlow = `hsla(${hue}, 60%, 25%, 0.15)`
  const catGlow2 = `hsla(${hue}, 50%, 20%, 0.10)`

  return (
    <div
      ref={containerRef}
      className={styles.rewind}
      style={{
        '--cat-hue': hue,
        '--cat-glow': catGlow,
        '--cat-glow2': catGlow2,
      } as React.CSSProperties}
    >
      {/* Progress */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${(current / (total - 1)) * 100}%` }} />
      </div>

      {/* Background */}
      <div className={styles.bg} />

      {/* Exit */}
      <button className={styles.exitBtn} onClick={handleExit} aria-label="Exit rewind">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <line x1="4" y1="4" x2="14" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <line x1="14" y1="4" x2="4" y2="14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Slides */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={current}
          custom={dir}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className={styles.slideWrap}
        >
          {/* HERO */}
          {slide.type === 'hero' && (
            <div className={styles.heroSlide}>
              <p className={styles.kicker}>retrocycles league</p>
              <h1 className={styles.heroTitle}>
                TRONNIES<br />
                <span className={styles.heroAccent}>2025 REWIND</span>
              </h1>
              <p className={styles.heroSub}>voted by players, remembered by everyone.</p>
              <button className={styles.heroBtn} onClick={goNext}>
                start rewind
                <span className={styles.heroArrow}>→</span>
              </button>
            </div>
          )}

          {/* CATEGORY INTRO */}
          {slide.type === 'category' && (
            <div className={styles.categorySlide}>
              <motion.div variants={categoryTitleVariants} initial="hidden" animate="visible">
                <p className={styles.kicker}>up next</p>
                <h1 className={styles.categoryTitle}>{GROUP_META[slide.group].label}</h1>
                <p className={styles.categorySub}>
                  {slide.questionCount} awards &middot; {slide.responseCount} votes
                </p>
              </motion.div>
            </div>
          )}

          {/* QUESTION */}
          {slide.type === 'question' && (
            <div className={styles.questionSlide}>
              <p className={styles.kicker}>{GROUP_META[slide.group].label}</p>
              <h2 className={styles.questionTitle}>{slide.question.title.toLowerCase()}</h2>
              <p className={styles.responseInfo}>
                {slide.question.responses} responses &middot; margin{' '}
                {(slide.question.options[0].percent - (slide.question.options[1]?.percent || 0)).toFixed(1)}%
              </p>
              <Podium options={slide.question.options} showAvatars={slide.question.id !== 11} />
              <div className={styles.winnerStrip}>
                <span>
                  winner: <strong>{
                    isStylizedMixedCase(slide.question.options[0].name)
                      ? <StyledName name={slide.question.options[0].name} />
                      : slide.question.options[0].name.toLowerCase()
                  }</strong>
                </span>
                <span className={styles.slideCount}>{current + 1} / {total}</span>
              </div>
            </div>
          )}

          {/* STATS — TST 2025 by the numbers */}
          {slide.type === 'stats' && (
            <div className={styles.statsSlide}>
              <p className={styles.kicker}>team sumo tournament &middot; the year in numbers</p>
              <h1 className={styles.statsTitle}>
                <span className={styles.statsBrand}>TST</span>
                <span className={styles.statsYear}>2025</span>
              </h1>
              <p className={styles.statsWindow}>jan 1 — dec 31, 2025</p>

              <div className={styles.statsMacro}>
                <div className={styles.macroCard}>
                  <span className={styles.macroNum}>{TST_2025_STATS.totalMatches.toLocaleString()}</span>
                  <span className={styles.macroLabel}>tst matches</span>
                </div>
                <div className={styles.macroDivider} />
                <div className={styles.macroCard}>
                  <span className={styles.macroNum}>{Math.round(TST_2025_STATS.totalSeconds / 60).toLocaleString()}</span>
                  <span className={styles.macroLabel}>minutes played</span>
                </div>
                <div className={styles.macroDivider} />
                <div className={styles.macroCard}>
                  <span className={styles.macroNum}>{fmtMatchDuration(TST_2025_STATS.avgMatchSeconds)}</span>
                  <span className={styles.macroLabel}>avg match</span>
                </div>
              </div>

              <div className={styles.winnerStrip}>
                <span>tst 2025 in retrospect</span>
                <span className={styles.slideCount}>{current + 1} / {total}</span>
              </div>
            </div>
          )}

          {/* OUTRO */}
          {slide.type === 'outro' && (
            <div className={styles.outroSlide}>
              <p className={styles.kicker}>tronnies 2025</p>
              <h1 className={styles.outroTitle}>that was the rewind.</h1>
              <p className={styles.outroSub}>
                {slide.totalQuestions} awards &middot; {slide.totalResponses} votes &middot; thanks to everyone who voted.
              </p>
              <div className={styles.outroButtons}>
                <button className={styles.replayBtn} onClick={handleReplay}>replay</button>
                <button className={styles.backBtn} onClick={() => { handleExit(); router.push('/leaderboard') }}>
                  back to hub
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      {current > 0 && (
        <button className={`${styles.arrowBtn} ${styles.arrowLeft}`} onClick={goPrev} aria-label="Previous">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M14 17L8 11L14 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
      {current < total - 1 && (
        <button className={`${styles.arrowBtn} ${styles.arrowRight}`} onClick={goNext} aria-label="Next">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M8 17L14 11L8 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </div>
  )
}
