import { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadHistory } from '../utils/session'
import MathText from '../components/MathText'
import PageHeader from '../components/PageHeader'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Formula { label: string; tex: string }

interface Concept {
  term: string
  en: string
  definition: string
  tex?: string
  note?: string
}

interface WorkedExample {
  problem: string
  steps: string[]
  answer: string
}

interface TopicCard {
  id: string
  icon: string
  name: string
  subtitle: string
  tier: 1 | 2 | 3
  sections: string[]
  tags: string[]
  drillTag: string
  frequency: string
  whyItMatters: string
  hpInsight: string
  formulas: Formula[]
  traps: string[]
  concepts: Concept[]
  examples: WorkedExample[]
  lesson: Lesson
  selfCheck: SelfCheckQ[]
}

interface GlossaryEntry {
  term: string
  en: string
  definition: string
  tex?: string
}

interface Lesson {
  hook: string
  core: string
  keyInsight: string
  hpPattern: string
  pattern: string
  rule: string
}

interface SelfCheckQ {
  question: string
  options: [string, string, string]
  correct: 0 | 1 | 2
  explanation: string
}

// ─── Topics ───────────────────────────────────────────────────────────────────

const TOPICS: TopicCard[] = [
  {
    id: 'algebra',
    icon: '∑',
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
      { label: 'Distributiv lag', tex: 'a(b+c) = ab + ac' },
      { label: 'FOIL', tex: '(a+b)(c+d) = ac + ad + bc + bd' },
      { label: 'Konjugatregeln', tex: '(a+b)(a-b) = a^2 - b^2' },
      { label: 'Kvadreringsreglerna', tex: '(a \\pm b)^2 = a^2 \\pm 2ab + b^2' },
      { label: 'Andragradsekvation', tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Diskriminant', tex: 'D = b^2 - 4ac' },
    ],
    traps: [
      'Glöm aldrig minustecknet: $(x-3)^2 = x^2 - 6x + 9$, inte $x^2 + 9$',
      'I olikheter: multiplicera båda leden med negativt tal → vänd tecknet',
      'KVA: ett uttryck kan vara störst, minst eller lika beroende på variabeln — välj "kan ej avgöras" om du hittar ett motexempel',
    ],
    concepts: [
      {
        term: 'Variabel',
        en: 'Variable',
        definition: 'En symbol — vanligtvis $x$, $y$ eller $z$ — som representerar ett okänt eller godtyckligt tal.',
        note: 'Koefficienten är faktorn framför variabeln: i $7x$ är $7$ koefficienten och $x$ variabeln.',
      },
      {
        term: 'Term',
        en: 'Term',
        definition: 'En del av ett algebraiskt uttryck separerad av addition eller subtraktion. I $3x^2 - 5x + 2$ är $3x^2$, $-5x$ och $2$ tre termer.',
      },
      {
        term: 'Linjär ekvation',
        en: 'Linear equation',
        definition: 'Ekvation av formen $ax + b = c$ med $a \\neq 0$. Ger alltid exakt en lösning: $x = \\dfrac{c - b}{a}$.',
        note: 'Kallas "linjär" eftersom grafen $y = ax + b$ är en rät linje.',
      },
      {
        term: 'Andragradsekvation',
        en: 'Quadratic equation',
        definition: 'Ekvation av formen $ax^2 + bx + c = 0$, $a \\neq 0$. Antalet reella lösningar ges av diskriminanten $D = b^2 - 4ac$.',
        note: '$D > 0$: två lösningar. $D = 0$: en lösning (dubbelrot). $D < 0$: inga reella lösningar.',
      },
      {
        term: 'Diskriminant',
        en: 'Discriminant',
        definition: '$D = b^2 - 4ac$. Avgör antalet reella rötter till $ax^2 + bx + c = 0$.',
        tex: 'D = b^2 - 4ac',
      },
      {
        term: 'Faktorisering',
        en: 'Factorization',
        definition: 'Att skriva ett uttryck som en produkt av enklare faktorer. T.ex. $x^2 - 5x + 6 = (x-2)(x-3)$.',
        note: 'Sök två tal vars produkt är $c$ och summa är $b$ i $x^2 + bx + c$.',
      },
      {
        term: 'Ekvationssystem',
        en: 'System of equations',
        definition: 'Två eller fler ekvationer med samma variabler. Lösas med substitution (uttryck en variabel med den andra) eller addition/subtraktion (eliminera en variabel).',
      },
      {
        term: 'Olikhet',
        en: 'Inequality',
        definition: 'Påstående av formen $a < b$, $a \\leq b$, $a > b$ eller $a \\geq b$. Behandlas som en ekvation med undantaget att tecknet vänds vid multiplikation/division med negativt tal.',
        tex: '-2x > 6 \\implies x < -3',
      },
    ],
    examples: [
      {
        problem: 'Lös $3x - 7 = 2x + 5$',
        steps: [
          'Flytta $x$-termer till vänster: $3x - 2x = 5 + 7$',
          'Förenkla: $x = 12$',
        ],
        answer: '$x = 12$',
      },
      {
        problem: 'Lös $x^2 - 5x + 6 = 0$ genom faktorisering',
        steps: [
          'Sök två tal med produkt $6$ och summa $-5$: det är $-2$ och $-3$',
          'Faktorisera: $(x - 2)(x - 3) = 0$',
          'Varje faktor noll: $x - 2 = 0$ eller $x - 3 = 0$',
        ],
        answer: '$x = 2$ eller $x = 3$',
      },
      {
        problem: '(HP-stil) Lös ekvationssystemet: $2x + y = 7$, $x - y = 2$',
        steps: [
          'Addera ekvationerna (eliminera $y$): $(2x + y) + (x - y) = 7 + 2$',
          'Förenkla: $3x = 9 \\Rightarrow x = 3$',
          'Sätt $x = 3$ i andra ekvationen: $3 - y = 2 \\Rightarrow y = 1$',
        ],
        answer: '$x = 3,\\; y = 1$',
      },
      {
        problem: '(HP-stil) För vilket $k$ har $kx^2 - 6x + k = 0$ exakt en lösning?',
        steps: [
          'Exakt en lösning $\\Leftrightarrow D = 0$',
          '$D = (-6)^2 - 4 \\cdot k \\cdot k = 36 - 4k^2$',
          '$36 - 4k^2 = 0 \\Rightarrow k^2 = 9 \\Rightarrow k = \\pm 3$',
        ],
        answer: '$k = 3$ eller $k = -3$',
      },
    ],
    selfCheck: [
      {
        question: 'Du löser $2x + 6 = 14$. Vilket är rätt första steg?',
        options: ['Multiplicera båda leden med 2', 'Subtrahera 6 från båda leden', 'Dela båda leden med 2'],
        correct: 1,
        explanation: 'Isolera x-termen först: $2x + 6 - 6 = 14 - 6$ ger $2x = 8$, sedan $x = 4$.',
      },
      {
        question: 'Vad är $(x + 3)(x - 3)$ förenklat?',
        options: ['$x^2 - 9$', '$x^2 + 9$', '$x^2 - 6x + 9$'],
        correct: 0,
        explanation: 'Konjugatregeln: $(a+b)(a-b) = a^2 - b^2$. Här $a = x$, $b = 3$ → $x^2 - 9$.',
      },
      {
        question: 'I olikheten $-2x > 8$, vad händer med tecknet när du delar med $-2$?',
        options: ['Det bevaras: $x > -4$', 'Det vänds: $x < -4$', 'Det försvinner: $x = -4$'],
        correct: 1,
        explanation: 'Vid multiplikation eller division med ett negativt tal vänds olikhetstecknet. $-2x > 8$ → $x < -4$.',
      },
    ],
    lesson: {
      hook: 'Algebra är grunden till allt på HP. Varje uppgift — procent, geometri, sannolikhet — löses till slut med algebraiska manipulationer. Bemästrar du algebra öppnar du en hel provdel.',
      core: 'En ekvation är en balanserad vågskål. Vad du gör på ena sidan gör du på den andra — annars tippar den. Variabeln $x$ är bara ett okänt tal du löser ut.\n\nTre grundrörelser: (1) Addera/subtrahera samma tal på båda sidor. (2) Multiplicera/dividera med samma tal (ej 0). (3) Förenkla med identiteter — t.ex. $(a+b)(a-b) = a^2-b^2$ gör vad som verkar komplicerat trivialt.',
      keyInsight: 'Förenkla hellre än räkna. HP-talen är designade för att gå upp jämnt. Om du räknar omständigt har du troligen missat en genväg — leta efter konjugatregeln eller faktorisering.',
      hpPattern: 'Ekvationssystem — eliminationsmetoden',
      pattern: 'HP ger dig ofta $2$ ekvationer med $2$ obekanta. Addera eller subtrahera för att eliminera en variabel. $2x + y = 7$ och $x - y = 2$: addera direkt → $3x = 9$ → $x = 3$. En enda rad.',
      rule: 'I KVA kräver du sällan exakt svar. Fråga dig: kan uttrycket vara noll, positivt, negativt? Hitta ett motexempel för "kan ej avgöras" — det är snabbare än exakt kalkyl.',
    },
  },
  {
    id: 'procent',
    icon: '%',
    name: 'Procent & Ekonomi',
    subtitle: 'Procenträkning, ränta & förändring',
    tier: 1,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['percentages', 'percentage', 'percentage-change', 'financial', 'compoundinterest', 'ratio', 'ratios', 'fractions'],
    drillTag: 'percentages',
    frequency: 'Mycket vanligt — kombineras ofta med vardagsscenarier',
    whyItMatters: 'Procentuppgifter är de mest frekventa tillämpade uppgifterna på HP. De verkar enkla men är designade med fällor: priset ökar med 20% och minskar sedan med 20% — var befinner du dig? (Svar: −4%, inte ±0%.)',
    hpInsight: 'Tänk alltid i multiplikativa faktorer. 20% ökning = ×1,2. 15% minskning = ×0,85. Kombinera ändringar multiplicativt, aldrig additivt.',
    formulas: [
      { label: 'Procentdel', tex: '\\text{del} = \\dfrac{p}{100} \\times \\text{helhet}' },
      { label: 'Procentuell förändring', tex: '\\Delta\\% = \\dfrac{\\text{ny} - \\text{gammal}}{\\text{gammal}} \\times 100' },
      { label: 'Multiplikativ faktor', tex: '+p\\% \\Rightarrow \\times\\!\\left(1 + \\tfrac{p}{100}\\right)' },
      { label: 'Sammansatt ränta', tex: 'S = P\\left(1 + \\tfrac{r}{100}\\right)^n' },
      { label: 'Bakåtberäkning', tex: '\\text{orig} = \\dfrac{\\text{nytt}}{1 + p/100}' },
    ],
    traps: [
      '+20% följt av −20% ger netto −4%, inte 0%',
      '"Priset är 25% högre" ≠ "A är 25% av B" — läs frågan noga',
      'Sammansatt ränta: $P \\cdot (1{,}06)^{10}$, inte $P + 10 \\times 6\\%$',
    ],
    concepts: [
      {
        term: 'Procent',
        en: 'Percent',
        definition: 'Procent (%) betyder "av hundra". $p\\%$ av ett tal $N$ ges av $\\dfrac{p}{100} \\times N$.',
        tex: '25\\% \\text{ av } 80 = \\tfrac{25}{100} \\times 80 = 20',
      },
      {
        term: 'Procentuell förändring',
        en: 'Percentage change',
        definition: 'Mäter hur mycket ett värde ökat eller minskat relativt ursprungsvärdet: $\\Delta\\% = \\dfrac{\\text{nytt} - \\text{gammalt}}{\\text{gammalt}} \\times 100$.',
        note: 'Positivt värde = ökning. Negativt värde = minskning.',
      },
      {
        term: 'Multiplikativ faktor',
        en: 'Multiplicative factor',
        definition: 'En förändring med $p\\%$ uppåt motsvarar att multiplicera med $(1 + p/100)$; en minskning med $p\\%$ med $(1 - p/100)$. Kedjemultiplikation: $+20\\%$ sedan $-20\\%$ ger $\\times 1{,}2 \\times 0{,}8 = \\times 0{,}96$, dvs. $-4\\%$.',
        tex: '\\times 1{,}2 \\times 0{,}8 = 0{,}96 \\Rightarrow -4\\%',
      },
      {
        term: 'Sammansatt ränta',
        en: 'Compound interest',
        definition: 'Ränta beräknas på det växande kapitalet: $S = P(1 + r/100)^n$, där $P$ är startkapital, $r$ är ränta per period och $n$ är antal perioder.',
        tex: 'S = P\\!\\left(1 + \\tfrac{r}{100}\\right)^{\\!n}',
        note: 'Jämför med enkel ränta: $S = P(1 + nr/100)$. Sammansatt ränta är alltid större för $n > 1$.',
      },
      {
        term: 'Bakåtberäkning',
        en: 'Reverse percentage',
        definition: 'Hitta ursprungsvärdet givet det nya värdet och procentförändringen: $\\text{orig} = \\dfrac{\\text{nytt}}{1 + p/100}$.',
        note: 'Vanlig fälla: om priset efter 25% ökning är 750 kr, är ursprunget $750 / 1{,}25 = 600$ kr — inte $750 - 25\\% \\times 750$.',
      },
    ],
    examples: [
      {
        problem: 'En tröja kostar 480 kr. Butiken sätter ned priset med 15%. Vad kostar den nu?',
        steps: [
          'Minskning med 15% = multiplicera med $1 - 0{,}15 = 0{,}85$',
          '$480 \\times 0{,}85 = 408$ kr',
        ],
        answer: '408 kr',
      },
      {
        problem: 'Aktien ökar med 20% ett år och minskar sedan med 20%. Hur stor är den totala förändringen?',
        steps: [
          'Ökning: $\\times 1{,}2$. Minskning: $\\times 0{,}8$',
          'Totalt: $1{,}2 \\times 0{,}8 = 0{,}96$',
          'Förändring: $0{,}96 - 1 = -0{,}04 = -4\\%$',
        ],
        answer: '$-4\\%$ (nettominskning)',
      },
      {
        problem: 'Efter en ökning med 25% kostar en vara 750 kr. Vad kostade den ursprungligen?',
        steps: [
          'Nytt pris = gammalt pris $\\times 1{,}25$',
          'Gammalt pris = $750 / 1{,}25 = 600$ kr',
        ],
        answer: '600 kr',
      },
    ],
    selfCheck: [
      {
        question: 'En tröja kostar 400 kr. Priset höjs med 25%. Vilket är det nya priset?',
        options: ['425 kr', '500 kr', '480 kr'],
        correct: 1,
        explanation: '$+25\\% = \\times 1{,}25$. $400 \\times 1{,}25 = 500$ kr. Tänk multiplikativt, inte additivt.',
      },
      {
        question: 'Priset ökar med 20%, sedan minskar med 20%. Vad är nettoresultatet?',
        options: ['Ingen förändring (±0%)', 'Minskning med 4%', 'Ökning med 4%'],
        correct: 1,
        explanation: '$1{,}2 \\times 0{,}8 = 0{,}96$ — en minskning med 4%. Ändringar multipliceras, adderas inte.',
      },
      {
        question: 'En vara kostar 630 kr efter 5% rabatt. Vad var ursprungspriset?',
        options: ['$630 + 5\\% \\times 630 = 661{,}5$ kr', '$630 / 0{,}95 = 663$ kr', '$630 \\times 0{,}95 = 598{,}5$ kr'],
        correct: 1,
        explanation: 'Bakåtberäkning: nytt = gammalt $\\times 0{,}95$, alltså gammalt $= 630 / 0{,}95 \\approx 663$ kr.',
      },
    ],
    lesson: {
      hook: 'Procent är HPets vardagsspråk. Priser, räntor, befolkningsförändringar — allt uttrycks i procent. Kan du procent räknar du rätt när alla andra gör misstaget.',
      core: 'Procent = "per hundra". Men det smarta tänkandet: tänk i faktorer, inte additioner.\n\n+20% = multiplicera med $1{,}2$. −15% = multiplicera med $0{,}85$. Kombinera ändringar genom att multiplicera faktorerna: +20% sedan −20% ger $1{,}2 \\times 0{,}8 = 0{,}96$.',
      keyInsight: '+20% följt av −20% är INTE ±0%. Det är $1{,}2 \\times 0{,}8 = 0{,}96$ = −4%. Additiv tankemodell ger alltid fel svar. Tänk multiplikativt.',
      hpPattern: 'Bakåtberäkning — hitta ursprungspriset',
      pattern: '"Priset är 750 kr efter 25% ökning. Vad var ursprunget?" Nytt pris = original × 1,25 → original = $750 ÷ 1{,}25 = 600$ kr. Dela ALDRIG med procenten direkt.',
      rule: 'Skriv ALLTID om procent som multiplikationsfaktor: $+p\\% = \\times(1 + p/100)$, $-p\\% = \\times(1 - p/100)$. Multiplicera faktorer i följd — addera dem aldrig.',
    },
  },
  {
    id: 'sannolikhet',
    icon: '⚀',
    name: 'Sannolikhet & Kombinatorik',
    subtitle: 'Chans, val & arrangemang',
    tier: 1,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['probability', 'combinatorics', 'conditionalprobability', 'sets', 'dice'],
    drillTag: 'probability',
    frequency: 'Mycket vanligt i XYZ — ofta 3–4 uppgifter per prov',
    whyItMatters: 'Sannolikhet och kombinatorik bygger på enkla räkneprinciper. Varje extra uppgift du bemästrar här är en garanterad poäng — rätt svar kräver sällan avancerade beräkningar, bara rätt resonemang.',
    hpInsight: 'HP-sannolikhet är nästan alltid klassisk sannolikhet (lika sannolika utfall). Rita utrymmet av möjliga utfall. Räkna gynnsamma. Dela.',
    formulas: [
      { label: 'Klassisk sannolikhet', tex: 'P(A) = \\dfrac{\\text{gynnsamma}}{\\text{möjliga}}' },
      { label: 'Komplementregeln', tex: 'P(A^c) = 1 - P(A)' },
      { label: 'Multiplikationsregel (oberoende)', tex: 'P(A \\cap B) = P(A) \\cdot P(B)' },
      { label: 'Additionsregel', tex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)' },
      { label: 'Kombinationer', tex: '\\binom{n}{k} = \\dfrac{n!}{k!\\,(n-k)!}' },
      { label: 'Permutationer', tex: 'P(n,k) = \\dfrac{n!}{(n-k)!}' },
    ],
    traps: [
      'Utan återläggning: antalet möjliga utfall minskar efter varje drag',
      'Minst en: använd komplement — $P(\\geq 1) = 1 - P(\\text{ingen})$',
      'Ordning spelar roll vid permutationer men inte kombinationer',
    ],
    concepts: [
      {
        term: 'Händelserum (utfallsrum)',
        en: 'Sample space',
        definition: 'Mängden av alla möjliga utfall i ett slumpexperiment, betecknas $\\Omega$. Vid ett tärningskast: $\\Omega = \\{1, 2, 3, 4, 5, 6\\}$.',
      },
      {
        term: 'Händelse',
        en: 'Event',
        definition: 'En delmängd av händelserummet. Händelsen "jämnt tal" vid ett tärningskast är $A = \\{2, 4, 6\\}$.',
      },
      {
        term: 'Klassisk sannolikhet',
        en: 'Classical probability',
        definition: 'Gäller när alla utfall är lika sannolika: $P(A) = \\dfrac{|A|}{|\\Omega|}$, dvs. antalet gynnsamma utfall delat med antalet möjliga.',
        tex: 'P(A) = \\dfrac{\\text{gynnsamma utfall}}{\\text{möjliga utfall}}',
      },
      {
        term: 'Komplementhändelse',
        en: 'Complementary event',
        definition: '$A^c$ (eller $\\bar{A}$) är händelsen att $A$ INTE inträffar. $P(A^c) = 1 - P(A)$. Använd komplement när "minst en" är enklare att beräkna via negationen.',
        tex: 'P(A^c) = 1 - P(A)',
      },
      {
        term: 'Oberoende händelser',
        en: 'Independent events',
        definition: 'Händelserna $A$ och $B$ är oberoende om utfallet av den ena inte påverkar den andra: $P(A \\cap B) = P(A) \\cdot P(B)$.',
        note: 'Exempel: kasta ett mynt två gånger. Varje kast är oberoende.',
      },
      {
        term: 'Kombination',
        en: 'Combination',
        definition: 'Antal sätt att välja $k$ objekt ur $n$ utan hänsyn till ordning: $\\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}$.',
        tex: '\\binom{5}{2} = \\dfrac{5!}{2! \\cdot 3!} = 10',
        note: 'Nyckel: ordningen spelar ingen roll. Välj lag ur spelare — inte vem som är kapten.',
      },
      {
        term: 'Permutation',
        en: 'Permutation',
        definition: 'Antal sätt att arrangera $k$ objekt ur $n$ där ordningen spelar roll: $P(n,k) = \\dfrac{n!}{(n-k)!}$.',
        tex: 'P(5,2) = \\dfrac{5!}{3!} = 20',
        note: 'Nyckel: ordningen spelar roll. Hur många sätt kan 3 löpare nå mål på plats 1, 2 och 3?',
      },
      {
        term: 'Fakultet',
        en: 'Factorial',
        definition: '$n! = n \\times (n-1) \\times \\cdots \\times 2 \\times 1$. Per definition $0! = 1$.',
        tex: '5! = 5 \\times 4 \\times 3 \\times 2 \\times 1 = 120',
      },
    ],
    examples: [
      {
        problem: 'En urna innehåller 3 röda och 5 blå kulor. En kula dras slumpmässigt. Vad är sannolikheten att den är röd?',
        steps: [
          'Möjliga utfall: $3 + 5 = 8$',
          'Gynnsamma utfall (röd): $3$',
          '$P(\\text{röd}) = 3/8$',
        ],
        answer: '$P = \\dfrac{3}{8} = 37{,}5\\%$',
      },
      {
        problem: 'Slå en tärning två gånger. Vad är sannolikheten att få minst en sexa?',
        steps: [
          'Använd komplement: $P(\\text{minst en } 6) = 1 - P(\\text{ingen } 6)$',
          '$P(\\text{ingen } 6)$ vid ett kast $= 5/6$',
          '$P(\\text{ingen } 6)$ vid två kast (oberoende) $= (5/6)^2 = 25/36$',
          '$P(\\text{minst en}) = 1 - 25/36 = 11/36$',
        ],
        answer: '$P = \\dfrac{11}{36} \\approx 30{,}6\\%$',
      },
      {
        problem: 'På hur många sätt kan 3 böcker väljas ur en samling av 7?',
        steps: [
          'Ordningen spelar ingen roll → kombination',
          '$\\binom{7}{3} = \\dfrac{7!}{3! \\cdot 4!} = \\dfrac{7 \\times 6 \\times 5}{3 \\times 2 \\times 1} = 35$',
        ],
        answer: '35 sätt',
      },
    ],
    selfCheck: [
      {
        question: 'En urna har 4 röda och 6 blå kulor. Vad är $P(\\text{röd})$?',
        options: ['$2/5$', '$4/6$', '$4/10$'],
        correct: 2,
        explanation: '$P = \\text{gynnsamma} / \\text{möjliga} = 4/10 = 2/5$. Observera att $4/10$ och $2/5$ är samma värde — svaret ges med båda.',
      },
      {
        question: 'Du kastar ett mynt tre gånger. Vad är $P(\\text{minst en krona})$?',
        options: ['$3/8$', '$7/8$', '$1/2$'],
        correct: 1,
        explanation: 'Komplement: $P(\\text{minst 1}) = 1 - P(\\text{ingen krona}) = 1 - (1/2)^3 = 1 - 1/8 = 7/8$.',
      },
      {
        question: 'Ordningen spelar ingen roll. Hur många sätt att välja 2 ur 5?',
        options: ['$P(5,2) = 20$', '$\\binom{5}{2} = 10$', '$5 \\times 2 = 10$'],
        correct: 1,
        explanation: 'Ordning spelar ingen roll → kombination. $\\binom{5}{2} = 5!/(2!\\cdot 3!) = 10$.',
      },
    ],
    lesson: {
      hook: 'Sannolikhet på HP är aldrig avancerad statistik. Det handlar om att räkna gynnsamma utfall och dela med möjliga. Men fallen är välkonstruerade för att snärja dig — ett "minst ett" problem, utan återläggning, eller ett kombinatorikproblem.',
      core: 'Grundformeln: $P(A) = \\dfrac{\\text{gynnsamma utfall}}{\\text{möjliga utfall}}$. Rita alltid upp utfallsrummet — det är din karta. Tärning: $\\Omega = \\{1,2,3,4,5,6\\}$. Två tärningar: 36 möjliga par.',
      keyInsight: '"Minst en"-uppgifter löses alltid med komplement: $P(\\text{minst 1}) = 1 - P(\\text{ingen})$. Det är nästan alltid enklare att beräkna noll-fallet och subtrahera från 1.',
      hpPattern: 'Utan återläggning — sannolikhetskedjor',
      pattern: 'Urna med 3 röda och 5 blå. Dra 2 utan återläggning. Sannolikhet att båda är röda: $\\frac{3}{8} \\times \\frac{2}{7} = \\frac{6}{56} = \\frac{3}{28}$. Täljaren minskar med 1 efter varje drag.',
      rule: 'Ordning spelar roll → permutation $P(n,k) = n!/(n-k)!$. Ordning spelar ingen roll → kombination $\\binom{n}{k}$. Fråga alltid: är "välj 3 ur 5" ett lag (kombination) eller en rangordning (permutation)?',
    },
  },
  {
    id: 'funktioner',
    icon: 'f(x)',
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
      { label: 'Linjär funktion', tex: 'f(x) = kx + m' },
      { label: 'Lutning (derivata)', tex: 'k = \\dfrac{y_2 - y_1}{x_2 - x_1}' },
      { label: 'Avstånd', tex: 'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}' },
      { label: 'Mittpunkt', tex: 'M = \\left(\\dfrac{x_1+x_2}{2},\\,\\dfrac{y_1+y_2}{2}\\right)' },
      { label: 'Vertex (andragrads)', tex: 'x_v = -\\dfrac{b}{2a},\\quad y_v = f(x_v)' },
      { label: 'Exponentialfunktion', tex: 'f(x) = a \\cdot r^x,\\quad r > 0' },
    ],
    traps: [
      'Negativ lutning ≠ funktion som alltid är negativ — lutningen beskriver förändringen',
      'Vertex = topp om $a < 0$, botten om $a > 0$ i $f(x) = ax^2 + bx + c$',
      'Nollställen = x-värden där $f(x) = 0$, inte $x = 0$',
    ],
    concepts: [
      {
        term: 'Funktion',
        en: 'Function',
        definition: 'En regel som tilldelar varje element i definitionsmängden $D_f$ exakt ett element i värdemängden. Betecknas $f: D_f \\to \\mathbb{R}$.',
        note: 'Vertikell linjetest: om en lodrät linje skär grafen mer än en gång, är det inte en funktion.',
      },
      {
        term: 'Lutning (riktningskoefficient)',
        en: 'Slope',
        definition: 'Mäter hur brant en linje stiger eller sjunker per enhet längs x-axeln: $k = \\dfrac{\\Delta y}{\\Delta x} = \\dfrac{y_2 - y_1}{x_2 - x_1}$.',
        tex: 'k = \\dfrac{y_2 - y_1}{x_2 - x_1}',
        note: '$k > 0$: stigande. $k < 0$: sjunkande. $k = 0$: horisontell.',
      },
      {
        term: 'y-skärning',
        en: 'y-intercept',
        definition: 'Värdet $m$ i $f(x) = kx + m$ — var linjen skär y-axeln, dvs. $f(0) = m$.',
      },
      {
        term: 'Nollställe',
        en: 'Zero / Root',
        definition: 'Det x-värde där $f(x) = 0$. Geometriskt: var grafen skär x-axeln.',
        tex: 'f(x) = 0 \\implies x = x_0',
      },
      {
        term: 'Vertex (toppunkt)',
        en: 'Vertex',
        definition: 'Lägsta (om $a > 0$) eller högsta (om $a < 0$) punkt på en parabel $f(x) = ax^2 + bx + c$. x-koordinaten: $x_v = -b/(2a)$.',
        tex: 'x_v = -\\frac{b}{2a}',
      },
      {
        term: 'Exponentiell tillväxt/avtagande',
        en: 'Exponential growth/decay',
        definition: '$f(x) = a \\cdot r^x$. Om $r > 1$ har vi tillväxt; om $0 < r < 1$ har vi avtagande. Konstanten $a$ är startvärdet $(f(0) = a)$.',
        tex: 'f(x) = a \\cdot r^x',
      },
    ],
    examples: [
      {
        problem: 'Hitta ekvationen för linjen genom $(2, 5)$ och $(6, 13)$',
        steps: [
          'Lutning: $k = (13-5)/(6-2) = 8/4 = 2$',
          'Använd punktformel: $y - 5 = 2(x - 2)$',
          'Förenkla: $y = 2x + 1$',
        ],
        answer: '$f(x) = 2x + 1$',
      },
      {
        problem: 'Hitta vertex för $f(x) = -x^2 + 4x + 1$',
        steps: [
          'Identifiera $a = -1$, $b = 4$',
          '$x_v = -b/(2a) = -4/(2 \\cdot (-1)) = 2$',
          '$y_v = f(2) = -(4) + 8 + 1 = 5$',
        ],
        answer: 'Vertex: $(2, 5)$. Parabel öppnas nedåt ($a < 0$) → detta är max.',
      },
      {
        problem: 'Hur långt är avståndet mellan punkterna $A(-1, 2)$ och $B(3, 5)$?',
        steps: [
          '$d = \\sqrt{(3-(-1))^2 + (5-2)^2}$',
          '$= \\sqrt{16 + 9} = \\sqrt{25} = 5$',
        ],
        answer: '$d = 5$ enheter',
      },
    ],
    selfCheck: [
      {
        question: 'Funktionen $f(x) = -3x + 5$ — är den stigande eller sjunkande?',
        options: ['Stigande ($k > 0$)', 'Sjunkande ($k < 0$)', 'Konstant ($k = 0$)'],
        correct: 1,
        explanation: 'Lutningen $k = -3 < 0$, alltså är funktionen sjunkande — för varje steg höger minskar $f(x)$.',
      },
      {
        question: 'Var skär $f(x) = 2x - 6$ x-axeln (nollstället)?',
        options: ['$x = -6$', '$x = 3$', '$x = 6$'],
        correct: 1,
        explanation: 'Nollstället: $f(x) = 0$ → $2x - 6 = 0$ → $x = 3$. Det är punkt $(3, 0)$ på grafen.',
      },
      {
        question: 'Parabeln $f(x) = x^2 - 4x + 1$ — är toppvärdet ett minimum eller maximum?',
        options: ['Minimum (parabeln öppnas uppåt)', 'Maximum (parabeln öppnas nedåt)', 'Varken-eller'],
        correct: 0,
        explanation: 'Koefficienten $a = 1 > 0$ → parabeln öppnas uppåt → vertex är ett minimum.',
      },
    ],
    lesson: {
      hook: 'Funktioner kopplar algebra till bilder. En linjär funktion är en rät linje. En parabel är en andragradsfunktion. Förstår du grafens form kan du lösa uppgiften utan att räkna alls.',
      core: '$f(x) = kx + m$ är en rät linje. $k$ är lutningen — hur brant linjen stiger per enhet i x-led. $m$ är y-skärningen — var linjen korsar y-axeln (när $x=0$). $k > 0$: stiger. $k < 0$: sjunker. $k = 0$: horisontell.',
      keyInsight: 'Du behöver sällan exakta beräkningar. Fråga dig: stiger eller sjunker? Var skär den x-axeln (nollställe = sätt $f(x) = 0$)? Är det ett minimum eller maximum (vertex)?',
      hpPattern: 'Hitta linjen genom två punkter',
      pattern: 'Ges punkterna $(x_1, y_1)$ och $(x_2, y_2)$: beräkna $k = \\frac{y_2-y_1}{x_2-x_1}$, sedan $m = y_1 - k \\cdot x_1$. Detta är den vanligaste koordinatgeometriuppgiften på HP.',
      rule: 'Vertex för $f(x) = ax^2 + bx + c$: $x_v = -b/(2a)$. Om $a > 0$: minimum (parabel öppnas uppåt). Om $a < 0$: maximum (parabel öppnas nedåt). Bara en formel att memorera.',
    },
  },
  {
    id: 'aritmetik',
    icon: 'ℕ',
    name: 'Aritmetik & Talteori',
    subtitle: 'Räknelagar, primtal & delbarhetsregler',
    tier: 2,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['arithmetic', 'numbertheory', 'number-theory', 'divisibility', 'primes', 'prime-numbers', 'parity', 'integers'],
    drillTag: 'arithmetic',
    frequency: 'Vanligt — men ofta lättare uppgifter om du kan reglerna',
    whyItMatters: 'Aritmetik och talteori-uppgifter ser skrämmande ut men är bland de snabbast lösta om du känner till ett fåtal tumregler. De flesta HP-studenter missar dem för att de aldrig lärt sig grunderna.',
    hpInsight: 'Delbarhetsregler sparar tid. Istället för att dividera, kontrollera snabbt: delbart med 3 om siffersumman är delbar med 3.',
    formulas: [
      { label: 'Delbart med 2', tex: '\\text{sista siffran är jämn}' },
      { label: 'Delbart med 3', tex: '\\text{siffersumman delbar med } 3' },
      { label: 'Delbart med 4', tex: '\\text{de två sista siffrorna delbara med } 4' },
      { label: 'Delbart med 9', tex: '\\text{siffersumman delbar med } 9' },
      { label: 'Primfaktorisering', tex: 'n = p_1^{a_1} \\cdot p_2^{a_2} \\cdots p_k^{a_k}' },
      { label: 'SGD via Euklides', tex: '\\gcd(a, b) = \\gcd(b,\\, a \\bmod b)' },
    ],
    traps: [
      '1 är INTE ett primtal',
      'SGD (största gemensamma divisor) och MGM (minsta gemensamma multipel) — håll isär dem',
      'Jämnt × jämnt = jämnt, udda × udda = udda, jämnt × udda = jämnt',
    ],
    concepts: [
      {
        term: 'Naturliga tal',
        en: 'Natural numbers',
        definition: 'Talmängden $\\mathbb{N} = \\{1, 2, 3, 4, \\ldots\\}$ (positiva heltal). Ibland inkluderas 0.',
      },
      {
        term: 'Heltal',
        en: 'Integers',
        definition: '$\\mathbb{Z} = \\{\\ldots, -2, -1, 0, 1, 2, \\ldots\\}$ — alla positiva och negativa heltal samt noll.',
      },
      {
        term: 'Rationella tal',
        en: 'Rational numbers',
        definition: '$\\mathbb{Q}$: tal som kan skrivas som $p/q$ där $p, q \\in \\mathbb{Z}$ och $q \\neq 0$. Inkluderar alla heltal och bråk.',
        note: 'Irrationella tal (t.ex. $\\sqrt{2}$, $\\pi$) kan INTE skrivas exakt som bråk.',
      },
      {
        term: 'Primtal',
        en: 'Prime number',
        definition: 'Naturligt tal $> 1$ med exakt två delare: 1 och sig självt. Primtalen börjar: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, ...',
        note: '1 är inte ett primtal. 2 är det enda jämna primtalet.',
      },
      {
        term: 'Primfaktorisering',
        en: 'Prime factorization',
        definition: 'Att skriva ett heltal som en produkt av primtal: $60 = 2^2 \\times 3 \\times 5$. Varje tal har en unik primfaktorisering (Aritmetikens fundamentalsats).',
        tex: '60 = 2^2 \\times 3 \\times 5',
      },
      {
        term: 'SGD (Största gemensamma divisor)',
        en: 'GCD (Greatest common divisor)',
        definition: 'Det största tal som delar två heltal utan rest. $\\gcd(12, 18) = 6$.',
        note: 'Hitta SGD via primfaktorisering: ta gemensamma primfaktorer med minsta exponent.',
      },
      {
        term: 'MGM (Minsta gemensamma multipel)',
        en: 'LCM (Least common multiple)',
        definition: 'Det minsta positiva tal som är delbart med både $a$ och $b$. $\\text{lcm}(4, 6) = 12$.',
        tex: '\\text{lcm}(a,b) = \\dfrac{a \\times b}{\\gcd(a,b)}',
      },
    ],
    examples: [
      {
        problem: 'Är 3 528 delbart med 9?',
        steps: [
          'Beräkna siffersumman: $3 + 5 + 2 + 8 = 18$',
          '$18$ är delbart med $9$ (eftersom $18 = 2 \\times 9$)',
        ],
        answer: 'Ja, 3 528 är delbart med 9.',
      },
      {
        problem: 'Primfaktorisera 360',
        steps: [
          '$360 = 2 \\times 180$',
          '$= 2 \\times 2 \\times 90 = 4 \\times 90$',
          '$= 4 \\times 9 \\times 10 = 2^2 \\times 3^2 \\times 2 \\times 5$',
          '$= 2^3 \\times 3^2 \\times 5$',
        ],
        answer: '$360 = 2^3 \\times 3^2 \\times 5$',
      },
    ],
    selfCheck: [
      {
        question: 'Är 4 137 delbart med 3?',
        options: ['Nej — 4137 är inte jämnt', 'Ja — siffersumman $4+1+3+7=15$ är delbar med 3', 'Nej — det slutar inte på 0 eller 5'],
        correct: 1,
        explanation: 'Delbart med 3: kontrollera siffersumman. $4+1+3+7=15$, $15/3=5$. Ja, 4137 är delbart med 3.',
      },
      {
        question: 'Vilket av följande är ett primtal?',
        options: ['51 (=3×17)', '1', '29'],
        correct: 2,
        explanation: '29 är ett primtal — det har inga delare utom 1 och sig självt. 1 är inte ett primtal per definition.',
      },
      {
        question: 'Produkten av ett jämnt och ett udda heltal är alltid...',
        options: ['Udda', 'Jämnt', 'Beror på talen'],
        correct: 1,
        explanation: 'Jämnt × vad som helst = jämnt. Om ett av faktorerna är jämnt (delbar med 2) är produkten det också.',
      },
    ],
    lesson: {
      hook: 'Aritmetikuppgifter ser stela och tekniska ut men är bland de snabbast lösta på HP — om du kan fem delbarhetsregler utantill. Utan dem görs onödig division. Med dem: ett ögonkast.',
      core: 'Alla heltal kan brytas ned i primtal (primfaktorisering). $60 = 2^2 \\times 3 \\times 5$ avslöjar omedelbart alla divisorer och ger SGD/MGM direkt.\n\nDelbarhetsregler: delbart med 2 (jämn slutsiffra), med 3 (siffersumma delbar med 3), med 9 (siffersumma delbar med 9), med 4 (de två sista siffrorna).',
      keyInsight: 'Du behöver aldrig utföra division för att kontrollera delbarhet. Siffersumman av $3528$: $3+5+2+8=18$ → delbart med 9. Det tar en sekund, inte tio.',
      hpPattern: 'Jämnt/udda och delbarhet i NOG/KVA',
      pattern: '"Är produkten av tre på varandra följande heltal alltid delbar med 6?" Bland tre konsekutiva heltal finns alltid ett jämnt (delbar med 2) och ett delbart med 3 → produkten alltid delbar med 6.',
      rule: '$1$ är INTE primtal. $2$ är det enda jämna primtalet. Primtalen under $30$: $2, 3, 5, 7, 11, 13, 17, 19, 23, 29$. Memorera dessa.',
    },
  },
  {
    id: 'potenser',
    icon: 'aⁿ',
    name: 'Potenser & Rötter',
    subtitle: 'Exponentregler & wurzelberechnungen',
    tier: 2,
    sections: ['XYZ', 'KVA'],
    tags: ['powers', 'roots', 'exponent', 'squares', 'absolutevalue'],
    drillTag: 'powers',
    frequency: 'Vanligt i KVA — jämföra potenser utan att räkna ut dem',
    whyItMatters: 'KVA älskar potenser. "Vilket är störst: $2^{10}$ eller $3^7$?" Du ska inte räkna ut det — du ska resonera om storleksordning.',
    hpInsight: 'Memorera $2^{10} = 1024 \\approx 10^3$. Det kopplar binär- och tiopotenser och ger snabb uppskattning.',
    formulas: [
      { label: 'Produktregel', tex: 'a^m \\cdot a^n = a^{m+n}' },
      { label: 'Kvotregel', tex: '\\dfrac{a^m}{a^n} = a^{m-n}' },
      { label: 'Potensregel', tex: '(a^m)^n = a^{mn}' },
      { label: 'Produktens potens', tex: '(ab)^n = a^n b^n' },
      { label: 'Negativ exponent', tex: 'a^{-n} = \\dfrac{1}{a^n}' },
      { label: 'Bråkexponent', tex: 'a^{m/n} = \\sqrt[n]{a^m}' },
      { label: 'Rotprodukt', tex: '\\sqrt{ab} = \\sqrt{a}\\cdot\\sqrt{b}' },
    ],
    traps: [
      '$(-2)^2 = 4$ men $-2^2 = -4$ — parentesen spelar roll',
      '$\\sqrt{a^2} = |a|$, inte $a$ — roten är alltid icke-negativ',
      '$2^3 \\cdot 3^3 = 6^3$, men $2^3 + 3^3 \\neq 5^3$ — produktregeln gäller inte för summor',
    ],
    concepts: [
      {
        term: 'Potens',
        en: 'Power / Exponent',
        definition: '$a^n$ betyder $a$ multiplicerat med sig självt $n$ gånger: $a^n = \\underbrace{a \\times a \\times \\cdots \\times a}_{n \\text{ faktorer}}$. $a$ kallas bas, $n$ kallas exponent.',
        tex: '2^5 = 2 \\times 2 \\times 2 \\times 2 \\times 2 = 32',
      },
      {
        term: 'Nollexponent',
        en: 'Zero exponent',
        definition: '$a^0 = 1$ för alla $a \\neq 0$. Motivering: $a^n / a^n = a^{n-n} = a^0$, och $a^n/a^n = 1$.',
        tex: '7^0 = 1,\\quad (-5)^0 = 1',
      },
      {
        term: 'Negativ exponent',
        en: 'Negative exponent',
        definition: '$a^{-n} = \\dfrac{1}{a^n}$, $a \\neq 0$. En negativ exponent betyder reciprok.',
        tex: '2^{-3} = \\dfrac{1}{2^3} = \\dfrac{1}{8}',
      },
      {
        term: 'Bråkexponent',
        en: 'Fractional exponent',
        definition: '$a^{1/n} = \\sqrt[n]{a}$ och mer allmänt $a^{m/n} = \\sqrt[n]{a^m} = (\\sqrt[n]{a})^m$.',
        tex: '8^{2/3} = (\\sqrt[3]{8})^2 = 2^2 = 4',
      },
      {
        term: 'Absolutbelopp',
        en: 'Absolute value',
        definition: '$|a| = a$ om $a \\geq 0$, och $|a| = -a$ om $a < 0$. Geometriskt: avståndet från $a$ till $0$ på tallinjen.',
        tex: '|-7| = 7,\\quad |3| = 3',
        note: '$\\sqrt{a^2} = |a|$ — viktigt att inte förlora minustecknet.',
      },
    ],
    examples: [
      {
        problem: 'Förenkla $\\dfrac{x^5 \\cdot x^{-2}}{x^3}$',
        steps: [
          'Täljare: $x^5 \\cdot x^{-2} = x^{5+(-2)} = x^3$',
          'Division: $x^3 / x^3 = x^{3-3} = x^0 = 1$',
        ],
        answer: '$1$',
      },
      {
        problem: 'Beräkna $27^{2/3}$',
        steps: [
          '$27^{2/3} = (27^{1/3})^2 = (\\sqrt[3]{27})^2$',
          '$\\sqrt[3]{27} = 3$ (eftersom $3^3 = 27$)',
          '$3^2 = 9$',
        ],
        answer: '$27^{2/3} = 9$',
      },
    ],
    selfCheck: [
      {
        question: 'Förenkla $x^3 \\cdot x^4$.',
        options: ['$x^{12}$', '$x^7$', '$x^{3/4}$'],
        correct: 1,
        explanation: 'Produktregel: $x^m \\cdot x^n = x^{m+n}$. Alltså $x^3 \\cdot x^4 = x^{3+4} = x^7$.',
      },
      {
        question: 'Vad är $(-3)^2$?',
        options: ['$-9$', '$9$', '$-6$'],
        correct: 1,
        explanation: '$(-3)^2 = (-3) \\times (-3) = +9$. Parentesen inkluderar minustecknet. Obs: $-3^2 = -(3^2) = -9$ utan parentes.',
      },
      {
        question: 'Vad är $8^{1/3}$?',
        options: ['$8/3$', '$2$', '$\\sqrt{8}$'],
        correct: 1,
        explanation: '$a^{1/3} = \\sqrt[3]{a}$. $\\sqrt[3]{8} = 2$ eftersom $2^3 = 8$.',
      },
    ],
    lesson: {
      hook: 'KVA testar potenser konstant: "Vilket är störst: $2^{10}$ eller $3^7$?" Du ska inte räkna ut dem — du ska resonera om storleksordning med hjälp av reglerna.',
      core: '$a^n$ betyder $a$ multiplicerat med sig självt $n$ gånger. De tre huvudreglerna: $a^m \\cdot a^n = a^{m+n}$ (addera exponenter vid multiplikation), $a^m / a^n = a^{m-n}$ (subtrahera vid division), $(a^m)^n = a^{mn}$ (multiplicera vid potens av potens).',
      keyInsight: 'Negativ exponent = reciprok: $a^{-n} = 1/a^n$. Bråkexponent = rot: $a^{1/n} = \\sqrt[n]{a}$. Därför $8^{1/3} = \\sqrt[3]{8} = 2$. Känn igen dessa mönster utan att behöva härleda.',
      hpPattern: 'Jämföra potenser utan att räkna ut dem',
      pattern: '$2^{10}$ vs $3^7$: uppskatta. $2^{10} = 1024$. $3^7 = 3^6 \\times 3 = 729 \\times 3 = 2187$. Alltså $3^7 > 2^{10}$. Alternativt: prova ta gemensam exponent eller ta logaritm.',
      rule: '$(-2)^2 = 4$ men $-2^2 = -4$. Parentesen avgör allt. Och $\\sqrt{a^2} = |a|$, inte $a$ — roten är alltid icke-negativ.',
    },
  },
  {
    id: 'statistik',
    icon: 'x̄',
    name: 'Statistik & Medelvärden',
    subtitle: 'Medelvärde, median & spridning',
    tier: 2,
    sections: ['XYZ'],
    tags: ['statistics', 'mean', 'median'],
    drillTag: 'statistics',
    frequency: 'Måttligt — men alltid med snabbt lösbart mönster',
    whyItMatters: 'Statistikuppgifter på HP testar om du förstår vad medelvärde och median innebär och vad som händer när du lägger till eller tar bort ett värde.',
    hpInsight: 'Nyckeltrick: om medelvärdet för $n$ tal är $\\bar{x}$, är summan av alla tal $n \\times \\bar{x}$. Det låser upp de flesta HP-statistikuppgifterna.',
    formulas: [
      { label: 'Medelvärde', tex: '\\bar{x} = \\dfrac{\\sum_{i=1}^n x_i}{n}' },
      { label: 'Totalsum', tex: '\\text{Summa} = \\bar{x} \\times n' },
      { label: 'Vägat medelvärde', tex: '\\bar{x}_w = \\dfrac{\\sum w_i x_i}{\\sum w_i}' },
      { label: 'Variationsbredd', tex: 'R = x_{\\max} - x_{\\min}' },
    ],
    traps: [
      'Median är mittenvädet i ett sorterat dataset — inte medelvärdet',
      'Lägger du till ett värde lika med medelvärdet, förändras inte medelvärdet',
      'Jämnt antal värden: median = medelvärde av de två mitten',
    ],
    concepts: [
      {
        term: 'Medelvärde (aritmetiskt)',
        en: 'Arithmetic mean',
        definition: 'Summan av alla värden dividerat med antalet värden: $\\bar{x} = \\dfrac{x_1 + x_2 + \\cdots + x_n}{n}$.',
        tex: '\\bar{x} = \\dfrac{\\sum x_i}{n}',
        note: 'Medelvärdet påverkas av extremvärden (outliers). Medianen gör det inte.',
      },
      {
        term: 'Median',
        en: 'Median',
        definition: 'Mittenvädet i ett sorterat dataset. Vid jämnt antal värden: medelvärdet av de två mittersta.',
        note: 'Sortera ALLTID datan innan du hittar medianen.',
      },
      {
        term: 'Typvärde (mod)',
        en: 'Mode',
        definition: 'Det värde som förekommer flest gånger i datasetet. Ett dataset kan ha flera typvärden eller inget.',
      },
      {
        term: 'Variationsbredd',
        en: 'Range',
        definition: 'Skillnaden mellan det högsta och lägsta värdet: $R = x_{\\max} - x_{\\min}$. Enkelt mått på spridning.',
      },
      {
        term: 'Vägat medelvärde',
        en: 'Weighted mean',
        definition: 'Varje värde multipliceras med sin vikt (frekvens eller andel): $\\bar{x}_w = \\dfrac{\\sum w_i x_i}{\\sum w_i}$.',
        note: 'Används t.ex. för att beräkna snittsbetyg när kurser har olika poäng.',
      },
    ],
    examples: [
      {
        problem: 'Medelvärdet för 5 tal är 12. Fyra av talen är 8, 10, 15 och 14. Vad är det femte talet?',
        steps: [
          'Summan av alla 5 tal = $\\bar{x} \\times n = 12 \\times 5 = 60$',
          'Summan av de 4 kända: $8 + 10 + 15 + 14 = 47$',
          'Femte talet: $60 - 47 = 13$',
        ],
        answer: 'Det femte talet är $13$.',
      },
      {
        problem: 'Hitta medianen för datasetet: 7, 3, 12, 5, 9, 1, 8',
        steps: [
          'Sortera: $1, 3, 5, 7, 8, 9, 12$',
          'Antal värden: 7 (udda) → mitten är position 4',
          'Median = $7$',
        ],
        answer: 'Median $= 7$',
      },
    ],
    selfCheck: [
      {
        question: 'Medelvärdet av 4 tal är 10. Vad är summan av talen?',
        options: ['$10/4 = 2{,}5$', '$10 \\times 4 = 40$', '$10 + 4 = 14$'],
        correct: 1,
        explanation: 'Summa $= \\bar{x} \\times n = 10 \\times 4 = 40$. Det är nyckeltricket: vänd medelvärdesformeln.',
      },
      {
        question: 'Datasetet $\\{2, 5, 7, 9, 12\\}$ är sorterat. Vad är medianen?',
        options: ['$7$', '$7{,}0$', '$35/5 = 7$'],
        correct: 0,
        explanation: 'Medianen är mittenvädet i det sorterade datasetet. Här 5 värden → position 3 → värdet $7$.',
      },
      {
        question: 'Du lägger till ett nytt värde lika med nuvarande medelvärdet. Vad händer med medelvärdet?',
        options: ['Det ökar', 'Det förändras inte', 'Det minskar'],
        correct: 1,
        explanation: 'Summan ökar med $\\bar{x}$, antalet ökar med 1. Nytt medelvärde $= (n\\bar{x} + \\bar{x})/(n+1) = \\bar{x}$. Oförändrat.',
      },
    ],
    lesson: {
      hook: 'Statistikuppgifter på HP är kortare än de verkar. Det viktigaste tricket: $\\text{summa} = \\bar{x} \\times n$. Den formeln låser upp 80% av alla HP-statistikuppgifter.',
      core: 'Medelvärde $= \\text{summa} \\div \\text{antal}$. Men HP frågar sällan "beräkna medelvärdet direkt" — de ger dig medelvärdet och frågar om ett okänt värde. Vänd formeln: $\\text{summa} = \\bar{x} \\times n$, lös sedan ut det saknade värdet.',
      keyInsight: 'Lägger du till ett värde som EXAKT är lika med nuvarande medelvärde förändras medelvärdet inte — summan ökar och antal ökar med 1, kvoten förblir densamma. HP testar om du ser det.',
      hpPattern: 'Hitta det saknade värdet ur medelvärdet',
      pattern: '"Medelvärdet av 5 tal är 12. Fyra tal är 8, 10, 15, 14. Femte?" Summa = $12 \\times 5 = 60$. Kände summa = $47$. Femte $= 60 - 47 = 13$. En rad.',
      rule: 'Median ≠ medelvärde. SORTERA alltid datan innan du letar medianen — aldrig räkna direkt från osorterad lista. Median påverkas inte av extremvärden.',
    },
  },
  {
    id: 'geometri',
    icon: '△',
    name: 'Geometri & Mätning',
    subtitle: 'Area, omkrets, vinklar & Pythagoras',
    tier: 2,
    sections: ['XYZ', 'KVA', 'NOG'],
    tags: ['geometry', 'angles', 'triangle', 'area', 'perimeter', 'circle', 'rectangle', 'quadrilateral', 'pythagoras', 'pythagoreantheorem', 'Pythagoras'],
    drillTag: 'geometry',
    frequency: 'Vanligt — ofta kombinerat med algebra',
    whyItMatters: 'Geometri på HP kräver sällan avancerade bevis. Det handlar om att applicera rätt formel och se om du kan kombinera 2–3 steg. Rita alltid — det avslöjar lösningsvägen.',
    hpInsight: 'Pythagorassen är universalverktyget. Kan du identifiera en rätvinklig triangel i en figur — även om den inte är explicit ritad — har du nyckeln.',
    formulas: [
      { label: 'Pythagoras sats', tex: 'a^2 + b^2 = c^2' },
      { label: 'Triangelarea', tex: 'A = \\dfrac{b \\cdot h}{2}' },
      { label: 'Cirkelarea', tex: 'A = \\pi r^2' },
      { label: 'Cirkelomkrets', tex: 'C = 2\\pi r' },
      { label: 'Rektangelarea', tex: 'A = l \\times b' },
      { label: 'Trapetsarea', tex: 'A = \\dfrac{(a+b) \\cdot h}{2}' },
      { label: 'Vinkelsumma triangel', tex: '\\alpha + \\beta + \\gamma = 180°' },
    ],
    traps: [
      'Höjden i triangeln är VINKELRÄT mot basen — inte alltid en sida',
      'Likbent triangel ≠ liksidig triangel',
      'Vinkelsumma i triangel = 180°, i fyrhörning = 360°',
    ],
    concepts: [
      {
        term: 'Pythagoras sats',
        en: "Pythagorean theorem",
        definition: 'I en rätvinklig triangel med kateterna $a, b$ och hypotenusan $c$ gäller: $a^2 + b^2 = c^2$. Omvänt: om $a^2 + b^2 = c^2$ är triangeln rätvinklig.',
        tex: 'a^2 + b^2 = c^2',
        note: 'Vanliga pytagoreiska tripplar: $(3, 4, 5)$, $(5, 12, 13)$, $(8, 15, 17)$, $(7, 24, 25)$.',
      },
      {
        term: 'Liknande trianglar',
        en: 'Similar triangles',
        definition: 'Trianglar med samma vinklar men olika storlek. Sidorna är proportionella: om skalningsfaktorn är $k$, är alla sidor $k$ gånger så långa och arean $k^2$ gånger så stor.',
        note: 'AAA (alla vinklar lika) eller SAS (två sidor och mellanliggande vinkel proportionella) ger likformighet.',
      },
      {
        term: 'Komplementvinklar',
        en: 'Complementary angles',
        definition: 'Två vinklar som summerar till $90°$.',
      },
      {
        term: 'Supplementvinklar',
        en: 'Supplementary angles',
        definition: 'Två vinklar som summerar till $180°$.',
      },
      {
        term: 'Vertikalvinklar',
        en: 'Vertical angles',
        definition: 'När två linjer korsar varandra bildas fyra vinklar. Motstående (vertikala) vinklar är alltid lika stora.',
      },
      {
        term: 'Cirkel — grundbegrepp',
        en: 'Circle',
        definition: 'Mängden av alla punkter med exakt avståndet $r$ (radien) från en centrumpunkt $O$. Diameter $d = 2r$. Cirkelns area $A = \\pi r^2$, omkrets $C = 2\\pi r$.',
        tex: 'A = \\pi r^2,\\quad C = 2\\pi r',
      },
    ],
    examples: [
      {
        problem: 'En rätvinklig triangel har kateter 6 och 8. Hur lång är hypotenusan?',
        steps: [
          '$c^2 = a^2 + b^2 = 6^2 + 8^2 = 36 + 64 = 100$',
          '$c = \\sqrt{100} = 10$',
        ],
        answer: 'Hypotenusan är $10$.',
      },
      {
        problem: 'En cirkel har area $25\\pi$ cm². Hur lång är dess omkrets?',
        steps: [
          '$A = \\pi r^2 = 25\\pi \\Rightarrow r^2 = 25 \\Rightarrow r = 5$ cm',
          '$C = 2\\pi r = 2\\pi \\times 5 = 10\\pi$ cm',
        ],
        answer: '$C = 10\\pi \\approx 31{,}4$ cm',
      },
      {
        problem: 'En trapets har parallella sidor $a = 4$ och $b = 10$, höjd $h = 6$. Beräkna arean.',
        steps: [
          '$A = \\dfrac{(a+b) \\cdot h}{2} = \\dfrac{(4 + 10) \\times 6}{2}$',
          '$= \\dfrac{14 \\times 6}{2} = \\dfrac{84}{2} = 42$',
        ],
        answer: '$A = 42$ area-enheter',
      },
    ],
    selfCheck: [
      {
        question: 'En rätvinklig triangel har kateterna 5 och 12. Hur lång är hypotenusan?',
        options: ['$\\sqrt{17}$', '$13$', '$17$'],
        correct: 1,
        explanation: '$c^2 = 5^2 + 12^2 = 25 + 144 = 169$, alltså $c = \\sqrt{169} = 13$. Pytagoreisk trippel $(5, 12, 13)$.',
      },
      {
        question: 'En cirkel har radien 7. Vad är dess area?',
        options: ['$14\\pi$', '$49\\pi$', '$7\\pi^2$'],
        correct: 1,
        explanation: '$A = \\pi r^2 = \\pi \\times 7^2 = 49\\pi$. Glöm inte att kvadrera radien.',
      },
      {
        question: 'Vinkelsumman i en triangel är alltid...',
        options: ['$90°$', '$360°$', '$180°$'],
        correct: 2,
        explanation: 'Vinkelsumman i varje triangel är alltid $180°$. För fyrhörningar är det $360°$.',
      },
    ],
    lesson: {
      hook: 'Geometri på HP kräver aldrig bevis. Det handlar om att applicera rätt formel och kombinera 2–3 steg. Nyckeln: rita alltid figuren och märk ut alla kända mått — rätt figur avslöjar lösningsvägen.',
      core: 'Tre universalverktyg: (1) Pythagoras: $a^2 + b^2 = c^2$ i varje rätvinklig triangel. (2) Triangelarea: $\\frac{1}{2} \\times \\text{bas} \\times \\text{höjd}$ — höjden är ALLTID vinkelrät mot basen. (3) Cirkeln: $A = \\pi r^2$, $C = 2\\pi r$.',
      keyInsight: 'HP gömmer rätvinkliga trianglar i alla möjliga figurer. Ser du en rätvinklig triangel — även om den inte är explicit ritad — har du Pythagoras. Det är det vanligaste geometritricket.',
      hpPattern: 'Sammansatta figurer — dela upp och summera',
      pattern: 'En figur som ser komplex ut är ofta en rektangel minus en triangel, eller en halvcirkel plus en rektangel. Dela alltid upp komplexa figurer i enklare delar, beräkna varje del, summera eller subtrahera.',
      rule: 'Höjden i en triangel är alltid vinkelrät mot basen — det är inte nödvändigtvis en sida av triangeln. Rita höjden explicit i figuren, annars missar du vilken sida som är basen.',
    },
  },
  {
    id: '3d',
    icon: '◻',
    name: '3D-geometri & Volymer',
    subtitle: 'Volym, mantelarea & rymdgeometri',
    tier: 3,
    sections: ['XYZ'],
    tags: ['3d-geometry', 'volume', 'surface-area', 'cone', 'cylinder', 'sphere', 'cube', 'prism'],
    drillTag: '3d-geometry',
    frequency: 'Förekommer — sällan mer än 1–2 uppgifter per prov',
    whyItMatters: 'Volymuppgifter är lönsamma: kan du formlerna utantill löser du dem på 30 sekunder.',
    hpInsight: 'Lär dig formlerna utantill. De är få och ger snabba, säkra poäng.',
    formulas: [
      { label: 'Kub', tex: 'V = s^3,\\quad A_\\text{yta} = 6s^2' },
      { label: 'Rätblock', tex: 'V = l \\cdot b \\cdot h' },
      { label: 'Cylinder', tex: 'V = \\pi r^2 h,\\quad A_\\text{mantel} = 2\\pi r h' },
      { label: 'Kon', tex: 'V = \\tfrac{1}{3}\\pi r^2 h' },
      { label: 'Sfär', tex: 'V = \\tfrac{4}{3}\\pi r^3,\\quad A = 4\\pi r^2' },
    ],
    traps: [
      'Konen har faktorn ⅓ — konen = ⅓ av omskrivande cylinder',
      'Mantelyta ≠ total yta — mant. ytan inkluderar inte botten/topp',
      'Om ett objekt skalas med faktor $k$ skalas volymen med $k^3$ och arean med $k^2$',
    ],
    concepts: [
      {
        term: 'Volym',
        en: 'Volume',
        definition: 'Mängden utrymme ett 3D-objekt upptar, mätt i kubikenheter (t.ex. cm³).',
      },
      {
        term: 'Mantelyta',
        en: 'Lateral surface area',
        definition: 'Den böjda/laterala ytan av ett 3D-objekt, exklusive bas(er). För en cylinder: $A_m = 2\\pi r h$.',
      },
      {
        term: 'Skalningsregel',
        en: 'Scaling rule',
        definition: 'Om alla linjära mått multipliceras med $k$: area multipliceras med $k^2$, volym med $k^3$.',
        tex: 'A \\propto k^2,\\quad V \\propto k^3',
      },
    ],
    examples: [
      {
        problem: 'En cylinder har radien 3 och höjden 4. Beräkna volymen.',
        steps: [
          '$V = \\pi r^2 h = \\pi \\times 9 \\times 4 = 36\\pi$',
        ],
        answer: '$V = 36\\pi \\approx 113$ volymenheter',
      },
    ],
    selfCheck: [
      {
        question: 'En cylinder har radien 3 och höjden 10. Vad är volymen?',
        options: ['$30\\pi$', '$90\\pi$', '$60\\pi$'],
        correct: 1,
        explanation: '$V = \\pi r^2 h = \\pi \\times 9 \\times 10 = 90\\pi$. Glöm inte $r^2$, inte bara $r$.',
      },
      {
        question: 'En kons volym jämfört med en cylinder med samma radie och höjd är...',
        options: ['Samma', '$1/3$ av cylinderns volym', '$2/3$ av cylinderns volym'],
        correct: 1,
        explanation: '$V_{\\text{kon}} = \\tfrac{1}{3}\\pi r^2 h = \\tfrac{1}{3} V_{\\text{cylinder}}$. Konen är alltid en tredjedel av omskrivande cylinder.',
      },
      {
        question: 'Om alla kanter i en kub fördubblas, med hur mycket ökar volymen?',
        options: ['Dubblas', 'Trefaldigas', 'Åtfaldigas'],
        correct: 2,
        explanation: 'Skalningsfaktor $k=2$. Volym $\\propto k^3 = 2^3 = 8$. Volymen åtfaldigas — inte bara dubblas.',
      },
    ],
    lesson: {
      hook: '3D-uppgifter på HP är nästan alltid "tillämpa rätt volymformel". Det finns bara 5 former att kunna. Kan du dem utantill löser du varje 3D-uppgift på 30 sekunder — garanterade poäng.',
      core: 'Fem former: Kub $V=s^3$, Rätblock $V=l \\cdot b \\cdot h$, Cylinder $V=\\pi r^2 h$, Kon $V=\\tfrac{1}{3}\\pi r^2 h$, Sfär $V=\\tfrac{4}{3}\\pi r^3$. Memorera konen som "⅓ av omskrivande cylinder" — det är det sambandet som sitter kvar.',
      keyInsight: 'Skalas ett 3D-objekt med faktor $k$ skalas volymen med $k^3$ och arean med $k^2$. HP testar detta regelbundet: dubbla radien på en cylinder → volym fyrfaldigas (inte dubblas).',
      hpPattern: 'Skalning — vad händer med volymen när ett mått ändras?',
      pattern: '"En sfär med radien $r$ ersätts av en sfär med radien $2r$. Hur stor är volymökningen?" $V \\propto r^3$ → $(2r)^3 = 8r^3$ → volym åtfaldigas. Faktorisera ut $k^3$.',
      rule: 'Konen har faktorn $\\tfrac{1}{3}$ — glöm ALDRIG den. Mantelyta inkluderar inte botten och lock. Lär dig skilja "mantelyta" från "total yta" — HP frågar specifikt om ett av dem.',
    },
  },
  {
    id: 'logaritm',
    icon: 'log',
    name: 'Logaritmer & Exponentialfunktioner',
    subtitle: 'log, ln och exponentiell tillväxt',
    tier: 3,
    sections: ['XYZ'],
    tags: ['logarithm', 'logarithmrules', 'exponential'],
    drillTag: 'logarithm',
    frequency: 'Sällsynt — men de uppgifter som finns har tydliga mönster',
    whyItMatters: 'Logaritmuppgifter skrämmer de flesta, men HP-logaritmer bygger på 3–4 regler som är snabba att lära sig.',
    hpInsight: 'HP-logaritmuppgifter är nästan alltid "tillämpa rätt regel och förenkla". Sällan krävs djupare förståelse.',
    formulas: [
      { label: 'Definition', tex: '\\log_a b = c \\;\\Leftrightarrow\\; a^c = b' },
      { label: 'Produktregel', tex: '\\log(xy) = \\log x + \\log y' },
      { label: 'Kvotregel', tex: '\\log\\!\\left(\\tfrac{x}{y}\\right) = \\log x - \\log y' },
      { label: 'Potensregel', tex: '\\log(x^n) = n\\log x' },
      { label: 'Basbyte', tex: '\\log_a b = \\dfrac{\\ln b}{\\ln a}' },
      { label: 'Specialvärden', tex: '\\ln e = 1,\\quad \\log_{10} 10 = 1,\\quad \\log_a a = 1' },
    ],
    traps: [
      '$\\log(a + b) \\neq \\log a + \\log b$ — produktregeln gäller multiplikation, inte addition',
      '$\\ln e = 1$ och $\\log_{10} 10 = 1$ — koppla tillbaka till definitionen',
      'Logaritm är bara definierad för positiva tal: $\\ln x$ kräver $x > 0$',
    ],
    concepts: [
      {
        term: 'Logaritm',
        en: 'Logarithm',
        definition: '$\\log_a b = c$ innebär att $a^c = b$. Logaritmen är "svaret på: vilken exponent ger basen $a$ för att producera $b$?"',
        tex: '\\log_2 8 = 3 \\;\\Leftrightarrow\\; 2^3 = 8',
      },
      {
        term: 'Naturlig logaritm',
        en: 'Natural logarithm',
        definition: '$\\ln x = \\log_e x$, där $e \\approx 2{,}718$. Används ofta i tillväxtmodeller.',
        tex: '\\ln(e^5) = 5',
      },
    ],
    examples: [
      {
        problem: 'Förenkla $\\log_2 32 - \\log_2 4$',
        steps: [
          'Använd kvotregeln: $\\log_2 32 - \\log_2 4 = \\log_2(32/4) = \\log_2 8$',
          '$\\log_2 8 = 3$ (eftersom $2^3 = 8$)',
        ],
        answer: '$3$',
      },
    ],
    selfCheck: [
      {
        question: 'Vad är $\\log_3 27$?',
        options: ['$9$', '$3$', '$3/27$'],
        correct: 1,
        explanation: '$\\log_3 27 = ?$ betyder $3^? = 27$. Eftersom $3^3 = 27$ är svaret $3$.',
      },
      {
        question: 'Vilket av följande är SANT?',
        options: ['$\\log(a + b) = \\log a + \\log b$', '$\\log(a \\cdot b) = \\log a + \\log b$', '$\\log(a^2) = (\\log a)^2$'],
        correct: 1,
        explanation: 'Produktregeln: $\\log(xy) = \\log x + \\log y$. De andra är vanliga felaktiga "regler" som inte stämmer.',
      },
      {
        question: 'Vad är $\\ln e^4$?',
        options: ['$e^4$', '$4$', '$4e$'],
        correct: 1,
        explanation: '$\\ln e^4 = 4 \\cdot \\ln e = 4 \\times 1 = 4$. Potensregeln: $\\ln(x^n) = n \\ln x$, och $\\ln e = 1$.',
      },
    ],
    lesson: {
      hook: 'Logaritmer är exponentialfunktionens invers — de svarar på frågan "vilken exponent ger detta resultat?" HP-uppgifter om logaritmer är nästan alltid "tillämpa rätt regel och förenkla".',
      core: '$\\log_a b = c$ betyder $a^c = b$. Logaritm frågar: "Vilken exponent?" $\\log_2 8 = 3$ för att $2^3 = 8$.\n\nTre regler: Produkt: $\\log(xy) = \\log x + \\log y$. Kvot: $\\log(x/y) = \\log x - \\log y$. Potens: $\\log(x^n) = n \\cdot \\log x$.',
      keyInsight: '$\\log(a + b) \\neq \\log a + \\log b$. Produktregeln gäller MULTIPLIKATION, inte addition. Detta är den allra vanligaste logaritmfällan på HP.',
      hpPattern: 'Förenkla logaritmuttryck med reglerna',
      pattern: '$\\log_2 32 - \\log_2 4$: kvotregeln → $\\log_2(32/4) = \\log_2 8 = 3$ (eftersom $2^3 = 8$). Kvotregeln omvandlar subtraktion av logaritmer till logaritm av kvoten.',
      rule: '$\\ln e = 1$, $\\log_{10} 10 = 1$, $\\log_a a = 1$ alltid. Koppla tillbaka till definitionen: om $a^? = a$ är $? = 1$. Logaritm är bara definierad för positiva tal: $x > 0$.',
    },
  },
]

