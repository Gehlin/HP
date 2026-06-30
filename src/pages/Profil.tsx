import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStats } from '../utils/gamification'
import { loadHistory } from '../utils/session'
import {
  getExamDate,
  setExamDate,
  clearExamDate,
  daysUntilExam,
  KNOWN_HP_DATES,
} from '../utils/examDate'
import { getDueQuestions } from '../utils/srs'
import { getBookmarks } from '../utils/bookmarks'
import { questions } from '../data/questions'
import { requestNotificationPermission, disableNotifications } from '../utils/notifications'
import { getFocusPreference, setFocusPreference, FocusPreference } from '../utils/focusPreference'

interface ProfileStats {
  totalQuestions: number
  streak: number
  sessions: number
}

function formatSwedishDate(date: Date): string {
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
}

const SHORT_MONTHS_SV = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec']

function memberSinceLabel(history: ReturnType<typeof loadHistory>): string {
  const earliest = history.length > 0 ? Math.min(...history.map(s => s.startTime)) : Date.now()
  const d = new Date(earliest)
  return `Medlem sedan ${SHORT_MONTHS_SV[d.getMonth()]} ${d.getFullYear()}`
}

function computeStats(): ProfileStats {
  const stats = loadStats()
  const history = loadHistory()
  const totalQuestions = history.reduce((sum, s) => sum + Object.keys(s.answers).length, 0)
  return {
    totalQuestions,
    streak: stats.streak,
    sessions: history.length,
  }
}

function StatItem({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[56px]">
      <span className="text-sm font-semibold text-[var(--color-ink)]">{value}</span>
      <span className="text-xs text-[var(--color-ink-faint)]">{label}</span>
    </div>
  )
}

const allQuestionIds = questions.map(q => q.id)

const FOCUS_LABELS: Record<FocusPreference, string> = {
  quant: 'Kvantitativ',
  verbal: 'Verbal',
  both: 'Båda',
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-faint)] shrink-0">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  )
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TimerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l3 3" />
      <path d="M9.5 3h5" />
      <path d="M12 3v2" />
    </svg>
  )
}

function TypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

const DATA_KEYS = [
  'hp_srs', 'hp_current_session', 'hp_session_history', 'hp_gamification',
  'hp_bookmarks', 'hp_achievements', 'hp_onboarding_done', 'hp_daily_done',
  'hp_exam_date', 'hp_notif_enabled', 'hp_notif_last_shown',
]

function exportData(): void {
  const data: Record<string, unknown> = {}
  DATA_KEYS.forEach(k => {
    const v = localStorage.getItem(k)
    if (v !== null) {
      try { data[k] = JSON.parse(v) } catch { data[k] = v }
    }
  })
  const payload = JSON.stringify({ version: 1, exported: new Date().toISOString(), data }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hp-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-terracotta)] shrink-0">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function SlidersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

