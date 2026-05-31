import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getExamQuestions } from '../data/exams'
import { buildSession, saveSession } from '../utils/session'

export default function ExamStart() {
  const { examId } = useParams<{ examId: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    const id = examId ?? 'random'
    const qs = getExamQuestions(id)
    const session = buildSession(qs.map(q => q.id), 55 * 60, false, 'exam')
    saveSession({ ...session, examId: id })
    navigate('/session', { replace: true })
  }, [])

  return null
}
