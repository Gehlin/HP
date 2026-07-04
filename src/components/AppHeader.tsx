/**
 * AppHeader — fixed top masthead ("Grönt band", Direction C from the
 * 2026-07-03 Navigation & Dashboard Overhaul playbook, ported from the
 * Phase 01 design-preview harness).
 *
 * Solid forest-green band: inverted cream logo tile (links to /) + serif
 * wordmark + gold streak chip on row 1, four editorial text tabs on row 2
 * (active = gold + underline). On /session, /resultat, /granska and /exam/*
 * the tabs row drops away and only the 54px identity row remains, so the
 * app stays branded inside a session without offering nav mid-pass.
 *
 * Page clearance lives in src/index.css: `.pt-topnav` (full bar) and
 * `.pt-topnav-collapsed` (logo-only paths).
 *
 * Since Phase 05 (desktop branded surround) the fixed band caps at
 * --content-max-width and centers via auto margins, so it stays aligned
 * with DesktopFrame's paper sheet at wide viewports. At mobile widths the
 * cap is inert and the band spans the viewport exactly as before.
 */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { loadStats } from '../utils/gamification'

const SANS = "'Hanken Grotesk', system-ui, sans-serif"
const SERIF = "'Newsreader', Georgia, serif"

/** Bar heights excluding the safe-area inset (kept in sync with .pt-topnav*) */
export const APP_HEADER_HEIGHT = 97
export const APP_HEADER_LOGO_ONLY_HEIGHT = 54

const TABS = [
  { path: '/',         label: 'Hem'       },
  { path: '/practice', label: 'Öva'       },
  { path: '/progress', label: 'Statistik' },
  { path: '/profil',   label: 'Profil'    },
] as const

// Same path list the old bottom bar hid on — here they collapse to logo-only.
const LOGO_ONLY_PATHS = ['/session', '/resultat', '/granska', '/exam/']

/** Brand mark: the onboarding green-tile serif "H", inverted (cream tile,
 *  green H) to hold contrast on the green band. */
function LogoTile({ size = 31 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.3),
        background: '#FBF7EE',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontFamily: SERIF,
          fontWeight: 500,
          fontSize: Math.round(size * 0.53),
          lineHeight: 1,
          color: '#224A3A',
          transform: 'translateY(-1px)',
        }}
      >
        H
      </span>
    </span>
  )
}

export default function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()

  const logoOnly = LOGO_ONLY_PATHS.some(p => location.pathname.startsWith(p))
  // Re-read on every render — the component re-renders on each route change,
  // which is exactly when the streak can have moved (a finished session).
  const streak = loadStats().streak

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        // Keep the band aligned with DesktopFrame's centered sheet at desktop
        // widths (same centering the Phase 04 harness used for its header).
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 'var(--content-max-width)',
        zIndex: 50,
        height: `calc(${logoOnly ? APP_HEADER_LOGO_ONLY_HEIGHT : APP_HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: '#224A3A',
        // Paper sliver at the bottom edge: invisible against the paper page at
        // rest, but keeps the band from fusing with the identically-green hero
        // card (or any dark content) that scrolls beneath it.
        borderBottom: '2px solid #F1ECE3',
        boxShadow: '0 10px 28px -14px rgba(26,58,45,0.55)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Smooth the full ↔ logo-only height change on session entry/exit
        transition: 'height 180ms ease',
      }}
    >
      {/* ── Row 1: masthead — logo (→ Hem) + wordmark + streak chip ── */}
      <div
        style={{
          height: APP_HEADER_LOGO_ONLY_HEIGHT,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <Link
          to="/"
          aria-label="Till startsidan"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <LogoTile size={31} />
          <span
            style={{
              fontFamily: SERIF,
              fontWeight: 500,
              fontSize: 19,
              letterSpacing: '-0.01em',
              color: '#FBF7EE',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            HP Träning
          </span>
        </Link>

        <span
          aria-label={`${streak} dagars svit`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: 'rgba(255,255,255,0.12)',
            borderRadius: 999,
            padding: '5px 10px',
            fontFamily: SANS,
            fontWeight: 700,
            fontSize: 11,
            lineHeight: 1,
            color: '#E4C66A',
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: 2, background: '#E4C66A', transform: 'rotate(45deg)' }} />
          {streak}
        </span>
      </div>

      {/* ── Row 2: editorial tabs (hidden on logo-only paths) ── */}
      {!logoOnly && (
        <nav
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'stretch',
            padding: '0 8px',
            borderTop: '1px solid rgba(251,247,238,0.12)',
          }}
        >
          {TABS.map(tab => {
            const isActive = tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  position: 'relative',
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.02em',
                  color: isActive ? '#E4C66A' : 'rgba(251,247,238,0.55)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {tab.label}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 26,
                      height: 2.5,
                      borderRadius: 999,
                      background: '#E4C66A',
                    }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      )}
    </header>
  )
}
