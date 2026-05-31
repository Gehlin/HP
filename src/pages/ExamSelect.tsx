import { useNavigate } from 'react-router-dom'
import { exams, SECTION_SIZES } from '../data/exams'

export default function ExamSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
        >
          ← Hem
        </button>

        <h1 className="text-3xl font-black mb-2">Simulera HP-prov</h1>
        <p className="text-slate-400 mb-8">
          40 frågor · {SECTION_SIZES.XYZ} XYZ + {SECTION_SIZES.KVA} KVA + {SECTION_SIZES.NOG} NOG + {SECTION_SIZES.DTK} DTK · 55 minuter
        </p>

        <div className="space-y-4 mb-8">
          {exams.map(exam => (
            <div key={exam.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-black text-lg">{exam.name}</div>
                  <div className="text-slate-400 text-sm mt-1">{exam.date}</div>
                  <div className="flex gap-3 mt-3 text-xs text-slate-500">
                    <span className="bg-violet-600/20 text-violet-300 border border-violet-600/40 px-2 py-0.5 rounded">
                      XYZ {exam.sections.XYZ.length} verkliga + {SECTION_SIZES.XYZ - exam.sections.XYZ.length} fyllnad
                    </span>
                    <span className="bg-blue-600/20 text-blue-300 border border-blue-600/40 px-2 py-0.5 rounded">
                      KVA {exam.sections.KVA.length}+{SECTION_SIZES.KVA - exam.sections.KVA.length}
                    </span>
                    <span className="bg-emerald-600/20 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded">
                      NOG {exam.sections.NOG.length}+{SECTION_SIZES.NOG - exam.sections.NOG.length}
                    </span>
                    <span className="bg-amber-600/20 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded">
                      DTK {exam.sections.DTK.length}+{SECTION_SIZES.DTK - exam.sections.DTK.length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/exam/${exam.id}`)}
                  className="shrink-0 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl px-5 py-2.5 font-bold text-sm"
                >
                  Starta →
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-black text-lg">Slumpmässigt prov</div>
                <div className="text-slate-400 text-sm mt-1">
                  40 frågor slumpmässigt valda från hela frågebanken
                </div>
              </div>
              <button
                onClick={() => navigate('/exam/random')}
                className="shrink-0 bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 rounded-xl px-5 py-2.5 font-bold text-sm"
              >
                Starta →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
