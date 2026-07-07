import { describe, it, expect } from 'vitest'
import { estimateHpScore, hpScoreColor, hpScoreLabel, requiredAccuracy, estimateSectionedScore } from './hpScore'
import type { QuestionType } from '../types'

// All expected values below were hand-derived from the published SCORE_TABLE
// (0%→1.00 ... 100%→2.00, piecewise-linear interpolation between the listed
// breakpoints), independently of this file's implementation, then cross-checked
// with a standalone re-implementation of the same table before being hardcoded here.

describe('estimateHpScore', () => {
  it('returns 1.00 at 0%', () => {
    expect(estimateHpScore(0)).toBe(1.00)
  })

  it('returns 2.00 at 100%', () => {
    expect(estimateHpScore(100)).toBe(2.00)
  })

  it('returns the exact table value on an exact breakpoint (65% -> 1.60)', () => {
    expect(estimateHpScore(65)).toBe(1.60)
  })

  it('interpolates between breakpoints (50% between 47%/1.38 and 52%/1.44 -> 1.42)', () => {
    // t = (50-47)/(52-47) = 0.6; raw = 1.38 + 0.6*0.06 = 1.416 -> rounds to 1.42
    expect(estimateHpScore(50)).toBe(1.42)
  })

  it('interpolates between breakpoints (75% between 73%/1.68 and 76%/1.72 -> 1.71)', () => {
    // t = (75-73)/(76-73) = 0.6667; raw = 1.68 + 0.6667*0.04 = 1.70667 -> rounds to 1.71
    expect(estimateHpScore(75)).toBe(1.71)
  })

  it('clamps negative percentages to 0% (still 1.00)', () => {
    expect(estimateHpScore(-10)).toBe(1.00)
  })

  it('clamps percentages above 100 to 100% (still 2.00)', () => {
    expect(estimateHpScore(150)).toBe(2.00)
  })
})

describe('hpScoreColor', () => {
  it('is emerald at and above 1.80', () => {
    expect(hpScoreColor(1.80)).toBe('text-emerald-400')
    expect(hpScoreColor(1.99)).toBe('text-emerald-400')
  })

  it('is blue in [1.50, 1.80)', () => {
    expect(hpScoreColor(1.79)).toBe('text-blue-400')
    expect(hpScoreColor(1.50)).toBe('text-blue-400')
  })

  it('is amber in [1.25, 1.50)', () => {
    expect(hpScoreColor(1.49)).toBe('text-amber-400')
    expect(hpScoreColor(1.25)).toBe('text-amber-400')
  })

  it('is red below 1.25', () => {
    expect(hpScoreColor(1.24)).toBe('text-red-400')
    expect(hpScoreColor(1.00)).toBe('text-red-400')
  })
})

describe('hpScoreLabel', () => {
  it('is Toppresultat at and above 1.85', () => {
    expect(hpScoreLabel(1.85)).toBe('Toppresultat')
  })

  it('is Väldigt bra in [1.70, 1.85)', () => {
    expect(hpScoreLabel(1.84)).toBe('Väldigt bra')
    expect(hpScoreLabel(1.70)).toBe('Väldigt bra')
  })

  it('is Bra in [1.50, 1.70)', () => {
    expect(hpScoreLabel(1.69)).toBe('Bra')
    expect(hpScoreLabel(1.50)).toBe('Bra')
  })

  it('is Godkänt in [1.30, 1.50)', () => {
    expect(hpScoreLabel(1.49)).toBe('Godkänt')
    expect(hpScoreLabel(1.30)).toBe('Godkänt')
  })

  it('is Under medel below 1.30', () => {
    expect(hpScoreLabel(1.29)).toBe('Under medel')
    expect(hpScoreLabel(1.00)).toBe('Under medel')
  })
})

