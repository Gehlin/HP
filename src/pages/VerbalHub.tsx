import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadHistory, buildSession, saveSession } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { estimateSectionedScore, hpScoreColor } from '../utils/hpScore'
import type { QuestionType } from '../types'

const VERBAL_TYPES: QuestionType[] = ['ORD', 'LAS', 'MEK', 'ELF']

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
  ORD: {
    label: 'ORD',
    desc: 'Ordförståelse',
    color: 'text-rose-400',
    text: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    bar: 'bg-rose-500',
    guideRoute: '/ord-guide',
    guideLabel: 'ORD-guide',
    strategy: 'Bryt ned okända ord: prefix + rot + suffix. Etymologi slår gissning varje gång.',
    timePerQ: '~45s',
    perExam: 10,
  },
  LAS: {
    label: 'LÄS',
    desc: 'Läsförståelse',
    color: 'text-pink-400',
    text: 'text-pink-300',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    bar: 'bg-pink-500',
    guideRoute: '/las-guide',
    guideLabel: 'LÄS-guide',
    strategy: 'Läs första meningen i varje stycke — bygg en karta innan du går till frågorna.',
    timePerQ: '~90s',
    perExam: 10,
  },
  MEK: {
    label: 'MEK',
    desc: 'Meningskomplettering',
    color: 'text-fuchsia-400',
    text: 'text-fuchsia-300',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500/20',
    bar: 'bg-fuchsia-500',
    guideRoute: '/mek-guide',
    guideLabel: 'MEK-guide',
    strategy: 'Identifiera signalordet (trots/eftersom/dels) — det avslöjar relationen.',
    timePerQ: '~50s',
    perExam: 10,
  },
  ELF: {
    label: 'ELF',
    desc: 'Engelsk läsförståelse',
    color: 'text-purple-400',
    text: 'text-purple-300',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    bar: 'bg-purple-500',
    guideRoute: '/elf-guide',
    guideLabel: 'ELF-guide',
    strategy: 'Läs frågan först, lokalisera sedan rätt stycke — undvik att läsa om hela texten.',
    timePerQ: '~90s',
    perExam: 10,
  },
}

export default function VerbalHub() {
  const navigate = useNavigate()

  const allIds = useMemo(() => questions.map(q => q.id), [])
  const dueIds = useMemo(() => getDueQuestions(allIds), [])

  const typeStats = useMemo(() => {
    const history = loadHistory()
    const acc: Record<string, { correct: number; total: number }> = {
      ORD: { correct: 0, total: 0 },
      LAS: { correct: 0, total: 0 },
      MEK: { correct: 0, total: 0 },
      ELF: { correct: 0, total: 0 },
    }
    for (const session of history) {
      for (const qid of session.questionIds) {
        const q = questions.find(x => x.id === qid)
        if (!q || !VERBAL_TYPES.includes(q.type as QuestionType)) continue
        const ans = session.answers[qid]
        if (!ans) continue
        acc[q.type].total++
        if (ans === q.answer) acc[q.type].correct++
      }
    }
    return acc
  }, [])

  const dueByType = useMemo(() => {
    const counts: Record<string, number> = { ORD: 0, LAS: 0, MEK: 0, ELF: 0 }
    for (const id of dueIds) {
      const q = questions.find(x => x.id === id)
      if (q && VERBAL_TYPES.includes(q.type as QuestionType)) counts[q.type]++
    }
    return counts
  }, [dueIds])

  const questionCounts = useMemo(() => {
    const c: Record<string, number> = { ORD: 0, LAS: 0, MEK: 0, ELF: 0 }
    for (const q of questions) {
      if (VERBAL_TYPES.includes(q.type as QuestionType)) c[q.type]++
    }
    return c
  }, [])

  const verbalScore = useMemo(() => {
    const byType: Record<QuestionType, { correct: number; total: number }> = {
      XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
      NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
      ORD: typeStats.ORD, LAS: typeStats.LAS,
      MEK: typeStats.MEK, ELF: typeStats.ELF,
    }
    return estimateSectionedScore(byType).verbal
  }, [typeStats])

  const totalVerbalDue = VERBAL_TYPES.reduce((s, t) => s + (dueByType[t] ?? 0), 0)
  const totalVerbalAnswered = VERBAL_TYPES.reduce((s, t) => s + typeStats[t].total, 0)

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
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
            Verbalt delprov
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">Verbal träning</h1>
          <p className="text-slate-500 text-sm">ORD · LÄS · MEK · ELF — din verbala del av HP</p>
        </div>

        {/* HP Score card */}
        <div className="glass rounded-2xl p-5 mb-4 border border-rose-500/10">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Verbalt HP-estimat</div>
              {verbalScore !== null ? (
                <>
                  <div className={`text-4xl font-black ${hpScoreColor(verbalScore)}`}>{verbalScore.toFixed(2)}</div>
                  <div className="text-xs text-slate-500 mt-1">Baserat på {totalVerbalAnswered} besvarade frågor</div>
                </>
              ) : (
                <>
                  <div className="text-4xl font-black text-slate-600">—</div>
                  <div className="text-xs text-slate-500 mt-1">Öva minst 5 verbala frågor för estimat</div>
                </>
              )}
            </div>
            <div className="text-right">
              {totalVerbalDue > 0 && (
                <div className="flex items-center gap-1.5 justify-end mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-xs text-amber-300 font-bold">{totalVerbalDue} att repetera</span>
                </div>
              )}
              <button
                onClick={() => navigate('/practice?section=verbal')}
                className="bg-rose-700 hover:bg-rose-600 transition-colors rounded-xl px-5 py-2.5 font-bold text-sm"
              >
                Öva verbalt →
              </button>
            </div>
          </div>
        </div>

        {/* Per-type cards */}
        <div className="space-y-3 mb-6">
          {VERBAL_TYPES.map(type => {
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
                <button
                  onClick={() => navigate(meta.guideRoute)}
                  className="w-full flex items-center justify-between px-4 py-2.5 border-t border-white/[0.04] text-xs text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] transition-colors"
                >
                  <span>Öppna {meta.guideLabel}</span>
                  <span>→</span>
                </button>
              </div>
            )
          })}
        </div>

        {/* ORD Builder */}
        <div className="glass rounded-2xl p-5 mb-4 border border-rose-500/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Vokabulärbyggaren</div>
              <div className="font-black text-base text-white mb-0.5">Ordbyggaren</div>
              <div className="text-slate-500 text-xs">Lär dig HP:s ordförråd med flashcards och egenbedömning</div>
            </div>
            <button
              onClick={() => navigate('/ord-builder')}
              className="shrink-0 bg-rose-700 hover:bg-rose-600 transition-colors rounded-xl px-4 py-2.5 font-bold text-sm"
            >
              Öppna →
            </button>
          </div>
        </div>

        {/* Full verbal session */}
        <div className="glass rounded-2xl p-5 border border-white/[0.05]">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Simulera verbalt provpass</div>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            Öva ett komplett verbalt provpass — ORD → LÄS → MEK → ELF i ordning, som på det riktiga provet.
          </p>
          <button
            onClick={() => navigate('/exam/verbal-random')}
            className="w-full bg-rose-700 hover:bg-rose-600 transition-colors rounded-xl py-3 font-bold text-sm"
          >
            Starta verbalt provpass →
          </button>
        </div>

      </div>
    </div>
  )
}
