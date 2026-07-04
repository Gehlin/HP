import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadHistory, loadSession, saveSession, buildSession } from '../utils/session'
import { getExamDate, daysUntilExam } from '../utils/examDate'
import { estimateSectionedScore } from '../utils/hpScore'
import { weakTypeSummary, buildWeakAreaSession, hpScoreHistory } from '../utils/analytics'
import type { ExamSession, QuestionType } from '../types'

const SANS = "'Hanken Grotesk', system-ui"
const SERIF = "'Newsreader', serif"

const SECTIONS = [
  { code: 'ORD', name: 'Ordförståelse',    cat: 'verbal', type: 'ORD' as const },
  { code: 'XYZ', name: 'Problemlösning',   cat: 'quant',  type: 'XYZ' as const },
  { code: 'LÄS', name: 'Läsförståelse',    cat: 'verbal', type: 'LAS' as const },
  { code: 'KVA', name: 'Jämförelser',      cat: 'quant',  type: 'KVA' as const },
  { code: 'MEK', name: 'Meningskompl.',    cat: 'verbal', type: 'MEK' as const },
  { code: 'NOG', name: 'Tillräcklig info', cat: 'quant',  type: 'NOG' as const },
  { code: 'ELF', name: 'Engelsk läsning',  cat: 'verbal', type: 'ELF' as const },
  { code: 'DTK', name: 'Diagram & kartor', cat: 'quant',  type: 'DTK' as const },
] as const

function getUserName(): string | null {
  try {
    const raw = localStorage.getItem('hp_user_name')
    if (raw) return raw
  } catch { /* ignore */ }
  return null
}

function getGoalText(): string {
  try {
    const raw = localStorage.getItem('hp_goal')
    if (raw) return raw
  } catch { /* ignore */ }
  return '1,40'
}

