import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { exams, SECTION_SIZES, VERBAL_SECTION_SIZES } from '../data/exams'

const TYPE_PILL: Record<string, string> = {
  XYZ: 'bg-[var(--color-terracotta-muted)] text-[var(--color-terracotta)] border-[var(--color-terracotta)]',
  KVA: 'bg-[var(--color-terracotta-muted)] text-[var(--color-terracotta)] border-[var(--color-terracotta)]',
  NOG: 'bg-[var(--color-terracotta-muted)] text-[var(--color-terracotta)] border-[var(--color-terracotta)]',
  DTK: 'bg-[var(--color-gold-muted)]       text-[var(--color-gold-deep)]  border-[var(--color-gold-deep)]',
  ORD: 'bg-[var(--color-green-muted)]      text-[var(--color-green)]      border-[var(--color-green)]',
  LAS: 'bg-[var(--color-green-muted)]      text-[var(--color-green)]      border-[var(--color-green)]',
  MEK: 'bg-[var(--color-green-muted)]      text-[var(--color-green)]      border-[var(--color-green)]',
  ELF: 'bg-[var(--color-green-muted)]      text-[var(--color-green)]      border-[var(--color-green)]',
}

export default function ExamSelect() {
  const navigate = useNavigate()
  const [section, setSection] = useState<'quant' | 'verbal'>('quant')

  const totalVerbal = Object.values(VERBAL_SECTION_SIZES).reduce((a, b) => a + b, 0)
  const totalQuant = Object.values(SECTION_SIZES).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="Välj prov" />
      <div className="max-w-2xl mx-auto px-4 py-6">

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-[var(--color-green-muted)] border border-[var(--color-green)] text-[var(--color-green)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
            Provsimulering
          </div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Simulera HP-prov</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">Välj delprov att simulera — kvantitativt eller verbalt.</p>
        </div>

        {/* Full HP Day hero */}
        <div className="card rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[var(--color-ink-muted)] uppercase tracking-widest mb-1.5">Komplett simulering</div>
              <div className="font-black text-lg text-[var(--color-ink)] mb-0.5">Full HP-dag</div>
              <div className="text-[var(--color-ink-faint)] text-xs mb-3">Verbalt pass + paus + kvantitativt pass · ~110 min</div>
              <div className="flex flex-wrap gap-1.5">
                {(['ORD','LÄS','MEK','ELF'] as const).map(t => (
                  <span key={t} className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-[var(--color-green-muted)] border-[var(--color-green)] text-[var(--color-green)]">{t}</span>
                ))}
                <span className="text-[10px] text-[var(--color-ink-faint)] self-center">+</span>
                {(['XYZ','KVA','NOG','DTK'] as const).map(t => (
                  <span key={t} className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-[var(--color-terracotta-muted)] border-[var(--color-terracotta)] text-[var(--color-terracotta)]">{t}</span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/exam/full-hp')}
            className="btn-primary w-full mt-2"
          >
            Starta Full HP-dag →
          </button>
        </div>

        {/* Section toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSection('quant')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${section === 'quant' ? 'bg-[var(--color-terracotta)] border-[var(--color-terracotta)] text-[var(--color-cream)]' : 'card border-[var(--color-card-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
          >
            Kvantitativt
          </button>
          <button
            onClick={() => setSection('verbal')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${section === 'verbal' ? 'bg-[var(--color-green)] border-[var(--color-green)] text-[var(--color-cream)]' : 'card border-[var(--color-card-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]'}`}
          >
            Verbalt
          </button>
        </div>

        {section === 'quant' && (
          <>
            {/* Whole-section quick pass (migrated from the retired QuantHub) */}
            <div className="card rounded-2xl p-4 mb-3">
              <div className="font-black text-base text-[var(--color-ink)] mb-0.5">Kvantitativt provpass</div>
              <div className="text-[var(--color-ink-faint)] text-xs mb-3">{totalQuant} frågor · slumpmässigt urval · 55 minuter</div>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.entries(SECTION_SIZES) as [string, number][]).map(([type, count]) => (
                  <span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_PILL[type]}`}>
                    {type} {count}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/exam/quant-random')}
                className="btn-primary w-full mt-4"
              >
                Starta →
              </button>
            </div>

            {(() => {
              const realExams = exams.filter(e => !e.id.startsWith('ovning-'))
              const practiceExams = exams.filter(e => e.id.startsWith('ovning-'))
              return (
                <>
                  <div className="mb-6">
                    {realExams.map((exam, i) => (
                      <div key={exam.id} className="card rounded-2xl p-4 mb-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="font-black text-base text-[var(--color-ink)] mb-0.5">{exam.name}</div>
                        <div className="text-[var(--color-ink-faint)] text-xs mb-3">{exam.date}</div>
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
                        <button
                          onClick={() => navigate(`/exam/${exam.id}`)}
                          className="btn-primary w-full mt-4"
                        >
                          Starta →
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--color-card-border)] pt-6 mb-6">
                    <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Övningsprov</div>
                    {practiceExams.map(exam => (
                      <div key={exam.id} className="card rounded-2xl p-4 mb-3">
                        <div className="font-black text-base text-[var(--color-ink)] mb-0.5">{exam.name}</div>
                        <div className="text-[var(--color-ink-faint)] text-xs mb-3">{exam.date}</div>
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
                        <button
                          onClick={() => navigate(`/exam/${exam.id}`)}
                          className="btn-primary w-full mt-4"
                        >
                          Starta →
                        </button>
                      </div>
                    ))}
                    <div className="card rounded-2xl p-4 mb-3">
                      <div className="font-black text-base text-[var(--color-ink)] mb-0.5">Slumpmässigt prov</div>
                      <div className="text-[var(--color-ink-faint)] text-xs mb-1">40 frågor slumpmässigt valda från hela frågebanken</div>
                      <button
                        onClick={() => navigate('/exam/random')}
                        className="btn-primary w-full mt-4"
                      >
                        Starta →
                      </button>
                    </div>
                  </div>
                </>
              )
            })()}
          </>
        )}

        {section === 'verbal' && (
          <div>
            <div className="card rounded-2xl p-4 mb-3">
              <div className="font-black text-base text-[var(--color-ink)] mb-0.5">Verbalt provpass</div>
              <div className="text-[var(--color-ink-faint)] text-xs mb-3">{totalVerbal} frågor · slumpmässigt urval · 55 minuter</div>
              <div className="flex gap-1.5 flex-wrap">
                {(Object.entries(VERBAL_SECTION_SIZES) as [string, number][]).map(([type, count]) => (
                  <span key={type} className={`text-[10px] font-bold px-2 py-0.5 rounded border ${TYPE_PILL[type]}`}>
                    {type} {count}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate('/exam/verbal-random')}
                className="btn-primary w-full mt-4"
              >
                Starta →
              </button>
            </div>

            <div className="bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-4 py-3">
              <p className="text-xs text-[var(--color-ink-faint)] leading-relaxed">
                Det verbala delprovet består av fyra avsnitt i ordning: ORD → LÄS → MEK → ELF. Frågor väljs slumpmässigt från frågebanken.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
