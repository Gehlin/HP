import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { questions } from '../data/questions'
import { loadHistory, buildSession, saveSession } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { estimateSectionedScore, hpScoreColor } from '../utils/hpScore'
import type { QuestionType } from '../types'

const QUANT_TYPES: QuestionType[] = ['XYZ', 'KVA', 'NOG', 'DTK']

const TYPE_META: Record<string, {
  label: string
  desc: string
  color: string
  text: string
  bg: string
  border: string
  bar: string
  guideRoute: string
  guideLabel: string
  strategy: string
  timePerQ: string
  perExam: number
}> = {
  XYZ: {
    label: 'XYZ',
    desc: 'Matematisk problemlösning',
    color: 'text-[var(--color-terracotta)]',
    text: 'text-[var(--color-terracotta)]',
    bg: 'bg-[var(--color-terracotta-muted)]',
    border: 'border-[var(--color-card-border)]',
    bar: 'bg-[var(--color-terracotta)]',
    guideRoute: '/xyz-guide',
    guideLabel: 'XYZ-guide',
    strategy: 'Rita alltid en figur vid geometri. Fastnar du efter 60s? Gissa och gå vidare — ingen minuspoäng.',
    timePerQ: '~60s',
    perExam: 12,
  },
  KVA: {
    label: 'KVA',
    desc: 'Kvantitativa jämförelser',
    color: 'text-[var(--color-terracotta)]',
    text: 'text-[var(--color-terracotta)]',
    bg: 'bg-[var(--color-terracotta-muted)]',
    border: 'border-[var(--color-card-border)]',
    bar: 'bg-[var(--color-terracotta)]',
    guideRoute: '/kva-guide',
    guideLabel: 'KVA-guide',
    strategy: 'Testa extremvärden (x=0, x=1, x=−1) istället för att räkna exakt. Välj D om ett motexempel hittas.',
    timePerQ: '~60s',
    perExam: 10,
  },
  NOG: {
    label: 'NOG',
    desc: 'Datainsamling',
    color: 'text-[var(--color-terracotta)]',
    text: 'text-[var(--color-terracotta)]',
    bg: 'bg-[var(--color-terracotta-muted)]',
    border: 'border-[var(--color-card-border)]',
    bar: 'bg-[var(--color-terracotta)]',
    guideRoute: '/nog-guide',
    guideLabel: 'NOG-guide',
    strategy: 'Du behöver INTE lösa — bara avgöra om det GÅR. Testa varje påstående separat innan du kombinerar.',
    timePerQ: '~100s',
    perExam: 6,
  },
  DTK: {
    label: 'DTK',
    desc: 'Diagram, tabeller & kartor',
    color: 'text-[var(--color-terracotta)]',
    text: 'text-[var(--color-terracotta)]',
    bg: 'bg-[var(--color-terracotta-muted)]',
    border: 'border-[var(--color-card-border)]',
    bar: 'bg-[var(--color-terracotta)]',
    guideRoute: '/dtk-guide',
    guideLabel: 'DTK-guide',
    strategy: 'Läs axlarnas enheter och rubriken FÖRST. Besvara exakt vad som frågas — inte det du tror frågas.',
    timePerQ: '~115s',
    perExam: 12,
  },
}

