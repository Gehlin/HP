import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'

type Tab = 'amnen' | 'strategi' | 'formler'

const TOPICS = [
  {
    id: 'algebra',
    name: 'Algebra & ekvationer',
    icon: '∑',
    color: 'text-violet-400',
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    freq: 'Hög',
    freqColor: 'text-red-400',
    approach: 'Isolera variabeln. Testa svarsalternativen baklänges (plug-in) vid svåra ekvationer. Vid ekvationssystem: eliminationsmetoden är snabbare än substitution.',
    patterns: ['Linjära ekvationer: ax + b = c', 'Kvadratiska: x² + bx + c = 0 → pq-formeln', 'Ekvationssystem: 2 ekvationer, 2 okända', 'Olikheter: byt tecken vid multiplikation med negativt tal'],
    trap: 'Vid kvadratiska ekvationer — glöm inte att x kan ha två lösningar. Kontrollera om frågan frågar om "minsta" eller "största" värdet.',
  },
  {
    id: 'procent',
    name: 'Procent & ekonomi',
    icon: '%',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    freq: 'Hög',
    freqColor: 'text-red-400',
    approach: 'Multiplikationsfaktorn är din bästa vän: +20% = ×1,20. Kedjeberäkningar: multiplicera faktorerna. Undvik att beräkna procentbelopp separat om det inte behövs.',
    patterns: ['X% av Y = X/100 × Y', 'Förändring: nytt = gammalt × (1 ± p/100)', 'Omvänd %-beräkning: gammalt = nytt / (1 + p/100)', 'Kedja: 10% upp + 10% ner = 1,10 × 0,90 = 0,99 (−1%)'],
    trap: 'Procent är relativt, inte absolut. "10% upp och sedan 10% ner" ger inte 0% förändring totalt — det ger −1%.',
  },
  {
    id: 'sannolikhet',
    name: 'Sannolikhet & kombinatorik',
    icon: '⚀',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    freq: 'Medel',
    freqColor: 'text-amber-400',
    approach: 'Rita ett träd eller ett Venn-diagram vid sammansatta händelser. Multiplicera oberoende sannolikheter. Vid kombinatorik: tänk "hur många val har jag vid varje steg?"',
    patterns: ['P(A och B oberoende) = P(A) × P(B)', 'P(A eller B) = P(A) + P(B) − P(A och B)', 'Permutationer: n! / (n−k)!', 'Kombinationer: n! / (k! × (n−k)!)'],
    trap: 'Skilja på "med återläggning" och "utan återläggning". Vid kortspel och urval utan återläggning minskar täljaren och nämnaren för varje drag.',
  },
  {
    id: 'geometri',
    name: 'Geometri & area',
    icon: '△',
    color: 'text-amber-400',
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    freq: 'Hög',
    freqColor: 'text-red-400',
    approach: 'Rita alltid en figur — den ger dig insikter som texten döljer. Märk ut alla givna mått. Pythagoras används mer frekvent än du tror på HP.',
    patterns: ['Area triangel: bh/2', 'Area cirkel: πr²', 'Omkrets cirkel: 2πr', 'Pythagoras: a² + b² = c²', 'Area parallellogram: bh'],
    trap: 'Höjden i en triangel är alltid vinkelrät mot basen — inte en av sidorna, om inte rätvinklig triangel. Blanda inte ihop sida och höjd.',
  },
  {
    id: 'statistik',
    name: 'Statistik & data',
    icon: 'x̄',
    color: 'text-rose-400',
    bg: 'bg-rose-500/8',
    border: 'border-rose-500/20',
    freq: 'Medel',
    freqColor: 'text-amber-400',
    approach: 'Medelvärde kräver summa, inte ordning. Median kräver ordning men inte exakta värden (vet bara att mitten är X). Typvärde = mest frekvent värde.',
    patterns: ['Medelvärde = summa / antal', 'Median = mittersta värdet (sorterat)', 'Typvärde = vanligaste värdet', 'Spridning: max − min'],
    trap: 'Medelvärde påverkas av extremvärden (outliers); median gör det inte. En fråga kan ge data som "ser ut" att ge ett medelvärde men i verkligheten frågar om medianen.',
  },
  {
    id: 'funktioner',
    name: 'Funktioner & koordinater',
    icon: 'f(x)',
    color: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500/8',
    border: 'border-fuchsia-500/20',
    freq: 'Medel',
    freqColor: 'text-amber-400',
    approach: 'En rät linjes ekvation: y = kx + m. k = lutning (rise/run). m = y-intercept. Identifiera skärningspunkter algebraiskt (sätt ekvationerna lika).',
    patterns: ['Rät linje: y = kx + m', 'Lutning: k = (y₂−y₁)/(x₂−x₁)', 'Skärning med x-axeln: sätt y=0', 'Skärning med y-axeln: sätt x=0'],
    trap: 'Negativ lutning = linjen lutar nedåt (från vänster till höger). Blanda inte ihop k-värdet med vilket håll linjen pekar.',
  },
]

