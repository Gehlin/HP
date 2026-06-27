import { useNavigate } from 'react-router-dom'

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
  </svg>
)

const BookmarkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
)

const RepeatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 1l4 4-4 4" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <path d="M7 23l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

const MENU_ROWS = [
  { label: 'Teori',         path: '/theory',    Icon: BookIcon     },
  { label: 'Bokmärken',     path: '/bookmarks', Icon: BookmarkIcon },
  { label: 'Inställningar', path: '/settings',  Icon: SettingsIcon },
  { label: 'Repetitionskö', path: '/srs',       Icon: RepeatIcon   },
] as const

export default function Profil() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-app pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-14 pb-8">
        <h1 className="text-2xl font-[var(--font-serif)] text-[var(--color-ink)] mb-6">
          Profil
        </h1>

        <div className="bg-[var(--color-card)] rounded-2xl border border-[var(--color-card-border)] overflow-hidden">
          {MENU_ROWS.map((row, i) => (
            <button
              key={row.path}
              onClick={() => navigate(row.path)}
              className={`w-full flex items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-[var(--color-paper-dark)] active:bg-[var(--color-paper-dark)] ${i < MENU_ROWS.length - 1 ? 'border-b border-[var(--color-card-border)]' : ''}`}
            >
              <span className="text-[var(--color-green)] shrink-0">
                <row.Icon />
              </span>
              <span className="flex-1 text-[var(--color-ink)] font-medium">{row.label}</span>
              <span className="text-[var(--color-ink-faint)] text-lg leading-none">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
