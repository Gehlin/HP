import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerKey } from '../types'
import { questions } from '../data/questions'
import { loadSession, updateAnswer, finishSession, toggleFlag, skipQuestion } from '../utils/session'
import MathText from '../components/MathText'

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

const TYPE_COLOR: Record<string, string> = {
  XYZ: 'bg-violet-600',
  KVA: 'bg-blue-600',
  NOG: 'bg-emerald-600',
  DTK: 'bg-amber-600',
}

export default function Session() {
  const navigate = useNavigate()
  const session = loadSession()

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>(session?.answers ?? {})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [keyboardUsed, setKeyboardUsed] = useState(false)
  const [flagged, setFlagged] = useState<string[]>(session?.flagged ?? [])
  const [, setSkipped] = useState<string[]>(session?.skipped ?? [])

  // Derived values computed before effects to satisfy Rules of Hooks
  const sessionQuestions = (session?.questionIds ?? [])
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean) as typeof questions

  const q = sessionQuestions[current] ?? null
  const chosen = q ? answers[q.id] : undefined
  const isRevealed = q ? !!revealed[q.id] : false
  const isCorrect = chosen === q?.answer

  const answerOptions = q
    ? (Object.entries(q.options).filter(([k]) => ANSWER_KEYS.includes(k as AnswerKey)) as [AnswerKey, string][])
    : []

  const pick = (key: AnswerKey) => {
    if (!q || isRevealed) return
    const updated = { ...answers, [q.id]: key }
    setAnswers(updated)
    updateAnswer(q.id, key)
    if (session?.instantFeedback) {
      setRevealed(r => ({ ...r, [q.id]: true }))
    }
  }

  const handleFinish = () => {
    finishSession()
    navigate('/results')
  }

  const handleSkip = () => {
    if (!q) return
    skipQuestion(q.id)
    setSkipped(s => [...s, q.id])
    if (current < sessionQuestions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      handleFinish()
    }
  }

  const handleFlag = () => {
    if (!q) return
    toggleFlag(q.id)
    setFlagged(f => f.includes(q.id) ? f.filter(id => id !== q.id) : [...f, q.id])
  }

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (!session) { navigate('/'); return }
    if (session.mode === 'timed' && session.timeLimitSeconds) {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000)
      setTimeLeft(Math.max(0, session.timeLimitSeconds - elapsed))
    }
  }, [])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) { handleFinish(); return }
    const t = setInterval(() => setTimeLeft(s => (s !== null ? s - 1 : null)), 1000)
    return () => clearInterval(t)
  }, [timeLeft])

  // Keyboard shortcuts: A–E selects answer, Enter/Space reveals or advances
  useEffect(() => {
    if (!session || !q) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toUpperCase()

      if (ANSWER_KEYS.includes(key as AnswerKey)) {
        if (!isRevealed && key in q.options) {
          e.preventDefault()
          setKeyboardUsed(true)
          pick(key as AnswerKey)
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setKeyboardUsed(true)
        if (!session.instantFeedback && chosen && !isRevealed) {
          setRevealed(r => ({ ...r, [q.id]: true }))
        } else if (chosen || isRevealed) {
          if (current < sessionQuestions.length - 1) {
            setCurrent(c => c + 1)
          } else {
            handleFinish()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRevealed, chosen, current, session?.instantFeedback, q?.id, sessionQuestions.length])

  // Early returns after all hooks
  if (!session) return null
  if (!q) return null

  const progress = ((current + 1) / sessionQuestions.length) * 100
  const lastOptionKey = answerOptions[answerOptions.length - 1]?.[0] ?? 'D'

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black px-2 py-1 rounded ${TYPE_COLOR[q.type] ?? 'bg-slate-700'}`}>
            {q.type}
          </span>
          <span className="text-slate-400 text-sm">
            Fråga {current + 1} / {sessionQuestions.length}
          </span>
          <button
            onClick={handleFlag}
            title={flagged.includes(q.id) ? 'Ta bort markering' : 'Markera fråga'}
            className={`text-sm px-2 py-1 rounded-lg border transition-colors ${flagged.includes(q.id) ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}
          >
            {flagged.includes(q.id) ? '★' : '☆'} Markera
          </button>
        </div>
        <div className="flex items-center gap-4">
          {timeLeft !== null && (
            <span className={`font-mono font-bold ${timeLeft < 120 ? 'text-red-400' : 'text-slate-300'}`}>
              {fmtTime(timeLeft)}
            </span>
          )}
          <button
            onClick={handleFinish}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-3 py-1"
          >
            Avsluta
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8 flex flex-col">
        <div className="text-xs text-slate-500 mb-4">{q.source} · #{q.number}</div>

        <div className="bg-slate-800 rounded-2xl p-6 mb-6 text-lg leading-relaxed">
          <MathText text={q.text} />
        </div>

        {/* Table data if present */}
        {q.tableData && (
          <div className="bg-slate-800 rounded-2xl p-4 mb-6 overflow-x-auto">
            {q.tableData.caption && (
              <p className="text-xs text-slate-400 mb-3">{q.tableData.caption}</p>
            )}
            <table className="text-sm w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  {q.tableData.headers.map((h, i) => (
                    <th key={i} className="text-left py-1 pr-4 text-slate-300 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {q.tableData.rows.map((row, i) => (
                  <tr key={i} className="border-b border-slate-700/50">
                    {row.map((cell, j) => (
                      <td key={j} className="py-1 pr-4 text-slate-200">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Answers */}
        <div className="grid gap-3 mb-2">
          {answerOptions.map(([key, text]) => {
            let cls = 'border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-500'
            if (chosen === key && !isRevealed) cls = 'border-blue-500 bg-blue-600/20'
            if (isRevealed && key === q.answer) cls = 'border-emerald-500 bg-emerald-600/20'
            if (isRevealed && chosen === key && key !== q.answer) cls = 'border-red-500 bg-red-600/20'
            return (
              <button
                key={key}
                onClick={() => pick(key)}
                disabled={isRevealed}
                className={`border rounded-xl p-4 text-left flex items-start gap-3 transition-colors ${cls}`}
              >
                <span className="font-black text-slate-400 w-6 shrink-0">{key}</span>
                <MathText text={text} />
              </button>
            )
          })}
        </div>

        {/* Skip button — only when no answer chosen yet */}
        {!chosen && !isRevealed && (
          <div className="flex justify-center mt-1">
            <button
              onClick={handleSkip}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
            >
              Hoppa över →
            </button>
          </div>
        )}

        {/* Keyboard hint — hidden after first keyboard interaction */}
        {!keyboardUsed && (
          <p className="text-center text-xs text-slate-600 mt-2 mb-2">
            Tryck A–{lastOptionKey} för att svara · Enter för att gå vidare
          </p>
        )}

        {/* Feedback */}
        {isRevealed && (
          <div className={`rounded-xl p-4 mb-6 ${isCorrect ? 'bg-emerald-900/40 border border-emerald-700' : 'bg-red-900/40 border border-red-700'}`}>
            <div className="font-bold mb-1">{isCorrect ? '✓ Rätt!' : `✗ Fel — rätt svar: ${q.answer}`}</div>
            <div className="text-sm text-slate-300 leading-relaxed">
              <MathText text={q.explanation} />
            </div>
          </div>
        )}

        {/* Reveal / Next */}
        <div className="flex gap-3 mt-auto">
          {!session.instantFeedback && chosen && !isRevealed && (
            <button
              onClick={() => setRevealed(r => ({ ...r, [q.id]: true }))}
              className="flex-1 border border-slate-600 hover:bg-slate-800 rounded-xl py-3 font-bold transition-colors"
            >
              Visa svar
            </button>
          )}
          {current < sessionQuestions.length - 1 ? (
            <button
              onClick={() => setCurrent(c => c + 1)}
              disabled={!chosen && !isRevealed}
              className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl py-3 font-bold transition-colors"
            >
              Nästa →
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-bold transition-colors"
            >
              Avsluta och visa resultat
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
