import { useLocation, useNavigate } from 'react-router-dom'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={active ? 2.3 : 2.1}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11 12 4l8 7"/>
    <path d="M6.5 9.5V20h11V9.5"/>
  </svg>
)

const PracticeIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={active ? 2.3 : 2.1}
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8.5"/>
    <polygon points="10,8.5 16,12 10,15.5" fill="currentColor" stroke="none"/>
  </svg>
)

const StatsIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={active ? 2.3 : 2.1}
    strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 19V12"/>
    <path d="M12 19V6"/>
    <path d="M19 19v-9"/>
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={active ? 2.3 : 2.1}
    strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8.5" r="3.7"/>
    <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0"/>
  </svg>
)

const TABS = [
  { path: '/',         label: 'Hem',      Icon: HomeIcon     },
  { path: '/practice', label: 'Öva',      Icon: PracticeIcon },
  { path: '/progress', label: 'Statistik', Icon: StatsIcon   },
  { path: '/profil',   label: 'Profil',   Icon: ProfileIcon  },
] as const

const HIDDEN_PATHS = ['/session', '/resultat', '/granska', '/exam/']

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()

  if (HIDDEN_PATHS.some(p => location.pathname.startsWith(p))) return null

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 50,
        height: 84,
        background: 'rgba(241,236,227,0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid #E4DCCC',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: 11,
        paddingLeft: 14,
        paddingRight: 14,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
              color: isActive ? '#224A3A' : '#A89F90',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <tab.Icon active={isActive} />
            <span style={{
              fontFamily: "'Hanken Grotesk', system-ui",
              fontWeight: isActive ? 700 : 600,
              fontSize: 10,
              lineHeight: 1,
              color: isActive ? '#224A3A' : '#A89F90',
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
