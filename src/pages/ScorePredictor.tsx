import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadHistory } from '../utils/session'
import PageHeader from '../components/PageHeader'
import { questions } from '../data/questions'
import {
  estimateSectionedScore,
  estimateHpScore,
  hpScoreColor,
  hpScoreLabel,
  requiredAccuracy,
  QUANT_TYPES,
  VERBAL_TYPES,
} from '../utils/hpScore'
import { hpScoreHistory } from '../utils/analytics'
import type { QuestionType } from '../types'

// Approximate Swedish HP percentile benchmarks (% of examinees at-or-below)
const PERCENTILE_TABLE: [number, number][] = [
  [1.00, 5],  [1.10, 10], [1.20, 17], [1.30, 25], [1.40, 35],
  [1.50, 47], [1.60, 60], [1.70, 72], [1.80, 83], [1.85, 88],
  [1.90, 93], [1.95, 97], [2.00, 99],
]

function estimatePercentile(score: number): number {
  for (let i = PERCENTILE_TABLE.length - 1; i >= 0; i--) {
    if (score >= PERCENTILE_TABLE[i][0]) {
      if (i === PERCENTILE_TABLE.length - 1) return PERCENTILE_TABLE[i][1]
      const [lo_s, lo_p] = PERCENTILE_TABLE[i]
      const [hi_s, hi_p] = PERCENTILE_TABLE[i + 1]
      const t = (score - lo_s) / (hi_s - lo_s)
      return Math.round(lo_p + t * (hi_p - lo_p))
    }
  }
  return 5
}

const GOAL_OPTIONS = [
  { score: 1.25, label: 'Grundnivå' },
  { score: 1.40, label: 'Godkänt' },
  { score: 1.50, label: 'Bra' },
  { score: 1.60, label: 'Starkt' },
  { score: 1.70, label: 'Mycket bra' },
  { score: 1.80, label: 'Utmärkt' },
  { score: 1.90, label: 'Topp' },
]

const TYPE_COLORS: Record<QuestionType, string> = {
  XYZ: 'text-[var(--color-terracotta)]', KVA: 'text-[var(--color-terracotta)]',
  NOG: 'text-[var(--color-terracotta)]', DTK: 'text-[var(--color-gold-deep)]',
  ORD: 'text-[var(--color-green)]',      LAS: 'text-[var(--color-green)]',
  MEK: 'text-[var(--color-green)]',      ELF: 'text-[var(--color-green)]',
}

const TYPE_BARS: Record<QuestionType, string> = {
  XYZ: 'bg-[var(--color-terracotta)]', KVA: 'bg-[var(--color-terracotta)]',
  NOG: 'bg-[var(--color-terracotta)]', DTK: 'bg-[var(--color-gold-deep)]',
  ORD: 'bg-[var(--color-green)]',      LAS: 'bg-[var(--color-green)]',
  MEK: 'bg-[var(--color-green)]',      ELF: 'bg-[var(--color-green)]',
}

function SectionScore({ score, label, pct }: { score: number | null; label: string; pct: number | null }) {
  const barPct = score !== null ? ((score - 1.0) / 1.0) * 100 : 0
  const barColor = score !== null
    ? (score >= 1.80 ? 'bg-[var(--color-green)]' : score >= 1.50 ? 'bg-[var(--color-green-light)]' : score >= 1.25 ? 'bg-[var(--color-gold-deep)]' : 'bg-[var(--color-error)]')
    : 'bg-[var(--color-paper-dark)]'
  return (
    <div>
      <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">{label}</div>
      {score !== null ? (
        <>
          <div className={`text-3xl font-black mb-1 ${hpScoreColor(score)}`}>{score.toFixed(2)}</div>
          {pct !== null && (
            <div className="text-[10px] text-[var(--color-ink-faint)] mb-2">{pct}% träffsäkerhet</div>
          )}
        </>
      ) : (
        <div className="text-2xl font-black text-[var(--color-ink-faint)] mb-2">—</div>
      )}
      <div className="h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${barPct}%` }} />
      </div>
    </div>
  )
}

