import type { ExamSession, AnswerKey } from '../types'
import { updateStreak, loadStats } from './gamification'
import { recordAnswer } from './srs'
import { loadQuestions } from '../data/questionsLoader'

const CURRENT_KEY = 'hp_current_session'
const HISTORY_KEY = 'hp_session_history'

/**
 * Questions sharing the same passage are linked and must stay on screen
 * together (prototype: consecutive items referencing the same `passage`).
 * Stable reorder: each passage group is pulled together at the position
 * of its first occurrence; everything else keeps its order.
 */
async function groupLinkedPassages(questionIds: string[]): Promise<string[]> {
  const questions = await loadQuestions()
  const passageOf = new Map(questions.map(q => [q.id, q.passageId]))
  const placed = new Set<string>()
  const out: string[] = []
  for (const id of questionIds) {
    if (placed.has(id)) continue
    out.push(id)
    placed.add(id)
    const pid = passageOf.get(id)
    if (!pid) continue
    for (const other of questionIds) {
      if (!placed.has(other) && passageOf.get(other) === pid) {
        out.push(other)
        placed.add(other)
      }
    }
  }
  return out
}

export async function buildSession(
  questionIds: string[],
  timeLimitSeconds: number | null,
  instantFeedback: boolean,
  type: 'exam' | 'drill',
  studyMode?: boolean,
): Promise<ExamSession> {
  return {
    id: crypto.randomUUID(),
    questionIds: await groupLinkedPassages(questionIds),
    answers: {},
    startTime: Date.now(),
    mode: timeLimitSeconds ? 'timed' : 'untimed',
    timeLimitSeconds: timeLimitSeconds ?? undefined,
    instantFeedback: studyMode ? true : instantFeedback,
    type,
    studyMode,
  }
}

export function saveSession(session: ExamSession) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(session))
}

export function loadSession(): ExamSession | null {
  const raw = localStorage.getItem(CURRENT_KEY)
  return raw ? (JSON.parse(raw) as ExamSession) : null
}

export function updateAnswer(id: string, answer: AnswerKey) {
  const session = loadSession()
  if (!session) return
  session.answers[id] = answer
  saveSession(session)
}

export async function finishSession() {
  const session = loadSession()
  if (!session) return
  session.endTime = Date.now()
  session.streakBefore = loadStats().streak
  saveSession(session)
  const history: ExamSession[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  history.unshift(session)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
  updateStreak()
  // The critical synchronous state (endTime, history, streak) is already
  // committed to localStorage above — the await below only gates the SRS
  // bookkeeping loop, so callers that need immediate history reads (e.g.
  // Resultat.tsx) don't need to wait on the question bank to resolve.
  const questions = await loadQuestions()
  const qMap = Object.fromEntries(questions.map(q => [q.id, q.answer]))
  for (const [qid, userAnswer] of Object.entries(session.answers)) {
    if (qMap[qid]) {
      const correct = userAnswer === qMap[qid]
      const quality = session.questionQualities?.[qid] ?? (correct ? 2 : 0)
      recordAnswer(qid, correct, quality)
    }
  }
}

export function skipQuestion(questionId: string) {
  const session = loadSession()
  if (!session) return
  const skipped = session.skipped ?? []
  if (!skipped.includes(questionId)) {
    session.skipped = [...skipped, questionId]
    saveSession(session)
  }
}

export function saveQuestionTime(questionId: string, ms: number) {
  const session = loadSession()
  if (!session) return
  session.questionTimes = { ...(session.questionTimes ?? {}), [questionId]: ms }
  saveSession(session)
}

export function saveQuestionQuality(questionId: string, quality: number) {
  const session = loadSession()
  if (!session) return
  session.questionQualities = { ...(session.questionQualities ?? {}), [questionId]: quality }
  saveSession(session)
}

export function toggleFlag(questionId: string) {
  const session = loadSession()
  if (!session) return
  const flagged = session.flagged ?? []
  const idx = flagged.indexOf(questionId)
  session.flagged = idx >= 0 ? flagged.filter(id => id !== questionId) : [...flagged, questionId]
  saveSession(session)
}

export function loadHistory(): ExamSession[] {
  return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
}
