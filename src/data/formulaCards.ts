export interface FormulaSection {
  title: string
  items: { label: string; formula: string; note?: string }[]
}

export interface FormulaCard {
  type: string
  color: string        // Tailwind text color
  borderColor: string  // Tailwind border color
  bgColor: string      // Tailwind bg color
  tagline: string
  sections: FormulaSection[]
}

export const FORMULA_CARDS: Record<string, FormulaCard> = {
  XYZ: {
    type: 'XYZ',
    color: 'text-[var(--color-terracotta)]',
    borderColor: 'border-[var(--color-card-border)]',
    bgColor: 'bg-[var(--color-terracotta-muted)]',
    tagline: 'Matematisk problemlösning — nyckelformler',
    sections: [
      {
        title: 'Procent & förändring',
        items: [
          { label: 'a% av b',         formula: '(a × b) / 100' },
          { label: 'Procentuell ökning', formula: '(nytt − gammalt) / gammalt × 100' },
          { label: 'Ökning med p%',   formula: 'värde × (1 + p/100)' },
          { label: 'Minskning med p%', formula: 'värde × (1 − p/100)' },
        ],
      },
      {
        title: 'Geometri',
        items: [
          { label: 'Cirkelns area',   formula: 'πr²' },
          { label: 'Cirkelns omkrets', formula: '2πr' },
          { label: 'Triangelns area', formula: 'bh / 2' },
          { label: 'Pythagoras',      formula: 'a² + b² = c²' },
          { label: 'Rektangel area',  formula: 'l × b' },
        ],
      },
      {
        title: 'Algebra',
        items: [
          { label: 'Andragradsekvation', formula: 'x = (−b ± √(b²−4ac)) / 2a' },
          { label: '(a+b)²',          formula: 'a² + 2ab + b²' },
          { label: '(a−b)²',          formula: 'a² − 2ab + b²' },
          { label: 'Konjugatregeln',  formula: '(a+b)(a−b) = a² − b²' },
        ],
      },
      {
        title: 'Tal & statistik',
        items: [
          { label: 'Medelvärde',      formula: 'Summa / Antal' },
          { label: 'Hastighet',       formula: 's = d / t' },
          { label: 'Ränta-på-ränta',  formula: 'K_n = K₀ × (1 + r)ⁿ' },
          { label: 'Sannolikhet',     formula: 'Gynnsamma / Möjliga utfall' },
        ],
      },
    ],
  },

  KVA: {
    type: 'KVA',
    color: 'text-[var(--color-terracotta)]',
    borderColor: 'border-[var(--color-card-border)]',
    bgColor: 'bg-[var(--color-terracotta-muted)]',
    tagline: 'Kvantitativa jämförelser — strategier',
    sections: [
      {
        title: 'Svarsalternativ',
        items: [
          { label: 'A', formula: 'Kolumn A är större' },
          { label: 'B', formula: 'Kolumn B är större' },
          { label: 'C', formula: 'Kolumnerna är lika stora' },
          { label: 'D', formula: 'Kan inte avgöras' },
        ],
      },
      {
        title: 'Strategi',
        items: [
          { label: 'Testa specifika tal', formula: '0, 1, −1, ½ — välj smart', note: 'Om svar skiljer sig → D' },
          { label: 'Förenkla',           formula: 'Subtrahera/dividera samma från båda sidor' },
          { label: 'Negativa tal',       formula: 'Vänder olikheten vid multiplikation' },
          { label: 'Kvadratrötter',      formula: '√x < x för x > 1,  √x > x för 0 < x < 1' },
        ],
      },
      {
        title: 'Vanliga fällor',
        items: [
          { label: 'x kan vara negativ', formula: 'Om inte angivet — testa negativa' },
          { label: 'x kan vara bråk',    formula: 'Glöm inte intervallet 0 < x < 1' },
          { label: 'x = 0',              formula: 'Noll är varken positivt eller negativt' },
        ],
      },
    ],
  },

  NOG: {
    type: 'NOG',
    color: 'text-[var(--color-terracotta)]',
    borderColor: 'border-[var(--color-card-border)]',
    bgColor: 'bg-[var(--color-terracotta-muted)]',
    tagline: 'Dataräcklighet — sufficiensregler',
    sections: [
      {
        title: 'Svarsnyckeln',
        items: [
          { label: 'A', formula: 'Uppgift 1 ensam räcker' },
          { label: 'B', formula: 'Uppgift 2 ensam räcker' },
          { label: 'C', formula: 'Båda uppgifterna behövs' },
          { label: 'D', formula: 'Varje uppgift räcker ensam' },
          { label: 'E', formula: 'Ingen uppgift räcker, inte ens ihop' },
        ],
      },
      {
        title: 'Tillvägagångssätt',
        items: [
          { label: 'Steg 1', formula: 'Testa uppgift 1 helt ensam — ignorera 2' },
          { label: 'Steg 2', formula: 'Testa uppgift 2 helt ensam — ignorera 1' },
          { label: 'Steg 3', formula: 'Om ingen räcker ensam — testa båda ihop' },
          { label: 'Mål',    formula: 'Räcker för ETT unikt svar — inte ett svar' },
        ],
      },
      {
        title: 'Vanliga fällor',
        items: [
          { label: 'Du behöver inte lösa frågan', formula: 'Bara avgöra om du KAN lösa den' },
          { label: 'Kan ge ett intervall',         formula: '→ räcker inte (kräver unikt värde)' },
          { label: 'Ja/Nej-frågor',               formula: 'Räcker om alltid Ja eller alltid Nej' },
        ],
      },
    ],
  },

  DTK: {
    type: 'DTK',
    color: 'text-[var(--color-gold-deep)]',
    borderColor: 'border-[var(--color-card-border)]',
    bgColor: 'bg-[var(--color-gold-muted)]',
    tagline: 'Diagram, tabeller & kartor — lästeknik',
    sections: [
      {
        title: 'Läs innan du räknar',
        items: [
          { label: 'Titel & källa',   formula: 'Förstå vad diagrammet mäter' },
          { label: 'Axlar & enheter', formula: 'Kolla om y-axeln börjar vid 0' },
          { label: 'Legenden',        formula: 'Identifiera alla serier/kategorier' },
          { label: 'Tidsperiod',      formula: 'Notera vilket år/kvartal data gäller' },
        ],
      },
      {
        title: 'Beräkningar',
        items: [
          { label: 'Procentuell förändring', formula: '(nytt − gammalt) / gammalt × 100%' },
          { label: 'Andel av totalt',        formula: 'Del / Total × 100%' },
          { label: 'Uppskattning',           formula: 'Avrunda för att snabba upp', note: 'Exakta siffror sällan nödvändigt' },
        ],
      },
      {
        title: 'Vanliga fällor',
        items: [
          { label: 'Avklippt y-axel',      formula: 'Förstärker visuella skillnader — var kritisk' },
          { label: 'Absolut vs relativ',    formula: 'Störst stapel ≠ störst procentandel' },
          { label: 'Läs frågan exakt',      formula: '"Mest" / "Minst" / "Näst störst" — skilj åt' },
        ],
      },
    ],
  },
}
