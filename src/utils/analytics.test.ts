import { describe, it, expect, beforeEach } from 'vitest'
import {
  timeAnalyticsByType, accuracyByDifficulty, hpScoreHistory, typeAccuracyTrend,
  weakTypeSummary, buildWeakAreaSession, rollingHpScore,
} from './analytics'
import { questions } from '../data/questions'
import type { AnswerKey, ExamSession, QuestionType } from '../types'

const HISTORY_KEY = 'hp_session_history'

beforeEach(() => {
  localStorage.clear()
})

function wrongAnswer(correct: AnswerKey): AnswerKey {
  return correct === 'A' ? 'B' : 'A'
}

function pick(type: QuestionType, n: number) {
  const found = questions.filter(q => q.type === type).slice(0, n)
  expect(found.length).toBe(n) // fail loudly if the fixture assumption about data volume breaks
  return found
}

function makeSession(overrides: Partial<ExamSession> & Pick<ExamSession, 'questionIds' | 'answers'>): ExamSession {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    startTime: overrides.startTime ?? Date.now(),
    mode: 'untimed',
    instantFeedback: true,
    type: 'drill',
    ...overrides,
  }
}

function setHistory(sessions: ExamSession[]) {
  // Sessions passed newest-first, matching the real unshift() convention used by session.ts.
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
}

describe('weakTypeSummary', () => {
  it('returns nothing when history is empty (first-ever session)', () => {
    expect(weakTypeSummary()).toEqual([])
  })

  it('identifies the weakest types below 75%, requires >=5 attempts, sorted ascending, capped at 3', () => {
    const xyz = pick('XYZ', 5) // all correct: 100% -> not weak
    const kva = pick('KVA', 5) // 2/5 correct: 40% -> weak
    const nog = pick('NOG', 5) // 3/5 correct: 60% -> weak
    const dtk = pick('DTK', 4) // 3/4 correct: 75%, but below the 5-attempt minimum -> excluded regardless
    const ord = pick('ORD', 6) // 5/6 correct: 83% -> not weak (>=75%)

    const answers: Record<string, AnswerKey> = {}
    xyz.forEach(q => { answers[q.id] = q.answer })
    kva.forEach((q, i) => { answers[q.id] = i < 2 ? q.answer : wrongAnswer(q.answer) })
    nog.forEach((q, i) => { answers[q.id] = i < 3 ? q.answer : wrongAnswer(q.answer) })
    dtk.forEach((q, i) => { answers[q.id] = i < 3 ? q.answer : wrongAnswer(q.answer) })
    ord.forEach((q, i) => { answers[q.id] = i < 5 ? q.answer : wrongAnswer(q.answer) })

    const ids = [...xyz, ...kva, ...nog, ...dtk, ...ord].map(q => q.id)
    setHistory([makeSession({ questionIds: ids, answers })])

    // LAS/MEK/ELF have zero attempts and must not appear.
    expect(weakTypeSummary()).toEqual([
      { type: 'KVA', pct: 40 },
      { type: 'NOG', pct: 60 },
    ])
  })

  it('breaks ties by the stable declaration order of types (XYZ, KVA, NOG, DTK, ...)', () => {
    const kva = pick('KVA', 5) // 2/5 = 40%
    const nog = pick('NOG', 5) // 2/5 = 40%, tied with KVA
    const answers: Record<string, AnswerKey> = {}
    kva.forEach((q, i) => { answers[q.id] = i < 2 ? q.answer : wrongAnswer(q.answer) })
    nog.forEach((q, i) => { answers[q.id] = i < 2 ? q.answer : wrongAnswer(q.answer) })
    const ids = [...kva, ...nog].map(q => q.id)
    setHistory([makeSession({ questionIds: ids, answers })])

    expect(weakTypeSummary()).toEqual([
      { type: 'KVA', pct: 40 },
      { type: 'NOG', pct: 40 },
    ])
  })

  it('aggregates across multiple sessions, not just the most recent one', () => {
    const kva = pick('KVA', 5)
    const answersA: Record<string, AnswerKey> = {}
    const answersB: Record<string, AnswerKey> = {}
    // Session A: all 5 wrong. Session B: 5 more, all correct via different real ids
    // reusing the same 5 ids would double-count the same question in one session's
    // map, so use a second batch of KVA ids for session B.
    const kvaB = questions.filter(q => q.type === 'KVA').slice(5, 10)
    kva.forEach(q => { answersA[q.id] = wrongAnswer(q.answer) })
    kvaB.forEach(q => { answersB[q.id] = q.answer })
    setHistory([
      makeSession({ questionIds: kvaB.map(q => q.id), answers: answersB }), // newest
      makeSession({ questionIds: kva.map(q => q.id), answers: answersA }),  // oldest
    ])
    // Combined: 5 wrong + 5 correct = 10 total, 5 correct -> 50%
    expect(weakTypeSummary()).toEqual([{ type: 'KVA', pct: 50 }])
  })
})

