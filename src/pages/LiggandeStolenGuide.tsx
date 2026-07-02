import { useState } from 'react'
import PageHeader from '../components/PageHeader'

type Tab = 'intro' | 'multiplikation' | 'division' | 'kvadratrot' | 'estimering' | 'hptricks'

const TABS: { id: Tab; label: string }[] = [
  { id: 'intro',          label: 'Intro'       },
  { id: 'multiplikation', label: 'Multiplikation' },
  { id: 'division',       label: 'Division'    },
  { id: 'kvadratrot',     label: 'Kvadratrötter' },
  { id: 'estimering',     label: 'Estimering'  },
  { id: 'hptricks',       label: 'HP-tips'     },
]

function StepReveal({ steps }: { steps: { label: string; content: string; result?: string }[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-[var(--color-card-border)] bg-[var(--color-paper-dark)]' : 'border-[var(--color-card-border)] bg-[var(--color-card)]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? 'bg-[var(--color-terracotta)] text-[var(--color-cream)]' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-muted)] mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed whitespace-pre-line">{step.content}</div>
                  {step.result && <div className="mt-1.5 text-xs font-bold text-[var(--color-terracotta)]">{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-[var(--color-ink-faint)]">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className="shrink-0 text-[10px] text-[var(--color-terracotta)] border border-[var(--color-card-border)] rounded-lg px-2 py-1 hover:bg-[var(--color-terracotta-muted)] transition-colors">Visa</button>
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

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl p-4 text-sm font-mono text-[var(--color-ink-muted)] overflow-x-auto leading-relaxed">
      {children}
    </pre>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-black text-[var(--color-ink)] mb-3 mt-6 first:mt-0">{children}</h3>
}

function Callout({ title, children, color = 'blue' }: { title: string; children: React.ReactNode; color?: 'blue' | 'amber' | 'emerald' | 'violet' }) {
  const styles = {
    blue:    'border-[var(--color-card-border)] bg-[var(--color-terracotta-muted)] text-[var(--color-terracotta)]',
    amber:   'border-[var(--color-card-border)] bg-[var(--color-gold-muted)] text-[var(--color-gold-deep)]',
    emerald: 'border-[var(--color-correct-border)] bg-[var(--color-correct-bg)] text-[var(--color-correct-text)]',
    violet:  'border-[var(--color-card-border)] bg-[var(--color-green-muted)] text-[var(--color-green-light)]',
  }
  return (
    <div className={`rounded-xl border p-4 mb-4 ${styles[color]}`}>
      <div className="text-[10px] font-black uppercase tracking-widest mb-1.5">{title}</div>
      <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{children}</div>
    </div>
  )
}

// ─── Tab sections ──────────────────────────────────────────────────────────────

function IntroSection() {
  return (
    <div>
      <Callout title="Vad är Liggande Stolen?" color="violet">
        Liggande Stolen är en samlad metod för att utföra alla aritmetiska grundoperationer — multiplikation, division och kvadratrötter — med papper och penna, utan miniräknare. Metodens namn anspelar på den visuella formen som uträkningarna bildar på pappret.
      </Callout>

      <SectionHeading>Varför lära sig det här?</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-4">
        HP-provet tillåter <span className="text-[var(--color-ink)] font-semibold">inga miniräknare</span>. Alla 40 kvantitativa frågor — XYZ, KVA, NOG och DTK — måste lösas med hjärnan och eventuellt ett utkast på kladdpapper. Liggande Stolen ger dig:
      </p>
      <ul className="space-y-2 mb-6">
        {[
          'Säker kontroll av flerriffriga beräkningar utan gissningar',
          'Systematisk metod som minimerar räknefel under tidspress',
          'Snabba uppskattningstekniker för att eliminera felaktiga alternativ',
          'Självförtroende — du vet exakt hur du angriper varje beräkning',
        ].map(item => (
          <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-ink-muted)]">
            <span className="text-[var(--color-terracotta)] mt-0.5 shrink-0">·</span>
            {item}
          </li>
        ))}
      </ul>

      <SectionHeading>Metodens fyra pelare</SectionHeading>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {[
          { label: 'Multiplikation', desc: 'Kolumn för kolumn', icon: '×' },
          { label: 'Division',       desc: 'Lång division',    icon: '÷' },
          { label: 'Kvadratrötter',  desc: 'Parvis algoritm',  icon: '√' },
          { label: 'Estimering',     desc: 'Snabb uppskattning', icon: '≈' },
        ].map(p => (
          <div key={p.label} className="card rounded-xl p-3.5 border border-[var(--color-card-border)]">
            <div className="text-2xl font-black text-[var(--color-terracotta)] mb-1">{p.icon}</div>
            <div className="text-sm font-bold text-[var(--color-ink)]">{p.label}</div>
            <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">{p.desc}</div>
          </div>
        ))}
      </div>

      <Callout title="Grundprincip" color="emerald">
        Dela alltid upp ett svårt tal i enklare delar. Räkna ett steg i taget. Skriv ner delmomenten — minnet är begränsat, pappret är inte.
      </Callout>
    </div>
  )
}

