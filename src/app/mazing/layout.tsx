import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mazing',
  description: 'Browse and watch community maze runs and RCL maze challenges.',
  openGraph: {
    title: 'RCL Mazing',
    description: 'Browse and watch community maze runs and RCL maze challenges.',
  },
}

export default function MazingLayout({ children }: { children: React.ReactNode }) {
  return children
}
