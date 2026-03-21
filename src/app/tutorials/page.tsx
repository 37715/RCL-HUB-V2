import React from 'react'
import Image from 'next/image'
import CameraCard from './CameraCard'
import WallCard from './WallCard'
import TutorialsSidebar from './TutorialsSidebar'
import CollapsibleSection from './CollapsibleSection'

/* ─── Sidebar nav ──────────────────────────────────────────────────────────── */
const SECTIONS = [
  {
    title: 'Game Setup',
    slug: 'game-setup',
    comingSoon: false,
    topics: [
      { title: 'Account Creation', slug: 'account-creation' },
      { title: 'Custom Cameras', slug: 'custom-cameras' },
      { title: 'Custom Walls', slug: 'custom-walls' },
      { title: 'Keybinds', slug: 'keybinds' },
    ],
  },
  {
    title: 'Tutorials — Basic',
    slug: 'tutorials-basic',
    comingSoon: true,
    topics: [],
  },
  {
    title: 'Tutorials — Advanced',
    slug: 'tutorials-advanced',
    comingSoon: true,
    topics: [],
  },
]

const CAMERAS = [
  {
    name: 'Koala',
    image: '/assets/campreviews/koala.png',
    config: `ZONE_HEIGHT 2
ZONE_SEGMENTS 22
ZONE_ALPHA 0.2
CAMERA_CUSTOM_RISE 19.5
CAMERA_CUSTOM_BACK 20
CAMERA_CUSTOM_PITCH -0.75
CAMERA_GLANCE_BACK 20
CAMERA_GLANCE_RISE 19.5
CAMERA_GLANCE_PITCH -0.75
START_FOV_1 85
MAX_IN_RATE 512
MAX_OUT_RATE 512`,
  },
  {
    name: 'Ellis',
    image: '/assets/campreviews/ellis.png',
    config: `zone_seg_length 0.2
zone_height 0.5
ZONE_SEGMENTS 22
zone_alpha 0.2
camera_custom_rise 34
camera_custom_back 44
camera_custom_pitch -0.7
camera_glance_rise 53
camera_glance_back 58
camera_glance_pitch -0.75
start_fov_1 50
MAX_IN_RATE 512
MAX_OUT_RATE 512
axes_indicator 1`,
  },
  {
    name: 'Olive',
    image: '/assets/campreviews/olive.jpg',
    config: `camera_custom_back 20
camera_custom_rise 22
camera_custom_pitch -.8
camera_custom_rise_fromspeed 0
camera_custom_back_fromspeed 0
camera_custom_turn_speed 5
camera_glance_back 20
camera_glance_rise 22
camera_glance_pitch -.8
camera_glance_rise_fromspeed 0
camera_glance_back_fromspeed 0
zone_height .5
zone_alpha .17`,
  },
]

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 64px)',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    alignItems: 'start',
  },

  /* Content */
  content: {
    padding: '64px 80px 120px',
    minWidth: 0,
  },
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  eyebrowLine: { width: '40px', height: '1px', background: 'var(--accent)' },
  eyebrowText: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '5px',
    color: 'var(--accent)',
    textTransform: 'uppercase' as const,
  },
  pageTitle: {
    fontFamily: 'var(--font-bebas), sans-serif',
    fontSize: 'clamp(56px, 7vw, 100px)',
    lineHeight: '0.9',
    letterSpacing: '2px',
    background: 'linear-gradient(180deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '64px',
  } as React.CSSProperties,

  /* Section */
  section: { scrollMarginTop: '96px' },
  sectionDivider: { display: 'none' },

  /* Topic */
  topic: { marginBottom: '56px', scrollMarginTop: '96px' },
  topicLabel: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '9px',
    fontWeight: 700,
    letterSpacing: '4px',
    textTransform: 'uppercase' as const,
    color: 'var(--accent)',
    marginBottom: '8px',
    display: 'block',
  },
  topicTitle: {
    fontFamily: 'var(--font-bebas), sans-serif',
    fontSize: '22px',
    letterSpacing: '2px',
    color: 'var(--text)',
    marginBottom: '16px',
  },
  body: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '1.8',
    color: 'rgba(240,240,240,0.65)',
    maxWidth: '640px',
    marginBottom: '16px',
  },
  link: {
    color: 'var(--accent)',
    textDecoration: 'none',
    borderBottom: '1px solid rgba(232,255,71,0.3)',
    paddingBottom: '1px',
  },

  /* Callout box */
  callout: {
    background: 'rgba(232,255,71,0.04)',
    border: '1px solid rgba(232,255,71,0.15)',
    borderLeft: '3px solid var(--accent)',
    padding: '16px 20px',
    marginBottom: '40px',
    maxWidth: '640px',
  },
  calloutText: {
    fontFamily: 'var(--font-barlow), sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '1.7',
    color: 'rgba(240,240,240,0.6)',
  },
  calloutStrong: {
    color: 'var(--accent)',
    fontWeight: 700,
  },

  cameraGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
}

