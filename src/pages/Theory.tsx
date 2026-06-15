import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function StepReveal({ steps }: { steps: { label: string; content: string; result?: string }[] }) {
  const [revealed, setRevealed] = useState(0)
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className={`rounded-xl border transition-all ${i < revealed ? 'border-white/[0.08] bg-white/[0.03]' : 'border-white/[0.04] bg-white/[0.01]'} p-3.5`}>
          <div className="flex items-start gap-3">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${i < revealed ? 'bg-emerald-600 text-white' : 'bg-white/[0.07] text-slate-600'}`}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-400 mb-0.5">{step.label}</div>
              {i < revealed ? (
                <>
                  <div className="text-sm text-slate-300 leading-relaxed">{step.content}</div>
                  {step.result && <div className="mt-1.5 text-xs font-bold text-emerald-400">{step.result}</div>}
                </>
              ) : (
                <div className="text-xs text-slate-700">Klicka för att avslöja</div>
              )}
            </div>
            {i >= revealed && (
              <button onClick={() => setRevealed(i + 1)} className="shrink-0 text-[10px] text-blue-400 border border-blue-500/30 rounded-lg px-2 py-1 hover:bg-blue-500/10 transition-colors">Visa</button>
            )}
          </div>
        </div>
      ))}
      {revealed === steps.length && (
        <button onClick={() => setRevealed(0)} className="w-full text-[11px] text-slate-600 hover:text-slate-400 py-1.5 transition-colors">Återställ ↺</button>
      )}
    </div>
  )
}

type Tab = 'overview' | 'XYZ' | 'KVA' | 'NOG' | 'DTK' | 'verbal'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Översikt' },
  { id: 'XYZ',      label: 'XYZ' },
  { id: 'KVA',      label: 'KVA' },
  { id: 'NOG',      label: 'NOG' },
  { id: 'DTK',      label: 'DTK' },
  { id: 'verbal',   label: 'Verbal' },
]

const TYPE_COLOR: Record<string, string> = {
  XYZ: 'text-violet-400',
  KVA: 'text-blue-400',
  NOG: 'text-emerald-400',
  DTK: 'text-amber-400',
}


function MathGuideBanner({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button
      onClick={() => navigate('/matematik')}
      className="w-full text-left glass rounded-2xl p-4 border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/8 transition-colors mt-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">Matematikguide</div>
          <div className="text-sm font-bold text-white">Formler, teori & begrepp →</div>
          <div className="text-xs text-slate-500 mt-0.5">10 ämnesområden med övade exempel, formelblad och ordlista</div>
        </div>
        <span className="text-violet-400 text-xl shrink-0 ml-3">∑</span>
      </div>
    </button>
  )
}

function OrdGuideBanner({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button
      onClick={() => navigate('/ord-guide')}
      className="w-full text-left glass rounded-2xl p-4 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/8 transition-colors mt-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">Ordförståelse</div>
          <div className="text-sm font-bold text-white">ORD-guide →</div>
          <div className="text-xs text-slate-500 mt-0.5">Prefix, suffix och strategier för att knäcka okända ord</div>
        </div>
        <span className="text-rose-400 text-xl shrink-0 ml-3">Aa</span>
      </div>
    </button>
  )
}

function LiggandeStolenBanner({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <button
      onClick={() => navigate('/liggande-stolen')}
      className="w-full text-left glass rounded-2xl p-4 border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/8 transition-colors mt-3"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Räkna utan miniräknare</div>
          <div className="text-sm font-bold text-white">Liggande stolen →</div>
          <div className="text-xs text-slate-500 mt-0.5">Multiplikation, division, kvadratrötter och estimering för hand</div>
        </div>
        <span className="text-blue-400 text-xl shrink-0 ml-3">✎</span>
      </div>
    </button>
  )
}

function Overview({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm leading-relaxed">
        Det kvantitativa delprovet (DTK) består av 40 frågor i fyra avsnitt och har en provtid på 55 minuter.
        Ingen miniräknare är tillåten — men det behövs heller inte.
      </p>

      {/* Structure table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06] flex gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <span className="flex-1">Delprov</span>
          <span className="w-20 text-right">Frågor</span>
          <span className="w-16 text-right">Tid</span>
        </div>
        {[
          { id: 'XYZ', name: 'XYZ – Matematisk problemlösning', q: '12 (1–12)',  t: '~12 min' },
          { id: 'KVA', name: 'KVA – Kvantitativa jämförelser',  q: '10 (13–22)', t: '~10 min' },
          { id: 'NOG', name: 'NOG – Kvantitativa resonemang',   q: '6 (23–28)',  t: '~10 min' },
          { id: 'DTK', name: 'DTK – Diagram, tabeller & kartor', q: '12 (29–40)', t: '~23 min' },
        ].map(row => (
          <div key={row.id} className="px-4 py-3 flex gap-3 items-center border-t border-white/[0.04] text-sm">
            <span className={`font-black w-8 shrink-0 ${TYPE_COLOR[row.id]}`}>{row.id}</span>
            <span className="flex-1 text-slate-300 text-xs">{row.name.replace(/^[A-Z]+ – /, '')}</span>
            <span className="w-20 text-right text-xs text-slate-500">{row.q}</span>
            <span className="w-16 text-right text-xs text-slate-500">{row.t}</span>
          </div>
        ))}
      </div>

      {/* Key rules */}
      <div className="space-y-2">
        {[
          { title: 'Aldrig minuspoäng', body: 'Rätt svar ger 1 poäng. Fel eller tomt ger 0. Gissa alltid — det kostar ingenting.' },
          { title: 'Ingen miniräknare', body: 'Talen är konstruerade för att kunna räknas i huvudet. Träna på uppskattning, inte exakt kalkyl.' },
          { title: 'Tid är din fiende', body: 'XYZ/KVA ger ~60 s/fråga. Fastnar du efter 60 s? Gissa och gå vidare — en halvdan gissning + tid för nästa är bättre än ett perfekt svar och en tom.' },
          { title: 'Matematik är förbättringsbart', body: 'Verbal förmåga förbättras långsamt. Formler + mönsterigenkänning kan ge märkbar förbättring på 2–3 månader.' },
        ].map(item => (
          <div key={item.title} className="glass rounded-xl p-4">
            <div className="text-sm font-bold text-slate-200 mb-1">{item.title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
          </div>
        ))}
      </div>

      <MathGuideBanner navigate={navigate} />
      <LiggandeStolenBanner navigate={navigate} />
    </div>
  )
}

function XYZSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-5">
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${TYPE_COLOR.XYZ}`}>12 frågor · ~60 s/fråga · svar A–D</div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Matematisk problemlösning. Varje fråga har fyra svarsalternativ. Du väljer det som passar bäst.
        </p>
      </div>

      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Ämnesfördelning (ungefärlig)</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            ['Algebra & ekvationer', '~3 frågor'],
            ['Procent & ekonomi', '~2 frågor'],
            ['Sannolikhet', '~2 frågor'],
            ['Geometri', '~2 frågor'],
            ['Statistik', '~2 frågor'],
            ['Talteori & övrigt', '~1 fråga'],
          ].map(([ämne, antal]) => (
            <div key={ämne} className="glass rounded-xl px-3.5 py-2.5">
              <div className="text-xs font-semibold text-slate-300">{ämne}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{antal}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
        <div className="space-y-2">
          {[
            { n: '1', title: 'Rita alltid en figur vid geometriuppgifter', body: 'En korrekt figur avslöjar lösningsvägen. Räknar du utan figur vid geometri förlorar du troligen uppgiften.' },
            { n: '2', title: 'Prova svarsalternativen', body: 'Vid ekvationsproblem: stoppa in alternativ B eller C och se om det stämmer. Ofta snabbare än att lösa algebraiskt.' },
            { n: '3', title: 'Uppskatta för att eliminera', body: 'Räkna inte exakt om en grov uppskattning kan eliminera 2–3 alternativ. HP-tal är gjorda för att gå upp jämnt.' },
            { n: '4', title: '60-sekundersregeln', body: 'Fastnar du mer än 60 s? Gör din bästa gissning och gå vidare. Ingen minuspoäng.' },
          ].map(item => (
            <div key={item.n} className="glass rounded-xl p-4 flex gap-3">
              <span className="text-slate-700 font-black text-sm shrink-0 tabular-nums w-4">{item.n}</span>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MathGuideBanner navigate={navigate} />
      <LiggandeStolenBanner navigate={navigate} />
    </div>
  )
}

function KVASection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-5">
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${TYPE_COLOR.KVA}`}>10 frågor · ~60 s/fråga · svar alltid A–D</div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Jämför Kvantitet I (vänster) med Kvantitet II (höger). Svarsalternativen är alltid desamma.
        </p>
      </div>

      {/* Fixed answer scheme */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Svarsschema — alltid
        </div>
        {[
          ['A', 'Kvantitet I är större än Kvantitet II'],
          ['B', 'Kvantitet II är större än Kvantitet I'],
          ['C', 'Kvantiteterna är lika stora'],
          ['D', 'Informationen är otillräcklig för att avgöra'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.04] text-sm">
            <span className={`font-black w-5 shrink-0 ${TYPE_COLOR.KVA}`}>{key}</span>
            <span className="text-slate-400 text-xs">{label}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
        <div className="space-y-2">
          {[
            { title: 'Förenkla, räkna inte exakt', body: 'Subtrahera eller dividera båda kvantiteterna med samma positiva tal. Du behöver bara avgöra vilket som är störst — inte beräkna exakta värden.' },
            { title: 'Testa extremvärden', body: 'Om en variabel är fri — testa x = 0, x = 1, x = −1, x = stora positiva tal. Om resultatet skiftar: svaret är D.' },
            { title: 'D är vanligare än man tror', body: 'Hittar du ett fall där I > II och ett fall där II > I? Svaret är D. Välj inte D av rädsla, men räkna inte bort det tidigt.' },
            { title: 'Negativa tal och rötter', body: 'Var extra försiktig: x² = 4 → x = ±2. √x kräver x ≥ 0. Negativa tal beter sig annorlunda vid upphöjning till jämna potenser.' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-4 flex gap-3">
              <span className="text-slate-700 font-black text-sm shrink-0 tabular-nums w-4">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">Vanlig fälla</div>
        <p className="text-xs text-amber-200/80 leading-relaxed">
          Om x² = 4 kan x vara 2 <strong>eller</strong> −2. Testa alltid båda. Detsamma gäller alla jämnpotensuations — glöm inte den negativa roten.
        </p>
      </div>

      <MathGuideBanner navigate={navigate} />
    </div>
  )
}

function NOGSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-5">
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${TYPE_COLOR.NOG}`}>6 frågor · ~100 s/fråga · svar alltid A–E</div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Avgör om påstående (1) och/eller (2) ger <em>tillräcklig</em> information för att besvara frågan entydigt.
          Du behöver <strong className="text-white">inte</strong> lösa problemet — bara avgöra om det <em>går</em> att lösa.
        </p>
      </div>

      {/* Fixed answer scheme */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-white/[0.06] text-[10px] font-bold uppercase tracking-widest text-slate-600">
          Svarsschema — alltid
        </div>
        {[
          ['A', 'Påstående (1) räcker, inte (2)'],
          ['B', 'Påstående (2) räcker, inte (1)'],
          ['C', 'Båda påståenden behövs tillsammans'],
          ['D', 'Varje påstående räcker för sig'],
          ['E', 'Ej tillräcklig information ens med båda'],
        ].map(([key, label]) => (
          <div key={key} className="flex items-center gap-3 px-4 py-3 border-t border-white/[0.04] text-sm">
            <span className={`font-black w-5 shrink-0 ${TYPE_COLOR.NOG}`}>{key}</span>
            <span className="text-slate-400 text-xs">{label}</span>
          </div>
        ))}
      </div>

      {/* 3-step method */}
      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Metod — tre steg</div>
        <div className="space-y-1.5">
          {[
            ['Steg 1', 'Prova (1) ensamt. Ger det ett unikt svar på frågan?'],
            ['Steg 2', 'Prova (2) ensamt. Ger det ett unikt svar på frågan?'],
            ['Steg 3', 'Om inget räckte: prova (1) + (2) tillsammans. Räcker de nu?'],
          ].map(([step, desc]) => (
            <div key={step} className="glass rounded-xl px-4 py-3 flex gap-3 items-start text-sm">
              <span className={`font-black shrink-0 text-xs ${TYPE_COLOR.NOG}`}>{step}</span>
              <span className="text-slate-400 text-xs leading-relaxed">{desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
        <div className="space-y-2">
          {[
            { title: '"Entydigt" är nyckeln', body: 'Ett unikt svar på frågan — inte nödvändigtvis ett numeriskt svar. Om svaret alltid är "Nej" är det fortfarande entydigt!' },
            { title: 'Räkna inte om det inte behövs', body: 'Om du kan avgöra att (1) räcker utan att faktiskt lösa hela ekvationen — gör det. NOG belönar logik, inte kalkyl.' },
            { title: 'E är ovanligt', body: 'Välj E bara om du verkligen kan visa att (1) + (2) tillsammans fortfarande inte ger ett unikt svar. E väljs felaktigt oftare än A–D.' },
            { title: 'D kräver oberoende tillräcklighet', body: 'D väljs om (1) räcker OCH (2) räcker — var för sig. Om båda leder till samma unika svar → D.' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-4 flex gap-3">
              <span className="text-slate-700 font-black text-sm shrink-0 tabular-nums w-4">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive worked example */}
      <div className="glass rounded-2xl p-5 border border-emerald-500/10">
        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">Interaktivt exempel — följ 3-stegsmetoden</div>
        <div className="bg-white/[0.04] rounded-xl p-4 mb-4 text-sm">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Fråga</div>
          <p className="text-slate-200 mb-3">Är x² {'>'} 4?</p>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex gap-2"><span className="font-bold text-emerald-400 shrink-0">(1)</span> x {'>'} 2</div>
            <div className="flex gap-2"><span className="font-bold text-emerald-400 shrink-0">(2)</span> x {'<'} −3</div>
          </div>
        </div>
        <StepReveal steps={[
          { label: 'Steg 1 — Prova (1) ensamt: x > 2', content: 'Om x > 2, t.ex. x = 3: x² = 9 > 4 ✓. Gäller det för alla x > 2? Ja, alla tal > 2 i kvadrat ger > 4.', result: '→ (1) räcker ensamt.' },
          { label: 'Steg 2 — Prova (2) ensamt: x < −3', content: 'Om x < −3, t.ex. x = −4: x² = 16 > 4 ✓. Gäller det för alla x < −3? Ja, (−3)² = 9 > 4 och ännu mer för mer negativa tal.', result: '→ (2) räcker ensamt.' },
          { label: 'Slutsats — Svarsval', content: 'Båda påståendena räcker var för sig. (1) räcker OCH (2) räcker — oberoende av varandra.', result: '→ Svar: D' },
        ]} />
      </div>

      <MathGuideBanner navigate={navigate} />
    </div>
  )
}

function DTKSection({ navigate }: { navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="space-y-5">
      <div>
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${TYPE_COLOR.DTK}`}>12 frågor · ~115 s/fråga · svar A–E</div>
        <p className="text-slate-400 text-sm leading-relaxed">
          Läs av och räkna utifrån presenterat datamaterial — stapeldiagram, linjediagram, tabeller, kartfrågor
          och cirkeldiagram. DTK ger mest tid per fråga av alla avsnitt.
        </p>
      </div>

      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Vanliga datatyper</div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            ['Stapeldiagram', 'Stapelhöjder, skillnader, procent'],
            ['Linjediagram', 'Trender, max/min, förändring'],
            ['Tabeller', 'Summera, jämföra rader/kolumner'],
            ['Kartfrågor', 'Uppskatta avstånd med kartskala'],
            ['Cirkeldiagram', 'Sektorers andel av helhet'],
            ['Kombinerade', 'Flera diagram om samma dataset'],
          ].map(([t, d]) => (
            <div key={t} className="glass rounded-xl px-3.5 py-2.5">
              <div className="text-xs font-semibold text-slate-300">{t}</div>
              <div className="text-[10px] text-slate-600 mt-0.5">{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
        <div className="space-y-2">
          {[
            { title: 'Läs titel och enheter först', body: 'Titta alltid på rubriken, axlarnas etiketter och enheter innan frågorna. Missar du y-axelns enhet förlorar du uppgiften.' },
            { title: 'Uppskatta istället för att räkna exakt', body: 'Svarsalternativen i DTK är sällan tätt ihop. En god uppskattning ger ofta rätt svar på hälften av tiden.' },
            { title: 'Ta den tid DTK ger dig', body: 'Du har ~115 s/fråga — mer än dubbelt mot XYZ. Stressa inte. Läs ordentligt och kontrollräkna om tid finns.' },
            { title: 'Procentuell förändring', body: '(Nytt − Gammalt) / Gammalt × 100. Den vanligaste beräkningstypen i DTK. Känn igen mönstret direkt.' },
          ].map((item, i) => (
            <div key={i} className="glass rounded-xl p-4 flex gap-3">
              <span className="text-slate-700 font-black text-sm shrink-0 tabular-nums w-4">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-500/8 border border-blue-500/15 rounded-xl p-4">
        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">HP-insikt</div>
        <p className="text-xs text-blue-200/80 leading-relaxed">
          DTK-frågor letar efter om du kan läsa och beräkna från data — inte om du kan avancerad matematik.
          De flesta fel beror på att man läser diagrammet fel, inte att man räknar fel.
        </p>
      </div>

      {/* Interactive worked example */}
      <div className="glass rounded-2xl p-5 border border-amber-500/10">
        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-3">Interaktivt exempel — läs diagrammet rätt</div>
        <div className="bg-white/[0.04] rounded-xl p-4 mb-4">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Diagram — Försäljning (tusental enheter)</div>
          <div className="flex items-end gap-2 h-20 mb-1">
            {[{ y: 2020, v: 100 }, { y: 2021, v: 145 }, { y: 2022, v: 90 }, { y: 2023, v: 120 }].map(bar => (
              <div key={bar.y} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-amber-500/60 rounded-t" style={{ height: `${(bar.v / 145) * 72}px` }} />
                <div className="text-[9px] text-slate-600">{bar.y}</div>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-slate-600 mt-1">Y-axel: Sålda enheter (tusental). Varje enhet = 1 000 st.</div>
        </div>
        <StepReveal steps={[
          { label: 'Fråga 1 — Vilket år var försäljningen lägst?', content: 'Titta på staplarnas höjd: 2020 (100), 2021 (145), 2022 (90), 2023 (120). Lägst stapel = 2022 med 90 000 enheter.', result: '→ Svar: 2022' },
          { label: 'Fråga 2 — Med hur många procent ökade försäljningen 2020–2021?', content: 'Formel: (Nytt − Gammalt) / Gammalt × 100. (145 − 100) / 100 × 100 = 45 / 100 × 100 = 45%.', result: '→ Svar: 45%' },
          { label: 'Fråga 3 — Hur stor var förändringen 2021–2022 i procentenheter?', content: '(90 − 145) / 145 × 100 ≈ −55 / 145 × 100 ≈ −38%. Försäljningen minskade med ca 38%.', result: '→ Svar: ≈ −38%' },
        ]} />
      </div>

      <MathGuideBanner navigate={navigate} />
    </div>
  )
}

type VerbalSub = 'ord' | 'las' | 'mek' | 'elf'

function VerbalSection() {
  const navigate = useNavigate()
  const [sub, setSub] = useState<VerbalSub>('ord')

  const SUB_TABS: { id: VerbalSub; label: string; color: string }[] = [
    { id: 'ord', label: 'ORD',  color: 'text-rose-400' },
    { id: 'las', label: 'LÄS',  color: 'text-sky-400'  },
    { id: 'mek', label: 'MEK',  color: 'text-lime-400' },
    { id: 'elf', label: 'ELF',  color: 'text-amber-400'},
  ]

  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1 text-rose-400">Verbalt delprov — 40 frågor · 55 minuter</div>
        <p className="text-slate-400 text-sm leading-relaxed">
          HP:s verbala delprov testar ordförståelse, läsförståelse, meningskomplettering och engelsk läsförståelse. Välj ett avsnitt nedan.
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1.5 border-b border-white/[0.06] pb-3">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              sub === t.id ? `bg-white/[0.08] ${t.color}` : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'ord' && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1">ORD — Ordförståelse · 10 frågor · ~60 s/fråga</div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ett ord eller uttryck ges — du väljer det alternativ som bäst har samma innebörd. Testet mäter om du kan förstå ords nyanser och synonymer.
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Exempelformat</div>
            <div className="text-sm text-slate-200 mb-3 font-medium">SUBTIL betyder ungefär detsamma som:</div>
            <div className="space-y-1.5 text-sm">
              {['A — Tydlig', 'B — Fin', 'C — Varsam', 'D — Knappt märkbar', 'E — Komplicerad'].map((opt, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg ${i === 3 ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-500'}`}>{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
            <div className="space-y-2">
              {[
                { title: 'Eliminera tydliga fel', body: 'Ta bort de alternativ du är säker på är fel. Bland kvarvaranden väljer du det bäst synonyma.' },
                { title: 'Sätt in i en mening', body: 'Testa: "Det var ett subtilt leende." → Passar "knappt märkbar" bäst? Ja → D.' },
                { title: 'Ordets ursprung hjälper', body: '"Sub-" = under, lite. "-til" = fint/tunt. Latin-/grekiska-prefix ger ofta ledtrådar till grundbetydelsen.' },
                { title: 'Svåra ord — gissa på B eller C', body: 'Statistiskt sett är mitten-alternativen (B–D) vanligare rätta svar i ORD än extremerna (A, E).' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-xl p-4 flex gap-3">
                  <span className="text-slate-700 font-black text-sm shrink-0 w-4">{i + 1}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-rose-500/8 border border-rose-500/15 rounded-xl p-4">
            <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1.5">Vanliga kategorier</div>
            <div className="grid grid-cols-2 gap-1.5">
              {['Akademiska termer', 'Abstrakta begrepp', 'Litterärt/ålderdomligt språk', 'Fackspråk (juridik, medicin)', 'Idiom & fraser', 'Latinska ord'].map(cat => (
                <div key={cat} className="text-xs text-slate-400 bg-white/[0.04] rounded-lg px-3 py-2">{cat}</div>
              ))}
            </div>
          </div>
          <OrdGuideBanner navigate={navigate} />
        </div>
      )}

      {sub === 'las' && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">LÄS — Läsförståelse · 10 frågor · ~115 s/fråga</div>
            <p className="text-slate-400 text-sm leading-relaxed">
              En längre text (200–500 ord) följs av 5 frågor om textens innehåll, slutsatser och ords innebörd i sammanhang.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
            <div className="space-y-2">
              {[
                { title: 'Läs frågorna först', body: 'Vet du vad du letar efter innan du läser texten. Det sparar tid och fokuserar din läsning på det som testas.' },
                { title: 'Hitta textbevis', body: 'Rätt svar är alltid förankrat i texten. Om du inte hittar ett direkt citat eller stöd — välj bort alternativet.' },
                { title: 'Akta "för stark" formulering', body: '"Alltid", "aldrig", "alla", "ingen" — extrema ord är ofta fel. Texten säger sällan absoluta saker.' },
                { title: 'Gör inte egna slutledningar', body: 'LÄS testar vad texten säger, inte vad du tror/vet om ämnet. Din allmänbildning kan lura dig.' },
                { title: 'Meningsförståelse i kontext', body: 'Om du ska förklara ett ords innebörd: läs hela meningen och stycket runt det — inte bara ordet isolerat.' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-xl p-4 flex gap-3">
                  <span className="text-slate-700 font-black text-sm shrink-0 w-4">{i + 1}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-sky-500/8 border border-sky-500/15 rounded-xl p-4">
            <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1.5">HP-insikt</div>
            <p className="text-xs text-sky-200/80 leading-relaxed">
              LÄS är den sektion där läsordning spelar störst roll. Om texten är lång och tät — läs de 5 frågorna på 30 sekunder, markera nyckelord, läs sedan texten. Kom tillbaka till frågorna och hitta textbevis.
            </p>
          </div>
        </div>
      )}

      {sub === 'mek' && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold text-lime-400 uppercase tracking-widest mb-1">MEK — Meningskomplettering · 10 frågor · ~60 s/fråga</div>
            <p className="text-slate-400 text-sm leading-relaxed">
              En mening med ett eller två luckor ges. Du väljer det ord eller den fras som bäst kompletterar meningen semantiskt och grammatiskt.
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Exempelformat</div>
            <div className="text-sm text-slate-200 mb-3">
              "Trots sina uppenbara <span className="underline underline-offset-2">___</span> lyckades projektet nå ett <span className="underline underline-offset-2">___</span> resultat."
            </div>
            <div className="space-y-1.5 text-sm">
              {[
                'A — framgångar … misslyckat',
                'B — brister … godtagbart',
                'C — resurser … dyrt',
                'D — förseningar … snabbt',
              ].map((opt, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-lg ${i === 1 ? 'bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-500'}`}>{opt}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
            <div className="space-y-2">
              {[
                { title: 'Identifiera sambandsordet', body: '"Trots" signalerar kontrast. Det kräver att luckorna bildar en kontrastsituation — problem + positivt utfall.' },
                { title: 'Koppla luckor till varandra (2-lucksfrågor)', body: 'Orden i de två luckorna måste hänga ihop logiskt och grammatiskt. En lucka som stämmer semantiskt men inte med den andra → fel.' },
                { title: 'Läs hela meningen högt (mentalt)', body: 'Klistra in alternativet och hör om det låter naturligt. Grammatik och flöde avslöjar fel svar.' },
                { title: 'Signalord: orsak, kontrast, tillägg', body: '"Därför/eftersom" = orsak. "Trots/men/dock" = kontrast. "Dessutom/och" = tillägg. Identifiera vilket och matcha luckorna.' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-xl p-4 flex gap-3">
                  <span className="text-slate-700 font-black text-sm shrink-0 w-4">{i + 1}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sub === 'elf' && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">ELF — Engelsk läsförståelse · 10 frågor · ~115 s/fråga</div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Identisk struktur som LÄS, men texten är på engelska. Frågorna och svarsalternativen är på svenska. Testas din förmåga att förstå akademisk engelska.
            </p>
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">Strategi</div>
            <div className="space-y-2">
              {[
                { title: 'Samma metod som LÄS', body: 'Läs frågorna (på svenska) först. Hitta textbevis i den engelska texten. Frågorna är alltid på svenska — lättare att orientera sig.' },
                { title: 'Akademisk engelska — känn igen mönstren', body: '"However" = kontrast/men. "Therefore/thus" = slutsats. "Although/despite" = kontrast. "Furthermore" = tillägg. Dessa ord guidar textens logik.' },
                { title: 'Parafrasera — inte citera', body: 'Rätt svar omformulerar textens innehåll. Alternativ som citerar texten ordagrant är ibland fel — de kan sakna rätt kontext.' },
                { title: 'Falskt bekanta ord', body: '"Eventually" = till slut (inte "eventuellt"). "Actual" = verklig (inte "aktuell"). "Sensible" = förnuftig (inte "sensibel"). Känn igen false friends.' },
              ].map((item, i) => (
                <div key={i} className="glass rounded-xl p-4 flex gap-3">
                  <span className="text-slate-700 font-black text-sm shrink-0 w-4">{i + 1}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-200 mb-0.5">{item.title}</div>
                    <div className="text-xs text-slate-500 leading-relaxed">{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1.5">False friends — vanliga misstag</div>
            <div className="space-y-1.5">
              {[
                ['Eventually', 'Till slut', 'Eventuellt (wrong!)'],
                ['Actual / Actually', 'Verklig / Faktiskt', 'Aktuell (wrong!)'],
                ['Sensible', 'Förnuftig', 'Sensibel (wrong!)'],
                ['Sympathetic', 'Förstående/medkännande', 'Sympatisk (wrong!)'],
              ].map(([eng, right, wrong]) => (
                <div key={eng} className="grid grid-cols-3 gap-2 text-xs">
                  <span className="font-bold text-amber-300">{eng}</span>
                  <span className="text-emerald-400">✓ {right}</span>
                  <span className="text-red-400">✗ {wrong}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Theory() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <div className="min-h-screen bg-app text-white">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] font-bold tracking-[0.1em] uppercase px-3 py-1.5 rounded-full mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Provguide
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">HP Kvantitativt</h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Struktur, svarsscheman och strategi för alla fyra avsnitt. Matematik och formler hittar du i <button onClick={() => navigate('/matematik')} className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors">Matematikguiden</button>.
          </p>
        </div>
      </div>

      {/* ── Top tabs ────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#080C14]/95 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-2xl mx-auto px-4 flex gap-0 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors relative whitespace-nowrap px-2 ${tab === t.id ? (t.id === 'overview' ? 'text-white' : TYPE_COLOR[t.id]) : 'text-slate-600 hover:text-slate-400'}`}
            >
              {t.label}
              {tab === t.id && (
                <span className={`absolute bottom-0 inset-x-2 h-[2px] rounded-full ${
                  t.id === 'overview' ? 'bg-blue-400' :
                  t.id === 'XYZ' ? 'bg-violet-400' :
                  t.id === 'KVA' ? 'bg-blue-400' :
                  t.id === 'NOG' ? 'bg-emerald-400' :
                  t.id === 'DTK' ? 'bg-amber-400' : 'bg-rose-400'
                }`} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {tab === 'overview' && <Overview navigate={navigate} />}
        {tab === 'XYZ'      && <XYZSection navigate={navigate} />}
        {tab === 'KVA'      && <KVASection navigate={navigate} />}
        {tab === 'NOG'      && <NOGSection navigate={navigate} />}
        {tab === 'DTK'      && <DTKSection navigate={navigate} />}
        {tab === 'verbal'   && <VerbalSection />}
      </div>

    </div>
  )
}
