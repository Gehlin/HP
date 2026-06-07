import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Practice from './pages/Practice'
import Session from './pages/Session'
import Results from './pages/Results'
import Theory from './pages/Theory'
import Progress from './pages/Progress'
import ExamSelect from './pages/ExamSelect'
import ExamStart from './pages/ExamStart'
import Settings from './pages/Settings'
import Onboarding, { isOnboardingDone } from './components/Onboarding'
import BottomNav from './components/BottomNav'
import { maybeShowDueNotification } from './utils/notifications'
import { getDueQuestions } from './utils/srs'
import { questions } from './data/questions'
import { loadHistory } from './utils/session'

const KEYBOARD_SHORTCUTS = [
  { key: 'A – E', desc: 'Välj svarsalternativ' },
  { key: 'Enter / Space', desc: 'Visa svar / Gå till nästa fråga' },
  { key: '?', desc: 'Visa / dölj tangentbordsguide' },
]

function AppInner() {
  const location = useLocation()
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showKeyGuide, setShowKeyGuide] = useState(false)

  useEffect(() => {
    const online = () => setIsOnline(true)
    const offline = () => setIsOnline(false)
    window.addEventListener('online', online)
    window.addEventListener('offline', offline)
    return () => {
      window.removeEventListener('online', online)
      window.removeEventListener('offline', offline)
    }
  }, [])

  useEffect(() => {
    const dueCount = getDueQuestions(questions.map(q => q.id)).length
    const history = loadHistory()
    const lastSession = history.length > 0 ? history[0].startTime : null
    maybeShowDueNotification(dueCount, lastSession)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '?') {
        e.preventDefault()
        setShowKeyGuide(v => !v)
      } else if (e.key === 'Escape' && showKeyGuide) {
        setShowKeyGuide(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showKeyGuide])

  const inSession = location.pathname.startsWith('/session')

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-[300] bg-amber-600 text-white text-center text-xs py-1.5 font-semibold">
          Ingen internetanslutning — appen fungerar offline
        </div>
      )}

      {showOnboarding && (
        <Onboarding onClose={() => setShowOnboarding(false)} />
      )}

      {showKeyGuide && (
        <div
          className="fixed inset-0 bg-black/70 z-[250] flex items-center justify-center p-4"
          onClick={() => setShowKeyGuide(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xs shadow-2xl p-6 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-black text-slate-300 uppercase tracking-widest mb-4">
              Tangentbordsgenvägar
            </h2>
            <div className="flex flex-col gap-3">
              {KEYBOARD_SHORTCUTS.map(s => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <kbd className="text-xs font-mono bg-slate-800 border border-slate-600 text-slate-200 px-2.5 py-1 rounded-lg whitespace-nowrap">
                    {s.key}
                  </kbd>
                  <span className="text-sm text-slate-400 text-right">{s.desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowKeyGuide(false)}
              className="mt-6 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Stäng (Esc)
            </button>
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/session" element={<Session />} />
        <Route path="/results" element={<Results />} />
        <Route path="/theory" element={<Theory />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/exam-select" element={<ExamSelect />} />
        <Route path="/exam/:examId" element={<ExamStart />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      {!inSession && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