function MultiplikationSection() {
  return (
    <div>
      <Callout title="Principen" color="blue">
        Skriv faktorerna i kolumn. Multiplicera den undre faktorn siffra för siffra med hela den övre faktorn. Förskjut varje delsvar ett steg åt vänster. Addera delsvaren.
      </Callout>

      <SectionHeading>Exempel 1 — enkel: 47 × 23</SectionHeading>
      <CodeBlock>{`     4 7
  ×  2 3
  ------
   1 4 1    ← 47 × 3
   9 4 0    ← 47 × 20  (en nolla, förskjuten ett steg)
  ------
  1 0 8 1`}</CodeBlock>
      <div className="mt-3">
        <StepReveal steps={[
          { label: 'Multiplicera med entalen (3)', content: '47 × 3:\n  7 × 3 = 21, skriv 1, minns 2\n  4 × 3 = 12, lägg till 2 = 14\nDelsvar: 141', result: '141' },
          { label: 'Multiplicera med tiotalen (20)', content: 'Skriv en 0:a i entalspositionen (förskjutning).\n47 × 2:\n  7 × 2 = 14, skriv 4, minns 1\n  4 × 2 = 8, lägg till 1 = 9\nDelsvar: 940', result: '940' },
          { label: 'Addera delsvaren', content: '  141\n+ 940\n-----', result: '= 1 081 ✓' },
        ]} />
      </div>

      <SectionHeading>Exempel 2 — tre siffror: 347 × 28</SectionHeading>
      <CodeBlock>{`      3 4 7
  ×     2 8
  --------
   2 7 7 6    ← 347 × 8
   6 9 4 0    ← 347 × 20
  --------
   9 7 1 6`}</CodeBlock>
      <div className="mt-3">
        <StepReveal steps={[
          { label: '347 × 8', content: '7 × 8 = 56 → skriv 6, minns 5\n4 × 8 = 32 + 5 = 37 → skriv 7, minns 3\n3 × 8 = 24 + 3 = 27 → skriv 27', result: 'Delsvar: 2 776' },
          { label: '347 × 20', content: 'Skriv 0 i entalsposition.\n347 × 2: 7×2=14, 4×2=8+1=9, 3×2=6+1=7\nOBS: ingen minnessiffra i sista steget', result: 'Delsvar: 6 940' },
          { label: 'Addera', content: '  2 776\n+ 6 940\n-------', result: '= 9 716 ✓' },
        ]} />
      </div>

      <SectionHeading>Minnesteknik</SectionHeading>
      <Callout title="Liggande Stolen-regeln" color="amber">
        Hantera minnessiffror direkt — addera dem till nästa produktsteg innan du skriver svaret. Glöm aldrig minnessiffran; det är den vanligaste felkällan.
      </Callout>

      <SectionHeading>Kontrollera med uppskattning</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
        Uppskatta alltid först: 47 × 23 ≈ 50 × 20 = 1 000. Ditt exakta svar 1 081 är rimligt. Om du räknar ut 10 810 har du ett decimalfel.
      </p>
    </div>
  )
}

