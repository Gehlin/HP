import { useState } from 'react'

const ONBOARDING_KEY = 'hp_onboarding_done'

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, '1')
}

const SLIDES = [
  {
    symbol: 'HP',
    title: 'Välkommen till HP Träning',
    body: 'Träna kvantitativ del av Högskoleprovet med hundratals verkliga frågor från XYZ, KVA, NOG och DTK.',
    accent: 'text-blue-400',
    symbolColor: 'text-blue-400',
  },
  {
    symbol: '∑',
    title: 'Fyra delproven',
    body: 'XYZ är matematik, KVA är jämförelser, NOG handlar om tillräckliga data och DTK om diagram och tabeller. Varje delprov har sin egen strategi.',
    accent: 'text-violet-400',
    symbolColor: 'text-violet-400',
    pills: [
      { label: 'XYZ', color: 'bg-violet-500/10 text-violet-300 border-violet-500/25' },
      { label: 'KVA', color: 'bg-blue-500/10 text-blue-300 border-blue-500/25' },
      { label: 'NOG', color: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25' },
      { label: 'DTK', color: 'bg-amber-500/10 text-amber-300 border-amber-500/25' },
    ],
  },
  {
    symbol: '↻',
    title: 'Smart repetition',
    body: 'Appen lär sig vilka frågor du kan och vilka du behöver träna mer på. Repetitionsläget visar rätt frågor vid rätt tillfälle.',
    accent: 'text-emerald-400',
    symbolColor: 'text-emerald-400',
  },
  {
    symbol: '→',
    title: 'Följ dina framsteg',
    body: 'Provberedskapspoäng (0–100), HP-estimat, tidanalys och prestationsmärken hjälper dig förstå var du befinner dig — och vart du är på väg.',
    accent: 'text-amber-400',
    symbolColor: 'text-amber-400',
  },
]

interface Props {
  onClose: () => void
}

export default function Onboarding({ onClose }: Props) {
  const [slide, setSlide] = useState(0)
  const current = SLIDES[slide]
  const isLast = slide === SLIDES.length - 1

  const finish = () => {
    markOnboardingDone()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
      <div className="bg-[#0d1320] border border-white/[0.08] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up sm:animate-scale-in">

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 pt-5 pb-1">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-blue-500' : i < slide ? 'w-1.5 bg-blue-500/40' : 'w-1.5 bg-white/[0.08]'}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-7 py-6 text-center">
          <div className={`text-4xl font-black mb-4 ${current.symbolColor}`}>{current.symbol}</div>
          <h2 className={`text-xl font-black mb-3 ${current.accent}`}>{current.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{current.body}</p>

          {'pills' in current && current.pills && (
            <div className="flex justify-center gap-2 mt-4 flex-wrap">
              {current.pills.map(p => (
                <span key={p.label} className={`text-xs font-black px-3 py-1 rounded-lg border ${p.color}`}>
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-7 pb-7 flex gap-3">
          <button
            onClick={finish}
            className="text-slate-600 hover:text-slate-400 text-sm transition-colors py-3 px-2"
          >
            Hoppa över
          </button>
          <button
            onClick={isLast ? finish : () => setSlide(s => s + 1)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold text-sm transition-colors"
          >
            {isLast ? 'Kom igång →' : 'Nästa →'}
          </button>
        </div>
      </div>
    </div>
  )
}
