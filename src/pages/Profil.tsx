import { useEffect, useState } from 'react'
import { loadStats } from '../utils/gamification'
import { loadHistory } from '../utils/session'
import {
  getExamDate,
  setExamDate,
  clearExamDate,
  daysUntilExam,
  KNOWN_HP_DATES,
} from '../utils/examDate'

interface ProfileStats {
  totalQuestions: number
  streak: number
  sessions: number
}

function formatSwedishDate(date: Date): string {
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })
}

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white/70 shrink-0"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
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

export default function Profil() {
  const [stats, setStats] = useState<ProfileStats>({ totalQuestions: 0, streak: 0, sessions: 0 })
  const [examDate, setExamDateState] = useState<Date | null>(null)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [showDateModal, setShowDateModal] = useState(false)
  const [pendingDate, setPendingDate] = useState<string | null>(null)

  useEffect(() => {
    setStats(computeStats())
    setExamDateState(getExamDate())
    setDaysLeft(daysUntilExam())
  }, [])

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
    <div className="min-h-screen bg-app pb-28">
      <div className="max-w-2xl mx-auto px-4 pt-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-[var(--font-serif)] text-[var(--color-ink)]">
            Profil
          </h1>
        </div>

        {/* Profile card */}
        <div className="card p-5 mb-4">
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center rounded-full bg-[var(--color-green)] shrink-0"
              style={{ width: 64, height: 64 }}
            >
              <span className="text-white text-xl font-[var(--font-serif)] select-none">HP</span>
            </div>
            <div>
              <p className="text-lg font-semibold text-[var(--color-ink)]">HP Träning</p>
              <div className="flex gap-4 mt-2">
                <StatItem value={stats.totalQuestions} label="Frågor" />
                <StatItem value={stats.streak} label="Streak" />
                <StatItem value={stats.sessions} label="Sessioner" />
              </div>
            </div>
          </div>
        </div>

        {/* Goal card */}
        <div className="card-green p-5 mb-6">
          <div className="flex items-start gap-3">
            <CalendarIcon />
            <div className="flex-1">
              <p className="text-base font-semibold text-white">Ditt mål</p>
              {examDate ? (
                <>
                  <p className="text-sm text-white/80 mt-0.5">HP den {formatSwedishDate(examDate)}</p>
                  {daysLeft !== null && (
                    <p className="text-sm text-white/60">{daysLeft > 0 ? `${daysLeft} dagar kvar` : daysLeft === 0 ? 'Provet är idag!' : 'Provet har passerat'}</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-white/70 mt-0.5">Ange ditt provdatum</p>
              )}
              <button
                onClick={() => { setPendingDate(null); setShowDateModal(true) }}
                className="text-xs text-white/60 underline mt-2"
              >
                Ändra datum
              </button>
            </div>
          </div>
        </div>
      </div>

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
                      ? 'bg-[var(--color-green)] text-white border-[var(--color-green)]'
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
                    ? 'bg-[var(--color-green)] text-white border-[var(--color-green)]'
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