describe('accuracyByDifficulty', () => {
  it('returns null pct and zero counts for a difficulty bucket with no attempts', () => {
    const result = accuracyByDifficulty()
    expect(result.easy).toEqual({ correct: 0, total: 0, pct: null })
    expect(result.medium).toEqual({ correct: 0, total: 0, pct: null })
    expect(result.hard).toEqual({ correct: 0, total: 0, pct: null })
  })

  it('computes correct/total/pct per difficulty and ignores unanswered questions', () => {
    const easyQs = questions.filter(q => q.difficulty === 'easy').slice(0, 4)
    const mediumQs = questions.filter(q => q.difficulty === 'medium').slice(0, 2)
    const unansweredEasy = questions.filter(q => q.difficulty === 'easy')[4]

    const answers: Record<string, AnswerKey> = {}
    easyQs.forEach((q, i) => { answers[q.id] = i < 3 ? q.answer : wrongAnswer(q.answer) }) // 3/4 = 75%
    mediumQs.forEach((q, i) => { answers[q.id] = i < 1 ? q.answer : wrongAnswer(q.answer) }) // 1/2 = 50%

    const ids = [...easyQs, ...mediumQs, unansweredEasy].map(q => q.id)
    setHistory([makeSession({ questionIds: ids, answers })])

    const result = accuracyByDifficulty()
    expect(result.easy).toEqual({ correct: 3, total: 4, pct: 75 })
    expect(result.medium).toEqual({ correct: 1, total: 2, pct: 50 })
    expect(result.hard).toEqual({ correct: 0, total: 0, pct: null })
  })
})

describe('timeAnalyticsByType', () => {
  it('returns null avgSeconds/ratio and the fixed HP standard when no times are recorded', () => {
    const result = timeAnalyticsByType()
    expect(result.XYZ.avgSeconds).toBeNull()
    expect(result.XYZ.ratio).toBeNull()
    expect(result.XYZ.hpStandard).toBe(60)
  })

  it('averages recorded times per type and computes the ratio against the HP standard', () => {
    const xyz = pick('XYZ', 2)
    const answers: Record<string, AnswerKey> = {}
    xyz.forEach(q => { answers[q.id] = q.answer })
    setHistory([makeSession({
      questionIds: xyz.map(q => q.id),
      answers,
      questionTimes: { [xyz[0].id]: 30_000, [xyz[1].id]: 90_000 }, // 30s and 90s -> avg 60s
    })])

    const result = timeAnalyticsByType()
    expect(result.XYZ.avgSeconds).toBe(60)
    expect(result.XYZ.hpStandard).toBe(60)
    expect(result.XYZ.ratio).toBe(1) // exactly at HP pace
  })
})

describe('hpScoreHistory', () => {
  it('returns oldest-first per-session combined scores and filters out sessions with no scoreable answers', () => {
    const xyzAllCorrect = pick('XYZ', 5)
    const xyzAllWrong = questions.filter(q => q.type === 'XYZ').slice(5, 10)

    const answersOldest: Record<string, AnswerKey> = {}
    xyzAllCorrect.forEach(q => { answersOldest[q.id] = q.answer }) // 100% -> 2.00

    const answersMiddle: Record<string, AnswerKey> = {}
    xyzAllWrong.forEach(q => { answersMiddle[q.id] = wrongAnswer(q.answer) }) // 0% -> 1.00

    // Stored newest-first: [no-data session, middle (0%), oldest (100%)]
    setHistory([
      makeSession({ questionIds: [], answers: {} }), // newest: nothing answered -> combined null, filtered
      makeSession({ questionIds: xyzAllWrong.map(q => q.id), answers: answersMiddle }),
      makeSession({ questionIds: xyzAllCorrect.map(q => q.id), answers: answersOldest }),
    ])

    expect(hpScoreHistory(3)).toEqual([2.00, 1.00])
  })
})

