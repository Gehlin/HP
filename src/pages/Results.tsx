import { useNavigate } from 'react-router-dom'
import { loadSession, saveSession } from '../utils/session'
import { questions } from '../data/questions'
import type { QuestionType, AnswerKey } from '../types'
import MathText from '../components/MathText'
import { useState, useEffect } from 'react'
import { loadStats, saveStats, getLevel } from '../utils/gamification'

interface XpInfo {
  earned: number
  easy: number
  medium: number
  hard: number
  stats: ReturnType<typeof loadStats>
  level: ReturnType<typeof getLevel>
  leveledUp: boolean
  streakIncreased: boolean
}

export default function Results() {
  const navigate = useNavigate()
  const session = loadSession()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'flagged'>('all')
  const [cardVisible, setCardVisible] = useState(false)
  const [xpInfo, setXpInfo] = useState<XpInfo | null>(null)

  const sessionQuestions = session
    ? (session.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as typeof questions)
    : []

  useEffect(() => {
    if (!session) return

    const sq = session.questionIds
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean) as typeof questions

    const easyCorrect = sq.filter(q => q.difficulty === 'easy' && session.answers[q.id] === q.answer).length
    const medCorrect = sq.filter(q => q.difficulty === 'medium' && session.answers[q.id] === q.answer).length
    const hardCorrect = sq.filter(q => q.difficulty === 'hard' && session.answers[q.id] === q.answer).length
    const earned = easyCorrect * 10 + medCorrect * 15 + hardCorrect * 25 + 20

    let leveledUp = false
    let streakIncreased = false

    if (session.xpEarned === undefined) {
      const statsBefore = loadStats()
      const levelBefore = getLevel(statsBefore.xp)
      const statsAfter = { ...statsBefore, xp: statsBefore.xp + earned }
      saveStats(statsAfter)
      const levelAfter = getLevel(statsAfter.xp)
      leveledUp = levelAfter.level > levelBefore.level
      if (session.streakBefore !== undefined) {
        streakIncreased = statsAfter.streak > session.streakBefore
      }
      saveSession({ ...session, xpEarned: earned })
    }

    const stats = loadStats()
    setXpInfo({
      earned: session.xpEarned ?? earned,
      easy: easyCorrect,
      medium: medCorrect,
      hard: hardCorrect,
      stats,
      level: getLevel(stats.xp),
      leveledUp,
      streakIncreased,
    })

    const t = setTimeout(() => setCardVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  if (!session) return <div className="p-8 text-white">Ingen session hittades.</div>

  const skipped = session.skipped ?? []
  const correct = sessionQuestions.filter(q => session.answers[q.id] === q.answer).length
  const total = sessionQuestions.length
  const skippedCount = sessionQuestions.filter(q => skipped.includes(q.id)).length
  const pct = Math.round((correct / total) * 100)

  const byType: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 },
    KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 },
    DTK: { correct: 0, total: 0 },
  }
  sessionQuestions.forEach(q => {
    byType[q.type].total++
    if (session.answers[q.id] === q.answer) byType[q.type].correct++
  })

  const duration = session.endTime ? Math.round((session.endTime - session.startTime) / 1000) : 0
  const fmtDuration = `${Math.floor(duration / 60)}m ${duration % 60}s`

  const scoreLabel = pct >= 85 ? '🏆 Utmärkt!' : pct >= 65 ? '👍 Bra jobbat' : pct >= 45 ? '📈 Fortsätt öva' : '💪 Mer träning krävs'

  const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

  const xpProgress = xpInfo
    ? xpInfo.level.level === 10
      ? 100
      : Math.min(100, Math.round(
          ((xpInfo.stats.xp - xpInfo.level.currentLevelXp) /
            (xpInfo.level.nextLevelXp - xpInfo.level.currentLevelXp)) * 100
        ))
    : 0

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-2">Resultat</h1>
        <p className="text-slate-400 mb-8">{scoreLabel}</p>

        {/* XP earned card */}
        {xpInfo && (
          <div className={`mb-6 transition-all duration-500 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            {xpInfo.leveledUp && (
              <div className="bg-amber-500/20 border border-amber-500 rounded-xl px-4 py-3 mb-3 text-center">
                <span className="text-amber-400 font-bold">⭐ Ny nivå uppnådd! Nivå {xpInfo.level.level} — {xpInfo.level.label}</span>
              </div>
            )}
            {xpInfo.streakIncreased && (
              <div className="bg-orange-500/20 border border-orange-500 rounded-xl px-4 py-3 mb-3 text-center">
                <span className="text-orange-400 font-bold">🔥 {xpInfo.stats.streak} dagars streak!</span>
              </div>
            )}
            <div className="bg-slate-800 border border-blue-500/30 rounded-2xl p-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-blue-400">+{xpInfo.earned} XP</span>
                <span className="text-slate-400 text-sm">intjänat</span>
              </div>
              <div className="space-y-0.5 mb-4 text-sm text-slate-400">
                {xpInfo.easy > 0 && (
                  <div>{xpInfo.easy} lätt × 10 = <span className="text-slate-300">{xpInfo.easy * 10} XP</span></div>
                )}
                {xpInfo.medium > 0 && (
                  <div>{xpInfo.medium} medel × 15 = <span className="text-slate-300">{xpInfo.medium * 15} XP</span></div>
                )}
                {xpInfo.hard > 0 && (
                  <div>{xpInfo.hard} svår × 25 = <span className="text-slate-300">{xpInfo.hard * 25} XP</span></div>
                )}
                <div>Sessionbonus = <span className="text-slate-300">20 XP</span></div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Nivå {xpInfo.level.level} — {xpInfo.level.label}</span>
                {xpInfo.level.level < 10 && (
                  <span>
                    {xpInfo.stats.xp - xpInfo.level.currentLevelXp} / {xpInfo.level.nextLevelXp - xpInfo.level.currentLevelXp} XP
                  </span>
                )}
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Score card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 text-center">
          <div className="text-7xl font-black text-blue-400">{pct}%</div>
          <div className="text-slate-400 mt-1">
            {correct} av {total} rätt{skippedCount > 0 && ` · ${skippedCount} hoppade`} · {fmtDuration}
          </div>
          <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* By type */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
            .filter(([, v]) => v.total > 0)
            .map(([type, v]) => {
              const p = Math.round((v.correct / v.total) * 100)
              return (
                <div key={type} className="bg-slate-800 rounded-xl p-4">
                  <div className="font-black text-blue-400">{type}</div>
                  <div className="text-2xl font-bold mt-1">{p}%</div>
                  <div className="text-xs text-slate-400">{v.correct}/{v.total} rätt</div>
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
        </div>

        {/* Review */}
        <h2 className="text-xl font-black mb-4">Genomgång</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setReviewFilter('all')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'all' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
          >
            Alla ({sessionQuestions.length})
          </button>
          <button
            onClick={() => setReviewFilter('flagged')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'flagged' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-slate-700 text-slate-400 hover:border-slate-500'}`}
          >
            ★ Markerade ({(session.flagged ?? []).length})
          </button>
        </div>
        <div className="space-y-3 mb-8">
          {sessionQuestions.filter(q => reviewFilter === 'all' || (session.flagged ?? []).includes(q.id)).map(q => {
            const isSkipped = skipped.includes(q.id)
            const userAnswer = session.answers[q.id]
            const ok = !isSkipped && userAnswer === q.answer
            const isFlagged = (session.flagged ?? []).includes(q.id)
            const expanded = expandedId === q.id
            const answerOptions = Object.entries(q.options).filter(([k]) =>
              ANSWER_KEYS.includes(k as AnswerKey)
            ) as [AnswerKey, string][]

            const borderCls = ok ? 'border-emerald-700' : isSkipped ? 'border-slate-600' : 'border-red-700'
            const bgCls = ok ? 'bg-emerald-900/20' : isSkipped ? 'bg-slate-800/40' : 'bg-red-900/20'
            const indicator = ok ? '✓' : isSkipped ? '→' : '✗'

            return (
              <div
                key={q.id}
                className={`rounded-xl border overflow-hidden ${borderCls}`}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left ${bgCls}`}
                >
                  <span className={`text-lg ${isSkipped ? 'text-slate-400' : ''}`}>{indicator}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                      {q.type} · {q.source}
                      {isFlagged && <span className="text-amber-400">★</span>}
                    </div>
                    <div className="text-sm line-clamp-2">
                      <MathText text={q.text} />
                    </div>
                  </div>
                  <span className="text-slate-500 text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 bg-slate-800/50">
                    <div className="grid gap-2 mt-3">
                      {answerOptions.map(([key, text]) => {
                        let cls = 'border-slate-600 text-slate-400'
                        if (key === q.answer) cls = 'border-emerald-500 text-emerald-300'
                        if (key === userAnswer && key !== q.answer) cls = 'border-red-500 text-red-300'
                        return (
                          <div key={key} className={`border rounded-lg px-3 py-2 text-sm flex gap-2 ${cls}`}>
                            <span className="font-black">{key}</span>
                            <MathText text={text} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-sm text-slate-300 bg-slate-800 rounded-lg p-3">
                      <MathText text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold transition-colors"
          >
            Ny träning
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 font-bold transition-colors"
          >
            Hem
          </button>
        </div>
      </div>
    </div>
  )
}
