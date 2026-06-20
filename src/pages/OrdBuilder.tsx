import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'

const STORAGE_KEY = 'hp_ord_known'

function loadKnown(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

function saveKnown(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

type Mode = 'menu' | 'study' | 'done'
type Filter = 'all' | 'unknown' | 'known'

export default function OrdBuilder() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('menu')
  const [filter, setFilter] = useState<Filter>('all')
  const [known, setKnown] = useState<Set<string>>(loadKnown)
  const [cardIndex, setCardIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [sessionResults, setSessionResults] = useState<{ known: number; unknown: number }>({ known: 0, unknown: 0 })

  const ordQuestions = useMemo(() =>
    questions.filter(q => q.type === 'ORD')
  , [])

  const deck = useMemo(() => {
    const pool = filter === 'known'
      ? ordQuestions.filter(q => known.has(q.id))
      : filter === 'unknown'
      ? ordQuestions.filter(q => !known.has(q.id))
      : ordQuestions
    return [...pool].sort(() => Math.random() - 0.5)
  }, [filter, known, ordQuestions])

  const currentCard = deck[cardIndex]

  const wordFrom = (q: (typeof ordQuestions)[number]) => {
    const m = q.text.match(/som ([A-ZÅÄÖ]+)\?/)
    return m ? m[1] : q.text
  }

  const handleStart = () => {
    setCardIndex(0)
    setRevealed(false)
    setSessionResults({ known: 0, unknown: 0 })
    setMode('study')
  }

  const handleMark = useCallback((isKnown: boolean) => {
    const id = currentCard.id
    const next = new Set(known)
    isKnown ? next.add(id) : next.delete(id)
    setKnown(next)
    saveKnown(next)
    setSessionResults(r => isKnown ? { ...r, known: r.known + 1 } : { ...r, unknown: r.unknown + 1 })

    if (cardIndex + 1 >= deck.length) {
      setMode('done')
    } else {
      setCardIndex(i => i + 1)
      setRevealed(false)
    }
  }, [known, currentCard, cardIndex, deck.length])

  const knownCount = ordQuestions.filter(q => known.has(q.id)).length
  const pct = Math.round((knownCount / ordQuestions.length) * 100)

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-app text-white">
        <div className="max-w-lg mx-auto px-4 py-10 pb-24">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 text-sm mb-8 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Tillbaka
          </button>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              ORD · Ordförståelse
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-1">Ordbyggaren</h1>
            <p className="text-slate-500 text-sm">Lär dig synonymerna på HP:s ordförståelsedel med flashcards.</p>
          </div>

          {/* Progress */}
          <div className="glass rounded-2xl p-5 mb-6 border border-rose-500/10">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Din ordbank</div>
            <div className="flex items-end gap-3 mb-3">
              <div className="text-4xl font-black text-rose-400">{knownCount}</div>
              <div className="text-slate-500 text-sm pb-1">av {ordQuestions.length} ord inlärda</div>
            </div>
            <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden mb-1">
              <div className="h-full bg-rose-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[11px] text-slate-600">{pct}% klart</div>
          </div>

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            {(['all', 'unknown', 'known'] as Filter[]).map(f => {
              const labels: Record<Filter, string> = { all: 'Alla ord', unknown: 'Ej inlärda', known: 'Inlärda' }
              const counts: Record<Filter, number> = {
                all: ordQuestions.length,
                unknown: ordQuestions.filter(q => !known.has(q.id)).length,
                known: knownCount,
              }
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${filter === f ? 'bg-rose-600 border-rose-500 text-white' : 'glass border-white/[0.08] text-slate-400 hover:text-slate-200'}`}
                >
                  {labels[f]} ({counts[f]})
                </button>
              )
            })}
          </div>

          <button
            onClick={handleStart}
            disabled={deck.length === 0}
            className="w-full disabled:opacity-40 bg-rose-700 hover:bg-rose-600 transition-colors rounded-2xl py-4 font-black text-base"
          >
            {deck.length === 0 ? 'Inga ord att öva' : `Starta — ${deck.length} ord →`}
          </button>

          {/* Word list preview */}
          <div className="mt-8">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Alla ord i banken</div>
            <div className="flex flex-wrap gap-2">
              {ordQuestions.map(q => {
                const word = wordFrom(q)
                const isKnown = known.has(q.id)
                return (
                  <span
                    key={q.id}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${isKnown ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' : 'bg-white/[0.03] border-white/[0.06] text-slate-500'}`}
                  >
                    {word}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'done') {
    return (
      <div className="min-h-screen bg-app text-white flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="text-6xl font-black text-rose-400 mb-2">{sessionResults.known}</div>
          <div className="text-slate-400 mb-1">ord kände du till</div>
          <div className="text-slate-600 text-sm mb-8">{sessionResults.unknown} ord att fortsätta öva</div>
          <div className="space-y-3">
            <button
              onClick={() => { setMode('menu') }}
              className="w-full bg-rose-700 hover:bg-rose-600 transition-colors rounded-xl py-3 font-bold text-sm"
            >
              Tillbaka till menyn
            </button>
            <button
              onClick={() => { setFilter('unknown'); handleStart() }}
              className="w-full glass border border-white/[0.08] hover:bg-white/[0.05] transition-colors rounded-xl py-3 font-bold text-sm text-slate-300"
            >
              Öva ej inlärda igen
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!currentCard) return null

  const word = wordFrom(currentCard)
  const correctOption = currentCard.options[currentCard.answer as keyof typeof currentCard.options]

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-lg mx-auto px-4 py-8 pb-24">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setMode('menu')}
            className="text-slate-600 hover:text-slate-300 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${((cardIndex) / deck.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-slate-600 shrink-0">{cardIndex + 1}/{deck.length}</span>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 mb-6 border border-rose-500/15 text-center min-h-[220px] flex flex-col items-center justify-center">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Vad betyder</div>
          <div className="text-4xl font-black tracking-widest text-white mb-2">{word}</div>
          <div className="text-xs text-slate-600">?</div>

          {revealed && (
            <div className="mt-6 animate-fade-in w-full">
              <div className="h-px bg-white/[0.06] mb-5" />
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-2">Synonym</div>
              <div className="text-2xl font-black text-rose-300 mb-3">{correctOption}</div>
              <p className="text-xs text-slate-400 leading-relaxed">{currentCard.explanation}</p>
            </div>
          )}
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full glass border border-white/[0.1] hover:bg-white/[0.05] transition-colors rounded-2xl py-4 font-bold text-sm text-slate-300"
          >
            Visa synonym
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleMark(false)}
              className="glass border border-red-500/20 hover:bg-red-500/10 transition-colors rounded-2xl py-4 font-bold text-sm text-red-400"
            >
              Kände ej till
            </button>
            <button
              onClick={() => handleMark(true)}
              className="glass border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors rounded-2xl py-4 font-bold text-sm text-emerald-400"
            >
              Kände till ✓
            </button>
          </div>
        )}

        {/* Difficulty indicator */}
        <div className="mt-4 text-center">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${currentCard.difficulty === 'easy' ? 'text-emerald-600' : currentCard.difficulty === 'medium' ? 'text-amber-600' : 'text-red-600'}`}>
            {currentCard.difficulty === 'easy' ? 'Lätt' : currentCard.difficulty === 'medium' ? 'Medel' : 'Svår'}
          </span>
        </div>
      </div>
    </div>
  )
}
