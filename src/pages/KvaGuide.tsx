import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

type Tab = 'schema' | 'strategi' | 'monster'

function StepReveal({ steps }: { steps: { label: string; content: string; result?: string }[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-[var(--color-card-border)] bg-[var(--color-paper-dark)]' : 'border-[var(--color-card-border)] bg-[var(--color-card)]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? 'bg-blue-600 text-white' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-muted)] mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{step.content}</div>
                  {step.result && <div className="mt-1.5 text-xs font-bold text-blue-400">{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-[var(--color-ink-faint)]">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className="shrink-0 text-[10px] text-blue-400 border border-blue-500/30 rounded-lg px-2 py-1 hover:bg-blue-500/10 transition-colors">Visa</button>
            )}
          </div>
        </div>
      ))}
      {revealed === steps.length && (
        <button onClick={() => setRevealed(0)} className="w-full text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] py-1.5 transition-colors">Återställ ↺</button>
      )}
    </div>
  )
}

const ANSWER_SCHEME = [
  {
    key: 'A',
    label: 'Kvantitet I är större',
    color: 'text-violet-400',
    border: 'border-violet-500/25',
    bg: 'bg-violet-500/8',
    desc: 'KVI är definitivt och alltid större än KVII — för alla tillåtna värden.',
    trap: 'Kontrollera om det finns variabelbegränsningar. Om x > 0 anges explicit, räkna inte med x = −1.',
  },
  {
    key: 'B',
    label: 'Kvantitet II är större',
    color: 'text-blue-400',
    border: 'border-blue-500/25',
    bg: 'bg-blue-500/8',
    desc: 'KVII är definitivt och alltid större än KVI — för alla tillåtna värden.',
    trap: 'Samma krav på "alltid" gäller. En enda motexempeltestning räcker för att utesluta B.',
  },
  {
    key: 'C',
    label: 'Kvantiteterna är lika',
    color: 'text-emerald-400',
    border: 'border-emerald-500/25',
    bg: 'bg-emerald-500/8',
    desc: 'KVI = KVII exakt, för alla tillåtna värden. Algebraisk förenkling visar ofta detta.',
    trap: 'Välj inte C för att det "ser lika ut" — bevisa det algebraiskt eller numeriskt.',
  },
  {
    key: 'D',
    label: 'Kan inte avgöras',
    color: 'text-amber-400',
    border: 'border-amber-500/25',
    bg: 'bg-amber-500/8',
    desc: 'Relationen beror på vilket värde variabeln antar. Du kan hitta ett värde där KVI > KVII och ett annat där KVI < KVII (eller = KVII).',
    trap: 'Välj D om du hittar ETT motexempel till det du trodde var svaret. Du behöver hitta värden som ger OLIKA utfall, inte bara ett.',
  },
]

const PATTERNS = [
  {
    name: 'Algebraisk förenkling',
    icon: '∑',
    color: 'text-violet-400',
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    desc: 'Subtrahera KVI från KVII (eller vice versa) och avgör tecknet på skillnaden.',
    example: 'KVI: x² + 2x | KVII: x² + 2x + 1\nDifferens: KVII − KVI = 1 > 0 alltid → Svar B',
    tip: 'Om skillnaden alltid är > 0, < 0 eller = 0 utan beroende av x är svaret klart.',
  },
  {
    name: 'Extremvärdestest',
    icon: '⟨⟩',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    desc: 'Testa x = 0, x = 1, x = −1 och x = 0,5. Dessa avslöjar de flesta mönsterbrott.',
    example: 'KVI: x² | KVII: x\n• x=2: 4 vs 2 → A\n• x=0,5: 0,25 vs 0,5 → B\n→ Svaret varierar → D',
    tip: 'x = 0 och x = 1 är "magiska" värden som gör potenser och produkter lika.',
  },
  {
    name: 'Geometriska kvantiteter',
    icon: '△',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    desc: 'Rita alltid en figur. Märk ut givna mått och skriva formler direkt.',
    example: 'KVI: Area av cirkel med r=3 | KVII: Area av kvadrat med sida=5\n9π ≈ 28,3 vs 25 → A',
    tip: 'π ≈ 3,14. Vid jämförelser med π räcker det att känna π:s storlek utan exakt beräkning.',
  },
  {
    name: 'Bråk och procent',
    icon: '%',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    desc: 'Konvertera till samma form (bråk → decimal, eller skapa gemensam nämnare) innan jämförelse.',
    example: 'KVI: 5/8 | KVII: 7/11\n5×11=55, 7×8=56 → 55/88 < 56/88 → B',
    tip: 'Korsvis multiplicering: a/b vs c/d → jämför a×d mot b×c.',
  },
  {
    name: 'Statistiska jämförelser',
    icon: 'x̄',
    color: 'text-rose-400',
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/20',
    desc: 'Medelvärde, median och spridning kan jämföras utan att räkna exakta värden.',
    example: 'KVI: Medelvärdet av {1,3,5} | KVII: Medianen av {1,3,5}\nMedelvärde = 3, Median = 3 → C',
    tip: 'Symmetriska fördelningar: medelvärde = median. Skeva fördelningar: avgör riktningen.',
  },
]

