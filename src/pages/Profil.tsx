import { useEffect, useMemo, useRef, useState } from 'react'
import { loadStats } from '../utils/gamification'
import { loadHistory } from '../utils/session'
import { getExamDate, daysUntilExam } from '../utils/examDate'
import Onboarding from '../components/Onboarding'
import { getDueQuestions } from '../utils/srs'
import { getBookmarks } from '../utils/bookmarks'
import { getEarnedIds } from '../utils/achievements'
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

const MONTHS_SV = ['januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september', 'oktober', 'november', 'december']

function memberSinceLabel(history: ReturnType<typeof loadHistory>): string {
  const earliest = history.length > 0 ? Math.min(...history.map(s => s.startTime)) : Date.now()
  const d = new Date(earliest)
  return `Medlem sedan ${MONTHS_SV[d.getMonth()]} ${d.getFullYear()}`
}

// Prototype initials(): first letters of the first two words, else the first two chars
function initialsFor(name: string | null): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  const w = parts[0] || 'HP'
  return (w.length >= 2 ? w.slice(0, 2) : w).toUpperCase()
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
    <svg width="8" height="14" viewBox="0 0 8 14" className="shrink-0">
      <path d="M1 1l6 6-6 6" stroke="#C3BBAC" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
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

function ReplayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.59" />
    </svg>
  )
}

function EraseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

// Granular per-category resets (migrated from the retired Settings.tsx)
type GranularResetId = 'srs' | 'history' | 'bookmarks' | 'achievements'

const GRANULAR_RESETS: { id: GranularResetId; label: string; description: string; keys: string[]; doneMsg: string }[] = [
  { id: 'srs',          label: 'Nollställ SRS-framsteg',        description: 'Tar bort repetitionshistorik. Alla frågor börjar om från noll.', keys: ['hp_srs'],                                                       doneMsg: 'SRS-data rensad' },
  { id: 'history',      label: 'Rensa träningshistorik & XP',   description: 'Tar bort alla pass, XP och streak. Brickor behålls.',            keys: ['hp_session_history', 'hp_current_session', 'hp_gamification'], doneMsg: 'Träningshistorik och XP nollställda' },
  { id: 'bookmarks',    label: 'Rensa bokmärken',               description: 'Tar bort alla sparade frågor.',                                  keys: ['hp_bookmarks'],                                                 doneMsg: 'Bokmärken rensade' },
  { id: 'achievements', label: 'Rensa brickor',                 description: 'Nollställer alla upplåsta achievements.',                        keys: ['hp_achievements'],                                              doneMsg: 'Brickor rensade' },
]

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
      style={{ width: 46, height: 28, background: on ? 'var(--color-green)' : '#E0D8C8', transition: 'background 0.2s' }}
    >
      <div
        className="absolute rounded-full bg-white"
        style={{ width: 22, height: 22, top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: on ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.15)' }}
      />
    </div>
  )
}

// Prototype settings-row value text (500 14px #8B8478), e.g. "20 frågor" / "Svenska"
function RowValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="shrink-0" style={{ fontWeight: 500, fontSize: 14, lineHeight: 1, color: '#8B8478' }}>
      {children}
    </span>
  )
}

interface SettingsRowProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  last?: boolean
  right?: React.ReactNode
  danger?: boolean
}

