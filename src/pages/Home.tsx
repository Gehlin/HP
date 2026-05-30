import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'

export default function Home() {
  const navigate = useNavigate()
  const total = questions.length
  const byType = {
    XYZ: questions.filter(q => q.type === 'XYZ').length,
    KVA: questions.filter(q => q.type === 'KVA').length,
    NOG: questions.filter(q => q.type === 'NOG').length,
    DTK: questions.filter(q => q.type === 'DTK').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Högskoleprov
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-tight">HP Träning</h1>
          <p className="text-slate-400 text-lg">Kvantitativ del — XYZ · KVA · NOG · DTK</p>
          <p className="text-slate-500 text-sm mt-2">{total} frågor · Verkliga HP-prov 2025–2026</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {(Object.entries(byType) as [string, number][]).map(([type, count]) => (
            <div key={type} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
              <div className="text-2xl font-black text-blue-400">{type}</div>
              <div className="text-slate-400 text-sm mt-1">{count} frågor</div>
              <div className="text-xs text-slate-500 mt-1">
                {type === 'XYZ' && 'Matematisk problemlösning'}
                {type === 'KVA' && 'Kvantitativa jämförelser'}
                {type === 'NOG' && 'Kvantitativa resonemang'}
                {type === 'DTK' && 'Diagram, tabeller och kartor'}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => navigate('/practice')}
            className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl p-6 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Börja öva</div>
                <div className="text-blue-200 text-sm mt-1">Välj delprov, tidsgräns och svarsläge</div>
              </div>
              <div className="text-3xl group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/theory')}
              className="bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 rounded-2xl p-5 text-left group"
            >
              <div className="text-lg font-bold">Teori & Tips</div>
              <div className="text-slate-400 text-sm mt-1">Lär dig metoderna för varje delprov</div>
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 rounded-2xl p-5 text-left group"
            >
              <div className="text-lg font-bold">Min statistik</div>
              <div className="text-slate-400 text-sm mt-1">Resultat och framsteg</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
