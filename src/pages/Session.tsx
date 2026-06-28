import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AnswerKey } from '../types'
import { questions } from '../data/questions'
import { SECTION_META } from '../data/exams'
import { loadSession, updateAnswer, finishSession, toggleFlag, skipQuestion, saveSession, saveQuestionTime, saveQuestionQuality } from '../utils/session'
import { isBookmarked, toggleBookmark } from '../utils/bookmarks'
import MathText from '../components/MathText'
import ExplanationCard from '../components/ExplanationCard'
import FormulaDrawer from '../components/FormulaDrawer'
import ChartView from '../components/ChartView'
import { getTopicForQuestion } from '../utils/topicLookup'
import { getPassage } from '../data/passages'

const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

const TYPE_TEXT: Record<string, string> = {
  XYZ: 'text-violet-400',
  KVA: 'text-blue-400',
  NOG: 'text-emerald-400',
  DTK: 'text-amber-400',
  ORD: 'text-rose-400',
  LAS: 'text-pink-400',
  MEK: 'text-fuchsia-400',
  ELF: 'text-purple-400',
}

const TYPE_PROGRESS: Record<string, string> = {
  XYZ: 'bg-violet-500',
  KVA: 'bg-blue-500',
  NOG: 'bg-emerald-500',
  DTK: 'bg-amber-500',
  ORD: 'bg-rose-500',
  LAS: 'bg-pink-500',
  MEK: 'bg-fuchsia-500',
  ELF: 'bg-purple-500',
}

const TYPE_BORDER_L: Record<string, string> = {
  XYZ: 'border-l-violet-500/60',
  KVA: 'border-l-blue-500/60',
  NOG: 'border-l-emerald-500/60',
  DTK: 'border-l-amber-500/60',
  ORD: 'border-l-rose-500/60',
  LAS: 'border-l-pink-500/60',
  MEK: 'border-l-fuchsia-500/60',
  ELF: 'border-l-purple-500/60',
}

const DIFFICULTY_BADGE: Record<string, string> = {
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
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

// Traps keyboard focus inside a modal while it is open
function useFocusTrap(active: boolean) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active || !ref.current) return
    const el = ref.current
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length) focusable[0].focus()
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus() }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    el.addEventListener('keydown', onTab)
    return () => el.removeEventListener('keydown', onTab)
  }, [active])
  return ref
}


const fmtTime = (s: number) => {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const QuestionTimer = memo(function QuestionTimer({ currentIdx }: { currentIdx: number }) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    setElapsed(0)
    const t = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [currentIdx])
  return (
    <span className={`font-mono text-sm tabular-nums shrink-0 ${elapsed >= 120 ? 'text-[var(--color-error)] timer-warning' : 'text-[var(--color-ink-muted)]'}`}>
      {fmtTime(elapsed)}
    </span>
  )
})