export default function KvaGuide() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('schema')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'schema', label: 'Svarsschema' },
    { id: 'strategi', label: 'Strategi' },
    { id: 'monster', label: 'Mönster' },
  ]

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="KVA – Kvantitativa jämförelser" />
      <div className="max-w-lg mx-auto px-4 py-10 pb-24">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            KVA · Kvantitativa jämförelser
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">KVA-guide</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">10 frågor/prov · ~60s/fråga · 4 svarsalternativ</p>
        </div>

        {/* Core insight */}
        <div className="card rounded-2xl p-4 mb-6 border border-blue-500/15">
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Kärninsikt</div>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            KVA handlar aldrig om att beräkna exakta svar — bara att avgöra <span className="text-blue-300 font-semibold">vilken av två kvantiteter som är större</span>. Det räcker att bevisa att en är större, eller hitta ett motexempel för att välja D. Precision dödar tid; uppskattning vinner poäng.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 card rounded-xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-blue-600 text-white' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Schema tab */}
        {tab === 'schema' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">De fyra svarsalternativen</div>
            {ANSWER_SCHEME.map(opt => (
              <div key={opt.key} className={`rounded-2xl border ${opt.border} ${opt.bg} p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-2xl font-black ${opt.color}`}>{opt.key}</span>
                  <span className="text-sm font-bold text-[var(--color-ink)]">{opt.label}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-2">{opt.desc}</p>
                <div className="flex items-start gap-2 bg-[var(--color-paper-dark)] rounded-xl p-2.5">
                  <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{opt.trap}</span>
                </div>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)] mt-4">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Beslutsträd</div>
              <div className="space-y-2 text-sm">
                {[
                  { q: 'Är KVI alltid > KVII?', a: '→ A' },
                  { q: 'Är KVII alltid > KVI?', a: '→ B' },
                  { q: 'Är KVI alltid = KVII?', a: '→ C' },
                  { q: 'Beror det på värdet av variabeln?', a: '→ D' },
                ].map(({ q, a }) => (
                  <div key={q} className="flex items-center justify-between gap-4">
                    <span className="text-[var(--color-ink-muted)] text-xs">{q}</span>
                    <span className="text-blue-400 font-black text-sm shrink-0">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Strategi tab */}
        {tab === 'strategi' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Steg-för-steg-metod</div>
            <StepReveal steps={[
              {
                label: 'Läs uppgiften — identifiera eventuella begränsningar',
                content: 'Finns det begränsningar som "x > 0", "n är ett heltal", "a och b är positiva"? Dessa styr vilka värden du får testa. Skriv upp begränsningarna.',
                result: 'Exempel: "x är ett positivt heltal" → x ≥ 1',
              },
              {
                label: 'Formulera vad du jämför',
                content: 'Skriv upp KVI och KVII tydligt. Vad är det exakt du ska jämföra? Förenkla uttrycken om möjligt.',
                result: 'KVI: 2(x+1) = 2x+2 | KVII: 2x+3',
              },
              {
                label: 'Testa enkla värden',
                content: 'Börja med x=0, x=1, x=−1. Ge sedan x ett negativt decimaltal om inga begränsningar finns. Notera resultaten.',
                result: 'x=0: KVI=2, KVII=3 → KVII större\nx=1: KVI=4, KVII=5 → KVII större',
              },
              {
                label: 'Algebraisk kontroll eller motexempel',
                content: 'Stämmer mönstret? Bevisa det algebraiskt (KVII − KVI = 3 − 2 = 1 > 0 alltid) eller hitta ett motexempel.',
                result: 'KVII − KVI = (2x+3) − (2x+2) = 1 > 0 alltid → Svar B ✓',
              },
              {
                label: 'Välj svar med säkerhet',
                content: 'A, B, C kräver att relationen håller ALLTID. D väljs om du hittat ett värde där utfallet skiljer sig. Gissa D hellre än att välja fel A/B/C.',
                result: 'Svar: B',
              },
            ]} />

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Tidsstrategi</div>
              <div className="space-y-2">
                {[
                  { time: '0–20s', action: 'Läs och förstå vad som jämförs. Notera begränsningar.' },
                  { time: '20–45s', action: 'Testa 2–3 konkreta värden. Leta efter mönster.' },
                  { time: '45–60s', action: 'Algebraisk kontroll om osäker. Välj svar.' },
                  { time: '>60s', action: 'Välj D och gå vidare — det är det säkraste gissningsvalet vid tidspress.' },
                ].map(({ time, action }) => (
                  <div key={time} className="flex gap-3 text-xs">
                    <span className="text-blue-400 font-black shrink-0 w-12">{time}</span>
                    <span className="text-[var(--color-ink-muted)]">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-2xl p-4 border border-amber-500/15">
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">De vanligaste fällorna</div>
              <ul className="space-y-2">
                {[
                  'Glömmer att testa negativa tal och decimaltal — x=−1 och x=0,5 bryter många "uppenbara" mönster.',
                  'Väljer A/B/C utan algebraisk bekräftelse — det kanske bara råkade stämma för de värden du testade.',
                  'Tror att D alltid är fel — D är korrekt svar i ungefär 25% av frågorna.',
                  'Missar att x² ≥ 0 alltid — även om x är negativt. Kvadrater och absoluta värden har alltid definita tecken.',
                  'Förväxlar "kan vara lika" med "är alltid lika". C kräver alltid-likhet.',
                ].map(trap => (
                  <li key={trap} className="flex gap-2 text-xs text-[var(--color-ink-muted)]">
                    <span className="text-amber-400 shrink-0">·</span>
                    {trap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Mönster tab */}
        {tab === 'monster' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Vanliga uppgiftsmönster</div>
            {PATTERNS.map(p => (
              <div key={p.name} className={`rounded-2xl border ${p.border} ${p.bg} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-base font-mono ${p.color}`}>{p.icon}</span>
                  <span className={`text-sm font-bold ${p.color}`}>{p.name}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mb-3 leading-relaxed">{p.desc}</p>
                <div className="bg-[var(--color-paper-dark)] rounded-xl p-3 mb-2">
                  <div className="text-[10px] font-bold text-[var(--color-ink-faint)] mb-1">Exempel</div>
                  <pre className="text-[11px] text-[var(--color-ink-muted)] whitespace-pre-wrap leading-relaxed font-mono">{p.example}</pre>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-blue-400 text-[11px] shrink-0">→</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{p.tip}</span>
                </div>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Snabbreferens — magiska tal</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'x = 0', effect: 'Tar bort termer multiplicerade med x' },
                  { val: 'x = 1', effect: 'Potenser och rötter ger 1' },
                  { val: 'x = −1', effect: 'Avslöjar teckenberoenden' },
                  { val: 'x = 0,5', effect: 'Bryter x > x² mönster' },
                  { val: 'x = −0,5', effect: 'Kombinerar negativ + decimal' },
                  { val: 'x = 100', effect: 'Avslöjar dominerande termer' },
                ].map(({ val, effect }) => (
                  <div key={val} className="bg-[var(--color-paper-dark)] rounded-xl p-2.5">
                    <div className="text-blue-400 font-black text-xs mb-0.5 font-mono">{val}</div>
                    <div className="text-[10px] text-[var(--color-ink-faint)]">{effect}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Drill CTA */}
        <div className="mt-8 pt-6 border-t border-[var(--color-card-border)]">
          <button
            onClick={() => navigate('/practice?type=KVA')}
            className="w-full bg-blue-700 hover:bg-blue-600 transition-colors rounded-xl py-3 font-bold text-sm"
          >
            Öva KVA nu →
          </button>
        </div>

      </div>
    </div>
  )
}
