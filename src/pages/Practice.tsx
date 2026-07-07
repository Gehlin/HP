import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { QuestionType } from '../types'
import { questions } from '../data/questions'
import { buildSession, saveSession, loadHistory } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { getBookmarks } from '../utils/bookmarks'
import { getDailyChallengeIds, markDailyChallengeCompleted } from '../utils/dailyChallenge'
import { weakTypeSummary, buildWeakAreaSession } from '../utils/analytics'

type Mode = 'drill' | 'exam'
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
  XYZ: { color: 'var(--color-terracotta)', ring: 'var(--color-terracotta)', bg: 'var(--color-terracotta-muted)' },
  KVA: { color: 'var(--color-terracotta)', ring: 'var(--color-terracotta)', bg: 'var(--color-terracotta-muted)' },
  NOG: { color: 'var(--color-terracotta)', ring: 'var(--color-terracotta)', bg: 'var(--color-terracotta-muted)' },
  DTK: { color: 'var(--color-gold-deep)',  ring: 'var(--color-gold-deep)',  bg: 'var(--color-gold-muted)'       },
  ORD: { color: 'var(--color-green)',       ring: 'var(--color-green)',       bg: 'var(--color-green-muted)'      },
  LAS: { color: 'var(--color-green)',       ring: 'var(--color-green)',       bg: 'var(--color-green-muted)'      },
  MEK: { color: 'var(--color-green)',       ring: 'var(--color-green)',       bg: 'var(--color-green-muted)'      },
  ELF: { color: 'var(--color-green)',       ring: 'var(--color-green)',       bg: 'var(--color-green-muted)'      },
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Lätt', medium: 'Medel', hard: 'Svår',
}