// ─── Glossary ─────────────────────────────────────────────────────────────────

const GLOSSARY: GlossaryEntry[] = [
  { term: 'Absolut värde', en: 'Absolute value', definition: 'Avståndet från ett tal till 0 på tallinjen. $|a| = a$ om $a \\geq 0$, annars $-a$.', tex: '|-5| = 5' },
  { term: 'Addition', en: 'Addition', definition: 'Grundläggande räkneoperation: summera två eller fler tal. Betecknas $a + b$.', },
  { term: 'Algebra', en: 'Algebra', definition: 'Gren av matematiken där tal representeras av symboler (variabler) och relationer uttrycks som ekvationer.' },
  { term: 'Alternata inre vinklar', en: 'Alternate interior angles', definition: 'Vinklar bildade av en transversal som skär parallella linjer; de är alltid lika stora och ligger på motsatta sidor.' },
  { term: 'Aritmetisk följd', en: 'Arithmetic sequence', definition: 'Talföljd med konstant differens $d$ mellan på varandra följande termer: $a_n = a_1 + (n-1)d$.', tex: 'a_n = a_1 + (n-1)d' },
  { term: 'Associativitet', en: 'Associativity', definition: 'Grupperingsordning spelar ingen roll: $(a + b) + c = a + (b + c)$.' },
  { term: 'Bas (potens)', en: 'Base', definition: 'I uttrycket $a^n$ är $a$ basen och $n$ exponenten.' },
  { term: 'Binomial', en: 'Binomial', definition: 'Algebraiskt uttryck med exakt två termer, t.ex. $3x + 5$ eller $a - b$.' },
  { term: 'Bråk', en: 'Fraction', definition: 'Kvoten $a/b$ där $b \\neq 0$. $a$ kallas täljare, $b$ nämnare.', tex: '\\dfrac{a}{b}' },
  { term: 'Cirkel', en: 'Circle', definition: 'Mängden av alla punkter i ett plan med samma avstånd (radien $r$) från en centrumpunkt.', tex: 'A = \\pi r^2,\\; C = 2\\pi r' },
  { term: 'Delbarhet', en: 'Divisibility', definition: '$a$ är delbart med $b$ om $a / b$ är ett heltal, dvs. resten är 0. Betecknas $b \\mid a$.' },
  { term: 'Differens', en: 'Difference', definition: 'Resultatet av subtraktion: $a - b$.' },
  { term: 'Diskriminant', en: 'Discriminant', definition: '$D = b^2 - 4ac$ i andragradsekvationen $ax^2 + bx + c = 0$. $D > 0$: 2 rötter; $D = 0$: 1 rot; $D < 0$: inga reella rötter.', tex: 'D = b^2 - 4ac' },
  { term: 'Ekvation', en: 'Equation', definition: 'Matematiskt påstående att två uttryck är lika: $\\text{VL} = \\text{HL}$. Att lösa = hitta det variabelvärde som gör påståendet sant.' },
  { term: 'Exponent', en: 'Exponent', definition: 'Talet $n$ i $a^n$ som anger hur många gånger basen multipliceras med sig självt.' },
  { term: 'Exponentialfunktion', en: 'Exponential function', definition: '$f(x) = a \\cdot r^x$. Tillväxt om $r > 1$, avtagande om $0 < r < 1$.', tex: 'f(x) = a \\cdot r^x' },
  { term: 'Faktor', en: 'Factor', definition: 'Tal eller uttryck som multipliceras med ett annat. Faktorerna i $3 \\times 4$ är 3 och 4.' },
  { term: 'Fakultet', en: 'Factorial', definition: '$n! = n \\times (n-1) \\times \\cdots \\times 1$. Per definition $0! = 1$.', tex: '5! = 120' },
  { term: 'Funktion', en: 'Function', definition: 'En regel som tilldelar varje indata exakt ett utdata. Betecknas $f(x)$.' },
  { term: 'Geometrisk följd', en: 'Geometric sequence', definition: 'Talföljd med konstant kvot $r$: $a_n = a_1 \\cdot r^{n-1}$.', tex: 'a_n = a_1 \\cdot r^{n-1}' },
  { term: 'GGD / SGD', en: 'GCD', definition: 'Största gemensamma divisor: det största tal som delar både $a$ och $b$ utan rest.', tex: '\\gcd(12, 18) = 6' },
  { term: 'Heltal', en: 'Integer', definition: 'Talmängden $\\mathbb{Z} = \\{\\ldots, -2, -1, 0, 1, 2, \\ldots\\}$.' },
  { term: 'Hypotenusa', en: 'Hypotenuse', definition: 'Den längsta sidan i en rätvinklig triangel — sidan mittemot den räta vinkeln.' },
  { term: 'Irrational tal', en: 'Irrational number', definition: 'Tal som inte kan skrivas som $p/q$. Exempel: $\\sqrt{2} \\approx 1{,}414\\ldots$, $\\pi \\approx 3{,}14159\\ldots$' },
  { term: 'Katet', en: 'Leg (of right triangle)', definition: 'En av de två kortare sidorna i en rätvinklig triangel — sidorna som bildar den räta vinkeln.' },
  { term: 'Koefficient', en: 'Coefficient', definition: 'Det numeriska prefixet framför en variabel. I $7x^2$  är $7$ koefficienten.' },
  { term: 'Konjugat', en: 'Conjugate', definition: '$(a+b)$ och $(a-b)$ är konjugat; produkten ger $a^2 - b^2$.', tex: '(a+b)(a-b) = a^2 - b^2' },
  { term: 'Kombination', en: 'Combination', definition: 'Antal sätt att välja $k$ ur $n$ objekt utan hänsyn till ordning.', tex: '\\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}' },
  { term: 'Koordinat', en: 'Coordinate', definition: 'Ordnat par $(x, y)$ som anger en punkts position i det kartesiska planet.' },
  { term: 'Logaritm', en: 'Logarithm', definition: '$\\log_a b = c \\Leftrightarrow a^c = b$. Logaritmen är inversen till potensupphöjning.', tex: '\\log_2 8 = 3' },
  { term: 'Lutning', en: 'Slope', definition: 'Stigningskvoten för en linje: $k = \\Delta y / \\Delta x$.', tex: 'k = \\dfrac{y_2 - y_1}{x_2 - x_1}' },
  { term: 'MGM / LGM', en: 'LCM', definition: 'Minsta gemensamma multipel: det minsta positiva tal som är delbart med båda $a$ och $b$.', tex: '\\text{lcm}(4, 6) = 12' },
  { term: 'Median', en: 'Median', definition: 'Mittenvädet i ett sorterat dataset. Vid jämnt antal: snittet av de två mittersta.' },
  { term: 'Medelvärde', en: 'Mean', definition: 'Summan av alla värden dividerat med antalet: $\\bar{x} = \\sum x_i / n$.', tex: '\\bar{x} = \\dfrac{\\sum x_i}{n}' },
  { term: 'Nollpunkt / nollställe', en: 'Zero / Root', definition: 'x-värde där $f(x) = 0$; var grafen skär x-axeln.' },
  { term: 'Olikhet', en: 'Inequality', definition: 'Påstående av formen $a < b$, $a \\leq b$, $a > b$ eller $a \\geq b$.' },
  { term: 'Parabola', en: 'Parabola', definition: 'Grafen av $f(x) = ax^2 + bx + c$. Öppnar uppåt om $a > 0$, nedåt om $a < 0$.' },
  { term: 'Permutation', en: 'Permutation', definition: 'Urval där ordningen spelar roll.', tex: 'P(n,k) = \\dfrac{n!}{(n-k)!}' },
  { term: 'Potens', en: 'Power', definition: '$a^n$: basen $a$ multiplicerad med sig självt $n$ gånger.' },
  { term: 'Primtal', en: 'Prime number', definition: 'Naturligt tal $> 1$ som bara är delbart med 1 och sig självt. Minsta: 2, 3, 5, 7, 11, ...' },
  { term: 'Proportion', en: 'Proportion', definition: 'Likhet mellan två kvoter: $a/b = c/d$, vilket ger $ad = bc$.', tex: '\\dfrac{a}{b} = \\dfrac{c}{d} \\Rightarrow ad = bc' },
  { term: 'Pythagoras sats', en: "Pythagorean theorem", definition: 'I en rätvinklig triangel: $a^2 + b^2 = c^2$ (kateterna $a, b$; hypotenusa $c$).', tex: 'a^2 + b^2 = c^2' },
  { term: 'Rationellt tal', en: 'Rational number', definition: 'Tal som kan skrivas som $p/q$ med $p, q \\in \\mathbb{Z}$, $q \\neq 0$.' },
  { term: 'Rot', en: 'Root', definition: '$x$ är $n$:te roten av $a$ om $x^n = a$. Skrives $\\sqrt[n]{a}$.', tex: '\\sqrt[3]{27} = 3' },
  { term: 'Sannolikhet', en: 'Probability', definition: 'Mått $P(A) \\in [0, 1]$ på hur sannolikt händelse $A$ är. $P = 0$: omöjlig; $P = 1$: säker.' },
  { term: 'Term', en: 'Term', definition: 'Del av ett algebraiskt uttryck separerat av $+$ eller $-$. I $3x^2 - 5x + 2$ finns tre termer.' },
  { term: 'Variabel', en: 'Variable', definition: 'Symbol (t.ex. $x$, $y$, $n$) som representerar ett okänt eller godtyckligt tal.' },
  { term: 'Variationsbredd', en: 'Range', definition: 'Skillnaden $x_{\\max} - x_{\\min}$ — ett enkelt spridningsmått.' },
  { term: 'Vertex', en: 'Vertex', definition: 'Toppunkten på en parabel; hörn på en polygon.' },
]

