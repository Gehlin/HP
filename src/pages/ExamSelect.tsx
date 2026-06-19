import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { exams, SECTION_SIZES, VERBAL_SECTION_SIZES } from '../data/exams'

const TYPE_PILL: Record<string, string> = {
  XYZ: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  KVA: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  NOG: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  DTK: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  ORD: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
  LAS: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
  MEK: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20',
  ELF: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
}

export default function ExamSelect() {
  const navigate = useNavigate()
  const [section, setSection] = useState<'quant' | 'verbal'>('quant')

  const totalVerbal = Object.values(VERBAL_SECTION_SIZES).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-28">

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-300 text-sm mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Tillbaka
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Provsimulering
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Simulera HP-prov</h1>
          <p className="text-slate-500 text-sm">Välj delprov att simulera — kvantitativt eller verbalt.</p>
        </div>

        {/* Section toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSection('quant')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${section === 'quant' ? 'bg-blue-600 border-blue-500 text-white' : 'glass border-white/[0.08] text-slate-400 hover:text-slate-200'}`}
          >
            Kvantitativt
          </button>
          <button
            onClick={() => setSection('verbal')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${section === 'verbal' ? 'bg-rose-600 border-rose-500 text-white' : 'glass border-white/[0.08] text-slate-400 hover:text-slate-200'}`}
          >
            Verbalt
          </button>
        </div>

        {section === 'quant' && (
          <>
            <div className="space-y-2.5 mb-6">
              {exams.map((exam, i) => (
                <div key={exam.id} className="glass rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-colors animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-base text-white mb-0.5">{exam.name}</div>
                      <div className="text-slate-500 text-xs mb-3">{exam.date}</div>
                      <div className="flex gap-1.5 flex-wrap">
                        {([
                          ['XYZ', exam.sections.XYZ.length, SECTION_SIZES.XYZ],
                          ['KVA', exam.sections.KVA.length, SECTION_SIZES.KVA],
                          ['NOG', exam.sections.NOG.length, SECTION_SIZES.NOG],
                          ['DTK', exam.sections.DTK.length, SECTION_SIZES.DTK],
                        ] as [string, number, number][]).map(([type, real, total]) => (
                          <span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_PILL[type]}`}>
                            {type} {real}+{total - real}
                          </span>
                        ))}
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

            <div className="border-t border-white/[0.05] pt-6">
              <div className="glass rounded-2xl p-5 flex items-center justify-between gap-4">
                <div>
                  <div className="font-black text-base text-white mb-0.5">Slumpmässigt prov</div>
                  <div className="text-slate-500 text-xs">40 frågor slumpmässigt valda från hela frågebanken</div>
                </div>
                <button
                  onClick={() => navigate('/exam/random')}
                  className="shrink-0 glass hover:bg-white/[0.08] border border-white/[0.1] transition-colors rounded-xl px-5 py-2.5 font-bold text-sm"
                >
                  Starta →
                </button>
              </div>
            </div>
          </>
        )}

        {section === 'verbal' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border border-white/[0.06]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="font-black text-base text-white mb-0.5">Verbalt delprov</div>
                  <div className="text-slate-500 text-xs">{totalVerbal} frågor · slumpmässigt urval · 55 minuter</div>
                </div>
                <button
                  onClick={() => navigate('/exam/verbal-random')}
                  className="shrink-0 bg-rose-600 hover:bg-rose-500 transition-colors rounded-xl px-5 py-2.5 font-bold text-sm"
                >
                  Starta →
                </button>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.entries(VERBAL_SECTION_SIZES) as [string, number][]).map(([type, count]) => (
                  <span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_PILL[type]}`}>
                    {type} {count}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Det verbala delprovet består av fyra avsnitt i ordning: ORD → LÄS → MEK → ELF. Frågor väljs slumpmässigt från frågebanken.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
