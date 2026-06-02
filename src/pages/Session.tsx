import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerKey } from '../types'
import { questions } from '../data/questions'
import { SECTION_META } from '../data/exams'
import { loadSession, updateAnswer, finishSession, toggleFlag, skipQuestion, saveSession, saveQuestionTime, saveQuestionQuality } from '../utils/session'
import MathText from '../components/MathText'
import ExplanationCard from '../components/ExplanationCard'

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

const TYPE_COLOR: Record<string, string> = {
  XYZ: 'bg-violet-600',
  KVA: 'bg-blue-600',
  NOG: 'bg-emerald-600',
  DTK: 'bg-amber-600',
}

const TYPE_BORDER_L: Record<string, string> = {
  XYZ: 'border-l-violet-500',
  KVA: 'border-l-blue-500',
  NOG: 'border-l-emerald-500',
  DTK: 'border-l-amber-500',
}

const DIFFICULTY_BADGE: Record<string, string> = {
  hard: 'text-red-400 bg-red-500/10 border-red-700/40',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-700/40',
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-700/40',
}

interface BreakScreenData {
  completedSection: string
  completedSectionNumber: number
  nextSection: string
  nextSectionNumber: number
  nextCount: number
  recommendedMin: number
  nextIdx: number
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
  const [cardAnimClass, setCardAnimClass] = useState('')
  const [breakScreen, setBreakScreen] = useState<BreakScreenData | null>(null)
  const [breakCountdown, setBreakCountdown] = useState(3)
  const [sectionTimestamps, setSectionTimestamps] = useState<Record<string, number>>(
    session?.sectionTimestamps ?? {}
  )

  const questionStartRef = useRef<number>(Date.now())
  const explanationRef = useRef<HTMLDivElement>(null)

  const isTransitioning = cardAnimClass !== ''
  const isExam = session?.type === 'exam'

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

  // Whether this is the last question of its section (for exam mode footer)
  const isLastInSection = isExam && q
    && current < sessionQuestions.length - 1
    && sessionQuestions[current + 1]?.type !== q.type

  const questionsRemaining = sessionQuestions.length - current - 1

  const recordCurrentQuestionTime = useCallback(() => {
    if (q) saveQuestionTime(q.id, Date.now() - questionStartRef.current)
  }, [q])

  const advanceQuestion = useCallback(() => {
    recordCurrentQuestionTime()
    setCardAnimClass('slide-out-left')
    setTimeout(() => {
      setCurrent(c => c + 1)
      questionStartRef.current = Date.now()
      setCardAnimClass('slide-in-right')
      setTimeout(() => setCardAnimClass(''), 160)
    }, 150)
  }, [recordCurrentQuestionTime])

  const doBreakContinue = useCallback((data: BreakScreenData, timestamps: Record<string, number>) => {
    const ts = Date.now()
    const newTs = { ...timestamps, [data.nextSection]: ts }
    setSectionTimestamps(newTs)
    const sess = loadSession()
    if (sess) saveSession({ ...sess, sectionTimestamps: newTs })
    setBreakScreen(null)
    setCurrent(data.nextIdx)
    setCardAnimClass('slide-in-right')
    setTimeout(() => setCardAnimClass(''), 160)
  }, [])

  const handleFinish = useCallback(() => {
    recordCurrentQuestionTime()
    finishSession()
    navigate('/results')
  }, [navigate, recordCurrentQuestionTime])

  const handleNextQuestion = useCallback(() => {
    const nextIdx = current + 1
    if (nextIdx >= sessionQuestions.length) {
      handleFinish()
      return
    }

    const currType = sessionQuestions[current]?.type
    const nextType = sessionQuestions[nextIdx]?.type

    if (isExam && currType && nextType && currType !== nextType) {
      const nextMeta = SECTION_META[nextType]
      const nextCount = sessionQuestions.filter(qq => qq.type === nextType).length
      setBreakScreen({
        completedSection: currType,
        completedSectionNumber: SECTION_META[currType]?.number ?? 0,
        nextSection: nextType,
        nextSectionNumber: nextMeta?.number ?? 0,
        nextCount,
        recommendedMin: nextMeta?.recommendedMin ?? 0,
        nextIdx,
      })
      setBreakCountdown(3)
      return
    }

    advanceQuestion()
  }, [current, sessionQuestions, isExam, advanceQuestion, handleFinish])

