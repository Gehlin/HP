import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getExamQuestions, getVerbalExamQuestions, exams, SECTION_META, SECTION_ORDER, VERBAL_SECTION_META, VERBAL_SECTION_ORDER } from '../data/exams'
import { buildSession, saveSession } from '../utils/session'

const TYPE_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  XYZ: { text: 'text-violet-400',  border: 'border-violet-500/25',  bg: 'bg-violet-500/8'  },
  KVA: { text: 'text-blue-400',    border: 'border-blue-500/25',    bg: 'bg-blue-500/8'    },
  NOG: { text: 'text-emerald-400', border: 'border-emerald-500/25', bg: 'bg-emerald-500/8' },
  DTK: { text: 'text-amber-400',   border: 'border-amber-500/25',   bg: 'bg-amber-500/8'   },
  ORD: { text: 'text-rose-400',    border: 'border-rose-500/25',    bg: 'bg-rose-500/8'    },
  LAS: { text: 'text-pink-400',    border: 'border-pink-500/25',    bg: 'bg-pink-500/8'    },
  MEK: { text: 'text-fuchsia-400', border: 'border-fuchsia-500/25', bg: 'bg-fuchsia-500/8' },
  ELF: { text: 'text-purple-400',  border: 'border-purple-500/25',  bg: 'bg-purple-500/8'  },
}

const QUANT_RULES = [
  'Fyra avsnitt i ordning: XYZ → KVA → NOG → DTK',
  'Totaltid: 55 minuter för hela provet',
  'Du kan inte återgå till ett avslutat avsnitt',
  'Svar utan förklaring — genomgång visas efter provet',
  'Markera osäkra frågor med flaggan för att notera dem',
  'Inga minuspoäng — gissa hellre än att lämna blankt',
]

const VERBAL_RULES = [
  'Fyra avsnitt i ordning: ORD → LÄS → MEK → ELF',
  'Totaltid: 55 minuter för hela provet',
  'Du kan inte återgå till ett avslutat avsnitt',
  'Svar utan förklaring — genomgång visas efter provet',
  'LÄS och ELF: läs texten noga, hitta textbevis',
  'Inga minuspoäng — gissa hellre än att lämna blankt',
]

export default function ExamStart() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const [starting, setStarting] = useState(false)

  const id = examId ?? 'random'
  const isVerbal = id === 'verbal-random'

  const exam = (!isVerbal && id !== 'random') ? exams.find(e => e.id === id) ?? null : null
  const qs = isVerbal ? getVerbalExamQuestions() : getExamQuestions(id)

  const sectionOrder = isVerbal ? VERBAL_SECTION_ORDER : SECTION_ORDER
  const sectionMeta  = isVerbal ? VERBAL_SECTION_META  : SECTION_META
  const rules        = isVerbal ? VERBAL_RULES          : QUANT_RULES

  const sectionCounts = Object.fromEntries(
    sectionOrder.map(type => [type, qs.filter(q => q.type === type).length])
  )

  const handleStart = () => {
    setStarting(true)
    const session = buildSession(qs.map(q => q.id), 55 * 60, false, 'exam')
    saveSession({ ...session, examId: id })
    navigate('/session', { replace: true })
  }

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-lg mx-auto px-5 py-10 pb-24">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 text-sm mb-8 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Tillbaka
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4 ${isVerbal ? 'bg-rose-500/10 border border-rose-500/20 text-rose-300' : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isVerbal ? 'bg-rose-400' : 'bg-blue-400'}`} />
            {isVerbal ? 'Verbalt delprov' : 'HP-Provsimulering'}
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            {isVerbal ? 'Verbalt delprov' : exam ? exam.name : 'Slumpmässigt prov'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isVerbal ? 'Slumpmässigt urval från frågebanken' : exam ? exam.date : 'Frågor slumpvis valda från hela banken'}
            {' · '}{qs.length} frågor · 55 minuter
          </p>
        </div>

        {/* Section breakdown */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {sectionOrder.map((type, i) => {
            const meta = sectionMeta[type]
            const count = sectionCounts[type] ?? 0
            const tc = TYPE_COLORS[type]
            return (
              <div key={type} className={`rounded-xl p-4 border ${tc.border} ${tc.bg}`}>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[10px] font-bold text-slate-600">{i + 1}/{sectionOrder.length}</span>
                  <span className={`font-black text-base ${tc.text}`}>{type}</span>
                </div>
                <div className="text-2xl font-black text-white">{count} <span className="text-sm font-normal text-slate-500">frågor</span></div>
                <div className="text-xs text-slate-500 mt-1 leading-snug">{meta.description}</div>
                <div className="text-[10px] text-slate-600 mt-1.5 font-bold">~{meta.recommendedMin} min</div>
              </div>
            )
          })}
        </div>

        {/* Rules */}
        <div className="glass rounded-2xl p-5 mb-8">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Instruktioner</div>
          <ul className="space-y-2.5">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
                <span className="text-slate-700 shrink-0 mt-0.5 font-bold">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={starting}
          className={`w-full disabled:opacity-50 transition-colors rounded-2xl py-4 font-black text-base shadow-lg ${isVerbal ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-950/50'}`}
        >
          {starting ? 'Startar…' : 'Starta provet →'}
        </button>

        <p className="text-center text-xs text-slate-600 mt-4">
          Timern börjar när du trycker på Starta
        </p>
      </div>
    </div>
  )
}
