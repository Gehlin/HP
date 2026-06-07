import { useLocation, useNavigate } from 'react-router-dom'

const TABS = [
  { path: '/',          label: 'Hem',      icon: '🏠' },
  { path: '/practice',  label: 'Öva',      icon: '📝' },
  { path: '/progress',  label: 'Statistik', icon: '📊' },
  { path: '/theory',    label: 'Teori',    icon: '📖' },
  { path: '/settings',  label: 'Inställn.', icon: '⚙️' },
] as const

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  if (location.pathname.startsWith('/session')) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 pb-safe">
      <div className="flex max-w-2xl mx-auto">
        {TABS.map(tab => {
          const isActive = tab.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
