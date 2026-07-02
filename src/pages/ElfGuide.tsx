import { useState } from 'react'
import PageHeader from '../components/PageHeader'

type Tab = 'falsefriends' | 'strategi' | 'ovning'

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

const FALSE_FRIENDS = [
  { eng: 'Eventually',      sv_right: 'Till slut / slutligen',    sv_wrong: 'Eventuellt',          note: '"Eventually it happened" = det hände till slut, inte möjligen.' },
  { eng: 'Actual / Actually', sv_right: 'Verklig / Faktiskt',     sv_wrong: 'Aktuell / Aktuellt',  note: '"The actual problem" = det verkliga problemet.' },
  { eng: 'Sensible',        sv_right: 'Förnuftig / Klok',         sv_wrong: 'Sensibel / Känslig',  note: '"A sensible approach" = ett förnuftigt tillvägagångssätt.' },
  { eng: 'Sympathetic',     sv_right: 'Förstående / Medkännande', sv_wrong: 'Sympatisk',           note: '"She was sympathetic" = hon visade förståelse, inte att hon var omtyckt.' },
  { eng: 'Pretend',         sv_right: 'Låtsas',                   sv_wrong: 'Hävda / Påstå',       note: '"He pretended to be ill" = han låtsades vara sjuk.' },
  { eng: 'Argue',           sv_right: 'Hävda / Argumentera',      sv_wrong: 'Bråka',               note: 'I akademiska texter: "the author argues that" = hävdar/argumenterar, inte bråkar.' },
  { eng: 'Prospect',        sv_right: 'Utsikt / Möjlighet',       sv_wrong: 'Prospekt (dokument)', note: '"The prospect of success" = utsikten till framgång.' },
  { eng: 'Consistent',      sv_right: 'Konsekvent / Sammanhängande', sv_wrong: 'Konsistent',       note: '"A consistent argument" = ett sammanhängande/konsekvent argument.' },
  { eng: 'Confident',       sv_right: 'Säker / Övertygad',        sv_wrong: 'Konfidentiell',       note: '"She was confident" = hon var övertygad, inte hemlighetsfull.' },
  { eng: 'Comprehensive',   sv_right: 'Heltäckande / Ingående',   sv_wrong: 'Begriplig',           note: '"A comprehensive study" = en heltäckande studie.' },
  { eng: 'Significant',     sv_right: 'Betydande / Viktig',       sv_wrong: 'Signifikant (statistisk)', note: 'I allmäntext: "significant changes" = viktiga/märkbara förändringar.' },
  { eng: 'Elaborate',       sv_right: 'Utarbeta / Utveckla',      sv_wrong: 'Elaborera',           note: '"Please elaborate" = utveckla/förklara mer, inte det formella svenska "elaborera".' },
]

const DISCOURSE_MARKERS = [
  { eng: 'However / Nevertheless / Yet',    logic: 'Kontrast',     sv: 'Dock / Ändå / Men' },
  { eng: 'Therefore / Thus / Hence',        logic: 'Slutsats',     sv: 'Därför / Alltså / Följaktligen' },
  { eng: 'Furthermore / Moreover / Also',   logic: 'Tillägg',      sv: 'Dessutom / Vidare' },
  { eng: 'Although / Despite / Even though',logic: 'Koncessiv',    sv: 'Fastän / Trots att / Även om' },
  { eng: 'For instance / For example',      logic: 'Exempel',      sv: 'Till exempel / Exempelvis' },
  { eng: 'In contrast / On the other hand', logic: 'Kontrast (stark)', sv: 'I kontrast till / Å andra sidan' },
  { eng: 'In other words / That is',        logic: 'Omformulering', sv: 'Med andra ord / Det vill säga' },
  { eng: 'In conclusion / To sum up',       logic: 'Sammanfattning', sv: 'Sammanfattningsvis / Avslutningsvis' },
]

