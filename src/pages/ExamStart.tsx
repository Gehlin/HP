import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getExamQuestions, getVerbalExamQuestions, getQuantExamQuestions, exams, SECTION_META, SECTION_ORDER, VERBAL_SECTION_META, VERBAL_SECTION_ORDER, SECTION_SIZES, VERBAL_SECTION_SIZES } from '../data/exams'
import { buildSession, saveSession } from '../utils/session'
import PageHeader from '../components/PageHeader'

const TYPE_COLORS: Record<string, { text: string; border: string; bg: string }> = {
  XYZ: { text: 'text-violet-700',  border: 'border-violet-200',  bg: 'bg-violet-50'  },
  KVA: { text: 'text-blue-700',    border: 'border-blue-200',    bg: 'bg-blue-50'    },
  NOG: { text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  DTK: { text: 'text-amber-700',   border: 'border-amber-200',   bg: 'bg-amber-50'   },
  ORD: { text: 'text-rose-700',    border: 'border-rose-200',    bg: 'bg-rose-50'    },
  LAS: { text: 'text-pink-700',    border: 'border-pink-200',    bg: 'bg-pink-50'    },
  MEK: { text: 'text-fuchsia-700', border: 'border-fuchsia-200', bg: 'bg-fuchsia-50' },
  ELF: { text: 'text-purple-700',  border: 'border-purple-200',  bg: 'bg-purple-50'  },
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
  const isVerbal  = id === 'verbal-random'
  const isQuant   = id === 'quant-random'
  const isFullDay = id === 'full-hp'

  const exam = (!isVerbal && !isQuant && !isFullDay && id !== 'random') ? exams.find(e => e.id === id) ?? null : null
  const qs = isVerbal ? getVerbalExamQuestions() : isQuant ? getQuantExamQuestions() : isFullDay ? [] : getExamQuestions(id)

  const sectionOrder = isVerbal ? VERBAL_SECTION_ORDER : SECTION_ORDER
  const sectionMeta  = isVerbal ? VERBAL_SECTION_META  : SECTION_META
  const rules        = isVerbal ? VERBAL_RULES          : QUANT_RULES

  const sectionCounts = Object.fromEntries(
    sectionOrder.map(type => [type, isFullDay ? 0 : qs.filter(q => q.type === type).length])
  )

  const handleStart = () => {
    setStarting(true)
    if (isFullDay) {
      const verbalQs = getVerbalExamQuestions()
      const groupId = crypto.randomUUID()
      const session = buildSession(verbalQs.map(q => q.id), 55 * 60, false, 'exam')
      saveSession({ ...session, examId: 'full-hp-pass1', fullDayPass: 1, fullDayGroupId: groupId })
    } else {
      const session = buildSession(qs.map(q => q.id), 55 * 60, false, 'exam')
      saveSession({ ...session, examId: id })
    }
    navigate('/session', { replace: true })
  }

  if (isFullDay) {
    const verbalTotal = Object.values(VERBAL_SECTION_SIZES).reduce((a, b) => a + b, 0)
    const quantTotal  = Object.values(SECTION_SIZES).reduce((a, b) => a + b, 0)
    return (
      <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
        <PageHeader title="HP-prov" onBack={() => navigate('/exam-select')} />
        <div className="max-w-lg mx-auto px-5 py-6">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Full HP-simulering
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Full HP-dag</h1>
            <p className="text-[var(--color-ink-faint)] text-sm">{verbalTotal + quantTotal} frågor · 2 provpass · ~110 minuter</p>
          </div>

          {/* Two-pass layout */}
          <div className="space-y-3 mb-8">
            {/* Pass 1 */}
            <div className="card rounded-2xl border border-rose-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-card-border)] flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-rose-600 flex items-center justify-center text-[11px] font-black text-white">1</span>
                <span className="font-bold text-rose-700">Verbalt provpass</span>
                <span className="ml-auto text-xs text-[var(--color-ink-faint)]">55 min</span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[var(--color-card-border)]">
                {VERBAL_SECTION_ORDER.map((type, i) => {
                  const tc = TYPE_COLORS[type]
                  const size = VERBAL_SECTION_SIZES[type as keyof typeof VERBAL_SECTION_SIZES]
                  return (
                    <div key={type} className="p-3 text-center">
                      <div className="text-[10px] font-bold text-[var(--color-ink-faint)] mb-0.5">{i + 1}</div>
                      <div className={`font-black text-sm ${tc.text}`}>{type}</div>
                      <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">{size} fr.</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Break */}
            <div className="flex items-center gap-3 px-2">
              <div className="flex-1 h-px bg-[var(--color-card-border)]" />
              <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                Paus 10–15 min
              </div>
              <div className="flex-1 h-px bg-[var(--color-card-border)]" />
            </div>

            {/* Pass 2 */}
            <div className="card rounded-2xl border border-blue-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--color-card-border)] flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-black text-white">2</span>
                <span className="font-bold text-blue-700">Kvantitativt provpass</span>
                <span className="ml-auto text-xs text-[var(--color-ink-faint)]">55 min</span>
              </div>
              <div className="grid grid-cols-4 divide-x divide-[var(--color-card-border)]">
                {SECTION_ORDER.map((type, i) => {
                  const tc = TYPE_COLORS[type]
                  const size = SECTION_SIZES[type as keyof typeof SECTION_SIZES]
                  return (
                    <div key={type} className="p-3 text-center">
                      <div className="text-[10px] font-bold text-[var(--color-ink-faint)] mb-0.5">{i + 1}</div>
                      <div className={`font-black text-sm ${tc.text}`}>{type}</div>
                      <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">{size} fr.</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Rules */}
          <div className="card rounded-2xl p-5 mb-8">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Instruktioner</div>
            <ul className="space-y-2.5">
              {[
                'Starta med det verbala passet — du väljer själv när du tar paus.',
                'Timern för varje pass är 55 minuter och börjar direkt.',
                'Resultat visas efter varje pass. Starta pass 2 via resultatskärmen.',
                'Inga minuspoäng — gissa hellre än att lämna blankt.',
                'Det kombinerade HP-betyget visas efter pass 2.',
              ].map((rule, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink-muted)]">
                  <span className="text-[var(--color-ink-faint)] shrink-0 mt-0.5 font-bold">{i + 1}.</span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleStart}
            disabled={starting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {starting ? 'Startar…' : 'Starta verbalt pass →'}
          </button>
          <p className="text-center text-xs text-[var(--color-ink-faint)] mt-4">Timern börjar när du trycker på Starta</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="HP-prov" onBack={() => navigate('/exam-select')} />
      <div className="max-w-lg mx-auto px-5 py-6">

        {/* Header */}
        <div className="mb-8">
          <div className={`inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4 ${isVerbal ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isVerbal ? 'bg-rose-500' : 'bg-blue-500'}`} />
            {isVerbal ? 'Verbalt delprov' : isQuant ? 'Kvantitativt delprov' : 'HP-Provsimulering'}
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            {isVerbal ? 'Verbalt delprov' : isQuant ? 'Kvantitativt delprov' : exam ? exam.name : 'Slumpmässigt prov'}
          </h1>
          <p className="text-[var(--color-ink-faint)] text-sm">
            {isVerbal || isQuant ? 'Slumpmässigt urval från frågebanken' : exam ? exam.date : 'Frågor slumpvis valda från hela banken'}
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
                  <span className="text-[10px] font-bold text-[var(--color-ink-faint)]">{i + 1}/{sectionOrder.length}</span>
                  <span className={`font-black text-base ${tc.text}`}>{type}</span>
                </div>
                <div className="text-2xl font-black text-[var(--color-ink)]">{count} <span className="text-sm font-normal text-[var(--color-ink-faint)]">frågor</span></div>
                <div className="text-xs text-[var(--color-ink-faint)] mt-1 leading-snug">{meta.description}</div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-1.5 font-bold">~{meta.recommendedMin} min</div>
              </div>
            )
          })}
        </div>

        {/* Rules */}
        <div className="card rounded-2xl p-5 mb-8">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Instruktioner</div>
          <ul className="space-y-2.5">
            {rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[var(--color-ink-muted)]">
                <span className="text-[var(--color-ink-faint)] shrink-0 mt-0.5 font-bold">{i + 1}.</span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          onClick={handleStart}
          disabled={starting}
          className="btn-primary w-full disabled:opacity-50"
        >
          {starting ? 'Startar…' : 'Starta provet →'}
        </button>

        <p className="text-center text-xs text-[var(--color-ink-faint)] mt-4">
          Timern börjar när du trycker på Starta
        </p>
      </div>
    </div>
  )
}
