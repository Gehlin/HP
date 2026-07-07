import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AnswerKey, ExamSession, Question, QuestionType } from '../types'
import { saveStats } from './gamification'
import { toggleBookmark } from './bookmarks'
import { estimateHpScore } from './hpScore'
import { MASTERY_INTERVAL_DAYS } from './srs'

// checkAchievements() divides mastery thresholds against the *real* question bank
// (1446+ questions), which makes hand-verified mastered_10/50/100 boundaries
// impractical to hit with realistic-sized fixtures. Mock the data module with a
// controlled 120-question pool, matching the pattern established in readiness.test.ts.
function makeQuestion(id: string, overrides: Partial<Question> = {}): Question {
  return {
    id,
    type: 'XYZ',
    source: 'test',
    number: 1,
    text: 'q',
    options: { A: 'a', B: 'b', C: 'c', D: 'd' },
    answer: 'A',
    explanation: 'e',
    tags: [],
    difficulty: 'easy',
    ...overrides,
  }
}

const MOCK_QUESTIONS: Question[] = Array.from({ length: 120 }, (_, i) => makeQuestion(`mq${i}`))

// A few `allrounder` tests below push extra type-tagged questions onto this array
// (mutating it in place, since vi.mock captures this reference once). That's safe here:
// it's purely additive, ids never collide across tests, and count-based achievements
// (mastered_N, sessions_N, etc.) don't depend on the pool's total size.
vi.mock('../data/questions', () => ({ questions: MOCK_QUESTIONS }))

const HISTORY_KEY = 'hp_session_history'
const SRS_KEY = 'hp_srs'

function makeSession(questionIds: string[], answers: Record<string, AnswerKey>): ExamSession {
  return {
    id: crypto.randomUUID(),
    questionIds,
    answers,
    startTime: Date.now(),
    mode: 'untimed',
    instantFeedback: true,
    type: 'drill',
  }
}

/** Pushes sessions history-array style (newest first), matching finishSession's unshift. */
function setHistory(sessions: ExamSession[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
}

function setMastered(ids: string[], interval = MASTERY_INTERVAL_DAYS) {
  const store: Record<string, unknown> = {}
  ids.forEach(id => {
    store[id] = { interval, easeFactor: 2.5, nextReview: Date.now() + interval * 86_400_000, timesCorrect: 3, timesWrong: 0 }
  })
  localStorage.setItem(SRS_KEY, JSON.stringify(store))
}

/** N questions all correct or all wrong, from the mock pool, for per-session checks. */
function sessionOfSize(n: number, correctCount: number): ExamSession {
  const ids = MOCK_QUESTIONS.slice(0, n).map(q => q.id)
  const answers: Record<string, AnswerKey> = {}
  ids.forEach((id, i) => { answers[id] = i < correctCount ? 'A' : 'B' })
  return makeSession(ids, answers)
}

beforeEach(() => {
  localStorage.clear()
})

describe('checkAchievements — empty/first-time state', () => {
  it('unlocks nothing when there is no history, stats, bookmarks, or SRS data at all', async () => {
    const { checkAchievements, getEarnedIds } = await import('./achievements')
    expect(await checkAchievements()).toEqual([])
    expect(getEarnedIds()).toEqual([])
  })
})

describe('checkAchievements — first_session', () => {
  it('unlocks first_session once a single session exists in history', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionOfSize(3, 0)])
    expect(await checkAchievements()).toContain('first_session')
  })
})

describe('checkAchievements — streak thresholds', () => {
  it('does not unlock streak_3 one below its threshold (streak=2)', async () => {
    const { checkAchievements } = await import('./achievements')
    saveStats({ xp: 0, streak: 2, lastPracticeDate: '', longestStreak: 2 })
    expect(await checkAchievements()).not.toContain('streak_3')
  })

  it('unlocks streak_3 (but not streak_7) exactly at streak=3', async () => {
    const { checkAchievements } = await import('./achievements')
    saveStats({ xp: 0, streak: 3, lastPracticeDate: '', longestStreak: 3 })
    const earned = await checkAchievements()
    expect(earned).toContain('streak_3')
    expect(earned).not.toContain('streak_7')
  })

  it('unlocks both streak_3 and streak_7 exactly at streak=7', async () => {
    const { checkAchievements } = await import('./achievements')
    saveStats({ xp: 0, streak: 7, lastPracticeDate: '', longestStreak: 7 })
    const earned = await checkAchievements()
    expect(earned).toContain('streak_3')
    expect(earned).toContain('streak_7')
    expect(earned).not.toContain('streak_30')
  })

  it('does not unlock streak_30 one below its threshold (streak=29)', async () => {
    const { checkAchievements } = await import('./achievements')
    saveStats({ xp: 0, streak: 29, lastPracticeDate: '', longestStreak: 29 })
    expect(await checkAchievements()).not.toContain('streak_30')
  })

  it('unlocks streak_30 exactly at threshold', async () => {
    const { checkAchievements } = await import('./achievements')
    saveStats({ xp: 0, streak: 30, lastPracticeDate: '', longestStreak: 30 })
    expect(await checkAchievements()).toContain('streak_30')
  })
})

