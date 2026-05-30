export type QuestionType = 'XYZ' | 'KVA' | 'NOG' | 'DTK'
export type AnswerKey = 'A' | 'B' | 'C' | 'D' | 'E'

export interface TableData {
  caption?: string
  headers: string[]
  rows: string[][]
}

export interface Question {
  id: string
  type: QuestionType
  source: string
  number: number
  text: string
  context?: string
  tableData?: TableData
  requiresImage?: boolean
  options: {
    A: string
    B: string
    C: string
    D: string
    E?: string
  }
  answer: AnswerKey
  explanation: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ExamSession {
  id: string
  questionIds: string[]
  answers: Record<string, AnswerKey>
  startTime: number
  endTime?: number
  mode: 'timed' | 'untimed'
  timeLimitSeconds?: number
  instantFeedback: boolean
  type: 'exam' | 'drill'
  drillType?: QuestionType
}

export interface SessionResult {
  session: ExamSession
  correct: number
  total: number
  byType: Record<QuestionType, { correct: number; total: number }>
  durationMs: number
}
