import MathText from './MathText'
import type { ExplanationData } from '../types'

interface Props {
  isCorrect: boolean
  correctAnswer: string
  explanation: string
  explanationData?: ExplanationData
}

export default function ExplanationCard({ isCorrect, correctAnswer, explanation, explanationData }: Props) {
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
          <StructuredExplanation data={explanationData} />
        ) : (
          <div className="text-sm text-slate-300 leading-relaxed">
            <MathText text={explanation} />
          </div>
        )}
      </div>
    </div>
  )
}

function StructuredExplanation({ data }: { data: ExplanationData }) {
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
    </div>
  )
}