const DIFFICULTY_ACCENTS: Record<Difficulty, { color: string; ring: string; bg: string }> = {
  easy:   { color: 'var(--color-green)',      ring: 'var(--color-green)',      bg: 'var(--color-green-muted)'  },
  medium: { color: 'var(--color-gold-deep)',  ring: 'var(--color-gold-deep)',  bg: 'var(--color-gold-muted)'   },
  hard:   { color: 'var(--color-error)',      ring: 'var(--color-error)',      bg: 'var(--color-error-bg)'     },
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

  const bookmarkedIds = useMemo(() => getBookmarks().filter(id => questions.some(q => q.id === id)), [])
  const isDaily = searchParams.get('daily') === '1'
  const isSrs = searchParams.get('srs') === '1'

  useEffect(() => {
    if (!isDaily) return
    // getDailyChallengeIds is async (loads the question bank via the shared
    // cached loader) — resolves near-instantly since Practice.tsx's own
    // `questions` import already forces the same module to load.
    getDailyChallengeIds().then(async ids => {
      const session = await buildSession(ids, null, true, 'drill')
      saveSession(session)
      markDailyChallengeCompleted()
      navigate('/session', { replace: true })
    })
  }, [])

  useEffect(() => {
    if (!isSrs) return
    const pool = questions.filter(q => dueIds.includes(q.id))
    if (pool.length === 0) return
    buildSession(pool.map(q => q.id), null, true, 'drill', true).then(session => {
      saveSession(session)
      navigate('/session', { replace: true })
    })
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

  const adaptiveIds = useMemo(() => buildWeakAreaSession(20), [])

  const weakTypes = useMemo(() => weakTypeSummary(), [])

  const startWrongDrill = async () => {
    const pool = questions.filter(q => wrongQuestionIds.includes(q.id))
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    const session = await buildSession(shuffled.map(q => q.id), null, true, 'drill', true)
    saveSession(session)
    navigate('/session')
  }

  const start = async () => {
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5)
    const chosen = shuffled.slice(0, Math.min(count, filteredPool.length))
    const chosenIds = chosen.map(q => q.id)
    const session = await buildSession(chosenIds, timed ? computeTimeLimit(chosenIds) : null, instantFeedback, 'drill', studyMode || undefined)
    saveSession(session)
    navigate('/session')
  }

  const allTagsSelected = selectedTags.length === ALL_TAGS.length
  const canStart = selectedTypes.length > 0 && available > 0

  return (
    <div className="min-h-screen bg-app pt-topnav pb-bottomnav">
      <div className="max-w-2xl mx-auto px-4">

        {/* Page title */}
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 26, lineHeight: 1.05, color: '#23201A', marginBottom: 16, marginTop: 4 }}>Öva</h1>

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

          {/* One-tap links into the practice tools that live on their own
              pages — SRS dashboard, exam simulator and saved questions
              (promoted here from Profil's old STUDIEVERKTYG list). */}
          {[
            {
              path: '/srs',
              title: 'Repetitionskö',
              desc: dueIds.length > 0 ? `${dueIds.length} frågor att repetera` : 'Inget att repetera idag',
              dotColor: 'var(--color-gold)',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
                  <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.59"/>
                </svg>
              ),
            },
            {
              path: '/exam-select',
              title: 'Provsimulatorn',
              desc: 'Gamla högskoleprov och provpass med tid',
              dotColor: 'var(--color-terracotta)',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
                  <circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3"/><path d="M9.5 3h5"/>
                </svg>
              ),
            },
            {
              path: '/bookmarks',
              title: 'Sparade frågor',
              desc: bookmarkedIds.length > 0 ? `${bookmarkedIds.length} bokmärkta frågor` : 'Inga sparade frågor än',
              dotColor: 'var(--color-green)',
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-muted)] shrink-0">
                  <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/>
                </svg>
              ),
            },
          ].map(link => (
            <div
              key={link.path}
              onClick={() => navigate(link.path)}
              className="bg-[var(--color-card)] rounded-2xl p-4 mb-3 cursor-pointer flex items-center gap-3 border border-[var(--color-card-border)]"
            >
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: link.dotColor }} />
              {link.icon}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[var(--color-ink)]">{link.title}</div>
                <div className="text-sm text-[var(--color-ink-faint)]">{link.desc}</div>
              </div>
              <span className="text-[var(--color-ink-faint)] shrink-0">→</span>
            </div>
          ))}
        </div>

        {/* Quick-drill shortcuts */}
        {(wrongQuestionIds.length > 0 || adaptiveIds.length > 0) && (
          <div className="mb-6 space-y-2">
            {adaptiveIds.length > 0 && (
              <button
                onClick={async () => {
                  const session = await buildSession(adaptiveIds, null, true, 'drill', true)
                  saveSession(session)
                  navigate('/session')
                }}
                className="w-full rounded-2xl p-4 border border-[var(--color-green)] bg-[var(--color-green-muted)] hover:bg-[var(--color-paper-dark)] text-left transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="font-bold text-[var(--color-green)] text-sm">Fokusträning</div>
                  {weakTypes.length > 0 && (
                    <div className="flex gap-1 flex-wrap justify-end">
                      {weakTypes.map(({ type, pct }) => (
                        <span key={type} className="text-[10px] font-bold bg-[var(--color-green-muted)] text-[var(--color-green)] border border-[var(--color-green)] px-1.5 py-0.5 rounded-md">
                          {type} {pct}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-[var(--color-ink-faint)]">{adaptiveIds.length} frågor · svagaste ämnen · studieläge</div>
              </button>
            )}
            {wrongQuestionIds.length > 0 && (
              <button
                onClick={startWrongDrill}
                className="w-full rounded-2xl p-4 border border-[var(--color-gold-deep)] bg-[var(--color-gold-muted)] hover:bg-[var(--color-paper-dark)] text-left transition-colors"
              >
                <div className="font-bold text-[var(--color-gold-deep)] text-sm">Öva på dina fel</div>
                <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">{wrongQuestionIds.length} frågor du svarat fel på · studieläge</div>
              </button>
            )}
          </div>
        )}

        {/* Top CTA — quick launch before section drills */}
        <button
          onClick={start}
          disabled={!canStart}
          className="btn-primary w-full mb-6 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {canStart ? 'Starta träning →' : 'Inga frågor tillgängliga'}
        </button>

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
                  onClick={async () => {
                    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, sectionCount)
                    const session = await buildSession(shuffled.map(q => q.id), timeSecs, false, 'drill')
                    saveSession(session)
                    navigate('/session')
                  }}
                  className="rounded-xl p-3.5 border text-left transition-all duration-150"
                  style={{ borderColor: accent.ring, backgroundColor: accent.bg }}
                >
                  <div className="font-black text-sm" style={{ color: accent.color }}>{t === 'LAS' ? 'LÄS' : t}</div>
                  <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">{sectionCount} frågor · {timeLabel}</div>
                </button>
              )
            })}
          </div>
        </div>

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
                    <span className="ml-2 text-[var(--color-green)] normal-case font-normal tracking-normal">
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
                          ? 'border-[var(--color-green)] bg-[var(--color-green-muted)] text-[var(--color-green)]'
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
                        ? 'border-[var(--color-green)] bg-[var(--color-green-muted)]'
                        : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                    }`}
                  >
                    <div className={`font-bold text-sm ${timed === t ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-muted)]'}`}>
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
                      ? 'border-[var(--color-green)] bg-[var(--color-green-muted)]'
                      : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                  }`}
                >
                  <div className={`font-bold text-sm ${instantFeedback && !studyMode ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-muted)]'}`}>Direkt</div>
                  <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">Rätt/fel efter varje svar</div>
                </button>
                <button
                  onClick={() => { setInstantFeedback(false); setStudyMode(false) }}
                  className={`rounded-xl p-3.5 border text-left transition-all duration-150 ${
                    !instantFeedback && !studyMode
                      ? 'border-[var(--color-green)] bg-[var(--color-green-muted)]'
                      : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                  }`}
                >
                  <div className={`font-bold text-sm ${!instantFeedback && !studyMode ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-muted)]'}`}>I efterhand</div>
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
                    ? 'border-[var(--color-green)] bg-[var(--color-green-muted)]'
                    : 'bg-[var(--color-paper-dark)] border-[var(--color-card-border)] hover:border-[var(--color-ink-muted)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold text-sm ${studyMode ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-muted)]'}`}>Studieläge</div>
                    <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5">
                      Förklaringar alltid synliga · betygsätt svårigheten för SRS
                    </div>
                  </div>
                  <div className={`ml-4 w-9 h-5 rounded-full transition-colors flex items-center shrink-0 ${studyMode ? 'bg-[var(--color-green)]' : 'bg-[var(--color-paper-dark)]'}`}>
                    <div className={`w-3.5 h-3.5 rounded-full bg-[var(--color-cream)] mx-0.5 transition-transform ${studyMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </button>
            </div>
            </>)}

        {available === 0 && (
          <p className="text-[var(--color-gold-deep)] text-sm mb-4 text-center">
            Inga frågor matchar filtren — justera svårighetsgrad, ämnen eller delprov.
          </p>
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
