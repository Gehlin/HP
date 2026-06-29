import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDueQuestions } from '../utils/srs'
import { questions } from '../data/questions'

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5Z" strokeLinejoin="round"/>
    <path d="M9 21V12h6v9" strokeLinejoin="round"/>
  </svg>
)

const PracticeIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
    <path d="M12 20h9" strokeLinecap="round"/>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" strokeLinejoin="round"/>
  </svg>
)

const StatsIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
    <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const ProfileIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
    <circle cx="12" cy="8" r="4" strokeLinejoin="round"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TABS = [
  { path: '/',         label: 'Hem',      Icon: HomeIcon     },
  { path: '/practice', label: 'Träna',    Icon: PracticeIcon },
  { path: '/progress', label: 'Statistik', Icon: StatsIcon   },
  { path: '/profil',   label: 'Profil',   Icon: ProfileIcon  },
] as const

export default function TopNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const dueCount = useMemo(() => getDueQuestions(questions.map(q => q.id)).length, [])

  if (location.pathname.startsWith('/session')) return null

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-[var(--color-paper)] border-b border-[var(--color-card-border)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      <div className="max-w-2xl mx-auto flex items-stretch">
        <div className="px-4 flex items-center font-[var(--font-serif)] font-black text-lg text-[var(--color-green)]">
          HP
        </div>
        <div className="flex flex-1 justify-end">
          {TABS.map(tab => {
            const isActive = tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path)

            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 relative group min-w-[3.5rem]"
              >
                <span className={`relative transition-colors duration-150 ${isActive ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-muted)]'}`}>
                  <tab.Icon active={isActive} />
                  {tab.path === '/practice' && dueCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[var(--color-paper)]" />
                  )}
                </span>
                <span className={`text-[10px] font-medium leading-none transition-colors duration-150 ${isActive ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-muted)]'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 inset-x-3 h-[2px] bg-[var(--color-green)] rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
