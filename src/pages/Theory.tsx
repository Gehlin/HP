import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InlineMath } from 'react-katex'

type Section = 'overview' | 'XYZ' | 'KVA' | 'NOG' | 'DTK' | 'formulas' | 'algebra' | 'probability' | 'geometry' | 'nog-strategy'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'overview', label: 'Översikt' },
  { id: 'XYZ', label: 'XYZ' },
  { id: 'KVA', label: 'KVA' },
  { id: 'NOG', label: 'NOG' },
  { id: 'DTK', label: 'DTK' },
  { id: 'formulas', label: 'Formelblad' },
  { id: 'algebra', label: 'Algebra' },
  { id: 'probability', label: 'Sannolikhet' },
  { id: 'geometry', label: 'Geometri' },
  { id: 'nog-strategy', label: 'NOG Strategibok' },
]

function Overview() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300 leading-relaxed">
        Högskoleprovet (HP) är ett urvalsprov till högskoleutbildningar i Sverige. Det kvantitativa delprovet består av 40 frågor i fyra avsnitt och har en provtid på 55 minuter.
      </p>
      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700">
            <tr>
              <th className="text-left p-3 font-bold">Delprov</th>
              <th className="text-left p-3 font-bold">Frågor</th>
              <th className="text-left p-3 font-bold">Tid</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['XYZ – Matematisk problemlösning', '12 (nr 1–12)', '12 min'],
              ['KVA – Kvantitativa jämförelser', '10 (nr 13–22)', '10 min'],
              ['NOG – Kvantitativa resonemang', '6 (nr 23–28)', '10 min'],
              ['DTK – Diagram, tabeller och kartor', '12 (nr 29–40)', '23 min'],
            ].map(([d, f, t]) => (
              <tr key={d} className="border-t border-slate-700">
                <td className="p-3">{d}</td>
                <td className="p-3 text-slate-400">{f}</td>
                <td className="p-3 text-slate-400">{t}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4">
        <div className="font-bold mb-2 text-blue-300">💡 Viktigt att veta</div>
        <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
          <li>Du får <strong>aldrig minuspoäng</strong> — svara alltid på varje fråga.</li>
          <li>Rätt svar ger 1 poäng, fel eller ej besvarat ger 0.</li>
          <li>Tidsgränsen är 55 minuter för hela delprovet.</li>
          <li>Ingen miniräknare är tillåten — men det behövs inte heller.</li>
        </ul>
      </div>
    </div>
  )
}

function XYZSection() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300">Matematisk problemlösning — 12 frågor med svarsalternativen A, B, C, D.</p>

      <div className="space-y-4">
        <h3 className="font-black text-blue-400 text-lg">Vanliga ämnesområden</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Algebra', 'Ekvationer, olikheter, faktorer'],
            ['Geometri', 'Area, omkrets, trianglar, cirklar'],
            ['Procent & bråk', 'Höjningar, sänkningar, kvot'],
            ['Sannolikhet', 'Grundläggande kombinatorik'],
            ['Funktioner', 'Linjära, kvadratiska, sammansatta'],
            ['Talteori', 'Primtal, delbarlighet, jämnt/udda'],
          ].map(([t, d]) => (
            <div key={t} className="bg-slate-800 rounded-xl p-3">
              <div className="font-bold text-sm">{t}</div>
              <div className="text-xs text-slate-400 mt-1">{d}</div>
            </div>
          ))}
        </div>

        <h3 className="font-black text-blue-400 text-lg mt-6">Strategi</h3>
        <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
          <li>Läs frågan noga — identifiera vad som faktiskt frågas.</li>
          <li>Prova svarsalternativen om uträkningen är svår — ofta snabbare.</li>
          <li>Uppskatta svaret och eliminera uppenbart fel alternativ.</li>
          <li>Rekommenderad tid: <strong>ca 1 min/fråga</strong>. Fastnar du, gissa och gå vidare.</li>
        </ul>

        <h3 className="font-black text-blue-400 text-lg mt-6">Exempeluppgift</h3>
        <div className="bg-slate-800 rounded-xl p-4">
          <p className="mb-3">Nils sparar 1/5 av sin lön. Vad är kvoten sparar:spenderar?</p>
          <p className="text-sm text-slate-400">Sparar: 1/5. Spenderar: 4/5. Kvot = (1/5)÷(4/5) = <strong className="text-emerald-400">1/4</strong></p>
        </div>
      </div>
    </div>
  )
}

function KVASection() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300">Kvantitativa jämförelser — 10 frågor. Jämför Kvantitet I med Kvantitet II.</p>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-700 p-3 font-bold text-sm">Svarsalternativ — alltid samma</div>
        <div className="divide-y divide-slate-700 text-sm">
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">A</span> Kvantitet I är större än Kvantitet II</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">B</span> Kvantitet II är större än Kvantitet I</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">C</span> Kvantiteterna är lika stora</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">D</span> Informationen är otillräcklig för att avgöra</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-blue-400 text-lg">Strategi</h3>
        <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
          <li><strong>Förenkla</strong> — subtrahera eller dividera båda kvantiteterna med samma positiva tal.</li>
          <li><strong>Testa extremvärden</strong> — prova gränsvärden och typvärden för variabler.</li>
          <li><strong>D är vanligare än man tror</strong> — om du hittar ett fall där I &gt; II och ett där II &gt; I är svaret D.</li>
          <li>Om villkoret ger ett unikt värde → sällan D.</li>
          <li>Var extra försiktig med negativa tal och rötter.</li>
        </ul>

        <h3 className="font-black text-blue-400 text-lg">Exempeluppgift</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm">
          <p className="mb-2">x &gt; 4. I: 1/x. II: 1/4.</p>
          <p className="text-slate-400">Eftersom x &gt; 4 är 1/x &lt; 1/4. Svar: <strong className="text-emerald-400">B</strong></p>
        </div>

        <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
          <div className="font-bold mb-2 text-amber-300">⚠️ Vanlig fälla</div>
          <p className="text-sm text-slate-300">Om x² = 4 kan x = 2 eller x = –2. Testa alltid <em>båda</em> värdena!</p>
        </div>
      </div>
    </div>
  )
}

