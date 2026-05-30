import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuestionType } from '../types'
import { questions } from '../data/questions'
import { buildSession, saveSession, loadHistory } from '../utils/session'

type Mode = 'drill' | 'exam'
type Difficulty = 'easy' | 'medium' | 'hard'

const TYPE_INFO: Record<QuestionType, { label: string; desc: string; time: string }> = {
  XYZ: { label: 'XYZ', desc: 'Matematisk problemlösning', time: '12 min / 12 frågor' },
  KVA: { label: 'KVA', desc: 'Kvantitativa jämförelser', time: '10 min / 10 frågor' },
  NOG: { label: 'NOG', desc: 'Kvantitativa resonemang', time: '10 min / 6 frågor' },
  DTK: { label: 'DTK', desc: 'Diagram, tabeller och kartor', time: '23 min / 12 frågor' },
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Lätt',
  medium: 'Medel',
  hard: 'Svår',
}

const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']
const ALL_TAGS = Array.from(new Set(questions.flatMap(q => q.tags))).sort()

export default function Practice() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('drill')
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['XYZ'])
  const [timed, setTimed] = useState(false)
  const [instantFeedback, setInstantFeedback] = useState(true)
  const [count, setCount] = useState(20)
  const [selectedDifficulties, setSelectedDifficulties] = useState<Difficulty[]>([...ALL_DIFFICULTIES])
  const [selectedTags, setSelectedTags] = useState<string[]>([...ALL_TAGS])
  const [tagsOpen, setTagsOpen] = useState(false)

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
    const session = buildSession(shuffled.map(q => q.id), null, true, 'drill')
    saveSession(session)
    navigate('/session')
  }

  const start = () => {
    const shuffled = [...filteredPool].sort(() => Math.random() - 0.5)
    const chosen = shuffled.slice(0, Math.min(count, filteredPool.length))
    const session = buildSession(chosen.map(q => q.id), timed ? 55 * 60 : null, instantFeedback, 'drill')
    saveSession(session)
    navigate('/session')
  }

  const allTagsSelected = selectedTags.length === ALL_TAGS.length

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm">
          ← Tillbaka
        </button>

        <h1 className="text-3xl font-black mb-8">Konfigurera träning</h1>

        {/* Wrong answers quick-drill */}
        {wrongQuestionIds.length > 0 && (
          <section className="mb-8">
            <button
              onClick={startWrongDrill}
              className="w-full rounded-xl p-4 border border-amber-500 bg-amber-500/10 hover:bg-amber-500/20 text-left transition-colors"
            >
              <div className="font-bold text-amber-400">Öva på dina fel — {wrongQuestionIds.length} frågor du svarat fel på</div>
              <div className="text-xs text-amber-300/70 mt-1">Starta direkt med omedelbar återkoppling</div>
            </button>
          </section>
        )}

        {/* Mode */}
        <section className="mb-8">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Läge</label>
          <div className="grid grid-cols-2 gap-3">
            {(['drill', 'exam'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-xl p-4 border text-left transition-colors ${mode === m ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
              >
                <div className="font-bold">{m === 'drill' ? 'Övning' : 'Provläge'}</div>
                <div className="text-xs text-slate-400 mt-1">
                  {m === 'drill' ? 'Välj delprov och antal frågor' : 'Fullständigt prov, 40 frågor'}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Question types */}
        <section className="mb-8">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Delprov</label>
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(TYPE_INFO) as QuestionType[]).map(t => {
              const cnt = questions.filter(q => q.type === t).length
              return (
                <button
                  key={t}
                  onClick={() => toggleType(t)}
                  className={`rounded-xl p-4 border text-left transition-colors ${selectedTypes.includes(t) ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
                >
                  <div className="font-black text-lg">{t}</div>
                  <div className="text-xs text-slate-400">{TYPE_INFO[t].desc}</div>
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
              <div className="text-xs text-slate-400 mt-1">55 min (som riktigt HP)</div>
            </button>
          </div>
        </section>

        {/* Feedback */}
        <section className="mb-10">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 block">Återkoppling</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setInstantFeedback(true)}
              className={`rounded-xl p-4 border text-left transition-colors ${instantFeedback ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
            >
              <div className="font-bold">Direkt</div>
              <div className="text-xs text-slate-400 mt-1">Se rätt/fel direkt efter varje svar</div>
            </button>
            <button
              onClick={() => setInstantFeedback(false)}
              className={`rounded-xl p-4 border text-left transition-colors ${!instantFeedback ? 'border-blue-500 bg-blue-600/20' : 'border-slate-700 bg-slate-800 hover:bg-slate-700'}`}
            >
              <div className="font-bold">I efterhand</div>
              <div className="text-xs text-slate-400 mt-1">Genomgång efter avslutat pass</div>
            </button>
          </div>
        </section>

        {available === 0 && (
          <p className="text-amber-400 text-sm mb-4">
            Inga frågor matchar dina filter. Justera svårighetsgrad, ämnen eller delprov.
          </p>
        )}

        <button
          onClick={start}
          disabled={selectedTypes.length === 0 || available === 0}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 transition-colors rounded-2xl py-4 font-bold text-lg"
        >
          Starta träning →
        </button>
      </div>
    </div>
  )
}
