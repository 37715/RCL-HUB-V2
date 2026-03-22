'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GameMode, Season, Region, TimePeriod, StatsMode, Player, SortKey, SortDir } from '@/types'
import LeaderboardControls from './LeaderboardControls'
import LeaderboardTable from './LeaderboardTable'
import AdvancedStatsPanel from './AdvancedStatsPanel'
import RecentMatchesPanel from './RecentMatchesPanel'
import RecordsPanel from './RecordsPanel'
import Ticker from './Ticker'
import styles from './LeaderboardClient.module.css'

const SEASON_YEARS: Record<Season, number> = { 1: 2023, 2: 2024, 3: 2025, 4: 2026 }

const GAME_MODE_TITLES: Record<GameMode, [string, string]> = {
  tst: ['Team Sumo', 'Tournament'],
  '1v1': ['One vs', 'One'],
  sumobar: ['Sumo', 'Bar'],
  fortress: ['Fortress', 'Mode'],
}

const LIVE_MODES: GameMode[] = ['tst']

export default function LeaderboardClient() {
  const [gameMode, setGameMode] = useState<GameMode>('tst')
  const [season, setSeason] = useState<Season>(4)
  const [region, setRegion] = useState<Region>('combined')
  const [period, setPeriod] = useState<TimePeriod>('all')
  const [statsMode, setStatsMode] = useState<StatsMode>('simple')
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedPlayerRank, setSelectedPlayerRank] = useState<number | null>(null)
  const [advPanelOpen, setAdvPanelOpen] = useState(false)
  const [matchHistoryOpen, setMatchHistoryOpen] = useState(false)
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortKey>('elo')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Incremented on every new fetch so stale KD callbacks are discarded
  const fetchGen = useRef(0)

  const isLive = LIVE_MODES.includes(gameMode)

  const fetchPlayers = useCallback(async () => {
    if (!isLive) {
      setLoading(false)
      setPlayers([])
      return
    }
    const gen = ++fetchGen.current
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        mode: gameMode,
        season: String(season),
        region,
        period,
      })
      const res = await fetch(`/api/leaderboard?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Player[] = await res.json()
      const list = Array.isArray(data) ? data : []
      if (gen !== fetchGen.current) return // superseded by a newer fetch
      setPlayers(list)
    } catch {
      if (gen !== fetchGen.current) return
      setError('Failed to load leaderboard data.')
      setPlayers([])
    } finally {
      if (gen === fetchGen.current) setLoading(false)
    }
  }, [gameMode, season, region, period, isLive])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  useEffect(() => {
    const openMatches = () => setMatchHistoryOpen(true)
    const openRecords = () => setRecordsOpen(true)
    window.addEventListener('rcl:openmatches', openMatches)
    window.addEventListener('rcl:openrecords', openRecords)
    return () => {
      window.removeEventListener('rcl:openmatches', openMatches)
      window.removeEventListener('rcl:openrecords', openRecords)
    }
  }, [])

  function handleSort(key: SortKey) {
    if (sortBy === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const displayedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1
      const av = a[sortBy] as number
      const bv = b[sortBy] as number
      if (sortBy === 'avgPosition') return dir * (bv - av)
      return dir * (av - bv)
    })
  }, [players, sortBy, sortDir])

  const [titleLine1, titleLine2] = GAME_MODE_TITLES[gameMode]

  return (
    <div className={styles.page}>
      <Ticker />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.eyebrow}>
              <div className={styles.eyebrowLine} />
              <span className={styles.eyebrowText}>
                Global Rankings — {region === 'combined' ? 'All Regions' : region.toUpperCase()}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={gameMode}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className={styles.heroTitle}>
                  <div className={styles.heroLine1}>{titleLine1}</div>
                  <div className={styles.heroLine2}>{titleLine2}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {isLive && (
            <div className={styles.heroRight}>
              <span className={styles.seasonBadge}>S{season} {SEASON_YEARS[season]}</span>
              <span className={styles.activePlayers}>
                {loading ? '…' : `${displayedPlayers.length}`} Players
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Controls */}
      <LeaderboardControls
        gameMode={gameMode}
        season={season}
        region={region}
        period={period}
        statsMode={statsMode}
        matchHistoryOpen={matchHistoryOpen}
        recordsOpen={recordsOpen}
        onGameModeChange={(m) => { setGameMode(m); setSortBy('elo'); setSortDir('desc') }}
        onSeasonChange={(s) => { setSeason(s); if (period === 'weekly') setPeriod('all') }}
        onRegionChange={setRegion}
        onPeriodChange={setPeriod}
        onStatsModeToggle={() => setStatsMode((prev) => (prev === 'simple' ? 'advanced' : 'simple'))}
        onMatchHistoryOpen={() => setMatchHistoryOpen(true)}
        onRecordsOpen={() => setRecordsOpen(true)}
      />

      {/* Table */}
      <div className={styles.tableSection}>
        {!isLive ? (
          <div className={styles.comingSoon}>
            <span className={styles.comingSoonLabel}>Coming Soon</span>
            <p className={styles.comingSoonSub}>
              {gameMode === '1v1' && 'One vs One rankings are in development.'}
              {gameMode === 'sumobar' && 'Sumobar rankings are in development.'}
              {gameMode === 'fortress' && 'Fortress rankings are in development.'}
            </p>
          </div>
        ) : loading ? (
          <div className={styles.loadingState}>Loading…</div>
        ) : error ? (
          <div className={styles.errorState}>{error}</div>
        ) : (
          <LeaderboardTable
            players={displayedPlayers}
            mode={gameMode}
            statsMode={statsMode}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            onPlayerClick={handlePlayerClick}
          />
        )}
      </div>

      {matchHistoryOpen && <div className={styles.panelBackdrop} onClick={() => setMatchHistoryOpen(false)} />}
      <RecentMatchesPanel players={players} isOpen={matchHistoryOpen} onClose={() => setMatchHistoryOpen(false)} />

      {recordsOpen && <div className={styles.panelBackdrop} onClick={() => setRecordsOpen(false)} />}
      <RecordsPanel season={season} isOpen={recordsOpen} onClose={() => setRecordsOpen(false)} />

      {advPanelOpen && <div className={styles.panelBackdrop} onClick={handleClosePanel} />}
      <AdvancedStatsPanel player={selectedPlayer} rank={selectedPlayerRank} season={season} isOpen={advPanelOpen} onClose={handleClosePanel} />

    </div>
  )

  function handlePlayerClick(player: Player) {
    const rank = displayedPlayers.findIndex((p) => p.username === player.username) + 1
    setSelectedPlayer(player)
    setSelectedPlayerRank(rank > 0 ? rank : null)
    setAdvPanelOpen(true)
  }
  function handleClosePanel() {
    setAdvPanelOpen(false)
  }
}
