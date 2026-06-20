import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
    color: 'text-violet-400',
    text: 'text-violet-300',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    bar: 'bg-violet-500',
    guideRoute: '/xyz-guide',
    guideLabel: 'XYZ-guide',
    strategy: 'Rita alltid en figur vid geometri. Fastnar du efter 60s? Gissa och gå vidare — ingen minuspoäng.',
    timePerQ: '~60s',
    perExam: 12,
  },
  KVA: {
    label: 'KVA',
    desc: 'Kvantitativa jämförelser',
    color: 'text-blue-400',
    text: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    bar: 'bg-blue-500',
    guideRoute: '/kva-guide',
    guideLabel: 'KVA-guide',
    strategy: 'Testa extremvärden (x=0, x=1, x=−1) istället för att räkna exakt. Välj D om ett motexempel hittas.',
    timePerQ: '~60s',
    perExam: 10,
  },
  NOG: {
    label: 'NOG',
    desc: 'Datainsamling',
    color: 'text-emerald-400',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    bar: 'bg-emerald-500',
    guideRoute: '/nog-guide',
    guideLabel: 'NOG-guide',
    strategy: 'Du behöver INTE lösa — bara avgöra om det GÅR. Testa varje påstående separat innan du kombinerar.',
    timePerQ: '~100s',
    perExam: 6,
  },
  DTK: {
    label: 'DTK',
    desc: 'Diagram, tabeller & kartor',
    color: 'text-amber-400',
    text: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    bar: 'bg-amber-500',
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
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-lg mx-auto px-4 py-10 pb-24">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Tillbaka
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Kvantitativt delprov
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Kvantitativ träning</h1>
          <p className="text-slate-500 text-sm">XYZ · KVA · NOG · DTK — din kvantitativa del av HP</p>
        </div>

        {/* HP Score card */}
        <div className="glass rounded-2xl p-5 mb-4 border border-blue-500/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Kvantitativt HP-estimat</div>
              {quantScore !== null ? (
                <>
                  <div className={`text-4xl font-black ${hpScoreColor(quantScore)}`}>{quantScore.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 mt-1">Baserat på {totalQuantAnswered} besvarade frågor</div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-black text-slate-600">—</div>
                  <div className="text-xs text-slate-500 mt-1">Öva minst 5 kvantitativa frågor för estimat</div>
                </>
              )}
            </div>
            <div className="text-right">
              {totalQuantDue > 0 && (
                <div className="flex items-center gap-1.5 justify-end mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-amber-300 font-bold">{totalQuantDue} att repetera</span>
                </div>
              )}
              <button
                onClick={() => navigate('/practice?section=quant')}
                className="bg-blue-700 hover:bg-blue-600 transition-colors rounded-xl px-5 py-2.5 font-bold text-sm"
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
              <div key={type} className={`glass rounded-2xl border ${meta.border} overflow-hidden`}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-lg font-black ${meta.color}`}>{meta.label}</span>
                        <span className="text-slate-500 text-sm">{meta.desc}</span>
                      </div>
                      <div className="text-xs text-slate-600">{meta.perExam} frågor/prov · {meta.timePerQ}/fråga · {bankSize} i banken</div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {due > 0 && (
                        <button
                          onClick={() => startSrs(type)}
                          className="text-xs font-bold px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 transition-colors"
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
                        <span className="text-slate-600">{acc.total} svar</span>
                        <span className={`font-bold ${pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-1.5 bg-white/[0.04] rounded-full mb-2" />
                  )}

                  {/* Strategy tip */}
                  <div className={`text-[11px] ${meta.color} opacity-70 leading-snug`}>{meta.strategy}</div>
                </div>

                {/* Guide link */}
                {meta.guideRoute && (
                  <button
                    onClick={() => navigate(meta.guideRoute)}
                    className="w-full flex items-center justify-between px-4 py-2.5 border-t border-white/[0.04] text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-colors"
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
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Simulera kvantitativt provpass</div>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            Öva ett komplett kvantitativt provpass — XYZ → KVA → NOG → DTK i ordning, som på det riktiga provet.
          </p>
          <button
            onClick={() => navigate('/exam/quant-random')}
            className="w-full bg-blue-700 hover:bg-blue-600 transition-colors rounded-xl py-3 font-bold text-sm"
          >
            Starta kvantitativt provpass →
          </button>
        </div>

      </div>
    </div>
  )
}
