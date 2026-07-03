import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loadSession, saveSession, buildSession } from '../utils/session'
import { questions } from '../data/questions'
import type { AnswerKey } from '../types'
import MathText from '../components/MathText'

export default function Granska() {
  const navigate = useNavigate()
  const session = loadSession()
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'flagged'>('all')

  if (!session) return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl font-black text-[var(--color-ink-faint)] mb-4">—</div>
        <div className="text-[var(--color-ink-muted)] font-semibold mb-1">Ingen session hittades</div>
        <p className="text-[var(--color-ink-faint)] text-sm mb-6">Starta ett träningspass för att granska dina svar.</p>
        <button onClick={() => navigate('/practice')} className="btn-primary px-6 py-3 rounded-xl font-bold text-sm">
          Starta träning →
        </button>
      </div>
    </div>
  )

  const sessionQuestions = session.questionIds
    .map(id => questions.find(q => q.id === id))
    .filter(Boolean) as typeof questions

  const skipped = session.skipped ?? []
  const flagged = session.flagged ?? []
  const wrongCount = sessionQuestions.filter(q => !skipped.includes(q.id) && session.answers[q.id] !== q.answer).length

  const visible = sessionQuestions
    .map((q, i) => ({ q, num: i + 1 }))
    .filter(({ q }) => {
      if (reviewFilter === 'wrong') return !skipped.includes(q.id) && session.answers[q.id] !== q.answer
      if (reviewFilter === 'flagged') return flagged.includes(q.id)
      return true
    })

  const wrongIds = sessionQuestions
    .filter(q => !skipped.includes(q.id) && session.answers[q.id] !== q.answer)
    .map(q => q.id)

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pt-topnav-collapsed pb-bottomnav px-[18px]">
      <div className="max-w-2xl mx-auto">

        {/* Header: back arrow → Resultat + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/resultat')}
            aria-label="Tillbaka till resultat"
            className="w-[38px] h-[38px] rounded-xl bg-[var(--color-card)] border border-[var(--color-card-border)] flex items-center justify-center shrink-0"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="#6f6859" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2 2 8l5 6"/></svg>
          </button>
          <h1 className="font-[var(--font-serif)] font-normal text-[22px] leading-[1.05] text-[var(--color-ink)]">
            Granska dina svar
          </h1>
        </div>

        {/* Filter (kept app enhancement — the prototype has no filter UI) */}
        <div className="flex gap-2 mt-[18px] flex-wrap">
          <button
            onClick={() => setReviewFilter('all')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'all' ? 'border-[var(--color-selected-border)] text-[var(--color-ink)] bg-[var(--color-selected-bg)]' : 'border-[var(--color-card-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
          >
            Alla ({sessionQuestions.length})
          </button>
          <button
            onClick={() => setReviewFilter('wrong')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'wrong' ? 'border-[var(--color-wrong-border)] text-[var(--color-wrong-badge)] bg-[var(--color-wrong-bg)]' : 'border-[var(--color-card-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
          >
            Fel ({wrongCount})
          </button>
          <button
            onClick={() => setReviewFilter('flagged')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'flagged' ? 'border-[var(--color-gold-deep)] text-[var(--color-gold-deep)] bg-[var(--color-gold-muted)]' : 'border-[var(--color-card-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
          >
            ★ Markerade ({flagged.length})
          </button>
        </div>

        {/* Review cards */}
        <div className="flex flex-col gap-3 mt-[18px] pb-8">
          {visible.map(({ q, num }) => {
            const isSkipped = skipped.includes(q.id)
            const userAnswer = session.answers[q.id] as AnswerKey | undefined
            const right = !isSkipped && userAnswer === q.answer
            const yourText = userAnswer !== undefined ? q.options[userAnswer] : undefined
            return (
              <div key={q.id} className="bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl px-4 py-[15px] flex flex-col">
                <div
                  className="self-start px-2.5 py-1 rounded-full text-[10px] leading-none font-bold tracking-[0.06em]"
                  style={{
                    background: right ? '#E4EDE6' : '#F6E3DC',
                    color: right ? '#2E6A4C' : '#A84A26',
                  }}
                >
                  {right ? 'Rätt' : 'Fel'}
                </div>
                <div className="text-xs leading-none font-medium text-[var(--color-ink-faint)] mt-[11px]">
                  Fråga {num}
                </div>
                <div className="font-[var(--font-serif)] font-medium text-lg leading-[1.3] text-[var(--color-ink)] mt-[5px]">
                  <MathText text={q.text} />
                </div>
                <div
                  className="text-[13px] leading-[1.4] font-semibold mt-2.5"
                  style={{ color: right ? '#2E6A4C' : '#A84A26' }}
                >
                  Ditt svar: {yourText !== undefined ? <MathText text={yourText} /> : '—'}
                </div>
                {!right && (
                  <div className="text-[13px] leading-[1.4] font-semibold text-[#2E6A4C] mt-1">
                    Rätt svar: <MathText text={q.options[q.answer] ?? ''} />
                  </div>
                )}
                <div className="h-px bg-[#F0EADD] mt-3 mb-2.5" />
                <div className="text-[13px] leading-[1.55] font-medium text-[#6f6859]">
                  <MathText text={q.explanation} />
                </div>
              </div>
            )
          })}

          {visible.length === 0 && (
            <div className="text-center text-sm text-[var(--color-ink-faint)] py-10">
              Inga frågor matchar filtret.
            </div>
          )}

          {/* Drill wrong answers (kept app enhancement) */}
          {wrongIds.length > 0 && (
            <button
              onClick={() => {
                const drill = buildSession(wrongIds, null, true, 'drill', true)
                saveSession(drill)
                navigate('/session')
              }}
              className="h-[54px] rounded-2xl bg-[var(--color-green)] text-[var(--color-cream)] flex items-center justify-center font-bold text-base leading-none mt-2"
            >
              Öva på {wrongIds.length} fel från detta pass →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
