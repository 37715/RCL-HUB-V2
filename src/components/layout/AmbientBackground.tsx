'use client'

export default function AmbientBackground() {
  return (
    <div data-ambient=""
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    >
      {/* Ambient orb 1 — yellow-green, top-right */}
      <div
        style={{
          position: 'fixed',
          top: '-100px',
          right: '-80px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,255,71,0.07) 0%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientDrift1 20s ease-in-out infinite alternate',
        }}
      />

      {/* Ambient orb 2 — cyan, bottom-left */}
      <div
        style={{
          position: 'fixed',
          bottom: '-80px',
          left: '-60px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientDrift2 25s ease-in-out infinite alternate',
        }}
      />

      {/* Ambient orb 3 — pink, center */}
      <div
        style={{
          position: 'fixed',
          top: '40%',
          left: '40%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,61,110,0.04) 0%, transparent 70%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'ambientDrift3 18s ease-in-out infinite alternate',
        }}
      />

      {/* Geometric ring — large, cyan */}
      <div
        style={{
          position: 'fixed',
          bottom: '-80px',
          right: '-80px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '1px solid rgba(0,212,255,0.1)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'geoRotate 30s linear infinite',
        }}
      />

      {/* Geometric ring — small, accent */}
      <div
        style={{
          position: 'fixed',
          bottom: '-20px',
          right: '-20px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: '1px solid rgba(232,255,71,0.08)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'geoRotate 20s linear infinite reverse',
        }}
      />

      {/* Scanning line 1 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(232,255,71,0.15) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'lineSlide 8s ease-in-out infinite',
        }}
      />

      {/* Scanning line 2 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.1) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0,
          animation: 'lineSlide 12s ease-in-out infinite',
          animationDelay: '4s',
        }}
      />
    </div>
  )
}
