import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loadHistory } from '../utils/session'
import { questions } from '../data/questions'
import { loadStats, getLevel, LEVELS } from '../utils/gamification'
import { getStats as getSrsStats } from '../utils/srs'
import { estimateHpScore, hpScoreColor } from '../utils/hpScore'
import { computeReadiness } from '../utils/readiness'
import { getExamDate, daysUntilExam } from '../utils/examDate'
import { getBookmarks, toggleBookmark } from '../utils/bookmarks'
import { timeAnalyticsByType, accuracyByDifficulty, rollingHpScore } from '../utils/analytics'
import { ALL_ACHIEVEMENTS, getEarnedIds, RARITY_STYLES } from '../utils/achievements'
import type { QuestionType } from '../types'

const TYPE_COLORS: Record<QuestionType, { text: string; bar: string }> = {
  XYZ: { text: 'text-violet-400', bar: 'bg-violet-500' },
  KVA: { text: 'text-blue-400',   bar: 'bg-blue-500'   },
  NOG: { text: 'text-emerald-400', bar: 'bg-emerald-500' },
  DTK: { text: 'text-amber-400',  bar: 'bg-amber-500'  },
}

export default function Progress() {
  const navigate = useNavigate()
  const history = loadHistory()
  const stats = loadStats()
  const levelInfo = getLevel(stats.xp)
  const readiness = computeReadiness()
  const examDate = getExamDate()
  const daysLeft = daysUntilExam()
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() => getBookmarks())
  const timeAnalytics = timeAnalyticsByType()
  const difficultyAcc = accuracyByDifficulty()
  const rollingHp = rollingHpScore()
  const DIFFICULTY_LABELS = { easy: 'Lätt', medium: 'Medel', hard: 'Svår' } as const
  const earnedIds = new Set(getEarnedIds())

  const allAnswers: { qid: string; correct: boolean }[] = []
  history.forEach(s => {
    s.questionIds.forEach(qid => {
      const q = questions.find(x => x.id === qid)
      if (q && s.answers[qid]) {
        allAnswers.push({ qid, correct: s.answers[qid] === q.answer })
      }
    })
  })

  const byType: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 },
    KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 },
    DTK: { correct: 0, total: 0 },
  }

  allAnswers.forEach(({ qid, correct }) => {
    const q = questions.find(x => x.id === qid)
    if (q) {
      byType[q.type].total++
      if (correct) byType[q.type].correct++
    }
  })

  const totalCorrect = allAnswers.filter(a => a.correct).length
  const totalAnswered = allAnswers.length

  // Per-tag accuracy
  const byTag: Record<string, { correct: number; total: number }> = {}
  allAnswers.forEach(({ qid, correct }) => {
    const q = questions.find(x => x.id === qid)
    if (!q) return
    for (const tag of q.tags) {
      if (!byTag[tag]) byTag[tag] = { correct: 0, total: 0 }
      byTag[tag].total++
      if (correct) byTag[tag].correct++
    }
  })
  const tagStats = Object.entries(byTag)
    .filter(([, v]) => v.total >= 3)
    .map(([tag, v]) => ({ tag, pct: Math.round((v.correct / v.total) * 100), ...v }))
    .sort((a, b) => a.pct - b.pct)

  // SRS mastery overview
  const srsNew = questions.filter(q => getSrsStats(q.id) === null).length
  const srsMastered = questions.filter(q => {
    const r = getSrsStats(q.id)
    return r !== null && r.interval >= 21
  }).length
  const srsLearning = questions.length - srsNew - srsMastered

  // Accuracy trend — last 15 sessions (most recent last)
  const trendSessions = history
    .slice(0, 15)
    .reverse()
    .map(s => {
      const qs = s.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
      const c = qs.filter(q => q && s.answers[q!.id] === q!.answer).length
      return qs.length > 0 ? Math.round((c / qs.length) * 100) : 0
    })

  // Build 90-day heatmap data
  const todayMidnight = new Date()
  todayMidnight.setHours(0, 0, 0, 0)

  const questionsByDay: Record<string, number> = {}
  history.forEach(s => {
    const d = new Date(s.startTime)
    d.setHours(0, 0, 0, 0)
    const key = d.toISOString().slice(0, 10)
    questionsByDay[key] = (questionsByDay[key] ?? 0) + Object.keys(s.answers).length
  })

  const heatDays: { date: Date; count: number }[] = []
  for (let i = 89; i >= 0; i--) {
    const d = new Date(todayMidnight)
    d.setDate(d.getDate() - i)
    heatDays.push({ date: d, count: questionsByDay[d.toISOString().slice(0, 10)] ?? 0 })
  }

  // Pad front so first column starts on Sunday
  const startDow = heatDays[0].date.getDay()
  const paddedHeatDays: ({ date: Date; count: number } | null)[] = [
    ...Array(startDow).fill(null),
    ...heatDays,
  ]

  function heatColor(count: number): string {
    if (count === 0) return 'bg-slate-700'
    if (count <= 10) return 'bg-blue-900'
    if (count <= 30) return 'bg-blue-600'
    return 'bg-blue-400'
  }

  const isMaxLevel = levelInfo.level === 10
  const xpInCurrentLevel = stats.xp - levelInfo.currentLevelXp
  const xpNeededForCurrentLevel = isMaxLevel ? 1 : levelInfo.nextLevelXp - levelInfo.currentLevelXp
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInCurrentLevel / xpNeededForCurrentLevel) * 100))

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10 pb-24">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm">
          ← Tillbaka
        </button>

        <h1 className="text-3xl font-black mb-8">Min statistik</h1>

        {/* Readiness card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Provberedskap</div>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-black text-white">{readiness.score}</div>
                <div className="text-slate-500 text-sm mb-1">/100</div>
              </div>
              <div className={`text-sm font-bold mt-1 ${readiness.labelColor}`}>{readiness.label}</div>
            </div>
            <div className="text-right">
              {examDate && daysLeft !== null ? (
                <div>
                  <div className="text-xs text-slate-400 mb-1">Dagar kvar</div>
                  <div className={`text-3xl font-black ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-white'}`}>
                    {daysLeft < 0 ? '—' : daysLeft}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {examDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-blue-400 hover:text-blue-300 border border-blue-700/50 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Sätt provdatum →
                </button>
              )}
            </div>
          </div>

          <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full rounded-full transition-all duration-700 ${readiness.score >= 80 ? 'bg-emerald-500' : readiness.score >= 65 ? 'bg-blue-500' : readiness.score >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${readiness.score}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-black ${readiness.accuracy >= 70 ? 'text-emerald-400' : readiness.accuracy >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {readiness.accuracy}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Träffsäkerhet</div>
              <div className="text-[10px] text-slate-600">Senaste 10 pass</div>
            </div>
            <div>
              <div className={`text-2xl font-black ${readiness.mastery >= 50 ? 'text-emerald-400' : readiness.mastery >= 25 ? 'text-amber-400' : 'text-slate-400'}`}>
                {readiness.mastery}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Bemästrat</div>
              <div className="text-[10px] text-slate-600">SRS-intervall ≥7 dagar</div>
            </div>
            <div>
              <div className={`text-2xl font-black ${readiness.coverage >= 60 ? 'text-emerald-400' : readiness.coverage >= 30 ? 'text-amber-400' : 'text-slate-400'}`}>
                {readiness.coverage}%
              </div>
              <div className="text-xs text-slate-400 mt-1">Täckning</div>
              <div className="text-[10px] text-slate-600">Frågor sedda</div>
            </div>
          </div>
        </div>

        {/* Level Card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Nuvarande nivå</div>
              <div className="text-2xl font-black text-yellow-400">Nivå {levelInfo.level} — {levelInfo.label}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 mb-1">Totalt XP</div>
              <div className="text-2xl font-black text-blue-400">{stats.xp} XP</div>
            </div>
          </div>

          {isMaxLevel ? (
            <div className="text-xs text-yellow-400 mb-2">Maxnivå uppnådd! 🏆</div>
          ) : (
            <div className="text-xs text-slate-400 mb-2">
              {xpInCurrentLevel} / {xpNeededForCurrentLevel} XP till nivå {levelInfo.level + 1} ({levelInfo.nextLevelXp - stats.xp} XP kvar)
            </div>
          )}

          {/* Segmented progress bar — one segment per level */}
          <div className="flex gap-1 mb-1">
            {LEVELS.map((lvl, idx) => {
              const isCompleted = lvl.level < levelInfo.level
              const isCurrent = lvl.level === levelInfo.level
              let fillWidth = '0%'
              if (isCompleted) fillWidth = '100%'
              else if (isCurrent) fillWidth = `${progressPercent}%`
              return (
                <div
                  key={lvl.level}
                  className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden"
                  title={`Nivå ${lvl.level}: ${lvl.label} (${LEVELS[idx].xp} XP)`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? 'bg-yellow-400' : 'bg-blue-500'}`}
                    style={{ width: fillWidth }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Nybörjare</span>
            <span>HP-Legend</span>
          </div>
        </div>

        {/* Streak & General Stats */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Träningsstatistik</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-2xl font-black">{stats.streak}</div>
              <div className="text-xs text-slate-400">Nuv. streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-2xl font-black">{stats.longestStreak}</div>
              <div className="text-xs text-slate-400">Längsta streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📚</div>
              <div className="text-2xl font-black">{history.length}</div>
              <div className="text-xs text-slate-400">Totalt pass</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">❓</div>
              <div className="text-2xl font-black">{totalAnswered}</div>
              <div className="text-xs text-slate-400">Frågor besv.</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-black">{totalCorrect}</div>
              <div className="text-xs text-slate-400">Rätt svar</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-2xl font-black">
                {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
              </div>
              <div className="text-xs text-slate-400">Träffsäkerhet</div>
            </div>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-6">Inga träningspass ännu. Börja öva för att se din detaljerade statistik!</p>
            <button
              onClick={() => navigate('/practice')}
              className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded-xl font-bold"
            >
              Starta träning
            </button>
          </div>
        ) : (
          <>
            {/* By type */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
                .filter(([, v]) => v.total > 0)
                .map(([type, v]) => {
                  const p = Math.round((v.correct / v.total) * 100)
                  const tc = TYPE_COLORS[type]
                  return (
                    <div key={type} className="bg-slate-800 rounded-xl p-4">
                      <div className={`font-black text-lg ${tc.text}`}>{type}</div>
                      <div className="text-2xl font-bold">{p}%</div>
                      <div className="text-xs text-slate-400">{v.correct}/{v.total} rätt</div>
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full ${tc.bar} rounded-full`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* Accuracy trend chart */}
            {trendSessions.length >= 2 && (
              <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Träffsäkerhet — senaste {trendSessions.length} pass</h2>
                <div className="flex items-end gap-1 h-20 mt-4">
                  {trendSessions.map((pct, i) => {
                    const barH = Math.max(4, Math.round((pct / 100) * 80))
                    const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1" title={`Pass ${i + 1}: ${pct}%`}>
                        <div className={`w-full rounded-t ${barColor} transition-all`} style={{ height: `${barH}px` }} />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 mt-2">
                  <span>Äldst</span>
                  <span>Senast</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>{trendSessions[0]}%</span>
                  <span className={trendSessions[trendSessions.length - 1] >= 70 ? 'text-emerald-400' : trendSessions[trendSessions.length - 1] >= 50 ? 'text-amber-400' : 'text-red-400'}>
                    {trendSessions[trendSessions.length - 1]}% senast
                  </span>
                </div>
              </div>
            )}

            {/* Rolling HP + time analytics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Rolling HP score */}
              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">HP-poäng (trend)</div>
                {rollingHp !== null ? (
                  <>
                    <div className={`text-3xl font-black ${hpScoreColor(rollingHp)}`}>{rollingHp.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">Viktat snitt senaste 10 pass</div>
                    <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rollingHp >= 1.80 ? 'bg-emerald-500' : rollingHp >= 1.50 ? 'bg-blue-500' : rollingHp >= 1.25 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${((rollingHp - 1) / 1) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>1.00</span><span>2.00</span></div>
                  </>
                ) : (
                  <div className="text-sm text-slate-500 mt-2">Genomför fler pass för att se trend</div>
                )}
              </div>

              {/* Accuracy by difficulty */}
              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Träffsäkerhet per nivå</div>
                <div className="space-y-2.5">
                  {(['easy', 'medium', 'hard'] as const).map(d => {
                    const { pct, total } = difficultyAcc[d]
                    return (
                      <div key={d}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{DIFFICULTY_LABELS[d]}</span>
                          <span className={`font-bold ${pct === null ? 'text-slate-600' : pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {pct !== null ? `${pct}%` : '—'}
                            {total > 0 && <span className="text-slate-600 font-normal ml-1">({total})</span>}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct === null ? '' : pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${pct ?? 0}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Time per type vs HP standard */}
            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Tid per fråga vs HP-standard</h2>
              <div className="space-y-3">
                {(Object.entries(timeAnalytics) as [QuestionType, typeof timeAnalytics[QuestionType]][])
                  .filter(([, v]) => v.avgSeconds !== null)
                  .map(([type, v]) => {
                    const ratio = v.ratio!
                    const tc = TYPE_COLORS[type]
                    const speedLabel = ratio < 0.8 ? 'Snabb' : ratio > 1.2 ? 'Långsam' : 'I tid'
                    const speedColor = ratio < 0.8 ? 'text-emerald-400' : ratio > 1.2 ? 'text-red-400' : 'text-slate-300'
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className={`w-10 text-xs font-black shrink-0 ${tc.text}`}>{type}</span>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden relative">
                          {/* HP standard marker */}
                          <div className="absolute top-0 h-full w-0.5 bg-slate-500 z-10" style={{ left: '100%', transform: 'translateX(-1px)' }} />
                          <div
                            className={`h-full ${tc.bar} rounded-full`}
                            style={{ width: `${Math.min(150, ratio * 100)}%`, opacity: ratio > 1 ? 1 : 0.7 }}
                          />
                        </div>
                        <div className="text-right shrink-0 w-28">
                          <span className="text-xs text-white font-mono">{v.avgSeconds}s</span>
                          <span className="text-slate-600 text-xs"> / {v.hpStandard}s</span>
                          <span className={`text-[10px] ml-1 font-bold ${speedColor}`}>{speedLabel}</span>
                        </div>
                      </div>
                    )
                  })}
                {Object.values(timeAnalytics).every(v => v.avgSeconds === null) && (
                  <p className="text-sm text-slate-500">Inga tiddata ännu — börja ett träningspass med tidmätning.</p>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-3">HP-standard: XYZ 60s · KVA 60s · NOG 100s · DTK 115s per fråga</p>
            </div>

            {/* SRS mastery overview */}
            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Frågebank — masterstatus</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-400">{srsNew}</div>
                  <div className="text-xs text-slate-500 mt-1">Ej sedd</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{srsLearning}</div>
                  <div className="text-xs text-slate-500 mt-1">Inlärning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{srsMastered}</div>
                  <div className="text-xs text-slate-500 mt-1">Bemästrad</div>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-slate-600" style={{ width: `${(srsNew / questions.length) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(srsLearning / questions.length) * 100}%` }} />
                <div className="bg-emerald-500" style={{ width: `${(srsMastered / questions.length) * 100}%` }} />
              </div>
              <div className="text-xs text-slate-500 mt-2 text-right">{questions.length} frågor totalt</div>
            </div>

            {/* Bookmarks */}
            {bookmarkIds.length > 0 && (() => {
              const bookmarkedQs = bookmarkIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as typeof questions
              return (
                <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">🔖 Bokmärkta frågor</h2>
                    <span className="text-xs text-slate-500">{bookmarkIds.length} sparade</span>
                  </div>
                  <div className="space-y-2">
                    {bookmarkedQs.slice(0, 8).map(q => {
                      const tc = TYPE_COLORS[q.type]
                      return (
                        <div key={q.id} className="flex items-center gap-3 bg-slate-700/40 rounded-xl px-3 py-2.5">
                          <span className={`text-xs font-black shrink-0 ${tc.text}`}>{q.type}</span>
                          <span className="text-xs text-slate-300 flex-1 line-clamp-1">{q.text.replace(/\$[^$]+\$/g, '…')}</span>
                          <button
                            onClick={() => {
                              toggleBookmark(q.id)
                              setBookmarkIds(getBookmarks())
                            }}
                            className="text-slate-500 hover:text-red-400 transition-colors text-xs shrink-0"
                            title="Ta bort bokmärke"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                    {bookmarkedQs.length > 8 && (
                      <p className="text-xs text-slate-500 text-center pt-1">+{bookmarkedQs.length - 8} fler</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/practice')}
                    className="mt-4 w-full border border-blue-700/50 text-blue-400 hover:bg-blue-900/20 rounded-xl py-2.5 text-sm font-bold transition-colors"
                  >
                    Öva på bokmärkta frågor →
                  </button>
                </div>
              )
            })()}

            {/* Topic weakness report */}
            {tagStats.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Svaga områden</h2>
                <p className="text-xs text-slate-500 mb-4">Ämnen med minst 3 besvarade frågor, sorterade svagast först</p>
                <div className="space-y-3">
                  {tagStats.map(({ tag, pct, correct, total }) => (
                    <div key={tag}>
                      <div className="flex justify-between text-sm mb-1">
                        <button
                          onClick={() => navigate(`/practice?tag=${encodeURIComponent(tag)}`)}
                          className="text-slate-300 capitalize hover:text-white transition-colors text-left group flex items-center gap-1"
                        >
                          {tag.replace(/-/g, ' ')}
                          <span className="text-[10px] text-slate-600 group-hover:text-blue-400 transition-colors">→ öva</span>
                        </button>
                        <span className={`font-bold ${pct < 50 ? 'text-red-400' : pct < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {pct}% <span className="text-slate-500 font-normal">({correct}/{total})</span>
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${pct < 50 ? 'bg-red-500' : pct < 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <h2 className="text-xl font-black mb-4">Tidigare pass</h2>
            <div className="space-y-3 mb-8">
              {history.slice(0, 10).map(s => {
                const qs = s.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
                const c = qs.filter(q => q && s.answers[q!.id] === q!.answer).length
                const p = qs.length > 0 ? Math.round((c / qs.length) * 100) : 0
                const hpScore = estimateHpScore(p)
                const hpColor = hpScoreColor(hpScore)
                const date = new Date(s.startTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                const dur = s.endTime ? Math.round((s.endTime - s.startTime) / 60000) : null
                const typesInSession = [...new Set(qs.map(q => q!.type))] as QuestionType[]
                const pColor = p >= 70 ? 'text-emerald-400' : p >= 50 ? 'text-amber-400' : 'text-red-400'
                return (
                  <div key={s.id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm text-slate-400">{date}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {qs.length} frågor{dur ? ` · ${dur} min` : ''} · {s.type === 'exam' ? 'HP-prov' : s.mode === 'timed' ? 'Med tid' : 'Övning'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-black ${pColor}`}>{p}%</div>
                        <div className={`text-xs font-bold ${hpColor}`}>{hpScore.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {typesInSession.map(t => (
                        <span key={t} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${TYPE_COLORS[t].text} bg-slate-700`}>{t}</span>
                      ))}
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden ml-1">
                        <div className={`h-full rounded-full ${p >= 70 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Achievements */}
            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Brickor</h2>
                <span className="text-xs text-slate-500">{earnedIds.size}/{ALL_ACHIEVEMENTS.length} upplåsta</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ALL_ACHIEVEMENTS.map(a => {
                  const unlocked = earnedIds.has(a.id)
                  const style = RARITY_STYLES[a.rarity]
                  return (
                    <div
                      key={a.id}
                      title={`${a.title}: ${a.description}`}
                      className={`rounded-xl p-3 border text-center transition-all ${unlocked ? `${style.border} ${style.bg}` : 'border-slate-700 bg-slate-700/20 opacity-40'}`}
                    >
                      <div className="text-2xl mb-1">{a.icon}</div>
                      <div className={`text-[10px] font-black leading-tight ${unlocked ? 'text-white' : 'text-slate-500'}`}>{a.title}</div>
                      {unlocked && <div className={`text-[9px] font-bold mt-0.5 ${style.labelColor}`}>{style.label}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activity heat map — last 90 days */}
            <div className="bg-slate-800 rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Aktivitet — senaste 90 dagarna</h2>
              <div
                className="grid gap-1 overflow-x-auto"
                style={{ gridTemplateRows: 'repeat(7, minmax(0,1fr))', gridAutoFlow: 'column', gridAutoColumns: '12px' }}
              >
                {paddedHeatDays.map((day, i) =>
                  day ? (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${heatColor(day.count)}`}
                      title={`${day.date.toLocaleDateString('sv-SE')}: ${day.count} frågor`}
                    />
                  ) : (
                    <div key={i} className="w-3 h-3" />
                  )
                )}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <span>Färre</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-3 rounded-sm bg-slate-700" title="0 frågor" />
                  <div className="w-3 h-3 rounded-sm bg-blue-900" title="1–10 frågor" />
                  <div className="w-3 h-3 rounded-sm bg-blue-600" title="11–30 frågor" />
                  <div className="w-3 h-3 rounded-sm bg-blue-400" title="30+ frågor" />
                </div>
                <span>Fler</span>
                <span className="ml-auto text-slate-500">0 = grå · 1–10 = mörkblå · 11–30 = mellanblå · 30+ = ljusblå</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