describe('checkAchievements — session-count thresholds', () => {
  it('does not unlock sessions_10 with 9 sessions', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory(Array.from({ length: 9 }, () => sessionOfSize(1, 0)))
    expect(await checkAchievements()).not.toContain('sessions_10')
  })

  it('unlocks sessions_10 with exactly 10 sessions', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory(Array.from({ length: 10 }, () => sessionOfSize(1, 0)))
    expect(await checkAchievements()).toContain('sessions_10')
  })

  it('unlocks sessions_50 and sessions_100 at their exact thresholds', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory(Array.from({ length: 100 }, () => sessionOfSize(1, 0)))
    const earned = await checkAchievements()
    expect(earned).toContain('sessions_10')
    expect(earned).toContain('sessions_50')
    expect(earned).toContain('sessions_100')
  })
})

describe('checkAchievements — bookmarks_10', () => {
  it('does not unlock with 9 bookmarks', async () => {
    const { checkAchievements } = await import('./achievements')
    for (let i = 0; i < 9; i++) toggleBookmark(`b${i}`)
    expect(await checkAchievements()).not.toContain('bookmarks_10')
  })

  it('unlocks with exactly 10 bookmarks', async () => {
    const { checkAchievements } = await import('./achievements')
    for (let i = 0; i < 10; i++) toggleBookmark(`b${i}`)
    expect(await checkAchievements()).toContain('bookmarks_10')
  })
})

describe(`checkAchievements — SRS mastery thresholds (interval >= ${MASTERY_INTERVAL_DAYS} days, shared with readiness.ts)`, () => {
  it(`a question at interval=${MASTERY_INTERVAL_DAYS - 1} (one below the mastery threshold) does not count`, async () => {
    const { checkAchievements } = await import('./achievements')
    setMastered(MOCK_QUESTIONS.slice(0, 10).map(q => q.id), MASTERY_INTERVAL_DAYS - 1)
    expect(await checkAchievements()).not.toContain('mastered_10')
  })

  it(`unlocks mastered_10 with exactly 10 questions at interval=${MASTERY_INTERVAL_DAYS}`, async () => {
    const { checkAchievements } = await import('./achievements')
    setMastered(MOCK_QUESTIONS.slice(0, 10).map(q => q.id), MASTERY_INTERVAL_DAYS)
    expect(await checkAchievements()).toContain('mastered_10')
  })

  it('unlocks mastered_50 and mastered_100 at their exact thresholds', async () => {
    const { checkAchievements } = await import('./achievements')
    setMastered(MOCK_QUESTIONS.slice(0, 100).map(q => q.id), MASTERY_INTERVAL_DAYS)
    const earned = await checkAchievements()
    expect(earned).toContain('mastered_10')
    expect(earned).toContain('mastered_50')
    expect(earned).toContain('mastered_100')
  })
})

describe('checkAchievements — perfect_session', () => {
  it('does not unlock with 100% on only 4 questions (below the 5-question minimum)', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionOfSize(4, 4)])
    expect(await checkAchievements()).not.toContain('perfect_session')
  })

  it('unlocks with 100% on exactly 5 questions', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionOfSize(5, 5)])
    expect(await checkAchievements()).toContain('perfect_session')
  })

  it('does not unlock on a session with one wrong answer (not 100%)', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionOfSize(10, 9)])
    expect(await checkAchievements()).not.toContain('perfect_session')
  })
})

