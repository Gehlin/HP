import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { getBookmarks, toggleBookmark } from '../utils/bookmarks'
import { buildSession, saveSession } from '../utils/session'
import type { QuestionType, AnswerKey } from '../types'
import MathText from '../components/MathText'

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

const TYPE_PILL: Record<QuestionType, string> = {
  XYZ: 'border-violet-500/30  bg-violet-500/10  text-violet-300',
  KVA: 'border-blue-500/30    bg-blue-500/10    text-blue-300',
  NOG: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  DTK: 'border-amber-500/30   bg-amber-500/10   text-amber-300',
  ORD: 'border-rose-500/30    bg-rose-500/10    text-rose-300',
  LAS: 'border-pink-500/30    bg-pink-500/10    text-pink-300',
  MEK: 'border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300',
  ELF: 'border-purple-500/30  bg-purple-500/10  text-purple-300',
}

const FILTER_ACTIVE: Record<QuestionType, string> = {
  XYZ: 'border-violet-500  text-violet-300  bg-violet-500/10',
  KVA: 'border-blue-500    text-blue-300    bg-blue-500/10',
  NOG: 'border-emerald-500 text-emerald-300 bg-emerald-500/10',
  DTK: 'border-amber-500   text-amber-300   bg-amber-500/10',
  ORD: 'border-rose-500    text-rose-300    bg-rose-500/10',
  LAS: 'border-pink-500    text-pink-300    bg-pink-500/10',
  MEK: 'border-fuchsia-500 text-fuchsia-300 bg-fuchsia-500/10',
  ELF: 'border-purple-500  text-purple-300  bg-purple-500/10',
}

export default function Bookmarks() {
  const navigate = useNavigate()
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() => getBookmarks())
  const [filterType, setFilterType] = useState<QuestionType | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allBookmarked = useMemo(
    () => questions.filter(q => bookmarkIds.includes(q.id)),
    [bookmarkIds]
  )

  const filtered = useMemo(
    () => (filterType ? allBookmarked.filter(q => q.type === filterType) : allBookmarked),
    [allBookmarked, filterType]
  )

  const typeCounts = useMemo(() => {
    const counts: Partial<Record<QuestionType, number>> = {}
    allBookmarked.forEach(q => { counts[q.type] = (counts[q.type] ?? 0) + 1 })
    return counts
  }, [allBookmarked])

  const handleRemove = (id: string) => {
    toggleBookmark(id)
    setBookmarkIds(getBookmarks())
    if (expandedId === id) setExpandedId(null)
  }

  const startDrill = () => {
    if (filtered.length === 0) return
    const shuffled = [...filtered].sort(() => Math.random() - 0.5)
    const session = buildSession(shuffled.map(q => q.id), null, true, 'drill')
    saveSession(session)
    navigate('/session')
  }

  if (bookmarkIds.length === 0) {
    return (
      <div className="min-h-screen bg-app text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl font-black text-slate-700 mb-4">—</div>
          <div className="text-slate-400 font-semibold mb-1">Inga bokmärken</div>
          <p className="text-slate-600 text-sm mb-6">Spara frågor under ett träningspass för att se dem här.</p>
          <button
            onClick={() => navigate('/practice')}
            className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded-xl font-bold text-sm"
          >
            Börja öva →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-28">

        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 text-sm mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Tillbaka
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1 tracking-tight">Bokmärken</h1>
          <p className="text-slate-500 text-sm">{bookmarkIds.length} sparade frågor</p>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              !filterType ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-white/[0.08] text-slate-400 hover:border-white/[0.15]'
            }`}
          >
            Alla ({bookmarkIds.length})
          </button>
          {(Object.entries(typeCounts) as [QuestionType, number][]).map(([type, n]) => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                filterType === type ? FILTER_ACTIVE[type] : 'border-white/[0.08] text-slate-400 hover:border-white/[0.15]'
              }`}
            >
              {type} ({n})
            </button>
          ))}
        </div>

        {/* Question list */}
        <div className="space-y-2 mb-6">
          {filtered.map(q => {
            const expanded = expandedId === q.id
            const answerOptions = (Object.entries(q.options).filter(([k]) =>
              ANSWER_KEYS.includes(k as AnswerKey)
            ) as [AnswerKey, string][])
            return (
              <div key={q.id} className="glass rounded-xl border border-white/[0.06] overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${TYPE_PILL[q.type]}`}>{q.type}</span>
                      <span className="text-[10px] text-slate-600">{q.source} · #{q.number}</span>
                    </div>
                    <div className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                      <MathText text={q.text} />
                    </div>
                  </div>
                  <span className="text-slate-600 text-xs shrink-0 pt-0.5">{expanded ? '▲' : '▼'}</span>
                </button>

                {expanded && (
                  <div className="border-t border-white/[0.05] px-4 pb-4 pt-3 bg-white/[0.02]">
                    {q.context && (
                      <div className="glass rounded-xl px-3 py-2.5 mb-3 text-sm text-slate-400 leading-relaxed">
                        <div className="text-[9px] font-bold tracking-widest uppercase text-slate-600 mb-1">Kontext</div>
                        <MathText text={q.context} />
                      </div>
                    )}
                    <div className="space-y-1.5 mb-3">
                      {answerOptions.map(([key, text]) => {
                        const isAnswer = key === q.answer
                        return (
                          <div
                            key={key}
                            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm border ${
                              isAnswer
                                ? 'border-emerald-500/40 bg-emerald-900/20 text-slate-200'
                                : 'border-white/[0.05] text-slate-500'
                            }`}
                          >
                            <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-black mt-0.5 ${
                              isAnswer ? 'bg-emerald-600 text-white' : 'bg-white/[0.06] text-slate-500'
                            }`}>
                              {isAnswer ? '✓' : key}
                            </span>
                            <MathText text={text} />
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <p className="text-[12px] text-slate-500 leading-relaxed mb-3">{q.explanation}</p>
                    )}
                    <button
                      onClick={() => handleRemove(q.id)}
                      className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                    >
                      Ta bort bokmärke
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length > 0 && (
          <button
            onClick={startDrill}
            className="w-full bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl py-4 font-black text-base"
          >
            Starta drill · {filtered.length} frågor →
          </button>
        )}
      </div>
    </div>
  )
}
