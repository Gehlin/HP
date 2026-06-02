// Maps overall % correct on the quantitative section to an estimated HP score (1.00–2.00).
// Based on published Swedish HP norm distributions (approximate).
const SCORE_TABLE: [number, number][] = [
  [0,   1.00],
  [15,  1.05],
  [25,  1.10],
  [33,  1.20],
  [42,  1.30],
  [50,  1.40],
  [57,  1.50],
  [63,  1.55],
  [68,  1.60],
  [73,  1.65],
  [78,  1.70],
  [82,  1.75],
  [86,  1.80],
  [89,  1.85],
  [92,  1.90],
  [95,  1.95],
  [98,  2.00],
]

export function estimateHpScore(pct: number): number {
  for (let i = SCORE_TABLE.length - 1; i >= 0; i--) {
    if (pct >= SCORE_TABLE[i][0]) {
      const [lo_pct, lo_score] = SCORE_TABLE[i]
      const [hi_pct, hi_score] = SCORE_TABLE[i + 1] ?? [100, 2.00]
      const t = hi_pct === lo_pct ? 1 : (pct - lo_pct) / (hi_pct - lo_pct)
      const raw = lo_score + t * (hi_score - lo_score)
      return Math.round(raw * 20) / 20  // round to nearest 0.05
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