const FORMULAS = [
  {
    category: 'Algebra',
    color: 'text-violet-400',
    items: [
      { name: 'pq-formeln', formula: 'x = −p/2 ± √((p/2)² − q)   för x² + px + q = 0' },
      { name: 'Kvadreringsreglerna', formula: '(a+b)² = a²+2ab+b²\n(a−b)² = a²−2ab+b²\n(a+b)(a−b) = a²−b²' },
    ],
  },
  {
    category: 'Geometri',
    color: 'text-amber-400',
    items: [
      { name: 'Pythagoras', formula: 'a² + b² = c²   (c = hypotenusa)' },
      { name: 'Triangel area', formula: 'A = bh/2' },
      { name: 'Cirkel area', formula: 'A = πr²' },
      { name: 'Cirkel omkrets', formula: 'O = 2πr = πd' },
      { name: 'Rektangel area', formula: 'A = l × b' },
      { name: 'Parallellogram area', formula: 'A = b × h' },
      { name: 'Trapes area', formula: 'A = (a+b)/2 × h' },
    ],
  },
  {
    category: 'Procent',
    color: 'text-blue-400',
    items: [
      { name: 'Förändringsfaktor', formula: '+p% → ×(1+p/100)\n−p% → ×(1−p/100)' },
      { name: 'Basvärde', formula: 'Bas = Nytt / (1+p/100)' },
      { name: 'Kedjeförändring', formula: '×f₁ × f₂ × f₃ ...' },
    ],
  },
  {
    category: 'Sannolikhet',
    color: 'text-emerald-400',
    items: [
      { name: 'Komplementregeln', formula: 'P(A) = 1 − P(Aᶜ)' },
      { name: 'Multiplikationsregeln', formula: 'P(A∩B) = P(A)×P(B)   (oberoende)' },
      { name: 'Additionsregeln', formula: 'P(A∪B) = P(A)+P(B)−P(A∩B)' },
      { name: 'Kombinationer', formula: 'C(n,k) = n! / (k!(n−k)!)' },
    ],
  },
  {
    category: 'Statistik',
    color: 'text-rose-400',
    items: [
      { name: 'Medelvärde', formula: 'x̄ = (x₁+x₂+...+xₙ) / n' },
      { name: 'Vägat medelvärde', formula: 'x̄ = Σ(wᵢ×xᵢ) / Σwᵢ' },
    ],
  },
]

