import { useState } from 'react'
import PageHeader from '../components/PageHeader'

type Tab = 'fragor' | 'strategi' | 'ovning'

function StepReveal({ steps }: { steps: { label: string; content: string; result?: string }[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-[var(--color-card-border)] bg-[var(--color-paper-dark)]' : 'border-[var(--color-card-border)] bg-[var(--color-card)]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? 'bg-[var(--color-green)] text-[var(--color-cream)]' : 'bg-[var(--color-paper-dark)] text-[var(--color-ink-faint)]'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[var(--color-ink-muted)] mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{step.content}</div>
                  {step.result && <div className="mt-1.5 text-xs font-bold text-[var(--color-green-light)]">{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-[var(--color-ink-faint)]">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className="shrink-0 text-[10px] text-[var(--color-green)] border border-[var(--color-card-border)] rounded-lg px-2 py-1 hover:bg-[var(--color-green-muted)] transition-colors">Visa</button>
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

const QUESTION_TYPES = [
  {
    id: 'huvudsyfte',
    name: 'Huvudsyfte / Tema',
    tag: 'Vad handlar texten om?',
    tagColor: 'text-[var(--color-green)]',
    desc: 'Frågan ber dig identifiera vad hela texten handlar om, eller vad författarens huvudbudskap är. Svaret ska täcka hela texten — inte bara ett stycke.',
    signal: '"Vad är textens huvudsyfte?" · "Vilket av följande bäst sammanfattar texten?" · "Vad vill författaren visa?"',
    trap: 'Välj inte ett alternativ som är sant men bara gäller ett stycke. Rätt svar täcker hela texten utan att vara för brett eller för smalt.',
  },
  {
    id: 'detaljer',
    name: 'Faktafrågor / Detaljer',
    tag: 'Vad säger texten om X?',
    tagColor: 'text-[var(--color-green-light)]',
    desc: 'Frågan ber dig hitta en specifik uppgift som uttryckligen nämns i texten. Svaret finns ordagrant eller parafraserat i texten.',
    signal: '"Enligt texten..." · "Vad nämner texten om..." · "Hur beskriver författaren..."',
    trap: 'Läs inte in egna tolkningar. Svaret ska ha ett direkt textbevis. Om du inte hittar beviset → leta i ett annat stycke.',
  },
  {
    id: 'slutledning',
    name: 'Slutledning / Implikation',
    tag: 'Vad kan man dra för slutsats?',
    tagColor: 'text-[var(--color-green)]',
    desc: 'Texten säger inte svaret rakt ut — du ska dra en logisk slutsats från vad som står. Slutledningen ska vara direkt underbyggd av texten, inte bygga på allmänkunskap.',
    signal: '"Vad kan man dra för slutsats av...?" · "Vad antyder texten om...?" · "Vad kan man anta utifrån texten?"',
    trap: 'Håll slutledningen nära texten. Alternativ som är rimliga ur allmänkunskapsperspektiv men inte stöds av texten är fel.',
  },
  {
    id: 'forfatterens_stall',
    name: 'Författarens inställning / Ton',
    tag: 'Vilken ton/attityd har författaren?',
    tagColor: 'text-[var(--color-green)]',
    desc: 'Frågan ber dig bedöma hur författaren ställer sig till ämnet: kritisk, neutral, entusiastisk, ironisk, reserverad etc. Ledtrådarna finns i ordval och formuleringar.',
    signal: '"Hur ställer sig författaren till...?" · "Vilken ton präglar texten?" · "Vad avslöjar ordvalet om..."',
    trap: 'Tolka ordval som "märkligt nog", "tyvärr" eller "man bör fråga sig" som attitydsignaler. Välj inte "neutral" om texten innehåller värdeladdade ord.',
  },
  {
    id: 'ordbet',
    name: 'Ordbetydelse i kontext',
    tag: 'Vad betyder ordet X i sammanhanget?',
    tagColor: 'text-[var(--color-green-light)]',
    desc: 'Frågan ber dig förklara vad ett ord eller uttryck betyder i just det sammanhanget — inte dess ordbok-definition. Kontexten avgör.',
    signal: '"I texten syftar [ord] närmast på..." · "Vad avses med uttrycket... i det här sammanhanget?"',
    trap: 'Det vanligaste ordbok-alternativet är ofta fel. Läs hela meningen och stycket runt ordet — kontexten avgör.',
  },
  {
    id: 'struktur',
    name: 'Textstruktur / Argumentation',
    tag: 'Hur är texten uppbyggd?',
    tagColor: 'text-[var(--color-ink-muted)]',
    desc: 'Frågan ber dig förstå hur texten är strukturerad: problemlösning, tes-antites-syntes, kronologisk beskrivning, för-och-nackdelar etc.',
    signal: '"Hur är texten strukturerad?" · "Vad är syftet med det sista stycket?" · "Vilken funktion fyller exemplet i stycke 2?"',
    trap: 'Läs inledning och avslutning noga — de avslöjar ofta textens övergripande struktur. Exempel används vanligen för att illustrera, inte bevis.',
  },
]

function Fragor() {
  const [open, setOpen] = useState<string | null>(null)
  return (
    <div className="space-y-5">
      <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
        LÄS-frågor återkommer i ett begränsat antal typer. Identifiera frågetypen — du vet genast var i texten du ska leta.
      </p>

      <div className="space-y-2">
        {QUESTION_TYPES.map(qt => (
          <div key={qt.id} className="card rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === qt.id ? null : qt.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className={`text-[10px] font-black uppercase tracking-widest w-28 shrink-0 leading-tight ${qt.tagColor}`}>{qt.name}</span>
              <span className="text-xs text-[var(--color-ink-faint)] flex-1 truncate">{qt.tag}</span>
              <span className={`text-[var(--color-ink-faint)] text-sm transition-transform duration-200 ${open === qt.id ? 'rotate-180' : ''}`}>▾</span>
            </button>
            {open === qt.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-card-border)]">
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed mt-3">{qt.desc}</p>
                <div className="bg-[var(--color-paper-dark)] rounded-lg px-3 py-2.5">
                  <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Signalfrågor</div>
                  <p className="text-xs text-[var(--color-ink-muted)] italic">{qt.signal}</p>
                </div>
                <div className="bg-[var(--color-gold-muted)] border border-[var(--color-card-border)] rounded-lg px-3 py-2.5">
                  <div className="text-[9px] font-bold text-[var(--color-gold-deep)] uppercase tracking-widest mb-1">Vanlig fälla</div>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{qt.trap}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card rounded-2xl p-4">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Snabbreferens — frågetyp → sökstrategi</div>
        <div className="space-y-1.5">
          {[
            ['Huvudsyfte', 'Täcker hela texten — läs inledning + avslutning'],
            ['Faktafråga', 'Hitta textbevis — specifikt stycke eller mening'],
            ['Slutledning', 'Logisk slutsats nära texten — inte allmänkunskap'],
            ['Författarens ton', 'Värdeladdade ord, modifierare, ironiska fraser'],
            ['Ordbetydelse', 'Hela meningen + styckets kontext avgör'],
            ['Textstruktur', 'Inledning, avslutning, styckesfunktioner'],
          ].map(([typ, taktik]) => (
            <div key={typ} className="flex items-baseline gap-2 text-xs">
              <span className="text-[var(--color-ink-faint)] w-32 shrink-0">{typ}</span>
              <span className="text-[var(--color-ink-muted)]">{taktik}</span>
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
        LÄS ger ~120 s per fråga — gott om tid om du läser rätt. Följ den här processen för varje text.
      </p>

      <div className="space-y-2">
        {[
          {
            n: '1',
            title: 'Läs frågorna först (30 sek)',
            body: 'Skumma de 4–6 frågorna innan du läser texten. Du vet nu vad du letar efter. Markera nyckelord i frågorna mentalt.',
          },
          {
            n: '2',
            title: 'Läs texten aktivt',
            body: 'Läs hela texten en gång. Markera mentalt (eller på ett lästillfälle med papper: faktiskt) var svar på varje frågetyp verkar finnas. Fokus: inledning, avslutning, och meningar med signalord.',
          },
          {
            n: '3',
            title: 'Hitta textbevis',
            body: 'För varje fråga: gå tillbaka till texten och hitta den mening eller det stycke som stödjer svaret. Inga textbevis → stryk alternativet.',
          },
          {
            n: '4',
            title: 'Eliminera extrema formuleringar',
            body: '"Alltid", "aldrig", "alla", "ingen", "omöjligt" — extrema ord är nästan alltid fel i LÄS. Texten uttrycker sig sällan absolut.',
          },
          {
            n: '5',
            title: 'Akta din allmänbildning',
            body: 'LÄS testar om du kan läsa texten — inte om du vet sant om ämnet i verkligheten. Välj svaret som texten stödjer, även om det verkar konstigt.',
          },
          {
            n: '6',
            title: 'Parafras, inte ordagrann citering',
            body: 'Rätt svar omformulerar ofta textens innehåll med andra ord. Alternativ som citerar texten ordagrant kan sakna rätt kontext.',
          },
        ].map(item => (
          <div key={item.n} className="card rounded-xl p-4 flex gap-3">
            <span className="text-[var(--color-green)] font-black text-sm shrink-0 w-4">{item.n}</span>
            <div>
              <div className="text-sm font-semibold text-[var(--color-ink)] mb-0.5">{item.title}</div>
              <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-green-muted)] border border-[var(--color-card-border)] rounded-xl p-4">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-1.5">Tidsbudget per text</div>
        <div className="space-y-1.5 text-xs">
          {[
            ['Läs frågorna', '~30 sek'],
            ['Läs texten', '~2 min'],
            ['Svara på 5 frågor', '~5 min'],
            ['Totalt per text', '~7–8 min'],
          ].map(([steg, tid]) => (
            <div key={steg} className="flex justify-between">
              <span className="text-[var(--color-ink-muted)]">{steg}</span>
              <span className="text-[var(--color-green-light)] font-mono">{tid}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Signalord i svenska texter</div>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { signal: 'dock / emellertid / likväl', rel: '→ kontrast eller nyansering av föregående påstående' },
            { signal: 'följaktligen / således / därför', rel: '→ slutsats dras från det föregående' },
            { signal: 'dessutom / vidare / likaså', rel: '→ ytterligare ett argument läggs till' },
            { signal: 'trots att / oaktat / fastän', rel: '→ förväntat resultat uteblir' },
            { signal: 'exempelvis / till exempel', rel: '→ ett exempel illustreras, inte ett bevis' },
            { signal: 'sammanfattningsvis / avslutningsvis', rel: '→ slutsatsen är nära — fokusera här för huvudsyfte' },
          ].map(({ signal, rel }) => (
            <div key={signal} className="text-xs flex gap-2">
              <span className="font-mono text-[var(--color-green-light)] shrink-0 min-w-[180px]">{signal}</span>
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
        Öva på att identifiera frågetyp, hitta textbevis och eliminera fel alternativ.
      </p>

      {/* Exercise 1 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 1 — Faktafråga</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (utdrag)</div>
          <p>Forskning visar att regelbunden sömn om 7–9 timmar per natt förbättrar kognitiv prestanda markant. Studier på universitetsstudenter visade att de som sov under 6 timmar fick 30% sämre resultat på minnestester, medan de som sov mer än 9 timmar inte visade ytterligare förbättring jämfört med 7–9-gruppen.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: Vad visade studierna om studenter som sov under 6 timmar?</div>
        <StepReveal steps={[
          { label: 'Steg 1 — Identifiera frågetypen', content: 'Detta är en faktafråga: "vad visade studierna" — svaret finns ordagrant i texten. Inget tolkningsutrymme behövs.' },
          { label: 'Steg 2 — Hitta textbevis', content: 'Meningen "de som sov under 6 timmar fick 30% sämre resultat på minnestester" är det direkta textbeviset.', result: '→ Textbevis: 30% sämre minnesresultat' },
          { label: 'Steg 3 — Välj rätt svar', content: 'Rätt alternativ ska parafrasera: sämre kognitiv prestanda / sämre minnesresultat. Alternativ som nämner "total sömnbrist" eller "inga effekter" saknar textbevis.', result: '→ Välj alternativ om 30% försämrat minnesresultat' },
        ]} />
      </div>

      {/* Exercise 2 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 2 — Slutledning</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (utdrag)</div>
          <p>Det biologiska arvet spelar en avgörande roll för individens intelligens, men miljön — uppväxt, utbildning och sociala faktorer — kan modifiera dess uttryck i hög grad. Tvillingstudier visar att identiska tvillingar uppvuxna i skilda miljöer har mätbart olika kognitiva profiler.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: Vad kan man dra för slutsats om förhållandet mellan arv och miljö?</div>
        <StepReveal steps={[
          { label: 'Steg 1 — Identifiera frågetypen', content: '"Vad kan man dra för slutsats" = slutledningsfråga. Svaret är inte ordagrant i texten — du ska dra en logisk slutsats.' },
          { label: 'Steg 2 — Identifiera textens kärna', content: 'Texten säger: arv är avgörande MEN miljö kan modifiera. Tvillingar i skilda miljöer skiljer sig. Slutsatsen: BÅDE arv och miljö påverkar.' },
          { label: 'Steg 3 — Eliminera extrema alternativ', content: '"Bara arv avgör" är fel (texten betonar miljön). "Bara miljö avgör" är fel (texten nämner arv som avgörande). "Arv och miljö samverkar" är rätt slutsats.', result: '→ Välj alternativet om samspel mellan arv och miljö' },
        ]} />
      </div>

      {/* Exercise 3 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 3 — Ordbetydelse i kontext</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (utdrag)</div>
          <p>Projektets framgång berodde på teamets förmåga att navigera de <strong>labyrintiska</strong> byråkratiska processerna utan att tappa fart.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: I texten syftar "labyrintiska" närmast på att processerna var:</div>
        <StepReveal steps={[
          { label: 'Steg 1 — Läs kontexten', content: '"Navigera ... processerna utan att tappa fart" — det krävdes navigationsförmåga för att inte sakta ner. Labyrint = komplex, svår att hitta igenom.' },
          { label: 'Steg 2 — Ordbok vs kontext', content: 'Ordbok: labyrintisk = liknar en labyrint. Men i kontexten: processerna var svårnavigerade och komplexa. Det är kontextbetydelsen som testas.' },
          { label: 'Steg 3 — Välj rätt', content: '"Komplicerade och svåröverskådliga" matchar kontexten bäst. "Långa och tidsödande" är möjligt men fokuserar på tid, inte komplexitet. "Onödiga" saknar textbevis.', result: '→ Välj alternativ om komplexa/svårnavigerade processer' },
        ]} />
      </div>

      {/* Exercise 4 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 4 — Undvika extrema formuleringar</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (utdrag)</div>
          <p>De flesta klimatforskare är överens om att mänsklig aktivitet bidrar till den globala uppvärmningen. Enstaka röster inom forskarvärlden ifrågasätter dock konsensus, och debatten om metodologiska frågor fortsätter.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Välj det alternativ som bäst stämmer med textens innehåll:</div>
        <StepReveal steps={[
          { label: 'Identifiera extrema formuleringar i alternativen', content: '"Alla klimatforskare är eniga" — texten säger "de flesta" och nämner enstaka ifrågasättanden → fel. "Ingen forskar ifrågasätter" → fel. "Det råder debatt om metodologi" → textbevis finns direkt.' },
          { label: 'Matcha mot texten', content: 'Texten säger: (1) de flesta är överens om mänsklig påverkan, (2) enstaka ifrågasätter, (3) metodologisk debatt pågår. Rätt svar ska fånga nyansen — konsensus finns men debatt pågår.' },
          { label: 'Välj rätt', content: 'Alternativet som beskriver brett stöd för mänsklig påverkan men med pågående metodologisk debatt matchar texten exakt.', result: '→ Välj alternativet om brett (men inte absolut) stöd + pågående debatt' },
        ]} />
      </div>
    </div>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'fragor',   label: 'Frågetyper' },
  { id: 'strategi', label: 'Strategi' },
  { id: 'ovning',   label: 'Övning' },
]

export default function LasGuide() {
  const [tab, setTab] = useState<Tab>('fragor')

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="LÄS – Läsförståelse" />

      {/* Hero */}
      <div className="border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 bg-[var(--color-green-muted)] border border-[var(--color-card-border)] text-[var(--color-green)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
            LÄS · Läsförståelse
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">LÄS-guiden</h1>
          <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
            Alla frågetyper på HP-LÄS, med sökstrategi, signalord och interaktiva övningar.
            Hitta textbeviset — välj rätt alternativ.
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
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${tab === t.id ? 'text-[var(--color-green)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {t.label}
              {tab === t.id && (
                <span className="absolute bottom-0 inset-x-3 h-[2px] rounded-full bg-[var(--color-green)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'fragor'   && <Fragor />}
        {tab === 'strategi' && <Strategi />}
        {tab === 'ovning'   && <Ovning />}
      </div>
    </div>
  )
}
