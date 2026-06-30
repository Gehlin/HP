import { useEffect } from 'react'
import { FORMULA_CARDS } from '../data/formulaCards'
import MathText from './MathText'

interface Props {
  questionType: string
  onClose: () => void
}

export default function FormulaDrawer({ questionType, onClose }: Props) {
  const card = FORMULA_CARDS[questionType]

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (!card) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] flex flex-col bg-[var(--color-card)] border-t border-[var(--color-card-border)] rounded-t-2xl shadow-2xl overflow-hidden animate-slide-up">

        {/* Handle + header */}
        <div className={`shrink-0 border-b ${card.borderColor} border-opacity-40 px-5 pt-4 pb-3`}>
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 bg-[var(--color-paper-dark)] rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className={`text-sm font-black ${card.color}`}>{card.type}</span>
              <span className="text-xs text-[var(--color-ink-faint)] ml-2">{card.tagline}</span>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors text-lg leading-none"
              aria-label="Stäng"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 pb-safe">
          {card.sections.map(section => (
            <div key={section.title}>
              <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-2">
                {section.title}
              </div>
              <div className="space-y-1.5">
                {section.items.map((item, i) => (
                  <div key={i} className={`rounded-xl px-4 py-3 ${card.bgColor} border ${card.borderColor} border-opacity-30`}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-[var(--color-ink-faint)] shrink-0 pt-0.5 min-w-[80px]">{item.label}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-[var(--color-ink)] font-mono leading-snug">
                          <MathText text={item.formula} />
                        </div>
                        {item.note && (
                          <div className="text-[11px] text-[var(--color-ink-faint)] mt-1">{item.note}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