/** Filled play triangle inside a colored circle — shared by the Dagens pass card. */
function PlayCircle({ background }: { background: string }) {
  return (
    <div style={{ width: 40, height: 40, borderRadius: '50%', background, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,2 12,7 3,12" fill="#FBF7EE"/></svg>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()

  const [resumeSession, setResumeSession] = useState<ExamSession | null>(null)
  const [normScore, setNormScore] = useState<number | null>(null)
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)
  const [typeAccuracy, setTypeAccuracy] = useState<Record<string, { correct: number; total: number }>>({})
  const [weakAreaIds, setWeakAreaIds] = useState<string[]>([])
  const [weakTypes, setWeakTypes] = useState<{ type: string; pct: number }[]>([])
  const [allSectionsShown, setAllSectionsShown] = useState(false)

  useEffect(() => {
    const session = loadSession()
    if (session && !session.endTime) setResumeSession(session)

    const history = loadHistory()
    if (history.length > 0) {
      setWeakTypes(weakTypeSummary())
      setWeakAreaIds(buildWeakAreaSession(20))
    }

    const acc: Record<string, { correct: number; total: number }> = {}
    SECTIONS.forEach(s => { acc[s.type] = { correct: 0, total: 0 } })
    history.forEach(sess => {
      sess.questionIds.forEach(id => {
        const q = questions.find(x => x.id === id)
        if (!q || !sess.answers[id]) return
        if (acc[q.type] === undefined) return
        acc[q.type].total++
        if (sess.answers[id] === q.answer) acc[q.type].correct++
      })
    })
    setTypeAccuracy(acc)

    // Normerat estimate (1,00–2,00) for the hero card + delta since oldest tracked session
    const { combined } = estimateSectionedScore(acc as Record<QuestionType, { correct: number; total: number }>)
    setNormScore(combined)
    const hpHistory = hpScoreHistory()
    setScoreDelta(hpHistory.length >= 2 ? hpHistory[hpHistory.length - 1] - hpHistory[0] : null)
  }, [])

  // Read at render time (not mount) so the value is fresh right after onboarding completes
  const examDate = getExamDate()
  const days = examDate ? daysUntilExam() : null
  const scoreText = normScore != null ? normScore.toFixed(2).replace('.', ',') : '–'
  const scorePct = normScore != null ? Math.min(100, (normScore / 2.0) * 100) : 0
  const deltaText = scoreDelta != null
    ? `${scoreDelta >= 0 ? '▲' : '▼'} ${Math.abs(scoreDelta).toFixed(2).replace('.', ',')}`
    : null

  const userName = getUserName()
  const firstName = userName ? userName.trim().split(/\s+/)[0] : null
  const goalText = getGoalText()

  const hour = new Date().getHours()
  const timeGreet = hour < 10 ? 'God morgon' : hour < 18 ? 'God dag' : 'God kväll'
  const greeting = firstName ? `${timeGreet}, ${firstName}` : timeGreet
  const todayRaw = new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })
  const todayLabel = todayRaw.charAt(0).toUpperCase() + todayRaw.slice(1)

  // sv-SE short months come out as "okt." — the prototype's examShort has no trailing period
  const examShort = examDate
    ? examDate.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }).replace(/\.$/, '')
    : null

  // ── Dagens pass: the two session-starting behaviors behind one card ──
  const resumeMeta = resumeSession ? (() => {
    const answered = Object.keys(resumeSession.answers).length
    const tot = resumeSession.questionIds.length
    const firstQ = questions.find(x => x.id === resumeSession.questionIds[0])
    const sectionMeta = SECTIONS.find(s => s.type === (firstQ?.type || 'ORD'))
    return { answered, tot, sectionMeta }
  })() : null
  const hasWeakDrill = weakTypes.length > 0 && weakAreaIds.length > 0

  const resumeNow = () => {
    if (!resumeSession) return
    saveSession({ ...resumeSession, endTime: undefined })
    navigate('/session')
  }
  const startWeakDrill = () => {
    const session = buildSession(weakAreaIds, null, true, 'drill', true)
    saveSession(session)
    navigate('/session')
  }

  // ── Delprov: weakest first (untried sections count as weakest) ──
  const rankedSections = SECTIONS
    .map(sec => {
      const acc = typeAccuracy[sec.type]
      const pct = acc && acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : 0
      return { ...sec, pct }
    })
    .sort((a, b) => a.pct - b.pct) // stable: canonical order breaks ties
  const visibleSections = allSectionsShown ? rankedSections : rankedSections.slice(0, 3)

  const sectionLabelStyle = {
    fontFamily: SANS, fontWeight: 700, fontSize: 12, lineHeight: 1,
    color: '#8B8478', letterSpacing: '0.1em',
  } as const

  return (
    <div
      className="min-h-screen bg-app overflow-auto pt-topnav pb-bottomnav"
      style={{ paddingLeft: 18, paddingRight: 18 }}
    >
      {/* ── Header — greeting only; the streak lives in the AppHeader chip ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.05, color: '#23201A', letterSpacing: '-0.01em' }}>
          {greeting}
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 13, lineHeight: 1, color: '#8B8478', marginTop: 6 }}>
          {todayLabel}
        </div>
      </div>

      {/* ── Score card ──────────────────────────────────────── */}
      <div
        style={{ background: '#224A3A', borderRadius: 22, padding: '18px 20px 17px', color: '#EFE9DD', cursor: 'pointer' }}
        onClick={() => navigate('/progress')}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 10.5, lineHeight: 1, letterSpacing: '0.14em', color: '#9FB7A8' }}>
            DITT NORMERADE RESULTAT
          </span>
          {deltaText && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '4px 9px', fontFamily: SANS, fontWeight: 700, fontSize: 11, lineHeight: 1, color: '#D6E4D9' }}>
              {deltaText}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <span style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 50, lineHeight: 0.9, color: '#FBF7EE', letterSpacing: '-0.02em' }}>
            {scoreText}
          </span>
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 16, lineHeight: 1, color: '#8FA89A' }}>
            / 2,0
          </span>
        </div>
        <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.14)', marginTop: 15, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${scorePct}%`, borderRadius: 999, background: 'linear-gradient(90deg,#C9A24A,#E4C66A)', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, fontFamily: SANS, fontWeight: 500, fontSize: 12, lineHeight: 1, color: '#A9C0B2' }}>
          <span>
            Mål <span style={{ color: '#EFE9DD', fontWeight: 700 }}>{goalText}</span>
          </span>
          {days != null && examShort ? (
            <span>
              Provet om <span style={{ color: '#EFE9DD', fontWeight: 700 }}>{days} dagar</span> · {examShort}
            </span>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); navigate('/profil') }}
              style={{ color: '#EFE9DD', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Ange provdatum →
            </button>
          )}
        </div>
      </div>

      {/* ── Dagens pass — continue + weak-area drill merged into one card ── */}
      {(resumeMeta || hasWeakDrill) && (
        <>
          <div style={{ ...sectionLabelStyle, margin: '22px 2px 11px' }}>DAGENS PASS</div>
          <div style={{ background: '#FFFFFF', border: '1px solid #EAE3D6', borderRadius: 18, overflow: 'hidden' }}>
            {/* Primary action: resume beats starting fresh; weak drill leads only when nothing is unfinished */}
            {resumeMeta ? (
              <button
                onClick={resumeNow}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: 'none', border: 'none', padding: '14px 14px', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 13, background: '#E7EDE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 15, color: '#224A3A', flexShrink: 0 }}>
                  {resumeMeta.sectionMeta?.code ?? '—'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: '#23201A' }}>
                    Fortsätt: {resumeMeta.sectionMeta?.name ?? 'Träningspass'}
                  </div>
                  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 13, lineHeight: 1, color: '#8B8478', marginTop: 5 }}>
                    {resumeMeta.answered} av {resumeMeta.tot} frågor klara
                  </div>
                </div>
                <PlayCircle background="#224A3A" />
              </button>
            ) : (
              <button
                onClick={startWeakDrill}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: 'none', border: 'none', padding: '14px 14px', cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 13, background: '#FBE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 15, color: '#BF5A33', flexShrink: 0 }}>
                  ↗
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 16, lineHeight: 1.2, color: '#23201A' }}>
                    Öva på svaga delprov
                  </div>
                  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 13, lineHeight: 1, color: '#8B8478', marginTop: 5 }}>
                    {weakTypes.slice(0, 3).map(w => w.type).join(' · ')} · {weakAreaIds.length} frågor
                  </div>
                </div>
                <PlayCircle background="#BF5A33" />
              </button>
            )}

            {/* Secondary: the weak drill demoted to a quiet row when a resume leads */}
            {resumeMeta && hasWeakDrill && (
              <button
                onClick={startWeakDrill}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', borderTop: '1px solid #F0EAE0', padding: '13px 16px', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ flex: 1, minWidth: 0, fontFamily: SANS, fontWeight: 500, fontSize: 12.5, lineHeight: 1.3, color: '#8B8478', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Fokusträning · svaga delprov{' '}
                  <span style={{ color: '#BF5A33', fontWeight: 700 }}>
                    {weakTypes.slice(0, 3).map(w => w.type).join(' · ')}
                  </span>
                </span>
                <span aria-hidden style={{ fontFamily: SANS, fontWeight: 700, fontSize: 15, lineHeight: 1, color: '#BF5A33', flexShrink: 0 }}>
                  →
                </span>
              </button>
            )}
          </div>
        </>
      )}

      {/* ── Delprov — 3 weakest, expandable to all 8 in place ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 2px 11px' }}>
        <span style={sectionLabelStyle}>DELPROV</span>
        <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 12.5, lineHeight: 1, color: '#A89F90' }}>
          svagast först
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleSections.map(sec => {
          const ringColor = sec.cat === 'verbal' ? '#224A3A' : '#BF5A33'
          return (
            <button
              key={sec.type}
              onClick={() => navigate('/practice', { state: { defaultType: sec.type } })}
              style={{ background: '#FFFFFF', border: '1px solid #EAE3D6', borderRadius: 16, padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}
            >
              <span style={{ width: 44, flexShrink: 0, fontFamily: SANS, fontWeight: 800, fontSize: 16, lineHeight: 1, color: '#23201A' }}>
                {sec.code}
              </span>
              <span style={{ flex: 1, minWidth: 0, fontFamily: SANS, fontWeight: 500, fontSize: 14, lineHeight: 1.2, color: '#6D675C', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {sec.name}
              </span>
              <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 10.5, lineHeight: 1, letterSpacing: '0.08em', color: ringColor, flexShrink: 0 }}>
                {sec.cat === 'verbal' ? 'VERBAL' : 'KVANT'}
              </span>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(${ringColor} 0 ${sec.pct}%, #E7E0D3 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 23, height: 23, borderRadius: '50%', background: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: SANS, fontWeight: 700, fontSize: 8.5, lineHeight: 1, color: ringColor,
                }}>
                  {sec.pct}
                </div>
              </div>
            </button>
          )
        })}

        <button
          onClick={() => setAllSectionsShown(v => !v)}
          aria-expanded={allSectionsShown}
          style={{ background: 'none', border: '1.5px dashed #D3C9B6', borderRadius: 16, padding: '13px 15px', cursor: 'pointer', fontFamily: SANS, fontWeight: 700, fontSize: 14, lineHeight: 1, color: '#224A3A' }}
        >
          {allSectionsShown ? 'Visa färre ▴' : 'Visa alla 8 delprov ▾'}
        </button>
      </div>
    </div>
  )
}
