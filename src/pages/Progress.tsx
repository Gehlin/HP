import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loadHistory } from '../utils/session'
import { questions } from '../data/questions'
import { loadStats, getLevel, LEVELS } from '../utils/gamification'
import { getStats as getSrsStats } from '../utils/srs'
import { estimateHpScore, hpScoreColor, estimateSectionedScore } from '../utils/hpScore'
import { computeReadiness } from '../utils/readiness'
import { getExamDate, daysUntilExam } from '../utils/examDate'
import { getBookmarks, toggleBookmark } from '../utils/bookmarks'
import { buildSession, saveSession } from '../utils/session'
import { timeAnalyticsByType, accuracyByDifficulty, rollingHpScore, hpScoreHistory, typeAccuracyTrend } from '../utils/analytics'
import { ALL_ACHIEVEMENTS, getEarnedIds, RARITY_STYLES } from '../utils/achievements'
import type { QuestionType } from '../types'

function Sparkline({ values, color, height = 36 }: { values: number[]; color: string; height?: number }) {
  if (values.length < 2) return <div className="text-xs text-[var(--color-ink-faint)]">Behöver fler pass</div>
  const W = 200, H = height
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const xStep = W / (values.length - 1)
  const toY = (v: number) => H - 4 - ((v - min) / range) * (H - 10)
  const pts = values.map((v, i) => `${i * xStep},${toY(v)}`).join(' ')
  const lastX = (values.length - 1) * xStep
  const lastY = toY(values[values.length - 1])
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`w-full ${color}`} style={{ height: H }} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lastX} cy={lastY} r="3" fill="currentColor" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

const TYPE_COLORS: Record<QuestionType, { text: string; bar: string }> = {
  XYZ: { text: 'text-violet-400',  bar: 'bg-violet-500'  },
  KVA: { text: 'text-blue-400',    bar: 'bg-blue-500'    },
  NOG: { text: 'text-emerald-400', bar: 'bg-emerald-500' },
  DTK: { text: 'text-amber-400',   bar: 'bg-amber-500'   },
  ORD: { text: 'text-rose-400',    bar: 'bg-rose-500'    },
  LAS: { text: 'text-pink-400',    bar: 'bg-pink-500'    },
  MEK: { text: 'text-fuchsia-400', bar: 'bg-fuchsia-500' },
  ELF: { text: 'text-purple-400',  bar: 'bg-purple-500'  },
}

// Verbal sections (ORD/LÄS/MEK/ELF) vs quant sections (XYZ/KVA/NOG/DTK) per DESIGN-SYSTEM-06.md
const VERBAL_TYPES: QuestionType[] = ['ORD', 'LAS', 'MEK', 'ELF']