export default function XyzGuide() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('amnen')
  const [expanded, setExpanded] = useState<string | null>(null)

  const TABS: { id: Tab; label: string }[] = [
    { id: 'amnen', label: 'Ämnen' },
    { id: 'strategi', label: 'Strategi' },
    { id: 'formler', label: 'Formler' },
  ]

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-8">
      <PageHeader title="XYZ – Matematisk problemlösning" />
      <div className="max-w-lg mx-auto px-4 py-10 pb-24">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            XYZ · Matematisk problemlösning
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">XYZ-guide</h1>
          <p className="text-[var(--color-ink-faint)] text-sm">12 frågor/prov · ~60s/fråga · 4 svarsalternativ</p>
        </div>

        {/* Core insight */}
        <div className="card rounded-2xl p-4 mb-6 border border-violet-500/15">
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-2">Examtaktik i ett nötskal</div>
          <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
            XYZ belönar <span className="text-violet-300 font-semibold">smart uppskattning</span> lika ofta som exakt beräkning. Många frågor kan lösas på 20 sekunder genom att eliminera uppenbart felaktiga alternativ och testa ett rimligt värde. Fastnar du efter 60s — gissa och gå vidare, ingen minuspoäng.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 card rounded-xl">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.id ? 'bg-violet-700 text-white' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Ämnen tab */}
        {tab === 'amnen' && (
          <div className="space-y-2.5">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Sex ämnesområden på HP</div>
            {TOPICS.map(topic => {
              const isOpen = expanded === topic.id
              return (
                <div key={topic.id} className={`rounded-2xl border transition-all ${isOpen ? `${topic.border} ${topic.bg}` : 'card border-[var(--color-card-border)]'}`}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : topic.id)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-base font-mono ${topic.color}`}>{topic.icon}</span>
                      <span className={`text-sm font-bold ${topic.color}`}>{topic.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase ${topic.freqColor}`}>{topic.freq}</span>
                      <span className={`text-[var(--color-ink-faint)] text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 animate-fade-in">
                      <div>
                        <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1.5">Approach</div>
                        <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{topic.approach}</p>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1.5">Vanliga mönster</div>
                        <ul className="space-y-1">
                          {topic.patterns.map(p => (
                            <li key={p} className="flex gap-2 text-xs text-[var(--color-ink-muted)]">
                              <span className={`shrink-0 ${topic.color}`}>·</span>
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl p-2.5">
                        <span className="text-amber-400 text-xs shrink-0 mt-0.5">⚠</span>
                        <span className="text-[11px] text-[var(--color-ink-muted)]">{topic.trap}</span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            <div className="mt-2">
              <button
                onClick={() => navigate('/matematik')}
                className="w-full card rounded-2xl p-4 text-left hover:bg-[var(--color-paper-dark)] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-bold text-violet-300">Fördjupa dig i matematiken</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">10 ämnen med fullständiga förklaringar och begrepp</div>
                </div>
                <span className="text-[var(--color-ink-faint)]">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Strategi tab */}
        {tab === 'strategi' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">XYZ-strategier</div>

            {[
              {
                title: 'Plug-in — testa svarsalternativen',
                color: 'text-violet-400',
                border: 'border-violet-500/20',
                bg: 'bg-violet-500/8',
                body: 'Om frågan frågar "Vilket värde på x uppfyller...?" — testa A, B, C, D i uttrycket. Det är ofta snabbare än att lösa algebraiskt. Börja med C (mitten) vid ordnade alternativ.',
              },
              {
                title: 'Eliminering av felaktiga alternativ',
                color: 'text-blue-400',
                border: 'border-blue-500/20',
                bg: 'bg-blue-500/8',
                body: 'Kan du se att svaret måste vara positivt? Eliminera negativa alternativ. Att halvera antalet alternativ fördubblar sannolikheten vid gissning. 50% chans är bättre än att lämna blankt.',
              },
              {
                title: 'Uppskattning och storleksordning',
                color: 'text-emerald-400',
                border: 'border-emerald-500/20',
                bg: 'bg-emerald-500/8',
                body: 'Är alternativen spridda (10, 100, 1000)? Uppskatta storleksordningen först. Om du vet svaret är "i hundratusental" behöver du bara läsa av rätt storleksklass, inte beräkna exakt.',
              },
              {
                title: 'Rita alltid en figur vid geometri',
                color: 'text-amber-400',
                border: 'border-amber-500/20',
                bg: 'bg-amber-500/8',
                body: 'En handritad figur med alla givna mått inritade avslöjar relationer du inte ser i texten. Märk ut höjder, diagonaler och parallella sidor. Pythagoras döljer sig i oväntat många XYZ-uppgifter.',
              },
              {
                title: '60-sekundersregeln',
                color: 'text-rose-400',
                border: 'border-rose-500/20',
                bg: 'bg-rose-500/8',
                body: 'Om du inte löst uppgiften på 60 sekunder: välj det bästa gissningen bland alternativen, flagga frågan och gå vidare. Inga minuspoäng — en välgrundad gissning är alltid bättre än att lämna blankt. Återkom om tid finns.',
              },
            ].map(s => (
              <div key={s.title} className={`rounded-2xl border ${s.border} ${s.bg} p-4`}>
                <div className={`text-sm font-bold ${s.color} mb-2`}>{s.title}</div>
                <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">{s.body}</p>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Ämnesvis tidsbudget</div>
              <div className="space-y-2">
                {[
                  { ämne: 'Algebra', tips: '40–60s. Plug-in spar tid.' },
                  { ämne: 'Procent', tips: '30–50s. Multiplikationsfaktor direkt.' },
                  { ämne: 'Sannolikhet', tips: '60–90s. Rita alltid träd.' },
                  { ämne: 'Geometri', tips: '45–75s. Rita figur alltid.' },
                  { ämne: 'Statistik', tips: '30–45s. Snabb avläsning.' },
                  { ämne: 'Funktioner', tips: '40–60s. Sätt in x-värden.' },
                ].map(({ ämne, tips }) => (
                  <div key={ämne} className="flex gap-3 text-xs">
                    <span className="text-violet-400 font-bold shrink-0 w-20">{ämne}</span>
                    <span className="text-[var(--color-ink-muted)]">{tips}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Formler tab */}
        {tab === 'formler' && (
          <div className="space-y-4">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Formelreferens</div>
            {FORMULAS.map(cat => (
              <div key={cat.category} className="card rounded-2xl overflow-hidden">
                <div className={`px-4 py-2.5 border-b border-[var(--color-card-border)] text-[11px] font-black uppercase tracking-widest ${cat.color}`}>
                  {cat.category}
                </div>
                <div className="divide-y divide-[var(--color-card-border)]">
                  {cat.items.map(item => (
                    <div key={item.name} className="px-4 py-3">
                      <div className="text-[10px] font-bold text-[var(--color-ink-faint)] mb-1">{item.name}</div>
                      <pre className={`text-xs font-mono ${cat.color} opacity-90 whitespace-pre-wrap leading-relaxed`}>{item.formula}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="card rounded-2xl p-4 border border-[var(--color-card-border)]">
              <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Praktiska approximationer</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'π ≈ 3,14', note: 'Cirklar' },
                  { val: '√2 ≈ 1,41', note: 'Diagonal i kvadrat' },
                  { val: '√3 ≈ 1,73', note: 'Liksidiga trianglar' },
                  { val: '√5 ≈ 2,24', note: 'Vanlig Pythagoras' },
                  { val: '1/3 ≈ 0,333', note: 'Bråkkonvertering' },
                  { val: '2/3 ≈ 0,667', note: 'Bråkkonvertering' },
                ].map(({ val, note }) => (
                  <div key={val} className="bg-[var(--color-paper-dark)] rounded-xl p-2.5">
                    <div className="text-violet-400 font-black text-xs mb-0.5 font-mono">{val}</div>
                    <div className="text-[10px] text-[var(--color-ink-faint)]">{note}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Drill CTA */}
        <div className="mt-8 pt-6 border-t border-[var(--color-card-border)]">
          <button
            onClick={() => navigate('/practice?type=XYZ')}
            className="w-full bg-violet-800 hover:bg-violet-700 transition-colors rounded-xl py-3 font-bold text-sm"
          >
            Öva XYZ nu →
          </button>
        </div>

      </div>
    </div>
  )
}
