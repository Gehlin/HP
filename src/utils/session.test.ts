import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildSession, saveSession, loadSession, updateAnswer, finishSession,
  skipQuestion, saveQuestionTime, saveQuestionQuality, toggleFlag, loadHistory,
} from './session'
import { getStats } from './srs'
import { loadStats } from './gamification'
import { questions } from '../data/questions'

beforeEach(() => {
  localStorage.clear()
})

describe('buildSession', () => {
  it('builds a session with empty answers, a generated id, and a startTime', () => {
    const s = buildSession(['xyz-001'], null, true, 'drill')
    expect(s.id).toBeTruthy()
    expect(s.answers).toEqual({})
    expect(s.startTime).toBeLessThanOrEqual(Date.now())
    expect(s.questionIds).toEqual(['xyz-001'])
  })

  it('sets mode to untimed and clears timeLimitSeconds when timeLimitSeconds is null', () => {
    const s = buildSession(['xyz-001'], null, true, 'drill')
    expect(s.mode).toBe('untimed')
    expect(s.timeLimitSeconds).toBeUndefined()
  })

  it('sets mode to timed and keeps timeLimitSeconds when a limit is given', () => {
    const s = buildSession(['xyz-001'], 3600, true, 'exam')
    expect(s.mode).toBe('timed')
    expect(s.timeLimitSeconds).toBe(3600)
  })

  it('passes through instantFeedback as given when studyMode is not set', () => {
    expect(buildSession(['xyz-001'], null, true, 'drill').instantFeedback).toBe(true)
    expect(buildSession(['xyz-001'], null, false, 'drill').instantFeedback).toBe(false)
  })

  it('forces instantFeedback to true when studyMode is true, even if the caller passed false', () => {
    const s = buildSession(['xyz-001'], null, false, 'drill', true)
    expect(s.instantFeedback).toBe(true)
    expect(s.studyMode).toBe(true)
  })

  it('passes the type through unchanged for exam and drill', () => {
    expect(buildSession(['xyz-001'], null, true, 'exam').type).toBe('exam')
    expect(buildSession(['xyz-001'], null, true, 'drill').type).toBe('drill')
  })

  it('returns an empty questionIds array for an empty pool', () => {
    const s = buildSession([], null, true, 'drill')
    expect(s.questionIds).toEqual([])
  })

  it('handles a single-item pool', () => {
    const s = buildSession(['xyz-001'], null, true, 'drill')
    expect(s.questionIds).toEqual(['xyz-001'])
  })

  it('keeps questions that share a passage adjacent, pulled to the position of the first occurrence', () => {
    // las-p01-q01..q05 all share passageId 'las-p01' in the real question bank.
    // Input order interleaves an unrelated id between passage-mates.
    const input = ['las-p01-q03', 'xyz-001', 'las-p01-q01', 'las-p01-q05']
    const s = buildSession(input, null, true, 'drill')
    expect(s.questionIds).toEqual(['las-p01-q03', 'las-p01-q01', 'las-p01-q05', 'xyz-001'])
  })

  it('silently drops duplicate ids in the input pool (groupLinkedPassages de-dupes)', () => {
    // Surprising but real behavior: a caller that (accidentally) passes duplicate
    // ids gets a shorter deduplicated list back, not the original count preserved.
    const s = buildSession(['xyz-001', 'xyz-002', 'xyz-001'], null, true, 'drill')
    expect(s.questionIds).toEqual(['xyz-001', 'xyz-002'])
  })

  it('passes through unknown ids (not present in the question bank) without crashing', () => {
    const s = buildSession(['not-a-real-id'], null, true, 'drill')
    expect(s.questionIds).toEqual(['not-a-real-id'])
  })
})

describe('saveSession / loadSession', () => {
  it('returns null when nothing has been saved', () => {
    expect(loadSession()).toBeNull()
  })

  it('round-trips a saved session', () => {
    const s = buildSession(['xyz-001'], null, true, 'drill')
    saveSession(s)
    expect(loadSession()).toEqual(s)
  })
})

describe('updateAnswer', () => {
  it('is a no-op when there is no current session', () => {
    expect(() => updateAnswer('xyz-001', 'C')).not.toThrow()
    expect(loadSession()).toBeNull()
  })

  it('records an answer on the current session', () => {
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    updateAnswer('xyz-001', 'C')
    expect(loadSession()!.answers['xyz-001']).toBe('C')
  })
})