function DivisionSection() {
  return (
    <div>
      <Callout title="Principen" color="blue">
        Lång division: ta en hanterbar del av täljaren, bestäm hur många gånger nämnaren får plats, skriv kvarlevan, hämta nästa siffra. Repetera tills alla siffror är hanterade.
      </Callout>

      <SectionHeading>Exempel 1 — 1 081 ÷ 23</SectionHeading>
      <CodeBlock>{`  1081 ÷ 23

  23 │ 1 0 8 1
        ─────
     Steg 1: Hur många 23:or i 108?
             23 × 4 = 92, 23 × 5 = 115 → svar: 4
        9 2
        ───
        1 6    (kvarlevan = 108 − 92)
     Steg 2: Hämta 1 → 161
             23 × 7 = 161 → svar: 7
        1 6 1
        ─────
            0

  Svar: 47`}</CodeBlock>
      <div className="mt-3">
        <StepReveal steps={[
          { label: 'Ta en hanterbar del av täljaren', content: '23 ≥ 10, så ta de två första siffrorna: 10.\n23 går inte i 10, ta tre siffror: 108.', result: 'Arbetssegment: 108' },
          { label: 'Hur många gånger?', content: '23 × 4 = 92 ✓ (≤ 108)\n23 × 5 = 115 ✗ (> 108)\nKvot: 4. Kvarlevan: 108 − 92 = 16.', result: 'Kvot: 4, kvarlevan: 16' },
          { label: 'Hämta nästa siffra', content: 'Hämta siffran "1" → nytt segment: 161.', result: 'Segment: 161' },
          { label: 'Hur många gånger?', content: '23 × 7 = 161 ✓ (exakt!)\nKvarlevan: 0.', result: 'Kvot: 7, kvarlevan: 0' },
          { label: 'Sätt ihop svaret', content: 'Kvotsiffrorna: 4 och 7.', result: '1 081 ÷ 23 = 47 ✓' },
        ]} />
      </div>

      <SectionHeading>Exempel 2 — med decimal: 100 ÷ 7</SectionHeading>
      <CodeBlock>{`  100 ÷ 7 ≈ 14.28...

  7 │ 1 0 0 . 0 0
      7
      ─
      3 0
      2 8
      ──
       2 0
       1 4
       ──
        6 0
        5 6
        ──
         4 ...

  Svar: 14.28...  ≈ 14.3`}</CodeBlock>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mt-3">
        När täljaren tar slut — lägg till decimalpunkten och fortsätt med <span className="text-[var(--color-ink)]">nollor</span> tills önskad precision nås. På HP räcker 2–3 decimaler för att eliminera felaktiga alternativ.
      </p>

      <SectionHeading>Snabbkoll av nämnaren</SectionHeading>
      <div className="space-y-2">
        {[
          { n: '2', rule: 'Sista siffran jämn (0, 2, 4, 6, 8)' },
          { n: '3', rule: 'Siffersumman är delbar med 3 (ex. 126: 1+2+6=9)' },
          { n: '4', rule: 'De två sista siffrorna är delbara med 4' },
          { n: '5', rule: 'Slutar på 0 eller 5' },
          { n: '9', rule: 'Siffersumman är delbar med 9' },
          { n: '11', rule: 'Alternerande siffersum = 0 eller ±11 (ex. 121: 1−2+1=0)' },
        ].map(r => (
          <div key={r.n} className="flex items-start gap-3 text-sm">
            <span className="font-black text-[var(--color-terracotta)] w-7 shrink-0">÷{r.n}</span>
            <span className="text-[var(--color-ink-muted)]">{r.rule}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function KvadratrotSection() {
  return (
    <div>
      <Callout title="Två metoder" color="violet">
        (1) Parvisa algoritmen — exakt, men tung. (2) Babyloniska metoden (Newton) — iterativ, snabb, perfekt för HP.
      </Callout>

      <SectionHeading>Metod 1 — Babyloniska metoden (rekommenderad för HP)</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        Börja med en gissning x₀ nära √N. Iterera: <span className="font-mono text-[var(--color-terracotta)]">xₙ₊₁ = (xₙ + N/xₙ) / 2</span>. Metoden halverar felet vid varje steg.
      </p>
      <StepReveal steps={[
        { label: 'Uppgift: beräkna √2 med 3 decimalers noggrannhet', content: 'Exakt svar: 1.41421...\nStartgissning: x₀ = 1.5 (enkel att räkna med)', result: 'x₀ = 1.5' },
        { label: 'Iteration 1', content: 'x₁ = (x₀ + 2/x₀) / 2\n    = (1.5 + 2/1.5) / 2\n    = (1.5 + 1.333) / 2\n    = 2.833 / 2', result: 'x₁ ≈ 1.417' },
        { label: 'Iteration 2', content: 'x₂ = (1.417 + 2/1.417) / 2\n    = (1.417 + 1.411) / 2\n    = 2.828 / 2', result: 'x₂ ≈ 1.414 ✓ (3 dec. korrekt)' },
        { label: 'Slutsats', content: 'Två iterationer räcker för 3 decimaler.\nPå HP: en iteration räcker ofta för att välja rätt alternativ.', result: '√2 ≈ 1.414' },
      ]} />

      <SectionHeading>Metod 2 — Parvisa algoritmen (exakt)</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        Dela upp talet i sifferpar från höger (och från decimalpunkten åt båda hållen). Hitta roten siffra för siffra.
      </p>
      <CodeBlock>{`  √1369 = ?

  Dela: 13 | 69

  Steg 1:  Störst heltal vars kvadrat ≤ 13?
            3² = 9 ≤ 13, 4² = 16 > 13 → siffra: 3
            Kvarlevan: 13 − 9 = 4

  Steg 2:  Hämta nästa par: 469
            Dubbla hittills funna siffran: 2 × 3 = 6
            Hitta siffra d så att (60 + d) × d ≤ 469:
            67 × 7 = 469 ✓ → siffra: 7
            Kvarlevan: 0

  Svar: √1369 = 37 ✓
  Kontroll: 37² = 1369 ✓`}</CodeBlock>

      <SectionHeading>Viktiga rötter att memorera</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['√2',  '≈ 1.414'], ['√3',  '≈ 1.732'],
          ['√5',  '≈ 2.236'], ['√6',  '≈ 2.449'],
          ['√7',  '≈ 2.646'], ['√8',  '≈ 2.828'],
          ['√10', '≈ 3.162'], ['√0.5', '≈ 0.707'],
        ].map(([root, val]) => (
          <div key={root} className="card rounded-xl p-3 border border-[var(--color-card-border)] flex items-center justify-between">
            <span className="font-mono text-[var(--color-terracotta)] text-sm font-bold">{root}</span>
            <span className="font-mono text-[var(--color-ink-muted)] text-sm">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function EsteringSection() {
  return (
    <div>
      <Callout title="Varför estimering?" color="emerald">
        På HP är syftet sällan att räkna exakt — det är att välja rätt alternativ av fyra. Ofta räcker det att utesluta tre felaktiga svar, vilket kräver bara en grov uppskattning.
      </Callout>

      <SectionHeading>Avrundning till signifikanta siffror</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        Avrunda varje faktor till 1–2 signifikanta siffror. Räkna. Jämför med alternativen.
      </p>
      <StepReveal steps={[
        { label: 'Uppgift: 487 × 312 / 196', content: 'Avrunda: 487 ≈ 500, 312 ≈ 300, 196 ≈ 200', result: 'Uppskattning: 500 × 300 / 200 = 750' },
        { label: 'Exakt svar (för kontroll)', content: '487 × 312 = 151 944\n151 944 / 196 ≈ 775', result: '775 — uppskattning 750 gav rätt storleksordning ✓' },
      ]} />

      <SectionHeading>Procenttrick — dela upp i standarddelar</SectionHeading>
      <div className="space-y-2 mb-4">
        {[
          { pct: '10 %', how: 'Flytta decimalpunkten ett steg åt vänster', ex: '10% av 347 = 34.7' },
          { pct: '5 %',  how: 'Halvera 10 %', ex: '5% av 347 = 17.35' },
          { pct: '1 %',  how: 'Flytta decimalpunkten två steg åt vänster', ex: '1% av 347 = 3.47' },
          { pct: '25 %', how: 'Dela med 4 (eller halvera två gånger)', ex: '25% av 348 = 87' },
          { pct: '33 %', how: 'Dela med 3 (1/3 ≈ 0.333)', ex: '33% av 306 = 102' },
          { pct: '75 %', how: '3/4 = 3 × (25%)', ex: '75% av 348 = 261' },
        ].map(r => (
          <div key={r.pct} className="card rounded-xl p-3 border border-[var(--color-card-border)]">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-black text-[var(--color-terracotta)] w-12 shrink-0">{r.pct}</span>
              <span className="text-sm text-[var(--color-ink-muted)]">{r.how}</span>
            </div>
            <div className="ml-12 text-xs font-mono text-[var(--color-ink-faint)]">{r.ex}</div>
          </div>
        ))}
      </div>

      <SectionHeading>Frontaritmetik — räkna framifrån</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        Börja med de mest signifikanta siffrorna. Du får snabbt en approximation som är tillräcklig för att välja rätt alternativ.
      </p>
      <CodeBlock>{`  349 + 278 + 461

  Front:  300 + 200 + 400 = 900
  Justering: 49 + 78 + 61 ≈ 50 + 80 + 60 = 190

  Uppskattning: 900 + 190 = 1 090
  Exakt: 1 088  — tillräckligt nära! ✓`}</CodeBlock>

      <SectionHeading>Kompatibla tal</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
        Välj tal nära det givna som är lätta att räkna med. Exempel: 483 ÷ 24 ≈ 480 ÷ 24 = 20. (480 = 24 × 20.)
      </p>
    </div>
  )
}

function HpTricksSection() {
  return (
    <div>
      <Callout title="HP utan miniräknare" color="amber">
        Dessa specifika tekniker är designade för att spara tid och undvika beräkningsmisstag just i HP-kontexten.
      </Callout>

      <SectionHeading>Trick 1 — Kolla sista siffran (eliminera alternativ)</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        I multiplikation bestäms sista siffran bara av sista siffrorna i faktorerna. Använd detta för att snabbt döda felaktiga alternativ.
      </p>
      <CodeBlock>{`  Fråga: Vad är 47 × 23?
  Alternativ: A) 1 071  B) 1 081  C) 1 091  D) 1 101

  Sista siffran: 7 × 3 = 21 → sista siffran är 1
  Alla alternativ slutar på 1 — kan inte eliminera.

  Annat exempel: 46 × 23 →  6 × 3 = 18 → sista: 8
  Alternativ: A) 1 068  B) 1 080  C) 1 058  D) 1 078
  Eliminera: B (slutar på 0), C (slutar på 8 ✓), A och D.
  B och D elimineras direkt. Välj mellan A och C.`}</CodeBlock>

      <SectionHeading>Trick 2 — Konjugatregeln för snabb multiplikation</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        <span className="font-mono text-[var(--color-terracotta)]">(a + b)(a − b) = a² − b²</span>. Används när faktorerna är nära varandra eller nära ett runt tal.
      </p>
      <StepReveal steps={[
        { label: '48 × 52 = ?', content: 'Skriv om: (50 − 2)(50 + 2) = 50² − 2²', result: '= 2500 − 4 = 2496 ✓ (snabbt!)' },
        { label: '97 × 103 = ?', content: 'Skriv om: (100 − 3)(100 + 3) = 100² − 3²', result: '= 10 000 − 9 = 9 991 ✓' },
        { label: '19 × 21 = ?', content: 'Skriv om: (20 − 1)(20 + 1) = 20² − 1²', result: '= 400 − 1 = 399 ✓' },
      ]} />

      <SectionHeading>Trick 3 — Kvadrering nära 100</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        <span className="font-mono text-[var(--color-terracotta)]">n² = (100 + d)² = 10 000 + 200d + d²</span>, där d = n − 100.
      </p>
      <StepReveal steps={[
        { label: '103² = ?', content: 'd = 3\n103² = 10 000 + 200×3 + 3² = 10 000 + 600 + 9', result: '= 10 609 ✓' },
        { label: '97² = ?', content: 'd = −3\n97² = 10 000 + 200×(−3) + (−3)² = 10 000 − 600 + 9', result: '= 9 409 ✓' },
      ]} />

      <SectionHeading>Trick 4 — Dela och multiplicera med 5</SectionHeading>
      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-3">
        Multiplicera med 5: multiplicera med 10, dividera med 2. Dividera med 5: multiplicera med 2, dividera med 10.
      </p>
      <CodeBlock>{`  348 × 5 = 348 × 10 / 2 = 3480 / 2 = 1740

  348 ÷ 5 = 348 × 2 / 10 = 696 / 10 = 69.6`}</CodeBlock>

      <SectionHeading>Trick 5 — Bråk och procent-konverteringar att memorera</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        {[
          ['1/3',  '33.3%'], ['2/3',  '66.7%'],
          ['1/4',  '25%'],   ['3/4',  '75%'],
          ['1/5',  '20%'],   ['2/5',  '40%'],
          ['1/6',  '16.7%'], ['1/7',  '≈14.3%'],
          ['1/8',  '12.5%'], ['3/8',  '37.5%'],
          ['1/9',  '≈11.1%'],['1/11', '≈9.1%'],
        ].map(([frac, pct]) => (
          <div key={frac} className="card rounded-xl p-2.5 border border-[var(--color-card-border)] flex items-center justify-between">
            <span className="font-mono text-[var(--color-gold-deep)] text-sm font-bold">{frac}</span>
            <span className="font-mono text-[var(--color-ink-muted)] text-sm">{pct}</span>
          </div>
        ))}
      </div>

      <SectionHeading>Trick 6 — π och vanliga konstanter</SectionHeading>
      <div className="space-y-1.5 mt-1">
        {[
          ['π',    '≈ 3.14159 (≈ 3.14 räcker)'],
          ['π²',   '≈ 9.87 (≈ 10)'],
          ['√2',   '≈ 1.414'],
          ['√3',   '≈ 1.732'],
          ['1/π',  '≈ 0.318'],
          ['e',    '≈ 2.718 (sällan på HP)'],
        ].map(([sym, val]) => (
          <div key={sym} className="flex items-center gap-3 text-sm">
            <span className="font-mono text-[var(--color-terracotta)] w-10 shrink-0">{sym}</span>
            <span className="text-[var(--color-ink-muted)]">{val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function LiggandeStolenGuide() {
  const [tab, setTab] = useState<Tab>('intro')

  const tabColor = (t: Tab) => {
    const active: Record<Tab, string> = {
      intro:          'bg-[var(--color-terracotta)]',
      multiplikation: 'bg-[var(--color-terracotta)]',
      division:       'bg-[var(--color-terracotta)]',
      kvadratrot:     'bg-[var(--color-gold-deep)]',
      estimering:     'bg-[var(--color-terracotta)]',
      hptricks:       'bg-[var(--color-green)]',
    }
    return active[t]
  }

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="Liggande stolen" />
      <div className="max-w-2xl mx-auto px-4 pt-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black">Liggande Stolen</h1>
          <p className="text-xs text-[var(--color-ink-faint)] mt-0.5">Räkna utan miniräknare</p>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'text-[var(--color-ink)] bg-[var(--color-paper-dark)] border border-[var(--color-card-border)]'
                    : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] border border-transparent'
                }`}
              >
                {isActive && (
                  <span className={`absolute top-0 inset-x-4 h-[2px] rounded-full ${tabColor(t.id)}`} />
                )}
                {t.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="max-w-2xl">
          {tab === 'intro'          && <IntroSection />}
          {tab === 'multiplikation' && <MultiplikationSection />}
          {tab === 'division'       && <DivisionSection />}
          {tab === 'kvadratrot'     && <KvadratrotSection />}
          {tab === 'estimering'     && <EsteringSection />}
          {tab === 'hptricks'       && <HpTricksSection />}
        </div>

        {/* Nav between tabs */}
        <div className="flex justify-between mt-8 pt-6 border-t border-[var(--color-card-border)]">
          <button
            onClick={() => {
              const idx = TABS.findIndex(t => t.id === tab)
              if (idx > 0) setTab(TABS[idx - 1].id)
            }}
            disabled={tab === TABS[0].id}
            className="flex items-center gap-2 text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] disabled:opacity-30 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Föregående
          </button>
          <button
            onClick={() => {
              const idx = TABS.findIndex(t => t.id === tab)
              if (idx < TABS.length - 1) setTab(TABS[idx + 1].id)
            }}
            disabled={tab === TABS[TABS.length - 1].id}
            className="flex items-center gap-2 text-sm text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] disabled:opacity-30 transition-colors"
          >
            Nästa
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>

      </div>
    </div>
  )
}
