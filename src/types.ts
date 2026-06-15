export type QuestionType = 'XYZ' | 'KVA' | 'NOG' | 'DTK' | 'ORD' | 'LAS' | 'MEK' | 'ELF'
export type AnswerKey = 'A' | 'B' | 'C' | 'D' | 'E'

export interface TableData {
  caption?: string
  headers: string[]
  rows: string[][]
}

export interface ChartSeries {
  label: string
  values: number[]
  color?: string
}

export interface ChartData {
  type: 'bar' | 'line'
  title?: string
  xLabels: string[]
  yUnit?: string
  series: ChartSeries[]
}

export interface ExplanationData {
  approach?: string
  steps: string[]
  note?: string
  distractorNotes?: Partial<Record<AnswerKey, string>>
}

export interface Question {
  id: string
  type: QuestionType
  source: string
  number: number
  text: string
  context?: string
  tableData?: TableData
  chartData?: ChartData
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
  explanationData?: ExplanationData
  tags: string[]
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ExamSession {
  id: string
  questionIds: string[]
  answers: Record<string, AnswerKey>
  flagged?: string[]
  skipped?: string[]
  startTime: number
  endTime?: number
  mode: 'timed' | 'untimed'
  timeLimitSeconds?: number
  instantFeedback: boolean
  type: 'exam' | 'drill'
  drillType?: QuestionType
  xpEarned?: number
  streakBefore?: number
  examId?: string
  sectionTimestamps?: Record<string, number>
  questionTimes?: Record<string, number>
  questionQualities?: Record<string, number>
  studyMode?: boolean
}

export interface SessionResult {
  session: ExamSession
  correct: number
  total: number
  byType: Record<QuestionType, { correct: number; total: number }>
  durationMs: number
}
