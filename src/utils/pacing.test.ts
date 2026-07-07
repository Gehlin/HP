import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AnswerKey, ExamSession } from '../types'
import { setExamDate, clearExamDate } from './examDate'

// computePacing's readiness-gap math is what we want to hand-verify; computeReadiness
// itself is already covered by readiness.test.ts. Mock it here so each scenario can
// supply an exact, controlled readiness.score instead of deriving one from a
// constructed history against the real 1446-question bank.
vi.mock('./readiness', () => ({ computeReadiness: vi.fn() }))

const HISTORY_KEY = 'hp_session_history'

function makeSession(startTime: number, answerCount: number): ExamSession {
  const answers: Record<string, AnswerKey> = {}
  for (let i = 0; i < answerCount; i++) answers[`q${i}`] = 'A'
  return {
    id: crypto.randomUUID(),
    questionIds: Object.keys(answers),
    answers,
    startTime,
    mode: 'untimed',
    instantFeedback: true,
    type: 'drill',
  }
}

function setRecentVolume(totalAnsweredLastWeek: number, sessionCount = 1) {
  // Spread the volume across `sessionCount` sessions, all within the last 7 days.
  const now = Date.now()
  const per = Math.floor(totalAnsweredLastWeek / sessionCount)
  const sessions = Array.from({ length: sessionCount }, (_, i) =>
    makeSession(now - i * 60_000, per),
  )
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('computePacing — no exam date set', () => {
  it('returns generic fallback targets and a prompt to set an exam date', async () => {
    clearExamDate()
    const { computePacing } = await import('./pacing')
    const r = computePacing()
    expect(r).toEqual({
      dailyTarget: 20,
      weeklyTarget: 140,
      onTrack: true,
      message: 'Sätt ett provdatum för att få personliga rekommendationer.',
    })
  })
})

describe('computePacing — exam date has passed', () => {
  it('returns all-zero targets once days-until-exam is <= 0', async () => {
    const past = new Date()
    past.setDate(past.getDate() - 1)
    setExamDate(past.toISOString().slice(0, 10))
    const { computePacing } = await import('./pacing')
    const r = computePacing()
    expect(r.dailyTarget).toBe(0)
    expect(r.weeklyTarget).toBe(0)
    expect(r.onTrack).toBe(true)
    expect(r.message).toBe('Provet har passerat.')
  })

  it('treats an exam that is exactly today (0 days left) the same as passed', async () => {
    const today = new Date()
    setExamDate(today.toISOString().slice(0, 10))
    const { computePacing } = await import('./pacing')
    const r = computePacing()
    expect(r.dailyTarget).toBe(0)
    expect(r.message).toBe('Provet har passerat.')
  })
})

describe('computePacing — plenty of time left (days >= 60), on track', () => {
  it('uses the base-15 target with no readiness-gap boost when already at the target readiness', async () => {
    const far = new Date()
    far.setDate(far.getDate() + 90)
    setExamDate(far.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 70, mastery: 70, accuracy: 70, coverage: 70, label: '', labelColor: '' })
    // gap = max(0, 70-70) = 0 -> gapMultiplier = 1 -> daily = round(15*1) = 15
    setRecentVolume(15 * 7) // recentDailyAvg = 15, comfortably >= 15*0.8=12
    const { computePacing } = await import('./pacing')
    const r = computePacing()
    expect(r.dailyTarget).toBe(15)
    expect(r.weeklyTarget).toBe(105)
    expect(r.onTrack).toBe(true)
    // readiness.score(70) >= TARGET_READINESS(70) -> the "Bra jobbat" branch specifically
    expect(r.message).toMatch(/^Bra jobbat!/)
  })
})

