import { useState } from 'react'
import PageHeader from '../components/PageHeader'

type Tab = 'konjunktioner' | 'strategi' | 'ovning'

function StepReveal({ steps }: { steps: { label: string; content: string; result?: string }[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-[var(--color-card-border)] bg-[var(--color-paper-dark)]' : 'border-[var(--color-card-border)] bg-[var(--color-card)]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? 'bg-lime-600 text-white' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-muted)] mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{step.content}</div>
                  {step.result && <div className="mt-1.5 text-xs font-bold text-lime-400">{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-[var(--color-ink-faint)]">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className="shrink-0 text-[10px] text-lime-400 border border-lime-500/30 rounded-lg px-2 py-1 hover:bg-lime-500/10 transition-colors">Visa</button>
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

const CONJUNCTION_TYPES = [
  {
    id: 'kausal',
    name: 'Kausala',
    signal: 'eftersom · för att · därför att · på grund av',
    logic: 'Orsak → Verkan',
    logicColor: 'text-amber-400',
    desc: 'Den ena halvan orsakar den andra. Orsaken är sann — konsekvensen är naturlig och förväntad.',
    ex: 'Han misslyckades med provet eftersom han inte hade studerat.',
    trap: 'Blanda inte ihop "för att" (orsak) med "för att" (syfte). "Han åt för att bli mätt" = syfte, inte orsak.',
  },
  {
    id: 'koncessiv',
    name: 'Koncessiva',
    signal: 'trots att · fastän · även om · oaktat att · hur ... än',
    logic: 'Förväntat utfall uteblir',
    logicColor: 'text-red-400',
    desc: 'Det förväntade resultatet av en situation inträffar INTE. Kontrasten är stark — "fast A borde leda till B, ledde det inte till det."',
    ex: 'Trots att hon studerade hårt klarade hon inte provet.',
    trap: 'Skillnad: "trots att" (starkt koncessivt) vs "men" (svagt adversativt). "Trots att" antyder att resultatet är överraskande.',
  },
  {
    id: 'adversativ',
    name: 'Adversativa',
    signal: 'men · dock · däremot · likväl · å andra sidan',
    logic: 'Enkel kontrast',
    logicColor: 'text-orange-400',
    desc: 'Två saker ställs mot varandra, men utan det starka "förväntningsbrott" som koncessiva ger. En nyansering eller motpol.',
    ex: 'Projektet var dyrt, men resultaten var imponerande.',
    trap: '"Dock" och "däremot" är mer formella/skriftspråkliga än "men". HP väljer ofta "dock" i akademiska meningar.',
  },
  {
    id: 'additiv',
    name: 'Additiva',
    signal: 'dels...dels · inte bara...utan · dessutom · vidare · likaså',
    logic: 'Tillägg / Kombination',
    logicColor: 'text-sky-400',
    desc: 'Lägger till en eller flera likvärdiga faktorer. Ingen kontrast — allt stämmer och förstärker varandra.',
    ex: 'Reformerna genomfördes dels av ekonomiska skäl, dels av ideologiska.',
    trap: '"Dels...dels" = båda gäller parallellt. "Antingen...eller" = exklusivt val. Blanda dem inte.',
  },
  {
    id: 'proportionell',
    name: 'Proportionella',
    signal: 'ju...desto · alltmer · ju mer...desto mer',
    logic: 'Proportionell relation',
    logicColor: 'text-violet-400',
    desc: 'Ju mer A ökar, desto mer (eller mindre) förändras B. Relationen kan vara direkt (båda ökar) eller omvänd (en ökar, en minskar).',
    ex: 'Ju mer komplex organisationen är, desto svårare är det att fatta beslut.',
    trap: 'Grammatiken kräver "ju [komparativ]...desto [komparativ]". Fel: "ju mer...desto mycket". Rätt: "ju mer...desto fler".',
  },
  {
    id: 'konditionell',
    name: 'Konditionella',
    signal: 'om · förutsatt att · i den mån · given att · på villkor att',
    logic: 'Villkor → Konsekvens',
    logicColor: 'text-blue-400',
    desc: 'B gäller bara om A är uppfyllt. Villkoret kan vara realistiskt (om) eller starkt begränsande (förutsatt att).',
    ex: 'Förutsatt att finansieringen godkänns kan projektet starta i maj.',
    trap: '"Förutsatt att" är starkare än "om" — det antyder att villkoret är avgörande och osäkert.',
  },
  {
    id: 'temporal',
    name: 'Temporala',
    signal: 'när · medan · innan · sedan · efter att · så fort',
    logic: 'Tidsrelation',
    logicColor: 'text-[var(--color-ink-muted)]',
    desc: 'Beskriver när händelser inträffar i förhållande till varandra: samtidigt (medan), efter (sedan/efter att), före (innan).',
    ex: 'Medan hon presenterade rapportens slutsatser antecknade kollegorna intensivt.',
    trap: '"Medan" = simultant. "Sedan" = efter. Blanda dem inte i MEK-frågor om temporalt samband.',
  },
  {
    id: 'negation',
    name: 'Negativa',
    signal: 'varken...eller · inte...utan · ingalunda',
    logic: 'Dubbel negation / Ersättning',
    logicColor: 'text-red-300',
    desc: '"Varken...eller" negerar båda alternativen. "Inte...utan" ersätter det negerade med ett positivt alternativ.',
    ex: 'Utredningen lyckades varken fastställa orsaken eller föreslå en lösning.',
    trap: '"Inte...utan" är inte en enkel negation — den ersätter: "Inte arg, utan besviken." Läs noga.',
  },
  {
    id: 'alternativ',
    name: 'Alternativa',
    signal: 'antingen...eller · antingen...annars',
    logic: 'Exklusivt val',
    logicColor: 'text-teal-400',
    desc: 'Av två alternativ gäller exakt ett. Används när alternativen utesluter varandra.',
    ex: 'Antingen godkänner styrelsen förslaget, eller avvisas det helt.',
    trap: '"Dels...dels" vs "antingen...eller": dels = båda gäller, antingen = bara ett gäller. HP testar just den skillnaden.',
  },
  {
    id: 'konjunktiv',
    name: 'Konjunktiv (hypotetisk)',
    signal: 'som om...vore · som om...hade · om...vore',
    logic: 'Kontrafaktisk / Hypotetisk',
    logicColor: 'text-rose-400',
    desc: 'Beskriver en situation som INTE är verklig — man föreställer sig ett annat scenario. Kräver konjunktivformen av verbet.',
    ex: 'Han talade om framtidsplanerna som om de redan vore verklighet.',
    trap: '"Som om" + konjunktiv (vore/hade/vore). Ofta sätts "var" istället för "vore" — det är vardagsspråk men inte korrekt skriftspråk.',
  },
]

function Konjunktioner() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-5">
      <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
        MEK testar om du förstår den logiska relationen i en mening. Alla meningar bygger på ett av nedanstående mönster.
        Identifiera mönstret — välj rätt par.
      </p>

      <div className="space-y-2">
        {CONJUNCTION_TYPES.map(ct => (
          <div key={ct.id} className="card rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === ct.id ? null : ct.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className={`text-[10px] font-black uppercase tracking-widest w-24 shrink-0 ${ct.logicColor}`}>{ct.name}</span>
              <span className="text-xs text-[var(--color-ink-faint)] flex-1 truncate">{ct.signal}</span>
              <span className={`text-[var(--color-ink-faint)] text-sm transition-transform duration-200 ${open === ct.id ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {open === ct.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-card-border)]">
                <div className="flex items-center gap-2 mt-3">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${ct.logicColor}`}>{ct.logic}</span>
                </div>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{ct.desc}</p>
                <div className="bg-[var(--color-paper-dark)] rounded-lg px-3 py-2.5">
                  <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Exempelmening</div>
                  <p className="text-sm text-[var(--color-ink)] italic">"{ct.ex}"</p>
                </div>
                <div className="bg-amber-500/8 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <div className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mb-1">Vanlig fälla</div>
                  <p className="text-xs text-amber-200/80 leading-relaxed">{ct.trap}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card rounded-2xl p-4">
        <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-3">Snabbreferens</div>
        <div className="space-y-1.5">
          {[
            ['Orsak',       'eftersom, för att, därför att'],
            ['Kontrast (stark)', 'trots att, fastän, även om'],
            ['Kontrast (enkel)', 'men, dock, däremot'],
            ['Tillägg',     'dels...dels, inte bara...utan, dessutom'],
            ['Proportion',  'ju...desto'],
            ['Villkor',     'om, förutsatt att'],
            ['Negation',    'varken...eller, inte...utan'],
            ['Hypotetisk',  'som om...vore'],
          ].map(([typ, signal]) => (
            <div key={typ} className="flex items-baseline gap-2 text-xs">
              <span className="text-[var(--color-ink-faint)] w-32 shrink-0">{typ}</span>
              <span className="text-[var(--color-ink-muted)] font-mono">{signal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Strategi() {
  return (
    <div className="space-y-5">
      <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
        MEK handlar inte om att gissa — det handlar om att läsa meningens logiska struktur.
        Följ den här processen på varje fråga.
      </p>

      <div className="space-y-2">
        {[
          {
            n: '1',
            title: 'Hitta signalorden',
            body: 'Läs meningen och identifiera konjunktioner, adverbial eller strukturord: "trots att", "eftersom", "ju...desto", "dels...dels". Signalorden avslöjar vilken typ av logisk relation som råder.',
          },
          {
            n: '2',
            title: 'Bestäm relationen',
            body: 'Är det kausal (orsak-verkan), koncessiv (kontrast mot förväntan), additiv (tillägg) eller en annan relation? Skriv upp relationen mentalt: "X ORSAKar Y" eller "X TROTS att Y förväntas".',
          },
          {
            n: '3',
            title: 'Eliminera mot relationen',
            body: 'Stryk alla alternativ som bryter mot den identifierade relationen. Om meningen är kausalt uppbyggd kan koncessiva par inte vara rätt, oavsett hur logiskt innehållet låter.',
          },
          {
            n: '4',
            title: 'Kontrollera intern semantik i paret',
            body: 'Vid 2-lucksfrågor: de båda valda orden måste hänga ihop. "Infekterad debatt → blandat mottagande" är internt logiskt. "Populär åtgärd → negativt mottagande" är en självmotsägelse.',
          },
          {
            n: '5',
            title: 'Läs meningen högt mentalt',
            body: 'Klistra in alternativet och lyssna: låter det naturligt och grammatiskt rätt? Fel svar gnisslar ofta vid uppläsning.',
          },
        ].map(item => (
          <div key={item.n} className="card rounded-xl p-4 flex gap-3">
            <span className="text-lime-400 font-black text-sm shrink-0 w-4">{item.n}</span>
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)] mb-0.5">{item.title}</div>
              <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card rounded-2xl p-5 border border-lime-500/10">
        <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-3">Signalord → Relation (snabbkort)</div>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { signal: 'eftersom / för att / därför att', rel: '→ kausal (orsak leder till konsekvens)' },
            { signal: 'trots att / fastän / även om', rel: '→ koncessiv (förväntat resultat uteblir)' },
            { signal: 'men / dock / däremot', rel: '→ adversativ (enkel kontrast/nyansering)' },
            { signal: 'dels...dels / inte bara...utan', rel: '→ additiv (båda gäller parallellt)' },
            { signal: 'ju...desto', rel: '→ proportionell (A ökar ↔ B förändras)' },
            { signal: 'antingen...eller', rel: '→ alternativ (exakt ett av två gäller)' },
            { signal: 'varken...eller', rel: '→ negation (ingen av dem gäller)' },
            { signal: 'om / förutsatt att', rel: '→ konditionell (B gäller bara om A)' },
            { signal: 'som om...vore', rel: '→ konjunktiv (hypotetiskt, inte verkligt)' },
          ].map(({ signal, rel }) => (
            <div key={signal} className="text-xs flex gap-2">
              <span className="font-mono text-lime-300 shrink-0 min-w-[180px]">{signal}</span>
              <span className="text-[var(--color-ink-faint)]">{rel}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Ovning() {
  return (
    <div className="space-y-6">
      <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
        Följ analysen steg för steg. Identifiera signalord, bestäm relationen och välj rätt par.
      </p>

      {/* Exercise 1 */}
      <div className="card rounded-2xl p-5 border border-lime-500/10">
        <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-3">Övning 1 — Koncessiv</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4">
          <p className="text-sm text-[var(--color-ink)] mb-3">
            "Trots att rapporten var _______ i sin analys, fick den ett _______ mottagande av forskarvärlden."
          </p>
          <div className="space-y-1 text-xs text-[var(--color-ink-faint)]">
            <div>A — ytlig...negativt</div>
            <div>B — noggrann...kyligt</div>
            <div>C — välskriven...entusiastiskt</div>
            <div>D — bristfällig...positivt</div>
          </div>
        </div>
        <StepReveal steps={[
          { label: 'Steg 1 — Signalord', content: '"Trots att" är det koncessiva signalordnet. Det innebär att det förväntade resultatet inte inträffar — det sker ett förväntat brott.' },
          { label: 'Steg 2 — Relationen', content: '"Trots att [kvalitet på rapport] → [oväntat mottagande]." Det förväntade är: bra rapport → bra mottagande. Eller: dålig rapport → dåligt mottagande. Det oväntade måste bryta mot det.' },
          { label: 'Steg 3 — Eliminera', content: 'A (ytlig + negativt) = förväntat utfall, ingen kontrast. C (välskriven + entusiastiskt) = förväntat, ingen kontrast. B och D ger kontrast.' },
          { label: 'Steg 4 — Välj starkaste kontrasten', content: 'D: "bristfällig analys → positivt mottagande" = stark kontrast. B: "noggrann → kyligt" = svagare kontrast. D ger det tydligaste koncessiva mönstret.', result: '→ Svar: D' },
        ]} />
      </div>

      {/* Exercise 2 */}
      <div className="card rounded-2xl p-5 border border-lime-500/10">
        <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-3">Övning 2 — Kausal + intern logik</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4">
          <p className="text-sm text-[var(--color-ink)] mb-3">
            "Eftersom boken var _______ i sin presentation av källorna, fick den _______ kritik från forskarvärlden."
          </p>
          <div className="space-y-1 text-xs text-[var(--color-ink-faint)]">
            <div>A — noggrann...lite</div>
            <div>B — bristfällig...skarp</div>
            <div>C — utmärkt...välförtjänt</div>
            <div>D — komplex...blandad</div>
          </div>
        </div>
        <StepReveal steps={[
          { label: 'Steg 1 — Signalord', content: '"Eftersom" = kausal. Orsaken (hur boken var) leder direkt till konsekvensen (vilken kritik den fick). Ingen kontrast — rak orsak-verkan.' },
          { label: 'Steg 2 — Intern logik', content: 'Kausal = orsak → förväntad konsekvens. A: noggrann→lite kritik = logiskt men svagt. B: bristfällig→skarp kritik = stark kausal koppling. C: utmärkt→välförtjänt = logiskt men "välförtjänt" är diffust. D: komplex→blandad = möjligt men svagare.' },
          { label: 'Steg 3 — Välj starkaste kausala paret', content: 'B: bristfällig källhantering orsakar naturligt skarp kritik från forskarvärlden. Den kausala kopplingen är tydligast och mest realistisk.', result: '→ Svar: B' },
        ]} />
      </div>

      {/* Exercise 3 */}
      <div className="card rounded-2xl p-5 border border-lime-500/10">
        <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-3">Övning 3 — Proportionell (ju...desto)</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4">
          <p className="text-sm text-[var(--color-ink)] mb-3">
            "Ju mer komplex en organisation är, desto _______ är det att _______ snabba beslut."
          </p>
          <div className="space-y-1 text-xs text-[var(--color-ink-faint)]">
            <div>A — svårare...fatta</div>
            <div>B — viktigare...undvika</div>
            <div>C — lättare...motivera</div>
            <div>D — troligare...skjuta upp</div>
          </div>
        </div>
        <StepReveal steps={[
          { label: 'Steg 1 — Signalord', content: '"Ju...desto" = proportionell relation. Mer komplexitet → [komparativ] att [verb] beslut. Grammatiken kräver en komparativ form i "desto"-ledet.' },
          { label: 'Steg 2 — Riktning på relationen', content: 'Mer komplexitet i en organisation gör det SVÅRARE, inte lättare, att fatta beslut. Det är den realistiska riktningen.' },
          { label: 'Steg 3 — Kontrollera grammatik och semantik', content: 'A: "svårare...fatta" = korrekt komparativ + semantiskt logisk. B: "viktigare...undvika beslut" — man undviker inte beslut som organisationsregel. C: "lättare" är fel riktning.', result: '→ Svar: A' },
        ]} />
      </div>

      {/* Exercise 4 */}
      <div className="card rounded-2xl p-5 border border-lime-500/10">
        <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-3">Övning 4 — Additiv vs Alternativ</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4">
          <p className="text-sm text-[var(--color-ink)] mb-3">
            "Reformerna genomfördes _______ på ekonomiska grunder _______ av ideologiska skäl."
          </p>
          <div className="space-y-1 text-xs text-[var(--color-ink-faint)]">
            <div>A — dels...dels</div>
            <div>B — antingen...eller</div>
            <div>C — varken...eller</div>
            <div>D — inte...utan</div>
          </div>
        </div>
        <StepReveal steps={[
          { label: 'Steg 1 — Relationen', content: 'Reformerna hade TVÅ grunder: ekonomiska OCH ideologiska. Båda gäller parallellt — ingen exklusivt val.' },
          { label: 'Steg 2 — Matcha mot alternativ', content: 'A: dels...dels = båda gäller parallellt ✓. B: antingen...eller = bara ett gäller ✗. C: varken...eller = ingen grund gäller ✗. D: inte...utan = ersätter ett med ett annat ✗.' },
          { label: 'Steg 3 — Välj', content: '"Dels på ekonomiska grunder, dels av ideologiska skäl" — båda grunderna råder samtidigt. Klassiskt dels...dels-mönster.', result: '→ Svar: A' },
        ]} />
      </div>
    </div>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'konjunktioner', label: 'Konjunktioner' },
  { id: 'strategi',      label: 'Strategi' },
  { id: 'ovning',        label: 'Övning' },
]

export default function MekGuide() {
  const [tab, setTab] = useState<Tab>('konjunktioner')

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="MEK – Meningskomplettering" />

      {/* Hero */}
      <div className="border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 bg-lime-500/10 border border-lime-500/20 text-lime-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
            MEK · Meningskomplettering
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">MEK-guiden</h1>
          <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
            Alla konjunktionstyper som förekommer på HP, med signalord, logik och
            interaktiva övningar. Identifiera mönstret — välj rätt par.
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="sticky top-0 z-20 bg-[var(--color-paper)]/95 backdrop-blur-xl border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 flex">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${tab === t.id ? 'text-lime-400' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 inset-x-3 h-[2px] rounded-full bg-lime-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'konjunktioner' && <Konjunktioner />}
        {tab === 'strategi'      && <Strategi />}
        {tab === 'ovning'        && <Ovning />}
      </div>
    </div>
  )
}
