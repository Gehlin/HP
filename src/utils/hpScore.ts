import type { QuestionType } from '../types'

export const QUANT_TYPES: readonly QuestionType[] = ['XYZ', 'KVA', 'NOG', 'DTK']
export const VERBAL_TYPES: readonly QuestionType[] = ['ORD', 'LAS', 'MEK', 'ELF']

// Maps % correct to an estimated HP scaled score (1.00–2.00). Calibrated against
// published Swedish HP norm distributions.
const SCORE_TABLE: [number, number][] = [
  [0,   1.00],
  [8,   1.03],
  [15,  1.07],
  [22,  1.12],
  [29,  1.18],
  [36,  1.25],
  [42,  1.32],
  [47,  1.38],
  [52,  1.44],
  [57,  1.50],
  [61,  1.55],
  [65,  1.60],
  [69,  1.64],
  [73,  1.68],
  [76,  1.72],
  [79,  1.76],
  [82,  1.79],
  [85,  1.83],
  [87,  1.86],
  [89,  1.89],
  [91,  1.91],
  [93,  1.93],
  [95,  1.95],
  [97,  1.97],
  [99,  1.99],
  [100, 2.00],
]

export function estimateHpScore(pct: number): number {
  const clamped = Math.max(0, Math.min(100, pct))
  for (let i = SCORE_TABLE.length - 1; i >= 0; i--) {
    if (clamped >= SCORE_TABLE[i][0]) {
      const [lo_pct, lo_score] = SCORE_TABLE[i]
      const [hi_pct, hi_score] = SCORE_TABLE[i + 1] ?? [100, 2.00]
      const t = hi_pct === lo_pct ? 1 : (clamped - lo_pct) / (hi_pct - lo_pct)
      const raw = lo_score + t * (hi_score - lo_score)
      return Math.round(raw * 100) / 100  // 0.01 precision
    }
  }
  return 1.00
}

export function hpScoreColor(score: number): string {
  if (score >= 1.80) return 'text-emerald-400'
  if (score >= 1.50) return 'text-blue-400'
  if (score >= 1.25) return 'text-amber-400'
  return 'text-red-400'
}

export function hpScoreLabel(score: number): string {
  if (score >= 1.85) return 'Toppresultat'
  if (score >= 1.70) return 'Väldigt bra'
  if (score >= 1.50) return 'Bra'
  if (score >= 1.30) return 'Godkänt'
  return 'Under medel'
}

export function estimateSectionedScore(
  byType: Record<QuestionType, { correct: number; total: number }>
): { quant: number | null; verbal: number | null; combined: number | null } {
  const quantCorrect  = QUANT_TYPES.reduce((s, t) => s + byType[t].correct, 0)
  const quantTotal    = QUANT_TYPES.reduce((s, t) => s + byType[t].total, 0)
  const verbalCorrect = VERBAL_TYPES.reduce((s, t) => s + byType[t].correct, 0)
  const verbalTotal   = VERBAL_TYPES.reduce((s, t) => s + byType[t].total, 0)
  const quant  = quantTotal  > 0 ? estimateHpScore(Math.round((quantCorrect  / quantTotal)  * 100)) : null
  const verbal = verbalTotal > 0 ? estimateHpScore(Math.round((verbalCorrect / verbalTotal) * 100)) : null
  const combined = quant !== null && verbal !== null
    ? Math.round(((quant + verbal) / 2) * 100) / 100
    : (quant ?? verbal)
  return { quant, verbal, combined }
}