export default function QuantHub() {
  const navigate = useNavigate()

  const allIds = useMemo(() => questions.map(q => q.id), [])
  const dueIds = useMemo(() => getDueQuestions(allIds), [])

  const typeStats = useMemo(() => {
    const history = loadHistory()
    const acc: Record<string, { correct: number; total: number }> = {
      XYZ: { correct: 0, total: 0 },
      KVA: { correct: 0, total: 0 },
      NOG: { correct: 0, total: 0 },
      DTK: { correct: 0, total: 0 },
    }
    for (const session of history) {
      for (const qid of session.questionIds) {
        const q = questions.find(x => x.id === qid)
        if (!q || !QUANT_TYPES.includes(q.type as QuestionType)) continue
        const ans = session.answers[qid]
        if (!ans) continue
        acc[q.type].total++
        if (ans === q.answer) acc[q.type].correct++
      }
    }
    return acc
  }, [])

  const dueByType = useMemo(() => {
    const counts: Record<string, number> = { XYZ: 0, KVA: 0, NOG: 0, DTK: 0 }
    for (const id of dueIds) {
      const q = questions.find(x => x.id === id)
      if (q && QUANT_TYPES.includes(q.type as QuestionType)) counts[q.type]++
    }
    return counts
  }, [dueIds])

  const questionCounts = useMemo(() => {
    const c: Record<string, number> = { XYZ: 0, KVA: 0, NOG: 0, DTK: 0 }
    for (const q of questions) {
      if (QUANT_TYPES.includes(q.type as QuestionType)) c[q.type]++
    }
    return c
  }, [])

  const quantScore = useMemo(() => {
    const byType: Record<QuestionType, { correct: number; total: number }> = {
      XYZ: typeStats.XYZ, KVA: typeStats.KVA,
      NOG: typeStats.NOG, DTK: typeStats.DTK,
      ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
      MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
    }
    return estimateSectionedScore(byType).quant
  }, [typeStats])

  const totalQuantDue = QUANT_TYPES.reduce((s, t) => s + (dueByType[t] ?? 0), 0)
  const totalQuantAnswered = QUANT_TYPES.reduce((s, t) => s + typeStats[t].total, 0)

  const startDrill = (type: QuestionType) => {
    const pool = questions.filter(q => q.type === type)
    const session = buildSession(pool.map(q => q.id), null, true, 'drill')
    saveSession(session)
    navigate('/session')
  }

  const startSrs = (type: QuestionType) => {
    const pool = questions.filter(q => dueIds.includes(q.id) && q.type === type)
    if (pool.length === 0) return
    const session = buildSession(pool.map(q => q.id), null, true, 'drill', true)
    saveSession(session)
    navigate('/session')
  }

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="Kvantitativt" onBack={() => navigate('/practice')} />
      <div className="max-w-lg mx-auto px-4 py-10 pb-24">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[var(--color-terracotta-muted)] border border-[var(--color-terracotta)] text-[var(--color-terracotta)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-terracotta)] animate-pulse" />
            Kvantitativt delprov
          </div>
          <h1 className="text-3xl font-[var(--font-serif)] tracking-tight text-[var(--color-ink)] mb-1">Kvantitativ träning</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">XYZ · KVA · NOG · DTK — din kvantitativa del av HP</p>
        </div>

        {/* HP Score card */}
        <div className="card rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Kvantitativt HP-estimat</div>
              {quantScore !== null ? (
                <>
                  <div className={`text-4xl font-black ${hpScoreColor(quantScore)}`}>{quantScore.toFixed(2)}</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Baserat på {totalQuantAnswered} besvarade frågor</div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-black text-[var(--color-ink-faint)]">—</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Öva minst 5 kvantitativa frågor för estimat</div>
                </>
              )}
            </div>
            <div className="text-right">
              {totalQuantDue > 0 && (
                <div className="flex items-center gap-1.5 justify-end mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] animate-pulse" />
                  <span className="text-xs text-[var(--color-gold-deep)] font-bold">{totalQuantDue} att repetera</span>
                </div>
              )}
              <button
                onClick={() => navigate('/practice?section=quant')}
                className="btn-primary px-5 py-2.5 text-sm"
              >
                Öva kvantitativt →
              </button>
            </div>
          </div>
        </div>

        {/* Per-type cards */}
        <div className="space-y-3 mb-6">
          {QUANT_TYPES.map(type => {
            const meta = TYPE_META[type]
            const acc = typeStats[type]
            const pct = acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : null
            const due = dueByType[type] ?? 0
            const bankSize = questionCounts[type] ?? 0

            return (
              <div key={type} className={`bg-[var(--color-card)] rounded-2xl border ${meta.border} overflow-hidden`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-lg font-black ${meta.color}`}>{meta.label}</span>
                        <span className="text-[var(--color-ink-faint)] text-sm">{meta.desc}</span>
                      </div>
                      <div className="text-xs text-[var(--color-ink-faint)]">{meta.perExam} frågor/prov · {meta.timePerQ}/fråga · {bankSize} i banken</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {due > 0 && (
                        <button
                          onClick={() => startSrs(type)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-[var(--color-gold-muted)] border border-[var(--color-hairline)] text-[var(--color-gold-deep)] hover:opacity-80 transition-opacity"
                        >
                          ↻ {due}
                        </button>
                      )}
                      <button
                        onClick={() => startDrill(type)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg ${meta.bg} border ${meta.border} ${meta.text} hover:opacity-80 transition-opacity`}
                      >
                        Öva →
                      </button>
                    </div>
                  </div>

                  {/* Accuracy bar */}
                  {pct !== null ? (
                    <div className="mb-2">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[var(--color-ink-faint)]">{acc.total} svar</span>
                        <span className={`font-bold ${pct >= 70 ? 'text-[var(--color-green)]' : pct >= 50 ? 'text-[var(--color-gold-deep)]' : 'text-[var(--color-terracotta)]'}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-[var(--color-green-light)]' : pct >= 50 ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-terracotta)]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-1.5 bg-[var(--color-paper-dark)] rounded-full mb-2" />
                  )}

                  {/* Strategy tip */}
                  <div className={`text-[11px] ${meta.color} opacity-70 leading-snug`}>{meta.strategy}</div>
                </div>

                {/* Guide link */}
                {meta.guideRoute && (
                  <button
                    onClick={() => navigate(meta.guideRoute)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border-t border-[var(--color-card-border)] text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-dark)] transition-colors"
                  >
                    <span>Öppna {meta.guideLabel}</span>
                    <span>→</span>
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Full quant session */}
        <div className="card rounded-2xl p-5">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Simulera kvantitativt provpass</div>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4 leading-relaxed">
            Öva ett komplett kvantitativt provpass — XYZ → KVA → NOG → DTK i ordning, som på det riktiga provet.
          </p>
          <button
            onClick={() => navigate('/exam/quant-random')}
            className="btn-primary w-full"
          >
            Starta kvantitativt provpass →
          </button>
        </div>

      </div>
    </div>
  )
}