describe('checkAchievements — hp_* score thresholds (based on the latest session only)', () => {
  it('unlocks none of the hp_ achievements when the estimated score is below 1.50', async () => {
    const { checkAchievements } = await import('./achievements')
    // 11/20 = 55% -> hand-verified via estimateHpScore below 1.50
    const hp = estimateHpScore(Math.round((11 / 20) * 100))
    expect(hp).toBeLessThan(1.50)
    setHistory([sessionOfSize(20, 11)])
    const earned = await checkAchievements()
    expect(earned).not.toContain('hp_150')
    expect(earned).not.toContain('hp_175')
    expect(earned).not.toContain('hp_190')
    expect(earned).not.toContain('hp_200')
  })

  it('unlocks only hp_150 when the estimated score clears 1.50 but not 1.75', async () => {
    const { checkAchievements } = await import('./achievements')
    // 12/20 = 60% -> hand-verified via estimateHpScore between 1.50 and 1.75
    const hp = estimateHpScore(Math.round((12 / 20) * 100))
    expect(hp).toBeGreaterThanOrEqual(1.50)
    expect(hp).toBeLessThan(1.75)
    setHistory([sessionOfSize(20, 12)])
    const earned = await checkAchievements()
    expect(earned).toContain('hp_150')
    expect(earned).not.toContain('hp_175')
    expect(earned).not.toContain('hp_190')
    expect(earned).not.toContain('hp_200')
  })

  it('unlocks all four hp_ achievements simultaneously on a perfect (100%) session', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionOfSize(20, 20)]) // 100% -> hp = 2.00
    const earned = await checkAchievements()
    expect(earned).toContain('hp_150')
    expect(earned).toContain('hp_175')
    expect(earned).toContain('hp_190')
    expect(earned).toContain('hp_200')
  })

  it('only looks at the most recent session (history[0]), not older ones', async () => {
    const { checkAchievements } = await import('./achievements')
    // Newest-first: a strong older session followed by a weak latest one.
    setHistory([sessionOfSize(20, 5), sessionOfSize(20, 20)])
    const earned = await checkAchievements()
    expect(earned).not.toContain('hp_200') // latest (5/20=25%) is weak
  })
})

describe('checkAchievements — allrounder', () => {
  it('unlocks on a full quant sweep: exactly the 4 quant types (XYZ/KVA/NOG/DTK), each >=70%', async () => {
    const { checkAchievements } = await import('./achievements')
    const types: QuestionType[] = ['XYZ', 'KVA', 'NOG', 'DTK']
    const ids: string[] = []
    const answers: Record<string, AnswerKey> = {}
    types.forEach(t => {
      for (let i = 0; i < 10; i++) {
        const id = `all-${t}-${i}`
        ids.push(id)
        MOCK_QUESTIONS.push(makeQuestion(id, { type: t }))
        answers[id] = i < 7 ? 'A' : 'B' // 70% correct exactly
      }
    })
    setHistory([makeSession(ids, answers)])
    expect(await checkAchievements()).toContain('allrounder')
  })

  it('unlocks on a full verbal sweep: exactly the 4 verbal types (ORD/LAS/MEK/ELF), each >=70%', async () => {
    const { checkAchievements } = await import('./achievements')
    const types: QuestionType[] = ['ORD', 'LAS', 'MEK', 'ELF']
    const ids: string[] = []
    const answers: Record<string, AnswerKey> = {}
    types.forEach(t => {
      for (let i = 0; i < 10; i++) {
        const id = `verbal-${t}-${i}`
        ids.push(id)
        MOCK_QUESTIONS.push(makeQuestion(id, { type: t }))
        answers[id] = i < 7 ? 'A' : 'B' // 70% correct exactly
      }
    })
    setHistory([makeSession(ids, answers)])
    expect(await checkAchievements()).toContain('allrounder')
  })

  it('does NOT unlock on a mixed 2-verbal/2-quant sweep, even at >=70% each (fixed bug)', async () => {
    // Previously buggy: the code only checked `types.length === 4`, not that the 4
    // types are all-verbal or all-quant, so this mixed session used to unlock
    // 'allrounder' despite the Swedish description implying a same-section sweep
    // ("≥70% i alla 4 delproven", i.e. all 4 parts of *one* section).
    const { checkAchievements } = await import('./achievements')
    const mixedTypes: QuestionType[] = ['ORD', 'LAS', 'XYZ', 'KVA'] // 2 verbal + 2 quant
    const ids: string[] = []
    const answers: Record<string, AnswerKey> = {}
    mixedTypes.forEach(t => {
      for (let i = 0; i < 10; i++) {
        const id = `mix-${t}-${i}`
        ids.push(id)
        MOCK_QUESTIONS.push(makeQuestion(id, { type: t }))
        answers[id] = i < 7 ? 'A' : 'B'
      }
    })
    setHistory([makeSession(ids, answers)])
    expect(await checkAchievements()).not.toContain('allrounder')
  })

  it('does not unlock when only 3 distinct types are present, even at 100% each', async () => {
    const { checkAchievements } = await import('./achievements')
    const types: QuestionType[] = ['XYZ', 'KVA', 'NOG']
    const ids: string[] = []
    const answers: Record<string, AnswerKey> = {}
    types.forEach(t => {
      for (let i = 0; i < 5; i++) {
        const id = `three-${t}-${i}`
        ids.push(id)
        MOCK_QUESTIONS.push(makeQuestion(id, { type: t }))
        answers[id] = 'A' // 100%
      }
    })
    setHistory([makeSession(ids, answers)])
    expect(await checkAchievements()).not.toContain('allrounder')
  })

  it('does not unlock when one of the 4 types is just below 70%', async () => {
    const { checkAchievements } = await import('./achievements')
    const types: QuestionType[] = ['XYZ', 'KVA', 'NOG', 'DTK']
    const ids: string[] = []
    const answers: Record<string, AnswerKey> = {}
    types.forEach((t, ti) => {
      for (let i = 0; i < 10; i++) {
        const id = `low-${t}-${i}`
        ids.push(id)
        MOCK_QUESTIONS.push(makeQuestion(id, { type: t }))
        // Last type sits at 60% (6/10), below the 70% bar; the rest are 100%.
        answers[id] = ti === 3 ? (i < 6 ? 'A' : 'B') : 'A'
      }
    })
    setHistory([makeSession(ids, answers)])
    expect(await checkAchievements()).not.toContain('allrounder')
  })
})

