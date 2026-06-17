import { useNavigate } from 'react-router-dom'
import { exams, SECTION_SIZES } from '../data/exams'

const TYPE_PILL: Record<string, string> = {
  XYZ: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
  KVA: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
  NOG: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  DTK: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
}

export default function ExamSelect() {
  const navigate = useNavigate()

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

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Provsimulering
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Simulera HP-prov</h1>
          <p className="text-slate-500 text-sm mb-3">
            40 frågor · {SECTION_SIZES.XYZ} XYZ + {SECTION_SIZES.KVA} KVA + {SECTION_SIZES.NOG} NOG + {SECTION_SIZES.DTK} DTK · 55 minuter
          </p>
          <div className="flex items-start gap-2.5 bg-amber-500/8 border border-amber-500/20 rounded-xl px-4 py-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Simulering täcker det kvantitativa delprovet (XYZ, KVA, NOG, DTK). Verbala avsnitt (ORD, LÄS, MEK, ELF) ingår ännu inte.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          {exams.map((exam, i) => (
            <div key={exam.id} className={`glass rounded-2xl p-5 border border-white/[0.06] hover:border-white/[0.1] transition-colors animate-fade-up`} style={{ animationDelay: `${i * 60}ms` }}>
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

      </div>
    </div>
  )
}