describe('skipQuestion', () => {
  it('is a no-op when there is no current session', () => {
    expect(() => skipQuestion('xyz-001')).not.toThrow()
  })

  it('adds a question id to skipped', () => {
    saveSession(buildSession(['xyz-001', 'xyz-002'], null, true, 'drill'))
    skipQuestion('xyz-001')
    expect(loadSession()!.skipped).toEqual(['xyz-001'])
  })

  it('does not add the same id twice', () => {
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    skipQuestion('xyz-001')
    skipQuestion('xyz-001')
    expect(loadSession()!.skipped).toEqual(['xyz-001'])
  })
})

describe('toggleFlag', () => {
  it('adds a flag on first toggle and removes it on second toggle', () => {
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    toggleFlag('xyz-001')
    expect(loadSession()!.flagged).toEqual(['xyz-001'])
    toggleFlag('xyz-001')
    expect(loadSession()!.flagged).toEqual([])
  })
})

describe('saveQuestionTime / saveQuestionQuality', () => {
  it('merges times for multiple questions instead of overwriting', () => {
    saveSession(buildSession(['xyz-001', 'xyz-002'], null, true, 'drill'))
    saveQuestionTime('xyz-001', 1000)
    saveQuestionTime('xyz-002', 2000)
    expect(loadSession()!.questionTimes).toEqual({ 'xyz-001': 1000, 'xyz-002': 2000 })
  })

  it('merges qualities for multiple questions instead of overwriting', () => {
    saveSession(buildSession(['xyz-001', 'xyz-002'], null, true, 'drill'))
    saveQuestionQuality('xyz-001', 3)
    saveQuestionQuality('xyz-002', 0)
    expect(loadSession()!.questionQualities).toEqual({ 'xyz-001': 3, 'xyz-002': 0 })
  })
})

describe('finishSession', () => {
  it('is a no-op when there is no current session', () => {
    expect(() => finishSession()).not.toThrow()
    expect(loadHistory()).toEqual([])
  })

  it('sets endTime, records streakBefore, and pushes into history', () => {
    const before = Date.now()
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    updateAnswer('xyz-001', 'C') // xyz-001's correct answer is 'C'
    finishSession()

    const finished = loadSession()!
    expect(finished.endTime).toBeGreaterThanOrEqual(before)
    expect(finished.streakBefore).toBe(0) // fresh gamification stats, captured before updateStreak runs

    const history = loadHistory()
    expect(history).toHaveLength(1)
    expect(history[0].id).toBe(finished.id)
  })

  it('records a correct SRS answer for each answered question', () => {
    const xyz001 = questions.find(q => q.id === 'xyz-001')!
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    updateAnswer('xyz-001', xyz001.answer)
    finishSession()
    const stats = getStats('xyz-001')!
    expect(stats.timesCorrect).toBe(1)
    expect(stats.timesWrong).toBe(0)
  })

  it('records a wrong SRS answer when the chosen answer does not match', () => {
    const xyz001 = questions.find(q => q.id === 'xyz-001')!
    const wrong = xyz001.answer === 'A' ? 'B' : 'A'
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    updateAnswer('xyz-001', wrong)
    finishSession()
    const stats = getStats('xyz-001')!
    expect(stats.timesCorrect).toBe(0)
    expect(stats.timesWrong).toBe(1)
  })

  it('does not record SRS stats for a question that was never answered', () => {
    saveSession(buildSession(['xyz-001', 'xyz-002'], null, true, 'drill'))
    updateAnswer('xyz-001', 'C')
    finishSession()
    expect(getStats('xyz-002')).toBeNull()
  })

  it('updates the streak on a fresh (first-ever) session to 1', () => {
    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    finishSession()
    expect(loadStats().streak).toBe(1)
  })

  it('caps stored history at 50 entries, keeping the newest first', () => {
    const existing = Array.from({ length: 50 }, (_, i) => ({
      id: `old-${i}`,
      questionIds: [],
      answers: {},
      startTime: i,
      mode: 'untimed',
      instantFeedback: true,
      type: 'drill',
    }))
    localStorage.setItem('hp_session_history', JSON.stringify(existing))

    saveSession(buildSession(['xyz-001'], null, true, 'drill'))
    updateAnswer('xyz-001', 'C')
    finishSession()

    const history = loadHistory()
    expect(history).toHaveLength(50)
    expect(history[0].questionIds).toEqual(['xyz-001']) // newest unshifted to front
    expect(history[49].id).toBe('old-48') // oldest entry (old-49) fell off the end
  })
})
