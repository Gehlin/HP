import { questions } from '../data/questions'
import { loadHistory } from './session'
import { estimateSectionedScore } from './hpScore'
import type { QuestionType } from '../types'

const HP_SECONDS_PER_TYPE: Record<QuestionType, number> = {
  XYZ: 60, KVA: 60, NOG: 100, DTK: 115,
  ORD: 45, LAS: 120, MEK: 50, ELF: 120,
}

export interface TimeAnalytics {
  avgSeconds: number | null
  hpStandard: number
  ratio: number | null  // <1 = faster than HP pace, >1 = slower
}

export function timeAnalyticsByType(): Record<QuestionType, TimeAnalytics> {
  const history = loadHistory()
  const buckets: Record<QuestionType, number[]> = { XYZ: [], KVA: [], NOG: [], DTK: [], ORD: [], LAS: [], MEK: [], ELF: [] }

  history.forEach(s => {
    if (!s.questionTimes) return
    s.questionIds.forEach(id => {
      const q = questions.find(x => x.id === id)
      const ms = s.questionTimes?.[id]
      if (q && ms) buckets[q.type].push(ms / 1000)
    })
  })

  return (Object.keys(buckets) as QuestionType[]).reduce((acc, type) => {
    const times = buckets[type]
    const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : null
    const std = HP_SECONDS_PER_TYPE[type]
    acc[type] = {
      avgSeconds: avg,
      hpStandard: std,
      ratio: avg !== null ? avg / std : null,
    }
    return acc
  }, {} as Record<QuestionType, TimeAnalytics>)
}

export interface DifficultyAccuracy {
  correct: number
  total: number
  pct: number | null
}

export function accuracyByDifficulty(): Record<'easy' | 'medium' | 'hard', DifficultyAccuracy> {
  const history = loadHistory()
  const buckets = {
    easy:   { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard:   { correct: 0, total: 0 },
  }

  history.forEach(s => {
    s.questionIds.forEach(id => {
      const q = questions.find(x => x.id === id)
      const ans = s.answers[id]
      if (!q || !ans) return
      buckets[q.difficulty].total++
      if (ans === q.answer) buckets[q.difficulty].correct++
    })
  })

  return (Object.keys(buckets) as ('easy' | 'medium' | 'hard')[]).reduce((acc, d) => {
    const { correct, total } = buckets[d]
    acc[d] = { correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : null }
    return acc
  }, {} as Record<'easy' | 'medium' | 'hard', DifficultyAccuracy>)
}

function buildByType(s: ReturnType<typeof loadHistory>[number]): Record<QuestionType, { correct: number; total: number }> {
  const bt: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
    ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
    MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
  }
  s.questionIds.forEach(id => {
    const q = questions.find(x => x.id === id)
    if (!q || !s.answers[id]) return
    bt[q.type].total++
    if (s.answers[id] === q.answer) bt[q.type].correct++
  })
  return bt
}

// Per-session HP score history — oldest first, up to n sessions
export function hpScoreHistory(n = 15): number[] {
  return loadHistory()
    .slice(0, n)
    .reverse()
    .map(s => {
      const bt = buildByType(s)
      const { combined } = estimateSectionedScore(bt)
      return combined
    })
    .filter((v): v is number => v !== null)
}

// Per-type accuracy per session — oldest first, up to n sessions
export function typeAccuracyTrend(n = 12): Record<QuestionType, number[]> {
  const result: Record<QuestionType, number[]> = { XYZ: [], KVA: [], NOG: [], DTK: [], ORD: [], LAS: [], MEK: [], ELF: [] }
  loadHistory()
    .slice(0, n)
    .reverse()
    .forEach(s => {
      const typeMap: Partial<Record<QuestionType, { correct: number; total: number }>> = {}
      s.questionIds.forEach(id => {
        const q = questions.find(x => x.id === id)
        if (!q || !s.answers[id]) return
        if (!typeMap[q.type]) typeMap[q.type] = { correct: 0, total: 0 }
        typeMap[q.type]!.total++
        if (s.answers[id] === q.answer) typeMap[q.type]!.correct++
      })
      ;(Object.keys(result) as QuestionType[]).forEach(type => {
        const v = typeMap[type]
        if (v && v.total >= 2) result[type].push(Math.round((v.correct / v.total) * 100))
      })
    })
  return result
}

// Returns up to 3 question types where accuracy < 75% with sufficient data
export function weakTypeSummary(): { type: QuestionType; pct: number }[] {
  const history = loadHistory()
  const byType: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
    ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
    MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
  }
  history.forEach(s => {
    s.questionIds.forEach(id => {
      const q = questions.find(x => x.id === id)
      if (!q || !s.answers[id]) return
      byType[q.type].total++
      if (s.answers[id] === q.answer) byType[q.type].correct++
    })
  })
  return (Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
    .filter(([, v]) => v.total >= 5)
    .map(([type, v]) => ({ type, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.pct - b.pct)
    .filter(x => x.pct < 75)
    .slice(0, 3)
}

// Selects up to `limit` question IDs from the user's weakest tag areas.
// Mirrors the adaptiveIds logic in Practice.tsx — extract tags with <70% accuracy
// (min 3 answers), pick the 4 weakest, then sample questions touching those tags.
export function buildWeakAreaSession(limit = 20): string[] {
  const history = loadHistory()
  if (history.length === 0) return []
  const tagAcc: Record<string, { correct: number; total: number }> = {}
  history.forEach(s => {
    s.questionIds.forEach(qid => {
      const q = questions.find(x => x.id === qid)
      if (!q || !s.answers[qid]) return
      for (const tag of q.tags) {
        if (!tagAcc[tag]) tagAcc[tag] = { correct: 0, total: 0 }
        tagAcc[tag].total++
        if (s.answers[qid] === q.answer) tagAcc[tag].correct++
      }
    })
  })
  const weakTags = new Set(
    Object.entries(tagAcc)
      .filter(([, v]) => v.total >= 3 && (v.correct / v.total) < 0.70)
      .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
      .slice(0, 4)
      .map(([tag]) => tag)
  )
  if (weakTags.size === 0) return []
  return questions
    .filter(q => q.tags.some(t => weakTags.has(t)))
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)
    .map(q => q.id)
}

// Weighted rolling HP score — more recent sessions weighted higher
export function rollingHpScore(n = 10): number | null {
  const history = loadHistory().slice(0, n)
  if (history.length === 0) return null

  let weightedSum = 0
  let weightTotal = 0

  history.forEach((s, i) => {
    const bt = buildByType(s)
    const { combined } = estimateSectionedScore(bt)
    if (combined === null) return
    const weight = history.length - i  // most recent = highest weight
    weightedSum += combined * weight
    weightTotal += weight
  })

  if (weightTotal === 0) return null
  const raw = weightedSum / weightTotal
  return Math.round(raw * 20) / 20  // round to nearest 0.05
}
