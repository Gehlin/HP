import { useMemo, useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getDueQuestions } from '../utils/srs'
import { getBookmarks } from '../utils/bookmarks'
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

const TheoryIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" strokeLinejoin="round"/>
  </svg>
)

const MoreIcon = ({ active }: { active: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth={active ? 2 : 1.75} stroke="currentColor">
    <circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/>
    <circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)

const TABS = [
  { path: '/',         label: 'Hem',      Icon: HomeIcon     },
  { path: '/practice', label: 'Öva',      Icon: PracticeIcon },
  { path: '/progress', label: 'Statistik', Icon: StatsIcon   },
  { path: '/theory',   label: 'Teori',    Icon: TheoryIcon   },
] as const

const MORE_PATHS = ['/settings', '/bookmarks', '/srs', '/verbalt']

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)
  const dueCount = useMemo(() => getDueQuestions(questions.map(q => q.id)).length, [])
  const bookmarkCount = useMemo(() => getBookmarks().length, [])

  const isMoreActive = MORE_PATHS.some(p => location.pathname.startsWith(p))

  useEffect(() => {
    if (!showMore) return
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMore])

  useEffect(() => { setShowMore(false) }, [location.pathname])

  if (location.pathname.startsWith('/session')) return null

  const go = (path: string) => { navigate(path); setShowMore(false) }

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe" ref={moreRef}>
      {/* Mer drawer */}
      {showMore && (
        <div className="mx-auto max-w-2xl px-3 mb-1">
          <div className="glass border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
            <button
              onClick={() => go('/bookmarks')}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.05]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-blue-400 shrink-0">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span className="text-sm font-semibold text-slate-200 flex-1">Bokmärken</span>
              {bookmarkCount > 0 && (
                <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md">{bookmarkCount}</span>
              )}
            </button>
            <button
              onClick={() => go('/srs')}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.05]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-400 shrink-0">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" strokeLinecap="round"/>
                <path d="M3 3v5h5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7v5l4 2" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-semibold text-slate-200 flex-1">Repetitionskö</span>
              {dueCount > 0 && (
                <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md animate-pulse">{dueCount}</span>
              )}
            </button>
            <button
              onClick={() => go('/verbalt')}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.05] transition-colors text-left border-b border-white/[0.05]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-rose-400 shrink-0">
                <path d="M4 6h16M4 12h10M4 18h7" strokeLinecap="round"/>
              </svg>
              <span className="text-sm font-semibold text-slate-200">Verbal träning</span>
            </button>
            <button
              onClick={() => go('/settings')}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.05] transition-colors text-left"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-slate-400 shrink-0">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
              <span className="text-sm font-semibold text-slate-200">Inställningar</span>
            </button>
          </div>
        </div>
      )}

      {/* frosted glass bar */}
      <div className="mx-0 border-t border-white/[0.06] bg-[#080C14]/90 backdrop-blur-xl">
        <div className="flex max-w-2xl mx-auto">
          {TABS.map(tab => {
            const THEORY_PREFIXES = ['/matematik', '/ord-guide', '/mek-guide', '/las-guide', '/elf-guide', '/liggande-stolen']
            const isActive = tab.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(tab.path) || (tab.path === '/theory' && THEORY_PREFIXES.some(p => location.pathname.startsWith(p)))

            return (
              <button
                key={tab.path}
                onClick={() => { setShowMore(false); navigate(tab.path) }}
                className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-1 relative group"
              >
                {isActive && (
                  <span className="nav-pill absolute top-0 inset-x-4 h-[2px] rounded-full bg-blue-400" />
                )}
                <span className={`relative transition-colors duration-150 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  <tab.Icon active={isActive} />
                  {tab.path === '/practice' && dueCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-[#080C14]" />
                  )}
                </span>
                <span className={`text-[10px] font-medium leading-none transition-colors duration-150 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}

          {/* Mer button */}
          <button
            onClick={() => setShowMore(v => !v)}
            className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-1 relative group"
          >
            {(isMoreActive || showMore) && (
              <span className="nav-pill absolute top-0 inset-x-4 h-[2px] rounded-full bg-blue-400" />
            )}
            <span className={`relative transition-colors duration-150 ${isMoreActive || showMore ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              <MoreIcon active={isMoreActive || showMore} />
              {(dueCount > 0 || bookmarkCount > 0) && !showMore && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-400 ring-2 ring-[#080C14]" />
              )}
            </span>
            <span className={`text-[10px] font-medium leading-none transition-colors duration-150 ${isMoreActive || showMore ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              Mer
            </span>
          </button>
        </div>
      </div>
    </nav>
  )
}
