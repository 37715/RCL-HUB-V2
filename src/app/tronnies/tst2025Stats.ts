/**
 * TST 2025 — frozen snapshot for the Tronnies rewind stats slide.
 *
 * Captured: 2026-05-04 from /api/records?season=3.
 * Window: 2025-01-01 → 2025-12-31 inclusive.
 */

export interface Tst2025Stats {
  totalMatches: number
  totalSeconds: number
  avgMatchSeconds: number
  capturedAt: string
  windowStart: string
  windowEnd: string
}

export const TST_2025_STATS: Tst2025Stats = {
  totalMatches: 1221,
  totalSeconds: 1422204,
  avgMatchSeconds: 1165,
  capturedAt: '2026-05-04',
  windowStart: '2025-01-01',
  windowEnd: '2025-12-31',
}
