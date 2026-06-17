import { useState, useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import InstallBanner from './components/InstallBanner'
import Onboarding, { isOnboardingDone } from './components/Onboarding'
import BottomNav from './components/BottomNav'
import { maybeShowDueNotification } from './utils/notifications'
import { getDueQuestions } from './utils/srs'
import { questions } from './data/questions'
import { loadHistory } from './utils/session'

const Home       = lazy(() => import('./pages/Home'))
const Practice   = lazy(() => import('./pages/Practice'))
const Session    = lazy(() => import('./pages/Session'))
const Results    = lazy(() => import('./pages/Results'))
const Theory     = lazy(() => import('./pages/Theory'))
const Progress   = lazy(() => import('./pages/Progress'))
const ExamSelect = lazy(() => import('./pages/ExamSelect'))
const ExamStart  = lazy(() => import('./pages/ExamStart'))
const Settings   = lazy(() => import('./pages/Settings'))
const MathGuide           = lazy(() => import('./pages/MathGuide'))
const Bookmarks           = lazy(() => import('./pages/Bookmarks'))
const SrsQueue            = lazy(() => import('./pages/SrsQueue'))
const LiggandeStolenGuide = lazy(() => import('./pages/LiggandeStolenGuide'))
const OrdGuide            = lazy(() => import('./pages/OrdGuide'))
const MekGuide            = lazy(() => import('./pages/MekGuide'))
const LasGuide            = lazy(() => import('./pages/LasGuide'))
const ElfGuide            = lazy(() => import('./pages/ElfGuide'))
const ScorePredictor      = lazy(() => import('./pages/ScorePredictor'))

const KEYBOARD_SHORTCUTS = [
  { key: 'A – E', desc: 'Välj svarsalternativ' },
  { key: 'Enter / Space', desc: 'Visa svar / Gå till nästa fråga' },
  { key: '?', desc: 'Visa / dölj tangentbordsguide' },
]

function PageLoader() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-blue-400 animate-spin" />
    </div>
  )
}

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

      <Suspense fallback={<PageLoader />}>
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
          <Route path="/matematik" element={<MathGuide />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/srs" element={<SrsQueue />} />
          <Route path="/liggande-stolen" element={<LiggandeStolenGuide />} />
          <Route path="/ord-guide" element={<OrdGuide />} />
          <Route path="/mek-guide" element={<MekGuide />} />
          <Route path="/las-guide" element={<LasGuide />} />
          <Route path="/elf-guide" element={<ElfGuide />} />
          <Route path="/score" element={<ScorePredictor />} />
        </Routes>
      </Suspense>

      {!inSession && <BottomNav />}
      <InstallBanner />
    </>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