function SettingsRow({ icon, label, onClick, last, right, danger }: SettingsRowProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full px-4 py-3.5 flex items-center gap-[13px] text-left active:bg-[var(--color-paper-darker)] transition-colors ${!last ? 'after:absolute after:left-4 after:right-0 after:bottom-0 after:h-px after:bg-[#F0EADD]' : ''}`}
    >
      {icon}
      <span className="flex-1 text-[15px] font-semibold" style={{ color: danger ? 'var(--color-wrong-badge)' : 'var(--color-ink)' }}>{label}</span>
      {right !== undefined ? right : <ChevronIcon />}
    </button>
  )
}

export default function Profil() {
  const [stats, setStats] = useState<ProfileStats>({ totalQuestions: 0, streak: 0, sessions: 0 })
  const [examDate, setExamDateState] = useState<Date | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [goal, setGoal] = useState<string>('1,40')
  const [showGoalEdit, setShowGoalEdit] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem('hp_notif_enabled') === '1')
  const [focusPref, setFocusPrefState] = useState<FocusPreference | null>(() => getFocusPreference())
  const [showFocusModal, setShowFocusModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showGranularModal, setShowGranularModal] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState<GranularResetId | null>(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const importRef = useRef<HTMLInputElement>(null)

  const dueCount = useMemo(() => getDueQuestions(allQuestionIds).length, [dataVersion])
  const bookmarkCount = useMemo(() => getBookmarks().length, [dataVersion])
  const earnedCount = useMemo(() => getEarnedIds().length, [dataVersion])

  useEffect(() => {
    setStats(computeStats())
    setExamDateState(getExamDate())
    setDaysLeft(daysUntilExam())
    try { setGoal(localStorage.getItem('hp_goal') ?? '1,40') } catch { /* ignore */ }
  }, [dataVersion])

  // Prototype goalEdit: "Ändra" re-enters the onboarding wizard at the goal step,
  // returning here (overlay unmounts) when finished; re-read what it wrote.
  function closeGoalEdit() {
    setShowGoalEdit(false)
    setExamDateState(getExamDate())
    setDaysLeft(daysUntilExam())
    try { setGoal(localStorage.getItem('hp_goal') ?? '1,40') } catch { /* ignore */ }
  }

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

  // Two-tap confirm per category, matching the retired Settings.tsx behavior
  function handleGranularReset(item: typeof GRANULAR_RESETS[number]) {
    if (confirmingReset === item.id) {
      item.keys.forEach(k => localStorage.removeItem(k))
      setConfirmingReset(null)
      setDataVersion(v => v + 1)
      flash(item.doneMsg)
    } else {
      setConfirmingReset(item.id)
      setTimeout(() => setConfirmingReset(c => (c === item.id ? null : c)), 4000)
    }
  }

  function handleReplayOnboarding() {
    localStorage.removeItem('hp_onboarding_done')
    window.location.href = '/'
  }

  const userName = (() => { try { return localStorage.getItem('hp_user_name') } catch { return null } })()
  const userInitials = initialsFor(userName)

  return (
    <div className="min-h-screen bg-app pb-bottomnav pt-topnav">
      <div className="max-w-2xl mx-auto px-4">
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 26, lineHeight: 1.05, color: '#23201A', marginBottom: 16 }}>
          Profil
        </h1>

        {/* ── Avatar + name card ────────────────────────────── */}
        <div className="card mb-3" style={{ borderRadius: 18, padding: '16px' }}>
          <div className="flex items-center gap-[14px]">
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#224A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 20, color: '#FBF7EE', flexShrink: 0 }}>
              {userInitials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 18, lineHeight: 1.1, color: '#23201A' }}>{userName || 'HP Träning'}</div>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 13, lineHeight: 1, color: '#8B8478', marginTop: 5 }}>{memberSinceLabel(loadHistory())}</div>
              <div className="flex gap-4 mt-2">
                <StatItem value={stats.totalQuestions} label="Frågor" />
                <StatItem value={stats.streak} label="Streak" />
                <StatItem value={stats.sessions} label="Sessioner" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Goal / exam card ──────────────────────────────── */}
        <div style={{ background: '#224A3A', borderRadius: 18, padding: '16px 18px', marginBottom: 12, color: '#EFE9DD' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: '0.12em', color: '#9FB7A8' }}>DITT MÅL</div>
              <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 30, lineHeight: 1, color: '#FBF7EE', marginTop: 8 }}>{goal}</div>
            </div>
            <div style={{ width: 1, height: 46, background: 'rgba(255,255,255,.14)' }} />
            <div>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 10, lineHeight: 1, letterSpacing: '0.12em', color: '#9FB7A8' }}>PROVDATUM</div>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 17, lineHeight: 1, color: '#FBF7EE', marginTop: 11 }}>
                {examDate ? formatSwedishDate(examDate) : 'Inget datum'}
              </div>
              {daysLeft !== null && (
                <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 12, lineHeight: 1, color: '#A9C0B2', marginTop: 5 }}>
                  {daysLeft > 0 ? `om ${daysLeft} dagar` : daysLeft === 0 ? 'idag' : 'passerat'}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowGoalEdit(true)}
              style={{ padding: '8px 13px', border: '1px solid rgba(255,255,255,.25)', borderRadius: 999, fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 12, color: '#EFE9DD', background: 'none', cursor: 'pointer' }}
            >
              Ändra
            </button>
          </div>
        </div>

        {/* ── Inställningar ─────────────────────────────────── */}
        <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: '#A89F90', margin: '20px 4px 9px' }}>INSTÄLLNINGAR</div>
        <div className="card mb-3 overflow-hidden" style={{ borderRadius: 18 }}>
          <SettingsRow
            icon={<BellIcon />}
            label="Daglig påminnelse"
            onClick={handleNotifToggle}
            right={<IOSToggle on={notifEnabled} />}
          />
          <SettingsRow
            icon={<SlidersIcon />}
            label="Fokusprioritet"
            onClick={() => setShowFocusModal(true)}
            right={<>{focusPref && <RowValue>{FOCUS_LABELS[focusPref]}</RowValue>}<ChevronIcon /></>}
          />
          <SettingsRow
            icon={<ReplayIcon />}
            label="Visa introduktion igen"
            onClick={handleReplayOnboarding}
            last
          />
        </div>

        {/* ── Konto / data ─────────────────────────────────── */}
        <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 11, letterSpacing: '0.1em', color: '#A89F90', margin: '20px 4px 9px' }}>KONTO</div>
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
            icon={<EraseIcon />}
            label="Rensa specifik data"
            onClick={() => { setConfirmingReset(null); setShowGranularModal(true) }}
          />
          <SettingsRow
            icon={<TrashIcon />}
            label="Återställ all data"
            onClick={() => setShowResetModal(true)}
            right={null}
            danger
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

      {/* Granular reset modal (migrated from the retired Settings.tsx) */}
      {showGranularModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-8"
          onClick={() => setShowGranularModal(false)}
        >
          <div
            className="card w-full max-w-md p-5"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-[var(--color-ink)] mb-1">Rensa specifik data</h2>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4">Tryck två gånger för att bekräfta. Övrig data behålls.</p>
            <div className="flex flex-col gap-2">
              {GRANULAR_RESETS.map(item => {
                const badge =
                  item.id === 'history' ? `${stats.sessions} pass` :
                  item.id === 'bookmarks' ? `${bookmarkCount}` :
                  item.id === 'achievements' ? `${earnedCount}` :
                  `${dueCount} att repetera`
                const isConfirming = confirmingReset === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleGranularReset(item)}
                    className={`w-full text-left rounded-xl px-4 py-3 border transition-colors ${
                      isConfirming
                        ? 'border-[var(--color-gold-deep)] bg-[var(--color-gold-muted)]'
                        : 'border-[var(--color-card-border)] bg-[var(--color-paper)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-[var(--color-ink)]">{item.label}</span>
                      <span className={`text-xs shrink-0 px-2 py-0.5 rounded-lg font-medium ${isConfirming ? 'text-[var(--color-gold-deep)] bg-[var(--color-gold-muted)]' : 'text-[var(--color-ink-faint)] bg-[var(--color-paper-dark)]'}`}>
                        {isConfirming ? 'Tryck igen' : badge}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--color-ink-faint)] mt-1">{item.description}</div>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowGranularModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl border border-[var(--color-card-border)] text-sm text-[var(--color-ink)]"
            >
              Stäng
            </button>
          </div>
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
                className="flex-1 py-2.5 rounded-xl bg-[var(--color-terracotta)] text-white text-sm font-semibold"
              >
                Återställ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* "Ändra" → re-enter onboarding at the goal step (prototype goalEdit) */}
      {showGoalEdit && <Onboarding initialStep={2} onClose={closeGoalEdit} />}
    </div>
  )
}
