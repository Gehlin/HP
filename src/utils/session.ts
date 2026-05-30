import type { ExamSession, AnswerKey } from '../types'

const CURRENT_KEY = 'hp_current_session'
const HISTORY_KEY = 'hp_session_history'

export function buildSession(
  questionIds: string[],
  timeLimitSeconds: number | null,
  instantFeedback: boolean,
  type: 'exam' | 'drill',
): ExamSession {
  return {
    id: crypto.randomUUID(),
    questionIds,
    answers: {},
    startTime: Date.now(),
    mode: timeLimitSeconds ? 'timed' : 'untimed',
    timeLimitSeconds: timeLimitSeconds ?? undefined,
    instantFeedback,
    type,
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

export function finishSession() {
  const session = loadSession()
  if (!session) return
  session.endTime = Date.now()
  saveSession(session)
  const history: ExamSession[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]')
  history.unshift(session)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)))
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
