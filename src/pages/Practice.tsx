import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { QuestionType, ExamSession } from '../types'
import { questions } from '../data/questions'
import { buildSession, saveSession, loadHistory } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { getBookmarks } from '../utils/bookmarks'
import { getDailyChallengeIds, markDailyChallengeCompleted } from '../utils/dailyChallenge'

type Mode = 'drill' | 'exam' | 'repetition'
type Difficulty = 'easy' | 'medium' | 'hard'

const TYPE_INFO: Record<QuestionType, { label: string; desc: string; time: string }> = {
  XYZ: { label: 'XYZ', desc: 'Matematisk problemlösning', time: '12 min / 12 frågor' },
  KVA: { label: 'KVA', desc: 'Kvantitativa jämförelser', time: '10 min / 10 frågor' },
  NOG: { label: 'NOG', desc: 'Kvantitativa resonemang', time: '10 min / 6 frågor' },
  DTK: { label: 'DTK', desc: 'Diagram, tabeller och kartor', time: '23 min / 12 frågor' },
}

// Seconds per question for each section type (based on HP time allocations)
const SECONDS_PER_QUESTION: Record<QuestionType, number> = {
  XYZ: 60,
  KVA: 60,
  NOG: 100,
  DTK: 115,
}

function computeTimeLimit(ids: string[]): number {
  return ids.reduce((acc, id) => {
    const q = questions.find(x => x.id === id)
    return acc + (q ? SECONDS_PER_QUESTION[q.type] : 60)
  }, 0)
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Lätt',
  medium: 'Medel',
  hard: 'Svår',
}

const TYPE_SELECTED: Record<QuestionType, string> = {
  XYZ: 'border-violet-500 bg-violet-600/20 text-white',
  KVA: 'border-blue-500 bg-blue-600/20 text-white',
  NOG: 'border-emerald-500 bg-emerald-600/20 text-white',
  DTK: 'border-amber-500 bg-amber-600/20 text-white',
}

const TYPE_LABEL_COLOR: Record<QuestionType, string> = {
  XYZ: 'text-violet-400',
  KVA: 'text-blue-400',
  NOG: 'text-emerald-400',
  DTK: 'text-amber-400',
}

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const ALL_TAGS = Array.from(new Set(questions.flatMap(q => q.tags))).sort()

