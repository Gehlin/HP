import { useState } from 'react'
import PageHeader from '../components/PageHeader'

type Tab = 'intro' | 'prefix' | 'suffix' | 'strategi'

const TABS: { id: Tab; label: string }[] = [
  { id: 'intro',    label: 'Intro'    },
  { id: 'prefix',   label: 'Prefix'   },
  { id: 'suffix',   label: 'Suffix'   },
  { id: 'strategi', label: 'Strategi' },
]

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-black text-[var(--color-ink)] mb-3 mt-6 first:mt-0">{children}</h3>
}

function Callout({ title, children, color = 'rose' }: {
  title: string
  children: React.ReactNode
  color?: 'rose' | 'amber' | 'emerald' | 'blue'
}) {
  const styles = {
    rose:    'border-[var(--color-card-border)] bg-[var(--color-green-muted)] text-[var(--color-green)]',
    amber:   'border-[var(--color-card-border)] bg-[var(--color-gold-muted)] text-[var(--color-gold-deep)]',
    emerald: 'border-[var(--color-card-border)] bg-[var(--color-green-muted)] text-[var(--color-green-light)]',
    blue:    'border-[var(--color-card-border)] bg-[var(--color-paper-dark)] text-[var(--color-ink-muted)]',
  }
  return (
    <div className={`rounded-xl border p-4 mb-4 ${styles[color]}`}>
      <div className="text-[10px] font-black uppercase tracking-widest mb-1.5">{title}</div>
      <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">{children}</div>
    </div>
  )
}

interface PrefixEntry { prefix: string; meaning: string; examples: string }

