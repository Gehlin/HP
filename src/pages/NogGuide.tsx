import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

type Tab = 'schema' | 'tillracklighet' | 'monster'

function StepReveal({ steps, color = 'emerald' }: { steps: { label: string; content: string; result?: string }[]; color?: string }) {
  const [revealed, setRevealed] = useState(0)
  const activeColor = color === 'emerald' ? 'bg-[var(--color-green)]' : 'bg-[var(--color-terracotta)]'
  const btnColor = color === 'emerald' ? 'text-[var(--color-green)] border-[var(--color-card-border)] hover:bg-[var(--color-green-muted)]' : 'text-[var(--color-terracotta)] border-[var(--color-card-border)] hover:bg-[var(--color-terracotta-muted)]'
  const resultColor = color === 'emerald' ? 'text-[var(--color-green-light)]' : 'text-[var(--color-terracotta)]'
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-[var(--color-card-border)] bg-[var(--color-paper-dark)]' : 'border-[var(--color-card-border)] bg-[var(--color-card)]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? `${activeColor} text-[var(--color-cream)]` : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-muted)] mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed whitespace-pre-line">{step.content}</div>
                  {step.result && <div className={`mt-1.5 text-xs font-bold ${resultColor}`}>{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-[var(--color-ink-faint)]">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className={`shrink-0 text-[10px] border rounded-lg px-2 py-1 transition-colors ${btnColor}`}>Visa</button>
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
    label: 'Påstående (1) räcker ensamt',
    color: 'text-[var(--color-terracotta)]',
    border: 'border-[var(--color-terracotta-muted)]',
    bg: 'bg-[var(--color-terracotta-muted)]',
    desc: 'Med påstående (1) kan du lösa uppgiften entydigt. Påstående (2) tillför inget — du behöver inte (2) och (2) ensamt räcker inte.',
    example: 'Vad är x? | (1) x + 3 = 7 | (2) x > 0\n(1) ger x = 4 entydigt → A. (2) ger bara x > 0 — oändligt många lösningar.',
    verify: 'Testa: Räcker (1) → ja (x=4). Räcker (2) → nej. Svar: A.',
  },
  {
    key: 'B',
    label: 'Påstående (2) räcker ensamt',
    color: 'text-[var(--color-green-light)]',
    border: 'border-[var(--color-card-border)]',
    bg: 'bg-[var(--color-green-muted)]',
    desc: 'Med påstående (2) kan du lösa uppgiften entydigt. Påstående (1) ensamt räcker inte.',
    example: 'Är n delbart med 6? | (1) n är delbart med 2 | (2) n = 18\n(1): delbart med 2 men kanske inte 3 (t.ex. n=4). (2): 18/6=3 → ja, entydigt.',
    verify: 'Testa: Räcker (1) → nej. Räcker (2) → ja. Svar: B.',
  },
  {
    key: 'C',
    label: 'Båda påståenden behövs ihop',
    color: 'text-[var(--color-gold-deep)]',
    border: 'border-[var(--color-card-border)]',
    bg: 'bg-[var(--color-gold-muted)]',
    desc: 'Varken (1) eller (2) räcker ensamt. Men tillsammans ger de tillräcklig information för ett entydigt svar.',
    example: 'Vad är x·y? | (1) x + y = 10 | (2) x − y = 4\n(1) ensamt: oändligt många par. (2) ensamt: oändligt många par. Tillsammans: x=7, y=3 → x·y=21.',
    verify: 'Testa: (1) ensamt → nej. (2) ensamt → nej. (1)+(2) → x=7, y=3, x·y=21 → ja. Svar: C.',
  },
  {
    key: 'D',
    label: 'Vardera av (1) och (2) räcker var för sig',
    color: 'text-[var(--color-ink-muted)]',
    border: 'border-[var(--color-card-border)]',
    bg: 'bg-[var(--color-paper-dark)]',
    desc: 'Både (1) ensamt OCH (2) ensamt räcker — var för sig. Du behöver alltså inte kombinera dem.',
    example: 'Är x > 0? | (1) x² = 25 och x är positiv | (2) x = 5\n(1): x=5 > 0. (2): x=5 > 0. Båda räcker oberoende av varandra.',
    verify: 'Testa: (1) ensamt → ja. (2) ensamt → ja. Svar: D.',
  },
  {
    key: 'E',
    label: 'Varken (1) och (2) tillsammans räcker',
    color: 'text-[var(--color-wrong-text)]',
    border: 'border-[var(--color-wrong-border)]',
    bg: 'bg-[var(--color-wrong-bg)]',
    desc: 'Även med BÅDA påståenden kombinerade kan du inte lösa uppgiften entydigt. Det finns fortfarande mer än ett möjligt svar.',
    example: 'Vad är x + y? | (1) x > 2 | (2) y < 5\n(1)+(2): x+y kan vara allt från ca 2+0=2 till ∞. Ingen entydig lösning.',
    verify: 'Testa: (1)+(2) → oändligt många möjliga x+y-värden → kan inte avgöras. Svar: E.',
  },
]

