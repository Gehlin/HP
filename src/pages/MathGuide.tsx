import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadHistory } from '../utils/session'
import MathText from '../components/MathText'

// ─── Topic definitions ────────────────────────────────────────────────────────

interface Formula {
  label: string
  tex: string
}

interface TopicCard {
  id: string
  icon: string
  name: string
  subtitle: string
  tier: 1 | 2 | 3
  sections: string[]
  tags: string[]                // maps to question bank tags
  drillTag: string              // primary tag for "Öva nu →" link
  frequency: string             // human-readable emphasis
  whyItMatters: string
  hpInsight: string
  formulas: Formula[]
  traps: string[]
}

const TOPICS: TopicCard[] = [
  {
    id: 'algebra',
    icon: '🔢',
    name: 'Algebra',
    subtitle: 'Ekvationer, uttryck & olikheter',
    tier: 1,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['algebra', 'equations', 'expansion', 'factoring', 'systems', 'simplification', 'quadratic', 'inequalities', 'linear'],
    drillTag: 'algebra',
    frequency: 'Vanligast — förekommer i alla tre matematiksektioner',
    whyItMatters: 'Algebra är ryggraden i HP-matematik. Det visar sig i XYZ som ekvationslösning, i KVA som jämförelse av algebraiska uttryck och i NOG som systemekvationer. Kan du algebra väl, låser du upp en stor del av poängen.',
    hpInsight: 'HP undviker komplicerade räkningar — välj hellre att förenkla och faktorisera än att räkna ut allt. I KVA: du behöver sällan räkna exakt, utan avgöra vilket uttryck som är störst.',
    formulas: [
      { label: 'Distributiv lag (FOIL)', tex: '(a+b)(c+d) = ac + ad + bc + bd' },
      { label: 'Konjugatregeln', tex: '(a+b)(a-b) = a^2 - b^2' },
      { label: 'Kvadreringsreglerna', tex: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2' },
      { label: 'Andragradsekvation', tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Faktorisering', tex: 'ax^2 + bx + c = a(x - x_1)(x - x_2)' },
    ],
    traps: [
      'Glöm aldrig minustecknet vid expansion: $(x-3)^2 = x^2 - 6x + 9$, inte $x^2 + 9$',
      'I olikheter: multiplicera med negativt tal → vänd olikheten',
      'KVA: ett algebraiskt uttryck kan vara störst, minst eller lika beroende på variabelns värde — välj "kan ej avgöras" om du hittar ett motexempel',
    ],
  },
  {
    id: 'procent',
    icon: '💹',
    name: 'Procent & Ekonomi',
    subtitle: 'Procenträkning, ränta & förändring',
    tier: 1,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['percentages', 'percentage', 'percentage-change', 'financial', 'compoundinterest', 'ratio', 'ratios', 'fractions'],
    drillTag: 'percentages',
    frequency: 'Mycket vanligt — kombineras ofta med vardagsscenarier',
    whyItMatters: 'Procentuppgifter är de mest frekventa "tillämpade" uppgifterna på HP. De verkar enkla men är designade med fällor: priset ökar med 20% och minskar sedan med 20% — var befinner du dig? (Svar: −4%, inte ±0%.)',
    hpInsight: 'Tänk alltid i multiplikativa faktorer. 20% ökning = ×1,2. 15% minskning = ×0,85. Kombinera ändringar multiplicativt, aldrig additivt.',
    formulas: [
      { label: 'Procentdel', tex: '\\text{del} = \\dfrac{p}{100} \\times \\text{helhet}' },
      { label: 'Procentuell förändring', tex: '\\Delta\\% = \\dfrac{\\text{nytt} - \\text{gammalt}}{\\text{gammalt}} \\times 100' },
      { label: 'Förstoring / minskning', tex: 'P(1 + r)^n \\quad \\text{(sammansatt ränta)}' },
      { label: 'Bakåtberäkning', tex: '\\text{orig} = \\dfrac{\\text{nytt}}{1 + p/100}' },
      { label: 'Förhållande', tex: 'a : b = \\dfrac{a}{a+b} \\times \\text{totalt}' },
    ],
    traps: [
      '+20% följt av −20% ger netto −4%, inte 0%',
      '"Priset är 25% högre" ≠ "A är 25% av B" — läs frågan noga',
      'Sammansatt ränta: $P \\cdot (1.06)^{10}$, inte $P + 10 \\times 6\\%$',
    ],
  },
  {
    id: 'sannolikhet',
    icon: '🎲',
    name: 'Sannolikhet & Kombinatorik',
    subtitle: 'Chans, val & arrangemang',
    tier: 1,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['probability', 'combinatorics', 'conditionalprobability', 'sets', 'dice'],
    drillTag: 'probability',
    frequency: 'Mycket vanligt i XYZ — ofta 3–4 uppgifter per prov',
    whyItMatters: 'Sannolikhet och kombinatorik verkar abstrakt men bygger på enkla räkneprinciper. Varje extra uppgift du bemästrar här är en garanterad poäng — rätt svar kräver sällan avancerade beräkningar, bara rätt resonemang.',
    hpInsight: 'HP-sannolikhet är nästan alltid "klassisk sannolikhet" (lika sannolika utfall). Rita ett utrymme av möjliga utfall. Räkna gynnsamma. Dela. Klart.',
    formulas: [
      { label: 'Klassisk sannolikhet', tex: 'P(A) = \\dfrac{\\text{gynnsamma utfall}}{\\text{möjliga utfall}}' },
      { label: 'Multiplikationsregeln', tex: 'P(A \\cap B) = P(A) \\cdot P(B) \\quad \\text{(oberoende)}' },
      { label: 'Komplementregeln', tex: 'P(A^c) = 1 - P(A)' },
      { label: 'Kombinationer', tex: '\\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}' },
      { label: 'Permutationer', tex: 'P(n,k) = \\dfrac{n!}{(n-k)!}' },
    ],
    traps: [
      'Utan återläggning: antalet möjliga utfall minskar efter varje drag',
      'Minst en: använd komplement — $P(\\geq 1) = 1 - P(\\text{ingen})$',
      'Ordning spelar roll i permutationer men inte i kombinationer',
    ],
  },
  {
    id: 'funktioner',
    icon: '📈',
    name: 'Funktioner & Koordinatgeometri',
    subtitle: 'Grafer, lutningar & koordinater',
    tier: 1,
    sections: ['XYZ'],
    tags: ['functions', 'coordinategeometry', 'linearfunctions', 'exponential', 'sequence', 'sequences'],
    drillTag: 'functions',
    frequency: 'Vanligt i XYZ — ibland kopplade till grafer',
    whyItMatters: 'Funktioner kopplar algebra till geometri. En linjär funktion är en rät linje. En andragradsfunktion är en parabel. Om du kan läsa av och använda dessa grundmodeller, löser du en hel kategori uppgifter nästan automatiskt.',
    hpInsight: 'Visualisera alltid funktionen — du behöver inte rita den exakt. Fråga dig: stigande eller sjunkande? Var skär den axlarna? Var är toppen/botten?',
    formulas: [
      { label: 'Linjär funktion', tex: 'f(x) = kx + m \\quad (k = \\text{lutning},\\; m = \\text{skärning})' },
      { label: 'Lutning', tex: 'k = \\dfrac{y_2 - y_1}{x_2 - x_1}' },
      { label: 'Avstånd', tex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}' },
      { label: 'Andragradsfunktion — vertex', tex: 'x_v = -\\dfrac{b}{2a}' },
      { label: 'Exponentialfunktion', tex: 'f(x) = a \\cdot r^x \\quad (r > 0)' },
    ],
    traps: [
      'Negativ lutning ≠ funktion som alltid är negativ — lutningen beskriver förändringen',
      'Vertex = topp om $a < 0$, botten om $a > 0$',
      '"Funktionens nollställen" = x-värden där $f(x) = 0$',
    ],
  },
  {
    id: 'aritmetik',
    icon: '🧮',
    name: 'Aritmetik & Talteori',
    subtitle: 'Räknelagar, primtal & delbarhetsregler',
    tier: 2,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['arithmetic', 'numbertheory', 'number-theory', 'divisibility', 'primes', 'prime-numbers', 'parity', 'integers'],
    drillTag: 'arithmetic',
    frequency: 'Vanligt — men ofta lättare uppgifter om du kan reglerna',
    whyItMatters: 'Aritmetik och talteori-uppgifter ser skrämmande ut (primfaktorisering, delbarhetsregler) men är bland de snabbast lösta om du känner till ett fåtal tumregler. De flesta HP-studenter missar dem för att de aldrig lärt sig grunderna.',
    hpInsight: 'Delbarhetsregler sparar tid. Istället för att dela ut, kontrollera snabbt: delbart med 3 om siffersumman är delbar med 3. Delbart med 9 om siffersumman är delbar med 9.',
    formulas: [
      { label: 'Delbart med 2', tex: '\\text{Sista siffran är jämn}' },
      { label: 'Delbart med 3', tex: '\\text{Siffersumma delbar med 3}' },
      { label: 'Delbart med 4', tex: '\\text{De två sista siffrorna delbara med 4}' },
      { label: 'Delbart med 9', tex: '\\text{Siffersumma delbar med 9}' },
      { label: 'Primfaktorisering', tex: 'n = p_1^{a_1} \\cdot p_2^{a_2} \\cdots p_k^{a_k}' },
    ],
    traps: [
      '1 är INTE ett primtal',
      'Jämnt tal delbart med 2 — udda tal är inte det',
      'SGD (största gemensamma divisor) och MGM (minsta gemensamma multipel) — håll isär dessa',
    ],
  },
  {
    id: 'potenser',
    icon: '⚡',
    name: 'Potenser & Rötter',
    subtitle: 'Exponentregler & wurzelberechnungen',
    tier: 2,
    sections: ['XYZ', 'KVA'],
    tags: ['powers', 'roots', 'exponent', 'squares', 'absolutevalue'],
    drillTag: 'powers',
    frequency: 'Vanligt i KVA — jämföra potenser utan att räkna ut dem',
    whyItMatters: 'KVA älskar potenser. "Vilket är störst: $2^{10}$ eller $3^7$?" Du ska inte räkna ut det — du ska resonera om storleksordning. Med rätt regler spar du sekunder per uppgift.',
    hpInsight: 'Memorera: $2^{10} = 1024 \\approx 10^3$. Det kopplar binär- och tiopotenser. Använd det för att uppskatta jämförelser snabbt.',
    formulas: [
      { label: 'Produktregel', tex: 'a^m \\cdot a^n = a^{m+n}' },
      { label: 'Kvotregel', tex: '\\dfrac{a^m}{a^n} = a^{m-n}' },
      { label: 'Potensregel', tex: '(a^m)^n = a^{mn}' },
      { label: 'Negativ exponent', tex: 'a^{-n} = \\dfrac{1}{a^n}' },
      { label: 'Bråkexponent', tex: 'a^{1/n} = \\sqrt[n]{a}' },
    ],
    traps: [
      '$(-2)^2 = 4$ men $-2^2 = -4$ — parentesen spelar roll',
      '$\\sqrt{a^2} = |a|$, inte $a$ — roten är alltid icke-negativ',
      '$2^3 \\cdot 3^3 = 6^3$, men $2^3 + 3^3 \\neq 5^3$',
    ],
  },
  {
    id: 'statistik',
    icon: '📊',
    name: 'Statistik & Medelvärden',
    subtitle: 'Medelvärde, median & spridning',
    tier: 2,
    sections: ['XYZ'],
    tags: ['statistics', 'mean', 'median'],
    drillTag: 'statistics',
    frequency: 'Måttligt — men alltid med snabbt lösbart mönster',
    whyItMatters: 'Statistikuppgifter på HP är sällan komplicerade. De testar om du förstår vad medelvärde och median *innebär* och vad som händer när du lägger till eller tar bort ett värde. Förstår du konceptet, löser du dem utan formler.',
    hpInsight: 'Nyckeltrick: Om medelvärdet för $n$ tal är $M$, är summan av alla tal $n \\times M$. Det låser upp de flesta HP-statistikuppgifterna.',
    formulas: [
      { label: 'Medelvärde', tex: '\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}' },
      { label: 'Totalsum', tex: '\\text{Summa} = \\bar{x} \\times n' },
      { label: 'Vägat medelvärde', tex: '\\bar{x} = \\dfrac{\\sum w_i x_i}{\\sum w_i}' },
    ],
    traps: [
      'Median är mittenvädet (sorterat) — inte medelvärdet',
      'Lägger du till ett värde LIKA med medelvärdet förändras inte medelvärdet',
      'Jämnt antal värden: median = medelvärde av de två mitten',
    ],
  },
  {
    id: 'geometri',
    icon: '📐',
    name: 'Geometri & Mätning',
    subtitle: 'Area, omkrets, vinklar & Pythagoras',
    tier: 2,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['geometry', 'angles', 'triangle', 'area', 'perimeter', 'circle', 'rectangle', 'quadrilateral', 'pythagoras', 'pythagoreantheorem', 'Pythagoras'],
    drillTag: 'geometry',
    frequency: 'Vanligt — ofta kombinerat med algebra',
    whyItMatters: 'Geometri på HP kräver sällan avancerade bevis. Det handlar om att applicera rätt formel på rätt figur och se om du kan kombinera två-tre steg. Rita alltid en figur — det avslöjar lösningsvägen.',
    hpInsight: 'Pythagorassen är universalverktyget. Kan du identifiera en rätvinklig triangel i en figur — även om den inte är explicit ritad — har du nyckeln.',
    formulas: [
      { label: 'Pythagoras', tex: 'a^2 + b^2 = c^2' },
      { label: 'Triangelarea', tex: 'A = \\dfrac{bh}{2}' },
      { label: 'Cirkelarea & omkrets', tex: 'A = \\pi r^2, \\quad C = 2\\pi r' },
      { label: 'Rektangelarea', tex: 'A = l \\times b' },
      { label: 'Trapetsarea', tex: 'A = \\dfrac{(a+b) \\cdot h}{2}' },
    ],
    traps: [
      'Höjden i triangeln är vinkelrät mot basen — inte alltid en sida',
      'Likbent triangel ≠ liksidig triangel',
      'Vinkelsumma i triangel = 180°, i fyrhörning = 360°',
    ],
  },
  {
    id: '3d',
    icon: '📦',
    name: '3D-geometri & Volymer',
    subtitle: 'Volym, mantelarea & rymdgeometri',
    tier: 3,
    sections: ['XYZ'],
    tags: ['3d-geometry', 'volume', 'surface-area', 'cone', 'cylinder', 'sphere', 'cube', 'prism'],
    drillTag: '3d-geometry',
    frequency: 'Förekommer — men sällan mer än 1–2 uppgifter per prov',
    whyItMatters: 'Volymuppgifter är lönsamma på HP: om du kan formlerna utantill löser du dem på 30 sekunder. Om du inte kan dem, är de omöjliga att uppskatta utan att gissa.',
    hpInsight: 'Lär dig formlerna utantill. De är få. Det ger en snabb och säker uppgift.',
    formulas: [
      { label: 'Kub', tex: 'V = s^3, \\quad A = 6s^2' },
      { label: 'Rätblock', tex: 'V = l \\cdot b \\cdot h' },
      { label: 'Cylinder', tex: 'V = \\pi r^2 h' },
      { label: 'Kon', tex: 'V = \\dfrac{1}{3}\\pi r^2 h' },
      { label: 'Sfär', tex: 'V = \\dfrac{4}{3}\\pi r^3' },
    ],
    traps: [
      'Konen har faktorn ⅓ — samma bas × höjd men en tredjedel av cylindern',
      'Mantelarea ≠ total yta — mant. ytan inkluderar inte botten/topp',
      'Om ett objekt skalas med faktor $k$, skalas volymen med $k^3$',
    ],
  },
  {
    id: 'logaritm',
    icon: '🔬',
    name: 'Logaritmer & Exponentialfunktioner',
    subtitle: 'log, ln och exponentiell tillväxt',
    tier: 3,
    sections: ['XYZ'],
    tags: ['logarithm', 'logarithmrules', 'exponential'],
    drillTag: 'logarithm',
    frequency: 'Sällsynt — men de uppgifter som finns har tydliga mönster',
    whyItMatters: 'Logaritmuppgifter skrämmer de flesta, men HP-logaritmer bygger på 3–4 regler som är snabba att lära sig. En student som kan dessa regler löser uppgifterna mekaniskt medan andra gissar.',
    hpInsight: 'Logaritmuppgifter på HP är nästan alltid "tillämpa rätt logaritmregel och förenkla". Sällan krävs förståelse för logaritmens djupare innebörd.',
    formulas: [
      { label: 'Definition', tex: '\\log_a b = c \\Leftrightarrow a^c = b' },
      { label: 'Produktregel', tex: '\\log(xy) = \\log x + \\log y' },
      { label: 'Kvotregel', tex: '\\log\\!\\left(\\dfrac{x}{y}\\right) = \\log x - \\log y' },
      { label: 'Potensregel', tex: '\\log(x^n) = n\\log x' },
      { label: 'Basbyte', tex: '\\log_a b = \\dfrac{\\ln b}{\\ln a}' },
    ],
    traps: [
      '$\\log(a + b) \\neq \\log a + \\log b$ — produktregeln gäller för multiplikation, inte addition',
      '$\\ln e = 1$ och $\\log 10 = 1$ — koppla tillbaka till definitionen',
      'Logaritm är bara definierad för positiva tal: $\\ln x$ kräver $x > 0$',
    ],
  },
]

// ─── Priority tier metadata ───────────────────────────────────────────────────

const TIER_META = {
  1: {
    label: 'Kritisk',
    desc: 'Dessa ämnen förekommer i varje prov och spänner över flera delsektioner. Börja här.',
    color: 'text-red-400',
    badgeColor: 'bg-red-900/40 text-red-300 border-red-700/60',
    borderColor: 'border-red-700/50',
    barColor: 'bg-red-500',
  },
  2: {
    label: 'Viktig',
    desc: 'Regelbundna inslag med tydliga mönster. Hög avkastning per studietimme.',
    color: 'text-amber-400',
    badgeColor: 'bg-amber-900/40 text-amber-300 border-amber-700/60',
    borderColor: 'border-amber-700/50',
    barColor: 'bg-amber-500',
  },
  3: {
    label: 'Kompletterande',
    desc: 'Sällsynta men lättlösta om du kan formlerna. Lär dig dem sist.',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60',
    borderColor: 'border-emerald-700/50',
    barColor: 'bg-emerald-500',
  },
} as const

const TYPE_PILL: Record<string, string> = {
  XYZ: 'bg-violet-600/20 text-violet-300 border-violet-600/40',
  KVA: 'bg-blue-600/20 text-blue-300 border-blue-600/40',
  NOG: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
  DTK: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MathGuide() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<string | null>('algebra')

  // Compute per-topic accuracy from session history
  const topicAccuracy = useMemo(() => {
    const history = loadHistory()
    const byTag: Record<string, { correct: number; total: number }> = {}
    history.forEach(s => {
      s.questionIds.forEach(qid => {
        const q = questions.find(x => x.id === qid)
        if (!q || !s.answers[qid]) return
        q.tags.forEach(tag => {
          if (!byTag[tag]) byTag[tag] = { correct: 0, total: 0 }
          byTag[tag].total++
          if (s.answers[qid] === q.answer) byTag[tag].correct++
        })
      })
    })

    const result: Record<string, { pct: number; total: number } | null> = {}
    TOPICS.forEach(topic => {
      let correct = 0, total = 0
      topic.tags.forEach(tag => {
        correct += byTag[tag]?.correct ?? 0
        total += byTag[tag]?.total ?? 0
      })
      result[topic.id] = total >= 3 ? { pct: Math.round((correct / total) * 100), total } : null
    })
    return result
  }, [])

  // Count questions in bank per topic
  const topicCounts = useMemo(() => {
    const result: Record<string, number> = {}
    TOPICS.forEach(topic => {
      const tagSet = new Set(topic.tags)
      result[topic.id] = questions.filter(q => q.tags.some(t => tagSet.has(t))).length
    })
    return result
  }, [])

  const totalMathQs = questions.filter(q => q.type !== 'DTK').length

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-800">
        <div className="max-w-2xl mx-auto px-6 pt-10 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white text-sm mb-6 flex items-center gap-1 transition-colors"
          >
            ← Tillbaka
          </button>
          <div className="inline-flex items-center gap-2 bg-violet-600/20 border border-violet-500/40 text-violet-300 text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Matematiksguide
          </div>
          <h1 className="text-4xl font-black mb-3 leading-tight">
            Matematik på HP
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            Av provets 40 frågor är <strong className="text-white">{totalMathQs} rent matematiska</strong>. Det är matematik — inte läsförståelse — som skiljer 1,4 från 2,0 i HP-poäng.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { value: '40', label: 'frågor totalt', sub: 'i kvantitativ del' },
              { value: '~30s', label: 'för de flesta', sub: 'enkla XYZ-frågor' },
              { value: '0', label: 'minuspoäng', sub: 'svara alltid' },
              { value: '3 mån', label: 'räcker', sub: 'för stor förbättring' },
            ].map(s => (
              <div key={s.label} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-center">
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-slate-300 font-semibold mt-0.5">{s.label}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* The HP Math Reality */}
        <section className="mb-10">
          <h2 className="text-xl font-black mb-4">Vad HP-matematik verkligen är</h2>
          <div className="space-y-3">
            {[
              {
                icon: '🧮',
                title: 'Ingen miniräknare — och det behövs inte',
                body: 'HP är designat för att lösas med huvudräkning. Talen är konstruerade för att gå upp jämnt eller att kunna uppskattas. Du behöver inte räkna exakt — du behöver räkna smart.',
              },
              {
                icon: '⏱',
                title: 'Tid är din fiende',
                body: 'XYZ-avsnittet ger 60 sekunder per fråga. De flesta missar inte frågor för att de inte kan matten — de missar dem för att de inte löste dem snabbt nog. Snabbhet tränas genom repetition.',
              },
              {
                icon: '📊',
                title: 'Grundnivå, inte gymnasienivå',
                body: 'HP testar inte derivatan, integraler eller komplexa tal. Det är grundläggande algebra, procenträkning, geometri och sannolikhet — men under tidspress och med välkonstruerade distraherare.',
              },
              {
                icon: '🎯',
                title: 'Matematik är den mest förbättringsbara delen',
                body: 'Verbal resonemang förbättras långsamt. Matematisk förmåga — det vill säga att ha rätt formler och mönsterigenkänning — kan förbättras avsevärt på 2–3 månaders fokuserad träning.',
              },
            ].map(item => (
              <div key={item.title} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex gap-3">
                <span className="text-2xl shrink-0">{item.icon}</span>
                <div>
                  <div className="font-bold text-slate-200 mb-1">{item.title}</div>
                  <div className="text-sm text-slate-400 leading-relaxed">{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Topic cards by tier */}
        {([1, 2, 3] as const).map(tier => {
          const tierTopics = TOPICS.filter(t => t.tier === tier)
          const meta = TIER_META[tier]
          return (
            <section key={tier} className="mb-10">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${meta.badgeColor}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-4">{meta.desc}</p>

              <div className="space-y-3">
                {tierTopics.map(topic => {
                  const isOpen = expanded === topic.id
                  const acc = topicAccuracy[topic.id]
                  const count = topicCounts[topic.id]

                  const accColor = acc === null ? '' : acc.pct >= 70 ? 'text-emerald-400' : acc.pct >= 50 ? 'text-amber-400' : 'text-red-400'

                  return (
                    <div
                      key={topic.id}
                      className={`rounded-2xl border overflow-hidden transition-all ${meta.borderColor} bg-slate-800/50`}
                    >
                      {/* Card header */}
                      <button
                        onClick={() => setExpanded(isOpen ? null : topic.id)}
                        className="w-full text-left px-5 py-4 flex items-start gap-3 hover:bg-slate-800/80 transition-colors"
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{topic.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-black text-white">{topic.name}</span>
                            {topic.sections.map(s => (
                              <span key={s} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${TYPE_PILL[s]}`}>{s}</span>
                            ))}
                            {acc && (
                              <span className={`text-[10px] font-bold ml-auto shrink-0 ${accColor}`}>
                                {acc.pct}% rätt ({acc.total} frågor)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{topic.subtitle}</div>
                          <div className="text-[10px] text-slate-600 mt-1">{count} frågor i träningsbanken</div>
                        </div>
                        <span className="text-slate-500 shrink-0 mt-1">{isOpen ? '▲' : '▼'}</span>
                      </button>

                      {/* Expanded content */}
                      {isOpen && (
                        <div className="px-5 pb-5 border-t border-slate-700/50">

                          {/* Why it matters */}
                          <div className="mt-4 mb-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Varför det är viktigt</div>
                            <p className="text-sm text-slate-300 leading-relaxed">{topic.whyItMatters}</p>
                          </div>

                          {/* HP insight */}
                          <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3 mb-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">HP-insikt</div>
                            <p className="text-sm text-blue-200 leading-relaxed">{topic.hpInsight}</p>
                          </div>

                          {/* Formulas */}
                          <div className="mb-4">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Viktiga formler</div>
                            <div className="space-y-2">
                              {topic.formulas.map(f => (
                                <div key={f.label} className="bg-slate-900/60 rounded-xl px-4 py-2.5 flex items-center gap-3 flex-wrap">
                                  <span className="text-xs text-slate-400 shrink-0 w-36">{f.label}</span>
                                  <span className="text-slate-200 text-sm flex-1">
                                    <MathText text={`$${f.tex}$`} />
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Traps */}
                          <div className="mb-5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Vanliga misstag</div>
                            <ul className="space-y-2">
                              {topic.traps.map((trap, i) => (
                                <li key={i} className="flex gap-2 text-sm text-slate-400">
                                  <span className="text-red-400 shrink-0">⚠</span>
                                  <MathText text={trap} />
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Accuracy bar + CTA */}
                          {acc && (
                            <div className="mb-3">
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Din träffsäkerhet i detta ämne</span>
                                <span className={accColor}>{acc.pct}%</span>
                              </div>
                              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${acc.pct >= 70 ? 'bg-emerald-500' : acc.pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${acc.pct}%` }}
                                />
                              </div>
                            </div>
                          )}

                          <button
                            onClick={() => navigate(`/practice?tag=${encodeURIComponent(topic.drillTag)}`)}
                            className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold text-sm transition-colors"
                          >
                            Öva på {topic.name} →
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Mental math strategy */}
        <section className="mb-10">
          <h2 className="text-xl font-black mb-2">Tänk som HP — 5 mentala verktyg</h2>
          <p className="text-sm text-slate-500 mb-4">Dessa strategier sparar sekunder per uppgift. Under ett 55-minutersprov räknas varje sekund.</p>
          <div className="space-y-3">
            {[
              {
                number: '01',
                title: '60-sekundersregeln',
                body: 'Om du fastnar på en XYZ-uppgift efter 60 sekunder: gör din bästa gissning och gå vidare. Det finns ingen minuspoäng. En halvdan gissning och tid kvar är bättre än ett perfekt svar med en fråga obesvarad.',
              },
              {
                number: '02',
                title: 'Uppskattning slår exakt beräkning i KVA',
                body: 'KVA handlar om att avgöra vilket uttryck som är störst — inte om exakta svar. Fråga dig: "Är detta ungefär lika med...?" Om uppskattningen räcker, slösa inte tid på exakt kalkyl.',
              },
              {
                number: '03',
                title: 'Arbeta baklänges från svarsalternativen',
                body: 'I XYZ: prova alternativ B eller C (de "mittersta") i ekvationsproblem. Om det stämmer, klar. Om inte, vet du om svaret är större eller mindre — prova nästa. Ofta snabbare än att lösa algebraiskt.',
              },
              {
                number: '04',
                title: 'Rita alltid en figur',
                body: 'I alla geometriuppgifter: rita figuren, märk ut vad du vet. Rätt figur avslöjar lösningsvägen. Fel figur kostar 10 sekunder — ingen figur kostar hela uppgiften.',
              },
              {
                number: '05',
                title: 'NOG är logik, inte matematik',
                body: 'I NOG-avsnittet frågar man om informationen räcker för att besvara frågan. Du behöver ofta INTE lösa problemet — bara avgöra om det KAN lösas med given data. Träna detta tankesätt separat.',
              },
            ].map(item => (
              <div key={item.number} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex gap-4">
                <div className="text-2xl font-black text-slate-700 shrink-0 w-8 text-right leading-none pt-0.5">{item.number}</div>
                <div>
                  <div className="font-bold text-slate-200 mb-1">{item.title}</div>
                  <div className="text-sm text-slate-400 leading-relaxed">{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personalized weak spots */}
        {(() => {
          const weakTopics = TOPICS
            .map(t => ({ topic: t, acc: topicAccuracy[t.id] }))
            .filter(x => x.acc !== null && x.acc.pct < 60)
            .sort((a, b) => (a.acc!.pct) - (b.acc!.pct))
            .slice(0, 3)

          if (weakTopics.length === 0) return null

          return (
            <section className="mb-10">
              <h2 className="text-xl font-black mb-2">Dina svaga punkter</h2>
              <p className="text-sm text-slate-500 mb-4">Baserat på din träningshistorik — prioritera dessa ämnen.</p>
              <div className="space-y-2">
                {weakTopics.map(({ topic, acc }) => (
                  <button
                    key={topic.id}
                    onClick={() => navigate(`/practice?tag=${encodeURIComponent(topic.drillTag)}`)}
                    className="w-full text-left bg-red-900/10 border border-red-700/40 hover:bg-red-900/20 rounded-xl px-5 py-3.5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{topic.icon}</span>
                        <span className="font-bold text-slate-200">{topic.name}</span>
                      </div>
                      <span className="text-red-400 font-black">{acc!.pct}%</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${acc!.pct}%` }} />
                    </div>
                    <div className="text-xs text-red-400/70 mt-1.5">Öva nu →</div>
                  </button>
                ))}
              </div>
            </section>
          )
        })()}

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-900/40 to-violet-900/40 border border-blue-700/40 rounded-2xl p-6 text-center">
          <div className="text-2xl mb-3">🚀</div>
          <h3 className="text-lg font-black mb-2">Redo att börja?</h3>
          <p className="text-sm text-slate-400 mb-4">
            Börja med algebra — det ger flest poäng per studietimme.
          </p>
          <button
            onClick={() => navigate('/practice?tag=algebra')}
            className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl py-3 font-bold transition-colors"
          >
            Starta algebraträning →
          </button>
        </div>

      </div>
    </div>
  )
}
