import { useNavigate } from 'react-router-dom'
import { loadHistory } from '../utils/session'
import { questions } from '../data/questions'
import type { QuestionType } from '../types'

export default function Progress() {
  const navigate = useNavigate()
  const history = loadHistory()

  const allAnswers: { qid: string; correct: boolean }[] = []
  history.forEach(s => {
    s.questionIds.forEach(qid => {
      const q = questions.find(x => x.id === qid)
      if (q && s.answers[qid]) {
        allAnswers.push({ qid, correct: s.answers[qid] === q.answer })
      }
    })
  })

  const byType: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 },
    KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 },
    DTK: { correct: 0, total: 0 },
  }

  allAnswers.forEach(({ qid, correct }) => {
    const q = questions.find(x => x.id === qid)
    if (q) {
      byType[q.type].total++
      if (correct) byType[q.type].correct++
    }
  })

  const totalCorrect = allAnswers.filter(a => a.correct).length
  const totalAnswered = allAnswers.length

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h2 className="text-xl font-bold mb-2">Inga träningspass ännu</h2>
          <p className="text-slate-400 mb-6">Börja öva för att se din statistik här.</p>
          <button
            onClick={() => navigate('/practice')}
            className="bg-blue-600 hover:bg-blue-500 transition-colors px-6 py-3 rounded-xl font-bold"
          >
            Starta träning
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm">
          ← Tillbaka
        </button>

        <h1 className="text-3xl font-black mb-8">Min statistik</h1>

        {/* Overall */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 text-center">
          <div className="text-5xl font-black text-blue-400">
            {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
          </div>
          <div className="text-slate-400 mt-1">
            {totalCorrect} av {totalAnswered} rätt · {history.length} pass
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
                  <div className="font-black text-blue-400 text-lg">{type}</div>
                  <div className="text-2xl font-bold">{p}%</div>
                  <div className="text-xs text-slate-400">{v.correct}/{v.total} rätt</div>
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p}%` }} />
                  </div>
                </div>
              )
            })}
        </div>

        {/* History */}
        <h2 className="text-xl font-black mb-4">Tidigare pass</h2>
        <div className="space-y-3">
          {history.slice(0, 10).map(s => {
            const qs = s.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
            const c = qs.filter(q => q && s.answers[q.id] === q.answer).length
            const p = qs.length > 0 ? Math.round((c / qs.length) * 100) : 0
            const date = new Date(s.startTime).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            return (
              <div key={s.id} className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-400">{date}</div>
                  <div className="text-sm">{qs.length} frågor · {s.mode === 'timed' ? 'Med tid' : 'Utan tid'}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black">{p}%</div>
                  <div className="text-xs text-slate-400">{c}/{qs.length}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