export default function ResourcesPage() {
  return (
    <div style={styles.page}>

      <TutorialsSidebar sections={SECTIONS} />

      {/* ── Content ── */}
      <main style={styles.content}>
        <div style={styles.eyebrow}>
          <div style={styles.eyebrowLine} />
          <span style={styles.eyebrowText}>Knowledge Base</span>
        </div>
        <h1 style={styles.pageTitle}>Resources</h1>

        {/* ══ Game Setup ══ */}
        <section id="game-setup" style={{ scrollMarginTop: '96px' }}>
        <CollapsibleSection title="Game Setup">

          {/* Account Creation */}
          <div id="account-creation" style={styles.topic}>
            <span style={styles.topicLabel}>01 — Setup</span>
            <h2 style={styles.topicTitle}>Account Creation</h2>
            <p style={styles.body}>
              To play ranked matches you need an account to login to in-game.{' '}
              <a
                href="https://retrocyclesleague.com/"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.link}
              >
                Create your account at retrocyclesleague.com
              </a>
              .
            </p>
          </div>

          {/* Custom Cameras */}
          <div id="custom-cameras" style={styles.topic}>
            <span style={styles.topicLabel}>02 — Setup</span>
            <h2 style={styles.topicTitle}>Custom Cameras</h2>

            <p style={styles.body}>
              Having a good camera is very important for Retrocycles. A greater FOV and
              look-ahead gives more visibility of the battlefield and incoming walls, which
              tends to benefit Fortress players most. A closer, tighter camera can feel more
              responsive and controlled for Sumo — but camera preference is ultimately personal,
              and experimentation is encouraged.
            </p>

            <div style={styles.callout}>
              <p style={styles.calloutText}>
                <span style={styles.calloutStrong}>How to apply: </span>
                Go to the <span style={styles.calloutStrong}>About</span> section in the in-game
                menu and note the location of your <span style={styles.calloutStrong}>user.cfg</span> file.
                In the same directory, create a new file called{' '}
                <span style={styles.calloutStrong}>autoexec.cfg</span> and paste the camera
                settings of your choice inside it. The settings will load automatically on startup.
              </p>
            </div>

            <div style={styles.cameraGrid}>
              {CAMERAS.map((cam, i) => (
                <CameraCard key={cam.name} name={cam.name} image={cam.image} config={cam.config} index={i} />
              ))}
            </div>

          </div>

          {/* Custom Walls */}
          <div id="custom-walls" style={styles.topic}>
            <span style={styles.topicLabel}>03 — Setup</span>
            <h2 style={styles.topicTitle}>Custom Walls</h2>

            <p style={styles.body}>
              Wall textures change the appearance of the cycle trails left on the arena floor.
              Download the file and place it in the{' '}
              <span style={{ color: 'rgba(232,255,71,0.8)', fontWeight: 600 }}>textures</span>{' '}
              folder inside your game directory. The file must stay named{' '}
              <span style={{ fontFamily: 'var(--font-mono), monospace', fontSize: '12px', color: 'rgba(232,255,71,0.8)' }}>dir_wall.png</span>{' '}
              to be recognised by the game.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <WallCard
                name="Ellis"
                previewImage="/assets/campreviews/elliswall.png"
                downloadPath="/assets/walltextures/ellis/dir_wall.png"
                index={0}
              />
              <WallCard
                name="Koala"
                previewImage="/assets/campreviews/koalawall.png"
                downloadPath="/assets/walltextures/koala/dir_wall.png"
                index={1}
              />
              <WallCard
                name="Syn"
                previewImage="/assets/campreviews/synwall.png"
                noDownloadReason="Syn disables wall textures entirely via the in-game graphics settings — no texture file needed."
                index={2}
              />
            </div>
          </div>

          {/* Keybinds */}
          <div id="keybinds" style={styles.topic}>
            <span style={styles.topicLabel}>04 — Setup</span>
            <h2 style={styles.topicTitle}>Keybinds</h2>

            <p style={styles.body}>
              Setting up <strong style={{ color: 'var(--text)' }}>two keys for left and two for right</strong> is
              important for fast, efficient turns — having a redundant key on each side means
              you can roll fingers across keys to execute near-instant direction changes without
              lifting your hand. Being able to <strong style={{ color: 'var(--text)' }}>glance swiftly</strong> is
              also key for strategic play, letting you check behind you or scout flanks mid-round
              without losing control of your cycle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '8px' }}>
              {[
                { src: '/assets/binds/1.png', label: 'Homerow Regular' },
                { src: '/assets/binds/2.png', label: 'Homerow Piano' },
                { src: '/assets/binds/3.png', label: 'Ellis Piano' },
              ].map((bind, i) => (
                <div key={i} style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  border: '1px solid var(--card-border)',
                  background: 'var(--card)',
                  overflow: 'hidden',
                  alignItems: 'center',
                }}>
                  <div style={{
                    padding: '20px 24px',
                    borderRight: '1px solid var(--card-border)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-bebas), sans-serif',
                      fontSize: '18px',
                      letterSpacing: '2px',
                      color: 'var(--text)',
                      display: 'block',
                      lineHeight: 1.2,
                    }}>{bind.label}</span>
                  </div>
                  <div style={{
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Image
                      src={bind.src}
                      alt={bind.label}
                      width={1200}
                      height={400}
                      style={{
                        width: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </CollapsibleSection>
        </section>

        {/* ══ Tutorials — Basic ══ */}
        <section id="tutorials-basic" style={{ scrollMarginTop: '96px' }}>
        <CollapsibleSection title="Tutorials — Basic">
          <div style={styles.sectionDivider} />
          <div style={{
            border: '1px solid var(--card-border)',
            background: 'var(--card)',
            padding: '56px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-bebas), sans-serif',
              fontSize: '36px',
              letterSpacing: '6px',
              color: 'var(--accent)',
              textShadow: '0 0 30px rgba(232,255,71,0.25)',
            }}>Coming Soon</span>
            <p style={{ ...styles.body, margin: 0, textAlign: 'center' }}>
              Beginner guides covering movement, basic strategy, and game modes are in development.
            </p>
          </div>
        </CollapsibleSection>
        </section>

        {/* ══ Tutorials — Advanced ══ */}
        <section id="tutorials-advanced" style={{ scrollMarginTop: '96px' }}>
        <CollapsibleSection title="Tutorials — Advanced">
          <div style={{
            border: '1px solid var(--card-border)',
            background: 'var(--card)',
            padding: '56px 48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-bebas), sans-serif',
              fontSize: '36px',
              letterSpacing: '6px',
              color: 'var(--accent)',
              textShadow: '0 0 30px rgba(232,255,71,0.25)',
            }}>Coming Soon</span>
            <p style={{ ...styles.body, margin: 0, textAlign: 'center' }}>
              Advanced guides covering high-level tactics, team play, and competitive mechanics are in development.
            </p>
          </div>
        </CollapsibleSection>
        </section>

      </main>

    </div>
  )
}