const PATTERNS = [
  {
    name: 'Algebraisk sufficiency',
    icon: '∑',
    color: 'text-[var(--color-terracotta)]',
    bg: 'bg-[var(--color-terracotta-muted)]',
    border: 'border-[var(--color-card-border)]',
    desc: 'Variabeluppgifter: avgör om påståendet ger en unik lösning (ett värde på x) eller fortfarande en mängd lösningar.',
    trap: 'En olikhet (x > 3) ger ALDRIG tillräcklighet ensamt om frågan frågar om ett specifikt värde. En ekvation (x = 5) ger alltid tillräcklighet.',
    tip: 'Räkna antalet oberoende ekvationer vs antal okända. N okända kräver N oberoende ekvationer.',
  },
  {
    name: 'Geometrisk sufficiency',
    icon: '△',
    color: 'text-[var(--color-green-light)]',
    bg: 'bg-[var(--color-green-muted)]',
    border: 'border-[var(--color-card-border)]',
    desc: 'Frågor om area, längd eller vinkel. Ett påstående räcker om det entydigt fastlägger den sökta storheten.',
    trap: 'Att veta två sidor i en triangel räcker INTE för att bestämma arean — du behöver också vinkeln däremellan eller den tredje sidan.',
    tip: 'Rita figuren. Märk ut vad du vet och vad du saknar. Fråga: vilken formel behöver jag, och räcker påståendet för att fylla i den?',
  },
  {
    name: 'Talteori och delbarhet',
    icon: 'ℕ',
    color: 'text-[var(--color-gold-deep)]',
    bg: 'bg-[var(--color-gold-muted)]',
    border: 'border-[var(--color-card-border)]',
    desc: 'Frågor om heltal, udda/jämna tal, primtal och delbarhet. Leta efter om påståendet skapar en entydig kategori.',
    trap: '"n är delbart med 4" räcker inte för att avgöra om n är delbart med 8 (t.ex. 12 är delbart med 4 men inte 8). Kontrollera alltid med konkreta motexempel.',
    tip: 'Testa alltid de minsta möjliga heltalen som uppfyller påståendet. Om de ger olika svar på frågan → påståendet räcker inte.',
  },
  {
    name: 'Statistiska frågor',
    icon: 'x̄',
    color: 'text-[var(--color-ink-muted)]',
    bg: 'bg-[var(--color-paper-dark)]',
    border: 'border-[var(--color-card-border)]',
    desc: 'Medelvärde, median, antal. En summa räcker inte för att bestämma individuella värden — och vice versa.',
    trap: '"Medelvärdet av tre tal är 10" säger att summan är 30 — men säger inget om enskilda tal eller medianen.',
    tip: 'Medelvärde + antal → summa. Summa + antal → medelvärde. Men ingen av dessa ger dig medianen utan extra info om ordning.',
  },
]

