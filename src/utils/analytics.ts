import { questions } from '../data/questions'
import { loadHistory } from './session'
import { estimateHpScore } from './hpScore'
import type { QuestionType } from '../types'

const HP_SECONDS_PER_TYPE: Record<QuestionType, number> = {
  XYZ: 60,
  KVA: 60,
  NOG: 100,
  DTK: 115,
}

export interface TimeAnalytics {
  avgSeconds: number | null
  hpStandard: number
  ratio: number | null  // <1 = faster than HP pace, >1 = slower
}

export function timeAnalyticsByType(): Record<QuestionType, TimeAnalytics> {
  const history = loadHistory()
  const buckets: Record<QuestionType, number[]> = { XYZ: [], KVA: [], NOG: [], DTK: [] }

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

// Weighted rolling HP score — more recent sessions weighted higher
export function rollingHpScore(n = 10): number | null {
  const history = loadHistory().slice(0, n)
  if (history.length === 0) return null

  let weightedSum = 0
  let weightTotal = 0

  history.forEach((s, i) => {
    const qs = s.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
    if (qs.length === 0) return
    const correct = qs.filter(q => q && s.answers[q.id] === q.answer).length
    const pct = Math.round((correct / qs.length) * 100)
    const hp = estimateHpScore(pct)
    const weight = history.length - i  // most recent = highest weight
    weightedSum += hp * weight
    weightTotal += weight
  })

  if (weightTotal === 0) return null
  const raw = weightedSum / weightTotal
  return Math.round(raw * 20) / 20  // round to nearest 0.05
}
