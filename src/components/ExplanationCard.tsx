import MathText from './MathText'
import type { ExplanationData, AnswerKey } from '../types'

interface Props {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
  explanationData?: ExplanationData
  chosenAnswer?: AnswerKey
  onLearnMore?: () => void
  learnMoreLabel?: string
}

export default function ExplanationCard({ isCorrect, correctAnswer, explanation, explanationData, chosenAnswer, onLearnMore, learnMoreLabel }: Props) {
  return (
    <div className={`rounded-2xl overflow-hidden mt-4 border ${isCorrect ? 'border-emerald-700/60' : 'border-red-700/60'}`}>

      {/* Header */}
      <div className={`px-5 py-3 flex items-center gap-3 ${isCorrect ? 'bg-emerald-900/50' : 'bg-red-900/50'}`}>
        <span className={`text-lg font-black ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
          {isCorrect ? '✓ Rätt!' : `✗ Fel — rätt svar: ${correctAnswer}`}
        </span>
      </div>

      {/* Body */}
      <div className="bg-slate-900/80 px-5 py-5 space-y-4">
        {explanationData ? (
          <StructuredExplanation data={explanationData} chosenAnswer={chosenAnswer} />
        ) : (
          <div className="text-sm text-slate-300 leading-relaxed">
            <MathText text={explanation} />
          </div>
        )}

        {!isCorrect && onLearnMore && (
          <button
            onClick={onLearnMore}
            className="w-full flex items-center justify-between bg-violet-500/10 border border-violet-500/25 hover:bg-violet-500/15 rounded-xl px-4 py-3 transition-colors"
          >
            <div className="text-left">
              <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-0.5">Lär dig mer</div>
              <div className="text-sm font-semibold text-violet-200">{learnMoreLabel ?? 'Öppna lektion →'}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-violet-400 shrink-0">
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
        <div className="flex gap-3 items-start bg-blue-950/60 border border-blue-800/50 rounded-xl px-4 py-3">
          <span className="text-blue-400 text-base mt-0.5 shrink-0">▶</span>
          <div>
            <div className="text-[10px] font-black tracking-widest uppercase text-blue-500 mb-1">Metod</div>
            <div className="text-sm text-blue-100 leading-relaxed">
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
              <div className="shrink-0 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[11px] font-black text-slate-300 mt-0.5">
                {i + 1}
              </div>
              <div className="text-sm text-slate-200 leading-relaxed pt-0.5">
                <MathText text={step} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key insight / note */}
      {data.note && (
        <div className="flex gap-3 items-start bg-amber-950/50 border border-amber-700/40 rounded-xl px-4 py-3">
          <span className="text-amber-400 text-base mt-0.5 shrink-0">💡</span>
          <div>
            <div className="text-[10px] font-black tracking-widest uppercase text-amber-500 mb-1">Nyckelinsikt</div>
            <div className="text-sm text-amber-100 leading-relaxed">
              <MathText text={data.note} />
            </div>
          </div>
        </div>
      )}

      {/* Distractor notes */}
      {distractorEntries.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl px-4 py-3">
          <div className="text-[10px] font-black tracking-widest uppercase text-slate-500 mb-2.5">Vanliga fällor</div>
          <div className="space-y-2">
            {distractorEntries.map(([key, note]) => {
              const wasChosen = key === chosenAnswer
              return (
                <div key={key} className="flex gap-2.5 text-xs leading-relaxed">
                  <span className={`font-black shrink-0 mt-0.5 ${wasChosen ? 'text-red-400' : 'text-slate-500'}`}>
                    {key}
                  </span>
                  <span className={wasChosen ? 'text-red-200' : 'text-slate-400'}>
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