function NOGSection() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300">Kvantitativa resonemang — 6 frågor. Avgör om påståendena (1) och (2) är tillräckliga för att svara på frågan.</p>

      <div className="bg-slate-800 rounded-xl overflow-hidden">
        <div className="bg-slate-700 p-3 font-bold text-sm">Svarsalternativ — alltid samma</div>
        <div className="divide-y divide-slate-700 text-sm">
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">A</span> Tillräcklig information i (1) men ej i (2)</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">B</span> Tillräcklig information i (2) men ej i (1)</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">C</span> Tillräcklig information i (1) tillsammans med (2)</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">D</span> Tillräcklig information i (1) och (2) var för sig</div>
          <div className="p-3 flex gap-3"><span className="font-black text-blue-400 w-6">E</span> Ej tillräcklig information ens med båda påståendena</div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-black text-blue-400 text-lg">Metod — steg för steg</h3>
        <div className="space-y-3">
          {[
            ['Steg 1', 'Prova (1) ensamt. Kan du svara entydigt?'],
            ['Steg 2', 'Prova (2) ensamt. Kan du svara entydigt?'],
            ['Steg 3', 'Prova (1) + (2) tillsammans om inget räckte ensamt.'],
            ['Viktigt', 'Du behöver inte lösa hela problemet — bara avgöra om informationen räcker!'],
          ].map(([t, d]) => (
            <div key={t} className="bg-slate-800 rounded-xl p-3 flex gap-3">
              <span className="font-black text-blue-400 shrink-0">{t}:</span>
              <span className="text-sm text-slate-300">{d}</span>
            </div>
          ))}
        </div>

        <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4">
          <div className="font-bold mb-2 text-emerald-300">✓ Kom ihåg</div>
          <ul className="text-sm text-slate-300 space-y-1 list-disc list-inside">
            <li>"Entydigt" = ett enda möjligt svar på frågan.</li>
            <li>Om svaret på frågan alltid är "Nej" är det fortfarande entydigt!</li>
            <li>E är ovanligt — kontrollera noga innan du väljer E.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function DTKSection() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300">Diagram, tabeller och kartor — 12 frågor. Läs av och räkna utifrån presenterat datamaterial.</p>

      <div className="space-y-4">
        <h3 className="font-black text-blue-400 text-lg">Vanliga datatyper</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['Stapeldiagram', 'Läs av stapelhöjder, beräkna skillnader och procent'],
            ['Linjediagram', 'Identifiera trender, max/min, procentuell förändring'],
            ['Tabeller', 'Summera, jämföra rader/kolumner, beräkna kvoter'],
            ['Kartfrågor', 'Uppskatta avstånd och areor med kartskalan'],
            ['Cirkeldiagram', 'Uppskatta sektorers andel av helheten'],
            ['Kombinerade', 'Ofta flera diagram om samma dataset'],
          ].map(([t, d]) => (
            <div key={t} className="bg-slate-800 rounded-xl p-3">
              <div className="font-bold text-sm">{t}</div>
              <div className="text-xs text-slate-400 mt-1">{d}</div>
            </div>
          ))}
        </div>

        <h3 className="font-black text-blue-400 text-lg mt-4">Strategi</h3>
        <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
          <li>Läs <strong>rubriken och enheterna</strong> noggrant innan frågorna.</li>
          <li>Uppskatta ofta hellre än att räkna exakt — alternativen är sällan tätt ihop.</li>
          <li>Markera relevant data direkt i provhäftet.</li>
          <li>DTK ger mest tid per fråga (ca 2 min) — ta den tid du behöver.</li>
        </ul>
      </div>
    </div>
  )
}

