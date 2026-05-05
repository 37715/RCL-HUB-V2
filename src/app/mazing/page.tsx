'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MAZE_GROUPS, COMMUNITY_MAZES } from '@/data/mazes'
import type { MazeDifficulty, CommunityMaze } from '@/types'
import styles from './Mazing.module.css'

type TopTab = 'finite' | 'infinite' | 'community'

interface SelectedMaze {
  difficulty: MazeDifficulty
  number: number
}

function formatTime(s: number): string {
  if (!isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const PLAYBACK_RATES = [0.25, 0.5, 1, 1.5, 2] as const

function formatRate(r: number): string {
  return Number.isInteger(r) ? `${r}x` : `${r}x`
}

function SpeedControl({
  videoRef,
  color,
}: {
  videoRef: React.RefObject<HTMLVideoElement>
  color: string
}) {
  const [rate, setRate] = useState<number>(1)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const v = videoRef.current
    if (v) v.playbackRate = rate
  }, [rate, videoRef])

  return (
    <div className={styles.speedWrap}>
      <button
        className={styles.speedBtn}
        onClick={() => setOpen((o) => !o)}
        title="Playback speed"
        style={rate !== 1 ? { color } : undefined}
      >
        {formatRate(rate)}
      </button>
      {open && (
        <div className={styles.speedMenu} onMouseLeave={() => setOpen(false)}>
          {PLAYBACK_RATES.map((r) => (
            <button
              key={r}
              className={`${styles.speedOption} ${r === rate ? styles.speedOptionActive : ''}`}
              style={r === rate ? { color, borderColor: `${color}55` } : undefined}
              onClick={() => {
                setRate(r)
                setOpen(false)
              }}
            >
              {formatRate(r)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function MazeModal({ maze, onClose }: { maze: SelectedMaze; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => { if (!seeking) setCurrentTime(v.currentTime) }
    const onMeta = () => setDuration(v.duration)
    const onEnd  = () => setPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('ended', onEnd)
    }
  }, [seeking])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') { e.preventDefault(); toggle() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, toggle])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const src = `/assets/mazes/${maze.difficulty.path}/${maze.number}.webm`

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalPill} style={{ color: maze.difficulty.color, borderColor: `${maze.difficulty.color}50` }}>
              {maze.difficulty.name}
            </span>
            <span className={styles.modalLabel}>
              Maze {String(maze.number).padStart(2, '0')}
            </span>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalVideo} onClick={toggle}>
          <video ref={videoRef} src={src} className={styles.modalVideoEl} playsInline preload="auto" />
          {!playing && (
            <div className={styles.playOverlay}>
              <div className={styles.playBtn}>▶</div>
            </div>
          )}
        </div>
        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={toggle}>{playing ? '⏸' : '▶'}</button>
          <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
          <input
            type="range"
            className={styles.seekBar}
            min={0} max={duration || 1} step={0.01} value={currentTime}
            style={{ '--seek-pct': `${progress}%`, '--cat-color': maze.difficulty.color } as React.CSSProperties}
            onMouseDown={() => setSeeking(true)}
            onChange={(e) => {
              const t = Number(e.target.value)
              setCurrentTime(t)
              if (videoRef.current) videoRef.current.currentTime = t
            }}
            onMouseUp={() => setSeeking(false)}
          />
          <span className={styles.timeLabel}>{formatTime(duration)}</span>
          <SpeedControl videoRef={videoRef} color={maze.difficulty.color} />
          <button className={styles.ctrlBtn} title="Fullscreen"
            onClick={() => { if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen() }}>
            ⛶
          </button>
        </div>
      </div>
    </div>
  )
}

function CommunityMazeModal({ maze, onClose }: { maze: CommunityMaze; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) }
    else { v.pause(); setPlaying(false) }
  }, [])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onTime = () => { if (!seeking) setCurrentTime(v.currentTime) }
    const onMeta = () => setDuration(v.duration)
    const onEnd  = () => setPlaying(false)
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('loadedmetadata', onMeta)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('loadedmetadata', onMeta)
      v.removeEventListener('ended', onEnd)
    }
  }, [seeking])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') { e.preventDefault(); toggle() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, toggle])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <span className={styles.modalPill} style={{ color: maze.difficultyColor, borderColor: `${maze.difficultyColor}50` }}>
              {maze.difficulty}
            </span>
            <span className={styles.modalPill} style={{ color: 'rgba(240,240,240,0.45)', borderColor: 'rgba(255,255,255,0.1)' }}>
              {maze.type === 'finite' ? 'Finite' : 'Infinite'}
            </span>
            <span className={styles.modalLabel}>{maze.title}</span>
            <span style={{
              fontFamily: 'var(--font-barlow), sans-serif',
              fontSize: '12px',
              color: 'var(--muted)',
              letterSpacing: '0.5px',
            }}>by {maze.author}</span>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalVideo} onClick={toggle}>
          <video ref={videoRef} src={maze.src} className={styles.modalVideoEl} playsInline preload="auto" />
          {!playing && (
            <div className={styles.playOverlay}>
              <div className={styles.playBtn}>▶</div>
            </div>
          )}
        </div>
        <div className={styles.controls}>
          <button className={styles.ctrlBtn} onClick={toggle}>{playing ? '⏸' : '▶'}</button>
          <span className={styles.timeLabel}>{formatTime(currentTime)}</span>
          <input
            type="range"
            className={styles.seekBar}
            min={0} max={duration || 1} step={0.01} value={currentTime}
            style={{ '--seek-pct': `${progress}%`, '--cat-color': maze.difficultyColor } as React.CSSProperties}
            onMouseDown={() => setSeeking(true)}
            onChange={(e) => {
              const t = Number(e.target.value)
              setCurrentTime(t)
              if (videoRef.current) videoRef.current.currentTime = t
            }}
            onMouseUp={() => setSeeking(false)}
          />
          <span className={styles.timeLabel}>{formatTime(duration)}</span>
          <SpeedControl videoRef={videoRef} color={maze.difficultyColor} />
          <button className={styles.ctrlBtn} title="Fullscreen"
            onClick={() => { if (videoRef.current?.requestFullscreen) videoRef.current.requestFullscreen() }}>
            ⛶
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MazingPage() {
  const [topTab, setTopTab] = useState<TopTab>('finite')
  const [activeDiff, setActiveDiff] = useState(MAZE_GROUPS[0].difficulties[0].slug)
  const [selectedMaze, setSelectedMaze] = useState<SelectedMaze | null>(null)
  const [selectedCommunityMaze, setSelectedCommunityMaze] = useState<CommunityMaze | null>(null)

  const group = MAZE_GROUPS.find((g) => g.slug === topTab)
  const difficulty = group?.difficulties.find((d) => d.slug === activeDiff) ?? group?.difficulties[0]

  function switchTop(tab: TopTab) {
    setTopTab(tab)
    const g = MAZE_GROUPS.find((g) => g.slug === tab)
    if (g) setActiveDiff(g.difficulties[0].slug)
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.eyebrow}>
          <div className={styles.eyebrowLine} />
          <span className={styles.eyebrowText}>Maze Archive</span>
        </div>
        <h1 className={styles.heroTitle}>Mazing</h1>
        <p className={styles.heroSubtitle}>
          Browse the full RCL maze archive. Each maze is ranked by community
          difficulty and technical complexity. Master every category to prove
          your dominance in the Retrocycles League.
        </p>
      </section>

      {/* Unified nav */}
      <div className={styles.nav}>
        {/* Top tab row */}
        <div className={styles.navTop}>
          <div className={styles.typeGroup}>
            {(['finite', 'infinite', 'community'] as TopTab[]).map((t) => {
              const g = MAZE_GROUPS.find((g) => g.slug === t)
              const color = g?.color ?? '#888'
              const isActive = topTab === t
              return (
                <button
                  key={t}
                  className={`${styles.typeBtn} ${isActive ? styles.typeBtnActive : ''}`}
                  style={isActive ? { '--type-color': color } as React.CSSProperties : {}}
                  onClick={() => switchTop(t)}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              )
            })}
          </div>

          {/* Difficulty chips — right side, only for maze groups */}
          {group && (
            <div className={styles.diffChips}>
              {group.difficulties.map((d) => (
                <button
                  key={d.slug}
                  className={`${styles.diffChip} ${activeDiff === d.slug ? styles.diffChipActive : ''}`}
                  style={activeDiff === d.slug ? { '--diff-color': d.color } as React.CSSProperties : {}}
                  onClick={() => setActiveDiff(d.slug)}
                >
                  {d.name}
                  <span className={styles.diffCount}>{d.count}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Accent line */}
      </div>

      {/* Content */}
      {topTab === 'community' ? (
        <div className={styles.mazeSection}>
          <div className={styles.mazeGrid}>
            {COMMUNITY_MAZES.map((maze, idx) => (
              <div
                key={maze.id}
                className={styles.mazeCard}
                style={{ animationDelay: `${idx * 60}ms` }}
                onClick={() => setSelectedCommunityMaze(maze)}
                onMouseEnter={(e) => {
                  const card = e.currentTarget as HTMLDivElement
                  card.style.boxShadow = `0 8px 40px ${maze.difficultyColor}22`
                  card.style.borderColor = `${maze.difficultyColor}50`
                  const vid = card.querySelector('video')
                  if (vid) vid.play()
                }}
                onMouseLeave={(e) => {
                  const card = e.currentTarget as HTMLDivElement
                  card.style.boxShadow = ''
                  card.style.borderColor = ''
                  const vid = card.querySelector('video')
                  if (vid) { vid.pause(); vid.currentTime = 0 }
                }}
              >
                <div className={styles.videoWrapper}>
                  <video
                    className={styles.mazeVideo}
                    src={maze.src}
                    muted loop playsInline preload="auto"
                  />
                  <div className={styles.cardPlayHint}>▶ Play</div>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    background: 'rgba(232,255,71,0.12)',
                    border: '1px solid rgba(232,255,71,0.25)',
                    color: '#e8ff47',
                    fontFamily: 'var(--font-barlow), sans-serif',
                    fontSize: '13px',
                    fontWeight: 400,
                    letterSpacing: '0.5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                    zIndex: 2,
                  }}>{maze.author.toLowerCase()}</div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.cardMeta}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{
                        fontFamily: 'var(--font-bebas), sans-serif',
                        fontSize: '16px',
                        letterSpacing: '2px',
                        color: 'var(--text)',
                        lineHeight: 1,
                      }}>{maze.title}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className={styles.diffLabel} style={{ color: maze.difficultyColor }}>
                        {maze.difficulty}
                      </span>
                      <span className={styles.mazeNum}>
                        {maze.type === 'finite' ? 'Finite' : 'Infinite'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.difficultyTrack}>
                    <div className={styles.difficultyFill} style={{ width: '100%', background: maze.difficultyColor }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : group && difficulty ? (
        <>
          {/* Info bar */}
          <div className={styles.infoBar}>
            <span className={styles.infoDesc}>{group.description}</span>
            <span className={styles.infoCount} style={{ color: difficulty.color }}>
              {difficulty.count} Mazes
            </span>
          </div>

          {/* Grid */}
          <div className={styles.mazeSection}>
            <div className={styles.mazeGrid}>
              {Array.from({ length: difficulty.count }, (_, i) => (difficulty.startAt ?? 1) + i).map((n, idx) => (
                <div
                  key={`${group.slug}-${difficulty.slug}-${n}`}
                  className={styles.mazeCard}
                  style={{ animationDelay: `${idx * 60}ms` }}
                  onClick={() => setSelectedMaze({ difficulty, number: n })}
                  onMouseEnter={(e) => {
                    const card = e.currentTarget as HTMLDivElement
                    card.style.boxShadow = `0 8px 40px ${difficulty.color}22`
                    card.style.borderColor = `${difficulty.color}50`
                    const vid = card.querySelector('video')
                    if (vid) vid.play()
                  }}
                  onMouseLeave={(e) => {
                    const card = e.currentTarget as HTMLDivElement
                    card.style.boxShadow = ''
                    card.style.borderColor = ''
                    const vid = card.querySelector('video')
                    if (vid) { vid.pause(); vid.currentTime = 0 }
                  }}
                >
                  <div className={styles.videoWrapper}>
                    <video
                      className={styles.mazeVideo}
                      src={`/assets/mazes/${difficulty.path}/${n}.webm`}
                      muted loop playsInline preload="auto"
                    />
                    <div className={styles.cardPlayHint}>▶ Play</div>
                  </div>
                  <div className={styles.cardFooter}>
                    <div className={styles.cardMeta}>
                      <span className={styles.diffLabel} style={{ color: difficulty.color }}>
                        {difficulty.name}
                      </span>
                      <span className={styles.mazeNum}>
                        Maze {String(n).padStart(2, '0')}
                      </span>
                    </div>
                    <div className={styles.difficultyTrack}>
                      <div
                        className={styles.difficultyFill}
                        style={{ width: `${(n / difficulty.count) * 100}%`, background: difficulty.color }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {selectedMaze && (
        <MazeModal maze={selectedMaze} onClose={() => setSelectedMaze(null)} />
      )}
      {selectedCommunityMaze && (
        <CommunityMazeModal maze={selectedCommunityMaze} onClose={() => setSelectedCommunityMaze(null)} />
      )}
    </div>
  )
}