function FalseFriends() {
  const [filter, setFilter] = useState('')
  const filtered = filter
    ? FALSE_FRIENDS.filter(ff =>
        ff.eng.toLowerCase().includes(filter.toLowerCase()) ||
        ff.sv_right.toLowerCase().includes(filter.toLowerCase()) ||
        ff.sv_wrong.toLowerCase().includes(filter.toLowerCase())
      )
    : FALSE_FRIENDS

  return (
    <div className="space-y-5">
      <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
        False friends är engelska ord som liknar svenska ord men har annan innebörd.
        De är en av de vanligaste felkällorna på ELF.
      </p>

      <input
        type="text"
        placeholder="Sök ord..."
        value={filter}
        onChange={e => setFilter(e.target.value)}
        className="w-full bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-card-border)]"
      />

      <div className="space-y-2">
        {filtered.map(ff => (
          <div key={ff.eng} className="card rounded-xl p-4">
            <div className="flex items-start justify-between gap-4 mb-2">
              <span className="font-black text-[var(--color-green)] text-base">{ff.eng}</span>
              <div className="text-right text-xs">
                <div className="text-[var(--color-success)] font-semibold">✓ {ff.sv_right}</div>
                <div className="text-red-400/70 line-through mt-0.5">✗ {ff.sv_wrong}</div>
              </div>
            </div>
            <p className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{ff.note}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center text-xs text-[var(--color-ink-faint)] py-4">Inga träffar för "{filter}"</div>
        )}
      </div>

      <div className="card rounded-2xl p-4">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Diskursmarkörer — textens logik</div>
        <div className="space-y-1.5">
          {DISCOURSE_MARKERS.map(dm => (
            <div key={dm.eng} className="grid grid-cols-3 gap-2 text-xs items-baseline">
              <span className="font-mono text-[var(--color-green-light)] text-[11px] leading-tight">{dm.eng.split(' / ')[0]}</span>
              <span className={`font-bold text-[10px] ${
                dm.logic === 'Kontrast' || dm.logic === 'Kontrast (stark)' ? 'text-[var(--color-terracotta)]' :
                dm.logic === 'Slutsats' ? 'text-[var(--color-terracotta)]' :
                dm.logic === 'Tillägg' ? 'text-[var(--color-ink-muted)]' :
                dm.logic === 'Koncessiv' ? 'text-[var(--color-terracotta)]' :
                dm.logic === 'Sammanfattning' ? 'text-[var(--color-green)]' :
                'text-[var(--color-ink-muted)]'
              }`}>{dm.logic}</span>
              <span className="text-[var(--color-ink-faint)]">{dm.sv}</span>
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
        ELF är strukturellt identisk med LÄS — samma frågetyper, samma tidsbudget, samma metod.
        Den enda skillnaden: texten är på engelska. Frågorna är alltid på svenska.
      </p>

      <div className="space-y-2">
        {[
          {
            n: '1',
            title: 'Läs frågorna på svenska först',
            body: 'Frågorna är på svenska — läs dem noga innan du går till den engelska texten. Du vet vad du letar efter och slipper förstå varje ord i texten.',
          },
          {
            n: '2',
            title: 'Lita på diskursmarkörerna',
            body: '"However" signalerar kontrast. "Therefore" signalerar slutsats. "Although" = koncessiv. Markörerna guidar dig genom textens logik även om enskilda ord är okända.',
          },
          {
            n: '3',
            title: 'Okänt ord? Läs kontexten',
            body: 'Förstår du inte ett ord i texten? Läs meningen runt det — akademisk engelska är ofta uppbyggd så att svåra ord förklaras med omgivande kontext.',
          },
          {
            n: '4',
            title: 'Parafrasera i din hjärna',
            body: 'När du läser ett stycke, sammanfatta det mentalt på svenska. Det bekräftar att du förstått och gör det lättare att matcha mot svarsalternativen.',
          },
          {
            n: '5',
            title: 'Akta false friends',
            body: '"Eventually" är inte "eventuellt". "Argue" i akademisk text = "hävda", inte "bråka". Ord som liknar svenska ord är de farligaste — kontrollera alltid via kontext.',
          },
          {
            n: '6',
            title: 'Samma elimineringsregler som LÄS',
            body: '"Always", "never", "all", "none" i svarsalternativ — extrema formuleringar är nästan alltid fel. Texten nyanserar sig.',
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
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-2">Akademisk engelska — vanliga mönster</div>
        <div className="space-y-1.5 text-xs">
          {[
            ['"The study suggests that..."', 'Försiktig slutsats — inte ett faktapåstående'],
            ['"It can be argued that..."', 'Författaren presenterar en tes — inte nödvändigtvis sann'],
            ['"Contrary to popular belief..."', 'Vad som följer är överraskande/kontraintuitivt'],
            ['"While X, Y..."', 'Koncessiv struktur — X är sant, men Y nyanserar'],
            ['"This is not to say that..."', 'Begränsning av ett påstående — viktig nyans följer'],
          ].map(([mönster, förklaring]) => (
            <div key={mönster} className="flex flex-col gap-0.5">
              <span className="font-mono text-[var(--color-green-light)] text-[11px]">{mönster}</span>
              <span className="text-[var(--color-ink-faint)] text-[11px]">{förklaring}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Textstruktur i akademisk engelska</div>
        <div className="space-y-2">
          {[
            { del: 'Introduction', funktion: 'Tes eller problemformulering presenteras — ofta är textens huvudsyfte här' },
            { del: 'Body paragraph', funktion: 'Argument, bevis eller exempel. Varje stycke har vanligtvis en kärnmening (topic sentence) i början' },
            { del: 'Concession + counter', funktion: '"Although X... Y" — erkänn motargument och bemöt det. Texten verkar balanserad men stödjer fortfarande en tes' },
            { del: 'Conclusion', funktion: 'Sammanfattning och slutsats. Läs detta för "vad är textens slutsats"-frågor' },
          ].map(({ del, funktion }) => (
            <div key={del} className="flex gap-3 text-xs">
              <span className="font-bold text-[var(--color-green-light)] w-24 shrink-0">{del}</span>
              <span className="text-[var(--color-ink-faint)] leading-relaxed">{funktion}</span>
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
        Öva på att navigera engelska texter med svenska frågor — identifiera diskursmarkörer och undvik false friends.
      </p>

      {/* Exercise 1 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 1 — Diskursmarkör</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (excerpt)</div>
          <p>The industrial revolution brought unprecedented economic growth. <strong>However</strong>, the rapid urbanization that followed created significant social inequalities and public health challenges that would persist for decades.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: Vad antyder texten om industrialiseringen?</div>
        <StepReveal steps={[
          { label: 'Identifiera diskursmarkören', content: '"However" = kontrast/men. Texten ger en positiv aspekt (ekonomisk tillväxt) och kontrasterar med negativa konsekvenser.' },
          { label: 'Läs helheten', content: 'Texten säger: stor ekonomisk tillväxt DOCK sociala ojämlikheter och hälsoproblem som varade länge. Det är en nyanserad bild — inte enbart positiv.' },
          { label: 'Välj rätt alternativ', content: 'Rätt svar ska återspegla kontrasten: ekonomisk framgång kombinerat med sociala problem. "Industrialiseringen var enbart positiv" ignorerar "however". "Industrialiseringen var enbart negativ" ignorerar första meningen.', result: '→ Välj alternativet om att industrialiseringen hade både fördelar och nackdelar' },
        ]} />
      </div>

      {/* Exercise 2 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 2 — False friend i kontext</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (excerpt)</div>
          <p>The researchers were <strong>confident</strong> in their methodology and <strong>eventually</strong> published their findings after three years of peer review.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: Vad kan man säga om forskarnas inställning och publiceringstidpunkt?</div>
        <StepReveal steps={[
          { label: 'Identifiera false friends', content: '"Confident" ≠ "konfidentiell". "Confident" = säker/övertygad. "Eventually" ≠ "eventuellt". "Eventually" = till slut/slutligen.' },
          { label: 'Applicera rätt betydelse', content: 'Rätt läsning: forskarna var ÖVERTYGADE om sin metod och publicerade TILL SLUT (efter 3 år av peer review).' },
          { label: 'Välj rätt', content: 'Alternativ som säger "konfidentiella" eller "möjligen publicerade" är fel. Rätt svar beskriver övertygade forskare som publicerade efter lång process.', result: '→ Välj alternativet om övertygade forskare som till slut publicerade' },
        ]} />
      </div>

      {/* Exercise 3 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 3 — Försiktig slutsats ("suggests")</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (excerpt)</div>
          <p>The data <strong>suggests</strong> a correlation between screen time and reduced sleep quality among adolescents. This does <strong>not</strong> imply a direct causal relationship, as other lifestyle factors may contribute.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: Vad kan man dra för slutsats om sambandet mellan skärmtid och sömn?</div>
        <StepReveal steps={[
          { label: 'Läs "suggests" och "not imply"', content: '"Suggests" = antyder/tyder på — en försiktig, inte definitiv slutsats. "Does not imply causal relationship" = texten nekar till orsakssamband.' },
          { label: 'Identifiera vad texten faktiskt påstår', content: 'Det finns en korrelation (samband). Men orsakssamband är inte etablerat. Andra faktorer kan spela in.' },
          { label: 'Eliminera extrema alternativ', content: '"Skärmtid orsakar sämre sömn" är för starkt (texten nekar till kausalitet). "Inget samband finns" är fel (korrelation finns). Rätt: ett samband finns men orsaken är oklar.', result: '→ Välj alternativet om korrelation utan bevisat orsakssamband' },
        ]} />
      </div>

      {/* Exercise 4 */}
      <div className="card rounded-2xl p-5 border border-[var(--color-card-border)]">
        <div className="text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-3">Övning 4 — Identifiera textens ton</div>
        <div className="bg-[var(--color-paper-dark)] rounded-xl p-4 mb-4 text-xs text-[var(--color-ink-muted)] leading-relaxed">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Text (excerpt)</div>
          <p>While proponents argue that artificial intelligence will create new employment opportunities, critics <strong>rightly</strong> point out that the transition period will inevitably displace millions of workers with insufficient support systems in place.</p>
        </div>
        <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Fråga: Hur ställer sig författaren till kritikernas syn?</div>
        <StepReveal steps={[
          { label: 'Hitta attitydsignalen', content: '"Critics rightly point out" — ordet "rightly" (rättmätigt/med rätta) är en tydlig attitydsignal. Författaren instämmer med kritikerna.' },
          { label: 'Läs hela meningens struktur', content: '"While proponents argue... critics rightly point out..." = koncessiv struktur. Förespråkarnas argument presenteras men kritikernas ges mer tyngd via "rightly".' },
          { label: 'Välj rätt ton', content: 'Författaren är inte neutral — "rightly" visar tydlig sympati med kritikerna. Alternativ som säger "neutral" eller "stödjer förespråkarna" är fel.', result: '→ Välj alternativet om att författaren instämmer med/stödjer kritikerna' },
        ]} />
      </div>
    </div>
  )
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'falsefriends', label: 'False Friends' },
  { id: 'strategi',     label: 'Strategi' },
  { id: 'ovning',       label: 'Övning' },
]

export default function ElfGuide() {
  const [tab, setTab] = useState<Tab>('falsefriends')

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="ELF – Engelsk läsförståelse" />

      {/* Hero */}
      <div className="border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 bg-[var(--color-green-muted)] border border-[var(--color-card-border)] text-[var(--color-green)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)]" />
            ELF · Engelsk läsförståelse
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">ELF-guiden</h1>
          <p className="text-[var(--color-ink-muted)] text-sm leading-relaxed">
            False friends, akademisk engelska och textstruktur för HP-ELF.
            Frågorna är på svenska — texten på engelska.
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
        {tab === 'falsefriends' && <FalseFriends />}
        {tab === 'strategi'     && <Strategi />}
        {tab === 'ovning'       && <Ovning />}
      </div>
    </div>
  )
}