export default function NogGuide() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('schema')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'schema', label: 'Svarsschema' },
    { id: 'tillracklighet', label: 'Tillräcklighet' },
    { id: 'monster', label: 'Mönster' },
  ]

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="NOG – Kvantitativa resonemang" />
      <div className="max-w-lg mx-auto px-4 py-10 pb-24">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[var(--color-terracotta-muted)] border border-[var(--color-card-border)] text-[var(--color-terracotta)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-terracotta)] animate-pulse" />
            NOG · Datainsamling
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">NOG-guide</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">6 frågor/prov · ~100s/fråga · 5 svarsalternativ A–E</p>
        </div>

        {/* Core insight */}
        <div className="card rounded-2xl p-4 mb-6 border border-[var(--color-card-border)]">
          <div className="text-[10px] font-bold text-[var(--color-terracotta)] uppercase tracking-widest mb-2">Den enda regeln du behöver</div>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            NOG testar aldrig din förmåga att <span className="text-[var(--color-terracotta)] font-semibold">lösa</span> uppgiften — bara att avgöra om det <span className="text-[var(--color-terracotta)] font-semibold">går att lösa</span> den entydigt med den givna informationen. Svar med säkerhet "ja, det räcker" eller "nej, det räcker inte" — du behöver aldrig beräkna det faktiska svaret.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 card rounded-xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-[var(--color-terracotta)] text-[var(--color-cream)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Schema tab */}
        {tab === 'schema' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">De fem svarsalternativen</div>
            {ANSWER_SCHEME.map(opt => (
              <div key={opt.key} className={`rounded-2xl border ${opt.border} ${opt.bg} p-4`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-2xl font-black ${opt.color}`}>{opt.key}</span>
                  <span className="text-sm font-bold text-[var(--color-ink)]">{opt.label}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-3">{opt.desc}</p>
                <div className="bg-[var(--color-paper-dark)] rounded-xl p-3 mb-2">
                  <div className="text-[10px] font-bold text-[var(--color-ink-faint)] mb-1">Exempel</div>
                  <pre className="text-[11px] text-[var(--color-ink-muted)] whitespace-pre-wrap leading-relaxed">{opt.example}</pre>
                </div>
                <div className="flex items-start gap-2 bg-[var(--color-correct-bg)] border border-[var(--color-correct-border)] rounded-xl p-2.5">
                  <span className="text-[var(--color-correct-text)] text-xs shrink-0 mt-0.5">✓</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{opt.verify}</span>
                </div>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Beslutsträd</div>
              <div className="space-y-2">
                {[
                  { cond: 'Räcker (1) ensamt?', yes: '→ A eller D', no: null },
                  { cond: 'Räcker (2) ensamt?', yes: '→ B eller D', no: null },
                  { cond: 'Räcker BÅDA (1)+(2)?', yes: '→ C', no: '→ E' },
                  { cond: 'Räcker BÅDA var för sig?', yes: '→ D', no: null },
                ].map(({ cond, yes, no }) => (
                  <div key={cond} className="flex items-center justify-between gap-4 text-xs">
                    <span className="text-[var(--color-ink-muted)]">{cond}</span>
                    <div className="flex gap-2 shrink-0">
                      <span className="text-[var(--color-terracotta)] font-bold">{yes}</span>
                      {no && <span className="text-[var(--color-wrong-text)] font-bold">{no}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tillräcklighet tab */}
        {tab === 'tillracklighet' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Vad är tillräcklighet?</div>

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-sm font-bold text-[var(--color-ink)] mb-2">Entydighet är nyckeln</div>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                Ett påstående räcker om det — i kombination med frågeuppgiftens information — ger exakt ett möjligt svar. Om det finns två eller fler möjliga svar räcker inte påståendet, oavsett hur rimligt ett svar verkar.
              </p>
            </div>

            <StepReveal color="emerald" steps={[
              {
                label: 'Läs frågeuppgiften — vad söks exakt?',
                content: 'Identifiera den sökta storheten. Skriv upp vad du behöver veta för att svara. Var exakt: "vad är x?" skiljer sig från "är x positiv?" — det andra kräver mycket mindre information.',
                result: 'Exempel: "Vad är värdet av x+y?" — du behöver ett entydigt numeriskt svar.',
              },
              {
                label: 'Testa påstående (1) ENSAMT',
                content: 'Ignorera helt och hållet påstående (2). Kan du med påstående (1) — och enbart det — bestämma den sökta storheten entydigt? Prova med konkreta tal om det hjälper.',
                result: 'Om ja: svaret är A eller D. Om nej: svaret är B, C eller E.',
              },
              {
                label: 'Testa påstående (2) ENSAMT',
                content: 'Nu ignorerar du (1). Kan du med påstående (2) ensamt lösa uppgiften? Samma test.',
                result: 'Kombinera resultaten: (1)✓+(2)✓=D, (1)✓+(2)✗=A, (1)✗+(2)✓=B.',
              },
              {
                label: 'Om inget ensamt räckte — testa (1)+(2) tillsammans',
                content: 'Kombinera nu båda påståendena. Räcker de ihop? Om ja → C. Om nej (fortfarande tvetydigt) → E.',
                result: '(1)✗+(2)✗+(1+2)✓ = C. (1)✗+(2)✗+(1+2)✗ = E.',
              },
            ]} />

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-gold-deep)] uppercase tracking-widest mb-3">Vanligaste misstagen</div>
              <ul className="space-y-2">
                {[
                  'Glömmer att testa påståendena separat — hoppar direkt till att kombinera dem.',
                  'Löser faktiskt uppgiften istället för att bara avgöra om det går — slösar tid.',
                  'Tror att E = "uppgiften är dålig" — E är ett legitimt svar i ~15% av fallen.',
                  'Blandar ihop "påståendet är sant" med "påståendet räcker". Ett sant påstående kan fortfarande ge otillräcklig info.',
                  'Kontrollerar inte motexempel: testar ett värde som funkar, men missar ett annat som inte gör det.',
                ].map(m => (
                  <li key={m} className="flex gap-2 text-xs text-[var(--color-ink-muted)]">
                    <span className="text-[var(--color-gold-deep)] shrink-0">·</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Tidsstrategi</div>
              <div className="space-y-2">
                {[
                  { time: '0–20s', action: 'Läs frågan. Identifiera exakt vad som söks.' },
                  { time: '20–50s', action: 'Testa (1) ensamt. Konkret exempel om nödvändigt.' },
                  { time: '50–80s', action: 'Testa (2) ensamt.' },
                  { time: '80–100s', action: 'Om behövs: testa (1)+(2). Välj A–E.' },
                  { time: '>100s', action: 'Välj E (konservativt gissningsval). Gå vidare.' },
                ].map(({ time, action }) => (
                  <div key={time} className="flex gap-3 text-xs">
                    <span className="text-[var(--color-terracotta)] font-black shrink-0 w-14">{time}</span>
                    <span className="text-[var(--color-ink-muted)]">{action}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Snabbgenomgång av räknetrick</div>
              <p className="text-xs text-[var(--color-ink-faint)] mb-2">Behöver du mentala beräkningstrick för NOG? Se den separata guiden.</p>
              <button
                onClick={() => navigate('/liggande-stolen')}
                className="text-xs font-bold text-[var(--color-terracotta)] border border-[var(--color-card-border)] px-3 py-2 rounded-xl hover:bg-[var(--color-terracotta-muted)] transition-colors"
              >
                Öppna beräkningstrickguiden →
              </button>
            </div>
          </div>
        )}

        {/* Mönster tab */}
        {tab === 'monster' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Vanliga NOG-mönster</div>
            {PATTERNS.map(p => (
              <div key={p.name} className={`rounded-2xl border ${p.border} ${p.bg} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-base font-mono ${p.color}`}>{p.icon}</span>
                  <span className={`text-sm font-bold ${p.color}`}>{p.name}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mb-2 leading-relaxed">{p.desc}</p>
                <div className="flex items-start gap-2 bg-[var(--color-paper-dark)] rounded-xl p-2.5 mb-2">
                  <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{p.trap}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className={`text-xs shrink-0 ${p.color}`}>→</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{p.tip}</span>
                </div>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Motexempel — ditt bästa vapen</div>
              <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mb-3">
                Om du misstänker att ett påstående INTE räcker: hitta två konkreta exempel som uppfyller påståendet men ger olika svar på frågan. Det bevisar otillräcklighet.
              </p>
              <div className="bg-[var(--color-paper-dark)] rounded-xl p-3">
                <div className="text-[10px] font-bold text-[var(--color-ink-faint)] mb-1">Exempel på motexempel</div>
                <pre className="text-[11px] text-[var(--color-ink-muted)] whitespace-pre-wrap leading-relaxed">{`Fråga: Är x² > x?
Påstående (1): x > 0

Testa x=2: 4 > 2 ✓
Testa x=0,5: 0,25 > 0,5? Nej ✗

Två olika svar → (1) räcker inte → inte A/D`}</pre>
              </div>
            </div>
          </div>
        )}

        {/* Drill CTA */}
        <div className="mt-8 pt-6 border-t border-[var(--color-card-border)]">
          <button
            onClick={() => navigate('/practice?type=NOG')}
            className="w-full bg-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-deep)] transition-colors rounded-xl py-3 font-bold text-sm text-[var(--color-cream)]"
          >
            Öva NOG nu →
          </button>
        </div>

      </div>
    </div>
  )
}