function IOSToggle({ on }: { on: boolean }) {
  return (
    <div
      className="relative rounded-full shrink-0"
      style={{ width: 44, height: 26, background: on ? 'var(--color-green)' : 'var(--color-track)', transition: 'background 0.2s' }}
    >
      <div
        className="absolute rounded-full bg-white shadow-sm"
        style={{ width: 22, height: 22, top: 2, left: on ? 20 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
      />
    </div>
  )
}

function FocusChip({ pref }: { pref: FocusPreference }) {
  return (
    <span className="text-xs font-medium bg-[var(--color-green)]/10 text-[var(--color-green)] rounded-full px-2 py-0.5 shrink-0">
      {FOCUS_LABELS[pref]}
    </span>
  )
}

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  badge?: number
  onClick: () => void
  last?: boolean
  right?: React.ReactNode
}

function SettingsRow({ icon, label, badge, onClick, last, right }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3.5 flex items-center gap-3 text-left active:bg-[var(--color-paper-darker)] transition-colors ${!last ? 'border-b border-[var(--color-card-border)]' : ''}`}
    >
      {icon}
      <span className="flex-1 text-[15px] font-medium text-[var(--color-ink)]">{label}</span>
      {right !== undefined ? right : (
        <>
          {badge !== undefined && badge > 0 && (
            <span className="text-xs font-medium bg-[var(--color-green)] text-[var(--color-cream)] rounded-full px-1.5 py-0.5 leading-none">
              {badge}
            </span>
          )}
          <ChevronIcon />
        </>
      )}
    </button>
  )
}

export default function Profil() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<ProfileStats>({ totalQuestions: 0, streak: 0, sessions: 0 })
  const [examDate, setExamDateState] = useState<Date | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)
  const [pendingDate, setPendingDate] = useState<string | null>(null)
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('hp_notif_enabled') === '1')
  const [focusPref, setFocusPrefState] = useState<FocusPreference | null>(() => getFocusPreference())
  const [showFocusModal, setShowFocusModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const dueCount = useMemo(() => getDueQuestions(allQuestionIds).length, [])
  const bookmarkCount = useMemo(() => getBookmarks().length, [])

  useEffect(() => {
    setStats(computeStats())
    setExamDateState(getExamDate())
    setDaysLeft(daysUntilExam())
  }, [])

  async function handleNotifToggle() {
    if (notifEnabled) {
      disableNotifications()
      setNotifEnabled(false)
    } else {
      const granted = await requestNotificationPermission()
      setNotifEnabled(granted)
    }
  }

  function handleFocusSelect(pref: FocusPreference) {
    setFocusPreference(pref)
    setFocusPrefState(pref)
    setShowFocusModal(false)
  }

  function flash(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleImport(file: File) {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target?.result as string)
        if (!json.data || typeof json.data !== 'object') throw new Error()
        Object.entries(json.data).forEach(([k, v]) => {
          if (DATA_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v))
        })
        flash('Data importerad!')
        setTimeout(() => window.location.reload(), 1200)
      } catch {
        flash('Fel: ogiltig backupfil')
      }
    }
    reader.readAsText(file)
  }

  function handleResetAll() {
    localStorage.clear()
    setShowResetModal(false)
    window.location.reload()
  }

  function handleConfirmDate() {
    if (pendingDate) {
      setExamDate(pendingDate)
      const d = new Date(pendingDate)
      setExamDateState(d)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      d.setHours(0, 0, 0, 0)
      setDaysLeft(Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))
    } else {
      clearExamDate()
      setExamDateState(null)
      setDaysLeft(null)
    }
    setShowDateModal(false)
    setPendingDate(null)
  }

  return (
    <div className="min-h-screen bg-app pb-8 pt-topnav">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-[26px] font-[var(--font-serif)] text-[var(--color-ink)] mb-5">
          Profil
        </h1>

        {/* Profile card */}
        <div className="card mb-4" style={{ borderRadius: 18, padding: '16px 18px' }}>
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full bg-[var(--color-green)] shrink-0"
              style={{ width: 48, height: 48 }}
            >
              <span className="text-[var(--color-cream)] text-xl font-[var(--font-serif)] select-none">HP</span>
            </div>
            <div>
              <p className="text-[16px] font-bold text-[var(--color-ink)]">HP Träning</p>
              <p className="text-xs font-medium text-[var(--color-muted)] mt-0.5">{memberSinceLabel(loadHistory())}</p>
              <div className="flex gap-4 mt-2">
                <StatItem value={stats.totalQuestions} label="Frågor" />
                <StatItem value={stats.streak} label="Streak" />
                <StatItem value={stats.sessions} label="Sessioner" />
              </div>
            </div>
          </div>
        </div>

        {/* Goal card */}
        <div className="card-green mb-6" style={{ borderRadius: 18, padding: '16px 18px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-green-tint)]">
              PROVDATUM
            </span>
            <span className="text-[13px] font-medium text-[var(--color-cream-dim)] text-right">
              {examDate
                ? `${formatSwedishDate(examDate)}${daysLeft !== null ? ` (${daysLeft > 0 ? `om ${daysLeft} dagar` : daysLeft === 0 ? 'idag' : 'passerat'})` : ''}`
                : 'Inget datum valt'}
            </span>
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={() => { setPendingDate(null); setShowDateModal(true) }}
              className="text-[13px] font-semibold text-[var(--color-cream)] rounded-full"
              style={{ background: 'rgba(255,255,255,0.12)', padding: '6px 14px' }}
            >
              Ändra
            </button>
          </div>
        </div>

        {/* Studieverktyg */}
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] mb-2 px-1">Studieverktyg</p>
        <div className="card mb-4 overflow-hidden" style={{ borderRadius: 18 }}>
          <SettingsRow icon={<BookIcon />} label="Teori & guider" onClick={() => navigate('/theory')} />
          <SettingsRow icon={<BookmarkIcon />} label="Bokmärken" badge={bookmarkCount} onClick={() => navigate('/bookmarks')} />
          <SettingsRow icon={<ClockIcon />} label="Repetitionskö" badge={dueCount} onClick={() => navigate('/srs')} />
          <SettingsRow icon={<TimerIcon />} label="Provsimulatorn" onClick={() => navigate('/exam-select')} />
          <SettingsRow icon={<TypeIcon />} label="Ordbyggaren" onClick={() => navigate('/ord-builder')} />
          <SettingsRow icon={<ChartIcon />} label="HP-poängprediktor" onClick={() => navigate('/score')} last />
        </div>

        {/* Inställningar */}
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] mb-2 px-1">Inställningar</p>
        <div className="card mb-4 overflow-hidden" style={{ borderRadius: 18 }}>
          <SettingsRow
            icon={<BellIcon />}
            label="Aviseringar"
            onClick={handleNotifToggle}
            right={<IOSToggle on={notifEnabled} />}
          />
          <SettingsRow
            icon={<SlidersIcon />}
            label="Fokusprioritet"
            onClick={() => setShowFocusModal(true)}
            right={<>{focusPref && <FocusChip pref={focusPref} />}<ChevronIcon /></>}
            last
          />
        </div>

        {/* Hantera data */}
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--color-muted)] mb-2 px-1">Hantera data</p>
        <div className="card mb-4 overflow-hidden" style={{ borderRadius: 18 }}>
          <SettingsRow
            icon={<DownloadIcon />}
            label="Exportera data"
            onClick={exportData}
          />
          <SettingsRow
            icon={<UploadIcon />}
            label="Importera data"
            onClick={() => importRef.current?.click()}
          />
          <SettingsRow
            icon={<TrashIcon />}
            label="Återställ all data"
            onClick={() => setShowResetModal(true)}
            right={<ChevronIcon />}
            last
          />
        </div>
        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }}
        />
      </div>

      {/* Focus preference modal */}
      {showFocusModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8"
          onClick={() => setShowFocusModal(false)}
        >
          <div
            className="card w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-4">Fokusprioritet</h2>
            <div className="flex flex-col gap-2">
              {(['quant', 'verbal', 'both'] as FocusPreference[]).map(pref => (
                <button
                  key={pref}
                  onClick={() => handleFocusSelect(pref)}
                  className={`px-4 py-3 rounded-xl text-left text-sm font-medium border transition-colors ${
                    focusPref === pref
                      ? 'bg-[var(--color-green)] text-[var(--color-cream)] border-[var(--color-green)]'
                      : 'border-[var(--color-card-border)] text-[var(--color-ink)] bg-[var(--color-paper)]'
                  }`}
                >
                  {FOCUS_LABELS[pref]}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowFocusModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl border border-[var(--color-card-border)] text-sm text-[var(--color-ink)]"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] bg-[var(--color-green)] text-[var(--color-cream)] text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8"
          onClick={() => setShowResetModal(false)}
        >
          <div
            className="card w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrashIcon />
              <h2 className="text-base font-semibold text-[var(--color-ink)]">Säker?</h2>
            </div>
            <p className="text-sm text-[var(--color-ink-muted)] mb-5">
              All data raderas permanent — XP, historik, SRS, bokmärken och inställningar. Det går inte att ångra.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-card-border)] text-sm text-[var(--color-ink)]"
              >
                Avbryt
              </button>
              <button
                onClick={handleResetAll}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold"
              >
                Återställ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date picker modal */}
      {showDateModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8"
          onClick={() => setShowDateModal(false)}
        >
          <div
            className="card w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-4">Välj provdatum</h2>
            <div className="flex flex-col gap-2 mb-5">
              {KNOWN_HP_DATES.map(({ label, date }) => (
                <button
                  key={date}
                  onClick={() => setPendingDate(date)}
                  className={`px-4 py-3 rounded-xl text-left text-sm font-medium border transition-colors ${
                    pendingDate === date
                      ? 'bg-[var(--color-green)] text-[var(--color-cream)] border-[var(--color-green)]'
                      : 'border-[var(--color-card-border)] text-[var(--color-ink)] bg-[var(--color-paper)]'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setPendingDate(null)}
                className={`px-4 py-3 rounded-xl text-left text-sm font-medium border transition-colors ${
                  pendingDate === null
                    ? 'bg-[var(--color-green)] text-[var(--color-cream)] border-[var(--color-green)]'
                    : 'border-[var(--color-card-border)] text-[var(--color-ink)] bg-[var(--color-paper)]'
                }`}
              >
                Inget datum
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDateModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-card-border)] text-sm text-[var(--color-ink)]"
              >
                Avbryt
              </button>
              <button
                onClick={handleConfirmDate}
                className="btn-primary flex-1 py-2.5 text-sm"
              >
                Bekräfta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