describe('checkAchievements — idempotency', () => {
  it('does not re-report an already-earned achievement as newly earned on a second call', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionOfSize(3, 0)])
    expect(await checkAchievements()).toContain('first_session')
    expect(await checkAchievements()).not.toContain('first_session') // already earned
  })
})

describe('checkAchievements — speed_demon (fixed: was dead/unreachable content)', () => {
  const ALL_TYPES: QuestionType[] = ['XYZ', 'KVA', 'NOG', 'DTK', 'ORD', 'LAS', 'MEK', 'ELF']

  // Builds one session touching every given type once, with the given per-question
  // time in milliseconds, and records it into history with `questionTimes` set (the
  // field `timeAnalyticsByType()` reads — see analytics.ts).
  function sessionWithTimes(types: QuestionType[], ms: number, idPrefix: string): ExamSession {
    const ids: string[] = []
    const questionTimes: Record<string, number> = {}
    types.forEach(t => {
      const id = `${idPrefix}-${t}`
      ids.push(id)
      MOCK_QUESTIONS.push(makeQuestion(id, { type: t }))
      questionTimes[id] = ms
    })
    const session = makeSession(ids, {})
    session.questionTimes = questionTimes
    return session
  }

  it('is still declared in ALL_ACHIEVEMENTS', async () => {
    const { ALL_ACHIEVEMENTS } = await import('./achievements')
    expect(ALL_ACHIEVEMENTS.some(a => a.id === 'speed_demon')).toBe(true)
  })

  it('does not unlock when only some of the 8 types have recorded timing data', async () => {
    const { checkAchievements } = await import('./achievements')
    // Only 2 of 8 types touched — the other 6 stay `ratio: null`, which must not count
    // as "faster than standard".
    setHistory([sessionWithTimes(['XYZ', 'KVA'], 5_000, 'sd-partial')])
    expect(await checkAchievements()).not.toContain('speed_demon')
  })

  it('does not unlock when all 8 types have data but one type is slower than its HP-standard pace', async () => {
    const { checkAchievements } = await import('./achievements')
    const fast = sessionWithTimes(ALL_TYPES, 5_000, 'sd-fast') // 5s, faster than every HP standard
    // ORD's HP standard is the lowest (45s) of all 8 types, so 200s guarantees it's slower.
    const slowOrd = sessionWithTimes(['ORD'], 200_000, 'sd-slow-ord')
    setHistory([fast, slowOrd])
    expect(await checkAchievements()).not.toContain('speed_demon')
  })

  it('unlocks once every one of the 8 types has a recorded average faster than its HP-standard pace', async () => {
    const { checkAchievements } = await import('./achievements')
    setHistory([sessionWithTimes(ALL_TYPES, 5_000, 'sd-unlock')]) // 5s per question, well under every standard
    expect(await checkAchievements()).toContain('speed_demon')
  })

  it('never unlocks from other favorable stats alone (streak/mastery/bookmarks/perfect session) without fast timing data', async () => {
    const { checkAchievements } = await import('./achievements')
    saveStats({ xp: 0, streak: 30, lastPracticeDate: '', longestStreak: 30 })
    setMastered(MOCK_QUESTIONS.slice(0, 100).map(q => q.id))
    for (let i = 0; i < 10; i++) toggleBookmark(`sd-bm-${i}`)
    setHistory([sessionOfSize(20, 20)]) // perfect session, but no questionTimes recorded
    const earned = await checkAchievements()
    expect(earned).not.toContain('speed_demon')
  })
})

describe('getAchievement', () => {
  it('resolves a known id to its Achievement definition', async () => {
    const { getAchievement } = await import('./achievements')
    expect(getAchievement('first_session')?.title).toBe('Igångsättaren')
  })

  it('returns undefined for an unknown id', async () => {
    const { getAchievement } = await import('./achievements')
    expect(getAchievement('not-a-real-id')).toBeUndefined()
  })
})