// ─── Formula sheet ────────────────────────────────────────────────────────────

const FORMULA_SECTIONS = [
  {
    title: 'Algebra',
    color: 'text-[var(--color-terracotta)]',
    formulas: [
      { label: 'Distributiv lag', tex: 'a(b+c) = ab + ac' },
      { label: 'FOIL', tex: '(a+b)(c+d) = ac+ad+bc+bd' },
      { label: 'Konjugatregeln', tex: '(a+b)(a-b) = a^2 - b^2' },
      { label: '$(a+b)^2$', tex: '(a+b)^2 = a^2 + 2ab + b^2' },
      { label: '$(a-b)^2$', tex: '(a-b)^2 = a^2 - 2ab + b^2' },
      { label: 'abc-formeln', tex: 'x = \\dfrac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Diskriminant', tex: 'D = b^2 - 4ac' },
    ],
  },
  {
    title: 'Procent',
    color: 'text-[var(--color-gold-deep)]',
    formulas: [
      { label: 'Procentdel', tex: '\\tfrac{p}{100} \\times N' },
      { label: 'Procentuell förändring', tex: '\\dfrac{\\text{ny} - \\text{gammal}}{\\text{gammal}} \\times 100' },
      { label: '+p% faktor', tex: '\\times \\left(1 + \\tfrac{p}{100}\\right)' },
      { label: '−p% faktor', tex: '\\times \\left(1 - \\tfrac{p}{100}\\right)' },
      { label: 'Sammansatt ränta', tex: 'S = P\\!\\left(1 + \\tfrac{r}{100}\\right)^{\\!n}' },
      { label: 'Bakåtberäkning', tex: '\\text{orig} = \\dfrac{\\text{nytt}}{1 + p/100}' },
    ],
  },
  {
    title: 'Geometri 2D',
    color: 'text-[var(--color-green-light)]',
    formulas: [
      { label: 'Pythagoras', tex: 'a^2 + b^2 = c^2' },
      { label: 'Triangelarea', tex: 'A = \\tfrac{bh}{2}' },
      { label: 'Rektangelarea', tex: 'A = l \\times b' },
      { label: 'Parallelogramarea', tex: 'A = b \\times h' },
      { label: 'Trapetsarea', tex: 'A = \\tfrac{(a+b)h}{2}' },
      { label: 'Cirkelarea', tex: 'A = \\pi r^2' },
      { label: 'Cirkelomkrets', tex: 'C = 2\\pi r' },
      { label: 'Vinkelsumma triangel', tex: '\\alpha+\\beta+\\gamma = 180°' },
      { label: 'Vinkelsumma n-hörning', tex: '(n-2) \\times 180°' },
    ],
  },
  {
    title: 'Geometri 3D',
    color: 'text-[var(--color-gold-deep)]',
    formulas: [
      { label: 'Kub', tex: 'V = s^3,\\; A = 6s^2' },
      { label: 'Rätblock', tex: 'V = l \\cdot b \\cdot h' },
      { label: 'Cylinder', tex: 'V = \\pi r^2 h' },
      { label: 'Kon', tex: 'V = \\tfrac{1}{3}\\pi r^2 h' },
      { label: 'Sfär (volym)', tex: 'V = \\tfrac{4}{3}\\pi r^3' },
      { label: 'Sfär (area)', tex: 'A = 4\\pi r^2' },
    ],
  },
  {
    title: 'Sannolikhet',
    color: 'text-[var(--color-terracotta)]',
    formulas: [
      { label: 'Klassisk', tex: 'P(A) = \\dfrac{\\text{gynnsamma}}{\\text{möjliga}}' },
      { label: 'Komplement', tex: 'P(A^c) = 1 - P(A)' },
      { label: 'Multiplikation (oberoende)', tex: 'P(A \\cap B) = P(A)\\cdot P(B)' },
      { label: 'Addition', tex: 'P(A \\cup B) = P(A)+P(B)-P(A\\cap B)' },
      { label: 'Kombinationer', tex: '\\binom{n}{k} = \\dfrac{n!}{k!(n-k)!}' },
      { label: 'Permutationer', tex: 'P(n,k) = \\dfrac{n!}{(n-k)!}' },
    ],
  },
  {
    title: 'Statistik',
    color: 'text-[var(--color-gold-deep)]',
    formulas: [
      { label: 'Medelvärde', tex: '\\bar{x} = \\dfrac{\\sum x_i}{n}' },
      { label: 'Totalsum', tex: '\\Sigma = \\bar{x} \\times n' },
      { label: 'Vägat medelvärde', tex: '\\bar{x}_w = \\dfrac{\\sum w_i x_i}{\\sum w_i}' },
      { label: 'Variationsbredd', tex: 'R = x_{\\max} - x_{\\min}' },
    ],
  },
  {
    title: 'Potenser & Rötter',
    color: 'text-[var(--color-terracotta)]',
    formulas: [
      { label: 'Produktregel', tex: 'a^m \\cdot a^n = a^{m+n}' },
      { label: 'Kvotregel', tex: 'a^m / a^n = a^{m-n}' },
      { label: 'Potensregel', tex: '(a^m)^n = a^{mn}' },
      { label: 'Produktens potens', tex: '(ab)^n = a^n b^n' },
      { label: 'Negativ exponent', tex: 'a^{-n} = 1/a^n' },
      { label: 'Bråkexponent', tex: 'a^{m/n} = \\sqrt[n]{a^m}' },
      { label: 'Rotprodukt', tex: '\\sqrt{ab} = \\sqrt{a}\\sqrt{b}' },
    ],
  },
  {
    title: 'Logaritmer',
    color: 'text-[var(--color-gold-deep)]',
    formulas: [
      { label: 'Definition', tex: '\\log_a b = c \\Leftrightarrow a^c = b' },
      { label: 'Produktregel', tex: '\\log(xy) = \\log x + \\log y' },
      { label: 'Kvotregel', tex: '\\log(x/y) = \\log x - \\log y' },
      { label: 'Potensregel', tex: '\\log(x^n) = n\\log x' },
      { label: 'Basbyte', tex: '\\log_a b = \\ln b / \\ln a' },
      { label: 'Specialvärden', tex: '\\ln e = 1,\\; \\log 10 = 1' },
    ],
  },
  {
    title: 'Koordinater & Funktioner',
    color: 'text-indigo-400',
    formulas: [
      { label: 'Linjär', tex: 'f(x) = kx + m' },
      { label: 'Lutning', tex: 'k = (y_2-y_1)/(x_2-x_1)' },
      { label: 'Avstånd', tex: 'd = \\sqrt{\\Delta x^2 + \\Delta y^2}' },
      { label: 'Mittpunkt', tex: 'M = \\bigl(\\tfrac{x_1+x_2}{2},\\tfrac{y_1+y_2}{2}\\bigr)' },
      { label: 'Vertex (parabel)', tex: 'x_v = -b/(2a)' },
    ],
  },
]