describe('computePacing — badly behind, exam soon (days < 14)', () => {
  it('scales the daily target up via the readiness gap, clamped at the 50 ceiling, and reports the exact deficit', async () => {
    const soon = new Date()
    soon.setDate(soon.getDate() + 10)
    setExamDate(soon.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 20, mastery: 20, accuracy: 20, coverage: 20, label: '', labelColor: '' })
    // days<14 -> base=40; gap=max(0,70-20)=50; gapMultiplier=1+(50/100)*0.8=1.4
    // daily = round(40*1.4) = 56 -> clamped to the 50 ceiling
    setRecentVolume(0) // no recent practice at all -> recentDailyAvg = 0
    const { computePacing } = await import('./pacing')
    const r = computePacing()
    expect(r.dailyTarget).toBe(50)
    expect(r.weeklyTarget).toBe(350)
    expect(r.onTrack).toBe(false) // 0 >= 50*0.8=40 is false
    // deficit = round(50 - 0) = 50
    expect(r.message).toBe('Öka tempot med 50 extra frågor om dagen för att nå målet till provet.')
  })
})

describe('computePacing — already on track, moderate timeframe (30 <= days < 60)', () => {
  it('computes a mid-range target and reports the on-track message (not the "Bra jobbat" branch, since readiness is below 70)', async () => {
    const mid = new Date()
    mid.setDate(mid.getDate() + 45)
    setExamDate(mid.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 55, mastery: 55, accuracy: 55, coverage: 55, label: '', labelColor: '' })
    // days in [30,60) -> base=20; gap=max(0,70-55)=15; gapMultiplier=1+(15/100)*0.8=1.12
    // daily = round(20*1.12) = round(22.4) = 22
    setRecentVolume(22 * 7) // recentDailyAvg=22 >= 22*0.8=17.6 -> onTrack
    const { computePacing } = await import('./pacing')
    const r = computePacing()
    expect(r.dailyTarget).toBe(22)
    expect(r.weeklyTarget).toBe(154)
    expect(r.onTrack).toBe(true)
    expect(r.message).toBe('Du är på rätt spår — sikta på 22 frågor per dag för att vara redo till provet.')
  })
})

describe('computePacing — boundary: days-until-exam bucket edges', () => {
  it('uses base=20 at exactly 30 days (not the base=15 bucket for >=60, nor base=30 for <30)', async () => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    setExamDate(d.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 70, mastery: 70, accuracy: 70, coverage: 70, label: '', labelColor: '' })
    setRecentVolume(20 * 7)
    const { computePacing } = await import('./pacing')
    expect(computePacing().dailyTarget).toBe(20)
  })

  it('uses base=30 at exactly 14 days (the <14 bucket only kicks in one day later)', async () => {
    const d = new Date()
    d.setDate(d.getDate() + 14)
    setExamDate(d.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 70, mastery: 70, accuracy: 70, coverage: 70, label: '', labelColor: '' })
    setRecentVolume(30 * 7)
    const { computePacing } = await import('./pacing')
    expect(computePacing().dailyTarget).toBe(30)
  })

  it('uses base=40 the day after crossing under the 14-day bucket (13 days left)', async () => {
    const d = new Date()
    d.setDate(d.getDate() + 13)
    setExamDate(d.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 70, mastery: 70, accuracy: 70, coverage: 70, label: '', labelColor: '' })
    setRecentVolume(40 * 7)
    const { computePacing } = await import('./pacing')
    expect(computePacing().dailyTarget).toBe(40)
  })
})

describe('computePacing — the 10-question floor is effectively unreachable', () => {
  it('never clamps down to the 10 floor because the smallest base (15) times the smallest multiplier (1) is already 15', async () => {
    // Documents a dead branch: Math.max(10, ...) can never fire since base is always
    // >= 15 (days>=60 bucket) and gapMultiplier is always >= 1 (gap can't go negative).
    const far = new Date()
    far.setDate(far.getDate() + 365)
    setExamDate(far.toISOString().slice(0, 10))
    const { computeReadiness } = await import('./readiness')
    vi.mocked(computeReadiness).mockReturnValue({ score: 100, mastery: 100, accuracy: 100, coverage: 100, label: '', labelColor: '' })
    setRecentVolume(15 * 7)
    const { computePacing } = await import('./pacing')
    expect(computePacing().dailyTarget).toBe(15) // the floor, not below it
  })
})