export default function Progress() {
  const navigate = useNavigate()
  const history = loadHistory()
  const stats = loadStats()
  const levelInfo = getLevel(stats.xp)
  const readiness = computeReadiness()
  const examDate = getExamDate()
  const daysLeft = daysUntilExam()
  const [bookmarkIds, setBookmarkIds] = useState<string[]>(() => getBookmarks())
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [tagSort, setTagSort] = useState<'asc' | 'desc' | 'count'>('asc')
  const [tagTypeFilter, setTagTypeFilter] = useState<'alla' | QuestionType>('alla')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')
  const [calTip, setCalTip] = useState<{ date: string; count: number } | null>(null)

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-app pb-bottomnav pt-topnav flex items-center justify-center px-4">
        <div className="card rounded-2xl p-10 text-center max-w-sm w-full">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-[var(--color-ink-faint)]">
            <path d="M3 3v18h18" />
            <rect x="7" y="13" width="3" height="5" />
            <rect x="12" y="9" width="3" height="9" />
            <rect x="17" y="5" width="3" height="13" />
          </svg>
          <h1 className="text-lg font-bold text-[var(--color-ink)] mb-2">Inga träningspass än</h1>
          <p className="text-sm text-[var(--color-ink-faint)] mb-6">Gör ditt första pass för att se statistik här.</p>
          <button
            onClick={() => navigate('/practice')}
            className="bg-[var(--color-green)] hover:opacity-90 transition-opacity px-6 py-3 rounded-xl font-bold text-sm text-[var(--color-cream)]"
          >
            Starta träning →
          </button>
        </div>
      </div>
    )
  }

  const timeAnalytics = timeAnalyticsByType()
  const difficultyAcc = accuracyByDifficulty()
  const rollingHp = rollingHpScore()
  const hpHistory = hpScoreHistory()
  const typeTrend = typeAccuracyTrend()
  const DIFFICULTY_LABELS = { easy: 'Lätt', medium: 'Medel', hard: 'Svår' } as const

  const now = Date.now()
  const filteredHistory = history.filter(s => {
    if (timeRange === 'week') return s.startTime >= now - 7 * 24 * 60 * 60 * 1000
    if (timeRange === 'month') return s.startTime >= now - 30 * 24 * 60 * 60 * 1000
    return true
  })
  const earnedIds = new Set(getEarnedIds())

  const allAnswers: { qid: string; correct: boolean }[] = []
  filteredHistory.forEach(s => {
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
    ORD: { correct: 0, total: 0 },
    LAS: { correct: 0, total: 0 },
    MEK: { correct: 0, total: 0 },
    ELF: { correct: 0, total: 0 },
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

  // Per-type personal best (sessions with ≥3 questions of that type)
  const bestPerType: Record<QuestionType, number> = { XYZ: 0, KVA: 0, NOG: 0, DTK: 0, ORD: 0, LAS: 0, MEK: 0, ELF: 0 }
  filteredHistory.forEach(s => {
    const typeMap: Partial<Record<QuestionType, { correct: number; total: number }>> = {}
    s.questionIds.forEach(qid => {
      const q = questions.find(x => x.id === qid)
      if (!q) return
      if (!typeMap[q.type]) typeMap[q.type] = { correct: 0, total: 0 }
      typeMap[q.type]!.total++
      if (s.answers[qid] === q.answer) typeMap[q.type]!.correct++
    })
    ;(Object.entries(typeMap) as [QuestionType, { correct: number; total: number }][]).forEach(([type, v]) => {
      if (v.total >= 3) {
        const pct = Math.round((v.correct / v.total) * 100)
        if (pct > bestPerType[type]) bestPerType[type] = pct
      }
    })
  })

  const { combined: combinedScore, quant: quantScore, verbal: verbalScore } = estimateSectionedScore(byType)

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

  // Tag metadata from full question bank
  const tagAvailable: Record<string, number> = {}
  const tagTypes: Record<string, Set<QuestionType>> = {}
  questions.forEach(q => {
    for (const tag of q.tags) {
      tagAvailable[tag] = (tagAvailable[tag] ?? 0) + 1
      if (!tagTypes[tag]) tagTypes[tag] = new Set()
      tagTypes[tag].add(q.type)
    }
  })

  const filteredTagStats = tagStats
    .filter(({ tag }) => tagTypeFilter === 'alla' || tagTypes[tag]?.has(tagTypeFilter as QuestionType))
    .sort((a, b) => {
      if (tagSort === 'desc') return b.pct - a.pct
      if (tagSort === 'count') return b.total - a.total
      return a.pct - b.pct
    })

  // SRS mastery overview
  const srsNew = questions.filter(q => getSrsStats(q.id) === null).length
  const srsMastered = questions.filter(q => {
    const r = getSrsStats(q.id)
    return r !== null && r.interval >= 21
  }).length
  const srsLearning = questions.length - srsNew - srsMastered

  // Accuracy trend — last 15 sessions (most recent last)
  const trendSessions = filteredHistory
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

  const cal12Weeks: { date: Date; count: number }[] = []
  for (let i = 83; i >= 0; i--) {
    const d = new Date(todayMidnight)
    d.setDate(d.getDate() - i)
    cal12Weeks.push({ date: d, count: questionsByDay[d.toISOString().slice(0, 10)] ?? 0 })
  }
  const cal12StartDow = cal12Weeks[0].date.getDay()
  const paddedCal12: ({ date: Date; count: number } | null)[] = [
    ...Array(cal12StartDow).fill(null),
    ...cal12Weeks,
  ]

  function heatColor(count: number): string {
    if (count === 0) return 'bg-[var(--color-paper-darker)]'
    if (count <= 10) return 'bg-[var(--color-green)]/30'
    if (count <= 30) return 'bg-[var(--color-green)]/60'
    return 'bg-[var(--color-green)]'
  }

  function calColor(count: number): string {
    if (count === 0) return 'bg-[var(--color-track)]'
    if (count <= 10) return 'bg-[var(--color-green)]/30'
    if (count <= 30) return 'bg-[var(--color-green)]/60'
    return 'bg-[var(--color-green)]'
  }

  const isMaxLevel = levelInfo.level === 10
  const xpInCurrentLevel = stats.xp - levelInfo.currentLevelXp
  const xpNeededForCurrentLevel = isMaxLevel ? 1 : levelInfo.nextLevelXp - levelInfo.currentLevelXp
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((xpInCurrentLevel / xpNeededForCurrentLevel) * 100))

  const sevenDayActivityRaw = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayMidnight)
    d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const count = questionsByDay[key] ?? 0
    const dayLabel = d.toLocaleDateString('sv-SE', { weekday: 'short' }).slice(0, 3)
    return { dayLabel, count, isToday: i === 6 }
  })
  const maxActivity = Math.max(1, ...sevenDayActivityRaw.map(d => d.count))
  const sevenDayActivity = sevenDayActivityRaw.map(d => ({
    ...d,
    barHeightPx: d.count > 0 ? Math.max(8, Math.round((d.count / maxActivity) * 48)) : 0,
  }))

  // Normerat trend for the score card — aggregate each calendar month's answers
  // into a sectioned score (real data, no placeholders), up to the last 6 months.
  // Falls back to per-session points when history spans fewer than two months.
  const emptyByType = (): Record<QuestionType, { correct: number; total: number }> => ({
    XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
    ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
    MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
  })
  const monthBuckets: Record<string, ReturnType<typeof emptyByType>> = {}
  history.forEach(s => {
    const d = new Date(s.startTime)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthBuckets[key]) monthBuckets[key] = emptyByType()
    s.questionIds.forEach(qid => {
      const q = questions.find(x => x.id === qid)
      if (!q || !s.answers[qid]) return
      monthBuckets[key][q.type].total++
      if (s.answers[qid] === q.answer) monthBuckets[key][q.type].correct++
    })
  })
  const monthlyPoints = Object.keys(monthBuckets)
    .sort()
    .slice(-6)
    .map(key => {
      const [y, m] = key.split('-').map(Number)
      const date = new Date(y, m - 1, 1)
      return {
        short: date.toLocaleDateString('sv-SE', { month: 'short' }).replace('.', ''),
        full: date.toLocaleDateString('sv-SE', { month: 'long' }),
        value: estimateSectionedScore(monthBuckets[key]).combined,
      }
    })
    .filter((p): p is { short: string; full: string; value: number } => p.value !== null)
  const trendPoints = monthlyPoints.length >= 2
    ? monthlyPoints
    : history
        .slice(0, 15)
        .reverse()
        .map(s => {
          const bt = emptyByType()
          s.questionIds.forEach(qid => {
            const q = questions.find(x => x.id === qid)
            if (!q || !s.answers[qid]) return
            bt[q.type].total++
            if (s.answers[qid] === q.answer) bt[q.type].correct++
          })
          const d = new Date(s.startTime)
          return {
            short: d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'numeric' }),
            full: d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' }),
            value: estimateSectionedScore(bt).combined,
          }
        })
        .filter((p): p is { short: string; full: string; value: number } => p.value !== null)
  const trendDelta = trendPoints.length >= 2 ? trendPoints[trendPoints.length - 1].value - trendPoints[0].value : 0
  // Chart geometry per the prototype's viewBox 0 0 300 120: x spans 14→289, y maps min→98 / max→39
  const tMin = Math.min(...trendPoints.map(p => p.value))
  const tMax = Math.max(...trendPoints.map(p => p.value))
  const tX = (i: number) => trendPoints.length < 2 ? 14 : 14 + (i * 275) / (trendPoints.length - 1)
  const tY = (v: number) => tMax === tMin ? 70 : 98 - ((v - tMin) / (tMax - tMin)) * 59
  const trendLine = trendPoints.map((p, i) => `${tX(i).toFixed(1)},${tY(p.value).toFixed(1)}`).join(' ')
  const trendArea = trendPoints.length >= 2 ? `${trendLine} ${tX(trendPoints.length - 1).toFixed(1)},112 14,112` : ''
  const labelStep = Math.max(1, Math.ceil(trendPoints.length / 6))
  const trendLabels = trendPoints.filter((_, i) => i % labelStep === 0 || i === trendPoints.length - 1).map(p => p.short)

  return (
    <div className="min-h-screen bg-app pb-bottomnav pt-topnav">
      <div className="px-4 pb-4 max-w-2xl mx-auto">
        <h1 style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 26, lineHeight: 1.05, color: '#23201A' }}>Statistik</h1>
        <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 13, color: '#8B8478', marginTop: 6 }}>Din utveckling över tid</div>

        <div style={{ display: 'flex', background: '#E6DFD0', borderRadius: 12, padding: 3, marginTop: 16 }}>
          {(['week', 'month', 'all'] as const).map((range, i) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '8px 0',
                borderRadius: 9,
                fontFamily: "'Hanken Grotesk', system-ui",
                fontWeight: timeRange === range ? 700 : 600,
                fontSize: 13,
                color: timeRange === range ? '#224A3A' : '#8B8478',
                background: timeRange === range ? '#FFFFFF' : 'transparent',
                boxShadow: timeRange === range ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {(['Vecka', 'Månad', 'Allt'] as const)[i]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Score card ─────────────────────────────────────── */}
      <div className="card mx-4 p-4 mb-3 max-w-2xl mx-auto" style={{ borderRadius: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 10, letterSpacing: '0.12em', color: '#A89F90' }}>NORMERAT (ESTIMAT)</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
              <span style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 34, lineHeight: 0.9, color: '#23201A' }}>{combinedScore !== null ? combinedScore.toFixed(2).replace('.', ',') : '—'}</span>
              {trendPoints.length >= 2 && trendDelta !== 0 && (
                <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 12, lineHeight: 1, color: trendDelta > 0 ? '#2E6A4C' : '#A84A26' }}>
                  {trendDelta > 0 ? '▲' : '▼'} {Math.abs(trendDelta).toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 11, lineHeight: 1.5, color: '#A89F90' }}>
            {trendPoints.length >= 2 ? (
              <>sedan<br/>{trendPoints[0].full}</>
            ) : (
              <>{filteredHistory.length} sessioner<br/>{totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}% rätt</>
            )}
          </div>
        </div>
        {trendPoints.length >= 2 && (
          <>
            <svg viewBox="0 0 300 120" preserveAspectRatio="none" style={{ width: '100%', height: 104, marginTop: 12, display: 'block' }}>
              <defs>
                <linearGradient id="normTrendArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#224A3A" stopOpacity="0.16" />
                  <stop offset="1" stopColor="#224A3A" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="39" x2="300" y2="39" stroke="#EFE8DA" strokeWidth="1" />
              <line x1="0" y1="74" x2="300" y2="74" stroke="#EFE8DA" strokeWidth="1" />
              <polygon points={trendArea} fill="url(#normTrendArea)" />
              <polyline points={trendLine} fill="none" stroke="#224A3A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx={tX(trendPoints.length - 1)} cy={tY(trendPoints[trendPoints.length - 1].value)} r="4.5" fill="#224A3A" />
              <circle cx={tX(trendPoints.length - 1)} cy={tY(trendPoints[trendPoints.length - 1].value)} r="8" fill="#224A3A" fillOpacity="0.16" />
            </svg>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 10, lineHeight: 1, color: '#B3AA9B' }}>
              {trendLabels.map((l, i) => <span key={i}>{l}</span>)}
            </div>
          </>
        )}
      </div>

      {/* ── Weekly activity bar chart ───────────────────────── */}
      <div className="card mx-4 p-4 mb-3 max-w-2xl mx-auto" style={{ borderRadius: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 13, color: '#23201A' }}>Den här veckan</span>
          <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 12, color: '#8B8478' }}>{sevenDayActivity.reduce((s, d) => s + d.count, 0)} frågor</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 86 }}>
          {sevenDayActivity.map(({ dayLabel, count, barHeightPx, isToday }) => {
            return (
              <div key={dayLabel} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                <div style={{
                  width: '100%',
                  height: Math.max(6, barHeightPx),
                  borderRadius: 6,
                  background: count > 0 ? (isToday ? '#224A3A' : '#CBD7CD') : '#E4DCCC',
                }} />
                <span style={{
                  fontFamily: "'Hanken Grotesk', system-ui",
                  fontWeight: isToday ? 700 : 600,
                  fontSize: 10,
                  lineHeight: 1,
                  color: isToday ? '#224A3A' : '#A89F90',
                }}>
                  {dayLabel}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Per-section accuracy bars ───────────────────────── */}
      <div className="card mx-4 p-4 mb-3 max-w-2xl mx-auto" style={{ borderRadius: 18 }}>
        <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 13, color: '#23201A', marginBottom: 14 }}>Träffsäkerhet per delprov</div>
        {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
          .map(([type, v]) => ({ type, v, pct: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0 }))
          .sort((a, b) => b.pct - a.pct)
          .map(({ type, v, pct }, idx, arr) => {
            const isVerbal = VERBAL_TYPES.includes(type)
            const fillColor = isVerbal ? '#224A3A' : '#BF5A33'
            const displayType = type === 'LAS' ? 'LÄS' : type
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: idx < arr.length - 1 ? 11 : 0 }}>
                <span style={{ width: 34, fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 800, fontSize: 13, color: '#23201A' }}>{displayType}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#EFE8DA', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, borderRadius: 999, background: fillColor }} />
                </div>
                <span style={{ width: 32, textAlign: 'right', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 12, color: '#6f6859' }}>
                  {v.total > 0 ? `${pct}%` : '—'}
                </span>
              </div>
            )
          })}
      </div>

      {/* Practice consistency calendar — 12 weeks */}
      <div className="card mx-4 p-4 mb-4 max-w-2xl mx-auto">
        <div className="text-sm font-semibold text-[var(--color-ink)] mb-3">Träningskonsistens — 12 veckor</div>
        <div
          className="grid gap-1 overflow-x-auto"
          style={{ gridTemplateRows: 'repeat(7, minmax(0,1fr))', gridAutoFlow: 'column', gridAutoColumns: '12px' }}
        >
          {paddedCal12.map((day, i) =>
            day ? (
              <button
                key={i}
                className={`w-3 h-3 rounded-sm ${calColor(day.count)} cursor-pointer`}
                title={`${day.date.toLocaleDateString('sv-SE')}: ${day.count} frågor`}
                onClick={() => {
                  const key = day.date.toISOString().slice(0, 10)
                  setCalTip(prev => prev?.date === key ? null : { date: key, count: day.count })
                }}
              />
            ) : (
              <div key={i} className="w-3 h-3" />
            )
          )}
        </div>
        {calTip && (
          <div className="mt-2 text-xs text-[var(--color-ink)] bg-[var(--color-paper-dark)] rounded-lg px-3 py-2 inline-block">
            {calTip.date}: {calTip.count} {calTip.count === 1 ? 'fråga' : 'frågor'}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3 text-[10px] text-[var(--color-ink-faint)]">
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-sm bg-[var(--color-track)]" />
            <div className="w-3 h-3 rounded-sm bg-[var(--color-green)]/30" />
            <div className="w-3 h-3 rounded-sm bg-[var(--color-green)]/60" />
            <div className="w-3 h-3 rounded-sm bg-[var(--color-green)]" />
          </div>
          <span>0 · 1–10 · 11–30 · 30+ frågor</span>
        </div>
      </div>

      {/* HP Score card */}
      <div className="card mx-4 p-4 mb-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-[var(--color-ink-faint)] mb-1">Uppskattat HP-poäng</div>
            <div className={`text-4xl font-[var(--font-serif)] ${combinedScore !== null ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)]'}`}>
              {combinedScore !== null ? combinedScore.toFixed(2) : '—'}
            </div>
            {combinedScore !== null && (
              <div className="text-xs text-[var(--color-ink-faint)] mt-1">av 2,00</div>
            )}
          </div>
          {(() => {
            const HP_RING_R = 28
            const HP_RING_C = 2 * Math.PI * HP_RING_R
            const progress = combinedScore !== null ? Math.max(0, Math.min(1, (combinedScore - 1.0) / 1.0)) : 0
            const offset = HP_RING_C * (1 - progress)
            return (
              <svg width="72" height="72" viewBox="0 0 72 72" className="shrink-0">
                <circle cx="36" cy="36" r={HP_RING_R} fill="none" stroke="var(--color-paper-dark)" strokeWidth="6" />
                <circle
                  cx="36" cy="36" r={HP_RING_R}
                  fill="none"
                  stroke="var(--color-green)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={HP_RING_C}
                  strokeDashoffset={offset}
                  transform="rotate(-90 36 36)"
                />
              </svg>
            )
          })()}
        </div>
      </div>

      {/* XP / Level card */}
      <div className="card mx-4 p-4 mb-4 max-w-2xl mx-auto">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-4xl font-[var(--font-serif)] text-[var(--color-green)]">{levelInfo.level}</span>
          <span className="text-sm text-[var(--color-ink-faint)]">Nivå {levelInfo.level} – {levelInfo.label}</span>
        </div>
        <div className="text-xs text-[var(--color-ink-faint)] mb-3">
          {isMaxLevel ? 'Maxnivå uppnådd!' : `${levelInfo.nextLevelXp - stats.xp} XP → nästa nivå`}
        </div>
        <div className="h-2 rounded-full bg-[var(--color-paper-dark)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-gold)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[var(--color-ink-faint)]">
          <span>{stats.xp} XP</span>
          {!isMaxLevel && <span>{levelInfo.nextLevelXp} XP</span>}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-4">

        {/* Readiness card */}
        <div className="card rounded-2xl p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Provberedskap</div>
              <div className="flex items-end gap-2">
                <div className="text-4xl font-black text-[var(--color-ink)]">{readiness.score}</div>
                <div className="text-[var(--color-ink-faint)] text-sm mb-1">/100</div>
              </div>
              <div className={`text-sm font-bold mt-1 ${readiness.labelColor}`}>{readiness.label}</div>
            </div>
            <div className="text-right">
              {examDate && daysLeft !== null ? (
                <div>
                  <div className="text-xs text-[var(--color-ink-faint)] mb-1">Dagar kvar</div>
                  <div className={`text-3xl font-black ${daysLeft <= 7 ? 'text-red-400' : daysLeft <= 14 ? 'text-amber-400' : 'text-[var(--color-ink)]'}`}>
                    {daysLeft < 0 ? '—' : daysLeft}
                  </div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">
                    {examDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="text-xs text-[var(--color-green)] hover:text-[var(--color-green-light)] border border-[var(--color-green)]/25 rounded-lg px-3 py-1.5 transition-colors"
                >
                  Sätt provdatum →
                </button>
              )}
            </div>
          </div>

          <div className="h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden mb-4">
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
              <div className="text-xs text-[var(--color-ink-faint)] mt-1">Träffsäkerhet</div>
              <div className="text-[10px] text-[var(--color-ink-faint)]">Senaste 10 pass</div>
            </div>
            <div>
              <div className={`text-2xl font-black ${readiness.mastery >= 50 ? 'text-emerald-400' : readiness.mastery >= 25 ? 'text-amber-400' : 'text-[var(--color-ink-faint)]'}`}>
                {readiness.mastery}%
              </div>
              <div className="text-xs text-[var(--color-ink-faint)] mt-1">Bemästrat</div>
              <div className="text-[10px] text-[var(--color-ink-faint)]">SRS-intervall ≥7 dagar</div>
            </div>
            <div>
              <div className={`text-2xl font-black ${readiness.coverage >= 60 ? 'text-emerald-400' : readiness.coverage >= 30 ? 'text-amber-400' : 'text-[var(--color-ink-faint)]'}`}>
                {readiness.coverage}%
              </div>
              <div className="text-xs text-[var(--color-ink-faint)] mt-1">Täckning</div>
              <div className="text-[10px] text-[var(--color-ink-faint)]">Frågor sedda</div>
            </div>
          </div>
        </div>

        {/* Level Card */}
        <div className="card rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Nuvarande nivå</div>
              <div className="text-2xl font-black text-[var(--color-gold)]">Nivå {levelInfo.level} — {levelInfo.label}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-ink-faint)] mb-1">Totalt XP</div>
              <div className="text-2xl font-black text-[var(--color-green)]">{stats.xp} XP</div>
            </div>
          </div>

          {isMaxLevel ? (
            <div className="text-xs text-[var(--color-gold)] mb-2">Maxnivå uppnådd! 🏆</div>
          ) : (
            <div className="text-xs text-[var(--color-ink-faint)] mb-2">
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
                  className="flex-1 h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden"
                  title={`Nivå ${lvl.level}: ${lvl.label} (${LEVELS[idx].xp} XP)`}
                >
                  <div
                    className={`h-full rounded-full transition-all ${isCompleted ? 'bg-[var(--color-gold)]' : 'bg-[var(--color-green)]'}`}
                    style={{ width: fillWidth }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-[var(--color-ink-faint)]">
            <span>Nybörjare</span>
            <span>HP-Legend</span>
          </div>
        </div>

        {/* HP-prognos card */}
        <button
          onClick={() => navigate('/score')}
          className="w-full text-left card rounded-2xl p-5 mb-4 border border-[var(--color-paper-darker)] hover:border-[var(--color-green)]/30 hover:bg-[var(--color-green)]/5 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-1">HP-prognos</div>
              {combinedScore !== null ? (
                <div className="flex items-baseline gap-3">
                  <div className={`text-3xl font-black tabular-nums ${hpScoreColor(combinedScore)}`}>{combinedScore.toFixed(2)}</div>
                  <div className="text-xs text-[var(--color-ink-faint)]">Estimerat resultat · klicka för fullständig analys</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-bold text-[var(--color-ink)]">Visa din HP-prognos →</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">Estimerat resultat & målstyrning</div>
                </div>
              )}
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-green)] shrink-0 ml-4">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
          {(quantScore !== null || verbalScore !== null) && (
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--color-paper-darker)]">
              <div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mb-1">Kvantitativt</div>
                {quantScore !== null ? (
                  <div className={`text-xl font-black tabular-nums ${hpScoreColor(quantScore)}`}>{quantScore.toFixed(2)}</div>
                ) : (
                  <div className="text-sm text-[var(--color-ink-faint)]">—</div>
                )}
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">XYZ · KVA · NOG · DTK</div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mb-1">Verbalt</div>
                {verbalScore !== null ? (
                  <div className={`text-xl font-black tabular-nums ${hpScoreColor(verbalScore)}`}>{verbalScore.toFixed(2)}</div>
                ) : (
                  <div className="text-sm text-[var(--color-ink-faint)]">—</div>
                )}
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">ORD · LÄS · MEK · ELF</div>
              </div>
            </div>
          )}
        </button>

        {/* Streak & General Stats */}
        <div className="card rounded-2xl p-5 mb-4">
          <h2 className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Träningsstatistik</h2>

          {/* 7-day streak calendar */}
          <div className="mb-4">
            <div className="text-[10px] text-[var(--color-ink-faint)] mb-2">Senaste 7 dagarna</div>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date(todayMidnight)
                d.setDate(d.getDate() - (6 - i))
                const key = d.toISOString().slice(0, 10)
                const count = questionsByDay[key] ?? 0
                const isToday = i === 6
                const dayLabel = d.toLocaleDateString('sv-SE', { weekday: 'short' }).slice(0, 2).toUpperCase()
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`w-full h-8 rounded-lg flex items-center justify-center transition-colors ${count > 0 ? 'bg-[var(--color-green)]/15 border border-[var(--color-green)]/30' : isToday ? 'border border-[var(--color-paper-darker)] bg-[var(--color-paper-dark)]' : 'bg-[var(--color-paper-dark)]'}`}
                      title={`${d.toLocaleDateString('sv-SE')}: ${count} frågor`}
                    >
                      {count > 0 && <span className="text-[10px] font-bold text-[var(--color-green)]">{count}</span>}
                    </div>
                    <span className={`text-[9px] ${isToday ? 'text-[var(--color-green)] font-bold' : 'text-[var(--color-ink-faint)]'}`}>{dayLabel}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { value: String(stats.streak), label: 'Streak nu', color: stats.streak >= 7 ? 'text-orange-400' : 'text-[var(--color-ink)]' },
              { value: String(stats.longestStreak), label: 'Längsta streak', color: 'text-[var(--color-gold)]' },
              { value: String(history.length), label: 'Totalt pass', color: 'text-[var(--color-ink)]' },
              { value: String(totalAnswered), label: 'Frågor besv.', color: 'text-[var(--color-ink)]' },
              { value: String(totalCorrect), label: 'Rätt svar', color: 'text-emerald-400' },
              { value: `${totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%`, label: 'Träffsäkerhet', color: totalAnswered > 0 && Math.round((totalCorrect / totalAnswered) * 100) >= 70 ? 'text-emerald-400' : 'text-[var(--color-ink)]' },
            ].map(({ value, label, color }) => (
              <div key={label} className="bg-[var(--color-paper-dark)] rounded-xl p-3 text-center">
                <div className={`text-xl font-black ${color}`}>{value}</div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5 leading-tight">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="card rounded-2xl p-10 text-center mb-4">
            <div className="text-4xl font-black text-[var(--color-ink-faint)] mb-3">—</div>
            <div className="text-[var(--color-ink-faint)] font-semibold mb-1">Inga träningspass ännu</div>
            <p className="text-[var(--color-ink-faint)] text-sm mb-6">Genomför ditt första pass för att se din detaljerade statistik.</p>
            <button
              onClick={() => navigate('/practice')}
              className="bg-[var(--color-green)] hover:opacity-90 transition-opacity px-6 py-3 rounded-xl font-bold text-sm text-[var(--color-cream)]"
            >
              Starta träning →
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
                    <div key={type} className="card rounded-xl p-4">
                      <div className={`font-black text-lg ${tc.text}`}>{type}</div>
                      <div className="text-2xl font-bold">{p}%</div>
                      <div className="text-xs text-[var(--color-ink-faint)]">{v.correct}/{v.total} rätt</div>
                      <div className="mt-2 h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                        <div className={`h-full ${tc.bar} rounded-full`} style={{ width: `${p}%` }} />
                      </div>
                      {bestPerType[type] > 0 && (
                        <div className="mt-2 text-[10px] text-[var(--color-ink-faint)] flex items-center gap-1">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500/60"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>
                          Bästa: {bestPerType[type]}%
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>

            {/* Accuracy trend chart */}
            {trendSessions.length >= 2 && (
              <div className="card rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-1">Träffsäkerhet — senaste {trendSessions.length} pass</h2>
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
                <div className="flex justify-between text-[10px] text-[var(--color-ink-faint)] mt-2">
                  <span>Äldst</span>
                  <span>Senast</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--color-ink-faint)] mt-1">
                  <span>{trendSessions[0]}%</span>
                  <span className={trendSessions[trendSessions.length - 1] >= 70 ? 'text-emerald-400' : trendSessions[trendSessions.length - 1] >= 50 ? 'text-amber-400' : 'text-red-400'}>
                    {trendSessions[trendSessions.length - 1]}% senast
                  </span>
                </div>
              </div>
            )}

            {/* Per-type accuracy sparklines */}
            {(Object.values(typeTrend) as number[][]).some(arr => arr.length >= 3) && (
              <div className="card rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-4">Träffsäkerhet per delprov — trend</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.entries(typeTrend) as [QuestionType, number[]][])
                    .filter(([, arr]) => arr.length >= 3)
                    .map(([type, arr]) => {
                      const latest = arr[arr.length - 1]
                      const earliest = arr[0]
                      const delta = latest - earliest
                      const tc = TYPE_COLORS[type]
                      return (
                        <div key={type}>
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className={`text-xs font-black ${tc.text}`}>{type}</span>
                            <span className="text-sm font-bold text-[var(--color-ink)]">{latest}%</span>
                            <span className={`text-[10px] font-bold ml-auto ${delta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {delta >= 0 ? '+' : ''}{delta}pp
                            </span>
                          </div>
                          <Sparkline values={arr} color={tc.text} height={28} />
                        </div>
                      )
                    })}
                </div>
                <p className="text-[10px] text-[var(--color-ink-faint)] mt-3">pp = procentenheter sedan äldsta mätta pass</p>
              </div>
            )}

            {/* Rolling HP + time analytics */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Rolling HP score + sparkline */}
              <div className="card rounded-2xl p-5">
                <div className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-[0.16em] mb-3">HP-poäng (trend)</div>
                {rollingHp !== null ? (
                  <>
                    <div className="flex items-baseline gap-2 mb-1">
                      <div className={`text-3xl font-black ${hpScoreColor(rollingHp)}`}>{rollingHp.toFixed(2)}</div>
                      {hpHistory.length >= 2 && (
                        <span className={`text-xs font-bold ${hpHistory[hpHistory.length - 1] > hpHistory[0] ? 'text-emerald-400' : 'text-red-400'}`}>
                          {hpHistory[hpHistory.length - 1] > hpHistory[0] ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-ink-faint)] mb-2">Viktat snitt senaste pass</div>
                    {hpHistory.length >= 2 && (
                      <Sparkline values={hpHistory} color={`${hpScoreColor(rollingHp)}`} height={32} />
                    )}
                    <div className="mt-2 h-1.5 bg-[var(--color-track)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${rollingHp >= 1.80 ? 'bg-emerald-500' : rollingHp >= 1.50 ? 'bg-[var(--color-green)]' : rollingHp >= 1.25 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${((rollingHp - 1) / 1) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--color-ink-faint)] mt-1"><span>1.00</span><span>2.00</span></div>
                  </>
                ) : (
                  <div className="text-sm text-[var(--color-ink-faint)] mt-2">Genomför fler pass för att se trend</div>
                )}
              </div>

              {/* Accuracy by difficulty */}
              <div className="card rounded-2xl p-5">
                <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-3">Träffsäkerhet per nivå</div>
                <div className="space-y-2.5">
                  {(['easy', 'medium', 'hard'] as const).map(d => {
                    const { pct, total } = difficultyAcc[d]
                    return (
                      <div key={d}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[var(--color-ink-faint)]">{DIFFICULTY_LABELS[d]}</span>
                          <span className={`font-bold ${pct === null ? 'text-[var(--color-ink-faint)]' : pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                            {pct !== null ? `${pct}%` : '—'}
                            {total > 0 && <span className="text-[var(--color-ink-faint)] font-normal ml-1">({total})</span>}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
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
            <div className="card rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-4">Tid per fråga vs HP-standard</h2>
              <div className="space-y-3">
                {(Object.entries(timeAnalytics) as [QuestionType, typeof timeAnalytics[QuestionType]][])
                  .filter(([, v]) => v.avgSeconds !== null)
                  .map(([type, v]) => {
                    const ratio = v.ratio!
                    const tc = TYPE_COLORS[type]
                    const speedLabel = ratio < 0.8 ? 'Snabb' : ratio > 1.2 ? 'Långsam' : 'I tid'
                    const speedColor = ratio < 0.8 ? 'text-emerald-400' : ratio > 1.2 ? 'text-red-400' : 'text-[var(--color-ink)]'
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className={`w-10 text-xs font-black shrink-0 ${tc.text}`}>{type}</span>
                        <div className="flex-1 h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden relative">
                          {/* HP standard marker */}
                          <div className="absolute top-0 h-full w-0.5 bg-[var(--color-ink-faint)] z-10" style={{ left: '100%', transform: 'translateX(-1px)' }} />
                          <div
                            className={`h-full ${tc.bar} rounded-full`}
                            style={{ width: `${Math.min(150, ratio * 100)}%`, opacity: ratio > 1 ? 1 : 0.7 }}
                          />
                        </div>
                        <div className="text-right shrink-0 w-28">
                          <span className="text-xs text-[var(--color-ink)] font-mono">{v.avgSeconds}s</span>
                          <span className="text-[var(--color-ink-faint)] text-xs"> / {v.hpStandard}s</span>
                          <span className={`text-[10px] ml-1 font-bold ${speedColor}`}>{speedLabel}</span>
                        </div>
                      </div>
                    )
                  })}
                {Object.values(timeAnalytics).every(v => v.avgSeconds === null) && (
                  <p className="text-sm text-[var(--color-ink-faint)]">Inga tiddata ännu — börja ett träningspass med tidmätning.</p>
                )}
              </div>
              <p className="text-[11px] text-[var(--color-ink-faint)] mt-3">HP-standard: XYZ 60s · KVA 60s · NOG 100s · DTK 115s · ORD 45s · MEK 50s · LÄS/ELF 120s per fråga</p>
            </div>

            {/* SRS mastery overview */}
            <div className="card rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-4">Frågebank — masterstatus</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-black text-[var(--color-ink-faint)]">{srsNew}</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Ej sedd</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-amber-400">{srsLearning}</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Inlärning</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black text-emerald-400">{srsMastered}</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Bemästrad</div>
                </div>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden">
                <div className="bg-[var(--color-paper-darker)]" style={{ width: `${(srsNew / questions.length) * 100}%` }} />
                <div className="bg-amber-500" style={{ width: `${(srsLearning / questions.length) * 100}%` }} />
                <div className="bg-emerald-500" style={{ width: `${(srsMastered / questions.length) * 100}%` }} />
              </div>
              <div className="text-xs text-[var(--color-ink-faint)] mt-2 text-right">{questions.length} frågor totalt</div>
            </div>

            {/* Bookmarks */}
            {bookmarkIds.length > 0 && (() => {
              const bookmarkedQs = bookmarkIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as typeof questions
              return (
                <div className="card rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest">Bokmärkta frågor</h2>
                    <span className="text-xs text-[var(--color-ink-faint)]">{bookmarkIds.length} sparade</span>
                  </div>
                  <div className="space-y-2">
                    {bookmarkedQs.slice(0, 8).map(q => {
                      const tc = TYPE_COLORS[q.type]
                      return (
                        <div key={q.id} className="flex items-center gap-3 bg-[var(--color-paper-dark)] rounded-xl px-3 py-2.5">
                          <span className={`text-xs font-black shrink-0 ${tc.text}`}>{q.type}</span>
                          <span className="text-xs text-[var(--color-ink)] flex-1 line-clamp-1">{q.text.replace(/\$[^$]+\$/g, '…')}</span>
                          <button
                            onClick={() => {
                              toggleBookmark(q.id)
                              setBookmarkIds(getBookmarks())
                            }}
                            className="text-[var(--color-ink-faint)] hover:text-red-400 transition-colors text-xs shrink-0"
                            title="Ta bort bokmärke"
                          >
                            ✕
                          </button>
                        </div>
                      )
                    })}
                    {bookmarkedQs.length > 8 && (
                      <p className="text-xs text-[var(--color-ink-faint)] text-center pt-1">+{bookmarkedQs.length - 8} fler</p>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const pool = bookmarkIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as typeof questions
                      const shuffled = [...pool].sort(() => Math.random() - 0.5)
                      const session = await buildSession(shuffled.map(q => q.id), null, true, 'drill')
                      saveSession(session)
                      navigate('/session')
                    }}
                    className="mt-4 w-full border border-[var(--color-green)]/25 text-[var(--color-green)] hover:bg-[var(--color-green)]/10 rounded-xl py-2.5 text-sm font-bold transition-colors"
                  >
                    Öva på bokmärkta frågor →
                  </button>
                </div>
              )
            })()}

            {/* Topic weakness report */}
            {tagStats.length > 0 && (
              <div className="card rounded-2xl p-6 mb-6">
                <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-1">Ämnesresultat</h2>
                <p className="text-xs text-[var(--color-ink-faint)] mb-4">Ämnen med minst 3 besvarade frågor</p>

                {/* Type filter tabs */}
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {(['alla', 'XYZ', 'KVA', 'NOG', 'DTK', 'ORD', 'LAS', 'MEK', 'ELF'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTagTypeFilter(f)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${
                        tagTypeFilter === f
                          ? 'bg-[var(--color-green)]/10 text-[var(--color-green)] border border-[var(--color-green)]/40'
                          : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] border border-[var(--color-paper-darker)] bg-[var(--color-paper-dark)]'
                      }`}
                    >
                      {f === 'alla' ? 'Alla' : f}
                    </button>
                  ))}
                  <div className="ml-auto flex gap-1">
                    {([['asc', 'Svagast'], ['desc', 'Starkast'], ['count', 'Flest']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setTagSort(val)}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${
                          tagSort === val
                            ? 'bg-[var(--color-paper-darker)] text-[var(--color-ink)] border border-[var(--color-paper-darker)]'
                            : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-faint)] border border-[var(--color-paper-darker)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredTagStats.length === 0 ? (
                    <p className="text-xs text-[var(--color-ink-faint)] text-center py-2">Inga ämnen matchar filtret</p>
                  ) : filteredTagStats.map(({ tag, pct, correct, total }) => (
                    <div key={tag}>
                      <div className="flex justify-between text-sm mb-1 gap-2">
                        <button
                          onClick={() => navigate(`/practice?tag=${encodeURIComponent(tag)}`)}
                          className="text-[var(--color-ink)] capitalize hover:text-[var(--color-green)] transition-colors text-left group flex items-center gap-1 min-w-0"
                        >
                          <span className="truncate">{tag.replace(/-/g, ' ')}</span>
                          <span className="text-[10px] text-[var(--color-ink-faint)] group-hover:text-[var(--color-green)] transition-colors shrink-0">→ öva</span>
                        </button>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-[var(--color-ink-faint)]">{tagAvailable[tag] ?? 0} tillgängliga</span>
                          <span className={`font-bold ${pct < 50 ? 'text-red-400' : pct < 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
                            {pct}% <span className="text-[var(--color-ink-faint)] font-normal">({correct}/{total})</span>
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">Tidigare pass</h2>
              <span className="text-xs text-[var(--color-ink-faint)]">{filteredHistory.length} pass totalt</span>
            </div>
            <div className="space-y-2.5 mb-8">
              {filteredHistory.slice(0, showAllHistory ? filteredHistory.length : 10).map(s => {
                const qs = s.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
                const c = qs.filter(q => q && s.answers[q!.id] === q!.answer).length
                const p = qs.length > 0 ? Math.round((c / qs.length) * 100) : 0
                const hpScore = estimateHpScore(p)
                const hpColor = hpScoreColor(hpScore)
                const date = new Date(s.startTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                const dur = s.endTime ? Math.round((s.endTime - s.startTime) / 60000) : null
                const pColor = p >= 70 ? 'text-emerald-400' : p >= 50 ? 'text-amber-400' : 'text-red-400'
                const sessionLabel = s.type === 'exam' ? 'HP-prov' : s.studyMode ? 'Studieläge' : s.mode === 'timed' ? 'Tidsmätning' : 'Övning'

                // Per-type breakdown for this session
                const sessionByType: Partial<Record<QuestionType, { correct: number; total: number }>> = {}
                qs.forEach(q => {
                  if (!q) return
                  if (!sessionByType[q.type]) sessionByType[q.type] = { correct: 0, total: 0 }
                  sessionByType[q.type]!.total++
                  if (s.answers[q.id] === q.answer) sessionByType[q.type]!.correct++
                })

                return (
                  <div key={s.id} className="card rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-ink)]">{date}</div>
                        <div className="text-[11px] text-[var(--color-ink-faint)] mt-0.5 flex items-center gap-1.5">
                          <span className="bg-[var(--color-paper-dark)] px-1.5 py-0.5 rounded text-[10px] font-medium text-[var(--color-ink-faint)]">{sessionLabel}</span>
                          <span>{qs.length} frågor{dur ? ` · ${dur} min` : ''}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-xl font-black ${pColor}`}>{p}%</div>
                        <div className={`text-[11px] font-bold ${hpColor}`}>{hpScore.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(Object.entries(sessionByType) as [QuestionType, { correct: number; total: number }][]).map(([t, v]) => {
                        const tp = Math.round((v.correct / v.total) * 100)
                        return (
                          <span key={t} className={`text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--color-paper-dark)] ${TYPE_COLORS[t].text}`}>
                            {t} {tp}%
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              {filteredHistory.length > 10 && (
                <button
                  onClick={() => setShowAllHistory(v => !v)}
                  className="w-full text-center text-xs text-[var(--color-ink-faint)] hover:text-[var(--color-ink-faint)] py-2 transition-colors"
                >
                  {showAllHistory ? 'Visa färre ▴' : `Visa alla ${filteredHistory.length} pass ▾`}
                </button>
              )}
            </div>

            {/* Achievements */}
            <div className="card rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider">Brickor</h2>
                <span className="text-xs text-[var(--color-ink-faint)]">{earnedIds.size}/{ALL_ACHIEVEMENTS.length} upplåsta</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ALL_ACHIEVEMENTS.map(a => {
                  const unlocked = earnedIds.has(a.id)
                  const style = RARITY_STYLES[a.rarity]
                  return (
                    <div
                      key={a.id}
                      title={`${a.title}: ${a.description}`}
                      className={`rounded-xl p-3 border text-center transition-all ${unlocked ? `${style.border} ${style.bg}` : 'border-[var(--color-paper-darker)] bg-[var(--color-paper-dark)] opacity-40'}`}
                    >
                      <div className="text-2xl mb-1">{a.icon}</div>
                      <div className={`text-[10px] font-black leading-tight ${unlocked ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)]'}`}>{a.title}</div>
                      {unlocked && <div className={`text-[9px] font-bold mt-0.5 ${style.labelColor}`}>{style.label}</div>}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Activity heat map — last 90 days */}
            <div className="card rounded-2xl p-6 mb-6">
              <h2 className="text-sm font-bold text-[var(--color-ink-faint)] uppercase tracking-wider mb-4">Aktivitet — senaste 90 dagarna</h2>
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
              <div className="flex items-center gap-2 mt-3 text-xs text-[var(--color-ink-faint)]">
                <span>Färre</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-3 rounded-sm bg-[var(--color-paper-darker)]" title="0 frågor" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--color-green)]/30" title="1–10 frågor" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--color-green)]/60" title="11–30 frågor" />
                  <div className="w-3 h-3 rounded-sm bg-[var(--color-green)]" title="30+ frågor" />
                </div>
                <span>Fler</span>
                <span className="ml-auto text-[var(--color-ink-faint)]">0 = grå · 1–10 = ljusgrön · 11–30 = medelgrön · 30+ = mörkgrön</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
