import { daysUntilExam } from './examDate'
import { computeReadiness } from './readiness'
import { loadHistory } from './session'

export interface PacingResult {
  dailyTarget: number
  weeklyTarget: number
  onTrack: boolean
  message: string
}

const TARGET_READINESS = 70

export function computePacing(): PacingResult {
  const days = daysUntilExam()

  if (days === null) {
    return {
      dailyTarget: 20,
      weeklyTarget: 140,
      onTrack: true,
      message: 'Sätt ett provdatum för att få personliga rekommendationer.',
    }
  }

  if (days <= 0) {
    return {
      dailyTarget: 0,
      weeklyTarget: 0,
      onTrack: true,
      message: 'Provet har passerat.',
    }
  }

  const readiness = computeReadiness()
  const history = loadHistory()

  const weekMs = 7 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const recentSessions = history.filter(s => s.startTime >= now - weekMs)
  const recentVolume = recentSessions.reduce(
    (sum, s) => sum + Object.keys(s.answers).length,
    0,
  )
  const recentDailyAvg = recentVolume / 7

  const gap = Math.max(0, TARGET_READINESS - readiness.score)

  let base: number
  if (days >= 60) base = 15
  else if (days >= 30) base = 20
  else if (days >= 14) base = 30
  else base = 40

  // Scale base upward proportionally to the readiness gap (up to +80% at full gap)
  const gapMultiplier = 1 + (gap / 100) * 0.8
  const daily = Math.min(50, Math.max(10, Math.round(base * gapMultiplier)))
  const weekly = daily * 7

  const onTrack = recentDailyAvg >= daily * 0.8

  let message: string
  if (readiness.score >= TARGET_READINESS) {
    message = `Bra jobbat! Håll uppe tempot — ${daily} frågor/dag håller dig redo.`
  } else if (onTrack) {
    message = `Du är på rätt spår — sikta på ${daily} frågor per dag för att vara redo till provet.`
  } else {
    const deficit = Math.round(daily - recentDailyAvg)
    message = `Öka tempot med ${deficit} extra frågor om dagen för att nå målet till provet.`
  }

  return { dailyTarget: daily, weeklyTarget: weekly, onTrack, message }
}
