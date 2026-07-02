import { useState } from 'react'
import { setExamDate, getExamDate, EXAM_OPTIONS } from '../utils/examDate'

const ONBOARDING_KEY = 'hp_onboarding_done'

export function isOnboardingDone(): boolean {
  return localStorage.getItem(ONBOARDING_KEY) === '1'
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, '1')
}

const GOAL_CHIPS = ['1,20', '1,40', '1,60', '1,80', '2,00']

const CTA_LABELS = ['Kom igång', 'Fortsätt', 'Fortsätt', 'Sätt igång']

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso + 'T00:00:00').getTime() - Date.now()) / 86400000))
}

interface Props {
  onClose: () => void
  /** Enter the wizard at an arbitrary step (prototype `goalEdit`: Profil "Ändra" → step 2). */
  initialStep?: number
}

export default function Onboarding({ onClose, initialStep = 0 }: Props) {
  const [step, setStep] = useState(() => Math.min(3, Math.max(0, initialStep)))
  const [name, setName] = useState(() => {
    try { return localStorage.getItem('hp_user_name') ?? '' } catch { return '' }
  })
  const [goal, setGoal] = useState(() => {
    try { return localStorage.getItem('hp_goal') ?? '1,40' } catch { return '1,40' }
  })
  const [examISO, setExamISO] = useState(() => {
    const stored = getExamDate()
    if (stored) {
      const iso = stored.toISOString().slice(0, 10)
      if (EXAM_OPTIONS.some(o => o.iso === iso)) return iso
    }
    return EXAM_OPTIONS[0].iso
  })

  const finish = () => {
    try {
      localStorage.setItem('hp_user_name', name.trim() || 'Elin')
      localStorage.setItem('hp_goal', goal)
    } catch { /* ignore */ }
    setExamDate(examISO)
    markOnboardingDone()
    onClose()
  }

  const next = () => {
    if (step < 3) setStep(s => s + 1)
    else finish()
  }

  const back = () => setStep(s => Math.max(0, s - 1))

  return (
    <div className="fixed inset-0 z-[200] bg-[var(--color-paper)] flex flex-col pt-[62px] px-6 pb-9">

      {/* Back button + progress dots */}
      <div className="flex items-center gap-[13px] h-[34px]">
        {step > 0 && (
          <button
            onClick={back}
            aria-label="Tillbaka"
            className="w-[34px] h-[34px] rounded-[11px] bg-white border border-[var(--color-card-border)] flex items-center justify-center cursor-pointer"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" stroke="#6f6859" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 2 2 8l5 6"/></svg>
          </button>
        )}
        <div className="flex gap-[7px]">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className="h-[7px] rounded-full transition-all duration-[250ms] ease-out"
              style={{ width: i === step ? 22 : 7, background: i <= step ? 'var(--color-green)' : '#D8CFBE' }}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col justify-center">

        {/* Step 0: Welcome */}
        {step === 0 && (
          <div>
            <div className="w-[62px] h-[62px] rounded-[18px] bg-[var(--color-green)] flex items-center justify-center mb-7">
              <span className="font-serif font-medium text-[30px] leading-none text-[var(--color-cream)]">H</span>
            </div>
            <div className="font-serif font-normal text-[38px] leading-[1.08] text-[var(--color-ink)] tracking-[-0.015em]">
              Plugga smartare<br />inför provet.
            </div>
            <div className="font-medium text-[15px] leading-[1.6] text-[var(--color-ink-muted)] mt-4 max-w-[300px]">
              Öva på alla åtta delprov, följ din utveckling och se exakt hur många dagar du har kvar till Högskoleprovet.
            </div>
          </div>
        )}

        {/* Step 1: Name */}
        {step === 1 && (
          <div>
            <div className="font-serif font-normal text-[31px] leading-[1.12] text-[var(--color-ink)] tracking-[-0.01em]">
              Vad ska vi kalla dig?
            </div>
            <div className="font-medium text-[14px] leading-[1.55] text-[var(--color-ink-muted)] mt-[11px]">
              Ditt namn visas på startsidan och i dina resultat.
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ditt namn"
              className="mt-7 w-full h-[58px] rounded-2xl border-[1.5px] border-[#E0D8C8] bg-white px-[18px] font-semibold text-[18px] text-[var(--color-ink)] outline-none"
            />
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <div>
            <div className="font-serif font-normal text-[31px] leading-[1.12] text-[var(--color-ink)] tracking-[-0.01em]">
              Vilket resultat<br />siktar du på?
            </div>
            <div className="font-medium text-[14px] leading-[1.55] text-[var(--color-ink-muted)] mt-[11px]">
              Snittet för många utbildningar ligger runt 1,30–1,50. Du kan ändra målet när som helst.
            </div>
            <div className="flex flex-wrap gap-[10px] mt-7">
              {GOAL_CHIPS.map(g => {
                const sel = g === goal
                return (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`px-[21px] py-[13px] rounded-[14px] border-[1.5px] font-bold text-[17px] leading-none cursor-pointer transition-all duration-150 ${
                      sel
                        ? 'bg-[var(--color-green)] border-[var(--color-green)] text-[var(--color-cream)]'
                        : 'bg-white border-[#E5DDCE] text-[var(--color-ink-soft)]'
                    }`}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Step 3: Exam date */}
        {step === 3 && (
          <div>
            <div className="font-serif font-normal text-[31px] leading-[1.12] text-[var(--color-ink)] tracking-[-0.01em]">
              När skriver du provet?
            </div>
            <div className="font-medium text-[14px] leading-[1.55] text-[var(--color-ink-muted)] mt-[11px]">
              Vi räknar ner dagarna åt dig på startsidan.
            </div>
            <div className="flex flex-col gap-[10px] mt-[26px]">
              {EXAM_OPTIONS.map(o => {
                const sel = o.iso === examISO
                return (
                  <button
                    key={o.iso}
                    onClick={() => setExamISO(o.iso)}
                    className={`flex items-center justify-between rounded-2xl px-[17px] py-[15px] text-left cursor-pointer transition-all duration-150 ${
                      sel
                        ? 'bg-[#EEF3EF] border-[1.5px] border-[var(--color-green)]'
                        : 'bg-white border border-[var(--color-card-border)]'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-[16px] leading-none text-[var(--color-ink)]">{o.label}</div>
                      <div className="font-medium text-[12px] leading-none text-[var(--color-ink-faint)] mt-1.5">
                        {o.sub} · om {daysLeft(o.iso)} dagar
                      </div>
                    </div>
                    <div
                      className="w-[22px] h-[22px] rounded-full box-border shrink-0"
                      style={{ border: sel ? '7px solid var(--color-green)' : '2px solid #D8CFBE' }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={next}
        className="h-14 rounded-2xl bg-[var(--color-green)] flex items-center justify-center font-bold text-[16px] leading-none text-[var(--color-cream)] cursor-pointer"
      >
        {CTA_LABELS[step]}
      </button>
    </div>
  )
}
