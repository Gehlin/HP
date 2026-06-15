import type { Question } from '../types'
import { questions as allQuestions } from './questions'

export interface ExamDefinition {
  id: string
  name: string
  date: string
  sections: {
    XYZ: string[]
    KVA: string[]
    NOG: string[]
    DTK: string[]
  }
}

export const SECTION_SIZES = { XYZ: 12, KVA: 10, NOG: 6, DTK: 12 } as const
export const SECTION_ORDER = ['XYZ', 'KVA', 'NOG', 'DTK'] as const

export const SECTION_META: Record<string, { number: number; recommendedMin: number; description: string }> = {
  XYZ: { number: 1, recommendedMin: 15, description: 'Matematisk problemlösning' },
  KVA: { number: 2, recommendedMin: 10, description: 'Kvantitativa jämförelser' },
  NOG: { number: 3, recommendedMin: 10, description: 'Kvantitativa resonemang' },
  DTK: { number: 4, recommendedMin: 20, description: 'Diagram, tabeller och kartor' },
}

// HP population averages per section (approximate)
export const HP_AVERAGES: Record<string, number> = {
  XYZ: 55,
  KVA: 60,
  NOG: 50,
  DTK: 65,
}

export const exams: ExamDefinition[] = [
  {
    id: '2026-04-18-pp3',
    name: '2026-04-18 Provpass 3',
    date: '2026-04-18',
    sections: {
      XYZ: ['xyz-001', 'xyz-002', 'xyz-003', 'xyz-004', 'xyz-005', 'xyz-006', 'xyz-007', 'xyz-008', 'xyz-009'],
      KVA: ['kva-001', 'kva-002', 'kva-003', 'kva-004', 'kva-005', 'kva-006', 'kva-007'],
      NOG: ['nog-001', 'nog-002', 'nog-003', 'nog-004', 'nog-005'],
      DTK: ['dtk-001', 'dtk-002', 'dtk-003'],
    },
  },
  {
    id: '2025-10-19-pp4',
    name: '2025-10-19 Provpass 4',
    date: '2025-10-19',
    sections: {
      XYZ: ['xyz-024', 'xyz-025', 'xyz-026', 'xyz-027', 'xyz-028', 'xyz-029', 'xyz-030'],
      KVA: ['kva-021', 'kva-022', 'kva-023', 'kva-024'],
      NOG: ['nog-015', 'nog-016', 'nog-017', 'nog-022', 'nog-023', 'nog-024'],
      DTK: ['dtk-007', 'dtk-008', 'dtk-009', 'dtk-010', 'dtk-011'],
    },
  },
  {
    id: '2025-03-16-pp3',
    name: '2025-03-16 Provpass 3',
    date: '2025-03-16',
    sections: {
      XYZ: ['xyz-010', 'xyz-011', 'xyz-012', 'xyz-013', 'xyz-014', 'xyz-015', 'xyz-016', 'xyz-017', 'xyz-018', 'xyz-019', 'xyz-020', 'xyz-021'],
      KVA: ['kva-008', 'kva-009', 'kva-010', 'kva-011', 'kva-012', 'kva-013', 'kva-014', 'kva-015', 'kva-016', 'kva-017'],
      NOG: ['nog-006', 'nog-007', 'nog-008', 'nog-009', 'nog-010', 'nog-011'],
      DTK: ['dtk-004', 'dtk-005', 'dtk-006', 'dtk-021', 'dtk-022', 'dtk-023', 'dtk-024', 'dtk-025', 'dtk-026', 'dtk-027', 'dtk-028', 'dtk-029'],
    },
  },
  {
    id: '2024-10-06-pp4',
    name: '2024-10-06 Provpass 4',
    date: '2024-10-06',
    sections: {
      XYZ: ['xyz-031', 'xyz-032', 'xyz-033', 'xyz-034', 'xyz-035', 'xyz-036', 'xyz-037', 'xyz-038', 'xyz-039', 'xyz-040', 'xyz-3d01', 'xyz-3d02'],
      KVA: ['kva-018', 'kva-019', 'kva-020', 'kva-025', 'kva-026', 'kva-027', 'kva-028', 'kva-e01', 'kva-e02', 'kva-e03'],
      NOG: ['nog-012', 'nog-013', 'nog-014', 'nog-018', 'nog-019', 'nog-020'],
      DTK: ['dtk-012', 'dtk-013', 'dtk-014', 'dtk-015', 'dtk-031', 'dtk-032', 'dtk-033', 'dtk-034', 'dtk-035', 'dtk-036', 'dtk-037', 'dtk-038'],
    },
  },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getExamQuestions(examId: string): Question[] {
  const exam = examId === 'random' ? null : (exams.find(e => e.id === examId) ?? null)
  const result: Question[] = []

  for (const type of SECTION_ORDER) {
    const target = SECTION_SIZES[type]
    const baseIds: string[] = exam ? exam.sections[type] : []
    const baseSet = new Set(baseIds)

    const fillerPool = shuffle(
      allQuestions.filter(q => q.type === type && !baseSet.has(q.id))
    )

    const sectionIds = [...baseIds]
    for (const q of fillerPool) {
      if (sectionIds.length >= target) break
      sectionIds.push(q.id)
    }

    for (const id of sectionIds.slice(0, target)) {
      const q = allQuestions.find(q => q.id === id)
      if (q) result.push(q)
    }
  }

  return result
}
