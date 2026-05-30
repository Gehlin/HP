import { describe, it, expect, beforeEach } from 'vitest'
import { recordAnswer, getDueQuestions, getStats } from './srs'

beforeEach(() => {
  localStorage.clear()
})

describe('recordAnswer', () => {
  it('creates a record with timesCorrect=1 on first correct answer', () => {
    recordAnswer('q1', true)
    const s = getStats('q1')!
    expect(s.timesCorrect).toBe(1)
    expect(s.timesWrong).toBe(0)
  })

  it('creates a record with interval=1 on first wrong answer', () => {
    recordAnswer('q1', false)
    const s = getStats('q1')!
    expect(s.timesWrong).toBe(1)
    expect(s.timesCorrect).toBe(0)
    expect(s.interval).toBe(1)
  })

  it('increases interval on correct answers using ease factor', () => {
    recordAnswer('q1', true)
    const s1 = getStats('q1')!
    expect(s1.interval).toBeGreaterThan(1)
  })

  it('resets interval to 1 on wrong answer', () => {
    recordAnswer('q1', true)
    recordAnswer('q1', true)
    recordAnswer('q1', false)
    expect(getStats('q1')!.interval).toBe(1)
  })

  it('decreases ease factor on wrong answer, floored at 1.3', () => {
    for (let i = 0; i < 20; i++) recordAnswer('q1', false)
    expect(getStats('q1')!.easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('accumulates counts across multiple calls', () => {
    recordAnswer('q1', true)
    recordAnswer('q1', false)
    recordAnswer('q1', true)
    const s = getStats('q1')!
    expect(s.timesCorrect).toBe(2)
    expect(s.timesWrong).toBe(1)
  })

  it('sets nextReview to future timestamp', () => {
    const before = Date.now()
    recordAnswer('q1', true)
    expect(getStats('q1')!.nextReview).toBeGreaterThan(before)
  })
})

describe('getDueQuestions', () => {
  it('returns empty array when nothing answered', () => {
    expect(getDueQuestions(['q1', 'q2'])).toEqual([])
  })

  it('includes questions with nextReview in the past', () => {
    const store = {
      q1: { interval: 1, easeFactor: 2.5, nextReview: Date.now() - 1000, timesCorrect: 1, timesWrong: 0 },
    }
    localStorage.setItem('hp_srs', JSON.stringify(store))
    expect(getDueQuestions(['q1', 'q2'])).toContain('q1')
  })

  it('excludes questions with nextReview in the future', () => {
    const store = {
      q1: { interval: 5, easeFactor: 2.5, nextReview: Date.now() + 100_000, timesCorrect: 1, timesWrong: 0 },
    }
    localStorage.setItem('hp_srs', JSON.stringify(store))
    expect(getDueQuestions(['q1'])).toHaveLength(0)
  })

  it('excludes IDs not in allIds', () => {
    const store = {
      q1: { interval: 1, easeFactor: 2.5, nextReview: Date.now() - 1000, timesCorrect: 1, timesWrong: 0 },
    }
    localStorage.setItem('hp_srs', JSON.stringify(store))
    expect(getDueQuestions(['q2'])).toHaveLength(0)
  })

  it('sorts most overdue first', () => {
    const now = Date.now()
    const store = {
      q1: { interval: 1, easeFactor: 2.5, nextReview: now - 2000, timesCorrect: 1, timesWrong: 0 },
      q2: { interval: 1, easeFactor: 2.5, nextReview: now - 9000, timesCorrect: 1, timesWrong: 0 },
    }
    localStorage.setItem('hp_srs', JSON.stringify(store))
    const result = getDueQuestions(['q1', 'q2'])
    expect(result[0]).toBe('q2')
    expect(result[1]).toBe('q1')
  })
})

describe('getStats', () => {
  it('returns null for unanswered question', () => {
    expect(getStats('nope')).toBeNull()
  })

  it('returns the record after answering', () => {
    recordAnswer('q1', true)
    expect(getStats('q1')).not.toBeNull()
  })
})