describe('requiredAccuracy', () => {
  it('requires 0% accuracy for the minimum score 1.00', () => {
    expect(requiredAccuracy(1.00)).toBe(0)
  })

  it('requires 100% accuracy for the maximum score 2.00', () => {
    expect(requiredAccuracy(2.00)).toBe(100)
  })

  it('reverse-maps an exact breakpoint score (1.44 -> 52%)', () => {
    expect(requiredAccuracy(1.44)).toBe(52)
  })

  it('reverse-maps an interpolated score, rounding up (1.40 -> 49%)', () => {
    // Falls in the 47%/1.38 -> 52%/1.44 segment: t = (1.40-1.38)/(1.44-1.38) = 0.3333;
    // 47 + 0.3333*5 = 48.667 -> ceil to 49.
    expect(requiredAccuracy(1.40)).toBe(49)
  })

  it('clamps a target below 1.00 to the same result as 1.00', () => {
    expect(requiredAccuracy(0.5)).toBe(0)
  })

  it('clamps a target above 2.00 to the same result as 2.00', () => {
    expect(requiredAccuracy(3)).toBe(100)
  })
})

describe('estimateSectionedScore', () => {
  const emptyByType = (): Record<QuestionType, { correct: number; total: number }> => ({
    XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
    ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
    MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
  })

  it('returns quant=null, verbal=null, combined=null with zero attempts everywhere (first-ever session)', () => {
    const result = estimateSectionedScore(emptyByType())
    expect(result).toEqual({ quant: null, verbal: null, combined: null })
  })

  it('returns combined=quant when only quant types have attempts (verbal untouched)', () => {
    const byType = emptyByType()
    // All-correct quant section -> pct 100 -> 2.00
    byType.XYZ = { correct: 5, total: 5 }
    byType.KVA = { correct: 5, total: 5 }
    const result = estimateSectionedScore(byType)
    expect(result.quant).toBe(2.00)
    expect(result.verbal).toBeNull()
    expect(result.combined).toBe(2.00)
  })

  it('returns combined=verbal when only verbal types have attempts (quant untouched)', () => {
    const byType = emptyByType()
    // All-wrong verbal section -> pct 0 -> 1.00
    byType.ORD = { correct: 0, total: 5 }
    const result = estimateSectionedScore(byType)
    expect(result.verbal).toBe(1.00)
    expect(result.quant).toBeNull()
    expect(result.combined).toBe(1.00)
  })

  it('averages quant and verbal when both have attempts (mixed performance)', () => {
    const byType = emptyByType()
    // Quant: 15/20 correct = 75% -> 1.71
    byType.XYZ = { correct: 5, total: 5 }
    byType.KVA = { correct: 5, total: 5 }
    byType.NOG = { correct: 5, total: 5 }
    byType.DTK = { correct: 0, total: 5 }
    // Verbal: 8/20 correct = 40% -> 1.30
    byType.ORD = { correct: 2, total: 5 }
    byType.LAS = { correct: 2, total: 5 }
    byType.MEK = { correct: 2, total: 5 }
    byType.ELF = { correct: 2, total: 5 }
    const result = estimateSectionedScore(byType)
    expect(result.quant).toBe(1.71)
    expect(result.verbal).toBe(1.30)
    // average of 1.71 and 1.30 = 1.505 -> rounds to 1.51
    expect(result.combined).toBe(1.51)
  })

  it('handles all-correct across every type (top score)', () => {
    const byType = emptyByType()
    ;(Object.keys(byType) as QuestionType[]).forEach(t => { byType[t] = { correct: 4, total: 4 } })
    const result = estimateSectionedScore(byType)
    expect(result.quant).toBe(2.00)
    expect(result.verbal).toBe(2.00)
    expect(result.combined).toBe(2.00)
  })

  it('handles all-wrong across every type (bottom score)', () => {
    const byType = emptyByType()
    ;(Object.keys(byType) as QuestionType[]).forEach(t => { byType[t] = { correct: 0, total: 4 } })
    const result = estimateSectionedScore(byType)
    expect(result.quant).toBe(1.00)
    expect(result.verbal).toBe(1.00)
    expect(result.combined).toBe(1.00)
  })
})
