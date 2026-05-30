import { useNavigate } from 'react-router-dom'
import { loadSession } from '../utils/session'
import { questions } from '../data/questions'
import type { QuestionType, AnswerKey } from '../types'
import MathText from '../components/MathText'
import { useState } from 'react'

export default function Results() {
  const navigate = useNavigate()
  const session = loadSession()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!session) return <div className="p-8 text-white">Ingen session hittades.</div>

  const sessionQuestions = session.questionIds
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean) as typeof questions

  const correct = sessionQuestions.filter(q => session.answers[q.id] === q.answer).length
  const total = sessionQuestions.length
  const pct = Math.round((correct / total) * 100)

  const byType: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 },
    KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 },
    DTK: { correct: 0, total: 0 },
  }
  sessionQuestions.forEach(q => {
    byType[q.type].total++
    if (session.answers[q.id] === q.answer) byType[q.type].correct++
  })

  const duration = session.endTime ? Math.round((session.endTime - session.startTime) / 1000) : 0
  const fmtDuration = `${Math.floor(duration / 60)}m ${duration % 60}s`

  const scoreLabel = pct >= 85 ? '🏆 Utmärkt!' : pct >= 65 ? '👍 Bra jobbat' : pct >= 45 ? '📈 Fortsätt öva' : '💪 Mer träning krävs'

  const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-2">Resultat</h1>
        <p className="text-slate-400 mb-8">{scoreLabel}</p>

        {/* Score card */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 text-center">
          <div className="text-7xl font-black text-blue-400">{pct}%</div>
          <div className="text-slate-400 mt-1">{correct} av {total} rätt · {fmtDuration}</div>
          <div className="mt-4 h-3 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* By type */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
            .filter(([, v]) => v.total > 0)
            .map(([type, v]) => {
              const p = Math.round((v.correct / v.total) * 100)
              return (
                <div key={type} className="bg-slate-800 rounded-xl p-4">
                  <div className="font-black text-blue-400">{type}</div>
                  <div className="text-2xl font-bold mt-1">{p}%</div>
                  <div className="text-xs text-slate-400">{v.correct}/{v.total} rätt</div>
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
        </div>

        {/* Review */}
        <h2 className="text-xl font-black mb-4">Genomgång</h2>
        <div className="space-y-3 mb-8">
          {sessionQuestions.map(q => {
            const userAnswer = session.answers[q.id]
            const ok = userAnswer === q.answer
            const expanded = expandedId === q.id
            const answerOptions = Object.entries(q.options).filter(([k]) =>
              ANSWER_KEYS.includes(k as AnswerKey)
            ) as [AnswerKey, string][]

            return (
              <div
                key={q.id}
                className={`rounded-xl border overflow-hidden ${ok ? 'border-emerald-700' : 'border-red-700'}`}
              >
                <button
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                  className={`w-full flex items-start gap-3 p-4 text-left ${ok ? 'bg-emerald-900/20' : 'bg-red-900/20'}`}
                >
                  <span className="text-lg">{ok ? '✓' : '✗'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 mb-1">{q.type} · {q.source}</div>
                    <div className="text-sm line-clamp-2">
                      <MathText text={q.text} />
                    </div>
                  </div>
                  <span className="text-slate-500 text-sm shrink-0">{expanded ? '▲' : '▼'}</span>
                </button>

                {expanded && (
                  <div className="px-4 pb-4 bg-slate-800/50">
                    <div className="grid gap-2 mt-3">
                      {answerOptions.map(([key, text]) => {
                        let cls = 'border-slate-600 text-slate-400'
                        if (key === q.answer) cls = 'border-emerald-500 text-emerald-300'
                        if (key === userAnswer && key !== q.answer) cls = 'border-red-500 text-red-300'
                        return (
                          <div key={key} className={`border rounded-lg px-3 py-2 text-sm flex gap-2 ${cls}`}>
                            <span className="font-black">{key}</span>
                            <MathText text={text} />
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-sm text-slate-300 bg-slate-800 rounded-lg p-3">
                      <MathText text={q.explanation} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold transition-colors"
          >
            Ny träning
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 border border-slate-700 hover:bg-slate-800 rounded-xl py-3 font-bold transition-colors"
          >
            Hem
          </button>
        </div>
      </div>
    </div>
  )
}
