import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadStats, getLevel, type GameStats } from '../utils/gamification'
import { loadHistory, loadSession, saveSession } from '../utils/session'
import { getDueQuestions } from '../utils/srs'
import { getExamDate, setExamDate, clearExamDate, daysUntilExam, urgencyLabel, dailyTarget, KNOWN_HP_DATES } from '../utils/examDate'
import { computeReadiness } from '../utils/readiness'
import { isDailyChallengeCompleted, CHALLENGE_SIZE } from '../utils/dailyChallenge'
import { getFocusPreference, type FocusPreference } from '../utils/focusPreference'
import type { ExamSession, QuestionType } from '../types'

const TYPE_ACCENTS: Record<string, { color: string; ring: string; bg: string }> = {
  XYZ: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  KVA: { color: '#2563EB', ring: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  NOG: { color: '#224A3A', ring: '#224A3A', bg: 'rgba(34,74,58,0.08)' },
  DTK: { color: '#D97706', ring: '#D97706', bg: 'rgba(217,119,6,0.08)' },
  ORD: { color: '#DC2626', ring: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
  LAS: { color: '#DB2777', ring: '#DB2777', bg: 'rgba(219,39,119,0.08)' },
  MEK: { color: '#9333EA', ring: '#9333EA', bg: 'rgba(147,51,234,0.08)' },
  ELF: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
}

const TYPE_INFO: Record<string, {
  desc: string
  questions: number
  timePerQ: string
  totalTime: string
  topics: string[]
  answerScheme?: { key: string; label: string }[]
  tips: string[]
  guideRoute?: string
  guideLabel?: string
}> = {
  XYZ: {
    desc: 'Matematisk problemlösning',
    questions: 12,
    timePerQ: '~60s',
    totalTime: '~12 min',
    topics: ['Algebra & ekvationer', 'Procent & ekonomi', 'Sannolikhet & kombinatorik', 'Geometri', 'Statistik', 'Funktioner & koordinater'],
    tips: [
      'Rita alltid en figur vid geometriuppgifter',
      'Fastnar du efter 60s? Gissa och gå vidare — ingen minuspoäng',
      'Prova svarsalternativen baklänges vid ekvationer',
    ],
  },
  KVA: {
    desc: 'Kvantitativa jämförelser',
    questions: 10,
    timePerQ: '~60s',
    totalTime: '~10 min',
    topics: ['Algebra & olikheter', 'Potenser & rötter', 'Aritmetik & talteori', 'Geometri', 'Bråk & procent'],
    answerScheme: [
      { key: 'A', label: 'Kvantitet I är större' },
      { key: 'B', label: 'Kvantitet II är större' },
      { key: 'C', label: 'Kvantiteterna är lika' },
      { key: 'D', label: 'Kan inte avgöras' },
    ],
    tips: [
      'Uppskatta istället för att räkna exakt — exakt svar krävs sällan',
      'Testa extremvärden: vad händer om x = 0, x = 1 eller x = −1?',
      'Välj D ("kan ej avgöras") om du hittar ett motexempel',
    ],
  },
  NOG: {
    desc: 'Kvantitativa resonemang',
    questions: 6,
    timePerQ: '~100s',
    totalTime: '~10 min',
    topics: ['Algebra & system', 'Geometri', 'Sannolikhet & logik', 'Aritmetik'],
    answerScheme: [
      { key: 'A', label: 'Påstående (1) räcker, inte (2)' },
      { key: 'B', label: 'Påstående (2) räcker, inte (1)' },
      { key: 'C', label: 'Båda påståenden behövs tillsammans' },
      { key: 'D', label: 'Vardera av (1) och (2) räcker var för sig' },
      { key: 'E', label: 'Varken (1) och (2) tillsammans räcker' },
    ],
    tips: [
      'Du behöver INTE lösa uppgiften — bara avgöra om det GÅR att lösa den entydigt',
      'Testa varje påstående separat först — det avgör om svaret är A, B, C eller D',
      'E väljs om uppgiften inte kan lösas ens med båda påståendena kombinerade',
    ],
  },
  DTK: {
    desc: 'Diagram, tabeller & kartor',
    questions: 12,
    timePerQ: '~115s',
    totalTime: '~23 min',
    topics: ['Avläsning av grafer', 'Tabellanalys', 'Procentuell förändring', 'Jämförelser & trender', 'Kartor & skalor'],
    tips: [
      'Läs alltid axlarnas enheter och rubriken — de är nyckeln',
      'Besvara exakt vad som frågas, inte vad du tror frågas',
      'DTK ger mest tid per fråga (~115s) — ta dig tid att läsa ordentligt',
    ],
  },
  ORD: {
    desc: 'Ordförståelse',
    questions: 10,
    timePerQ: '~45s',
    totalTime: '~7 min',
    topics: ['Latinska & grekiska rötter', 'Prefix & suffix', 'Synonymer i kontext', 'Akademiskt ordförråd'],
    tips: [
      'Bryt ner okända ord i prefix + rot + suffix — etymologi hjälper mer än gissning',
      'Testa varje alternativ i originalmeningen — synonymen ska passa grammatiskt',
      'ORD är delprovets snabbaste sektion — fart är viktigare än perfektionism',
    ],
    guideRoute: '/ord-guide',
    guideLabel: 'ORD-guide',
  },
  LAS: {
    desc: 'Läsförståelse',
    questions: 16,
    timePerQ: '~120s',
    totalTime: '~26 min',
    topics: ['Huvudpoäng & struktur', 'Detaljfrågor', 'Inferens & slutledning', 'Författarens syfte', 'Texttyper'],
    tips: [
      'Skanna rubriker och första meningen i varje stycke — bygg en mental karta innan du läser frågorna',
      'Svaret finns alltid i texten — filtrera bort "sunda förnuftssvar" som inte stöds av texten',
      'LÄS är tidsmässigt tyngst (~26 min) — hoppa inte direkt till frågorna utan att ha kontext',
    ],
    guideRoute: '/las-guide',
    guideLabel: 'LÄS-guide',
  },
  MEK: {
    desc: 'Meningskomplettering',
    questions: 10,
    timePerQ: '~50s',
    totalTime: '~8 min',
    topics: ['Konjunktioner & signalord', 'Kausal logik', 'Kontrast & koncession', 'Additiva samband', 'Grammatisk kongruens'],
    tips: [
      'Identifiera signalordet (trots/dock/eftersom/dels) — det avslöjar relationen',
      'Eliminera alternativ som ger fel logisk riktning, välj sedan det semantiskt starkaste',
      'Ordparets interna logik är viktigare än varje ord för sig',
    ],
    guideRoute: '/mek-guide',
    guideLabel: 'MEK-guide',
  },
  ELF: {
    desc: 'Engelsk läsförståelse',
    questions: 16,
    timePerQ: '~120s',
    totalTime: '~26 min',
    topics: ['Main idea & argument', 'Detail retrieval', 'Vocabulary in context', 'Passage structure', 'Inference'],
    tips: [
      'Read the question first, then locate the relevant paragraph — avoid re-reading the whole passage',
      '"According to the passage" questions have a direct textual answer — don\'t infer',
      'For structure questions, map what each paragraph does before answering',
    ],
    guideRoute: '/elf-guide',
    guideLabel: 'ELF-guide',
  },
}

const RING_R = 28
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_R

export default function Home() {
  const navigate = useNavigate()
  const total = questions.length
  const byType = {
    XYZ: questions.filter(q => q.type === 'XYZ').length,
    KVA: questions.filter(q => q.type === 'KVA').length,
    NOG: questions.filter(q => q.type === 'NOG').length,
    DTK: questions.filter(q => q.type === 'DTK').length,
    ORD: questions.filter(q => q.type === 'ORD').length,
    LAS: questions.filter(q => q.type === 'LAS').length,
    MEK: questions.filter(q => q.type === 'MEK').length,
    ELF: questions.filter(q => q.type === 'ELF').length,
  }

  const [stats, setStats] = useState<GameStats | null>(null)
  const [todayCount, setTodayCount] = useState(0)
  const [resumeSession, setResumeSession] = useState<ExamSession | null>(null)
  const [examDate, setExamDateState] = useState<Date | null>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [readiness, setReadiness] = useState<ReturnType<typeof computeReadiness> | null>(null)
  const [dynamicTarget, setDynamicTarget] = useState(15)
  const [dailyDone, setDailyDone] = useState(false)
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [focusPreference, setFocusPrefState] = useState<FocusPreference | null>(null)
  const [recommendation, setRecommendation] = useState<{
    title: string; desc: string; to: string; btnLabel: string
    accent: string; borderAccent: string; bgAccent: string
  } | null>(null)
  const [weakTags, setWeakTags] = useState<{ tag: string; pct: number }[]>([])

  useEffect(() => {
    setStats(loadStats())
    setFocusPrefState(getFocusPreference())

    const today = new Date().toISOString().slice(0, 10)
    const count = loadHistory()
      .filter(s => new Date(s.startTime).toISOString().slice(0, 10) === today)
      .reduce((sum, s) => sum + Object.keys(s.answers).length, 0)
    setTodayCount(count)

    const s = loadSession()
    if (s && !s.endTime) setResumeSession(s)

    const ed = getExamDate()
    setExamDateState(ed)

    const r = computeReadiness()
    setReadiness(r)
    setDailyDone(isDailyChallengeCompleted())

    const dueIds = getDueQuestions(questions.map(q => q.id))
    setDueCount(dueIds.length)
    const history = loadHistory()
    const attempted = new Set<string>()
    history.forEach(sess => Object.keys(sess.answers).forEach(id => attempted.add(id)))
    const unseen = questions.filter(q => !attempted.has(q.id)).length
    const days = daysUntilExam()
    setDynamicTarget(days !== null && days > 0 ? dailyTarget(days, dueIds.length, unseen) : 15)

    // Smart recommendation
    const typeAcc: Record<QuestionType, { correct: number; total: number }> = {
      XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
      NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
      ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
      MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
    }
    history.slice(0, 15).forEach(s => {
      s.questionIds.forEach(qid => {
        const q = questions.find(x => x.id === qid)
        if (!q || !s.answers[qid]) return
        typeAcc[q.type].total++
        if (s.answers[qid] === q.answer) typeAcc[q.type].correct++
      })
    })
    const weakType = (Object.entries(typeAcc) as [QuestionType, { correct: number; total: number }][])
      .filter(([, v]) => v.total >= 5)
      .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))[0]
    const weakPct = weakType ? Math.round((weakType[1].correct / weakType[1].total) * 100) : null

    // Weak tag detection
    const tagAcc: Record<string, { correct: number; total: number }> = {}
    history.forEach(s => {
      s.questionIds.forEach(qid => {
        const q = questions.find(x => x.id === qid)
        if (!q || !s.answers[qid]) return
        for (const tag of q.tags) {
          if (!tagAcc[tag]) tagAcc[tag] = { correct: 0, total: 0 }
          tagAcc[tag].total++
          if (s.answers[qid] === q.answer) tagAcc[tag].correct++
        }
      })
    })
    const weakTagsList = Object.entries(tagAcc)
      .filter(([, v]) => v.total >= 3)
      .map(([tag, v]) => ({ tag, pct: Math.round((v.correct / v.total) * 100) }))
      .filter(t => t.pct < 70)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3)
    setWeakTags(weakTagsList)

    if (dueIds.length >= 5) {
      setRecommendation({ title: `${dueIds.length} repetitioner väntar`, desc: 'Spaced repetition — frågor du bör se idag för att inte glömma', to: '/practice?srs=1', btnLabel: 'Repetera nu →', accent: 'text-amber-300', borderAccent: 'border-amber-500/20', bgAccent: 'bg-amber-500/8' })
    } else if (weakType && weakPct !== null && weakPct < 60) {
      setRecommendation({ title: `Öva upp din ${weakType[0]}`, desc: `Din svagaste del just nu · ${weakPct}% träffsäkerhet i senaste sessionerna`, to: `/practice?type=${weakType[0]}`, btnLabel: `Öva ${weakType[0]} →`, accent: 'text-blue-300', borderAccent: 'border-blue-500/20', bgAccent: 'bg-blue-500/8' })
    } else if (days !== null && days <= 7) {
      setRecommendation({ title: 'Intensivvecka', desc: `${days} dagar kvar — simulera ett fullt HP-prov för att mäta ditt resultat`, to: '/exam-select', btnLabel: 'Simulera prov →', accent: 'text-red-300', borderAccent: 'border-red-500/20', bgAccent: 'bg-red-500/8' })
    } else if (unseen > 50) {
      setRecommendation({ title: 'Utforska nya frågor', desc: `${unseen} frågor du inte sett ännu — bredda din täckning`, to: '/practice', btnLabel: 'Starta träning →', accent: 'text-emerald-300', borderAccent: 'border-emerald-500/20', bgAccent: 'bg-emerald-500/8' })
    }
  }, [])

  const days = examDate ? daysUntilExam() : null
  const urgency = days !== null ? urgencyLabel(days) : null

  const goalReached = todayCount >= dynamicTarget
  const ringProgress = Math.min(1, todayCount / dynamicTarget)
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress)
  const hasActivity = stats && stats.xp > 0

  const handleSetExamDate = (isoDate: string) => {
    setExamDate(isoDate)
    setExamDateState(new Date(isoDate))
    setShowDatePicker(false)
    setCustomDate('')
    const days = daysUntilExam()
    const dueIds = getDueQuestions(questions.map(q => q.id))
    const history = loadHistory()
    const attempted = new Set<string>()
    history.forEach(sess => Object.keys(sess.answers).forEach(id => attempted.add(id)))
    const unseen = questions.filter(q => !attempted.has(q.id)).length
    setDynamicTarget(days !== null && days > 0 ? dailyTarget(days, dueIds.length, unseen) : 15)
  }

  return (
    <div className="min-h-screen bg-hero text-white">
      <div className="max-w-2xl mx-auto px-4 pt-10 pb-28">

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="text-center mb-10 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold tracking-[0.12em] uppercase px-3.5 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Högskoleprov · Kvantitativ &amp; Verbal
          </div>
          <h1 className="text-5xl sm:text-6xl font-black mb-3 tracking-tight leading-none">
            HP&nbsp;<span className="text-slate-400 font-light">Träning</span>
          </h1>
          <p className="text-slate-500 text-sm mt-2">{total} frågor · XYZ · KVA · NOG · DTK · ORD · LÄS · MEK · ELF</p>
        </div>

        {/* ── Resume banner ─────────────────────────────────── */}
        {resumeSession && (() => {
          const answered = Object.keys(resumeSession.answers).length
          const tot = resumeSession.questionIds.length
          const sessionType = resumeSession.type === 'exam' ? 'HP-prov' : resumeSession.studyMode ? 'Studieläge' : 'Övning'
          const elapsed = Math.round((Date.now() - resumeSession.startTime) / 60000)
          return (
            <div className="rounded-2xl p-4 mb-3 flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 animate-fade-up stagger-1">
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Pågående pass</div>
                <div className="text-sm text-white font-semibold">
                  {sessionType} · {answered}/{tot} frågor · {elapsed} min sedan
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { saveSession({ ...resumeSession, endTime: undefined }); navigate('/session') }}
                  className="bg-blue-500 hover:bg-blue-400 transition-colors rounded-xl px-4 py-2 text-sm font-bold"
                >
                  Fortsätt
                </button>
                <button
                  onClick={() => { localStorage.removeItem('hp_current_session'); setResumeSession(null) }}
                  className="text-slate-500 hover:text-slate-300 transition-colors px-3 py-2 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })()}

        {/* ── Exam countdown ────────────────────────────────── */}
        {examDate && days !== null ? (
          <div className={`rounded-2xl p-5 mb-3 border flex items-center gap-5 animate-fade-up stagger-1 ${
            days <= 7 ? 'bg-red-500/8 border-red-500/20' : days <= 14 ? 'bg-amber-500/8 border-amber-500/20' : 'glass border-white/[0.06]'
          }`}>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Provet</div>
              <div className="text-2xl font-black text-white">
                {days < 0 ? 'Provet har passerat' : days === 0 ? 'Idag!' : `${days} dagar kvar`}
              </div>
              {urgency && <div className={`text-xs mt-0.5 font-medium ${urgency.color}`}>{urgency.text}</div>}
              <div className="text-xs text-slate-600 mt-1">
                {examDate.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <button
              onClick={() => { clearExamDate(); setExamDateState(null); setDynamicTarget(15) }}
              className="text-slate-600 hover:text-slate-400 transition-colors text-lg"
              title="Ta bort datum"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-5 mb-3 animate-fade-up stagger-1">
            {!showDatePicker ? (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-slate-200">Sätt ditt provdatum</div>
                  <div className="text-xs text-slate-500 mt-0.5">Aktiverar nedräkning och anpassad studieplan</div>
                </div>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className="shrink-0 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
                >
                  Välj datum
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Välj provdatum</div>
                <div className="grid grid-cols-1 gap-1.5">
                  {KNOWN_HP_DATES.map(({ label, date }) => (
                    <button
                      key={date}
                      onClick={() => handleSetExamDate(date)}
                      className="text-left px-4 py-3 rounded-xl glass hover:bg-white/[0.07] transition-colors"
                    >
                      <div className="text-sm font-semibold text-white">{label}</div>
                      <div className="text-xs text-slate-500">{new Date(date).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="date"
                    value={customDate}
                    onChange={e => setCustomDate(e.target.value)}
                    className="flex-1 bg-white/[0.05] border border-white/[0.1] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/60 transition-colors"
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  <button
                    onClick={() => customDate && handleSetExamDate(customDate)}
                    disabled={!customDate}
                    className="bg-blue-500 hover:bg-blue-400 disabled:bg-white/[0.05] disabled:text-slate-600 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                  >
                    Spara
                  </button>
                  <button onClick={() => setShowDatePicker(false)} className="text-slate-500 hover:text-white px-2 py-2 text-sm transition-colors">
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Stats row: readiness + daily goal ─────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-3">

          {readiness && (
            <div className="glass rounded-2xl p-4 animate-fade-up stagger-2">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Provberedskap</div>
              <div className="flex items-end gap-1.5 mb-2">
                <span className="text-3xl font-black text-white">{readiness.score}</span>
                <span className="text-slate-600 text-xs mb-1">/100</span>
              </div>
              <div className={`text-[11px] font-bold mb-2.5 ${readiness.labelColor}`}>{readiness.label}</div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${readiness.score >= 80 ? 'bg-emerald-500' : readiness.score >= 65 ? 'bg-blue-500' : readiness.score >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                <div>
                  <div className="text-[11px] font-black text-white">{readiness.accuracy}%</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Träffsäk.</div>
                </div>
                <div>
                  <div className="text-[11px] font-black text-white">{readiness.mastery}%</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Bemästrat</div>
                </div>
                <div>
                  <div className="text-[11px] font-black text-white">{readiness.coverage}%</div>
                  <div className="text-[9px] text-slate-600 mt-0.5">Täckning</div>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center animate-fade-up stagger-2">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Dagens mål</div>
            <svg width="76" height="76" viewBox="0 0 80 80" className="mb-2">
              <circle cx="40" cy="40" r={RING_R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
              <circle
                cx="40" cy="40" r={RING_R}
                fill="none"
                stroke={goalReached ? '#4ade80' : '#3b82f6'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)', filter: goalReached ? 'drop-shadow(0 0 6px rgba(74,222,128,0.5))' : 'drop-shadow(0 0 6px rgba(59,130,246,0.5))' }}
              />
              <text x="40" y="37" textAnchor="middle" fill="white" fontSize="15" fontWeight="800">{todayCount}</text>
              <text x="40" y="51" textAnchor="middle" fill="rgba(148,163,184,0.7)" fontSize="10">/{dynamicTarget}</text>
            </svg>
            <div className={`text-[11px] text-center font-medium ${goalReached ? 'text-emerald-400' : 'text-slate-500'}`}>
              {goalReached ? 'Mål uppnått!' : `${dynamicTarget - todayCount} kvar`}
            </div>
          </div>
        </div>

        {/* ── XP / level bar ────────────────────────────────── */}
        {hasActivity && stats && (() => {
          const levelInfo = getLevel(stats.xp)
          const isMaxLevel = levelInfo.level === 10
          const xpInLevel = stats.xp - levelInfo.currentLevelXp
          const xpNeeded = isMaxLevel ? 1 : levelInfo.nextLevelXp - levelInfo.currentLevelXp
          const progressPct = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
          return (
            <div className="glass rounded-2xl px-5 py-4 mb-3 animate-fade-up stagger-3">
              <div className="flex items-center gap-5 mb-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400 shrink-0"><path d="M12 2c0 0-5 5.5-5 10a5 5 0 0 0 10 0C17 7.5 12 2 12 2Zm0 14a3 3 0 0 1-3-3c0-2.5 2-5 3-6.5 1 1.5 3 4 3 6.5a3 3 0 0 1-3 3Z"/></svg>
                  <span className="text-orange-400 font-semibold">{stats.streak} dagars streak</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400 shrink-0"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>
                  <span className="text-amber-400 font-semibold">Nivå {levelInfo.level} — {levelInfo.label}</span>
                </div>
                <span className="text-slate-600 text-xs ml-auto">{stats.xp} XP</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-600 mt-1.5">
                {isMaxLevel ? 'Max nivå uppnådd' : `${xpInLevel} / ${xpNeeded} XP till nästa nivå`}
              </div>
            </div>
          )
        })()}

        {/* ── Primary CTAs ──────────────────────────────────── */}
        <div className="space-y-2.5 mb-3 animate-fade-up stagger-3">

          {/* Quant/Verbal split CTA when focus is set */}
          {focusPreference === 'both' || focusPreference === null ? (
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => navigate('/practice?section=quant')}
                className="relative overflow-hidden rounded-2xl p-4 text-left group bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-950/40"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-base font-black">Kvantitativt</div>
                  <div className="text-blue-100/70 text-[11px] mt-0.5">XYZ · KVA · NOG · DTK</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/practice?section=verbal')}
                className="relative overflow-hidden rounded-2xl p-4 text-left group bg-rose-700 hover:bg-rose-600 transition-all duration-200 shadow-lg shadow-rose-950/40"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="text-base font-black">Verbalt</div>
                  <div className="text-rose-100/70 text-[11px] mt-0.5">ORD · LÄS · MEK · ELF</div>
                </div>
              </button>
            </div>
          ) : focusPreference === 'quant' ? (
            <button
              onClick={() => navigate('/practice?section=quant')}
              className="relative w-full overflow-hidden rounded-2xl p-5 text-left group bg-blue-600 hover:bg-blue-500 transition-all duration-200 shadow-lg shadow-blue-950/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-lg font-black">Börja öva kvantitativt</div>
                  <div className="text-blue-100/80 text-xs mt-0.5">XYZ · KVA · NOG · DTK</div>
                </div>
                <span className="text-2xl opacity-80 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => navigate('/practice?section=verbal')}
              className="relative w-full overflow-hidden rounded-2xl p-5 text-left group bg-rose-700 hover:bg-rose-600 transition-all duration-200 shadow-lg shadow-rose-950/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="text-lg font-black">Börja öva verbalt</div>
                  <div className="text-rose-100/80 text-xs mt-0.5">ORD · LÄS · MEK · ELF</div>
                </div>
                <span className="text-2xl opacity-80 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </div>
            </button>
          )}

          {/* Secondary row: daily challenge + exam sim */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('/practice?daily=1')}
              className={`rounded-2xl p-4 text-left group transition-all duration-200 border ${
                dailyDone
                  ? 'bg-emerald-500/8 border-emerald-500/20'
                  : 'bg-violet-500/8 border-violet-500/20 hover:bg-violet-500/12'
              }`}
            >
              <div className={`text-base font-black ${dailyDone ? 'text-emerald-400' : 'text-violet-300'}`}>
                {dailyDone ? '✓ Klar' : 'Daglig'}
              </div>
              <div className={`text-xs mt-0.5 font-medium ${dailyDone ? 'text-emerald-600' : 'text-violet-400/70'}`}>
                {dailyDone ? 'Utmaning klar' : `${CHALLENGE_SIZE} frågor`}
              </div>
            </button>

            <button
              onClick={() => navigate('/exam-select')}
              className="glass rounded-2xl p-4 text-left group hover:bg-white/[0.06] transition-all duration-200"
            >
              <div className="text-base font-black text-slate-200">Simulera</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">40 frågor · 55 min</div>
            </button>
          </div>

          {/* Smart daily recommendation */}
          {recommendation && (
            <div className={`rounded-2xl p-4 border ${recommendation.borderAccent} ${recommendation.bgAccent}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-1">Rekommenderat idag</div>
                  <div className={`text-sm font-bold ${recommendation.accent} mb-0.5`}>{recommendation.title}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{recommendation.desc}</div>
                </div>
                <button
                  onClick={() => navigate(recommendation.to)}
                  className={`shrink-0 text-xs font-bold px-3 py-2 rounded-xl border ${recommendation.borderAccent} ${recommendation.accent} hover:bg-white/[0.05] transition-colors whitespace-nowrap`}
                >
                  {recommendation.btnLabel}
                </button>
              </div>
            </div>
          )}

          {/* SRS due widget */}
          {dueCount > 0 && (
            <div className="rounded-2xl p-4 flex items-center justify-between bg-amber-500/8 border border-amber-500/20">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                  <div className="text-sm font-bold text-amber-300">{dueCount} repetitioner klara</div>
                </div>
                <div className="text-xs text-slate-500">Spaced repetition · frågor du bör se idag</div>
              </div>
              <div className="flex gap-2 shrink-0 ml-3">
                <button
                  onClick={() => navigate('/srs')}
                  className="text-xs text-slate-400 hover:text-slate-200 border border-white/[0.08] px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={() => navigate('/practice?srs=1')}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Börja →
                </button>
              </div>
            </div>
          )}

          {/* Weak-spot focus card */}
          {weakTags.length > 0 && (
            <div className="rounded-2xl p-4 border border-red-500/15 bg-red-500/5">
              <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Fokusera på</div>
              <div className="space-y-2">
                {weakTags.map(({ tag, pct }) => (
                  <div key={tag} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-[11px] font-bold shrink-0 ${pct < 50 ? 'text-red-400' : 'text-amber-400'}`}>{pct}%</span>
                      <span className="text-sm text-slate-300 capitalize truncate">{tag.replace(/-/g, ' ')}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/practice?tag=${encodeURIComponent(tag)}`)}
                      className="shrink-0 text-xs font-bold text-blue-400 hover:text-blue-300 border border-blue-500/25 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Öva →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lärväg study widget */}
          {(() => {
            let conceptMastery: Record<string, string> = {}
            try { const s = localStorage.getItem('mathguide-mastery'); if (s) conceptMastery = JSON.parse(s) } catch { /* */ }

            const TOPIC_ORDER = [
              { id: 'algebra', name: 'Algebra', icon: '∑' },
              { id: 'procent', name: 'Procent & Ekonomi', icon: '%' },
              { id: 'sannolikhet', name: 'Sannolikhet', icon: '⚀' },
              { id: 'funktioner', name: 'Funktioner', icon: 'f(x)' },
              { id: 'aritmetik', name: 'Aritmetik', icon: 'ℕ' },
              { id: 'potenser', name: 'Potenser & Rötter', icon: 'aⁿ' },
              { id: 'statistik', name: 'Statistik', icon: 'x̄' },
              { id: 'geometri', name: 'Geometri', icon: '△' },
              { id: '3d', name: '3D-geometri', icon: '◻' },
              { id: 'logaritm', name: 'Logaritmer', icon: 'log' },
            ]
            const CONCEPT_COUNTS: Record<string, number> = {
              algebra: 8, procent: 5, sannolikhet: 8, funktioner: 6,
              aritmetik: 7, potenser: 5, statistik: 5, geometri: 6, '3d': 3, logaritm: 2,
            }
            const started = TOPIC_ORDER.filter(t => {
              const total = CONCEPT_COUNTS[t.id] ?? 5
              const known = Array.from({ length: total }, (_, i) => conceptMastery[`${t.id}-${i}`]).filter(v => v === 'known').length
              return known > 0
            })
            const nextTopic = TOPIC_ORDER.find(t => {
              const total = CONCEPT_COUNTS[t.id] ?? 5
              const known = Array.from({ length: total }, (_, i) => conceptMastery[`${t.id}-${i}`]).filter(v => v === 'known').length
              return known < Math.ceil(total * 0.5)
            })
            const totalKnown = TOPIC_ORDER.reduce((sum, t) => {
              const total = CONCEPT_COUNTS[t.id] ?? 5
              return sum + Array.from({ length: total }, (_, i) => conceptMastery[`${t.id}-${i}`]).filter(v => v === 'known').length
            }, 0)
            const totalConcepts = Object.values(CONCEPT_COUNTS).reduce((a, b) => a + b, 0)

            return (
              <div className="rounded-2xl p-4 border border-violet-500/20 bg-violet-500/5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">Lärväg</div>
                  <button onClick={() => navigate('/matematik?tab=path')} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
                    Se hela planen →
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${Math.round((totalKnown / totalConcepts) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">{totalKnown}/{totalConcepts} begrepp</span>
                </div>
                {nextTopic ? (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono text-slate-600 shrink-0 w-8 text-center">{nextTopic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-200 truncate">Nästa: {nextTopic.name}</div>
                      <div className="text-xs text-slate-600">
                        {started.length === 0 ? 'Börja här — det är grunden för allt' : 'Fortsätt din lärväg'}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/matematik?topic=${nextTopic.id}&inner=lesson`)}
                      className="shrink-0 text-xs font-bold text-violet-400 border border-violet-500/30 hover:bg-violet-500/10 px-3 py-2 rounded-xl transition-colors"
                    >
                      Lär dig →
                    </button>
                  </div>
                ) : (
                  <div className="text-sm text-emerald-400 font-bold">Alla ämnen genomgångna!</div>
                )}
              </div>
            )
          })()}

          {/* Section hubs */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('/kvantitativt')}
              className="glass rounded-2xl p-4 text-left group hover:bg-white/[0.06] transition-all duration-200 border border-blue-500/10 hover:border-blue-500/20"
            >
              <div className="text-sm font-bold text-blue-300 mb-0.5">Kvantitativt</div>
              <div className="text-[11px] text-slate-500">XYZ · KVA · NOG · DTK</div>
            </button>
            <button
              onClick={() => navigate('/verbalt')}
              className="glass rounded-2xl p-4 text-left group hover:bg-white/[0.06] transition-all duration-200 border border-rose-500/10 hover:border-rose-500/20"
            >
              <div className="text-sm font-bold text-rose-300 mb-0.5">Verbalt</div>
              <div className="text-[11px] text-slate-500">ORD · LÄS · MEK · ELF</div>
            </button>
          </div>
        </div>

        {/* ── Type cards accordion ───────────────────────────── */}
        <div className="mb-3 animate-fade-up stagger-4">
          <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-1">Delprov</div>
          <div className="flex flex-col gap-2">
            {(Object.entries(byType) as [string, number][]).map(([type, count]) => {
              const accent = TYPE_ACCENTS[type]
              const info = TYPE_INFO[type]
              const isOpen = expandedType === type
              return (
                <div
                  key={type}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? `border-white/10 ${accent?.bg ?? ''}`
                      : 'glass border-white/[0.05] hover:border-white/[0.1]'
                  }`}
                >
                  <button
                    onClick={() => setExpandedType(isOpen ? null : type)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-black ${accent?.color ?? 'text-white'}`}>{type}</span>
                      <span className="text-slate-500 text-sm">{info?.desc}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="text-slate-600 text-xs">{count} frågor</span>
                      <span className={`text-slate-500 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▾</span>
                    </div>
                  </button>

                  {isOpen && info && (
                    <div className="px-5 pb-5 animate-fade-in">
                      <div className="border-t border-white/[0.05] pt-4 space-y-4">

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { value: info.questions, label: 'frågor/prov' },
                            { value: info.timePerQ, label: 'per fråga' },
                            { value: info.totalTime, label: 'totalt' },
                          ].map(({ value, label }) => (
                            <div key={label} className="bg-white/[0.04] rounded-xl py-2.5 px-2 text-center">
                              <div className={`text-sm font-black ${accent?.color ?? 'text-white'}`}>{value}</div>
                              <div className="text-[9px] text-slate-600 mt-0.5">{label}</div>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Ämnen</div>
                          <div className="flex flex-wrap gap-1.5">
                            {info.topics.map(t => (
                              <span key={t} className="text-[11px] bg-white/[0.04] border border-white/[0.06] text-slate-400 px-2.5 py-1 rounded-lg">{t}</span>
                            ))}
                          </div>
                        </div>

                        {info.answerScheme && (
                          <div>
                            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Svarsalternativ</div>
                            <div className="space-y-1">
                              {info.answerScheme.map(s => (
                                <div key={s.key} className="flex items-center gap-2.5 text-sm">
                                  <span className={`font-black text-xs w-4 shrink-0 ${accent?.color ?? 'text-white'}`}>{s.key}</span>
                                  <span className="text-slate-400 text-[13px]">{s.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2">Tips</div>
                          <ul className="space-y-1.5">
                            {info.tips.map(tip => (
                              <li key={tip} className="flex gap-2 text-[13px] text-slate-400">
                                <span className={`shrink-0 ${accent?.color ?? 'text-white'}`}>·</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/practice?type=${type}`)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-opacity hover:opacity-75 ${accent?.bg ?? 'bg-white/[0.05]'} ${accent?.color ?? 'text-white'} border border-white/10`}
                          >
                            Öva {type} →
                          </button>
                          {info.guideRoute && (
                            <button
                              onClick={() => navigate(info.guideRoute!)}
                              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-75 bg-white/[0.04] ${accent?.color ?? 'text-white'} border border-white/[0.08]`}
                            >
                              {info.guideLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
