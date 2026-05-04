import type { Metadata } from 'next'
import TronniesRewind from './TronniesRewind'

export const metadata: Metadata = {
  title: 'Tronnies 2025 — RCL Rewind',
  description: 'The annual Retro Cycles League awards — voted by players, remembered by everyone.',
}

export default function TronniesPage() {
  return <TronniesRewind />
}
