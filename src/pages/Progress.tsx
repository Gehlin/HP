import { useNavigate } from 'react-router-dom'
import { loadHistory } from '../utils/session'
import { questions } from '../data/questions'
import { loadStats, getLevel, LEVELS } from '../utils/gamification'
import type { QuestionType } from '../types'

export default function Progress() {
  const navigate = useNavigate()
  const history = loadHistory()
  const stats = loadStats()
  const levelInfo = getLevel(stats.xp)

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
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm">
          ← Tillbaka
        </button>

        <h1 className="text-3xl font-black mb-8">Min statistik</h1>

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
            <div className="grid grid-cols-2 gap-3 mb-8">
              {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
                .filter(([, v]) => v.total > 0)
                .map(([type, v]) => {
                  const p = Math.round((v.correct / v.total) * 100)
                  return (
                    <div key={type} className="bg-slate-800 rounded-xl p-4">
                      <div className="font-black text-blue-400 text-lg">{type}</div>
                      <div className="text-2xl font-bold">{p}%</div>
                      <div className="text-xs text-slate-400">{v.correct}/{v.total} rätt</div>
                      <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>

            {/* History */}
            <h2 className="text-xl font-black mb-4">Tidigare pass</h2>
            <div className="space-y-3 mb-8">
              {history.slice(0, 10).map(s => {
                const qs = s.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
                const c = qs.filter(q => q && s.answers[q.id] === q.answer).length
                const p = qs.length > 0 ? Math.round((c / qs.length) * 100) : 0
                const date = new Date(s.startTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={s.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-slate-400">{date}</div>
                      <div className="text-sm">{qs.length} frågor · {s.mode === 'timed' ? 'Med tid' : 'Utan tid'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black">{p}%</div>
                      <div className="text-xs text-slate-400">{c}/{qs.length}</div>
                    </div>
                  </div>
                )
              })}
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
