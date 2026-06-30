import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { getDueQuestions, getStats } from '../utils/srs'
import { buildSession, saveSession } from '../utils/session'
import { questions } from '../data/questions'
import type { QuestionType } from '../types'

const TYPE_COLORS: Record<QuestionType, { text: string; bar: string; bg: string; border: string }> = {
  XYZ: { text: 'text-violet-700',  bar: 'bg-violet-500',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
  KVA: { text: 'text-blue-700',    bar: 'bg-blue-500',    bg: 'bg-blue-50',    border: 'border-blue-200'    },
  NOG: { text: 'text-emerald-700', bar: 'bg-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  DTK: { text: 'text-amber-700',   bar: 'bg-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  ORD: { text: 'text-rose-700',    bar: 'bg-rose-500',    bg: 'bg-rose-50',    border: 'border-rose-200'    },
  LAS: { text: 'text-pink-700',    bar: 'bg-pink-500',    bg: 'bg-pink-50',    border: 'border-pink-200'    },
  MEK: { text: 'text-fuchsia-700', bar: 'bg-fuchsia-500', bg: 'bg-fuchsia-50', border: 'border-fuchsia-200' },
  ELF: { text: 'text-purple-700',  bar: 'bg-purple-500',  bg: 'bg-purple-50',  border: 'border-purple-200'  },
}

const DAY_MS = 24 * 60 * 60 * 1000

export default function SrsQueue() {
  const navigate = useNavigate()
  const now = Date.now()
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'alla'>('alla')

  const allIds = useMemo(() => questions.map(q => q.id), [])
  const dueIds = useMemo(() => getDueQuestions(allIds), [])

  const stats = useMemo(() => {
    const seen = allIds.filter(id => getStats(id) !== null)
    const unseen = allIds.length - seen.length

    const byType: Record<QuestionType, { due: number; overdue: number; total: number }> = {
      XYZ: { due: 0, overdue: 0, total: 0 },
      KVA: { due: 0, overdue: 0, total: 0 },
      NOG: { due: 0, overdue: 0, total: 0 },
      DTK: { due: 0, overdue: 0, total: 0 },
      ORD: { due: 0, overdue: 0, total: 0 },
      LAS: { due: 0, overdue: 0, total: 0 },
      MEK: { due: 0, overdue: 0, total: 0 },
      ELF: { due: 0, overdue: 0, total: 0 },
    }

    const upcomingByDay: Record<string, number> = {}
    for (let d = 1; d <= 7; d++) {
      const key = new Date(now + d * DAY_MS).toISOString().slice(0, 10)
      upcomingByDay[key] = 0
    }

    for (const q of questions) {
      const rec = getStats(q.id)
      if (!rec) continue
      const tc = byType[q.type as QuestionType]
      if (!tc) continue

      if (rec.nextReview <= now) {
        tc.due++
        tc.total++
        if (rec.nextReview <= now - DAY_MS) tc.overdue++
      } else {
        tc.total++
        for (let d = 1; d <= 7; d++) {
          const dayStart = new Date(now + d * DAY_MS)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(dayStart.getTime() + DAY_MS)
          if (rec.nextReview >= dayStart.getTime() && rec.nextReview < dayEnd.getTime()) {
            const key = dayStart.toISOString().slice(0, 10)
            upcomingByDay[key] = (upcomingByDay[key] ?? 0) + 1
          }
        }
      }
    }

    const overdueCount = dueIds.filter(id => {
      const rec = getStats(id)
      return rec && rec.nextReview <= now - DAY_MS
    }).length

    const mastered = allIds.filter(id => {
      const rec = getStats(id)
      return rec && rec.interval >= 21
    }).length

    const learning = seen.length - mastered

    return { byType, upcomingByDay, overdueCount, mastered, learning, unseen }
  }, [dueIds.length])

  const dueCount = dueIds.length
  const upcomingEntries = Object.entries(stats.upcomingByDay).filter(([, n]) => n > 0)
  const nextDueLabel = upcomingEntries.length > 0
    ? new Date(upcomingEntries[0][0] + 'T12:00:00').toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="Spaced Repetition" />
      <div className="max-w-lg mx-auto px-5 py-6">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className={`w-1.5 h-1.5 rounded-full bg-amber-500 ${dueCount > 0 ? 'animate-pulse' : ''}`} />
            Spaced Repetition
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Repetitionskö</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">
            {dueCount > 0
              ? `${dueCount} frågor väntar på repetition`
              : 'Inga frågor klara för repetition just nu'}
          </p>
        </div>

        {/* Due now CTA */}
        {dueCount > 0 ? (
          <div className="card rounded-2xl p-6 mb-6 border border-amber-200">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Klart nu</div>
                <div className="text-5xl font-black text-[var(--color-ink)]">{dueCount}</div>
                {stats.overdueCount > 0 && (
                  <div className="text-xs text-red-600 font-bold mt-1">{stats.overdueCount} försenade</div>
                )}
              </div>
              <button
                onClick={() => {
                  const pool = questions.filter(q => dueIds.includes(q.id))
                  const session = buildSession(pool.map(q => q.id), null, true, 'drill', true)
                  saveSession(session)
                  navigate('/session')
                }}
                className="bg-amber-500 hover:bg-amber-400 transition-colors rounded-2xl px-6 py-3.5 font-black text-base text-black shadow-lg shadow-amber-950/40"
              >
                Alla →
              </button>
            </div>

            {/* By type — clickable to start per-type SRS drill */}
            <div className="grid grid-cols-4 gap-2">
              {(Object.entries(stats.byType) as [QuestionType, { due: number }][])
                .filter(([, v]) => v.due > 0)
                .map(([type, v]) => {
                  const tc = TYPE_COLORS[type]
                  const isSelected = typeFilter === type
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(prev => prev === type ? 'alla' : type)}
                      className={`rounded-xl p-2.5 text-center transition-all ${tc.bg} border ${isSelected ? tc.bar.replace('bg-', 'border-') : tc.border}`}
                    >
                      <div className={`text-xs font-black ${tc.text}`}>{type}</div>
                      <div className="text-lg font-black text-[var(--color-ink)]">{v.due}</div>
                    </button>
                  )
                })}
            </div>

            {typeFilter !== 'alla' && (
              <div className="mt-4 flex items-center justify-between gap-3 pt-4 border-t border-[var(--color-card-border)]">
                <div className="text-sm text-[var(--color-ink-muted)]">
                  Öva bara <span className={`font-black ${TYPE_COLORS[typeFilter].text}`}>{typeFilter}</span>
                  {' '}({stats.byType[typeFilter]?.due ?? 0} frågor)
                </div>
                <button
                  onClick={() => {
                    const pool = questions.filter(q => dueIds.includes(q.id) && q.type === typeFilter)
                    if (pool.length === 0) return
                    const session = buildSession(pool.map(q => q.id), null, true, 'drill', true)
                    saveSession(session)
                    navigate('/session')
                  }}
                  className="bg-amber-500 hover:bg-amber-400 transition-colors rounded-xl px-4 py-2 font-black text-sm text-black"
                >
                  Starta {typeFilter} →
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="card rounded-2xl p-8 mb-6 text-center">
            <div className="text-4xl mb-3">↻</div>
            <div className="text-lg font-black text-emerald-700 mb-1">Inget att repetera idag!</div>
            <p className="text-sm text-[var(--color-ink-faint)]">Du är à jour. Kom tillbaka imorgon för fler repetitioner.</p>
            {nextDueLabel && (
              <p className="text-xs text-[var(--color-ink-faint)] mt-2">Nästa repetition: {nextDueLabel}</p>
            )}
          </div>
        )}

        {/* Mastery overview */}
        <div className="card rounded-2xl p-5 mb-4">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Frågebank</div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Ej sedd', value: stats.unseen, color: 'text-[var(--color-ink-muted)]' },
              { label: 'Inlärning', value: stats.learning, color: 'text-amber-600' },
              { label: 'Bemästrad', value: stats.mastered, color: 'text-emerald-700' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center bg-[var(--color-paper-dark)] rounded-xl py-3">
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">{label}</div>
              </div>
            ))}
          </div>
          <div className="flex h-2 rounded-full overflow-hidden">
            <div className="bg-[var(--color-paper-dark)]" style={{ width: `${(stats.unseen / questions.length) * 100}%` }} />
            <div className="bg-amber-500" style={{ width: `${(stats.learning / questions.length) * 100}%` }} />
            <div className="bg-emerald-500" style={{ width: `${(stats.mastered / questions.length) * 100}%` }} />
          </div>
          <div className="text-xs text-[var(--color-ink-faint)] mt-1.5 text-right">{questions.length} frågor totalt</div>
        </div>

        {/* Upcoming 7 days */}
        {upcomingEntries.length > 0 && (
          <div className="card rounded-2xl p-5 mb-4">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Kommande 7 dagar</div>
            <div className="space-y-2">
              {upcomingEntries.map(([dateStr, count]) => {
                const d = new Date(dateStr + 'T12:00:00')
                const label = d.toLocaleDateString('sv-SE', { weekday: 'short', day: 'numeric', month: 'short' })
                const barW = Math.min(100, Math.round((count / Math.max(...upcomingEntries.map(([, n]) => n))) * 100))
                return (
                  <div key={dateStr} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-ink-faint)] w-20 shrink-0 capitalize">{label}</span>
                    <div className="flex-1 h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${barW}%` }} />
                    </div>
                    <span className="text-xs text-[var(--color-ink-faint)] tabular-nums w-6 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Per-type breakdown */}
        <div className="card rounded-2xl p-5">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Fördelning per delprov</div>
          <div className="space-y-3">
            {(Object.entries(stats.byType) as [QuestionType, { due: number; total: number }][])
              .filter(([, v]) => v.total > 0)
              .map(([type, v]) => {
                const tc = TYPE_COLORS[type]
                const pct = Math.round((v.due / v.total) * 100)
                return (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={`font-black ${tc.text}`}>{type}</span>
                      <span className="text-[var(--color-ink-faint)]">{v.due} / {v.total} klara</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${tc.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

      </div>
    </div>
  )
}