  const pick = (key: AnswerKey) => {
    if (!q || isRevealed) return
    const updated = { ...answers, [q.id]: key }
    setAnswers(updated)
    updateAnswer(q.id, key)
    if (session?.instantFeedback) {
      setRevealed(r => ({ ...r, [q.id]: true }))
      setTimeout(() => {
        explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 80)
    }
  }

  const handleSkip = () => {
    if (!q) return
    skipQuestion(q.id)
    setSkipped(s => [...s, q.id])
    if (current < sessionQuestions.length - 1) {
      handleNextQuestion()
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

  // Auto-advance break screen after 3 seconds + countdown
  useEffect(() => {
    if (!breakScreen) return

    const countdownInterval = setInterval(() => {
      setBreakCountdown(c => Math.max(0, c - 1))
    }, 1000)

    const autoAdvance = setTimeout(() => {
      doBreakContinue(breakScreen, sectionTimestamps)
    }, 3000)

    return () => {
      clearInterval(countdownInterval)
      clearTimeout(autoAdvance)
    }
  }, [breakScreen?.nextSection])

  // Keyboard shortcuts: A–E selects answer, Enter/Space reveals or advances
  useEffect(() => {
    if (!session || !q || breakScreen) return

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
        } else if ((chosen || isRevealed) && !isTransitioning) {
          handleNextQuestion()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRevealed, chosen, current, session?.instantFeedback, q?.id, sessionQuestions.length, isTransitioning, breakScreen, handleNextQuestion])

  // Early returns after all hooks
  if (!session) return null

  // Section break interstitial
  if (breakScreen) {
    const completedMeta = SECTION_META[breakScreen.completedSection]
    return (
      <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="text-slate-400 text-sm mb-2 font-semibold uppercase tracking-widest">
            Avsnitt {breakScreen.completedSectionNumber} av 4 klart
          </div>
          <div className="text-4xl font-black mb-2 text-emerald-400">✓ {breakScreen.completedSection}</div>
          <div className="text-slate-400 text-sm mb-10">
            {completedMeta?.description}
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
            <div className="text-slate-400 text-xs uppercase tracking-widest mb-3">Nästa avsnitt</div>
            <div className={`text-3xl font-black mb-1 ${TYPE_COLOR[breakScreen.nextSection]?.replace('bg-', 'text-').replace('-600', '-400') ?? 'text-white'}`}>
              Avsnitt {breakScreen.nextSectionNumber} — {breakScreen.nextSection}
            </div>
            <div className="text-slate-300 text-sm mb-4">
              {SECTION_META[breakScreen.nextSection]?.description}
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{breakScreen.nextCount}</div>
                <div className="text-slate-400">frågor</div>
              </div>
              <div className="text-slate-700 text-2xl">|</div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">~{breakScreen.recommendedMin}</div>
                <div className="text-slate-400">min rekommenderat</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => doBreakContinue(breakScreen, sectionTimestamps)}
            className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl px-10 py-3 font-bold text-lg"
          >
            Fortsätt → {breakCountdown > 0 && <span className="text-blue-300 text-sm ml-1">({breakCountdown})</span>}
          </button>

          {timeLeft !== null && (
            <div className={`mt-6 font-mono text-sm ${timeLeft < 120 ? 'text-red-400 timer-warning' : 'text-slate-500'}`}>
              {fmtTime(timeLeft)} kvar av provet
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!q) return null

  const progress = ((current + 1) / sessionQuestions.length) * 100
  const lastOptionKey = answerOptions[answerOptions.length - 1]?.[0] ?? 'D'

  const sectionMeta = SECTION_META[q.type]

  return (
    <div className="h-screen sm:h-auto sm:min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className={`text-xs font-black px-2 py-1 rounded shrink-0 ${TYPE_COLOR[q.type] ?? 'bg-slate-700'}`}>
            {isExam && sectionMeta
              ? `Avsnitt ${sectionMeta.number}/4 — ${q.type}`
              : q.type}
          </span>
          <span className="text-slate-400 text-sm shrink-0">
            {current + 1} / {sessionQuestions.length}
          </span>
          <button
            onClick={handleFlag}
            title={flagged.includes(q.id) ? 'Ta bort markering' : 'Markera fråga'}
            className={`text-sm px-2 py-1 rounded-lg border transition-colors shrink-0 ${flagged.includes(q.id) ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'}`}
          >
            {flagged.includes(q.id) ? '★' : '☆'}<span className="hidden sm:inline"> Markera</span>
          </button>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {timeLeft !== null && (
            <span className={`font-mono font-bold text-sm sm:text-base ${timeLeft < 120 ? 'text-red-400 timer-warning' : 'text-slate-300'}`}>
              {fmtTime(timeLeft)}
            </span>
          )}
          <button
            onClick={handleFinish}
            className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2 sm:px-3 py-1"
          >
            Avsluta
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800 shrink-0">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Scrollable question area */}
      <main className="flex-1 overflow-y-auto">
        <div className={`max-w-2xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-8 ${cardAnimClass}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-medium text-slate-500 bg-slate-800 border border-slate-700 rounded px-2 py-0.5">
              {q.source} · #{q.number}
            </span>
            {q.difficulty !== 'medium' && (
              <span className={`text-[10px] font-bold border rounded px-2 py-0.5 ${DIFFICULTY_BADGE[q.difficulty] ?? ''}`}>
                {q.difficulty === 'hard' ? 'Svår' : 'Lätt'}
              </span>
            )}
          </div>

          {q.context && (
            <div className="bg-slate-800/80 rounded-xl px-4 py-3 mb-4 text-sm text-slate-300 leading-relaxed border border-slate-700/60">
              <div className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-1.5">Kontext</div>
              <MathText text={q.context} />
            </div>
          )}

          <div className={`bg-slate-800 rounded-2xl p-4 sm:p-6 mb-6 text-base sm:text-lg leading-relaxed overflow-x-auto border-l-4 ${TYPE_BORDER_L[q.type] ?? 'border-l-slate-600'}`}>
            <MathText text={q.text} />
          </div>

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

          <div className="grid gap-3 mb-2">
            {answerOptions.map(([key, text]) => {
              const isChosen = chosen === key
              const isAnswer = key === q.answer

              let cls = 'border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 hover:border-slate-500 text-slate-200 cursor-pointer'
              let labelCls = 'bg-slate-700 text-slate-400'
              if (isChosen && !isRevealed) {
                cls = 'border-blue-500 bg-blue-600/20 text-white cursor-pointer'
                labelCls = 'bg-blue-600 text-white'
              }
              if (isRevealed && isAnswer) {
                cls = 'border-emerald-500 bg-emerald-600/15 text-white reveal-correct'
                labelCls = 'bg-emerald-600 text-white'
              }
              if (isRevealed && isChosen && !isAnswer) {
                cls = 'border-red-500 bg-red-600/15 text-white'
                labelCls = 'bg-red-600 text-white'
              }
              if (isRevealed && !isAnswer && !isChosen) {
                cls = 'border-slate-700/50 bg-slate-800/40 text-slate-500 cursor-default'
                labelCls = 'bg-slate-700/60 text-slate-500'
              }

              const badgeLabel = isRevealed && isAnswer
                ? '✓'
                : (isRevealed && isChosen && !isAnswer)
                  ? '✗'
                  : key

              return (
                <button
                  key={key}
                  onClick={() => pick(key)}
                  disabled={isRevealed}
                  className={`w-full border rounded-xl p-4 text-left flex items-start gap-3 transition-all min-h-14 ${cls}`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${labelCls}`}>
                    {badgeLabel}
                  </span>
                  <div className="mt-0.5 flex-1">
                    <MathText text={text} />
                  </div>
                </button>
              )
            })}
          </div>

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

          {!keyboardUsed && (
            <p className="text-center text-xs text-slate-600 mt-2 mb-2">
              Tryck A–{lastOptionKey} för att svara · Enter för att gå vidare
            </p>
          )}

          {isRevealed && (
            <div ref={explanationRef}>
              <ExplanationCard
                isCorrect={isCorrect}
                correctAnswer={q.answer}
                explanation={q.explanation}
                explanationData={q.explanationData}
              />
            </div>
          )}

          {/* End-of-section footer in exam mode */}
          {isLastInSection && (
            <div className="mt-6 text-center text-slate-500 text-sm border-t border-slate-700/50 pt-4">
              Avsnitt {sectionMeta?.number ?? '?'} av 4 klart — {questionsRemaining} frågor kvar
            </div>
          )}
        </div>
      </main>

      {/* Action buttons */}
      <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-3 sm:px-6 py-3 sm:py-4 pb-safe">
        <div className="max-w-2xl mx-auto flex gap-3">
          {!session.instantFeedback && chosen && !isRevealed && (
            <button
              onClick={() => {
                setRevealed(r => ({ ...r, [q.id]: true }))
                setTimeout(() => {
                  explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }, 80)
              }}
              className="flex-1 border border-slate-600 hover:bg-slate-800 rounded-xl py-3 font-bold transition-colors"
            >
              Visa svar
            </button>
          )}

          {/* Study mode: quality rating buttons replace plain Nästa */}
          {session.studyMode && isRevealed && (
            <>
              <button
                onClick={() => {
                  saveQuestionQuality(q.id, isCorrect ? 1 : 0)
                  current < sessionQuestions.length - 1 ? handleNextQuestion() : handleFinish()
                }}
                disabled={isTransitioning}
                className="flex-1 border border-red-700 bg-red-900/20 hover:bg-red-900/40 text-red-300 rounded-xl py-3 font-bold transition-colors disabled:opacity-40"
              >
                Svårt
              </button>
              <button
                onClick={() => {
                  saveQuestionQuality(q.id, isCorrect ? 2 : 0)
                  current < sessionQuestions.length - 1 ? handleNextQuestion() : handleFinish()
                }}
                disabled={isTransitioning}
                className="flex-1 border border-amber-700 bg-amber-900/20 hover:bg-amber-900/40 text-amber-300 rounded-xl py-3 font-bold transition-colors disabled:opacity-40"
              >
                Ok
              </button>
              <button
                onClick={() => {
                  saveQuestionQuality(q.id, isCorrect ? 3 : 0)
                  current < sessionQuestions.length - 1 ? handleNextQuestion() : handleFinish()
                }}
                disabled={isTransitioning}
                className="flex-1 border border-emerald-700 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-300 rounded-xl py-3 font-bold transition-colors disabled:opacity-40"
              >
                Enkelt
              </button>
            </>
          )}

          {/* Normal advance button (not study mode) */}
          {!session.studyMode && (
            current < sessionQuestions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                disabled={(!chosen && !isRevealed) || isTransitioning}
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
            )
          )}

          {/* Study mode: finish button on last question */}
          {session.studyMode && !isRevealed && (
            <button
              onClick={handleNextQuestion}
              disabled={!chosen || isTransitioning}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl py-3 font-bold transition-colors"
            >
              {current < sessionQuestions.length - 1 ? 'Nästa →' : 'Avsluta →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