function Formulas() {
  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">Alla formler du bör ha memorerade inför HP-kvantitativt.</p>

      {[
        {
          title: 'Geometri',
          items: [
            ['Triangel area', 'A = \\frac{1}{2} \\cdot b \\cdot h'],
            ['Pythagoras', 'a^2 + b^2 = c^2'],
            ['Cirkel area', 'A = \\pi r^2'],
            ['Cirkelns omkrets', 'O = 2\\pi r'],
            ['Rektangel area', 'A = l \\cdot b'],
            ['Cylinder volym', 'V = \\pi r^2 h'],
          ],
        },
        {
          title: 'Procent',
          items: [
            ['Procentuell ökning', 'p\\% \\Rightarrow \\text{multiplicera med } 1 + \\frac{p}{100}'],
            ['Procentuell minskning', 'p\\% \\Rightarrow \\text{multiplicera med } 1 - \\frac{p}{100}'],
            ['Andel i procent', '\\frac{del}{helhet} \\times 100'],
          ],
        },
        {
          title: 'Algebra',
          items: [
            ['Kvadrering', '(a+b)^2 = a^2 + 2ab + b^2'],
            ['Kvadrering', '(a-b)^2 = a^2 - 2ab + b^2'],
            ['Konjugatregel', '(a+b)(a-b) = a^2 - b^2'],
            ['PQ-formeln', 'x = -\\frac{p}{2} \\pm \\sqrt{\\left(\\frac{p}{2}\\right)^2 - q}'],
          ],
        },
        {
          title: 'Sannolikhet & statistik',
          items: [
            ['Sannolikhet', 'P(A) = \\frac{\\text{gynnsamma utfall}}{\\text{möjliga utfall}}'],
            ['Komplement', 'P(\\text{inte A}) = 1 - P(A)'],
            ['Medelvärde', '\\bar{x} = \\frac{x_1 + x_2 + \\cdots + x_n}{n}'],
          ],
        },
        {
          title: 'Potenser & rötter',
          items: [
            ['Produktregel', 'a^m \\cdot a^n = a^{m+n}'],
            ['Kvotregeln', '\\frac{a^m}{a^n} = a^{m-n}'],
            ['Negativt tal', 'a^{-n} = \\frac{1}{a^n}'],
            ['Rotregeln', '\\sqrt{a \\cdot b} = \\sqrt{a} \\cdot \\sqrt{b}'],
          ],
        },
      ].map(({ title, items }) => (
        <div key={title}>
          <h3 className="font-black text-blue-400 text-lg mb-3">{title}</h3>
          <div className="bg-slate-800 rounded-xl divide-y divide-slate-700">
            {items.map(([label, formula]) => (
              <div key={label + formula} className="p-3 flex items-center justify-between gap-4">
                <span className="text-sm text-slate-400">{label}</span>
                <span className="font-mono text-sm text-slate-200">
                  <InlineMath math={formula} />
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AlgebraSection() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300">Grundläggande algebraiska metoder — ekvationer, faktorisering och andragradsekvationer.</p>

      {/* 1. Linear equations */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Linjära ekvationer — steg för steg</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <p>Målet är att isolera variabeln på ena sidan. Utför samma operation på båda sidor.</p>
        </div>
        <div className="bg-slate-800 rounded-xl p-4 mt-3 text-sm space-y-2">
          <p className="font-bold text-slate-200">Exempel: Lös <InlineMath math="3x - 5 = 2x + 7" /></p>
          <div className="text-slate-400 space-y-1">
            <p><InlineMath math="3x - 5 = 2x + 7" /> &nbsp;|&nbsp; Subtrahera <InlineMath math="2x" /> från båda sidor</p>
            <p><InlineMath math="x - 5 = 7" /> &nbsp;|&nbsp; Addera 5 på båda sidor</p>
            <p><InlineMath math="x = 12" /> &nbsp; <span className="text-emerald-400 font-bold">✓</span></p>
          </div>
        </div>
      </div>

      {/* 2. Expanding brackets */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Parentesmultiplikation — FOIL</h3>
        <p className="text-sm text-slate-300 mb-3">
          Multiplicera varje term i den första parentesen med varje term i den andra: First · Outer · Inner · Last.
        </p>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
          <p className="font-bold text-slate-200">Exempel: <InlineMath math="(a+b)(c+d)" /></p>
          <div className="text-slate-400 space-y-1">
            <p>F: <InlineMath math="a \cdot c = ac" /></p>
            <p>O: <InlineMath math="a \cdot d = ad" /></p>
            <p>I: <InlineMath math="b \cdot c = bc" /></p>
            <p>L: <InlineMath math="b \cdot d = bd" /></p>
            <p className="text-slate-200 pt-1">Resultat: <InlineMath math="ac + ad + bc + bd" /></p>
          </div>
        </div>
      </div>

      {/* 3. Factoring */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Faktorisering</h3>
        <div className="space-y-3">
          <div className="bg-slate-800 rounded-xl p-3 text-sm">
            <p className="font-bold text-slate-200 mb-1">Gemensam faktor</p>
            <p className="text-slate-400"><InlineMath math="6x^2 + 9x = 3x(2x + 3)" /></p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-sm">
            <p className="font-bold text-slate-200 mb-1">Konjugatregel (kvadratskillnad)</p>
            <p className="text-slate-400"><InlineMath math="x^2 - 16 = (x+4)(x-4)" /></p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-sm">
            <p className="font-bold text-slate-200 mb-1">Trinomfaktorisering</p>
            <p className="text-slate-400">
              <InlineMath math="x^2 + 5x + 6" /> — hitta två tal vars produkt är 6 och summa är 5: (2, 3).
            </p>
            <p className="text-slate-400 mt-1"><InlineMath math="= (x+2)(x+3)" /></p>
          </div>
        </div>
      </div>

      {/* 4. Conjugate / square identities */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">De tre kvadratidentiteterna</h3>
        <div className="bg-slate-800 rounded-xl divide-y divide-slate-700">
          {([
            ['(a+b)^2 = a^2 + 2ab + b^2', '(x+3)^2 = x^2 + 6x + 9'],
            ['(a-b)^2 = a^2 - 2ab + b^2', '(x-5)^2 = x^2 - 10x + 25'],
            ['(a+b)(a-b) = a^2 - b^2', '(x+4)(x-4) = x^2 - 16'],
          ] as [string, string][]).map(([id, ex]) => (
            <div key={id} className="p-3 text-sm">
              <p className="text-slate-200"><InlineMath math={id} /></p>
              <p className="text-slate-400 text-xs mt-1">Ex: <InlineMath math={ex} /></p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PQ formula */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Andragradsekvationer — PQ-formeln</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-3">
          <p className="text-slate-300">
            För <InlineMath math="x^2 + px + q = 0" />:
          </p>
          <p className="text-center text-slate-200 text-base">
            <InlineMath math="x = -\frac{p}{2} \pm \sqrt{\left(\frac{p}{2}\right)^2 - q}" />
          </p>
          <div className="border-t border-slate-700 pt-3 space-y-1">
            <p className="font-bold text-slate-200">Exempel: <InlineMath math="x^2 - 5x + 6 = 0" /></p>
            <p className="text-slate-400"><InlineMath math="p = -5,\; q = 6" /></p>
            <p className="text-slate-400">
              <InlineMath math="x = \frac{5}{2} \pm \sqrt{\left(\frac{5}{2}\right)^2 - 6} = \frac{5}{2} \pm \sqrt{6{,}25 - 6} = \frac{5}{2} \pm 0{,}5" />
            </p>
            <p className="text-emerald-400 font-bold"><InlineMath math="x_1 = 3, \quad x_2 = 2" /></p>
          </div>
        </div>
      </div>

      {/* 6. Common mistakes */}
      <div className="bg-amber-900/30 border border-amber-700 rounded-xl p-4">
        <div className="font-bold mb-3 text-amber-300">⚠️ Vanliga misstag</div>
        <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
          <li>
            <strong>Glömma att vända olikhetstecknet</strong> vid division/multiplikation med negativt tal.
            &nbsp;<InlineMath math="-2x > 4 \Rightarrow x < -2" />, inte <InlineMath math="x > -2" />.
          </li>
          <li>
            <strong>Teckelmiss vid expansion av </strong><InlineMath math="-(a - b)" />:&nbsp;
            resultatet är <InlineMath math="-a + b" />, inte <InlineMath math="-a - b" />.
          </li>
          <li>
            <strong><InlineMath math="x^2 = 4" /> har två lösningar</strong>: <InlineMath math="x = 2" /> och <InlineMath math="x = -2" />. Missa inte den negativa roten.
          </li>
        </ul>
      </div>
    </div>
  )
}

function ProbabilitySection() {
  return (
    <div className="space-y-6">
      <p className="text-slate-300">Sannolikhet och kombinatorik — grundläggande begrepp, räkneregler och HP-strategier.</p>

      {/* 1. Basic probability */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Grunddefinition</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
          <p className="text-slate-200">
            <InlineMath math="P(A) = \dfrac{\text{antal gynnsamma utfall}}{\text{antal möjliga utfall}}" />
          </p>
          <p className="text-slate-400 pt-1">
            <strong className="text-slate-200">Exempel — tärning:</strong> Sannolikheten att slå ett jämnt tal (2, 4 eller 6) är{' '}
            <InlineMath math="\tfrac{3}{6} = \tfrac{1}{2}" />.
          </p>
          <p className="text-slate-400">Sannolikheten är alltid ett tal mellan 0 och 1 (eller 0 % och 100 %).</p>
        </div>
      </div>

      {/* 2. Complement */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Komplementregeln</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
          <p className="text-slate-200 text-base">
            <InlineMath math="P(\text{inte } A) = 1 - P(A)" />
          </p>
          <p className="text-slate-300 pt-1">
            <strong>När ska du använda den?</strong> Alltid när det är lättare att räkna det <em>oönskade</em> utfallet.
          </p>
          <p className="text-slate-400">
            Exempel: Sannolikheten att <em>minst en</em> av tre kast inte landar på 6 är svår att räkna direkt — men
            komplement (att <em>alla tre</em> landar på 6) är enkelt:{' '}
            <InlineMath math="1 - \left(\tfrac{1}{6}\right)^3 = 1 - \tfrac{1}{216}" />.
          </p>
        </div>
      </div>

      {/* 3. Independent events */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Oberoende händelser</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
          <p className="text-slate-200 text-base">
            <InlineMath math="P(A \text{ och } B) = P(A) \times P(B)" />
          </p>
          <p className="text-slate-300 pt-1">
            Gäller när utfallet av A inte påverkar utfallet av B.
          </p>
          <p className="text-slate-400">
            Exempel: Sannolikheten att slå 6 på en tärning <em>och</em> krona med ett mynt:{' '}
            <InlineMath math="\tfrac{1}{6} \times \tfrac{1}{2} = \tfrac{1}{12}" />.
          </p>
        </div>
      </div>

      {/* 4. Permutations vs combinations */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Permutationer vs. kombinationer</h3>
        <div className="space-y-3">
          <div className="bg-slate-800 rounded-xl p-3 text-sm">
            <p className="font-bold text-slate-200 mb-1">Permutation — ordning spelar roll</p>
            <p className="text-slate-400">
              Hur många sätt kan 3 av 5 personer ställa sig i kö?{' '}
              <InlineMath math="5 \times 4 \times 3 = 60" /> sätt.
            </p>
            <p className="text-slate-400 mt-1">
              Allmänt: <InlineMath math="n \times (n{-}1) \times \cdots \times (n{-}k{+}1)" />
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3 text-sm">
            <p className="font-bold text-slate-200 mb-1">Kombination — ordning spelar ingen roll</p>
            <p className="text-slate-400">
              Hur många sätt kan vi välja 3 av 5 personer (utan hänsyn till ordning)?{' '}
              <InlineMath math="\dfrac{5 \times 4 \times 3}{3 \times 2 \times 1} = 10" /> sätt.
            </p>
            <p className="text-slate-400 mt-1">
              Dividera alltid med <InlineMath math="k!" /> för att ta bort dubbletter av samma urval.
            </p>
          </div>
          <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-3 text-sm">
            <p className="text-blue-300 font-bold mb-1">Tumregel</p>
            <p className="text-slate-300">
              Nämns ett lopp, en köordning eller en kod → permutation.
              Nämns ett lag, en kommitté eller ett urval utan ordning → kombination.
            </p>
          </div>
        </div>
      </div>

      {/* 5. At least one */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">"Minst en"-problem</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
          <p className="text-slate-300">
            Frågor av typen <em>"sannolikheten att minst en …"</em> löses <strong>alltid</strong> med komplement:
          </p>
          <p className="text-slate-200">
            <InlineMath math="P(\text{minst en}) = 1 - P(\text{ingen})" />
          </p>
          <p className="text-slate-400 pt-1">
            Exempel: En låda med 10 kulor, 3 röda. Du drar 2 (med återläggning). Sannolikheten att få minst en röd:
          </p>
          <div className="text-slate-400 space-y-1">
            <p><InlineMath math="P(\text{ingen röd}) = \tfrac{7}{10} \times \tfrac{7}{10} = \tfrac{49}{100}" /></p>
            <p><InlineMath math="P(\text{minst en röd}) = 1 - \tfrac{49}{100} = \tfrac{51}{100}" /></p>
          </div>
        </div>
      </div>

      {/* 6. Conditional probability (intuitive) */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Betingad sannolikhet — intuitiv förståelse</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-3">
          <p className="text-slate-300">
            Betingad sannolikhet svarar på: <em>"Vad är sannolikheten för A, givet att vi vet att B redan har hänt?"</em>
          </p>
          <p className="text-slate-400">
            <strong className="text-slate-200">Exempel:</strong> En klass har 20 elever, varav 12 gillar matematik
            och 8 gillar bägge matematik och idrott. Givet att en slumpmässigt vald elev gillar matematik — vad är
            sannolikheten att de även gillar idrott?
          </p>
          <p className="text-slate-400">
            Vi begränsar oss till de 12 matematikälskarna. Av dem gillar 8 även idrott:{' '}
            <InlineMath math="\tfrac{8}{12} = \tfrac{2}{3}" />.
          </p>
          <p className="text-slate-300 font-bold">
            Nyckel: Byt ut "hela populationen" mot "den betingade gruppen" och räkna som vanligt.
          </p>
        </div>
      </div>

      {/* 7. Three worked HP-style examples */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Tre HP-uppgifter med lösningar</h3>
        <div className="space-y-4">

          <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
            <p className="font-bold text-slate-200">Uppgift 1</p>
            <p className="text-slate-300">
              En väska innehåller 4 röda och 6 blå kulor. Du drar 2 kulor utan återläggning. Vad är sannolikheten att
              båda är röda?
            </p>
            <div className="border-t border-slate-700 pt-2 text-slate-400 space-y-1">
              <p>Första draget: <InlineMath math="\tfrac{4}{10}" /></p>
              <p>Andra draget (en röd borta): <InlineMath math="\tfrac{3}{9}" /></p>
              <p><InlineMath math="P = \tfrac{4}{10} \times \tfrac{3}{9} = \tfrac{12}{90} = \tfrac{2}{15}" /></p>
              <p className="text-emerald-400 font-bold">Svar: 2/15</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
            <p className="font-bold text-slate-200">Uppgift 2</p>
            <p className="text-slate-300">
              På hur många sätt kan 5 personer sitta runt ett runt bord om det är rotationssymmetri
              (dvs. två placeringar räknas som lika om de är varandras rotation)?
            </p>
            <div className="border-t border-slate-700 pt-2 text-slate-400 space-y-1">
              <p>Håll en person fast som referens. Placera resten:</p>
              <p><InlineMath math="(5-1)! = 4! = 24" /> sätt.</p>
              <p className="text-emerald-400 font-bold">Svar: 24</p>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2">
            <p className="font-bold text-slate-200">Uppgift 3</p>
            <p className="text-slate-300">
              Du kastar en tärning 3 gånger. Vad är sannolikheten att du <em>minst en gång</em> slår en 1:a?
            </p>
            <div className="border-t border-slate-700 pt-2 text-slate-400 space-y-1">
              <p>Använd komplement: <InlineMath math="P(\text{ingen 1:a}) = \left(\tfrac{5}{6}\right)^3 = \tfrac{125}{216}" /></p>
              <p><InlineMath math="P(\text{minst en 1:a}) = 1 - \tfrac{125}{216} = \tfrac{91}{216}" /></p>
              <p className="text-emerald-400 font-bold">Svar: 91/216 ≈ 42 %</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function GeometrySection() {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})
  const toggle = (i: number) => setRevealed(r => ({ ...r, [i]: !r[i] }))

  const snabbtest: { q: string; a: string }[] = [
    {
      q: 'En rektangel är 8 cm lång och 5 cm bred. Vad är diagonalens längd?',
      a: 'Pythagoras: √(8² + 5²) = √(64 + 25) = √89 ≈ 9,4 cm',
    },
    {
      q: 'Två liknande trianglar har sidorna i förhållandet 3 : 5. Vad är förhållandet mellan deras areor?',
      a: 'Arean skalar med kvadraten på sidoförhållandet: 3² : 5² = 9 : 25',
    },
    {
      q: 'En cirkel har radien 6. Vad är arean? (Svaret i termer av π)',
      a: 'A = πr² = π · 36 = 36π',
    },
    {
      q: 'Vad är mittpunkten mellan koordinaterna (2, 8) och (6, 4)?',
      a: 'Mittpunkt = ((2+6)/2, (8+4)/2) = (4, 6)',
    },
    {
      q: 'En cylinder har radien 3 och höjden 10. Vad är volymen? (Svaret i termer av π)',
      a: 'V = πr²h = π · 9 · 10 = 90π',
    },
  ]

  return (
    <div className="space-y-6">
      <p className="text-slate-300">Geometriska formler, bevis och strategier — från grundformlerna till koordinatgeometri.</p>

      {/* 1. Area / perimeter / volume formulas */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Area, omkrets &amp; volym</h3>
        <div className="bg-slate-800 rounded-xl divide-y divide-slate-700 text-sm">
          {([
            ['Rektangel — area', 'A = l \\cdot b', 'Längd × bredd. Diagonalen d = √(l² + b²)'],
            ['Triangel — area', 'A = \\tfrac{1}{2} \\cdot b \\cdot h', 'b = bas, h = höjd (vinkelrätt mot basen)'],
            ['Parallelogram — area', 'A = b \\cdot h', 'Samma formel som rektangeln men h är lodrät höjd'],
            ['Cirkel — area', 'A = \\pi r^2', 'r = radien'],
            ['Cirkel — omkrets', 'O = 2\\pi r', 'Diameter d = 2r, alltså O = πd'],
            ['Cylinder — volym', 'V = \\pi r^2 h', 'Basarea × höjd'],
            ['Rektangulär låda — volym', 'V = l \\cdot b \\cdot h', 'Längd × bredd × höjd'],
          ] as [string, string, string][]).map(([label, formula, note]) => (
            <div key={label} className="p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 shrink-0">{label}</span>
                <span className="text-slate-200"><InlineMath math={formula} /></span>
              </div>
              <span className="text-xs text-slate-500">{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Pythagoras */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Pythagoras sats</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-3">
          <p className="text-slate-200 text-base text-center">
            <InlineMath math="a^2 + b^2 = c^2" />
          </p>
          <p className="text-slate-300">
            <strong>c</strong> är alltid hypotenusan — sidan <em>mitt emot rät vinkel</em>, den längsta sidan.
            Kateter kallas de andra två sidorna.
          </p>
          <div className="border-t border-slate-700 pt-3">
            <p className="font-bold text-slate-200 mb-2">Pytagoreiska tripplar att memorera</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['3–4–5', '9 + 16 = 25 ✓'],
                ['5–12–13', '25 + 144 = 169 ✓'],
                ['6–8–10', 'Skalas från 3–4–5 (× 2)'],
                ['8–15–17', '64 + 225 = 289 ✓'],
              ].map(([triple, check]) => (
                <div key={triple} className="bg-slate-700 rounded-lg p-2">
                  <span className="font-bold text-emerald-400">{triple}</span>
                  <span className="text-slate-400 text-xs block">{check}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-2">
              Alla skalade versioner fungerar: t.ex. 9–12–15 (3×3–4–5).
            </p>
          </div>
        </div>
      </div>

      {/* 3. Similar triangles */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Likformiga trianglar</h3>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-3">
          <p className="text-slate-300">
            Två trianglar är <strong>likformiga</strong> om alla vinklar är lika stora. Sidorna är då proportionella.
          </p>
          <p className="text-slate-300">
            <strong>När används de?</strong> Skuggor, kartor, perspektivproblem, och uppgifter om "ett föremål inne i ett annat".
          </p>
          <div className="border-t border-slate-700 pt-3 space-y-2">
            <div className="bg-slate-700 rounded-lg p-3">
              <p className="font-bold text-slate-200 mb-1">Sidoförhållande k</p>
              <p className="text-slate-400">
                Om sidorna i stor triangel är <InlineMath math="k" /> gånger sidorna i liten triangel:
              </p>
              <ul className="text-slate-400 mt-1 space-y-1 list-disc list-inside">
                <li>Omkrets skalar med <InlineMath math="k" /></li>
                <li>Area skalar med <InlineMath math="k^2" /></li>
                <li>Volym (för 3D-kroppar) skalar med <InlineMath math="k^3" /></li>
              </ul>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 border border-slate-600">
              <p className="font-bold text-slate-200 mb-1">Exempel</p>
              <p className="text-slate-400">
                Två likformiga trianglar med sidor i förhållande 2 : 3. Lilla triangelns area är 12.
                Stora triangelns area: <InlineMath math="12 \times \left(\tfrac{3}{2}\right)^2 = 12 \times \tfrac{9}{4} = 27" />.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Circle theorems */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Cirkelsatser</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="font-bold text-slate-200 mb-1">Inskriberad vinkel</p>
            <p className="text-slate-400">
              En vinkel som är inskriberad i en cirkel (toppen på cirkeln, benen till en båge) är
              <strong className="text-slate-300"> halva</strong> mittelpunktsvinkeln mot samma båge.
            </p>
            <p className="text-slate-400 mt-1">
              Alla inskriberade vinklar mot <em>samma båge</em> är lika stora.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="font-bold text-slate-200 mb-1">Inskriberad vinkel mot diameter</p>
            <p className="text-slate-400">
              En vinkel inskriberad i en halvkrets (toppen på cirkeln, benen till diameterns ändpunkter) är alltid
              <strong className="text-slate-300"> 90°</strong> — Thales sats.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="font-bold text-slate-200 mb-1">Tangent</p>
            <p className="text-slate-400">
              En tangent till en cirkel är <strong className="text-slate-300">vinkelrät mot radien</strong> i tangentpunkten.
              Det ger en rät vinkel som ofta triggar Pythagoras.
            </p>
          </div>
          <div className="bg-slate-800 rounded-xl p-3">
            <p className="font-bold text-slate-200 mb-1">Två tangenter från en yttre punkt</p>
            <p className="text-slate-400">
              Två tangentsträckor dragna från samma yttre punkt till en cirkel är lika långa.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Coordinate geometry */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Koordinatgeometri</h3>
        <div className="bg-slate-800 rounded-xl divide-y divide-slate-700 text-sm">
          {([
            [
              'Lutning (slope)',
              'k = \\dfrac{y_2 - y_1}{x_2 - x_1}',
              'Förändring i y delat med förändring i x. Positiv = stiger åt höger.',
            ],
            [
              'Linjens ekvation',
              'y = kx + m',
              'k = lutning, m = skärning med y-axeln.',
            ],
            [
              'Avstånd mellan två punkter',
              'd = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}',
              'Pythagoras i koordinatform.',
            ],
            [
              'Mittpunkt',
              'M = \\left(\\dfrac{x_1+x_2}{2},\\, \\dfrac{y_1+y_2}{2}\\right)',
              'Medelvärdet av x-koordinaterna respektive y-koordinaterna.',
            ],
          ] as [string, string, string][]).map(([label, formula, note]) => (
            <div key={label} className="p-3 space-y-1">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 shrink-0">{label}</span>
                <span className="text-slate-200"><InlineMath math={formula} /></span>
              </div>
              <span className="text-xs text-slate-500">{note}</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-800 rounded-xl p-4 text-sm space-y-2 mt-3">
          <p className="font-bold text-slate-200">Exempel</p>
          <p className="text-slate-400">
            Punkterna <InlineMath math="A = (1, 2)" /> och <InlineMath math="B = (5, 8)" />.
          </p>
          <p className="text-slate-400">
            Lutning: <InlineMath math="k = \tfrac{8-2}{5-1} = \tfrac{6}{4} = \tfrac{3}{2}" />
          </p>
          <p className="text-slate-400">
            Avstånd: <InlineMath math="d = \sqrt{(5-1)^2 + (8-2)^2} = \sqrt{16+36} = \sqrt{52} \approx 7{,}2" />
          </p>
          <p className="text-slate-400">
            Mittpunkt: <InlineMath math="M = \left(\tfrac{1+5}{2}, \tfrac{2+8}{2}\right) = (3, 5)" />
          </p>
        </div>
      </div>

      {/* 6. Snabbtest */}
      <div>
        <h3 className="font-black text-blue-400 text-lg mb-3">Snabbtest — 5 frågor</h3>
        <p className="text-sm text-slate-400 mb-3">Testa dig själv. Klicka på en fråga för att visa svaret.</p>
        <div className="space-y-3">
          {snabbtest.map((item, i) => (
            <div key={i} className="bg-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => toggle(i)}
                className="w-full text-left p-4 text-sm text-slate-200 flex justify-between items-start gap-3"
              >
                <span><span className="font-bold text-blue-400 mr-2">{i + 1}.</span>{item.q}</span>
                <span className="text-slate-400 shrink-0">{revealed[i] ? '▲' : '▼'}</span>
              </button>
              {revealed[i] && (
                <div className="px-4 pb-4 text-sm text-emerald-400 border-t border-slate-700 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function NOGStrategySection() {
  const examples: {
    pattern: string
    patternDesc: string
    question: string
    s1: string
    s2: string
    r1: string
    r2: string
    rBoth: string | null
    answer: string
    why: string
  }[] = [
    {
      pattern: 'Direkt algebra',
      patternDesc: 'Påståendet ger en ekvation med en obekant — ett entydigt värde följer direkt.',
      question: 'Vad är värdet av x?',
      s1: '3x + 7 = 22',
      s2: '2x − 1 = 9',
      r1: '3x = 15  →  x = 5. Entydigt svar. Räcker.',
      r2: '2x = 10  →  x = 5. Entydigt svar. Räcker.',
      rBoth: null,
      answer: 'D',
      why: 'Båda påståendena ger var och en ett unikt värde på x.',
    },
    {
      pattern: 'Indirekt algebra',
      patternDesc: 'Frågan gäller ett uttryck (t.ex. x + y), inte variablerna var för sig. Fråga dig: "behöver jag veta x och y enskilt, eller räcker det att veta summan?"',
      question: 'Vad är värdet av x + y?',
      s1: '2x + 2y = 18',
      s2: 'x = 5 och y = 4',
      r1: '2(x + y) = 18  →  x + y = 9. Vi vet inte x eller y separat — men frågan gäller bara x + y. Räcker!',
      r2: 'x + y = 5 + 4 = 9. Räcker.',
      rBoth: null,
      answer: 'D',
      why: 'Påstående (1) ger värdet på uttrycket x + y direkt via enkel algebra, utan att avslöja x och y separat. Klassisk fälla — välj inte "räcker inte" bara för att du inte kan lösa ut variablerna var för sig.',
    },
    {
      pattern: 'Ordning med 3+ personer',
      patternDesc: 'Bygg upp en komplett rangordning steg för steg. Ett påstående placerar ofta bara en person relativt en annan.',
      question: 'Är Anna äldre än Bea?',
      s1: 'Anna är äldre än Carla.',
      s2: 'Bea är yngre än Carla.',
      r1: 'Anna > Carla. Inget sägs om Beas ålder i förhållande till Anna. Räcker inte.',
      r2: 'Carla > Bea. Inget sägs om Annas ålder i förhållande till Bea. Räcker inte.',
      rBoth: 'Tillsammans: Anna > Carla > Bea  →  Anna är äldre än Bea. Entydigt "Ja". Räcker!',
      answer: 'C',
      why: 'Båda påståendena behövs för att bygga hela ordningskedjan Anna > Carla > Bea.',
    },
    {
      pattern: 'Geometrisk tillräcklighet',
      patternDesc: 'En figur med n dimensioner behöver n oberoende villkor. En rektangel har två mått — ett samband räcker inte.',
      question: 'Vad är arean av rektangeln?',
      s1: 'Rektangelns omkrets är 20 cm.',
      s2: 'Diagonalens längd är 5√2 cm.',
      r1: '2(l + b) = 20  →  l + b = 10. Oändligt många (l, b)-par fungerar (1×9, 2×8, 3×7 …). Räcker inte.',
      r2: 'l² + b² = 50. Fortfarande oändligt många lösningar. Räcker inte.',
      rBoth: '(l+b)² = 100  →  l² + 2lb + b² = 100  →  50 + 2lb = 100  →  lb = 25. Area = lb = 25 cm². Räcker!',
      answer: 'C',
      why: 'Varje påstående ger ett samband med två obekanta. Tillsammans ger de exakt arean utan att lösa ut l och b separat.',
    },
    {
      pattern: '"Ja/Nej"-frågor',
      patternDesc: 'Svaret behöver vara entydigt — inte nödvändigtvis "Ja". Om svaret alltid är "Nej" är det lika entydigt och räcker.',
      question: 'Är n ett jämnt tal?',
      s1: '3n är ett jämnt tal.',
      s2: 'n² är ett jämnt tal.',
      r1: '3 är udda, så 3n jämnt ⟺ n jämnt. Svaret är alltid "Ja". Räcker.',
      r2: 'n² jämnt ⟺ n jämnt (udda × udda = udda). Svaret är alltid "Ja". Räcker.',
      rBoth: null,
      answer: 'D',
      why: 'Båda påståendena ger entydigt "Ja". Kom ihåg: det spelar ingen roll vilket svar det är, bara att det alltid är detsamma.',
    },
    {
      pattern: 'Mängdräkning',
      patternDesc: 'Inklusionsexklusionsprincipen: |A ∪ B| = |A| + |B| − |A ∩ B|. Du behöver tre av de fyra storheterna för att bestämma den fjärde.',
      question: 'Hur många elever gillar både matematik och idrott?',
      s1: '15 elever gillar matematik, 12 gillar idrott, och klassen har 25 elever.',
      s2: '5 elever gillar varken matematik eller idrott.',
      r1: 'Vi vet |M| = 15, |I| = 12, totalt = 25 — men utan antalet som gillar ingen av dem kan vi inte beräkna överlappet. Räcker inte.',
      r2: 'Bara 5 gillar varken. Utan |M| och |I| kan vi inte beräkna överlapp. Räcker inte.',
      rBoth: '|M ∪ I| = 25 − 5 = 20. Överlapp = 15 + 12 − 20 = 7 elever. Räcker!',
      answer: 'C',
      why: 'De två påståendena kompletterar varandra: (1) ger delmängdsstorlekarna och totalen, (2) ger antalet utanför unionen.',
    },
    {
      pattern: 'Procentuell förändring',
      patternDesc: 'Procent kräver ursprungsvärdet. Varken nytt pris eller förändring i kronor räcker ensamt.',
      question: 'Med hur många procent ökade priset?',
      s1: 'Det nya priset är 650 kr.',
      s2: 'Priset ökade med 130 kr.',
      r1: 'Nytt pris = 650. Utan ursprungspriset kan vi inte beräkna procentökning. Räcker inte.',
      r2: 'Ökning = 130 kr. Utan ursprungspriset kan vi inte beräkna procentökning. Räcker inte.',
      rBoth: 'Ursprungspris = 650 − 130 = 520. Ökning (%) = 130 / 520 × 100 = 25 %. Räcker!',
      answer: 'C',
      why: 'Klassisk procentfälla: varje påstående verkar knappt otillräckligt, men tillsammans ger de ursprungsvärdet som saknas.',
    },
    {
      pattern: 'Svaret E — bägge otillräckliga',
      patternDesc: 'Sällsynt men förekommer. Om du efter att ha kombinerat påståendena fortfarande har flera möjliga svar är svaret E.',
      question: 'Vad är värdet av x?',
      s1: 'x² = y²',
      s2: 'y = 3',
      r1: 'x² = y²  →  x = ±y. Utan y vet vi inget om x. Räcker inte.',
      r2: 'y = 3. Utan koppling till x vet vi inte x. Räcker inte.',
      rBoth: 'Tillsammans: x² = 9  →  x = 3 eller x = −3. Fortfarande två möjliga värden. Räcker inte.',
      answer: 'E',
      why: 'Kombinationen ger x² = 9 men inte tecknet på x. Ingen ytterligare information (t.ex. x > 0) finns — svaret är E.',
    },
  ]

  const answerColors: Record<string, string> = {
    A: 'text-blue-400',
    B: 'text-purple-400',
    C: 'text-amber-400',
    D: 'text-emerald-400',
    E: 'text-red-400',
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-300">
        8 genomarbetade NOG-uppgifter — ett mönster per uppgift. Lär dig känna igen situationen och välj rätt svar snabbt.
      </p>

      <div className="bg-slate-800 rounded-xl overflow-hidden text-sm">
        <div className="bg-slate-700 p-3 font-bold">Snabbreferens — svarsalternativ</div>
        <div className="divide-y divide-slate-700">
          {([
            ['A', 'Räcker (1) ensamt, men ej (2) ensamt'],
            ['B', 'Räcker (2) ensamt, men ej (1) ensamt'],
            ['C', 'Räcker (1) och (2) tillsammans, men ej var för sig'],
            ['D', 'Räcker (1) ensamt OCH (2) ensamt (var för sig)'],
            ['E', 'Räcker ej ens med (1) och (2) tillsammans'],
          ] as [string, string][]).map(([letter, desc]) => (
            <div key={letter} className="p-3 flex gap-3">
              <span className={`font-black w-5 shrink-0 ${answerColors[letter]}`}>{letter}</span>
              <span className="text-slate-300">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      {examples.map((ex, i) => (
        <div key={i} className="bg-slate-800 rounded-xl overflow-hidden text-sm">
          <div className="bg-slate-700/60 px-4 py-3 flex items-start gap-3">
            <span className="text-blue-400 font-black text-base shrink-0">#{i + 1}</span>
            <div>
              <span className="font-bold text-slate-200">{ex.pattern}</span>
              <p className="text-xs text-slate-400 mt-0.5">{ex.patternDesc}</p>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="bg-slate-700/40 rounded-lg p-3">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Fråga</p>
              <p className="text-slate-200 font-bold">{ex.question}</p>
            </div>

            <div className="space-y-2">
              <div className="bg-slate-700/40 rounded-lg p-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Påstående (1)</p>
                <p className="text-slate-300 italic mb-2">{ex.s1}</p>
                <p className="text-slate-400">→ {ex.r1}</p>
              </div>
              <div className="bg-slate-700/40 rounded-lg p-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Påstående (2)</p>
                <p className="text-slate-300 italic mb-2">{ex.s2}</p>
                <p className="text-slate-400">→ {ex.r2}</p>
              </div>
              {ex.rBoth && (
                <div className="bg-slate-700/40 rounded-lg p-3">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">Båda tillsammans</p>
                  <p className="text-slate-400">→ {ex.rBoth}</p>
                </div>
              )}
            </div>

            <div className="flex items-start gap-3 border-t border-slate-700 pt-3">
              <span className={`font-black text-2xl shrink-0 ${answerColors[ex.answer]}`}>{ex.answer}</span>
              <p className="text-slate-300 pt-1">{ex.why}</p>
            </div>
          </div>
        </div>
      ))}

      <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 text-sm">
        <div className="font-bold mb-2 text-blue-300">Generell strategi — 4 steg</div>
        <ol className="text-slate-300 space-y-1 list-decimal list-inside">
          <li>Identifiera exakt vad du behöver veta för att svara på frågan.</li>
          <li>Testa (1) ensamt — entydigt svar? Om ja: A eller D.</li>
          <li>Testa (2) ensamt — entydigt svar? Om ja: B eller D (om (1) räckte) annars B.</li>
          <li>Om inget räckte ensamt: testa (1) + (2) — entydigt? → C. Annars E.</li>
        </ol>
      </div>
    </div>
  )
}

export default function Theory() {
  const navigate = useNavigate()
  const [section, setSection] = useState<Section>('overview')

  const content: Record<Section, React.ReactNode> = {
    overview: <Overview />,
    XYZ: <XYZSection />,
    KVA: <KVASection />,
    NOG: <NOGSection />,
    DTK: <DTKSection />,
    formulas: <Formulas />,
    algebra: <AlgebraSection />,
    probability: <ProbabilitySection />,
    geometry: <GeometrySection />,
    'nog-strategy': <NOGStrategySection />,
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm">
          ← Tillbaka
        </button>

        <h1 className="text-3xl font-black mb-6">Teori & Tips</h1>

        <div className="flex gap-2 flex-wrap mb-8">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                section === s.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {content[section]}
      </div>
    </div>
  )
}