// ─── Tier metadata ────────────────────────────────────────────────────────────

const TIER_META = {
  1: { label: 'Kritisk', desc: 'Förekommer i varje prov, spänner över flera delsektioner. Börja här.', color: 'text-[var(--color-terracotta)]', badgeColor: 'bg-[var(--color-terracotta-soft)] text-[var(--color-terracotta-deep)] border-[var(--color-terracotta-muted)]', borderColor: 'border-[var(--color-terracotta-muted)]' },
  2: { label: 'Viktig', desc: 'Regelbundna inslag med tydliga mönster. Hög avkastning per studietimme.', color: 'text-[var(--color-gold-deep)]', badgeColor: 'bg-[var(--color-gold-muted)] text-[var(--color-gold-deep)] border-[rgba(228,198,106,0.30)]', borderColor: 'border-[rgba(228,198,106,0.30)]' },
  3: { label: 'Kompletterande', desc: 'Sällsynta men lättlösta om du kan formlerna. Lär dig dem sist.', color: 'text-[var(--color-green-light)]', badgeColor: 'bg-[var(--color-green-muted)] text-[var(--color-green-light)] border-[var(--color-card-border)]', borderColor: 'border-[var(--color-card-border)]' },
} as const

const TYPE_PILL: Record<string, string> = {
  XYZ: 'bg-[var(--color-terracotta-soft)] text-[var(--color-terracotta-deep)] border-[var(--color-terracotta-muted)]',
  KVA: 'bg-[var(--color-terracotta-soft)] text-[var(--color-terracotta-deep)] border-[var(--color-terracotta-muted)]',
  NOG: 'bg-[var(--color-green-muted)] text-[var(--color-green-light)] border-[var(--color-card-border)]',
  DTK: 'bg-[var(--color-gold-muted)] text-[var(--color-gold-deep)] border-[rgba(228,198,106,0.30)]',
}

