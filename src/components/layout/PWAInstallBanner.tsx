'use client'

import { useState, useEffect } from 'react'
import styles from './PWAInstallBanner.module.css'

type Platform = 'ios' | 'android' | null

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  const isIOS = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as Record<string, unknown>).MSStream
  const isAndroid = /Android/.test(ua)
  if (isIOS) return 'ios'
  if (isAndroid) return 'android'
  return null
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallBanner() {
  const [platform, setPlatform] = useState<Platform>(null)
  const [bannerVisible, setBannerVisible] = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (isStandalone()) return

    const p = detectPlatform()
    setPlatform(p)

    // Show banner only if not dismissed this session
    if (p && !sessionStorage.getItem('rcl_pwa_dismissed')) {
      setBannerVisible(true)
    }

    // Capture Android install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Listen for install trigger from sidebar or anywhere else
    const onInstall = () => handleInstallIntent(p)
    window.addEventListener('rcl:pwa:install', onInstall)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('rcl:pwa:install', onInstall)
    }
  }, [])

  function handleInstallIntent(p: Platform) {
    if (p === 'ios') {
      setShowIOSGuide(true)
    } else if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(({ outcome }) => {
        if (outcome === 'accepted') dismissBanner()
      })
    }
  }

  async function handleInstall() {
    handleInstallIntent(platform)
  }

  function dismissBanner() {
    sessionStorage.setItem('rcl_pwa_dismissed', '1')
    setBannerVisible(false)
  }

  function closeIOSGuide() {
    setShowIOSGuide(false)
  }

  return (
    <>
      {/* Install banner — first-visit strip above bottom nav */}
      {bannerVisible && (
        <div className={styles.banner}>
          <div className={styles.bannerLeft}>
            <div className={styles.iconWrap}>
              <svg viewBox="0 0 32 32" width="28" height="28">
                <rect width="32" height="32" rx="6" fill="#0d0d0d" />
                <rect width="32" height="32" rx="6" fill="none" stroke="#e8ff47" strokeWidth="0.5" strokeOpacity="0.3" />
                <text x="16" y="22" textAnchor="middle" fontFamily="Arial Black, Impact, sans-serif" fontSize="14" fontWeight="900" fill="#e8ff47">RCL</text>
              </svg>
            </div>
            <div className={styles.bannerText}>
              <span className={styles.bannerTitle}>Retrocycles League</span>
              <span className={styles.bannerSub}>Add to home screen</span>
            </div>
          </div>
          <div className={styles.bannerActions}>
            <button className={styles.installBtn} onClick={handleInstall}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Install
            </button>
            <button className={styles.closeBtn} onClick={dismissBanner} aria-label="Dismiss">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* iOS guide modal — triggered by banner OR sidebar */}
      {showIOSGuide && (
        <div className={styles.iosBackdrop} onClick={closeIOSGuide}>
          <div className={styles.iosModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.iosClose} onClick={closeIOSGuide}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="12" y1="2" x2="2" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>

            <div className={styles.iosIconWrap}>
              <img src="/icons/apple-touch-icon.png" alt="RCL" width={60} height={60} style={{ borderRadius: 14 }} />
            </div>

            <h3 className={styles.iosTitle}>Add RCL to Home Screen</h3>

            <div className={styles.iosSteps}>
              <div className={styles.iosStep}>
                <span className={styles.iosNum}>1</span>
                <span className={styles.iosStepText}>
                  Tap the{' '}
                  <span className={styles.iosInline}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ display: 'inline', verticalAlign: 'middle' }}>
                      <path d="M7 1v8M4 4l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M1 10v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                    {' '}Share
                  </span>
                  {' '}button in Safari
                </span>
              </div>
              <div className={styles.iosStep}>
                <span className={styles.iosNum}>2</span>
                <span className={styles.iosStepText}>Scroll down and tap <strong>Add to Home Screen</strong></span>
              </div>
              <div className={styles.iosStep}>
                <span className={styles.iosNum}>3</span>
                <span className={styles.iosStepText}>Tap <strong>Add</strong> — RCL will appear on your home screen</span>
              </div>
            </div>

            <button className={styles.iosDismiss} onClick={closeIOSGuide}>Got it</button>
          </div>
        </div>
      )}
    </>
  )
}
