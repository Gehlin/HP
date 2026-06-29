import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

type Tab = 'teknik' | 'diagramtyper' | 'fallor'

function StepReveal({ steps }: { steps: { label: string; content: string; result?: string }[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-[var(--color-card-border)] bg-[var(--color-paper-dark)]' : 'border-[var(--color-card-border)] bg-[var(--color-card)]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? 'bg-amber-600 text-white' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-muted)] mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{step.content}</div>
                  {step.result && <div className="mt-1.5 text-xs font-bold text-amber-400">{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-[var(--color-ink-faint)]">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className="shrink-0 text-[10px] text-amber-400 border border-amber-500/30 rounded-lg px-2 py-1 hover:bg-amber-500/10 transition-colors">Visa</button>
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

const CHART_TYPES = [
  {
    name: 'Stapeldiagram',
    icon: '▊',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    questions: ['Avläsning av enskilda värden', 'Jämförelse mellan staplar', 'Procentuell skillnad', 'Rangordning'],
    strategy: 'Läs av y-axelns skala NOGA — den börjar inte alltid vid noll. En stapel som ser dubbelt så hög ut kanske bara är 10% större om y-axeln startar vid 80.',
    trap: 'Trunkerad y-axel: när y-axeln börjar vid t.ex. 80 istället för 0 ser skillnader dramatiska ut. Beräkna alltid den faktiska skillnaden i siffror.',
  },
  {
    name: 'Linjediagram',
    icon: '↗',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    questions: ['Trend och riktning', 'Avläsning vid specifik tidpunkt', 'Hastigaste förändringen', 'Korsningspunkter'],
    strategy: 'Identifiera om y-axeln visar absoluta tal eller procent. "Andel som ökar" och "antal som ökar" kan ge helt olika kurvor för samma fenomen.',
    trap: 'Linje som planar ut ≠ minskar. Stigande kurva med avtagande lutning = fortfarande ökning, bara långsammare.',
  },
  {
    name: 'Cirkeldiagram',
    icon: '◔',
    color: 'text-violet-400',
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    questions: ['Andelar och procent', 'Jämförelse av sektorer', 'Beräkning av absolut antal givet totalt'],
    strategy: 'Cirkeldiagram visar alltid ANDELAR av en helhet. För att få absoluta tal behöver du totalsumman. Kontrollera om den anges i rubriken eller i en not.',
    trap: 'Visuell bedömning av sektorstorlek är opålitlig — alltid läs av de angivna procenttalen. Vinklar är svåra att jämföra exakt med ögat.',
  },
  {
    name: 'Tabeller',
    icon: '⊞',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    questions: ['Avläsning av specifik cell', 'Radvis eller kolumnvis jämförelse', 'Beräkning av summa eller medelvärde', 'Procentuell förändring'],
    strategy: 'Skanna alltid rad- och kolumnrubrikerna innan du läser data. Notera enheter (tkr, MSEK, %) och om siffrorna är avrundade.',
    trap: 'Förväxla "procentuell förändring" med "procentenheter". Om andelen ökar från 20% till 25% = 5 procentenheter, men 25% relativ ökning.',
  },
  {
    name: 'Kartor och geografiska data',
    icon: '⊙',
    color: 'text-rose-400',
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/20',
    questions: ['Identifiera region med högst/lägst värde', 'Jämförelse mellan regioner', 'Beräkning med angivna skalfaktorer'],
    strategy: 'Kartfrågor handlar sällan om geografi — de handlar om att avläsa en sifferskala kopplad till olika regioner. Fokusera på legenden/skalan.',
    trap: 'Stora ytor ser viktigare ut men kan ha låga värden. Areabias påverkar uppfattningen — läs alltid faktavärdena i legenden.',
  },
]

const TRAPS = [
  {
    name: 'Trunkerad axel',
    severity: 'hög',
    desc: 'Y-axeln börjar inte vid noll, vilket gör skillnader se ut att vara procentuellt större än de är.',
    fix: 'Beräkna den faktiska procentuella skillnaden: (KVII − KVI) / KVI × 100. Låt inte visuell storlek lura dig.',
  },
  {
    name: 'Procent vs procentenheter',
    severity: 'hög',
    desc: '"Ökning med 5%" är en relativ förändring. "Ökning med 5 procentenheter" är en absolut förändring i ett procentvärde. Dessa ger helt olika siffror.',
    fix: 'Identifiera exakt vad frågan frågar om. "Hur mycket ökade andelen?" → procentenheter. "Hur stor var den relativa ökningen?" → procent.',
  },
  {
    name: 'Absoluta tal vs andelar',
    severity: 'medel',
    desc: 'En grupp kan ha störst andel men inte störst absolut antal — om totalstorlekarna är olika.',
    fix: 'Kontrollera om totalsiffrorna anges. Om 30% av 1000 jämförs med 40% av 600: 300 vs 240 — den lägre andelen ger fler i absoluta tal.',
  },
  {
    name: 'Enhet i rubrik vs data',
    severity: 'medel',
    desc: 'Rubriken kan ange tusentals (tkr) medan du läser av diagram i hela tal — skillnad på faktor 1000.',
    fix: 'Läs rubriken, underrubriken och axelnoter INNAN du avläser data. Notera enheten explicit.',
  },
  {
    name: 'Interpolation',
    severity: 'låg',
    desc: 'Data finns bara för vissa punkter — du kan behöva interpolera för ett mellanvärde.',
    fix: 'Linjär interpolation: om värdet vid år 2015 = 40 och vid 2020 = 50, är värdet vid 2017 ungefär 40 + 2/5 × 10 = 44.',
  },
]

export default function DtkGuide() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('teknik')

  const TABS: { id: Tab; label: string }[] = [
    { id: 'teknik', label: 'Teknik' },
    { id: 'diagramtyper', label: 'Diagramtyper' },
    { id: 'fallor', label: 'Fällor' },
  ]

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="DTK – Diagram, tabeller & kartor" />
      <div className="max-w-lg mx-auto px-4 py-10 pb-24">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            DTK · Diagram, tabeller &amp; kartor
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">DTK-guide</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">12 frågor/prov · ~115s/fråga · mest tid per fråga</p>
        </div>

        {/* Core insight */}
        <div className="card rounded-2xl p-4 mb-6 border border-amber-500/15">
          <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-2">Kärninsikt</div>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            DTK är <span className="text-amber-300 font-semibold">ett precisionsprov, inte ett matematikprov</span>. Svaret finns i diagrammet — uppgiften är att läsa av det korrekt. De flesta fel beror inte på felräkning utan på att man läser av fel enhet, fel axel, eller jämför procent med absoluta tal. Läs alltid rubrik, enheter och axlar INNAN du svarar.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 card rounded-xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-amber-600 text-white' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Teknik tab */}
        {tab === 'teknik' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Läsordning för DTK-frågor</div>
            <StepReveal steps={[
              {
                label: 'Läs diagrammets rubrik',
                content: 'Rubriken berättar VAD som visas. Notera: ämne, geografisk avgränsning, tidsperiod. Utan rubriken riskerar du att svara på fel fråga.',
                result: 'Exempel: "Genomsnittlig månadslön (tkr) per sektor, 2010–2022"',
              },
              {
                label: 'Identifiera axlar och enheter',
                content: 'X-axel och y-axel: vad mäter de? I vilken enhet? Börjar y-axeln vid 0? Är skalan linjär eller logaritmisk? Notera allt explicit.',
                result: 'Y-axel: tkr (tusenkronor). X-axel: år. Skala: 20–50 tkr (trunkerad!)',
              },
              {
                label: 'Läs frågan exakt',
                content: 'Vad frågas egentligen? "Hur mycket ökade" (absolut) eller "hur stor var ökningen" (relativ, %)? "Vilket år var störst" eller "vilket år ökade mest"?',
                result: 'Identifiera nyckelorden: störst, minst, ökning, minskning, procentuell, absolut',
              },
              {
                label: 'Avläs och beräkna',
                content: 'Läs av de specifika värdena du behöver. Gör beräkningen steg för steg. Undvik att göra mer räkning än nödvändigt — DTK testar avläsning, inte avancerad matematik.',
                result: 'Om frågan ber om procentuell ökning: (nytt − gammalt) / gammalt × 100',
              },
              {
                label: 'Kontrollera svaret mot alternativen',
                content: 'Stämmer ditt svar i storleksordning med alternativen? Om ditt svar avviker kraftigt — kontrollera enheten igen. DTK-fällor skapas ofta genom enhetsförväxling.',
                result: 'Välj svaret. Om osäker — eliminera uppenbart fel alternativ och välj bland resterande.',
              },
            ]} />

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Nyckelformler</div>
              <div className="space-y-3">
                {[
                  { name: 'Procentuell förändring', formula: '(Nytt − Gammalt) / Gammalt × 100' },
                  { name: 'Andel av helhet', formula: 'Del / Totalt × 100' },
                  { name: 'Absolut tal från andel', formula: 'Andel (%) × Totalt / 100' },
                  { name: 'Genomsnitt', formula: 'Summa / Antal' },
                  { name: 'Indexberäkning', formula: 'Värde / Basvärde × 100' },
                ].map(({ name, formula }) => (
                  <div key={name} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-[var(--color-ink-faint)]">{name}</span>
                    <span className="text-xs font-mono text-amber-300 text-right">{formula}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Tidsstrategi</div>
              <div className="space-y-2">
                {[
                  { time: '0–20s', action: 'Läs rubrik, enheter, axlar. Bygg kontext.' },
                  { time: '20–40s', action: 'Läs frågan exakt. Identifiera vilka värden du behöver.' },
                  { time: '40–90s', action: 'Avläs och beräkna. Välj svar.' },
                  { time: '>90s', action: 'Eliminera klart felaktiga alternativ. Välj bland resterande.' },
                ].map(({ time, action }) => (
                  <div key={time} className="flex gap-3 text-xs">
                    <span className="text-amber-400 font-black shrink-0 w-14">{time}</span>
                    <span className="text-[var(--color-ink-muted)]">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diagramtyper tab */}
        {tab === 'diagramtyper' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fem diagramtyper på HP</div>
            {CHART_TYPES.map(c => (
              <div key={c.name} className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-lg font-mono ${c.color}`}>{c.icon}</span>
                  <span className={`text-sm font-bold ${c.color}`}>{c.name}</span>
                </div>
                <div className="mb-2">
                  <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1.5">Vanliga frågetyper</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.questions.map(q => (
                      <span key={q} className="text-[10px] text-[var(--color-ink-muted)] bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] px-2 py-0.5 rounded-md">{q}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-[var(--color-ink-muted)] mb-2 leading-relaxed">{c.strategy}</div>
                <div className="flex items-start gap-2 bg-[var(--color-paper-dark)] rounded-xl p-2.5">
                  <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{c.trap}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Fällor tab */}
        {tab === 'fallor' && (
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Vanliga fallgropar</div>
            {TRAPS.map(trap => (
              <div key={trap.name} className={`card rounded-2xl p-4 border ${
                trap.severity === 'hög' ? 'border-red-200' : trap.severity === 'medel' ? 'border-amber-200' : 'border-[var(--color-card-border)]'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    trap.severity === 'hög' ? 'bg-red-50 text-red-700' : trap.severity === 'medel' ? 'bg-amber-50 text-amber-700' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'
                  }`}>{trap.severity}</span>
                  <span className="text-sm font-bold text-[var(--color-ink)]">{trap.name}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] mb-3 leading-relaxed">{trap.desc}</p>
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                  <span className="text-emerald-700 text-xs shrink-0 mt-0.5">✓</span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">{trap.fix}</span>
                </div>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Checklista innan du svarar</div>
              <ul className="space-y-2">
                {[
                  'Läste jag diagrammets rubrik och enhet?',
                  'Börjar y-axeln vid noll? (om inte: kompensera visuellt)',
                  'Frågar frågan om procent eller absoluta tal?',
                  'Pratar frågan om förändring (ökade) eller nivå (var störst)?',
                  'Stämmer mitt svar i storleksordning med alternativen?',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-[var(--color-ink-muted)]">
                    <span className="w-4 h-4 rounded border border-[var(--color-card-border)] shrink-0 flex items-center justify-center text-[8px] text-[var(--color-ink-faint)]">{i + 1}</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Drill CTA */}
        <div className="mt-8 pt-6 border-t border-[var(--color-card-border)]">
          <button
            onClick={() => navigate('/practice?type=DTK')}
            className="w-full bg-amber-700 hover:bg-amber-600 transition-colors rounded-xl py-3 font-bold text-sm"
          >
            Öva DTK nu →
          </button>
        </div>

      </div>
    </div>
  )
}