export default function Practice() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const tagParam = searchParams.get('tag')

  const [mode, setMode] = useState<Mode>('drill')
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['XYZ', 'KVA', 'NOG', 'DTK'])
  const [timed, setTimed] = useState(false)
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [count, setCount] = useState(20)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([...ALL_DIFFICULTIES])
  const [selectedTags, setSelectedTags] = useState<string[]>(() =>
    tagParam && ALL_TAGS.includes(tagParam) ? [tagParam] : [...ALL_TAGS]
  )
  const [tagsOpen, setTagsOpen] = useState(!!tagParam)
  const [studyMode, setStudyMode] = useState(false)

  const toggleType = (t: QuestionType) => {
    setSelectedTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  const toggleDifficulty = (d: Difficulty) => {
    setSelectedDifficulties(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]
    )
  }

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
    const counts: Record<QuestionType, number> = { XYZ: 0, KVA: 0, NOG: 0, DTK: 0 }
    dueIds.forEach(id => {
      const q = questions.find(x => x.id === id)
      if (q) counts[q.type]++
    })
    return counts
  }, [dueIds])

  const bookmarkedIds = useMemo(() => getBookmarks().filter(id => questions.some(q => q.id === id)), [])
  const isDaily = searchParams.get('daily') === '1'

  // Auto-start daily challenge if navigated with ?daily=1
  useEffect(() => {
    if (!isDaily) return
    const ids = getDailyChallengeIds()
    const session = buildSession(ids, null, true, 'drill')
    saveSession(session)
    markDailyChallengeCompleted()
    navigate('/session', { replace: true })
  }, [])

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

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10 pb-24">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm">
          ← Tillbaka
        </button>

        <h1 className="text-3xl font-black mb-8">Konfigurera träning</h1>

        {/* Quick-drill shortcuts */}
        {(wrongQuestionIds.length > 0 || bookmarkedIds.length > 0) && (
          <section className="mb-8 space-y-3">
            {wrongQuestionIds.length > 0 && (
              <button
                onClick={startWrongDrill}
                className="w-full rounded-xl p-4 border border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-colors"
              >
                <div className="font-bold text-amber-400">Öva på dina fel — {wrongQuestionIds.length} frågor du svarat fel på</div>
                <div className="text-xs text-amber-300/70 mt-1">Starta direkt med studieläge och omedelbar återkoppling</div>
              </button>
            )}
            {bookmarkedIds.length > 0 && (
              <button
                onClick={startBookmarkDrill}
                className="w-full rounded-xl p-4 border border-blue-600 bg-blue-600/10 hover:bg-blue-600/20 text-left transition-colors"
              >
                <div className="font-bold text-blue-400">🔖 Bokmärkta frågor — {bookmarkedIds.length} sparade</div>
                <div className="text-xs text-blue-300/70 mt-1">Öva på frågor du valt att spara</div>
              </button>
            )}
          </section>
        )}

        {/* Mode */}
        <section className="mb-8">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Läge</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setMode('drill')}
              className={`rounded-xl p-4 border text-left transition-colors ${mode === 'drill' ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
            >
              <div className="font-bold">Övning</div>
              <div className="text-xs text-slate-400 mt-1">Välj delprov och antal frågor</div>
            </button>
            <button
              onClick={() => setMode('exam')}
              className={`rounded-xl p-4 border text-left transition-colors ${mode === 'exam' ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
            >
              <div className="font-bold">Provläge</div>
              <div className="text-xs text-slate-400 mt-1">Fullständigt prov, 40 frågor</div>
            </button>
            <button
              onClick={() => setMode('repetition')}
              className={`rounded-xl p-4 border text-left transition-colors ${mode === 'repetition' ? 'border-purple-500 bg-purple-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
            >
              <div className="font-bold">Repetition</div>
              <div className="text-xs text-slate-400 mt-1">
                {dueIds.length > 0 ? `${dueIds.length} frågor att repetera` : 'Inga frågor idag'}
              </div>
            </button>
          </div>
        </section>

        {mode === 'repetition' && (
          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800 p-5">
            {dueIds.length === 0 ? (
              <p className="text-center text-slate-400">Inga frågor att repetera idag — kom tillbaka imorgon!</p>
            ) : (
              <>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  {dueIds.length} frågor att repetera
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(dueByType) as [QuestionType, number][])
                    .filter(([, n]) => n > 0)
                    .map(([type, n]) => (
                      <div key={type} className={`rounded-lg p-2.5 text-center bg-slate-700/60 border border-slate-600`}>
                        <div className={`text-xs font-black mb-1 ${TYPE_LABEL_COLOR[type]}`}>{type}</div>
                        <div className="text-lg font-black text-white">{n}</div>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-3">Studieläge aktiveras automatiskt vid repetition.</p>
              </>
            )}
          </div>
        )}

        {mode !== 'repetition' && (
          <>
            {/* Question types */}
            <section className="mb-8">
              <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Delprov</label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(TYPE_INFO) as QuestionType[]).map(t => {
                  const cnt = questions.filter(q => q.type === t).length
                  const isSelected = selectedTypes.includes(t)
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className={`rounded-xl p-4 border text-left transition-colors ${isSelected ? TYPE_SELECTED[t] : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                    >
                      <div className={`font-black text-lg ${isSelected ? TYPE_LABEL_COLOR[t] : 'text-white'}`}>{t}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{TYPE_INFO[t].desc}</div>
                      <div className="text-xs text-slate-500 mt-1">{cnt} frågor</div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* Difficulty filter */}
            <section className="mb-8">
              <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Svårighetsgrad</label>
              <div className="flex gap-3">
                {ALL_DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    onClick={() => toggleDifficulty(d)}
                    className={`flex-1 rounded-xl py-3 px-4 border font-bold transition-colors ${
                      selectedDifficulties.includes(d)
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {DIFFICULTY_LABELS[d]}
                  </button>
                ))}
              </div>
            </section>

            {/* Topic/tag filter */}
            <section className="mb-8">
              <button
                onClick={() => setTagsOpen(prev => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold tracking-widest text-slate-400 uppercase mb-3"
              >
                <span>
                  Ämnesfilter
                  {!allTagsSelected && (
                    <span className="ml-2 text-blue-400 normal-case font-normal tracking-normal">
                      ({selectedTags.length} av {ALL_TAGS.length})
                    </span>
                  )}
                </span>
                <span className="text-slate-500">{tagsOpen ? '▲' : '▼'}</span>
              </button>
              {tagsOpen && (
                <div className="flex flex-wrap gap-2">
                  {ALL_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'border-blue-500 bg-blue-600/20 text-white'
                          : 'border-slate-700 bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Count */}
            <section className="mb-8">
              <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">
                Antal frågor — {Math.min(count, available)} (av {available} tillgängliga)
              </label>
              <input
                type="range"
                min={5}
                max={Math.max(available, 5)}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>5</span><span>{available}</span>
              </div>
            </section>

            {/* Timer */}
            <section className="mb-8">
              <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Tidsgräns</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setTimed(false)}
                  className={`rounded-xl p-4 border text-left transition-colors ${!timed ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                  <div className="font-bold">Utan tid</div>
                  <div className="text-xs text-slate-400 mt-1">Ta den tid du behöver</div>
                </button>
                <button
                  onClick={() => setTimed(true)}
                  className={`rounded-xl p-4 border text-left transition-colors ${timed ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                  <div className="font-bold">Med tid</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {Math.round(computeTimeLimit(filteredPool.slice(0, Math.min(count, filteredPool.length)).map(q => q.id)) / 60)} min (baserat på HP-takt)
                  </div>
                </button>
              </div>
            </section>

            {/* Feedback */}
            <section className="mb-6">
              <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Återkoppling</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setInstantFeedback(true); setStudyMode(false) }}
                  className={`rounded-xl p-4 border text-left transition-colors ${instantFeedback && !studyMode ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                  <div className="font-bold">Direkt</div>
                  <div className="text-xs text-slate-400 mt-1">Se rätt/fel direkt efter varje svar</div>
                </button>
                <button
                  onClick={() => { setInstantFeedback(false); setStudyMode(false) }}
                  className={`rounded-xl p-4 border text-left transition-colors ${!instantFeedback && !studyMode ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                  <div className="font-bold">I efterhand</div>
                  <div className="text-xs text-slate-400 mt-1">Genomgång efter avslutat pass</div>
                </button>
              </div>
            </section>

            {/* Study mode */}
            <section className="mb-10">
              <button
                onClick={() => setStudyMode(prev => !prev)}
                className={`w-full rounded-xl p-4 border text-left transition-colors ${studyMode ? 'border-violet-500 bg-violet-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`font-bold ${studyMode ? 'text-violet-300' : ''}`}>Studieläge</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Förklaringar visas alltid — betygsätt svårighetsgraden för att träna SRS-repetition
                    </div>
                  </div>
                  <div className={`ml-4 w-10 h-6 rounded-full transition-colors flex items-center shrink-0 ${studyMode ? 'bg-violet-600' : 'bg-slate-600'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${studyMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </div>
              </button>
            </section>

            {available === 0 && (
              <p className="text-amber-400 text-sm mb-4">
                Inga frågor matchar dina filter. Justera svårighetsgrad, ämnen eller delprov.
              </p>
            )}
          </>
        )}

        <button
          onClick={start}
          disabled={mode === 'repetition' ? dueIds.length === 0 : (selectedTypes.length === 0 || available === 0)}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors rounded-2xl py-4 font-bold text-lg"
        >
          Starta träning →
        </button>
      </div>
    </div>
  )
}
