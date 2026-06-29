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
  { label: 'XYZ', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { label: 'KVA', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'NOG', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'DTK', color: 'bg-amber-50 text-amber-700 border-amber-200' },
]

const VERBAL_PILLS = [
  { label: 'ORD', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'LÄS', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { label: 'MEK', color: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200' },
  { label: 'ELF', color: 'bg-purple-50 text-purple-700 border-purple-200' },
]

const FOCUS_OPTIONS: { value: FocusPreference; label: string; sub: string; color: string; border: string; bg: string }[] = [
  { value: 'quant', label: 'Kvantitativt', sub: 'XYZ · KVA · NOG · DTK', color: 'text-blue-700', border: 'border-blue-200', bg: 'bg-blue-50' },
  { value: 'verbal', label: 'Verbalt', sub: 'ORD · LÄS · MEK · ELF', color: 'text-rose-700', border: 'border-rose-200', bg: 'bg-rose-50' },
  { value: 'both', label: 'Hela provet', sub: 'Alla 8 delproven', color: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up sm:animate-scale-in">

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5 pb-1">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-[var(--color-green)]' : i < slide ? 'w-1.5 bg-[var(--color-green)]/40' : 'w-1.5 bg-[var(--color-paper-dark)]'}`}
            />
          ))}
        </div>

        {/* Slide 0: Welcome */}
        {slide === 0 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-blue-700">HP</div>
            <h2 className="text-xl font-black mb-3 text-blue-700">Välkommen till HP Träning</h2>
            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
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
            <div className="text-4xl font-black mb-4 text-violet-700">∑</div>
            <h2 className="text-xl font-black mb-3 text-violet-700">Åtta delproven</h2>
            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed mb-4">
              HP har ett kvantitativt och ett verbalt delprov. Båda räknas lika och ger vardera ett poäng på 1,0–2,0.
            </p>
            <div className="space-y-2 text-left">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1.5">Kvantitativt</div>
                <div className="flex gap-1.5 flex-wrap">
                  {QUANT_PILLS.map(p => (
                    <span key={p.label} className={`text-xs font-black px-2.5 py-1 rounded-lg border ${p.color}`}>{p.label}</span>
                  ))}
                </div>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                <div className="text-[10px] font-bold text-rose-700 uppercase tracking-widest mb-1.5">Verbalt</div>
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
              <div className="text-4xl font-black mb-4 text-amber-700">?</div>
              <h2 className="text-xl font-black mb-2 text-amber-700">Vad vill du fokusera på?</h2>
              <p className="text-[var(--color-ink-muted)] text-sm">Appen anpassar startsidan och rekommendationer efter ditt val. Du kan ändra det när som helst.</p>
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
                      ? `${opt.bg} ${opt.border} ring-1 ring-inset ring-[var(--color-card-border)]`
                      : 'bg-[var(--color-paper)] border-[var(--color-card-border)] hover:bg-[var(--color-paper-dark)]'
                  }`}
                >
                  <div className={`font-black text-sm ${selectedFocus === opt.value ? opt.color : 'text-[var(--color-ink)]'}`}>{opt.label}</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Slide 3: Smart repetition */}
        {slide === 3 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-emerald-700">↻</div>
            <h2 className="text-xl font-black mb-3 text-emerald-700">Smart repetition</h2>
            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
              Appen lär sig vilka frågor du kan och vilka du behöver träna mer på. Repetitionsläget visar rätt frågor vid rätt tillfälle.
            </p>
          </div>
        )}

        {/* Slide 4: Progress */}
        {slide === 4 && (
          <div className="px-7 py-6 text-center">
            <div className="text-4xl font-black mb-4 text-amber-700">→</div>
            <h2 className="text-xl font-black mb-3 text-amber-700">Följ dina framsteg</h2>
            <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
              Provberedskapspoäng (0–100), HP-estimat (1,0–2,0) för kvantitativt och verbalt, tidanalys och prestationsmärken hjälper dig förstå var du befinner dig — och vart du är på väg.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={() => finish()}
            className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] text-sm transition-colors py-3 px-2"
          >
            Hoppa över
          </button>
          <button
            onClick={next}
            disabled={!canAdvance}
            className={`flex-1 rounded-xl py-3 font-bold text-sm transition-colors ${canAdvance ? 'btn-primary' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)] cursor-not-allowed'}`}
          >
            {isLast ? 'Kom igång →' : isFocusSlide && selectedFocus ? `Fortsätt med ${FOCUS_OPTIONS.find(o => o.value === selectedFocus)?.label} →` : 'Nästa →'}
          </button>
        </div>
      </div>
    </div>
  )
}
