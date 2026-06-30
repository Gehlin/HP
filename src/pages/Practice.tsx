import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { QuestionType, ExamSession } from '../types'
import { questions } from '../data/questions'
import { buildSession, saveSession, loadHistory } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { getBookmarks } from '../utils/bookmarks'
import { getDailyChallengeIds, markDailyChallengeCompleted } from '../utils/dailyChallenge'
import { weakTypeSummary } from '../utils/analytics'

type Mode = 'drill' | 'exam' | 'repetition'
type Difficulty = 'easy' | 'medium' | 'hard'

const TYPE_INFO: Record<QuestionType, { label: string; desc: string; time: string }> = {
  XYZ: { label: 'XYZ', desc: 'Matematisk problemlösning',   time: '12 min / 12 frågor' },
  KVA: { label: 'KVA', desc: 'Kvantitativa jämförelser',    time: '10 min / 10 frågor' },
  NOG: { label: 'NOG', desc: 'Kvantitativa resonemang',     time: '10 min / 6 frågor'  },
  DTK: { label: 'DTK', desc: 'Diagram, tabeller & kartor',  time: '23 min / 12 frågor' },
  ORD: { label: 'ORD', desc: 'Ordförståelse',               time: '7 min / 10 frågor'  },
  LAS: { label: 'LÄS', desc: 'Läsförståelse',               time: '26 min / 16 frågor' },
  MEK: { label: 'MEK', desc: 'Meningskomplettering',        time: '8 min / 10 frågor'  },
  ELF: { label: 'ELF', desc: 'Engelsk läsförståelse',       time: '26 min / 16 frågor' },
}

const SECONDS_PER_QUESTION: Record<QuestionType, number> = {
  XYZ: 60, KVA: 60, NOG: 100, DTK: 115,
  ORD: 45, LAS: 120, MEK: 50, ELF: 120,
}

function computeTimeLimit(ids: string[]): number {
  return ids.reduce((acc, id) => {
    const q = questions.find(x => x.id === id)
    return acc + (q ? SECONDS_PER_QUESTION[q.type] : 60)
  }, 0)
}

