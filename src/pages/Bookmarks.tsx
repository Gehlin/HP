import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { getBookmarks, toggleBookmark } from '../utils/bookmarks'
import { buildSession, saveSession } from '../utils/session'
import type { QuestionType, AnswerKey } from '../types'
import MathText from '../components/MathText'

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

const TYPE_PILL: Record<QuestionType, string> = {
  XYZ: 'border-violet-200  bg-violet-50  text-violet-700',
  KVA: 'border-blue-200    bg-blue-50    text-blue-700',
  NOG: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  DTK: 'border-amber-200   bg-amber-50   text-amber-700',
  ORD: 'border-rose-200    bg-rose-50    text-rose-700',
  LAS: 'border-pink-200    bg-pink-50    text-pink-700',
  MEK: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  ELF: 'border-purple-200  bg-purple-50  text-purple-700',
}

const FILTER_ACTIVE: Record<QuestionType, string> = {
  XYZ: 'border-violet-500  text-violet-700  bg-violet-50',
  KVA: 'border-blue-500    text-blue-700    bg-blue-50',
  NOG: 'border-emerald-500 text-emerald-700 bg-emerald-50',
  DTK: 'border-amber-500   text-amber-700   bg-amber-50',
  ORD: 'border-rose-500    text-rose-700    bg-rose-50',
  LAS: 'border-pink-500    text-pink-700    bg-pink-50',
  MEK: 'border-fuchsia-500 text-fuchsia-700 bg-fuchsia-50',
  ELF: 'border-purple-500  text-purple-700  bg-purple-50',
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
      <div className="min-h-screen bg-app text-[var(--color-ink)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl font-black text-[var(--color-ink-faint)] mb-4">—</div>
          <div className="text-[var(--color-ink-muted)] font-semibold mb-1">Inga bokmärken</div>
          <p className="text-[var(--color-ink-faint)] text-sm mb-6">Spara frågor under ett träningspass för att se dem här.</p>
          <button
            onClick={() => navigate('/practice')}
            className="btn-primary px-6 py-3 rounded-xl font-bold text-sm"
          >
            Börja öva →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)]">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-28">

        <button
          onClick={() => navigate('/practice')}
          className="flex items-center gap-1.5 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] text-sm mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Tillbaka
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-black mb-1 tracking-tight">Bokmärken</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">{bookmarkIds.length} sparade frågor</p>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterType(null)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              !filterType
                ? 'border-blue-500 text-blue-700 bg-blue-50'
                : 'border-[var(--color-card-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-card-border)]'
            }`}
          >
            Alla ({bookmarkIds.length})
          </button>
          {(Object.entries(typeCounts) as [QuestionType, number][]).map(([type, n]) => (
            <button
              key={type}
              onClick={() => setFilterType(filterType === type ? null : type)}
              className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
                filterType === type
                  ? FILTER_ACTIVE[type]
                  : 'border-[var(--color-card-border)] text-[var(--color-ink-muted)] hover:border-[var(--color-card-border)]'
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
              <div key={q.id} className="card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                  className="w-full flex items-start gap-3 p-4 text-left hover:bg-[var(--color-paper-dark)] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${TYPE_PILL[q.type]}`}>{q.type}</span>
                      <span className="text-[10px] text-[var(--color-ink-faint)]">{q.source} · #{q.number}</span>
                    </div>
                    <div className="text-sm text-[var(--color-ink)] line-clamp-2 leading-relaxed">
                      <MathText text={q.text} />
                    </div>
                  </div>
                  <span className="text-[var(--color-ink-faint)] text-xs shrink-0 pt-0.5">{expanded ? '▲' : '▼'}</span>
                </button>

                {expanded && (
                  <div className="border-t border-[var(--color-card-border)] px-4 pb-4 pt-3 bg-[var(--color-paper)]">
                    {q.context && (
                      <div className="bg-[var(--color-paper-dark)] rounded-xl px-3 py-2.5 mb-3 text-sm text-[var(--color-ink-muted)] leading-relaxed">
                        <div className="text-[9px] font-bold tracking-widest uppercase text-[var(--color-ink-faint)] mb-1">Kontext</div>
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
                                ? 'border-emerald-200 bg-emerald-50 text-[var(--color-ink)]'
                                : 'border-[var(--color-card-border)] text-[var(--color-ink-faint)]'
                            }`}
                          >
                            <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-black mt-0.5 ${
                              isAnswer ? 'bg-emerald-600 text-white' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'
                            }`}>
                              {isAnswer ? '✓' : key}
                            </span>
                            <MathText text={text} />
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <p className="text-[12px] text-[var(--color-ink-faint)] leading-relaxed mb-3">{q.explanation}</p>
                    )}
                    <button
                      onClick={() => handleRemove(q.id)}
                      className="text-xs text-[var(--color-ink-faint)] hover:text-red-600 transition-colors"
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
            className="btn-primary w-full rounded-2xl py-4 font-black text-base"
          >
            Starta drill · {filtered.length} frågor →
          </button>
        )}
      </div>
    </div>
  )
}