export default function ScorePredictor() {
  const navigate = useNavigate()
  const [goalIdx, setGoalIdx] = useState(3) // default: 1.60
  const goal = GOAL_OPTIONS[goalIdx]

  const history = loadHistory()
  const hpHistory = hpScoreHistory()

  const { byType, quantPct, verbalPct } = useMemo(() => {
    const bt: Record<QuestionType, { correct: number; total: number }> = {
      XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
      NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
      ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
      MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
    }
    history.forEach(s => {
      s.questionIds.forEach(id => {
        const q = questions.find(x => x.id === id)
        if (!q || !s.answers[id]) return
        bt[q.type].total++
        if (s.answers[id] === q.answer) bt[q.type].correct++
      })
    })
    const qC = QUANT_TYPES.reduce((a, t) => a + bt[t].correct, 0)
    const qT = QUANT_TYPES.reduce((a, t) => a + bt[t].total, 0)
    const vC = VERBAL_TYPES.reduce((a, t) => a + bt[t].correct, 0)
    const vT = VERBAL_TYPES.reduce((a, t) => a + bt[t].total, 0)
    return {
      byType: bt,
      quantPct: qT > 0 ? Math.round((qC / qT) * 100) : null,
      verbalPct: vT > 0 ? Math.round((vC / vT) * 100) : null,
    }
  }, [history])

  const { quant, verbal, combined } = estimateSectionedScore(byType)
  const percentile = combined !== null ? estimatePercentile(combined) : null

  const isImproving = hpHistory.length >= 3 && hpHistory[hpHistory.length - 1] > hpHistory[0]
  const isDeclining = hpHistory.length >= 3 && hpHistory[hpHistory.length - 1] < hpHistory[0]

  const requiredPct = requiredAccuracy(goal.score)

  // Per-type breakdown sorted by accuracy, worst first
  const typeBreakdown = (Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
    .filter(([, v]) => v.total >= 3)
    .map(([type, v]) => ({
      type,
      pct: Math.round((v.correct / v.total) * 100),
      score: estimateHpScore(Math.round((v.correct / v.total) * 100)),
      total: v.total,
    }))
    .sort((a, b) => a.pct - b.pct)

  const hasData = history.length > 0 && (quant !== null || verbal !== null)

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="HP-poängprediktor" onBack={() => navigate('/')} />
      <div className="max-w-2xl mx-auto px-4 py-8">

        <div className="mb-6">
          <div className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-2">HP-analys</div>
          <h1 className="text-3xl font-black">Din HP-prognos</h1>
          <p className="text-[var(--color-ink-muted)] text-sm mt-2 leading-relaxed">
            Estimerat HP-resultat baserat på dina träningspass. Exakt poäng beror på provdagens normering.
          </p>
        </div>

        {!hasData ? (
          <div className="card rounded-2xl p-10 text-center">
            <div className="text-4xl font-black text-[var(--color-ink-faint)] mb-3">—</div>
            <div className="text-[var(--color-ink-muted)] font-semibold mb-1">Inga träningsdata ännu</div>
            <p className="text-[var(--color-ink-faint)] text-sm mb-6">Genomför träningspass för att se din HP-prognos.</p>
            <button
              onClick={() => navigate('/practice')}
              className="btn-primary px-6 py-3 rounded-xl font-bold text-sm"
            >
              Starta träning →
            </button>
          </div>
        ) : (
          <>
            {/* ── Main score card ── */}
            <div className="card rounded-2xl p-6 mb-4">
              {combined !== null && (
                <div className="text-center mb-6 pb-6 border-b border-[var(--color-card-border)]">
                  <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Estimerat HP-resultat</div>
                  <div className={`text-7xl font-black mb-1 tabular-nums ${hpScoreColor(combined)}`}>{combined.toFixed(2)}</div>
                  <div className={`text-sm font-bold mb-1 ${hpScoreColor(combined)}`}>{hpScoreLabel(combined)}</div>
                  {percentile !== null && (
                    <div className="text-xs text-[var(--color-ink-faint)] mb-3">Bättre än ca {percentile}% av provtagarna</div>
                  )}
                  {hpHistory.length >= 3 && (
                    <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                      isImproving ? 'bg-[var(--color-green-muted)] text-[var(--color-green)]' :
                      isDeclining ? 'bg-[var(--color-error-bg)] text-[var(--color-error)]' :
                      'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'
                    }`}>
                      {isImproving ? '↑' : isDeclining ? '↓' : '→'}
                      {isImproving ? 'Stigande trend' : isDeclining ? 'Sjunkande trend' : 'Stabil trend'}
                    </div>
                  )}
                  <div className="mt-4 h-2.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        combined >= 1.80 ? 'bg-[var(--color-green)]' :
                        combined >= 1.50 ? 'bg-[var(--color-green-light)]' :
                        combined >= 1.25 ? 'bg-[var(--color-gold-deep)]' : 'bg-[var(--color-error)]'
                      }`}
                      style={{ width: `${((combined - 1.0) / 1.0) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[var(--color-ink-faint)] mt-1">
                    <span>1.00</span><span>1.50</span><span>2.00</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <SectionScore score={quant} label="Kvantitativt" pct={quantPct} />
                <SectionScore score={verbal} label="Verbalt" pct={verbalPct} />
              </div>

              {(quant === null || verbal === null) && (
                <p className="text-[10px] text-[var(--color-ink-faint)] text-center mt-4">
                  Öva fler {quant === null ? 'kvantitativa' : 'verbala'} frågor för fullständig prognos.
                </p>
              )}
            </div>

            {/* ── Goal setter ── */}
            <div className="card rounded-2xl p-6 mb-4">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Sätt ett mål</div>
              <div className="grid grid-cols-7 gap-1 mb-6">
                {GOAL_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.score}
                    onClick={() => setGoalIdx(i)}
                    className={`rounded-xl py-2 px-1 border text-center transition-all ${
                      goalIdx === i
                        ? `border-[var(--color-green)] bg-[var(--color-green-muted)] ${hpScoreColor(opt.score)}`
                        : 'border-[var(--color-card-border)] text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] hover:border-[var(--color-card-border)]'
                    }`}
                  >
                    <div className="text-xs font-black">{opt.score.toFixed(2)}</div>
                    <div className="text-[9px] mt-0.5 leading-tight text-current opacity-70">{opt.label}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-5">
                <div className="text-xs text-[var(--color-ink-muted)]">
                  För att nå <span className={`font-bold ${hpScoreColor(goal.score)}`}>{goal.score.toFixed(2)}</span>{' '}
                  ({goal.label}) behöver du <span className="font-bold text-[var(--color-ink)]">≈ {requiredPct}%</span> träffsäkerhet.
                </div>

                {[
                  { label: 'Kvantitativt', current: quantPct, types: QUANT_TYPES },
                  { label: 'Verbalt', current: verbalPct, types: VERBAL_TYPES },
                ].map(({ label, current }) => {
                  const achieved = current !== null && current >= requiredPct
                  const gap = current !== null ? requiredPct - current : null
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-[var(--color-ink-muted)]">{label}</span>
                        <div className="flex items-center gap-2 text-sm">
                          {current !== null ? (
                            <>
                              <span className={`font-bold ${achieved ? 'text-[var(--color-green)]' : 'text-[var(--color-ink)]'}`}>{current}%</span>
                              {achieved
                                ? <span className="text-[11px] font-bold text-[var(--color-green)]">✓ Uppnått</span>
                                : <span className="text-[11px] text-[var(--color-error)]">+{gap}pp saknas</span>
                              }
                            </>
                          ) : (
                            <span className="text-[var(--color-ink-faint)] text-xs">Inga data</span>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden relative">
                        {current !== null && (
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${achieved ? 'bg-[var(--color-green)]' : 'bg-[var(--color-gold-deep)]'}`}
                            style={{ width: `${Math.min(100, current)}%` }}
                          />
                        )}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-[var(--color-ink)] opacity-30 z-10"
                          style={{ left: `${Math.min(100, requiredPct)}%` }}
                          title={`Mål: ${requiredPct}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-[var(--color-ink-faint)] mt-1">
                        <span>0%</span>
                        <span>↑ Mål: {requiredPct}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Per-type breakdown ── */}
            {typeBreakdown.length > 0 && (
              <div className="card rounded-2xl p-6 mb-4">
                <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Delprov — träffsäkerhet</div>
                <div className="space-y-3">
                  {typeBreakdown.map(({ type, pct, total }) => {
                    const isWeak = pct < 60
                    const isMedium = pct >= 60 && pct < 75
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className={`w-9 text-xs font-black shrink-0 ${TYPE_COLORS[type]}`}>{type}</span>
                        <div className="flex-1 relative">
                          <div className="h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                            <div
                              className={`h-full ${TYPE_BARS[type]} rounded-full opacity-60`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 w-28 justify-end">
                          <span className={`text-xs font-bold ${isWeak ? 'text-[var(--color-error)]' : isMedium ? 'text-[var(--color-gold-deep)]' : 'text-[var(--color-green)]'}`}>
                            {pct}%
                          </span>
                          <span className="text-[10px] text-[var(--color-ink-faint)]">({total})</span>
                          {isWeak && (
                            <button
                              onClick={() => navigate(`/practice?type=${type}`)}
                              className="text-[9px] font-bold text-[var(--color-feedback-wrong-title)] bg-[var(--color-feedback-wrong-bg)] border border-[var(--color-feedback-wrong-border)] rounded px-1.5 py-0.5 hover:opacity-80 transition-opacity"
                            >
                              Öva
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-[10px] text-[var(--color-ink-faint)] mt-3">(n) = antal besvarade frågor · kräver minst 3 besvarade</p>
              </div>
            )}

            {/* ── HP score context ── */}
            <div className="card rounded-2xl p-5 mb-4">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">HP-skalan i kontext</div>
              <div className="space-y-1.5">
                {[
                  { range: '1.90–2.00', label: 'Topp 7%',     color: 'text-[var(--color-green)]',      bar: 'bg-[var(--color-green)]'      },
                  { range: '1.80–1.89', label: 'Topp 17%',    color: 'text-[var(--color-green)]',      bar: 'bg-[var(--color-green)]'      },
                  { range: '1.70–1.79', label: 'Topp 28%',    color: 'text-[var(--color-green-light)]',bar: 'bg-[var(--color-green-light)]'},
                  { range: '1.60–1.69', label: 'Topp 40%',    color: 'text-[var(--color-green-light)]',bar: 'bg-[var(--color-green-light)]'},
                  { range: '1.50–1.59', label: 'Topp 53%',    color: 'text-[var(--color-gold-deep)]',  bar: 'bg-[var(--color-gold-deep)]'  },
                  { range: '1.40–1.49', label: 'Topp 65%',    color: 'text-[var(--color-gold-deep)]',  bar: 'bg-[var(--color-gold-deep)]'  },
                  { range: '1.00–1.39', label: 'Under medel', color: 'text-[var(--color-error)]',      bar: 'bg-[var(--color-error)]'      },
                ].map(row => {
                  const lo = parseFloat(row.range.split('–')[0])
                  const isCurrent = combined !== null && combined >= lo && (row.range === '1.00–1.39' ? true : combined < parseFloat(row.range.split('–')[1]) + 0.01)
                  return (
                    <div
                      key={row.range}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isCurrent ? 'bg-[var(--color-paper-dark)] ring-1 ring-[var(--color-card-border)]' : ''}`}
                    >
                      <span className={`text-xs font-black w-20 shrink-0 ${row.color}`}>{row.range}</span>
                      <div className="flex-1 h-1 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                        <div className={`h-full ${row.bar} rounded-full opacity-50`} style={{ width: '100%' }} />
                      </div>
                      <span className={`text-[11px] font-bold w-20 text-right shrink-0 ${isCurrent ? row.color : 'text-[var(--color-ink-faint)]'}`}>
                        {row.label}{isCurrent ? ' ← du' : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
              <p className="text-[10px] text-[var(--color-ink-faint)] mt-3">Uppskattade percentiler baserade på historisk HP-normering.</p>
            </div>

            {/* ── CTA ── */}
            <button
              onClick={() => navigate('/practice')}
              className="w-full card border border-[var(--color-card-border)] bg-[var(--color-paper-dark)] hover:bg-[var(--color-paper-darker)] rounded-2xl p-4 text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[var(--color-ink)]">Fortsätt träna →</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">Adaptiv drill fokuserar automatiskt dina svagaste ämnen</div>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-green)] shrink-0">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
