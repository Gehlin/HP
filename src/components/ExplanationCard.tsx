import MathText from './MathText'
import type { ExplanationData, AnswerKey } from '../types'

interface Props {
  isCorrect: boolean
  /** Kept for caller compatibility; the correct answer is shown highlighted in the option list per the prototype. */
  correctAnswer?: string
  correctAnswerText?: string
  explanation: string
  explanationData?: ExplanationData
  chosenAnswer?: AnswerKey
  onLearnMore?: () => void
  learnMoreLabel?: string
}

export default function ExplanationCard({ isCorrect, explanation, explanationData, chosenAnswer, onLearnMore, learnMoreLabel }: Props) {
  return (
    <div className={`rounded-2xl overflow-hidden mt-4 border bg-[var(--color-card)] ${isCorrect ? 'border-[var(--color-feedback-correct-border)]' : 'border-[var(--color-feedback-wrong-border)]'}`}>

      {/* Header */}
      <div className={`px-5 py-3 flex items-center gap-2 ${isCorrect ? 'bg-[var(--color-feedback-correct-bg)]' : 'bg-[var(--color-feedback-wrong-bg)]'}`}>
        <span
          className="shrink-0 w-[9px] h-[9px] rounded-[3px] rotate-45"
          style={{ background: isCorrect ? 'var(--color-correct-badge)' : 'var(--color-wrong-badge)' }}
        />
        <span className={`text-sm font-bold ${isCorrect ? 'text-[var(--color-feedback-correct-title)]' : 'text-[var(--color-feedback-wrong-title)]'}`}>
          {isCorrect ? 'Rätt!' : 'Inte riktigt'}
        </span>
      </div>

      {/* Body */}
      <div className="bg-[var(--color-card)] px-5 py-5 space-y-4">
        {explanationData ? (
          <StructuredExplanation data={explanationData} chosenAnswer={chosenAnswer} />
        ) : (
          <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            <MathText text={explanation} />
          </div>
        )}

        {!isCorrect && onLearnMore && (
          <button
            onClick={onLearnMore}
            className="w-full flex items-center justify-between bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] hover:opacity-80 rounded-xl px-4 py-3 transition-opacity"
          >
            <div className="text-left">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-0.5">Lär dig mer</div>
              <div className="text-sm font-semibold text-[var(--color-ink)]">{learnMoreLabel ?? 'Öppna lektion →'}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-[var(--color-ink-muted)] shrink-0">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

function StructuredExplanation({ data, chosenAnswer }: { data: ExplanationData; chosenAnswer?: AnswerKey }) {
  const distractorEntries = data.distractorNotes
    ? (Object.entries(data.distractorNotes) as [AnswerKey, string][])
    : []

  return (
    <div className="space-y-4">

      {/* Approach / method */}
      {data.approach && (
        <div className="flex gap-3 items-start bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-4 py-3">
          <span className="text-[var(--color-green)] text-base mt-0.5 shrink-0">▶</span>
          <div>
            <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-1">Metod</div>
            <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              <MathText text={data.approach} />
            </div>
          </div>
        </div>
      )}

      {/* Steps */}
      {data.steps.length > 0 && (
        <div className="space-y-3">
          {data.steps.map((step, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="shrink-0 w-6 h-6 rounded-full bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] flex items-center justify-center text-[11px] font-black text-[var(--color-ink-muted)] mt-0.5">
                {i + 1}
              </div>
              <div className="text-sm text-[var(--color-ink)] leading-relaxed pt-0.5">
                <MathText text={step} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key insight / note */}
      {data.note && (
        <div className="flex gap-3 items-start bg-[var(--color-gold-muted)] border border-[var(--color-card-border)] rounded-xl px-4 py-3">
          <span className="text-base mt-0.5 shrink-0">💡</span>
          <div>
            <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-1">Nyckelinsikt</div>
            <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
              <MathText text={data.note} />
            </div>
          </div>
        </div>
      )}

      {/* Distractor notes */}
      {distractorEntries.length > 0 && (
        <div className="bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-4 py-3">
          <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-2.5">Vanliga fällor</div>
          <div className="space-y-2">
            {distractorEntries.map(([key, note]) => {
              const wasChosen = key === chosenAnswer
              return (
                <div key={key} className="flex gap-2.5 text-xs leading-relaxed">
                  <span className={`font-black shrink-0 mt-0.5 ${wasChosen ? 'text-[var(--color-error)]' : 'text-[var(--color-ink-faint)]'}`}>
                    {key}
                  </span>
                  <span className={wasChosen ? 'text-[var(--color-error)]' : 'text-[var(--color-ink-muted)]'}>
                    <MathText text={note} />
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