function PrefixTable({ entries }: { entries: PrefixEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--color-card-border)]">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--color-card-border)]">
            <th className="text-left px-3 py-2 text-[var(--color-ink-faint)] font-bold uppercase tracking-widest">Prefix</th>
            <th className="text-left px-3 py-2 text-[var(--color-ink-faint)] font-bold uppercase tracking-widest">Betydelse</th>
            <th className="text-left px-3 py-2 text-[var(--color-ink-faint)] font-bold uppercase tracking-widest">Exempel</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e, i) => (
            <tr key={i} className="border-b border-[var(--color-card-border)] last:border-0">
              <td className="px-3 py-2 font-mono font-bold text-[var(--color-green)] whitespace-nowrap">{e.prefix}</td>
              <td className="px-3 py-2 text-[var(--color-ink-muted)]">{e.meaning}</td>
              <td className="px-3 py-2 text-[var(--color-ink-faint)]">{e.examples}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function IntroSection() {
  return (
    <div>
      <Callout title="Vad är ORD?" color="rose">
        ORD är Ordförståelse — HP:s verbala uppgiftstyp med 10 frågor på ca 10 minuter. Du får ett ord och väljer bland fyra alternativ vilket som bäst har samma innebörd. Orden är ofta latinska eller franska lånord, akademiska termer eller mer ovanliga svenska ord.
      </Callout>

      <SectionHeading>Exempelformat</SectionHeading>
      <div className="card rounded-xl p-4 mb-4">
        <div className="text-sm text-[var(--color-ink)] font-semibold mb-3">Vilket ord har närmast samma betydelse som PRAGMATISK?</div>
        <div className="space-y-1.5">
          {[
            { key: 'A', text: 'idealistisk', correct: false },
            { key: 'B', text: 'praktisk', correct: true },
            { key: 'C', text: 'teoretisk', correct: false },
            { key: 'D', text: 'kritisk', correct: false },
          ].map(opt => (
            <div
              key={opt.key}
              className={`flex gap-2 items-center text-sm px-3 py-1.5 rounded-lg ${
                opt.correct
                  ? 'bg-[var(--color-correct-bg)] border border-[var(--color-correct-border)] text-[var(--color-correct-text)] font-bold'
                  : 'text-[var(--color-ink-faint)]'
              }`}
            >
              <span className="font-black w-4 shrink-0">{opt.key}</span>
              <span>{opt.text}</span>
              {opt.correct && <span className="text-[10px] text-[var(--color-success)] ml-auto">← rätt svar</span>}
            </div>
          ))}
        </div>
      </div>

      <SectionHeading>Ordkategorier på HP</SectionHeading>
      <div className="space-y-2">
        {[
          { label: 'Latinska lånord', desc: 'ambulant, frekvent, koncis, konsekvent, abstrakt, implicit', color: 'text-[var(--color-green)]' },
          { label: 'Franska lånord', desc: 'renommé, naiv, precis, subtil, nuanserad', color: 'text-[var(--color-green-light)]' },
          { label: 'Akademiska termer', desc: 'pragmatisk, empirisk, stringent, paradoxal, tvetydig', color: 'text-[var(--color-ink-muted)]' },
          { label: 'Karaktärsbeskrivningar', desc: 'förtegen, enigmatisk, drastisk, ambivalent, intuitiv', color: 'text-[var(--color-gold-deep)]' },
        ].map((cat, i) => (
          <div key={i} className="card rounded-xl p-3 flex gap-3">
            <div className={`text-base shrink-0 mt-0.5 ${cat.color}`}>◆</div>
            <div>
              <div className={`text-xs font-black mb-0.5 ${cat.color}`}>{cat.label}</div>
              <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{cat.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PrefixSection() {
  const [sub, setSub] = useState<'latin' | 'greek' | 'swedish'>('latin')

  const LATIN: PrefixEntry[] = [
    { prefix: 'ab-',       meaning: 'bort från',        examples: 'abnorm, abstrakt, absurd'        },
    { prefix: 'bi-',       meaning: 'två',               examples: 'bilateral, bipolär'              },
    { prefix: 'com-/con-', meaning: 'tillsammans',       examples: 'koncis, konsekvent, komplex'     },
    { prefix: 'de-',       meaning: 'ner, bort',         examples: 'devalvera, defekt, degradera'    },
    { prefix: 'dis-',      meaning: 'isär, negation',    examples: 'diskret, disparat, diskrepans'   },
    { prefix: 'ex-',       meaning: 'ut ur',             examples: 'explicit, exklusiv, extrem'      },
    { prefix: 'im-/in-',   meaning: 'inte / i',          examples: 'implicit, impulsiv, inert'       },
    { prefix: 'inter-',    meaning: 'mellan',            examples: 'interaktion, integritet'         },
    { prefix: 'per-',      meaning: 'genom',             examples: 'persistent, perifer, perfektion' },
    { prefix: 'post-',     meaning: 'efter',             examples: 'postmodern, posterior'           },
    { prefix: 'pre-',      meaning: 'före',              examples: 'premiss, precis, preliminär'     },
    { prefix: 'pro-',      meaning: 'framåt, för',       examples: 'progressiv, proportionell'       },
    { prefix: 're-',       meaning: 'igen, tillbaka',    examples: 'relevant, restriktiv, reciprok'  },
    { prefix: 'sub-',      meaning: 'under',             examples: 'subtil, substans, subjektiv'     },
    { prefix: 'super-',    meaning: 'över',              examples: 'superficiell, surplus'           },
    { prefix: 'trans-',    meaning: 'över, genom',       examples: 'transparent, transformera'       },
  ]

  const GREEK: PrefixEntry[] = [
    { prefix: 'anti-',     meaning: 'mot',               examples: 'antipati, antites, antonym'      },
    { prefix: 'auto-',     meaning: 'själv',             examples: 'autonom, autentisk, automatisk'  },
    { prefix: 'bio-',      meaning: 'liv',               examples: 'biologi, biografi, biotop'       },
    { prefix: 'hyper-',    meaning: 'över, för mycket',  examples: 'hyperbol, hypersensitiv'         },
    { prefix: 'hypo-',     meaning: 'under, för lite',   examples: 'hypotes, hypotetisk'             },
    { prefix: 'micro-',    meaning: 'liten',             examples: 'mikrokosmos, mikroskopisk'       },
    { prefix: 'mono-',     meaning: 'en',                examples: 'monoton, monolit, monolog'       },
    { prefix: 'neo-',      meaning: 'ny',                examples: 'neoklassisk, neologism'          },
    { prefix: 'pan-',      meaning: 'alla',              examples: 'panorama, pandemi'               },
    { prefix: 'para-',     meaning: 'bredvid, bortom',   examples: 'paradox, parallell, parabol'     },
    { prefix: 'poly-',     meaning: 'många',             examples: 'polymorf, polyglot, polygon'     },
    { prefix: 'pseudo-',   meaning: 'falsk',             examples: 'pseudonym, pseudovetenskap'      },
    { prefix: 'syn-/sym-', meaning: 'tillsammans',       examples: 'symmetri, syntes, sympatisk'     },
    { prefix: 'tele-',     meaning: 'på avstånd',        examples: 'teleskop, telefon, telepatisk'   },
  ]

  const SWEDISH: PrefixEntry[] = [
    { prefix: 'o-',    meaning: 'negation',             examples: 'oärlig, orimlig, obetydlig'      },
    { prefix: 'miss-', meaning: 'fel, negativt',        examples: 'missuppfatta, misstro, misslyckas'},
    { prefix: 'mot-',  meaning: 'mot, emot',            examples: 'motverka, motstånd, motpart'     },
    { prefix: 'sam-',  meaning: 'tillsammans',          examples: 'samverka, samhälle, sammanhang'  },
    { prefix: 'över-', meaning: 'ovanpå, för mycket',   examples: 'överdriva, övertygad, överlägsen' },
    { prefix: 'under-',meaning: 'nedanför, för lite',   examples: 'undervärdera, underordnad'       },
    { prefix: 'för-',  meaning: 'föregående / intensiv',examples: 'förutse, förstärka, förklara'    },
    { prefix: 'åter-', meaning: 'igen, tillbaka',       examples: 'återge, återhämta, återspegla'   },
  ]

  const subtabs = [
    { id: 'latin' as const, label: 'Latinska' },
    { id: 'greek' as const, label: 'Grekiska' },
    { id: 'swedish' as const, label: 'Svenska' },
  ]

  return (
    <div>
      <Callout title="Varför prefix?" color="rose">
        Ungefär 60 % av HP-orden har latinskt eller grekiskt ursprung. Att känna till ett prefix kan ge dig den avgörande ledtråden — även om du aldrig sett ordet förut.
      </Callout>

      <div className="flex gap-1.5 mb-4">
        {subtabs.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
              sub === t.id
                ? 'bg-[var(--color-green-muted)] text-[var(--color-green)] border border-[var(--color-card-border)]'
                : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === 'latin'  && <PrefixTable entries={LATIN} />}
      {sub === 'greek'  && <PrefixTable entries={GREEK} />}
      {sub === 'swedish' && <PrefixTable entries={SWEDISH} />}

      <div className="mt-4 card rounded-xl p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-faint)] mb-2">Exempel: dela upp ordet</div>
        <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          <span className="text-[var(--color-green)] font-mono font-bold">im-</span>plicit =
          {' '}<span className="text-[var(--color-green)]">im-</span> (inte) + <span className="text-[var(--color-ink-muted)]">plicit</span> (lagt) → inte utlagt/sagt → underförstått
        </div>
        <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed mt-2">
          <span className="text-[var(--color-green)] font-mono font-bold">pseudo-</span>nym =
          {' '}<span className="text-[var(--color-green)]">pseudo-</span> (falsk) + <span className="text-[var(--color-ink-muted)]">nym</span> (namn) → falskt namn
        </div>
        <div className="text-sm text-[var(--color-ink-muted)] leading-relaxed mt-2">
          <span className="text-[var(--color-green)] font-mono font-bold">sub-</span>til =
          {' '}<span className="text-[var(--color-green)]">sub-</span> (under) + <span className="text-[var(--color-ink-muted)]">til</span> (tunt/fint) → fint underifrån → knappt märkbar
        </div>
      </div>
    </div>
  )
}

function SuffixSection() {
  const SUFFIXES = [
    { suffix: '-isk',        type: 'Adjektiv',       meaning: 'relaterad till',     examples: 'ironisk, dramatisk, logisk, empirisk'      },
    { suffix: '-het',        type: 'Substantiv',     meaning: 'abstrakt egenskap',  examples: 'frihet, ärlighet, svårighet, subtilhet'    },
    { suffix: '-ande/-ende', type: 'Adj. / Particip',meaning: 'pågående, egenskapsbeskrivning', examples: 'fascinerande, lysande, utmärkande' },
    { suffix: '-ning',       type: 'Substantiv',     meaning: 'process eller resultat', examples: 'utbildning, förbättring, förändring'   },
    { suffix: '-are',        type: 'Substantiv',     meaning: 'person / agent',     examples: 'förespråkare, betraktare, utövare'         },
    { suffix: '-lig',        type: 'Adjektiv',       meaning: 'av denna sort',      examples: 'rimlig, trolig, väsentlig, tillfällig'     },
    { suffix: '-lös',        type: 'Adjektiv',       meaning: 'utan',               examples: 'meningslös, konsekvenslös, ändlös'         },
    { suffix: '-full',       type: 'Adjektiv',       meaning: 'full av',            examples: 'kraftfull, meningsfull, hoppfull'          },
    { suffix: '-bar',        type: 'Adjektiv',       meaning: 'möjlig att',         examples: 'mätbar, hanterbar, godtagbar'              },
    { suffix: '-dom',        type: 'Substantiv',     meaning: 'tillstånd',          examples: 'fridom, visdom, ensamdom'                  },
    { suffix: '-mässig',     type: 'Adjektiv',       meaning: 'i enlighet med',     examples: 'schablonmässig, regelmässig'               },
  ]

  return (
    <div>
      <Callout title="Suffix avslöjar ordklassen" color="amber">
        Suffix kan visa om ett ord är adjektiv, substantiv eller verb — och ungefär vad det handlar om. Ser du att ett ord slutar på <strong>-het</strong> vet du att det är ett abstrakt substantiv (en egenskap).
      </Callout>

      <div className="overflow-x-auto rounded-xl border border-[var(--color-card-border)]">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--color-card-border)]">
              <th className="text-left px-3 py-2 text-[var(--color-ink-faint)] font-bold uppercase tracking-widest">Suffix</th>
              <th className="text-left px-3 py-2 text-[var(--color-ink-faint)] font-bold uppercase tracking-widest">Ordklass</th>
              <th className="text-left px-3 py-2 text-[var(--color-ink-faint)] font-bold uppercase tracking-widest">Exempel</th>
            </tr>
          </thead>
          <tbody>
            {SUFFIXES.map((e, i) => (
              <tr key={i} className="border-b border-[var(--color-card-border)] last:border-0">
                <td className="px-3 py-2 font-mono font-bold text-[var(--color-gold-deep)] whitespace-nowrap">{e.suffix}</td>
                <td className="px-3 py-2 text-[var(--color-ink-faint)] text-[10px] whitespace-nowrap">{e.type}</td>
                <td className="px-3 py-2 text-[var(--color-ink-faint)]">{e.examples}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 card rounded-xl p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-ink-faint)] mb-2">Praktisk tillämpning</div>
        <div className="space-y-2 text-sm text-[var(--color-ink-muted)]">
          <div>Du ser alternativet <span className="text-[var(--color-ink)] font-semibold">tystlåten</span>. Roten tyst + ändelsen -en (adj.) → som håller sig tyst.</div>
          <div>Du ser <span className="text-[var(--color-ink)] font-semibold">meningslös</span>. <span className="text-[var(--color-gold-deep)]">-lös</span> = utan → utan mening.</div>
          <div>Du ser <span className="text-[var(--color-ink)] font-semibold">trolig</span>. <span className="text-[var(--color-gold-deep)]">-lig</span> = av denna sort → av trotypes sort → sannolik.</div>
        </div>
      </div>
    </div>
  )
}

function StrategiSection() {
  const steps = [
    {
      title: 'Testa synonymen i en mening',
      body: 'Sätt in det okända ordet i en konkret mening: "Han var väldigt [ORDET]." Byt sedan ut mot varje alternativ och välj det som passar bäst i exakt samma mening.',
    },
    {
      title: 'Dela upp ordet i delar',
      body: 'Sök prefix och suffix: sub-til (under + tunt), im-plicit (inte + lagt i). Även en delledtråd kan eliminera fel alternativ och rikta dig mot rätt.',
    },
    {
      title: 'Eliminera antonymerna',
      body: 'Identifiera det alternativ som är raka motsatsen till det givna ordet och stryk det. HP sätter nästan alltid antonymen som ett lockbete.',
    },
    {
      title: 'Välj det mest preciserade alternativet',
      body: 'ORD söker exakt synonymi, inte association. Välj det alternativ som täcker samma kärnbetydelse — inte bara ett relaterat begrepp.',
    },
    {
      title: 'Känn igen ordets laddning',
      body: 'Om grundordet är positivt laddat (GENUIN) peka mot positiva synonymer. Om negativt (CYNISK) välj negativt alternativ. Laddning eliminerar ofta hälften av alternativen.',
    },
    {
      title: 'Gissa mitt i skalan',
      body: 'Tvingas du gissa: statistiskt sett är B och C vanligare rätta svar i ORD än A och D. Undvik att alltid gissa A om du är osäker.',
    },
  ]

  return (
    <div>
      <Callout title="Huvudstrategi" color="emerald">
        ORD-frågor avgörs av precision: du söker den synonym som bäst matchar ordets kärna — inte det alternativ som "låter likt" eller "är relaterat." Ett ord kan ha många associerade ord men bara en bästa synonym.
      </Callout>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="card rounded-xl p-4 flex gap-3">
            <div className="text-base font-black text-[var(--color-green)] shrink-0 w-5">{i + 1}</div>
            <div>
              <div className="text-sm font-bold text-[var(--color-ink)] mb-1">{step.title}</div>
              <div className="text-xs text-[var(--color-ink-faint)] leading-relaxed">{step.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-[var(--color-gold-muted)] border border-[var(--color-card-border)] rounded-xl p-4">
        <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-gold-deep)] mb-2">Vanlig fälla</div>
        <p className="text-sm text-[var(--color-ink-muted)] leading-relaxed">
          HP väljer ofta alternativ som är <em>relaterade</em> till rätt svar utan att vara synonymer. T.ex. för INTUITIV är "kreativ" ett lockbete — kreativitet och intuition hänger ihop men är inte samma sak. Fråga alltid: kan jag byta ut det givna ordet mot detta alternativ och få exakt samma mening?
        </p>
      </div>
    </div>
  )
}

export default function OrdGuide() {
  const [tab, setTab] = useState<Tab>('intro')

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-bottomnav">
      <PageHeader title="ORD – Ordförståelse" />
      <div className="max-w-2xl mx-auto px-4 pt-6">

        <div className="mb-1 text-[10px] font-bold text-[var(--color-green)] uppercase tracking-widest">Ordförståelse</div>
        <h1 className="text-3xl font-black mb-1">ORD-guide</h1>
        <p className="text-[var(--color-ink-muted)] text-sm mb-6">Prefix, suffix och strategier för att knäcka okända ord</p>

        <div className="flex gap-1 mb-6 bg-[var(--color-paper-dark)] rounded-xl p-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                tab === t.id
                  ? 'bg-[var(--color-green-muted)] text-[var(--color-green)] border border-[var(--color-card-border)]'
                  : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'intro'    && <IntroSection />}
        {tab === 'prefix'   && <PrefixSection />}
        {tab === 'suffix'   && <SuffixSection />}
        {tab === 'strategi' && <StrategiSection />}
      </div>
    </div>
  )
}