const TYPE_ACCENTS: Record<QuestionType, { color: string; ring: string; bg: string }> = {
  XYZ: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  KVA: { color: '#2563EB', ring: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  NOG: { color: '#224A3A', ring: '#224A3A', bg: 'rgba(34,74,58,0.08)' },
  DTK: { color: '#D97706', ring: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  ORD: { color: '#DC2626', ring: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  LAS: { color: '#DB2777', ring: '#DB2777', bg: 'rgba(219,39,119,0.08)' },
  MEK: { color: '#9333EA', ring: '#9333EA', bg: 'rgba(147,51,234,0.08)' },
  ELF: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Lätt', medium: 'Medel', hard: 'Svår',
}

const DIFFICULTY_ACCENTS: Record<Difficulty, { color: string; ring: string; bg: string }> = {
  easy:   { color: '#224A3A', ring: '#224A3A', bg: 'rgba(34,74,58,0.10)' },
  medium: { color: '#D97706', ring: '#D97706', bg: 'rgba(217,119,6,0.10)' },
  hard:   { color: '#DC2626', ring: '#DC2626', bg: 'rgba(220,38,38,0.10)' },
}

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const ALL_TAGS = Array.from(new Set(questions.flatMap(q => q.tags))).sort()

/* ── tiny reusable toggle row ───────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold tracking-widest text-[var(--color-ink-faint)] uppercase mb-2.5">
      {children}
    </div>
  )
}

export default function Practice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')
  const typeParam = searchParams.get('type') as QuestionType | null

  const sectionParam = searchParams.get('section')
  const [mode, setMode] = useState<Mode>('drill')
  const QUANT_TYPES: QuestionType[] = ['XYZ', 'KVA', 'NOG', 'DTK']
  const VERBAL_TYPES: QuestionType[] = ['ORD', 'LAS', 'MEK', 'ELF']
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(() => {
    if (typeParam && Object.keys(TYPE_INFO).includes(typeParam)) return [typeParam]
    if (sectionParam === 'verbal') return VERBAL_TYPES
    return QUANT_TYPES
  })
  const [timed, setTimed] = useState(false)
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [count, setCount] = useState(20)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([...ALL_DIFFICULTIES])
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    tagParam && ALL_TAGS.includes(tagParam) ? [tagParam] : [...ALL_TAGS]
  )
  const [tagsOpen, setTagsOpen] = useState(!!tagParam)
  const [studyMode, setStudyMode] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(() => !!(typeParam || tagParam))

  const toggleType = (t: QuestionType) =>
    setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])

  const toggleDifficulty = (d: Difficulty) =>
    setSelectedDifficulties(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const toggleTag = (tag: string) =>
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag])

  const filteredPool = useMemo(() =>
    questions.filter(q =>
      selectedTypes.includes(q.type) &&
      selectedDifficulties.includes(q.difficulty) &&
      q.tags.some(t => selectedTags.includes(t))
    ),
    [selectedTypes, selectedDifficulties, selectedTags]
  )

  const available = filteredPool.length
  const dueIds = useMemo(() => getDueQuestions(questions.map(q => q.id)), [])

  const dueByType = useMemo(() => {
    const counts: Record<QuestionType, number> = { XYZ: 0, KVA: 0, NOG: 0, DTK: 0, ORD: 0, LAS: 0, MEK: 0, ELF: 0 }
    dueIds.forEach(id => {
      const q = questions.find(x => x.id === id)
      if (q) counts[q.type]++
    })
    return counts
  }, [dueIds])

  const bookmarkedIds = useMemo(() => getBookmarks().filter(id => questions.some(q => q.id === id)), [])
  const isDaily = searchParams.get('daily') === '1'
  const isSrs = searchParams.get('srs') === '1'

  useEffect(() => {
    if (!isDaily) return
    const ids = getDailyChallengeIds()
    const session = buildSession(ids, null, true, 'drill')
    saveSession(session)
    markDailyChallengeCompleted()
    navigate('/session', { replace: true })
  }, [])

  useEffect(() => {
    if (!isSrs) return
    const pool = questions.filter(q => dueIds.includes(q.id))
    if (pool.length === 0) return
    const session = buildSession(pool.map(q => q.id), null, true, 'drill', true)
    saveSession(session)
    navigate('/session', { replace: true })
  }, [dueIds.length])

  const wrongQuestionIds = useMemo(() => {
    const history = loadHistory()
    const wrongSet = new Set<string>()
    for (const session of history) {
      for (const [qid, answer] of Object.entries(session.answers)) {
        const q = questions.find(x => x.id === qid)
        if (q && q.answer !== answer) wrongSet.add(qid)
      }
    }
    return Array.from(wrongSet)
  }, [])

  const adaptiveIds = useMemo(() => {
    const history = loadHistory()
    if (history.length === 0) return []
    const tagAcc: Record<string, { correct: number; total: number }> = {}
    history.forEach(s => {
      s.questionIds.forEach(qid => {
        const q = questions.find(x => x.id === qid)
        if (!q || !s.answers[qid]) return
        for (const tag of q.tags) {
          if (!tagAcc[tag]) tagAcc[tag] = { correct: 0, total: 0 }
          tagAcc[tag].total++
          if (s.answers[qid] === q.answer) tagAcc[tag].correct++
        }
      })
    })
    const weakTags = new Set(
      Object.entries(tagAcc)
        .filter(([, v]) => v.total >= 3 && (v.correct / v.total) < 0.70)
        .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
        .slice(0, 4)
        .map(([tag]) => tag)
    )
    if (weakTags.size === 0) return []
    return questions
      .filter(q => q.tags.some(t => weakTags.has(t)))
      .sort(() => Math.random() - 0.5)
      .slice(0, 20)
      .map(q => q.id)
  }, [])

  const weakTypes = useMemo(() => weakTypeSummary(), [])

  const startWrongDrill = () => {
    const pool = questions.filter(q => wrongQuestionIds.includes(q.id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const session = buildSession(shuffled.map(q => q.id), null, true, 'drill', true)
    saveSession(session)
    navigate('/session')
  }

  const startBookmarkDrill = () => {
    const pool = questions.filter(q => bookmarkedIds.includes(q.id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const session = buildSession(shuffled.map(q => q.id), null, true, 'drill')
    saveSession(session)
    navigate('/session')
  }

  const start = () => {
    let session: ExamSession
    if (mode === 'repetition') {
      const pool = questions.filter(q => dueIds.includes(q.id))
      if (pool.length === 0) return
      session = buildSession(pool.map(q => q.id), null, true, 'drill', true)
    } else {
      const shuffled = [...filteredPool].sort(() => Math.random() - 0.5)
      const chosen = shuffled.slice(0, Math.min(count, filteredPool.length))
      const chosenIds = chosen.map(q => q.id)
      session = buildSession(chosenIds, timed ? computeTimeLimit(chosenIds) : null, instantFeedback, 'drill', studyMode || undefined)
    }
    saveSession(session)
    navigate('/session')
  }

  const allTagsSelected = selectedTags.length === ALL_TAGS.length
  const canStart = mode === 'repetition' ? dueIds.length > 0 : (selectedTypes.length > 0 && available > 0)

  return (
    <div className="min-h-screen bg-app pt-topnav">
      <div className="max-w-2xl mx-auto px-4 pb-8">

        {/* Page title */}
        <h1 className="text-2xl font-[var(--font-serif)] text-[var(--color-ink)] mb-4">Träna</h1>

        {/* Mode selector cards */}
        <div className="mb-6">
          {[
            {
              id: 'drill' as Mode,
              title: 'Övning',
              desc: 'Välj frågetyper, svårighetsgrad och antal',
              dotColor: 'var(--color-green)',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              ),
            },
            {
              id: 'exam' as Mode,
              title: 'Provläge',
              desc: '40 frågor, tidsbegränsad',
              dotColor: 'var(--color-terracotta)',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              ),
            },
            {
              id: 'repetition' as Mode,
              title: 'Spaced Repetition',
              desc: dueIds.length > 0 ? `${dueIds.length} frågor att repetera` : 'Inget idag',
              dotColor: 'var(--color-gold)',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.59"/>
                </svg>
              ),
            },
          ].map(card => (
            <div
              key={card.id}
              onClick={() => setMode(card.id as Mode)}
              className={`bg-[var(--color-card)] rounded-2xl p-4 mb-3 cursor-pointer flex items-center gap-3 ${
                mode === card.id
                  ? 'border-2 border-[var(--color-green)]'
                  : 'border border-[var(--color-card-border)]'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: card.dotColor }} />
              {card.icon}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--color-ink)]">{card.title}</div>
                <div className="text-sm text-[var(--color-ink-faint)]">{card.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick-drill shortcuts */}
        {(wrongQuestionIds.length > 0 || bookmarkedIds.length > 0 || adaptiveIds.length > 0) && (
          <div className="mb-6 space-y-2">
            {adaptiveIds.length > 0 && (
              <button
                onClick={() => {
                  const session = buildSession(adaptiveIds, null, true, 'drill', true)
                  saveSession(session)
                  navigate('/session')
                }}
                className="w-full rounded-2xl p-4 border border-violet-500/25 bg-violet-500/8 hover:bg-violet-500/12 text-left transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-violet-400 text-sm">Fokusträning</div>
                  {weakTypes.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {weakTypes.map(({ type, pct }) => (
                        <span key={type} className="text-[10px] font-bold bg-violet-500/15 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 rounded-md">
                          {type} {pct}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-violet-400/50">{adaptiveIds.length} frågor · svagaste ämnen · studieläge</div>
              </button>
            )}
            {wrongQuestionIds.length > 0 && (
              <button
                onClick={startWrongDrill}
                className="w-full rounded-2xl p-4 border border-amber-500/25 bg-amber-500/8 hover:bg-amber-500/12 text-left transition-colors"
              >
                <div className="font-bold text-amber-400 text-sm">Öva på dina fel</div>
                <div className="text-xs text-amber-400/50 mt-0.5">{wrongQuestionIds.length} frågor du svarat fel på · studieläge</div>
              </button>
            )}
            {bookmarkedIds.length > 0 && (
              <div className="rounded-2xl border border-blue-500/25 bg-blue-500/8 overflow-hidden">
                <div className="flex items-center justify-between p-4">
                  <div>
                    <div className="font-bold text-blue-400 text-sm">Bokmärkta frågor</div>
                    <div className="text-xs text-blue-400/50 mt-0.5">{bookmarkedIds.length} sparade frågor</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate('/bookmarks')}
                      className="text-xs text-blue-400/70 hover:text-blue-300 border border-blue-500/25 rounded-lg px-2.5 py-1.5 transition-colors"
                    >
                      Bläddra
                    </button>
                    <button
                      onClick={startBookmarkDrill}
                      className="text-xs text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg px-2.5 py-1.5 font-bold transition-colors"
                    >
                      Drill →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Top CTA — quick launch before section drills */}
        {(mode !== 'repetition' || dueIds.length > 0) && (
          <button
            onClick={start}
            disabled={!canStart}
            className="btn-primary w-full mb-6 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {canStart ? 'Starta träning →' : 'Inga frågor tillgängliga'}
          </button>
        )}

        {/* Repetition mode panel — before Sektionsträning so empty-state is visible without scrolling */}
        {mode === 'repetition' && (
          <div className="mb-6 bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl p-5">
            {dueIds.length === 0 ? (
              <p className="text-center text-[var(--color-ink-faint)] text-sm">Inga frågor att repetera idag — kom tillbaka imorgon!</p>
            ) : (
              <>
                <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">
                  {dueIds.length} frågor att repetera
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(dueByType) as [QuestionType, number][])
                    .filter(([, n]) => n > 0)
                    .map(([type, n]) => (
                      <div key={type} className="bg-[var(--color-paper-dark)] rounded-xl p-2.5 text-center">
                        <div className="text-xs font-black mb-1" style={{ color: TYPE_ACCENTS[type].color }}>{type}</div>
                        <div className="text-lg font-black text-[var(--color-ink)]">{n}</div>
                      </div>
                    ))}
                </div>
                <p className="text-[11px] text-[var(--color-ink-faint)] mt-3">Studieläge aktiveras automatiskt.</p>
              </>
            )}
          </div>
        )}

        {/* Section drills */}
        <div className="mb-6">
          <SectionLabel>Sektionsträning</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(TYPE_INFO) as QuestionType[]).map(t => {
              const pool = questions.filter(q => q.type === t)
              const sectionCount = { XYZ: 12, KVA: 10, NOG: 6, DTK: 12, ORD: 10, LAS: 16, MEK: 10, ELF: 16 }[t]
              const timeSecs = { XYZ: 15 * 60, KVA: 10 * 60, NOG: 10 * 60, DTK: 23 * 60, ORD: 7 * 60, LAS: 26 * 60, MEK: 8 * 60, ELF: 26 * 60 }[t]
              const timeLabel = { XYZ: '15 min', KVA: '10 min', NOG: '10 min', DTK: '23 min', ORD: '7 min', LAS: '26 min', MEK: '8 min', ELF: '26 min' }[t]
              const accent = TYPE_ACCENTS[t]
              return (
                <button
                  key={t}
                  onClick={() => {
                    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, sectionCount)
                    const session = buildSession(shuffled.map(q => q.id), timeSecs, false, 'drill')
                    saveSession(session)
                    navigate('/session')
                  }}
                  className="rounded-xl p-3.5 border text-left transition-all duration-150"
                  style={{ borderColor: accent.ring, backgroundColor: accent.bg }}
                >
                  <div className="font-black text-sm" style={{ color: accent.color }}>{t}</div>
                  <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">{sectionCount} frågor · {timeLabel}</div>
                </button>
              )
            })}
          </div>
        </div>

        {mode !== 'repetition' && (
          <>
            <button
              onClick={() => setAdvancedOpen(prev => !prev)}
              className="w-full flex items-center justify-between text-[10px] font-bold tracking-widest text-[var(--color-ink-faint)] uppercase mb-4"
            >
              <span>Avancerat</span>
              <span className="text-[var(--color-ink-muted)]">{advancedOpen ? '▲' : '▼'}</span>
            </button>

            {advancedOpen && (<>
            {/* Question types */}
            <div className="mb-6">
              <SectionLabel>Delprov</SectionLabel>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const allTypes = Object.keys(TYPE_INFO) as QuestionType[]
                    setSelectedTypes(selectedTypes.length === allTypes.length ? [] : allTypes)
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-150 ${
                    selectedTypes.length === Object.keys(TYPE_INFO).length
                      ? 'border-2 border-[var(--color-green)] bg-[var(--color-green-muted)] text-[var(--color-green-light)]'
                      : 'bg-[var(--color-paper-dark)] border-transparent text-[var(--color-ink-muted)]'
                  }`}
                >
                  Alla
                </button>
                {(Object.keys(TYPE_INFO) as QuestionType[]).map(t => {
                  const isSelected = selectedTypes.includes(t)
                  const accent = TYPE_ACCENTS[t]
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-150 ${
                        isSelected ? 'border-2' : 'bg-[var(--color-paper-dark)] border-transparent text-[var(--color-ink-muted)]'
                      }`}
                      style={isSelected ? { borderColor: accent.ring, backgroundColor: accent.bg, color: accent.color } : undefined}
                    >
                      {t}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-6">
              <SectionLabel>Svårighetsgrad</SectionLabel>
              <div className="flex gap-2">
                {ALL_DIFFICULTIES.map(d => {
                  const isSelected = selectedDifficulties.includes(d)
                  const accent = DIFFICULTY_ACCENTS[d]
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDifficulty(d)}
                      className={`flex-1 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all duration-150 ${
                        isSelected ? 'border-2' : 'bg-[var(--color-paper-dark)] border-transparent text-[var(--color-ink-muted)]'
                      }`}
                      style={isSelected ? { borderColor: accent.ring, backgroundColor: accent.bg, color: accent.color } : undefined}
                    >
                      {DIFFICULTY_LABELS[d]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tag filter */}
            <div className="mb-6">
              <button
                onClick={() => setTagsOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-[10px] font-bold tracking-widest text-[var(--color-ink-faint)] uppercase mb-2.5"
              >
                <span>
                  Ämnesfilter
                  {!allTagsSelected && (
                    <span className="ml-2 text-blue-400 normal-case font-normal tracking-normal">
                      ({selectedTags.length}/{ALL_TAGS.length})
                    </span>
                  )}
                </span>
                <span className="text-[var(--color-ink-muted)]">{tagsOpen ? '▲' : '▼'}</span>
              </button>
              {tagsOpen && (
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-150 ${
                        selectedTags.includes(tag)
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Count slider */}
            <div className="mb-6">
              <SectionLabel>
                Antal frågor — {Math.min(count, available)}{' '}
                <span className="text-[var(--color-ink-muted)] normal-case tracking-normal font-normal">av {available} tillgängliga</span>
              </SectionLabel>
              <input
                type="range"
                min={5}
                max={Math.max(available, 5)}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-[var(--color-ink-muted)] mt-1">
                <span>5</span><span>{available}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="mb-6">
              <SectionLabel>Tidsgräns</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {([false, true] as const).map(t => (
                  <button
                    key={String(t)}
                    onClick={() => setTimed(t)}
                    className={`rounded-xl p-3.5 border text-left transition-all duration-150 ${
                      timed === t
                        ? 'border-blue-500/50 bg-blue-500/10'
                        : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                    }`}
                  >
                    <div className={`font-bold text-sm ${timed === t ? 'text-blue-700' : 'text-[var(--color-ink-muted)]'}`}>
                      {t ? 'Med tid' : 'Utan tid'}
                    </div>
                    <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">
                      {t
                        ? `${Math.round(computeTimeLimit(filteredPool.slice(0, Math.min(count, filteredPool.length)).map(q => q.id)) / 60)} min`
                        : 'Ta den tid du behöver'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <SectionLabel>Återkoppling</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setInstantFeedback(true); setStudyMode(false) }}
                  className={`rounded-xl p-3.5 border text-left transition-all duration-150 ${
                    instantFeedback && !studyMode
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                  }`}
                >
                  <div className={`font-bold text-sm ${instantFeedback && !studyMode ? 'text-blue-700' : 'text-[var(--color-ink-muted)]'}`}>Direkt</div>
                  <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">Rätt/fel efter varje svar</div>
                </button>
                <button
                  onClick={() => { setInstantFeedback(false); setStudyMode(false) }}
                  className={`rounded-xl p-3.5 border text-left transition-all duration-150 ${
                    !instantFeedback && !studyMode
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                  }`}
                >
                  <div className={`font-bold text-sm ${!instantFeedback && !studyMode ? 'text-blue-700' : 'text-[var(--color-ink-muted)]'}`}>I efterhand</div>
                  <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">Genomgång efter passet</div>
                </button>
              </div>
            </div>

            {/* Study mode toggle */}
            <div className="mb-8">
              <button
                onClick={() => setStudyMode(prev => !prev)}
                className={`w-full rounded-xl p-4 border text-left transition-all duration-150 ${
                  studyMode
                    ? 'border-violet-500/40 bg-violet-500/10'
                    : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${studyMode ? 'text-violet-700' : 'text-[var(--color-ink-muted)]'}`}>Studieläge</div>
                    <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">
                      Förklaringar alltid synliga · betygsätt svårigheten för SRS
                    </div>
                  </div>
                  <div className={`ml-4 w-9 h-5 rounded-full transition-colors flex items-center shrink-0 ${studyMode ? 'bg-violet-600' : 'bg-[var(--color-paper-dark)]'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-white mx-0.5 transition-transform ${studyMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </button>
            </div>
            </>)}

            {available === 0 && (
              <p className="text-amber-400 text-sm mb-4 text-center">
                Inga frågor matchar filtren — justera svårighetsgrad, ämnen eller delprov.
              </p>
            )}
          </>
        )}

        {/* Start CTA */}
        <button
          onClick={start}
          disabled={!canStart}
          className="btn-primary w-full mt-6 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {canStart ? 'Starta träning →' : 'Inga frågor tillgängliga'}
        </button>
      </div>
    </div>
  )
}
