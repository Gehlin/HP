import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { questions } from '../data/questions'
import { CHALLENGE_SIZE, getDailyChallengeIds, isDailyChallengeCompleted, markDailyChallengeCompleted } from './dailyChallenge'

const DONE_KEY = 'hp_daily_done'
const realIds = new Set(questions.map(q => q.id))

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('getDailyChallengeIds', () => {
  it('returns exactly CHALLENGE_SIZE (10) question ids', async () => {
    expect(await getDailyChallengeIds()).toHaveLength(CHALLENGE_SIZE)
  })

  it('never returns a duplicate id within a single challenge', async () => {
    const ids = await getDailyChallengeIds()
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only returns ids that actually exist in the real question bank', async () => {
    const ids = await getDailyChallengeIds()
    ids.forEach(id => expect(realIds.has(id)).toBe(true))
  })

  it('is deterministic for the same calendar day — calling it twice returns the identical set', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-07T09:00:00'))
    const first = await getDailyChallengeIds()
    vi.setSystemTime(new Date('2026-07-07T21:00:00')) // later the same day
    const second = await getDailyChallengeIds()
    expect(second).toEqual(first)
  })

  it('produces a different selection on a different calendar day', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-07T09:00:00'))
    const day1 = await getDailyChallengeIds()
    vi.setSystemTime(new Date('2026-07-08T09:00:00'))
    const day2 = await getDailyChallengeIds()
    expect(day2).not.toEqual(day1)
  })
})

describe('isDailyChallengeCompleted / markDailyChallengeCompleted', () => {
  it('is false when nothing has been marked done', () => {
    expect(isDailyChallengeCompleted()).toBe(false)
  })

  it('becomes true immediately after marking the challenge done today', () => {
    markDailyChallengeCompleted()
    expect(isDailyChallengeCompleted()).toBe(true)
  })

  it('stores exactly today\'s ISO date (YYYY-MM-DD) under the done key', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-07T15:00:00Z'))
    markDailyChallengeCompleted()
    expect(localStorage.getItem(DONE_KEY)).toBe('2026-07-07')
  })

  it('resets to not-completed once the calendar day rolls over (stale date is not carried forward)', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-07T15:00:00Z'))
    markDailyChallengeCompleted()
    expect(isDailyChallengeCompleted()).toBe(true)

    vi.setSystemTime(new Date('2026-07-08T09:00:00Z')) // next day
    expect(isDailyChallengeCompleted()).toBe(false)
  })

  it('a raw non-date-matching value in storage is treated as not completed', () => {
    localStorage.setItem(DONE_KEY, 'garbage')
    expect(isDailyChallengeCompleted()).toBe(false)
  })
})
