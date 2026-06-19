import { useState } from 'react'
import { setFocusPreference, type FocusPreference } from '../utils/focusPreference'

const ONBOARDING_KEY = 'hp_onboarding_done'

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, '1')
}

const QUANT_PILLS = [
  { label: 'XYZ', color: 'bg-violet-500/10 text-violet-300 border-violet-500/25' },
  { label: 'KVA', color: 'bg-blue-500/10 text-blue-300 border-blue-500/25' },
  { label: 'NOG', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
  { label: 'DTK', color: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
]

const VERBAL_PILLS = [
  { label: 'ORD', color: 'bg-rose-500/10 text-rose-300 border-rose-500/25' },
  { label: 'LÄS', color: 'bg-pink-500/10 text-pink-300 border-pink-500/25' },
  { label: 'MEK', color: 'bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/25' },
  { label: 'ELF', color: 'bg-purple-500/10 text-purple-300 border-purple-500/25' },
]

const FOCUS_OPTIONS: { value: FocusPreference; label: string; sub: string; color: string; border: string; bg: string }[] = [
  { value: 'quant', label: 'Kvantitativt', sub: 'XYZ · KVA · NOG · DTK', color: 'text-blue-300', border: 'border-blue-500/40', bg: 'bg-blue-500/10' },
  { value: 'verbal', label: 'Verbalt', sub: 'ORD · LÄS · MEK · ELF', color: 'text-rose-300', border: 'border-rose-500/40', bg: 'bg-rose-500/10' },
  { value: 'both', label: 'Hela provet', sub: 'Alla 8 delproven', color: 'text-emerald-300', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' },
]

interface Props {
  onClose: () => void
}

export default function Onboarding({ onClose }: Props) {
  const [slide, setSlide] = useState(0)
  const [selectedFocus, setSelectedFocus] = useState<FocusPreference | null>(null)
  const TOTAL_SLIDES = 5

  const finish = (focus?: FocusPreference) => {
    const f = focus ?? selectedFocus
    if (f) setFocusPreference(f)
    markOnboardingDone()
    onClose()
  }

  const next = () => {
    if (slide === 2 && !selectedFocus) return
    if (slide === TOTAL_SLIDES - 1) { finish(); return }
    setSlide(s => s + 1)
  }

  const isLast = slide === TOTAL_SLIDES - 1
  const isFocusSlide = slide === 2
  const canAdvance = !isFocusSlide || selectedFocus !== null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#0d1320] border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up sm:animate-scale-in">

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5 pb-1">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-blue-500' : i < slide ? 'w-1.5 bg-blue-500/40' : 'w-1.5 bg-white/[0.08]'}`}
            />
          ))}
        </div>

        {/* Slide 0: Welcome */}
        {slide === 0 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-blue-400">HP</div>
            <h2 className="text-xl font-black mb-3 text-blue-400">Välkommen till HP Träning</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Träna på det fullständiga Högskoleprovet — kvantitativt och verbalt — med hundratals frågor och smart repetition.
            </p>
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {[...QUANT_PILLS, ...VERBAL_PILLS].map(p => (
                <span key={p.label} className={`text-xs font-black px-2.5 py-1 rounded-lg border ${p.color}`}>{p.label}</span>
              ))}
            </div>
          </div>
        )}

        {/* Slide 1: Alla delproven */}
        {slide === 1 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-violet-400">∑</div>
            <h2 className="text-xl font-black mb-3 text-violet-400">Åtta delproven</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">
              HP har ett kvantitativt och ett verbalt delprov. Båda räknas lika och ger vardera ett poäng på 1,0–2,0.
            </p>
            <div className="space-y-2 text-left">
              <div className="bg-blue-500/8 border border-blue-500/20 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">Kvantitativt</div>
                <div className="flex gap-1.5 flex-wrap">
                  {QUANT_PILLS.map(p => (
                    <span key={p.label} className={`text-xs font-black px-2.5 py-1 rounded-lg border ${p.color}`}>{p.label}</span>
                  ))}
                </div>
              </div>
              <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">Verbalt</div>
                <div className="flex gap-1.5 flex-wrap">
                  {VERBAL_PILLS.map(p => (
                    <span key={p.label} className={`text-xs font-black px-2.5 py-1 rounded-lg border ${p.color}`}>{p.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide 2: Focus selection */}
        {slide === 2 && (
          <div className="px-7 py-6">
            <div className="text-center mb-5">
              <div className="text-4xl font-black mb-4 text-amber-400">?</div>
              <h2 className="text-xl font-black mb-2 text-amber-400">Vad vill du fokusera på?</h2>
              <p className="text-slate-400 text-sm">Appen anpassar startsidan och rekommendationer efter ditt val. Du kan ändra det när som helst.</p>
            </div>
            <div className="space-y-2">
              {FOCUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSelectedFocus(opt.value)
                  }}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-150 ${
                    selectedFocus === opt.value
                      ? `${opt.bg} ${opt.border} ring-1 ring-inset ring-white/10`
                      : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className={`font-black text-sm ${selectedFocus === opt.value ? opt.color : 'text-slate-200'}`}>{opt.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slide 3: Smart repetition */}
        {slide === 3 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-emerald-400">↻</div>
            <h2 className="text-xl font-black mb-3 text-emerald-400">Smart repetition</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Appen lär sig vilka frågor du kan och vilka du behöver träna mer på. Repetitionsläget visar rätt frågor vid rätt tillfälle.
            </p>
          </div>
        )}

        {/* Slide 4: Progress */}
        {slide === 4 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-amber-400">→</div>
            <h2 className="text-xl font-black mb-3 text-amber-400">Följ dina framsteg</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Provberedskapspoäng (0–100), HP-estimat (1,0–2,0) för kvantitativt och verbalt, tidanalys och prestationsmärken hjälper dig förstå var du befinner dig — och vart du är på väg.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={() => finish()}
            className="text-slate-600 hover:text-slate-400 text-sm transition-colors py-3 px-2"
          >
            Hoppa över
          </button>
          <button
            onClick={next}
            disabled={!canAdvance}
            className={`flex-1 rounded-xl py-3 font-bold text-sm transition-colors ${canAdvance ? 'bg-blue-600 hover:bg-blue-500' : 'bg-white/[0.06] text-slate-600 cursor-not-allowed'}`}
          >
            {isLast ? 'Kom igång →' : isFocusSlide && selectedFocus ? `Fortsätt med ${FOCUS_OPTIONS.find(o => o.value === selectedFocus)?.label} →` : 'Nästa →'}
          </button>
        </div>
      </div>
    </div>
  )
}