type TopTab = 'topics' | 'path' | 'formulas' | 'glossary'
type InnerTab = 'lesson' | 'theory' | 'examples'

// ─── Component ────────────────────────────────────────────────────────────────

export default function MathGuide() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [topTab, setTopTab] = useState<TopTab>('topics')
  const [expanded, setExpanded] = useState<string | null>('algebra')
  const [innerTab, setInnerTab] = useState<Record<string, InnerTab>>({})
  const [glossarySearch, setGlossarySearch] = useState('')
  const [revealedSteps, setRevealedSteps] = useState<Record<string, number>>({})
  const [conceptMastery, setConceptMastery] = useState<Record<string, 'known' | 'unsure' | 'review'>>(() => {
    try { const s = localStorage.getItem('mathguide-mastery'); return s ? JSON.parse(s) : {} } catch { return {} }
  })
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null)
  const [selfCheckState, setSelfCheckState] = useState<Record<string, { chosen: number | null; revealed: boolean }[]>>(() => ({}))

  useEffect(() => {
    const topicParam = searchParams.get('topic')
    const innerParam = searchParams.get('inner') as InnerTab | null
    const tabParam = searchParams.get('tab') as TopTab | null
    if (tabParam && ['topics', 'path', 'formulas', 'glossary'].includes(tabParam)) {
      setTopTab(tabParam)
    }
    if (topicParam) {
      setTopTab('topics')
      setExpanded(topicParam)
      if (innerParam && ['lesson', 'theory', 'examples'].includes(innerParam)) {
        setInnerTab(prev => ({ ...prev, [topicParam]: innerParam }))
      }
      setTimeout(() => {
        document.getElementById(`topic-${topicParam}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }, [searchParams])

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

  const topicCounts = useMemo(() => {
    const result: Record<string, number> = {}
    TOPICS.forEach(topic => {
      const tagSet = new Set(topic.tags)
      result[topic.id] = questions.filter(q => q.tags.some(t => tagSet.has(t))).length
    })
    return result
  }, [])

  const totalMathQs = questions.filter(q => q.type !== 'DTK').length

  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return GLOSSARY
    const q = glossarySearch.toLowerCase()
    return GLOSSARY.filter(e => e.term.toLowerCase().includes(q) || e.en.toLowerCase().includes(q))
  }, [glossarySearch])

  const getInnerTab = (id: string): InnerTab => innerTab[id] ?? 'lesson'
  const setTopicInnerTab = (id: string, tab: InnerTab) => setInnerTab(prev => ({ ...prev, [id]: tab }))

  const setMastery = (key: string, val: 'known' | 'unsure' | 'review') => {
    const next = { ...conceptMastery, [key]: val }
    setConceptMastery(next)
    localStorage.setItem('mathguide-mastery', JSON.stringify(next))
  }

  const copyFormula = (tex: string) => {
    navigator.clipboard.writeText(tex).then(() => {
      setCopiedFormula(tex)
      setTimeout(() => setCopiedFormula(null), 1500)
    })
  }

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="Matematik" />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div className="border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 bg-[var(--color-terracotta-soft)] border border-[var(--color-terracotta-muted)] text-[var(--color-terracotta-deep)] text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-terracotta)] animate-pulse" />
            Matematikguide
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Matematik på HP</h1>
          <p className="text-[var(--color-ink-muted)] text-base leading-relaxed mb-5">
            Av provets 40 frågor är <strong className="text-[var(--color-ink)]">{totalMathQs} rent matematiska</strong>. Det är matematik — inte läsförståelse — som skiljer 1,4 från 2,0.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { v: String(totalMathQs), l: 'matematikfrågor' },
              { v: '0', l: 'minuspoäng' },
              { v: '3 mån', l: 'för stor förbättring' },
              { v: '10', l: 'ämnesområden' },
            ].map(s => (
              <div key={s.l} className="card rounded-xl p-3 text-center">
                <div className="text-lg font-black text-[var(--color-ink)]">{s.v}</div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5 leading-tight">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top tabs ──────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[var(--color-paper)]/95 backdrop-blur-xl border-b border-[var(--color-card-border)]">
        <div className="max-w-2xl mx-auto px-4 flex gap-0">
          {([
            ['topics',   'Ämnen'],
            ['path',     'Lärväg'],
            ['formulas', 'Formler'],
            ['glossary', 'Ordlista'],
          ] as [TopTab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setTopTab(tab)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${topTab === tab ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
            >
              {label}
              {topTab === tab && <span className="absolute bottom-0 inset-x-4 h-[2px] bg-[var(--color-terracotta)] rounded-full" />}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* ════════════════════════════════════════════
            TAB 1: Topics
        ════════════════════════════════════════════ */}
        {topTab === 'topics' && (
          <>
            {/* HP reality section */}
            <section className="mb-8">
              <h2 className="text-base font-black text-[var(--color-ink-muted)] mb-3">Vad HP-matematik verkligen är</h2>
              <div className="space-y-2">
                {[
                  { title: 'Ingen miniräknare — och det behövs inte', body: 'HP är konstruerat för att lösas med huvudräkning. Talen är skapade för att gå upp jämnt eller kunna uppskattas. Du ska inte räkna exakt — du ska räkna smart.' },
                  { title: 'Tid är din fiende', body: 'XYZ ger ~60 sekunder per fråga. De flesta missar inte för att de inte kan matten — utan för att de inte hann. Snabbhet tränas genom repetition.' },
                  { title: 'Grundnivå — men under tidspress', body: 'Inget om derivator, integraler eller komplexa tal. Grundläggande algebra, procent, geometri och sannolikhet — men med välkonstruerade fällor.' },
                  { title: 'Matematik är den mest förbättringsbara delen', body: 'Verbal förmåga förbättras långsamt. Rätt formler + mönsterigenkänning kan ge märkbar förbättring på 2–3 månader.' },
                ].map(item => (
                  <div key={item.title} className="card rounded-xl p-4">
                    <div className="font-semibold text-[var(--color-ink)] text-sm mb-1">{item.title}</div>
                    <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{item.body}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Topic cards by tier */}
            {([1, 2, 3] as const).map(tier => {
              const tierTopics = TOPICS.filter(t => t.tier === tier)
              const meta = TIER_META[tier]
              return (
                <section key={tier} className="mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${meta.badgeColor}`}>{meta.label}</span>
                  </div>
                  <p className="text-xs text-[var(--color-ink-faint)] mb-4">{meta.desc}</p>

                  <div className="space-y-2.5">
                    {tierTopics.map(topic => {
                      const isOpen = expanded === topic.id
                      const acc = topicAccuracy[topic.id]
                      const count = topicCounts[topic.id]
                      const accColor = acc ? (acc.pct >= 70 ? 'text-[var(--color-green-light)]' : acc.pct >= 50 ? 'text-[var(--color-gold-deep)]' : 'text-[var(--color-error)]') : ''
                      const tab = getInnerTab(topic.id)

                      return (
                        <div key={topic.id} id={`topic-${topic.id}`} className={`rounded-2xl border overflow-hidden transition-colors ${isOpen ? meta.borderColor : 'card border-[var(--color-card-border)]'}`}>

                          {/* Card header */}
                          <button
                            onClick={() => setExpanded(isOpen ? null : topic.id)}
                            className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-[var(--color-paper)] transition-colors"
                          >
                            <span className="font-mono text-sm font-black text-[var(--color-ink-faint)] shrink-0 w-10">{topic.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="font-black text-[var(--color-ink)] text-sm">{topic.name}</span>
                                {topic.sections.map(s => (
                                  <span key={s} className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${TYPE_PILL[s]}`}>{s}</span>
                                ))}
                                {acc && <span className={`text-[10px] font-bold ml-auto shrink-0 ${accColor}`}>{acc.pct}%</span>}
                              </div>
                              <div className="text-xs text-[var(--color-ink-faint)]">{topic.subtitle}</div>
                            </div>
                            <span className={`text-[var(--color-ink-faint)] shrink-0 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                          </button>

                          {/* Expanded content */}
                          {isOpen && (
                            <div className="border-t border-[var(--color-card-border)] animate-fade-in">

                              {/* Inner tab bar */}
                              <div className="flex border-b border-[var(--color-card-border)]">
                                {([
                                  ['lesson',   'Lektion'],
                                  ['theory',   'Begrepp'],
                                  ['examples', 'Exempel'],
                                ] as [InnerTab, string][]).map(([t, l]) => (
                                  <button
                                    key={t}
                                    onClick={() => setTopicInnerTab(topic.id, t)}
                                    className={`flex-1 py-2.5 text-[11px] font-semibold transition-colors ${tab === t ? 'text-[var(--color-ink)] border-b-2 border-[var(--color-green)]' : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'}`}
                                  >
                                    {l}
                                  </button>
                                ))}
                              </div>

                              <div className="px-5 py-5 space-y-4">

                                {/* ── LESSON TAB ── */}
                                {tab === 'lesson' && (
                                  <>
                                    {/* Hook */}
                                    <div className="bg-[var(--color-terracotta-soft)] border border-[var(--color-terracotta-muted)] rounded-xl p-4">
                                      <div className="text-[9px] font-bold text-[var(--color-terracotta-deep)] uppercase tracking-widest mb-2">Varför lära sig detta</div>
                                      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                                        <MathText text={topic.lesson.hook} />
                                      </p>
                                    </div>

                                    {/* Core concept */}
                                    <div>
                                      <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Grundkonceptet — från grunden</div>
                                      <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed space-y-2">
                                        {topic.lesson.core.split('\n\n').map((para, i) => (
                                          <p key={i}><MathText text={para} /></p>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Key insight */}
                                    <div className="bg-[var(--color-gold-muted)] border border-[rgba(228,198,106,0.30)] rounded-xl p-3.5">
                                      <div className="text-[9px] font-bold text-[var(--color-gold-deep)] uppercase tracking-widest mb-1.5">Nyckelinsikt</div>
                                      <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed font-medium">
                                        <MathText text={topic.lesson.keyInsight} />
                                      </p>
                                    </div>

                                    {/* HP Pattern */}
                                    <div className="card rounded-xl overflow-hidden">
                                      <div className="bg-[var(--color-green-muted)] border-b border-[var(--color-card-border)] px-4 py-2.5">
                                        <div className="text-[9px] font-bold text-[var(--color-green-light)] uppercase tracking-widest">HP-mönster: {topic.lesson.hpPattern}</div>
                                      </div>
                                      <div className="px-4 py-3">
                                        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                                          <MathText text={topic.lesson.pattern} />
                                        </p>
                                      </div>
                                    </div>

                                    {/* Rule to remember */}
                                    <div className="flex gap-3 bg-[var(--color-paper)] rounded-xl p-3.5">
                                      <span className="text-[var(--color-terracotta)] font-black text-lg shrink-0 leading-tight">→</span>
                                      <div>
                                        <div className="text-[9px] font-bold text-[var(--color-terracotta)] uppercase tracking-widest mb-1">Regeln att minnas</div>
                                        <p className="text-sm text-[var(--color-ink)] leading-relaxed">
                                          <MathText text={topic.lesson.rule} />
                                        </p>
                                      </div>
                                    </div>

                                    {/* Formulas (compact) */}
                                    <div>
                                      <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Formler</div>
                                      <div className="space-y-1.5">
                                        {topic.formulas.map(f => (
                                          <div key={f.label} className="bg-[var(--color-paper)] rounded-xl px-4 py-2.5 flex items-center gap-3 flex-wrap">
                                            <span className="text-[11px] text-[var(--color-ink-faint)] w-32 shrink-0">{f.label}</span>
                                            <span className="text-[var(--color-ink)] text-sm flex-1 overflow-x-auto">
                                              <MathText text={`$${f.tex}$`} />
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Traps */}
                                    <div>
                                      <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Vanliga misstag</div>
                                      <ul className="space-y-2">
                                        {topic.traps.map((trap, i) => (
                                          <li key={i} className="flex gap-2 text-sm text-[var(--color-ink-muted)]">
                                            <span className="text-[var(--color-error)] shrink-0 mt-0.5">!</span>
                                            <MathText text={trap} />
                                          </li>
                                        ))}
                                      </ul>
                                    </div>

                                    {/* Self-check mini-quiz */}
                                    <div className="border-t border-[var(--color-card-border)] pt-4">
                                      <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Snabbkoll — testa dig själv</div>
                                      <div className="space-y-4">
                                        {topic.selfCheck.map((q, qi) => {
                                          const scKey = topic.id
                                          const current = selfCheckState[scKey]?.[qi] ?? { chosen: null, revealed: false }
                                          const isRight = current.chosen === q.correct
                                          return (
                                            <div key={qi} className="card rounded-xl overflow-hidden">
                                              <div className="px-4 py-3 border-b border-[var(--color-card-border)]">
                                                <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Fråga {qi + 1}</div>
                                                <div className="text-sm text-[var(--color-ink)] leading-relaxed">
                                                  <MathText text={q.question} />
                                                </div>
                                              </div>
                                              <div className="px-4 py-3 space-y-2">
                                                {q.options.map((opt, oi) => {
                                                  const isChosen = current.chosen === oi
                                                  const showResult = current.revealed
                                                  let cls = 'border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-ink-muted)] hover:border-[var(--color-card-border)] hover:bg-[var(--color-paper-dark)]'
                                                  if (showResult && oi === q.correct) cls = 'border-[var(--color-correct-border)] bg-[var(--color-correct-bg)] text-[var(--color-correct-text)]'
                                                  else if (showResult && isChosen && oi !== q.correct) cls = 'border-[var(--color-wrong-border)] bg-[var(--color-wrong-bg)] text-[var(--color-wrong-text)]'
                                                  else if (isChosen && !showResult) cls = 'border-[var(--color-selected-border)] bg-[var(--color-selected-bg)] text-[var(--color-ink)]'
                                                  return (
                                                    <button
                                                      key={oi}
                                                      disabled={current.revealed}
                                                      onClick={() => setSelfCheckState(prev => {
                                                        const arr = [...(prev[scKey] ?? topic.selfCheck.map(() => ({ chosen: null, revealed: false })))]
                                                        arr[qi] = { chosen: oi, revealed: false }
                                                        return { ...prev, [scKey]: arr }
                                                      })}
                                                      className={`w-full text-left border rounded-xl px-3.5 py-2.5 text-sm transition-all ${cls} disabled:cursor-default`}
                                                    >
                                                      <MathText text={opt} />
                                                    </button>
                                                  )
                                                })}
                                                {current.chosen !== null && !current.revealed && (
                                                  <button
                                                    onClick={() => setSelfCheckState(prev => {
                                                      const arr = [...(prev[scKey] ?? topic.selfCheck.map(() => ({ chosen: null, revealed: false })))]
                                                      arr[qi] = { ...arr[qi], revealed: true }
                                                      return { ...prev, [scKey]: arr }
                                                    })}
                                                    className="w-full py-2 text-xs font-bold text-[var(--color-terracotta)] border border-[var(--color-terracotta-muted)] bg-[var(--color-terracotta-soft)] hover:bg-[var(--color-terracotta-soft2)] rounded-xl transition-colors"
                                                  >
                                                    Kontrollera svar →
                                                  </button>
                                                )}
                                                {current.revealed && (
                                                  <div className={`rounded-xl px-4 py-3 border text-sm leading-relaxed animate-fade-in ${isRight ? 'bg-[var(--color-feedback-correct-bg)] border-[var(--color-feedback-correct-border)] text-[var(--color-feedback-correct-title)]' : 'bg-[var(--color-feedback-wrong-bg)] border-[var(--color-feedback-wrong-border)] text-[var(--color-feedback-wrong-title)]'}`}>
                                                    <span className="font-black mr-2">{isRight ? '✓ Rätt!' : '✗ Fel.'}</span>
                                                    <MathText text={q.explanation} />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        })}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* ── THEORY TAB ── */}
                                {tab === 'theory' && (
                                  <>
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="text-xs text-[var(--color-ink-faint)]">Formella definitioner — markera vad du behärskar.</p>
                                      <span className="text-[10px] text-[var(--color-ink-faint)]">
                                        {topic.concepts.filter((_, i) => conceptMastery[`${topic.id}-${i}`] === 'known').length}/{topic.concepts.length} bekanta
                                      </span>
                                    </div>
                                    <div className="space-y-3">
                                      {topic.concepts.map((c, i) => {
                                        const mKey = `${topic.id}-${i}`
                                        const mastery = conceptMastery[mKey]
                                        const borderClass = mastery === 'known' ? 'border-[var(--color-correct-border)]' : mastery === 'review' ? 'border-[var(--color-wrong-border)]' : mastery === 'unsure' ? 'border-[var(--color-gold-deep)]/30' : 'border-[var(--color-card-border)]'
                                        return (
                                          <div key={i} className={`card rounded-xl p-4 border ${borderClass} transition-colors`}>
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                              <div className="flex items-baseline gap-2 flex-wrap">
                                                <span className="font-black text-[var(--color-ink)] text-sm">{c.term}</span>
                                                <span className="text-[10px] text-[var(--color-ink-faint)] font-mono">{c.en}</span>
                                              </div>
                                              <div className="flex gap-1 shrink-0">
                                                {([
                                                  ['known',  '✓', 'text-[var(--color-correct-text)] bg-[var(--color-correct-bg)] border-[var(--color-correct-border)]'],
                                                  ['unsure', '~', 'text-[var(--color-gold-deep)] bg-[var(--color-gold-muted)] border-[rgba(228,198,106,0.30)]'],
                                                  ['review', '↩', 'text-[var(--color-wrong-text)] bg-[var(--color-wrong-bg)] border-[var(--color-wrong-border)]'],
                                                ] as [string, string, string][]).map(([val, icon, cls]) => (
                                                  <button
                                                    key={val}
                                                    onClick={() => setMastery(mKey, val as 'known' | 'unsure' | 'review')}
                                                    title={val === 'known' ? 'Kan detta' : val === 'unsure' ? 'Osäker' : 'Behöver repetera'}
                                                    className={`w-6 h-6 rounded text-[11px] font-bold border transition-all ${mastery === val ? cls : 'text-[var(--color-ink-faint)] bg-transparent border-[var(--color-card-border)] hover:border-[var(--color-card-border)]'}`}
                                                  >
                                                    {icon}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                            <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed mb-2">
                                              <MathText text={c.definition} />
                                            </p>
                                            {c.tex && (
                                              <div className="bg-[var(--color-paper-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-ink)] overflow-x-auto mb-2">
                                                <MathText text={`$$${c.tex}$$`} />
                                              </div>
                                            )}
                                            {c.note && (
                                              <p className="text-xs text-[var(--color-gold-deep)] leading-relaxed opacity-80">
                                                <MathText text={c.note} />
                                              </p>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </>
                                )}

                                {/* ── EXAMPLES TAB ── */}
                                {tab === 'examples' && (
                                  <>
                                    <p className="text-xs text-[var(--color-ink-faint)]">Försök lösa uppgiften själv — avslöja sedan ett steg i taget.</p>
                                    <div className="space-y-5">
                                      {topic.examples.map((ex, i) => {
                                        const key = `${topic.id}-${i}`
                                        const revealed = revealedSteps[key] ?? 0
                                        const totalSteps = ex.steps.length
                                        const allRevealed = revealed >= totalSteps
                                        return (
                                          <div key={i} className="card rounded-xl overflow-hidden">
                                            <div className="bg-[var(--color-paper)] px-4 py-3 border-b border-[var(--color-card-border)]">
                                              <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-1">Uppgift {i + 1}</div>
                                              <div className="text-sm text-[var(--color-ink)] leading-relaxed">
                                                <MathText text={ex.problem} />
                                              </div>
                                            </div>
                                            <div className="px-4 py-3 space-y-2.5">
                                              {ex.steps.slice(0, revealed).map((step, j) => (
                                                <div key={j} className="flex gap-3 animate-fade-in">
                                                  <span className="text-[10px] font-black text-[var(--color-ink-faint)] bg-[var(--color-paper-dark)] w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5">{j + 1}</span>
                                                  <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
                                                    <MathText text={step} />
                                                  </div>
                                                </div>
                                              ))}
                                              {!allRevealed && (
                                                <button
                                                  onClick={() => setRevealedSteps(prev => ({ ...prev, [key]: revealed + 1 }))}
                                                  className="w-full py-2 text-xs font-semibold text-[var(--color-green-light)] border border-[var(--color-green-muted)] bg-[var(--color-paper)] hover:bg-[var(--color-paper-dark)] rounded-lg transition-colors"
                                                >
                                                  {revealed === 0 ? 'Visa steg 1' : `Visa steg ${revealed + 1} av ${totalSteps}`} →
                                                </button>
                                              )}
                                            </div>
                                            {allRevealed && (
                                              <div className="bg-[var(--color-feedback-correct-bg)] border-t border-[var(--color-feedback-correct-border)] px-4 py-2.5 flex items-center gap-2 animate-fade-in">
                                                <span className="text-[var(--color-feedback-correct-title)] text-xs font-bold uppercase tracking-widest shrink-0">Svar</span>
                                                <div className="text-sm text-[var(--color-feedback-correct-title)] font-semibold">
                                                  <MathText text={ex.answer} />
                                                </div>
                                              </div>
                                            )}
                                            {allRevealed && (
                                              <div className="px-4 pb-3">
                                                <button
                                                  onClick={() => setRevealedSteps(prev => ({ ...prev, [key]: 0 }))}
                                                  className="text-[10px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-faint)] transition-colors"
                                                >
                                                  Återställ ↺
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </>
                                )}

                                {/* Accuracy + CTA (all tabs) */}
                                <div className="pt-1 space-y-3">
                                  {acc && (
                                    <div>
                                      <div className="flex justify-between text-[10px] text-[var(--color-ink-faint)] mb-1">
                                        <span>Din träffsäkerhet ({acc.total} frågor)</span>
                                        <span className={accColor}>{acc.pct}%</span>
                                      </div>
                                      <div className="h-1 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${acc.pct >= 70 ? 'bg-[var(--color-green-light)]' : acc.pct >= 50 ? 'bg-[var(--color-gold-deep)]' : 'bg-[var(--color-error)]'}`} style={{ width: `${acc.pct}%` }} />
                                      </div>
                                    </div>
                                  )}
                                  <button
                                    onClick={() => navigate(`/practice?tag=${encodeURIComponent(topic.drillTag)}`)}
                                    className="w-full bg-[var(--color-green)] hover:bg-[var(--color-green-light)] rounded-xl py-3 font-bold text-sm text-[var(--color-cream)] transition-colors"
                                  >
                                    Öva på {topic.name} →
                                  </button>
                                  <div className="text-[10px] text-[var(--color-ink-faint)] text-center">{count} frågor i träningsbanken</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            })}

            {/* Mental math strategies */}
            <section className="mb-8">
              <h2 className="text-base font-black text-[var(--color-ink-muted)] mb-1">Tänk som HP — 5 mentala verktyg</h2>
              <p className="text-xs text-[var(--color-ink-faint)] mb-4">Dessa strategier sparar sekunder per uppgift. Under 55 minuter räknas varje sekund.</p>
              <div className="space-y-2.5">
                {[
                  { n: '01', title: '60-sekundersregeln', body: 'Fastnar du på en XYZ-uppgift efter 60 sekunder? Gör din bästa gissning och gå vidare. Ingen minuspoäng. En halvdan gissning + tid kvar är bättre än ett perfekt svar + en obesvarad.' },
                  { n: '02', title: 'Uppskattning slår exakt beräkning i KVA', body: 'KVA frågar vilket uttryck som är störst — inte exakta svar. Fråga dig: "Är detta ungefär lika med...?" Om uppskattningen räcker, slösa inte tid på exakt kalkyl.' },
                  { n: '03', title: 'Arbeta baklänges från alternativen', body: 'I XYZ: prova alternativ B eller C (de "mittersta") vid ekvationsproblem. Om det stämmer, klar. Om inte, vet du om svaret är större eller mindre. Ofta snabbare än algebraisk lösning.' },
                  { n: '04', title: 'Rita alltid en figur', body: 'I geometriuppgifter: rita figuren, märk ut känd information. Rätt figur avslöjar lösningsvägen. Fel figur kostar 10 sekunder; ingen figur kostar hela uppgiften.' },
                  { n: '05', title: 'NOG är logik, inte matematik', body: 'I NOG frågar man om informationen RÄCKER — inte om du kan lösa problemet. Du behöver ofta inte räkna alls, bara avgöra om det KAN lösas med given data.' },
                ].map(item => (
                  <div key={item.n} className="card rounded-xl p-4 flex gap-4">
                    <div className="text-xl font-black text-[var(--color-ink-faint)] shrink-0 w-7 tabular-nums">{item.n}</div>
                    <div>
                      <div className="font-semibold text-[var(--color-ink)] text-sm mb-1">{item.title}</div>
                      <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{item.body}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Weak spots */}
            {(() => {
              const weak = TOPICS
                .map(t => ({ topic: t, acc: topicAccuracy[t.id] }))
                .filter(x => x.acc && x.acc.pct < 60)
                .sort((a, b) => a.acc!.pct - b.acc!.pct)
                .slice(0, 3)
              if (!weak.length) return null
              return (
                <section className="mb-8">
                  <h2 className="text-base font-black text-[var(--color-ink-muted)] mb-1">Dina svaga punkter</h2>
                  <p className="text-xs text-[var(--color-ink-faint)] mb-3">Baserat på din träningshistorik — prioritera dessa ämnen.</p>
                  <div className="space-y-2">
                    {weak.map(({ topic, acc }) => (
                      <button
                        key={topic.id}
                        onClick={() => navigate(`/practice?tag=${encodeURIComponent(topic.drillTag)}`)}
                        className="w-full text-left bg-[var(--color-feedback-wrong-bg)] border border-[var(--color-feedback-wrong-border)] hover:bg-[var(--color-wrong-bg)] rounded-xl px-4 py-3.5 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[var(--color-ink)] text-sm">{topic.name}</span>
                          <span className="text-[var(--color-error)] font-black text-sm">{acc!.pct}%</span>
                        </div>
                        <div className="h-1 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--color-error)] rounded-full" style={{ width: `${acc!.pct}%` }} />
                        </div>
                        <div className="text-xs text-[var(--color-error)] mt-1.5 opacity-50">Öva nu →</div>
                      </button>
                    ))}
                  </div>
                </section>
              )
            })()}

            {/* Mastery bridge */}
            {(() => {
              const needsReview = TOPICS
                .map(topic => {
                  const reviewCount = topic.concepts.filter((_, i) =>
                    conceptMastery[`${topic.id}-${i}`] === 'review' || conceptMastery[`${topic.id}-${i}`] === 'unsure'
                  ).length
                  return { topic, reviewCount }
                })
                .filter(x => x.reviewCount > 0)
                .sort((a, b) => b.reviewCount - a.reviewCount)
              if (!needsReview.length) return null
              return (
                <section className="mb-8">
                  <h2 className="text-base font-black text-[var(--color-ink-muted)] mb-1">Behöver mer övning</h2>
                  <p className="text-xs text-[var(--color-ink-faint)] mb-3">Begrepp du markerat som osäkra eller behöver repetera.</p>
                  <div className="space-y-2">
                    {needsReview.map(({ topic, reviewCount }) => (
                      <button
                        key={topic.id}
                        onClick={() => navigate(`/practice?tag=${encodeURIComponent(topic.drillTag)}`)}
                        className="w-full text-left bg-[var(--color-gold-muted)] border border-[rgba(228,198,106,0.30)] hover:bg-[var(--color-paper-dark)] rounded-xl px-4 py-3.5 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-[var(--color-ink)] text-sm">{topic.name}</span>
                          <span className="text-[var(--color-gold-deep)] font-black text-xs">{reviewCount} begrepp</span>
                        </div>
                        <div className="text-xs text-[var(--color-gold-deep)] opacity-50">Öva nu →</div>
                      </button>
                    ))}
                  </div>
                </section>
              )
            })()}
          </>
        )}

        {/* ════════════════════════════════════════════
            TAB 2: Lärväg
        ════════════════════════════════════════════ */}
        {topTab === 'path' && (() => {
          const totalConcepts = TOPICS.reduce((s, t) => s + t.concepts.length, 0)
          const knownConcepts = Object.values(conceptMastery).filter(v => v === 'known').length
          const topicStatus = TOPICS.map(t => {
            const acc = topicAccuracy[t.id]
            const known = t.concepts.filter((_, i) => conceptMastery[`${t.id}-${i}`] === 'known').length
            const total = t.concepts.length
            const hasStarted = known > 0 || (acc && acc.total > 0)
            const isDone = (acc?.pct ?? 0) >= 70 && known >= Math.ceil(total * 0.5)
            return { topic: t, acc, known, total, hasStarted, isDone }
          })
          return (
            <div className="space-y-6">
              {/* Progress header */}
              <div className="card rounded-2xl p-5">
                <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Din framsteg</div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-[var(--color-ink)]">{topicStatus.filter(s => s.isDone).length}</div>
                    <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">av 10 ämnen klara</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[var(--color-green-light)]">{knownConcepts}</div>
                    <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">av {totalConcepts} begrepp</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-[var(--color-terracotta)]">{topicStatus.filter(s => s.hasStarted && !s.isDone).length}</div>
                    <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">pågående ämnen</div>
                  </div>
                </div>
                <div className="h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[var(--color-terracotta)] to-[var(--color-green-light)] rounded-full transition-all duration-700"
                    style={{ width: `${Math.round((knownConcepts / totalConcepts) * 100)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[var(--color-ink-faint)] mt-1.5 text-right">{Math.round((knownConcepts / totalConcepts) * 100)}% begrepp behärskade</div>
              </div>

              {/* How to use */}
              <div className="bg-[var(--color-green-muted)] border border-[var(--color-card-border)] rounded-xl p-4">
                <div className="text-[9px] font-bold text-[var(--color-green)] uppercase tracking-widest mb-2">Så här gör du</div>
                <ol className="space-y-1.5 text-sm text-[var(--color-ink-muted)]">
                  <li className="flex gap-2"><span className="font-black shrink-0">1.</span>Öppna ett ämne och läs lektionen (Lektion-fliken)</li>
                  <li className="flex gap-2"><span className="font-black shrink-0">2.</span>Gå igenom begreppen och markera vad du behärskar</li>
                  <li className="flex gap-2"><span className="font-black shrink-0">3.</span>Träna på riktiga HP-frågor tills träffsäkerheten når 70%</li>
                  <li className="flex gap-2"><span className="font-black shrink-0">4.</span>Gå vidare till nästa ämne i ordning</li>
                </ol>
              </div>

              {/* Phases */}
              {([1, 2, 3] as const).map(tier => {
                const meta = TIER_META[tier]
                const phaseTopics = topicStatus.filter(s => s.topic.tier === tier)
                const phaseNames: Record<number, string> = { 1: 'Fas 1 — Kritiska ämnen', 2: 'Fas 2 — Viktiga ämnen', 3: 'Fas 3 — Kompletterande' }
                return (
                  <section key={tier}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${meta.badgeColor}`}>{phaseNames[tier]}</span>
                    </div>
                    <p className="text-xs text-[var(--color-ink-faint)] mb-3">{meta.desc}</p>
                    <div className="space-y-2">
                      {phaseTopics.map(({ topic, acc, known, total, hasStarted, isDone }) => {
                        const accColor = acc ? (acc.pct >= 70 ? 'text-[var(--color-green-light)]' : acc.pct >= 50 ? 'text-[var(--color-gold-deep)]' : 'text-[var(--color-error)]') : 'text-[var(--color-ink-faint)]'
                        const statusIcon = isDone ? '✓' : hasStarted ? '◑' : '○'
                        const statusColor = isDone ? 'text-[var(--color-green-light)]' : hasStarted ? 'text-[var(--color-gold-deep)]' : 'text-[var(--color-ink-faint)]'
                        return (
                          <div key={topic.id} className={`card rounded-xl border overflow-hidden ${isDone ? 'border-[var(--color-correct-border)]' : hasStarted ? 'border-[var(--color-gold-deep)]/30' : 'border-[var(--color-card-border)]'}`}>
                            <div className="px-4 py-3.5 flex items-center gap-3">
                              <span className={`text-lg font-black shrink-0 ${statusColor}`}>{statusIcon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                  <span className="font-bold text-[var(--color-ink)] text-sm">{topic.name}</span>
                                  {acc && <span className={`text-[10px] font-bold ${accColor}`}>{acc.pct}%</span>}
                                  {!acc && <span className="text-[10px] text-[var(--color-ink-faint)]">Ej övat</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 h-1 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${known / total >= 0.5 ? 'bg-[var(--color-green-light)]' : 'bg-[var(--color-terracotta)]'}`}
                                      style={{ width: `${Math.round((known / total) * 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] text-[var(--color-ink-faint)] shrink-0">{known}/{total} begrepp</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex border-t border-[var(--color-card-border)]">
                              <button
                                onClick={() => { setTopTab('topics'); setExpanded(topic.id); setTopicInnerTab(topic.id, 'lesson') }}
                                className="flex-1 py-2 text-[11px] font-semibold text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta-muted)] transition-colors border-r border-[var(--color-card-border)]"
                              >
                                Läs lektion →
                              </button>
                              <button
                                onClick={() => navigate(`/practice?tag=${encodeURIComponent(topic.drillTag)}`)}
                                className="flex-1 py-2 text-[11px] font-semibold text-[var(--color-green)] hover:bg-[var(--color-green-muted)] transition-colors"
                              >
                                Öva frågor →
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </section>
                )
              })}

              {/* Suggested next */}
              {(() => {
                const next = topicStatus.find(s => !s.isDone)
                if (!next) return (
                  <div className="bg-[var(--color-correct-bg)] border border-[var(--color-correct-border)] rounded-xl p-5 text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="font-black text-[var(--color-correct-badge)] mb-1">Alla ämnen klara!</div>
                    <div className="text-xs text-[var(--color-correct-text)] opacity-70">Exceptionell prestation. Fortsätt underhålla med daglig träning.</div>
                  </div>
                )
                return (
                  <div className="bg-[var(--color-paper)] border border-[var(--color-card-border)] rounded-xl p-4">
                    <div className="text-[9px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Nästa steg rekommenderat</div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-mono">{next.topic.icon}</span>
                      <div>
                        <div className="font-bold text-[var(--color-ink)] text-sm">{next.topic.name}</div>
                        <div className="text-xs text-[var(--color-ink-faint)]">{next.topic.subtitle}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setTopTab('topics'); setExpanded(next.topic.id); setTopicInnerTab(next.topic.id, 'lesson') }}
                        className="flex-1 bg-[var(--color-green)] hover:bg-[var(--color-green-light)] rounded-xl py-2.5 font-bold text-sm text-[var(--color-cream)] transition-colors"
                      >
                        Starta lektion →
                      </button>
                      <button
                        onClick={() => navigate(`/practice?tag=${encodeURIComponent(next.topic.drillTag)}`)}
                        className="flex-1 bg-[var(--color-terracotta-soft)] border border-[var(--color-terracotta-muted)] hover:bg-[var(--color-terracotta-soft2)] rounded-xl py-2.5 font-bold text-sm text-[var(--color-terracotta)] transition-colors"
                      >
                        Öva direkt →
                      </button>
                    </div>
                  </div>
                )
              })()}
            </div>
          )
        })()}

        {/* ════════════════════════════════════════════
            TAB 3: Formula sheet
        ════════════════════════════════════════════ */}
        {topTab === 'formulas' && (
          <div className="space-y-7">
            <p className="text-sm text-[var(--color-ink-faint)]">Klicka på en formel för att kopiera den.</p>
            {FORMULA_SECTIONS.map(section => (
              <div key={section.title}>
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={`text-[11px] font-black uppercase tracking-widest shrink-0 ${section.color}`}>{section.title}</h3>
                  <div className="flex-1 h-px bg-[var(--color-paper-dark)]" />
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {section.formulas.map(f => (
                    <button
                      key={f.label}
                      onClick={() => copyFormula(f.tex)}
                      className={`text-left card rounded-xl px-3.5 py-3 flex flex-col gap-1.5 hover:bg-[var(--color-paper-dark)] transition-all active:scale-[0.98] ${copiedFormula === f.tex ? 'border-[var(--color-correct-border)] bg-[var(--color-correct-bg)]' : ''}`}
                    >
                      <span className="text-[10px] text-[var(--color-ink-faint)] leading-tight">{f.label}</span>
                      <span className="text-[var(--color-ink)] text-sm overflow-x-auto">
                        <MathText text={`$${f.tex}$`} />
                      </span>
                      {copiedFormula === f.tex && (
                        <span className="text-[9px] text-[var(--color-correct-text)] font-bold">Kopierad ✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════
            TAB 3: Glossary
        ════════════════════════════════════════════ */}
        {topTab === 'glossary' && (
          <div>
            <p className="text-sm text-[var(--color-ink-faint)] mb-4">{GLOSSARY.length} matematiska begrepp med definition, svenska och engelska.</p>
            <input
              type="text"
              placeholder="Sök begrepp..."
              value={glossarySearch}
              onChange={e => setGlossarySearch(e.target.value)}
              className="w-full bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-green)] mb-5 transition-colors"
            />
            <div className="space-y-2">
              {filteredGlossary.map(entry => (
                <div key={entry.term} className="card rounded-xl px-4 py-3.5">
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-black text-[var(--color-ink)] text-sm">{entry.term}</span>
                    <span className="text-[10px] font-mono text-[var(--color-ink-faint)]">{entry.en}</span>
                  </div>
                  <p className="text-xs text-[var(--color-ink-muted)] leading-relaxed">
                    <MathText text={entry.definition} />
                  </p>
                  {entry.tex && (
                    <div className="mt-2 text-sm text-[var(--color-ink-muted)] overflow-x-auto">
                      <MathText text={`$${entry.tex}$`} />
                    </div>
                  )}
                </div>
              ))}
              {filteredGlossary.length === 0 && (
                <p className="text-[var(--color-ink-faint)] text-center py-8 text-sm">Inget begrepp hittades.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