export default function Session() {
  const navigate = useNavigate()
  const session = loadSession()

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>(session?.answers ?? {})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [flagged, setFlagged] = useState<string[]>(session?.flagged ?? [])
  const [, setSkipped] = useState<string[]>(session?.skipped ?? [])
  const [undoSkip, setUndoSkip] = useState<{ qId: string; idx: number } | null>(null)
  const [cardAnimClass, setCardAnimClass] = useState('')
  const [breakScreen, setBreakScreen] = useState<BreakScreenData | null>(null)
  const [breakCountdown, setBreakCountdown] = useState(3)
  const [showFormulas, setShowFormulas] = useState(false)
  const [showJump, setShowJump] = useState(false)
  const [showFinishModal, setShowFinishModal] = useState(false)
  const [showKeyGuide, setShowKeyGuide] = useState(false)
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>(() => {
    const session = loadSession()
    if (!session) return {}
    return Object.fromEntries(session.questionIds.map(id => [id, isBookmarked(id)]))
  })
  const [sectionTimestamps, setSectionTimestamps] = useState<Record<string, number>>(
    session?.sectionTimestamps ?? {}
  )

  const questionStartRef = useRef<number>(Date.now())
  const explanationRef = useRef<HTMLDivElement>(null)
  const touchStartXRef = useRef<number | null>(null)

  const finishModalRef = useFocusTrap(showFinishModal)
  const jumpModalRef   = useFocusTrap(showJump)
  const keyGuideRef    = useFocusTrap(showKeyGuide)

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
    setShowFinishModal(false)
    recordCurrentQuestionTime()
    finishSession()
    navigate('/results')
  }, [navigate, recordCurrentQuestionTime])

  const requestFinish = useCallback(() => setShowFinishModal(true), [])

  const jumpTo = useCallback((idx: number) => {
    recordCurrentQuestionTime()
    setShowJump(false)
    setCurrent(idx)
    questionStartRef.current = Date.now()
  }, [recordCurrentQuestionTime])

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

  const pick = useCallback((key: AnswerKey) => {
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
  }, [q, isRevealed, answers, session?.instantFeedback])

  const handleSkip = useCallback(() => {
    if (!q) return
    const skippedIdx = current
    skipQuestion(q.id)
    setSkipped(s => [...s, q.id])
    if (current < sessionQuestions.length - 1) {
      setUndoSkip({ qId: q.id, idx: skippedIdx })
      handleNextQuestion()
    } else {
      handleFinish()
    }
  }, [q, current, sessionQuestions.length, handleNextQuestion, handleFinish])

  const handleUndoSkip = useCallback(() => {
    if (!undoSkip) return
    setSkipped(s => s.filter(id => id !== undoSkip.qId))
    const sess = loadSession()
    if (sess) saveSession({ ...sess, skipped: (sess.skipped ?? []).filter(id => id !== undoSkip.qId) })
    setCurrent(undoSkip.idx)
    questionStartRef.current = Date.now()
    setUndoSkip(null)
  }, [undoSkip])

  const handleFlag = useCallback(() => {
    if (!q) return
    toggleFlag(q.id)
    setFlagged(f => f.includes(q.id) ? f.filter(id => id !== q.id) : [...f, q.id])
  }, [q])

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

  useEffect(() => {
    if (!undoSkip) return
    const t = setTimeout(() => setUndoSkip(null), 4000)
    return () => clearTimeout(t)
  }, [undoSkip])

  // Keyboard shortcuts: A–E selects answer, Enter/Space reveals or advances, ? opens guide
  useEffect(() => {
    if (!session || !q || breakScreen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toUpperCase()

      if (e.key === '?') {
        e.preventDefault()
        setShowKeyGuide(v => !v)
        return
      }
      if (e.key === 'Escape') {
        setShowKeyGuide(false)
        setShowJump(false)
        setShowFinishModal(false)
        return
      }

      if (ANSWER_KEYS.includes(key as AnswerKey)) {
        if (!isRevealed && key in q.options) {
          e.preventDefault()
          pick(key as AnswerKey)
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        if (!session.instantFeedback && chosen && !isRevealed) {
          setRevealed(r => ({ ...r, [q.id]: true }))
        } else if ((chosen || isRevealed) && !isTransitioning) {
          handleNextQuestion()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRevealed, chosen, current, session?.instantFeedback, q?.id, sessionQuestions.length, isTransitioning, breakScreen, handleNextQuestion, pick])

  // Early returns after all hooks
  if (!session) return null

  // ── Section break interstitial ───────────────────────────────
  if (breakScreen) {
    const completedMeta = SECTION_META[breakScreen.completedSection]
    const nextColor = TYPE_TEXT[breakScreen.nextSection] ?? 'text-white'
    return (
      <div className="h-screen bg-app text-white flex flex-col items-center justify-center px-6">
        <div className="max-w-md w-full text-center animate-scale-in">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3.5 py-1.5 mb-4">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
              Avsnitt {breakScreen.completedSectionNumber} av 4 klart
            </span>
          </div>
          <div className="text-5xl font-black mb-2 text-emerald-400">{breakScreen.completedSection}</div>
          <div className="text-slate-500 text-sm mb-10">{completedMeta?.description}</div>

          <div className="glass rounded-2xl p-6 mb-8 text-left">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Nästa avsnitt</div>
            <div className={`text-3xl font-black mb-1 ${nextColor}`}>
              {breakScreen.nextSection}
            </div>
            <div className="text-slate-400 text-sm mb-5">{SECTION_META[breakScreen.nextSection]?.description}</div>
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-black text-white">{breakScreen.nextCount}</div>
                <div className="text-xs text-slate-600 mt-0.5">frågor</div>
              </div>
              <div>
                <div className="text-2xl font-black text-white">~{breakScreen.recommendedMin} min</div>
                <div className="text-xs text-slate-600 mt-0.5">rekommenderat</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => doBreakContinue(breakScreen, sectionTimestamps)}
            className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl px-10 py-3.5 font-bold text-base"
          >
            Fortsätt{breakCountdown > 0 && <span className="text-blue-300/70 text-sm ml-2">({breakCountdown})</span>}
          </button>

          {timeLeft !== null && (
            <div className={`mt-6 font-mono text-sm ${timeLeft < 120 ? 'text-red-400 timer-warning' : 'text-slate-600'}`}>
              {fmtTime(timeLeft)} kvar av provet
            </div>
          )}
        </div>
      </div>
    )
  }

  if (!q) return null

  const sectionMeta = SECTION_META[q.type]
  const typeColor = TYPE_TEXT[q.type] ?? 'text-slate-400'

  // Exam section time budget (recomputed every render; questionElapsed ticks every second)
  const sectionBudgetSecsLeft: number | null = isExam && sectionMeta && session
    ? (() => {
        const sectionStartMs = sectionTimestamps[q.type] ?? session.startTime
        const budgetSecs = sectionMeta.recommendedMin * 60
        const elapsedSecs = Math.round((Date.now() - sectionStartMs) / 1000)
        return budgetSecs - elapsedSecs
      })()
    : null

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col">

      {/* ── Header ────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[var(--color-paper)] border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: close button */}
          <button
            onClick={requestFinish}
            aria-label="Avsluta"
            className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Center: question counter */}
          <span className="text-sm font-semibold text-[var(--color-ink)]">
            {current + 1} / {sessionQuestions.length}
          </span>

          {/* Right: exam timer or per-question elapsed timer */}
          {timeLeft !== null ? (
            <span className={`font-mono text-sm text-[var(--color-ink-muted)] tabular-nums${timeLeft < 30 ? ' timer-warning' : ''}`}>
              {fmtTime(timeLeft)}
            </span>
          ) : (
            <QuestionTimer currentIdx={current} />
          )}
        </div>

        {/* Linear progress bar */}
        <div className="h-1 bg-[var(--color-paper-dark)]">
          <div
            className="h-full bg-[var(--color-green)] transition-all duration-300"
            style={{ width: `${(current / sessionQuestions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* ── Scrollable question area ───────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto pt-[72px]"
        onTouchStart={e => { touchStartXRef.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          if (touchStartXRef.current === null) return
          const dx = touchStartXRef.current - e.changedTouches[0].clientX
          touchStartXRef.current = null
          if (dx > 80 && (chosen || isRevealed) && !isTransitioning) handleNextQuestion()
        }}
      >
        <div className={`max-w-2xl mx-auto w-full px-4 py-6 ${cardAnimClass}`}>

          {/* Source + difficulty chips */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-slate-600 bg-white/[0.04] border border-white/[0.05] rounded-md px-2 py-0.5">
              {q.source} · #{q.number}
            </span>
            {q.difficulty !== 'medium' && (
              <span className={`text-[10px] font-bold border rounded-md px-2 py-0.5 ${DIFFICULTY_BADGE[q.difficulty] ?? ''}`}>
                {q.difficulty === 'hard' ? 'Svår' : 'Lätt'}
              </span>
            )}
          </div>

          {/* Context box */}
          {(q.context || q.passageId) && (() => {
            const passageText = q.passageId ? getPassage(q.passageId)?.text : undefined
            const displayText = passageText ?? q.context ?? ''
            return (
              <div className="glass rounded-xl px-4 py-3 mb-4 text-sm text-slate-300 leading-relaxed">
                <div className="text-[9px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">
                  {q.type === 'LAS' ? 'Lästext' : q.type === 'ELF' ? 'Reading passage' : 'Kontext'}
                </div>
                <MathText text={displayText} />
              </div>
            )
          })()}

          {/* Question text */}
          <div className={`glass rounded-2xl p-5 mb-5 text-base sm:text-[17px] leading-relaxed overflow-x-auto border-l-[3px] ${TYPE_BORDER_L[q.type] ?? 'border-l-white/10'}`}>
            <MathText text={q.text} />
          </div>

          {/* Chart */}
          {q.chartData && <ChartView data={q.chartData} />}

          {/* Table */}
          {q.tableData && (
            <div className="glass rounded-2xl p-4 mb-5 overflow-x-auto">
              {q.tableData.caption && (
                <p className="text-xs text-slate-500 mb-3">{q.tableData.caption}</p>
              )}
              <table className="text-sm w-full">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {q.tableData.headers.map((h, i) => (
                      <th key={i} className="text-left py-1.5 pr-4 text-slate-400 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {q.tableData.rows.map((row, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {row.map((cell, j) => (
                        <td key={j} className="py-1.5 pr-4 text-slate-200">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Answer options */}
          <div className="flex flex-col gap-2.5 mb-3">
            {answerOptions.map(([key, text]) => {
              const isChosen = chosen === key
              const isAnswer = key === q.answer

              let wrapCls = 'border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.12] text-slate-200 cursor-pointer'
              let keyCls = 'bg-white/[0.06] text-slate-500'

              if (isChosen && !isRevealed) {
                wrapCls = 'border-blue-500/60 bg-blue-500/10 text-white cursor-pointer'
                keyCls = 'bg-blue-600 text-white'
              }
              if (isRevealed && isAnswer) {
                wrapCls = 'border-emerald-500/50 bg-emerald-500/10 text-white reveal-correct'
                keyCls = 'bg-emerald-600 text-white'
              }
              if (isRevealed && isChosen && !isAnswer) {
                wrapCls = 'border-red-500/50 bg-red-500/10 text-white'
                keyCls = 'bg-red-600 text-white'
              }
              if (isRevealed && !isAnswer && !isChosen) {
                wrapCls = 'border-white/[0.03] bg-white/[0.01] text-slate-600 cursor-default'
                keyCls = 'bg-white/[0.04] text-slate-600'
              }

              const badgeLabel = isRevealed && isAnswer ? '✓'
                : (isRevealed && isChosen && !isAnswer) ? '✗'
                : key

              return (
                <button
                  key={key}
                  onClick={() => pick(key)}
                  disabled={isRevealed}
                  className={`w-full border rounded-xl p-3.5 text-left flex items-start gap-3 transition-all duration-150 min-h-[52px] ${wrapCls}`}
                >
                  <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${keyCls}`}>
                    {badgeLabel}
                  </span>
                  <div className="mt-0.5 flex-1 text-[15px] leading-snug">
                    <MathText text={text} />
                  </div>
                </button>
              )
            })}
          </div>

          {!chosen && !isRevealed && (
            <div className="flex justify-center mt-2">
              <button
                onClick={handleSkip}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors py-1"
              >
                Hoppa över →
              </button>
            </div>
          )}

          {isRevealed && (
            <div ref={explanationRef} style={{ scrollMarginTop: '64px' }}>
              <ExplanationCard
                isCorrect={isCorrect}
                correctAnswer={q.answer}
                correctAnswerText={q.options[q.answer]}
                explanation={q.explanation}
                explanationData={q.explanationData}
                chosenAnswer={chosen}
                onLearnMore={!isCorrect ? (() => {
                  const topic = getTopicForQuestion(q.tags)
                  if (topic) navigate(`/matematik?topic=${topic.id}&inner=lesson`)
                  else navigate('/matematik')
                }) : undefined}
                learnMoreLabel={!isCorrect ? (() => {
                  const topic = getTopicForQuestion(q.tags)
                  return topic ? `Lär dig ${topic.name}` : 'Öppna Matematikguiden'
                })() : undefined}
              />
            </div>
          )}

          {isLastInSection && (
            <div className="mt-6 text-center text-slate-600 text-xs border-t border-white/[0.04] pt-4">
              Avsnitt {sectionMeta?.number ?? '?'} av 4 klart — {questionsRemaining} frågor kvar
            </div>
          )}
        </div>
      </main>

      {/* ── Skip undo toast ──────────────────────────────────── */}
      {undoSkip && (
        <div className="fixed bottom-24 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-800 border border-white/[0.1] rounded-xl px-4 py-2.5 shadow-2xl animate-slide-up">
            <span className="text-sm text-slate-300">Fråga hoppades över</span>
            <button
              onClick={handleUndoSkip}
              className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ångra
            </button>
          </div>
        </div>
      )}

      {/* ── Key guide overlay ─────────────────────────────────── */}
      {showKeyGuide && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowKeyGuide(false)}>
          <div ref={keyGuideRef} role="dialog" aria-modal="true" aria-label="Tangentbordsgenvägar" className="bg-[#0d1320] border border-white/[0.08] rounded-2xl w-full max-w-xs p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">Tangentbordsgenvägar</div>
            <div className="space-y-3">
              {[
                { key: 'A – E', desc: 'Välj svarsalternativ' },
                { key: 'Enter / Space', desc: 'Visa svar · Nästa fråga' },
                { key: 'Escape', desc: 'Stäng overlay' },
                { key: '?', desc: 'Visa / dölj denna guide' },
              ].map(s => (
                <div key={s.key} className="flex items-center justify-between gap-4">
                  <kbd className="text-xs font-mono bg-white/[0.06] border border-white/[0.1] text-slate-300 px-2.5 py-1 rounded-lg whitespace-nowrap">{s.key}</kbd>
                  <span className="text-sm text-slate-400 text-right">{s.desc}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowKeyGuide(false)} className="mt-5 w-full text-xs text-slate-600 hover:text-slate-400 transition-colors">Stäng (Esc)</button>
          </div>
        </div>
      )}

      {/* ── Finish confirmation modal ──────────────────────────── */}
      {showFinishModal && (
        <div className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowFinishModal(false)}>
          <div ref={finishModalRef} role="dialog" aria-modal="true" aria-label="Avsluta passet" className="bg-[#0d1320] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 animate-slide-up sm:animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="text-base font-black text-white mb-1">Avsluta passet?</div>
            <p className="text-sm text-slate-500 mb-5">Du kan inte återgå till frågorna efter att du avslutat.</p>
            <div className="grid grid-cols-3 gap-3 mb-5 text-center">
              <div className="bg-white/[0.04] rounded-xl py-2.5">
                <div className="text-lg font-black text-white">{Object.keys(answers).length}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Besvarade</div>
              </div>
              <div className="bg-white/[0.04] rounded-xl py-2.5">
                <div className="text-lg font-black text-amber-400">{flagged.length}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Markerade</div>
              </div>
              <div className="bg-white/[0.04] rounded-xl py-2.5">
                <div className="text-lg font-black text-slate-400">{sessionQuestions.length - Object.keys(answers).length}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">Ej besvarade</div>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setShowFinishModal(false)} className="flex-1 glass border border-white/[0.08] hover:bg-white/[0.07] rounded-xl py-3 font-bold text-sm transition-colors">
                Fortsätt
              </button>
              <button onClick={handleFinish} className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-bold text-sm transition-colors">
                Visa resultat →
              </button>
            </div>
          </div>
        </div>
      )}

      {showJump && (
        <div
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowJump(false)}
        >
          <div
            ref={jumpModalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Hoppa till fråga"
            className="bg-[#0d1320] border border-white/[0.08] rounded-2xl w-full max-w-sm p-5 animate-slide-up sm:animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold text-slate-300">Hoppa till fråga</div>
              <button onClick={() => setShowJump(false)} className="text-slate-600 hover:text-slate-400 text-xl leading-none">×</button>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {sessionQuestions.map((sq, idx) => {
                const isAnswered = !!answers[sq.id]
                const isFlagged = flagged.includes(sq.id)
                const isCurrent = idx === current
                let cls = 'bg-white/[0.04] text-slate-600 hover:bg-white/[0.08] hover:text-slate-300'
                if (isCurrent) cls = 'bg-blue-600 text-white'
                else if (isFlagged) cls = 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                else if (isAnswered) cls = 'bg-white/[0.1] text-slate-200 hover:bg-white/[0.15]'
                return (
                  <button
                    key={sq.id}
                    onClick={() => jumpTo(idx)}
                    className={`aspect-square rounded-lg text-xs font-bold transition-colors ${cls}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-4 mt-4 text-[10px] text-slate-600">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-white/[0.1]" /> Besvarad</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-amber-500/20 border border-amber-500/30" /> Markerad</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-blue-600" /> Aktuell</span>
            </div>
          </div>
        </div>
      )}

      {showFormulas && (
        <FormulaDrawer questionType={q.type} onClose={() => setShowFormulas(false)} />
      )}

      {/* ── Action bar ────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-white/[0.05] bg-[#080C14]/95 backdrop-blur-xl px-4 py-3 pb-safe">
        <div className="max-w-2xl mx-auto flex gap-2.5">

          {!session.instantFeedback && chosen && !isRevealed && (
            <button
              onClick={() => {
                setRevealed(r => ({ ...r, [q.id]: true }))
                setTimeout(() => explanationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80)
              }}
              className="flex-1 glass border border-white/[0.1] hover:bg-white/[0.07] rounded-xl py-3 font-bold text-sm transition-colors"
            >
              Visa svar
            </button>
          )}

          {session.studyMode && isRevealed && (
            <>
              {[
                { label: 'Svårt', q: isCorrect ? 1 : 0, cls: 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15' },
                { label: 'Ok',    q: isCorrect ? 2 : 0, cls: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15' },
                { label: 'Enkelt', q: isCorrect ? 3 : 0, cls: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15' },
              ].map(({ label, q: quality, cls }) => (
                <button
                  key={label}
                  onClick={() => {
                    saveQuestionQuality(q.id, quality)
                    current < sessionQuestions.length - 1 ? handleNextQuestion() : requestFinish()
                  }}
                  disabled={isTransitioning}
                  className={`flex-1 border rounded-xl py-3 font-bold text-sm transition-colors disabled:opacity-40 ${cls}`}
                >
                  {label}
                </button>
              ))}
            </>
          )}

          {!session.studyMode && (
            current < sessionQuestions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                disabled={(!chosen && !isRevealed) || isTransitioning}
                className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-white/[0.05] disabled:text-slate-600 rounded-xl py-3 font-bold text-sm transition-colors"
              >
                Nästa →
              </button>
            ) : (
              <button
                onClick={requestFinish}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 rounded-xl py-3 font-bold text-sm transition-colors"
              >
                Avsluta och visa resultat
              </button>
            )
          )}

          {session.studyMode && !isRevealed && (
            <button
              onClick={handleNextQuestion}
              disabled={!chosen || isTransitioning}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:bg-white/[0.05] disabled:text-slate-600 rounded-xl py-3 font-bold text-sm transition-colors"
            >
              {current < sessionQuestions.length - 1 ? 'Nästa →' : 'Avsluta →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
