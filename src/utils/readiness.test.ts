import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AnswerKey, ExamSession, Question } from '../types'

// computeReadiness divides by the *real* question bank size (1446 questions as of
// writing), which makes hand-verified percentages impractical to construct from
// realistic history sizes. Mock the data module with a small, fully-controlled
// 10-question pool so coverage/mastery percentages can be computed by hand exactly.
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

const MOCK_QUESTIONS: Question[] = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`))

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

function setHistory(sessions: ExamSession[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions))
}

function setMastered(ids: string[]) {
  const store: Record<string, unknown> = {}
  ids.forEach(id => {
    store[id] = { interval: 7, easeFactor: 2.5, nextReview: Date.now() + 7 * 86_400_000, timesCorrect: 3, timesWrong: 0 }
  })
  localStorage.setItem(SRS_KEY, JSON.stringify(store))
}

beforeEach(() => {
  localStorage.clear()
})

describe('computeReadiness', () => {
  it('returns all zeros and the lowest label with no data yet (first-ever session)', async () => {
    const { computeReadiness } = await import('./readiness')
    const r = computeReadiness()
    expect(r.coverage).toBe(0)
    expect(r.mastery).toBe(0)
    expect(r.accuracy).toBe(0)
    expect(r.score).toBe(0)
    expect(r.label).toBe('Börja träna regelbundet')
    expect(r.labelColor).toBe('text-red-400')
  })

  it('computes coverage, mastery, accuracy and the weighted composite for a strong scenario', async () => {
    const { computeReadiness } = await import('./readiness')
    // Coverage: 8 of 10 questions attempted at least once -> 80%
    const attemptedIds = MOCK_QUESTIONS.slice(0, 8).map(q => q.id)
    const answers: Record<string, AnswerKey> = {}
    // Accuracy (rolling, last 10 sessions): 8 answered, 7 correct -> 88% -> rounds to 88
    attemptedIds.forEach((id, i) => { answers[id] = i < 7 ? 'A' : 'B' })
    setHistory([makeSession(attemptedIds, answers)])
    // Mastery: 6 of 10 questions have SRS interval >= 7 -> 60%
    setMastered(MOCK_QUESTIONS.slice(0, 6).map(q => q.id))

    const r = computeReadiness()
    expect(r.coverage).toBe(80)
    expect(r.mastery).toBe(60)
    expect(r.accuracy).toBe(88)
    // score = round(accuracy*0.45 + mastery*0.35 + coverage*0.20)
    //       = round(88*0.45 + 60*0.35 + 80*0.20) = round(39.6 + 21 + 16) = round(76.6) = 77
    expect(r.score).toBe(77)
    expect(r.label).toBe('Väl förberedd') // 65 <= 77 < 80
    expect(r.labelColor).toBe('text-blue-400')
  })

  it('computes a low composite and correct label for a weak scenario (touched but not mastered)', async () => {
    const { computeReadiness } = await import('./readiness')
    // Coverage: 2 of 10 attempted -> 20%
    const attemptedIds = MOCK_QUESTIONS.slice(0, 2).map(q => q.id)
    const answers: Record<string, AnswerKey> = { [attemptedIds[0]]: 'B', [attemptedIds[1]]: 'B' } // both wrong (correct answer is 'A')
    setHistory([makeSession(attemptedIds, answers)])
    // Mastery: none mastered -> 0%

    const r = computeReadiness()
    expect(r.coverage).toBe(20)
    expect(r.mastery).toBe(0)
    expect(r.accuracy).toBe(0) // 0/2 correct
    // score = round(0*0.45 + 0*0.35 + 20*0.20) = round(4) = 4
    expect(r.score).toBe(4)
    expect(r.label).toBe('Börja träna regelbundet') // score < 25
    expect(r.labelColor).toBe('text-red-400')
  })

  it('only counts the last 10 sessions toward rolling accuracy, ignoring older ones', async () => {
    const { computeReadiness } = await import('./readiness')
    // 11 sessions, newest-first (unshift order): the oldest (11th, index 10) is
    // all-wrong; if it were included it would drag accuracy down, but it must be excluded.
    const recentSessions: ExamSession[] = Array.from({ length: 10 }, () =>
      makeSession(['q0'], { q0: 'A' }) // correct, 10 sessions x 1 correct answer = 100%
    )
    const oldSession = makeSession(['q1'], { q1: 'B' }) // wrong, correct answer is 'A'
    setHistory([...recentSessions, oldSession])

    const r = computeReadiness()
    expect(r.accuracy).toBe(100)
  })

  it('rounds the composite score using standard rounding, not truncation', async () => {
    const { computeReadiness } = await import('./readiness')
    // Coverage 100% (all 10 attempted), accuracy 100%, mastery 33% (round(3.333%->3/10)... )
    // choose 1 of 10 mastered -> mastery = round(1/10*100) = 10
    const attemptedIds = MOCK_QUESTIONS.map(q => q.id)
    const answers: Record<string, AnswerKey> = {}
    attemptedIds.forEach(id => { answers[id] = 'A' })
    setHistory([makeSession(attemptedIds, answers)])
    setMastered(['q0'])

    const r = computeReadiness()
    expect(r.coverage).toBe(100)
    expect(r.accuracy).toBe(100)
    expect(r.mastery).toBe(10)
    // score = round(100*0.45 + 10*0.35 + 100*0.20) = round(45 + 3.5 + 20) = round(68.5) = 69 (JS rounds .5 up)
    expect(r.score).toBe(69)
  })
})
