import { questions } from '../data/questions'
import { loadHistory } from './session'
import { getStats } from './srs'

export interface ReadinessBreakdown {
  score: number      // 0–100 composite
  mastery: number    // % of questions with interval ≥ 7 days
  accuracy: number   // rolling accuracy last 10 sessions
  coverage: number   // % of questions attempted at least once
  label: string
  labelColor: string
}

export function computeReadiness(): ReadinessBreakdown {
  const history = loadHistory()
  const total = questions.length

  // Coverage: questions attempted at least once
  const attempted = new Set<string>()
  history.forEach(s => Object.keys(s.answers).forEach(id => attempted.add(id)))
  const coverage = total > 0 ? Math.round((attempted.size / total) * 100) : 0

  // Mastery: SRS interval >= 7
  const mastered = questions.filter(q => {
    const r = getStats(q.id)
    return r !== null && r.interval >= 7
  }).length
  const mastery = total > 0 ? Math.round((mastered / total) * 100) : 0

  // Rolling accuracy: last 10 sessions
  const recent = history.slice(0, 10)
  let rollingCorrect = 0
  let rollingTotal = 0
  recent.forEach(s => {
    s.questionIds.forEach(id => {
      const q = questions.find(x => x.id === id)
      if (q && s.answers[id]) {
        rollingTotal++
        if (s.answers[id] === q.answer) rollingCorrect++
      }
    })
  })
  const accuracy = rollingTotal > 0 ? Math.round((rollingCorrect / rollingTotal) * 100) : 0

  // Weighted composite: accuracy 45%, mastery 35%, coverage 20%
  const score = Math.round(accuracy * 0.45 + mastery * 0.35 + coverage * 0.20)

  const { label, labelColor } = readinessLabel(score)
  return { score, mastery, accuracy, coverage, label, labelColor }
}

function readinessLabel(score: number): { label: string; labelColor: string } {
  if (score >= 80) return { label: 'Redo för provet',        labelColor: 'text-emerald-400' }
  if (score >= 65) return { label: 'Väl förberedd',          labelColor: 'text-blue-400'    }
  if (score >= 45) return { label: 'På rätt väg',            labelColor: 'text-amber-400'   }
  if (score >= 25) return { label: 'Under förberedelse',     labelColor: 'text-orange-400'  }
  return              { label: 'Börja träna regelbundet', labelColor: 'text-red-400'     }
}
