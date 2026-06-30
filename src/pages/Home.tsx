import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadStats, type GameStats } from '../utils/gamification'
import { loadHistory, loadSession, saveSession } from '../utils/session'
import { getExamDate, daysUntilExam } from '../utils/examDate'
import { computeReadiness } from '../utils/readiness'
import type { ExamSession } from '../types'

const TYPE_ACCENTS: Record<string, { color: string; ring: string; bg: string }> = {
  XYZ: { color: 'var(--color-terracotta)', ring: 'var(--color-terracotta)', bg: 'var(--color-terracotta-muted)' },
  KVA: { color: 'var(--color-terracotta)', ring: 'var(--color-terracotta)', bg: 'var(--color-terracotta-muted)' },
  NOG: { color: 'var(--color-terracotta)', ring: 'var(--color-terracotta)', bg: 'var(--color-terracotta-muted)' },
  DTK: { color: 'var(--color-gold-deep)', ring: 'var(--color-gold-deep)', bg: 'var(--color-gold-muted)' },
  ORD: { color: 'var(--color-green)', ring: 'var(--color-green)', bg: 'var(--color-green-muted)' },
  LAS: { color: 'var(--color-green)', ring: 'var(--color-green)', bg: 'var(--color-green-muted)' },
  MEK: { color: 'var(--color-green)', ring: 'var(--color-green)', bg: 'var(--color-green-muted)' },
  ELF: { color: 'var(--color-green)', ring: 'var(--color-green)', bg: 'var(--color-green-muted)' },
}

