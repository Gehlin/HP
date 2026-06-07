import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadStats, getLevel, type GameStats } from '../utils/gamification'
import { loadHistory, loadSession, saveSession } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { getExamDate, setExamDate, clearExamDate, daysUntilExam, urgencyLabel, dailyTarget, KNOWN_HP_DATES } from '../utils/examDate'
import { computeReadiness } from '../utils/readiness'
import { isDailyChallengeCompleted, CHALLENGE_SIZE } from '../utils/dailyChallenge'
import type { ExamSession } from '../types'

const TYPE_ACCENTS: Record<string, { color: string; border: string }> = {
  XYZ: { color: 'text-violet-400', border: 'border-t-violet-500' },
  KVA: { color: 'text-blue-400',   border: 'border-t-blue-500'   },
  NOG: { color: 'text-emerald-400', border: 'border-t-emerald-500' },
  DTK: { color: 'text-amber-400',  border: 'border-t-amber-500'  },
}

const TYPE_DESC: Record<string, string> = {
  XYZ: 'Matematisk problemlösning',
  KVA: 'Kvantitativa jämförelser',
  NOG: 'Kvantitativa resonemang',
  DTK: 'Diagram, tabeller & kartor',
}

const RING_R = 28
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

export default function Home() {
  const navigate = useNavigate()
  const total = questions.length
  const byType = {
    XYZ: questions.filter(q => q.type === 'XYZ').length,
    KVA: questions.filter(q => q.type === 'KVA').length,
    NOG: questions.filter(q => q.type === 'NOG').length,
    DTK: questions.filter(q => q.type === 'DTK').length,
  }

  const [stats, setStats] = useState<GameStats | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [resumeSession, setResumeSession] = useState<ExamSession | null>(null)
  const [examDate, setExamDateState] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [readiness, setReadiness] = useState<ReturnType<typeof computeReadiness> | null>(null)
  const [dynamicTarget, setDynamicTarget] = useState(15)
  const [dailyDone, setDailyDone] = useState(false)

  useEffect(() => {
    setStats(loadStats())

    const today = new Date().toISOString().slice(0, 10)
    const count = loadHistory()
      .filter(s => new Date(s.startTime).toISOString().slice(0, 10) === today)
      .reduce((sum, s) => sum + Object.keys(s.answers).length, 0)
    setTodayCount(count)

    const s = loadSession()
    if (s && !s.endTime) setResumeSession(s)

    const ed = getExamDate()
    setExamDateState(ed)

    const r = computeReadiness()
    setReadiness(r)
    setDailyDone(isDailyChallengeCompleted())

    // Dynamic daily target
    const dueIds = getDueQuestions(questions.map(q => q.id))
    const history = loadHistory()
    const attempted = new Set<string>()
    history.forEach(sess => Object.keys(sess.answers).forEach(id => attempted.add(id)))
    const unseen = questions.filter(q => !attempted.has(q.id)).length
    const days = daysUntilExam()
    setDynamicTarget(days !== null && days > 0 ? dailyTarget(days, dueIds.length, unseen) : 15)
  }, [])

  const days = examDate ? daysUntilExam() : null
  const urgency = days !== null ? urgencyLabel(days) : null

  const goalReached = todayCount >= dynamicTarget
  const ringProgress = Math.min(1, todayCount / dynamicTarget)
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress)
  const hasActivity = stats && stats.xp > 0

  const handleSetExamDate = (isoDate: string) => {
    setExamDate(isoDate)
    setExamDateState(new Date(isoDate))
    setShowDatePicker(false)
    setCustomDate('')
    const days = daysUntilExam()
    const dueIds = getDueQuestions(questions.map(q => q.id))
    const history = loadHistory()
    const attempted = new Set<string>()
    history.forEach(sess => Object.keys(sess.answers).forEach(id => attempted.add(id)))
    const unseen = questions.filter(q => !attempted.has(q.id)).length
    setDynamicTarget(days !== null && days > 0 ? dailyTarget(days, dueIds.length, unseen) : 15)
  }

  return (
    <div className="min-h-screen bg-hero-grid text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-600/20 border border-blue-500/40 text-blue-300 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Högskoleprov
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-3 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">HP Träning</span>
          </h1>
          <p className="text-slate-400 text-lg">Kvantitativ del — XYZ · KVA · NOG · DTK</p>
          <p className="text-slate-500 text-sm mt-1">{total} frågor · Verkliga HP-prov 2025–2026</p>
        </div>

        {/* Resume session banner */}
        {resumeSession && (() => {
          const answered = Object.keys(resumeSession.answers).length
          const tot = resumeSession.questionIds.length
          const sessionType = resumeSession.type === 'exam' ? 'HP-prov' : resumeSession.studyMode ? 'Studieläge' : 'Övning'
          const elapsed = Math.round((Date.now() - resumeSession.startTime) / 60000)
          return (
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-2xl p-4 mb-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-0.5">Pågående pass</div>
                <div className="text-sm text-white font-semibold">
                  {sessionType} · {answered}/{tot} frågor · startades för {elapsed} min sedan
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { saveSession({ ...resumeSession, endTime: undefined }); navigate('/session') }}
                  className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl px-4 py-2 text-sm font-bold"
                >
                  Fortsätt
                </button>
                <button
                  onClick={() => { localStorage.removeItem('hp_current_session'); setResumeSession(null) }}
                  className="border border-slate-600 hover:border-slate-400 rounded-xl px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })()}

        {/* Exam countdown */}
        {examDate && days !== null ? (
          <div className={`rounded-2xl p-5 mb-4 border flex items-center gap-5 ${days <= 7 ? 'bg-red-900/20 border-red-700/50' : days <= 14 ? 'bg-amber-900/20 border-amber-700/50' : 'bg-slate-800/70 border-slate-700'}`}>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Provet</div>
              <div className="text-2xl font-black text-white">
                {days < 0 ? 'Provet har passerat' : days === 0 ? 'Idag!' : `${days} dagar kvar`}
              </div>
              {urgency && <div className={`text-sm mt-0.5 ${urgency.color}`}>{urgency.text}</div>}
              <div className="text-xs text-slate-500 mt-1">
                {examDate.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <button
              onClick={() => { clearExamDate(); setExamDateState(null); setDynamicTarget(15) }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              title="Ta bort datum"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="bg-slate-800/60 border border-dashed border-slate-600 rounded-2xl p-5 mb-4">
            {!showDatePicker ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-slate-300">Sätt ditt provdatum</div>
                  <div className="text-xs text-slate-500 mt-0.5">Aktiverar nedräkning och anpassad studieplan</div>
                </div>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="shrink-0 border border-slate-500 hover:border-slate-300 text-slate-300 hover:text-white rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                >
                  Välj datum
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Välj provdatum</div>
                <div className="grid grid-cols-1 gap-2">
                  {KNOWN_HP_DATES.map(({ label, date }) => (
                    <button
                      key={date}
                      onClick={() => handleSetExamDate(date)}
                      className="text-left px-4 py-3 rounded-xl border border-slate-600 hover:border-blue-500 hover:bg-blue-600/10 transition-colors"
                    >
                      <div className="text-sm font-bold text-white">{label}</div>
                      <div className="text-xs text-slate-500">{new Date(date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  <button
                    onClick={() => customDate && handleSetExamDate(customDate)}
                    disabled={!customDate}
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                  >
                    Spara
                  </button>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="text-slate-400 hover:text-white px-3 py-2 text-sm transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Readiness + daily target row */}
        <div className="grid grid-cols-2 gap-4 mb-4">

          {/* Readiness score */}
          {readiness && (
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Provberedskap</div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-white">{readiness.score}</span>
                <span className="text-slate-500 text-sm mb-1">/100</span>
              </div>
              <div className={`text-xs font-bold mb-3 ${readiness.labelColor}`}>{readiness.label}</div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${readiness.score >= 80 ? 'bg-emerald-500' : readiness.score >= 65 ? 'bg-blue-500' : readiness.score >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-xs font-black text-white">{readiness.accuracy}%</div>
                  <div className="text-[10px] text-slate-500">Träffsäk.</div>
                </div>
                <div>
                  <div className="text-xs font-black text-white">{readiness.mastery}%</div>
                  <div className="text-[10px] text-slate-500">Bemästrat</div>
                </div>
                <div>
                  <div className="text-xs font-black text-white">{readiness.coverage}%</div>
                  <div className="text-[10px] text-slate-500">Täckning</div>
                </div>
              </div>
            </div>
          )}

          {/* Daily target */}
          <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col items-center justify-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Dagens mål</div>
            <svg width="80" height="80" viewBox="0 0 80 80" className="mb-2">
              <circle cx="40" cy="40" r={RING_R} fill="none" stroke="#334155" strokeWidth="7" />
              <circle
                cx="40" cy="40" r={RING_R}
                fill="none"
                stroke={goalReached ? '#4ade80' : '#60a5fa'}
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <text x="40" y="37" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{todayCount}</text>
              <text x="40" y="52" textAnchor="middle" fill="#94a3b8" fontSize="11">/{dynamicTarget}</text>
            </svg>
            <div className={`text-xs text-center ${goalReached ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
              {goalReached ? 'Mål uppnått!' : `${dynamicTarget - todayCount} frågor kvar`}
            </div>
            {examDate && days !== null && days > 0 && (
              <div className="text-[10px] text-slate-600 mt-1 text-center">Baserat på studieplan</div>
            )}
          </div>
        </div>

        {/* Gamification bar */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 mb-6">
          {hasActivity && stats ? (
            (() => {
              const levelInfo = getLevel(stats.xp)
              const isMaxLevel = levelInfo.level === 10
              const xpInLevel = stats.xp - levelInfo.currentLevelXp
              const xpNeeded = isMaxLevel ? 1 : levelInfo.nextLevelXp - levelInfo.currentLevelXp
              const progressPct = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-xl">🔥</span>
                      <span className="text-orange-400">{stats.streak} {stats.streak === 1 ? 'dags' : 'dagars'} streak</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-xl">⭐</span>
                      <span className="text-yellow-400">Nivå {levelInfo.level} — {levelInfo.label}</span>
                    </div>
                    <div className="text-slate-400 text-sm ml-auto">{stats.xp} XP</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{isMaxLevel ? 'Max nivå uppnådd!' : `${xpInLevel} / ${xpNeeded} XP till nästa nivå`}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            <p className="text-slate-500 text-sm text-center">Starta din första träning för att börja samla XP</p>
          )}
        </div>

        {/* Type cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {(Object.entries(byType) as [string, number][]).map(([type, count]) => {
            const accent = TYPE_ACCENTS[type]
            return (
              <div key={type} className={`rounded-2xl p-5 border border-slate-700/60 border-t-2 ${accent?.border ?? ''} bg-slate-800/60`}>
                <div className={`text-2xl font-black ${accent?.color ?? 'text-white'}`}>{type}</div>
                <div className="text-slate-300 text-sm font-medium mt-1">{count} frågor</div>
                <div className="text-xs text-slate-500 mt-1">{TYPE_DESC[type]}</div>
              </div>
            )
          })}
        </div>

        {/* CTAs */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => navigate('/practice')}
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all rounded-2xl p-6 text-left group shadow-lg shadow-blue-900/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-black">Börja öva</div>
                <div className="text-blue-100 text-sm mt-1">Välj delprov, tidsgräns och svarsläge</div>
              </div>
              <div className="text-3xl group-hover:translate-x-1.5 transition-transform">→</div>
            </div>
          </button>

          {/* Daily challenge */}
          <button
            onClick={() => navigate('/practice?daily=1')}
            className={`border rounded-2xl p-6 text-left group transition-colors ${dailyDone ? 'border-emerald-700 bg-emerald-900/20' : 'border-violet-600/60 bg-violet-900/10 hover:bg-violet-900/20'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-xl font-black ${dailyDone ? 'text-emerald-400' : 'text-violet-300'}`}>
                  {dailyDone ? '✓ Daglig utmaning klar' : 'Daglig utmaning'}
                </div>
                <div className={`text-sm mt-1 ${dailyDone ? 'text-emerald-600' : 'text-violet-400/70'}`}>
                  {CHALLENGE_SIZE} frågor · Ny utmaning varje dag
                </div>
              </div>
              <div className={`text-2xl group-hover:translate-x-1 transition-transform ${dailyDone ? 'text-emerald-400' : 'text-violet-400'}`}>
                {dailyDone ? '✓' : '→'}
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/exam-select')}
            className="bg-slate-800/80 hover:bg-slate-700/80 transition-colors border border-slate-600 hover:border-slate-500 rounded-2xl p-6 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Simulera HP-prov</div>
                <div className="text-slate-400 text-sm mt-1">40 frågor · 4 avsnitt · 55 minuter</div>
              </div>
              <div className="text-2xl group-hover:translate-x-1 transition-transform text-slate-400">→</div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/theory')}
              className="bg-slate-800/70 hover:bg-slate-700/80 transition-colors border border-slate-700 hover:border-slate-600 rounded-2xl p-5 text-left group"
            >
              <div className="text-base font-bold">Teori & Tips</div>
              <div className="text-slate-400 text-xs mt-1.5">Metoder för varje delprov</div>
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="bg-slate-800/70 hover:bg-slate-700/80 transition-colors border border-slate-700 hover:border-slate-600 rounded-2xl p-5 text-left group"
            >
              <div className="text-base font-bold">Min statistik</div>
              <div className="text-slate-400 text-xs mt-1.5">Resultat och framsteg</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
