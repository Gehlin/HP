import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { getBookmarks, toggleBookmark } from '../utils/bookmarks'
import { buildSession, saveSession } from '../utils/session'
import type { QuestionType, AnswerKey } from '../types'
import MathText from '../components/MathText'

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

const displayType = (t: QuestionType) => (t === 'LAS' ? 'LÄS' : t)

// Prototype's filled bookmark path (Saved screen, remove button + empty state)
const BOOKMARK_PATH = 'M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z'

const FILTER_ACTIVE: Record<QuestionType, string> = {
  XYZ: 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] bg-[var(--color-terracotta-muted)]',
  KVA: 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] bg-[var(--color-terracotta-muted)]',
  NOG: 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] bg-[var(--color-terracotta-muted)]',
  DTK: 'border-[var(--color-terracotta)] text-[var(--color-terracotta)] bg-[var(--color-terracotta-muted)]',
  ORD: 'border-[var(--color-green)]      text-[var(--color-green)]      bg-[var(--color-green-muted)]',
  LAS: 'border-[var(--color-green)]      text-[var(--color-green)]      bg-[var(--color-green-muted)]',
  MEK: 'border-[var(--color-green)]      text-[var(--color-green)]      bg-[var(--color-green-muted)]',
  ELF: 'border-[var(--color-green)]      text-[var(--color-green)]      bg-[var(--color-green-muted)]',
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button
        onClick={onBack}
        aria-label="Tillbaka"
        style={{ width: 38, height: 38, borderRadius: 12, background: '#FFFFFF', border: '1px solid #EAE3D6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
      >
        <svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="#6f6859" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2 2 8l5 6" /></svg>
      </button>
      <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 22, lineHeight: 1.05, color: '#23201A' }}>Sparade frågor</h1>
    </div>
  )
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
      <div className="min-h-screen bg-app pt-topnav pb-bottomnav flex flex-col">
        <div className="max-w-2xl mx-auto w-full px-4 pt-2 flex-1 flex flex-col">
          <Header onBack={() => navigate('/practice')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 30px 60px' }}>
            <div style={{ width: 60, height: 60, borderRadius: 18, background: '#F3E0D5', border: '1px solid #ECCFBE', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#BF5A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={BOOKMARK_PATH} /></svg>
            </div>
            <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 22, lineHeight: 1.2, color: '#23201A' }}>Inga sparade frågor än</div>
            <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 14, lineHeight: 1.6, color: '#8B8478', marginTop: 9 }}>
              Tryck på bokmärket under en fråga när du övar för att spara den och repetera senare.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app pt-topnav pb-bottomnav">
      <div className="max-w-2xl mx-auto px-4 pt-2 pb-8">
        <Header onBack={() => navigate('/practice')} />

        {/* Type filter (existing functionality, kept) */}
        <div className="flex gap-2 flex-wrap" style={{ marginTop: 14 }}>
          <button
            onClick={() => setFilterType(null)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              !filterType
                ? 'border-[var(--color-green)] text-[var(--color-green)] bg-[var(--color-green-muted)]'
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
              {displayType(type)} ({n})
            </button>
          ))}
        </div>

        {/* Primary drill CTA — prototype places it above the list */}
        {filtered.length > 0 && (
          <button
            onClick={startDrill}
            style={{ width: '100%', height: 52, borderRadius: 16, background: '#224A3A', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 15, lineHeight: 1, color: '#FBF7EE', cursor: 'pointer', marginTop: 14 }}
          >
            {filterType ? `Öva ${displayType(filterType)} · ${filtered.length} frågor` : 'Öva alla sparade frågor'}
          </button>
        )}

        {/* Question list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
          {filtered.length === 0 && (
            <p className="text-sm text-[var(--color-ink-faint)] text-center py-6">Inga sparade frågor matchar filtret.</p>
          )}
          {filtered.map(q => {
            const expanded = expandedId === q.id
            const answerOptions = (Object.entries(q.options).filter(([k]) =>
              ANSWER_KEYS.includes(k as AnswerKey)
            ) as [AnswerKey, string][])
            return (
              <div key={q.id} style={{ background: '#FFFFFF', border: '1px solid #EAE3D6', borderRadius: 15, padding: '14px 15px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <button
                    onClick={() => setExpandedId(expanded ? null : q.id)}
                    style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  >
                    <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 800, fontSize: 11, lineHeight: 1, letterSpacing: '0.08em', color: '#224A3A' }}>{displayType(q.type)}</div>
                    <div
                      className={expanded ? '' : 'line-clamp-2'}
                      style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 16, lineHeight: 1.35, color: '#23201A', marginTop: 6 }}
                    >
                      <MathText text={q.text} />
                    </div>
                  </button>
                  <button
                    onClick={() => handleRemove(q.id)}
                    aria-label="Ta bort bokmärke"
                    title="Ta bort bokmärke"
                    style={{ width: 34, height: 34, borderRadius: 10, background: '#F3E0D5', border: '1px solid #E0B79F', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#BF5A33" stroke="#BF5A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={BOOKMARK_PATH} /></svg>
                  </button>
                </div>

                {expanded && (
                  <div>
                    <div style={{ height: 1, background: '#F0EADD', margin: '12px 0 10px' }} />
                    <div className="text-[10px] text-[var(--color-ink-faint)] mb-2">{q.source} · #{q.number}</div>
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
                                ? 'border-[var(--color-feedback-correct-border)] bg-[var(--color-feedback-correct-bg)] text-[var(--color-ink)]'
                                : 'border-[var(--color-card-border)] text-[var(--color-ink-faint)]'
                            }`}
                          >
                            <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-black mt-0.5 ${
                              isAnswer ? 'bg-[var(--color-correct-badge)] text-[var(--color-cream)]' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'
                            }`}>
                              {isAnswer ? '✓' : key}
                            </span>
                            <MathText text={text} />
                          </div>
                        )
                      })}
                    </div>
                    {q.explanation && (
                      <p className="text-[12px] text-[var(--color-ink-faint)] leading-relaxed">{q.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