describe('typeAccuracyTrend', () => {
  it('only includes a session in a type\'s trend when that session has >=2 answered questions of that type', () => {
    const threeXyz = questions.filter(q => q.type === 'XYZ').slice(0, 3)
    const oneXyz = questions.filter(q => q.type === 'XYZ').slice(3, 4)

    const answersOldest: Record<string, AnswerKey> = {}
    threeXyz.forEach((q, i) => { answersOldest[q.id] = i < 2 ? q.answer : wrongAnswer(q.answer) }) // 2/3 -> 67%

    const answersNewest: Record<string, AnswerKey> = {}
    answersNewest[oneXyz[0].id] = oneXyz[0].answer // only 1 attempt -> below the per-session minimum of 2

    setHistory([
      makeSession({ questionIds: oneXyz.map(q => q.id), answers: answersNewest }), // newest
      makeSession({ questionIds: threeXyz.map(q => q.id), answers: answersOldest }), // oldest
    ])

    // Only the oldest session contributes; the newest session is silently skipped
    // for this type even though it has data, because it falls under the threshold.
    expect(typeAccuracyTrend(2).XYZ).toEqual([67])
  })

  it('returns an empty array for a type with zero attempts', () => {
    setHistory([makeSession({ questionIds: [], answers: {} })])
    expect(typeAccuracyTrend().MEK).toEqual([])
  })
})

describe('buildWeakAreaSession', () => {
  it('returns an empty array when there is no history (first-ever session)', () => {
    expect(buildWeakAreaSession()).toEqual([])
  })

  it('returns an empty array when no tag has enough wrong attempts to qualify as weak', () => {
    const xyz = pick('XYZ', 5)
    const answers: Record<string, AnswerKey> = {}
    xyz.forEach(q => { answers[q.id] = q.answer }) // all correct, nothing weak
    setHistory([makeSession({ questionIds: xyz.map(q => q.id), answers })])
    expect(buildWeakAreaSession()).toEqual([])
  })

  // Pick 4 real 'algebra'-tagged questions whose *secondary* tags don't repeat
  // 3+ times among themselves — otherwise a secondary tag (e.g. 'equations') would
  // also cross the weak-tag threshold and buildWeakAreaSession would legitimately
  // (and correctly) pull in unrelated questions tagged only with that secondary tag.
  function pickIsolatedAlgebraQuestions() {
    const ids = ['xyz-001', 'xyz-014', 'xyz-016', 'xyz-028'] // tags: [algebra,expansion], [algebra,factoring], [algebra,inequalities], [algebra]
    const qs = ids.map(id => questions.find(q => q.id === id)!)
    qs.forEach(q => expect(q.tags).toContain('algebra'))
    return qs
  }

  it('selects questions touching a weak tag (<70% accuracy, >=3 attempts)', () => {
    const algebraQs = pickIsolatedAlgebraQuestions()
    const answers: Record<string, AnswerKey> = {}
    // 1/4 correct = 25% < 70%, with 4 >= 3 attempts -> 'algebra' qualifies as weak
    algebraQs.forEach((q, i) => { answers[q.id] = i < 1 ? q.answer : wrongAnswer(q.answer) })
    setHistory([makeSession({ questionIds: algebraQs.map(q => q.id), answers })])

    const result = buildWeakAreaSession(20)
    expect(result.length).toBeGreaterThan(0)
    result.forEach(id => {
      const q = questions.find(x => x.id === id)!
      expect(q.tags).toContain('algebra')
    })
  })

  it('caps the returned ids at the given limit', () => {
    const algebraQs = pickIsolatedAlgebraQuestions()
    const answers: Record<string, AnswerKey> = {}
    algebraQs.forEach((q, i) => { answers[q.id] = i < 1 ? q.answer : wrongAnswer(q.answer) })
    setHistory([makeSession({ questionIds: algebraQs.map(q => q.id), answers })])
    expect(buildWeakAreaSession(2).length).toBeLessThanOrEqual(2)
  })
})

describe('rollingHpScore', () => {
  it('returns null when there is no history (first-ever session)', () => {
    expect(rollingHpScore()).toBeNull()
  })

  it('weights more recent sessions higher than older ones', () => {
    const xyzAllCorrect = pick('XYZ', 5)
    const xyzAllWrong = questions.filter(q => q.type === 'XYZ').slice(5, 10)
    const answersNewest: Record<string, AnswerKey> = {}
    xyzAllCorrect.forEach(q => { answersNewest[q.id] = q.answer }) // 100% -> 2.00
    const answersOldest: Record<string, AnswerKey> = {}
    xyzAllWrong.forEach(q => { answersOldest[q.id] = wrongAnswer(q.answer) }) // 0% -> 1.00

    setHistory([
      makeSession({ questionIds: xyzAllCorrect.map(q => q.id), answers: answersNewest }), // newest, weight 2
      makeSession({ questionIds: xyzAllWrong.map(q => q.id), answers: answersOldest }),   // oldest, weight 1
    ])
    // weighted = (2.00*2 + 1.00*1) / 3 = 5/3 = 1.6667 -> rounds to nearest 0.05 -> 1.65
    expect(rollingHpScore(2)).toBe(1.65)
  })
})