export default function Home() {
  const navigate = useNavigate()
  const byType = {
    XYZ: questions.filter(q => q.type === 'XYZ').length,
    KVA: questions.filter(q => q.type === 'KVA').length,
    NOG: questions.filter(q => q.type === 'NOG').length,
    DTK: questions.filter(q => q.type === 'DTK').length,
    ORD: questions.filter(q => q.type === 'ORD').length,
    LAS: questions.filter(q => q.type === 'LAS').length,
    MEK: questions.filter(q => q.type === 'MEK').length,
    ELF: questions.filter(q => q.type === 'ELF').length,
  }

  const [stats, setStats] = useState<GameStats | null>(null)
  const [resumeSession, setResumeSession] = useState<ExamSession | null>(null)
  const [examDate, setExamDateState] = useState<Date | null>(null)
  const [readiness, setReadiness] = useState<ReturnType<typeof computeReadiness> | null>(null)
  const [totalCorrect, setTotalCorrect] = useState(0)
  const [typeAccuracy, setTypeAccuracy] = useState<Record<string, { correct: number; total: number }>>({})
  const [hasHistory, setHasHistory] = useState(false)

  useEffect(() => {
    setStats(loadStats())

    const session = loadSession()
    if (session && !session.endTime) setResumeSession(session)

    setExamDateState(getExamDate())
    setReadiness(computeReadiness())

    const history = loadHistory()
    setHasHistory(history.length > 0)
    const fullTypeAcc: Record<string, { correct: number; total: number }> = {
      XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
      NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
      ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
      MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
    }
    let tc = 0
    history.forEach(sess => {
      sess.questionIds.forEach(id => {
        const q = questions.find(x => x.id === id)
        if (!q || !sess.answers[id]) return
        fullTypeAcc[q.type].total++
        if (sess.answers[id] === q.answer) {
          tc++
          fullTypeAcc[q.type].correct++
        }
      })
    })
    setTotalCorrect(tc)
    setTypeAccuracy(fullTypeAcc)
  }, [])

  const days = examDate ? daysUntilExam() : null

  const heroScorePct = Math.min(100, Math.max(0, (readiness?.score ?? 0) / 2.0))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'God morgon' : hour < 17 ? 'God dag' : 'God kväll'

  return (
    <div className="min-h-screen bg-app pb-8 pt-topnav">
      {/* ── Header ────────────────────────────────────────── */}
      <div className="px-4 pt-6 pb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-[var(--font-serif)] text-[var(--color-ink)]">{greeting}</h1>
          {stats && <span className="streak-pill">🔥 {stats.streak}</span>}
        </div>
        <p className="text-sm text-[var(--color-ink-faint)]">
          {new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4">

        {/* ── CTA hero ──────────────────────────────────────── */}
        <button
          onClick={() => navigate('/practice')}
          className="w-full btn-primary py-4 text-base font-bold mb-4 rounded-2xl"
        >
          Starta träning →
        </button>

        {/* ── Exam date prompt ──────────────────────────────── */}
        {hasHistory && !examDate && (
          <button
            onClick={() => navigate('/profil')}
            className="w-full card p-4 mb-4 text-left flex items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/5"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)]">Ange ditt provdatum</div>
              <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">Se nedräkning och anpassa träningsplanen</div>
            </div>
            <span className="text-amber-600 text-lg shrink-0">→</span>
          </button>
        )}

        {/* ── Welcome / first-use empty state ──────────────── */}
        {!hasHistory && (
          <div className="card p-5 mb-4 border-l-4 border-l-[var(--color-green)]">
            <div className="text-sm font-bold text-[var(--color-ink)] mb-1">Välkommen! Kom igång nu.</div>
            <p className="text-xs text-[var(--color-ink-faint)] mb-3 leading-relaxed">
              Du har inte tränat än. Starta ett pass för att se dina framsteg här.
            </p>
            <button onClick={() => navigate('/practice')} className="btn-primary text-sm py-2 px-4">
              Starta ditt första pass →
            </button>
          </div>
        )}

        {/* ── Hero score card ───────────────────────────────── */}
        <div className="card-green mb-4" style={{ borderRadius: 22, padding: 20 }}>
          <p
            className="text-[10px] font-bold uppercase tracking-[0.16em] mb-1"
            style={{ color: 'var(--color-green-tint)' }}
          >
            Uppskattat HP-poäng
          </p>
          <div className="text-5xl font-[var(--font-serif)] text-[var(--color-cream)] leading-none mb-4">
            {readiness?.score ?? 0}
          </div>
          <div className="h-1.5 rounded-full mb-4" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${heroScorePct}%`, background: 'var(--color-gold)' }}
            />
          </div>
          <div className="flex gap-5">
            <div>
              <div className="text-base text-[var(--color-cream)] font-semibold">{totalCorrect}</div>
              <div className="text-xs text-[var(--color-cream)]/60">Rätt totalt</div>
            </div>
            <div>
              <div className="text-base text-[var(--color-cream)] font-semibold">{stats?.streak ?? '–'}</div>
              <div className="text-xs text-[var(--color-cream)]/60">Streak</div>
            </div>
            <div>
              <div className="text-base text-[var(--color-cream)] font-semibold">{days ?? '–'}</div>
              <div className="text-xs text-[var(--color-cream)]/60">Dagar kvar till HP</div>
            </div>
          </div>
        </div>

        {/* ── Fortsätt card ─────────────────────────────────── */}
        {resumeSession && (() => {
          const answered = Object.keys(resumeSession.answers).length
          const tot = resumeSession.questionIds.length
          const remaining = tot - answered
          const sessionType = resumeSession.type === 'exam' ? 'HP-prov' : resumeSession.studyMode ? 'Studieläge' : 'Övning'
          return (
            <div className="card p-4 mb-4 flex items-center justify-between gap-4" style={{ borderRadius: 18 }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-faint)] font-semibold mb-1">
                  Fortsätt där du slutade
                </div>
                <div className="text-base font-semibold text-[var(--color-ink)]">
                  {sessionType} · {remaining} frågor kvar
                </div>
              </div>
              <button
                onClick={() => { saveSession({ ...resumeSession, endTime: undefined }); navigate('/session') }}
                className="btn-primary shrink-0"
              >
                Fortsätt
              </button>
            </div>
          )
        })()}

        {/* ── Section grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(Object.keys(TYPE_ACCENTS) as string[]).map(type => {
            const accent = TYPE_ACCENTS[type]
            const acc = typeAccuracy[type]
            const pct = acc && acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : 0
            const count = byType[type as keyof typeof byType] ?? 0
            return (
              <button
                key={type}
                onClick={() => navigate('/practice', { state: { defaultType: type } })}
                className="card p-4 text-left"
                style={{ backgroundColor: accent.bg }}
              >
                <div className="flex items-start gap-3 mb-1">
                  <div
                    className="shrink-0"
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: `conic-gradient(${accent.ring} ${pct}%, var(--color-track) 0)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 23, height: 23, borderRadius: '50%',
                        background: 'var(--color-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        font: '700 9px/1 var(--font-sans)',
                        color: 'var(--color-ink)',
                      }}
                    >
                      {pct}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="text-sm font-semibold text-[var(--color-ink)]">{type}</div>
                    <div className="text-xs text-[var(--color-ink-faint)]">{pct}% rätt</div>
                    <div className="text-xs text-[var(--color-ink-faint)]">{count} frågor</div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

      </div>
    </div>
  )
}
