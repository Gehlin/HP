import { useState, useEffect, useLayoutEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import InstallBanner from './components/InstallBanner'
import Onboarding, { isOnboardingDone } from './components/Onboarding'
import AppHeader from './components/AppHeader'
import { maybeShowDueNotification, maybeShowPacingNotification } from './utils/notifications'
import { getDueQuestions } from './utils/srs'
import { questions } from './data/questions'
import { loadHistory } from './utils/session'

const Home       = lazy(() => import('./pages/Home'))
const Practice   = lazy(() => import('./pages/Practice'))
const Session    = lazy(() => import('./pages/Session'))
const Resultat   = lazy(() => import('./pages/Resultat'))
const Granska    = lazy(() => import('./pages/Granska'))
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
const VerbalHub           = lazy(() => import('./pages/VerbalHub'))
const QuantHub            = lazy(() => import('./pages/QuantHub'))
const KvaGuide            = lazy(() => import('./pages/KvaGuide'))
const DtkGuide            = lazy(() => import('./pages/DtkGuide'))
const NogGuide            = lazy(() => import('./pages/NogGuide'))
const XyzGuide            = lazy(() => import('./pages/XyzGuide'))
const OrdBuilder          = lazy(() => import('./pages/OrdBuilder'))
const Profil              = lazy(() => import('./pages/Profil'))

const KEYBOARD_SHORTCUTS = [
  { key: 'A – E', desc: 'Välj svarsalternativ' },
  { key: 'Enter / Space', desc: 'Visa svar / Gå till nästa fråga' },
  { key: '?', desc: 'Visa / dölj tangentbordsguide' },
]

function PageLoader() {
  return (
    <div className="min-h-screen bg-app flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--color-paper-dark)] border-t-[var(--color-green)] animate-spin" />
    </div>
  )
}

// Every prototype screen renders from its top — reset scroll on route change
// (SPA navigation otherwise carries the previous screen's scroll offset over).
// Native history.scrollRestoration must be 'manual': with the default 'auto',
// the browser re-applies its saved offset *after* our reset on POP navigations
// (browser back / PageHeader's navigate(-1)), landing mid-page. Set at module
// load so it's in effect before any navigation can happen.
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

function ScrollToTop() {
  const { pathname } = useLocation()
  // useLayoutEffect: reset before paint, so no one-frame flash of stale scroll
  useLayoutEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppInner() {
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
    maybeShowPacingNotification(lastSession)
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

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-[300] bg-[var(--color-terracotta)] text-[var(--color-cream)] text-center text-xs py-1.5 font-semibold">
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
            className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl w-full max-w-xs shadow-2xl p-6 animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-sm font-black text-[var(--color-ink-muted)] uppercase tracking-widest mb-4">
              Tangentbordsgenvägar
            </h2>
            <div className="flex flex-col gap-3">
              {KEYBOARD_SHORTCUTS.map(s => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <kbd className="text-xs font-mono bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] text-[var(--color-ink)] px-2.5 py-1 rounded-lg whitespace-nowrap">
                    {s.key}
                  </kbd>
                  <span className="text-sm text-[var(--color-ink-muted)] text-right">{s.desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowKeyGuide(false)}
              className="mt-6 w-full text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors"
            >
              Stäng (Esc)
            </button>
          </div>
        </div>
      )}

      <ScrollToTop />
      <AppHeader />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/session" element={<Session />} />
          <Route path="/resultat" element={<Resultat />} />
          <Route path="/granska" element={<Granska />} />
          <Route path="/results" element={<Navigate to="/resultat" replace />} />
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
          <Route path="/verbalt" element={<VerbalHub />} />
          <Route path="/kvantitativt" element={<QuantHub />} />
          <Route path="/kva-guide" element={<KvaGuide />} />
          <Route path="/dtk-guide" element={<DtkGuide />} />
          <Route path="/nog-guide" element={<NogGuide />} />
          <Route path="/xyz-guide" element={<XyzGuide />} />
          <Route path="/ord-builder" element={<OrdBuilder />} />
          <Route path="/profil" element={<Profil />} />
        </Routes>
      </Suspense>

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
