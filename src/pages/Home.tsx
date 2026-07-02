import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadStats, type GameStats } from '../utils/gamification'
import { loadHistory, loadSession, saveSession, buildSession } from '../utils/session'
import { getExamDate, daysUntilExam } from '../utils/examDate'
import { estimateSectionedScore } from '../utils/hpScore'
import { weakTypeSummary, buildWeakAreaSession, hpScoreHistory } from '../utils/analytics'
import type { ExamSession, QuestionType } from '../types'

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

export default function Home() {
  const navigate = useNavigate()

  const [stats, setStats] = useState<GameStats | null>(null)
  const [resumeSession, setResumeSession] = useState<ExamSession | null>(null)
  const [normScore, setNormScore] = useState<number | null>(null)
  const [scoreDelta, setScoreDelta] = useState<number | null>(null)
  const [typeAccuracy, setTypeAccuracy] = useState<Record<string, { correct: number; total: number }>>({})
  const [weakAreaIds, setWeakAreaIds] = useState<string[]>([])
  const [weakTypes, setWeakTypes] = useState<{ type: string; pct: number }[]>([])

  useEffect(() => {
    setStats(loadStats())

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

  return (
    <div
      className="min-h-screen bg-app overflow-auto"
      style={{ padding: 'max(58px, calc(env(safe-area-inset-top,0px) + 20px)) 18px calc(100px + env(safe-area-inset-bottom,0px))' }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <div style={{ fontFamily: "'Newsreader', serif", fontWeight: 400, fontSize: 26, lineHeight: 1.05, color: '#23201A', letterSpacing: '-0.01em' }}>
            {greeting}
          </div>
          <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 13, lineHeight: 1, color: '#8B8478', marginTop: 6 }}>
            {todayLabel}
          </div>
        </div>
        {stats && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F3E0D5', border: '1px solid #ECCFBE', borderRadius: 999, padding: '7px 11px 7px 9px', flexShrink: 0 }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: '#BF5A33', transform: 'rotate(45deg)', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 13, lineHeight: 1, color: '#A84A26' }}>
              {stats.streak}
            </span>
          </div>
        )}
      </div>

      {/* ── Score card ──────────────────────────────────────── */}
      <div
        style={{ background: '#224A3A', borderRadius: 22, padding: '18px 20px 17px', color: '#EFE9DD', cursor: 'pointer' }}
        onClick={() => navigate('/progress')}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 600, fontSize: 10.5, lineHeight: 1, letterSpacing: '0.14em', color: '#9FB7A8' }}>
            DITT NORMERADE RESULTAT
          </span>
          {deltaText && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 999, padding: '4px 9px', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 11, lineHeight: 1, color: '#D6E4D9' }}>
              {deltaText}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <span style={{ fontFamily: "'Newsreader', serif", fontWeight: 500, fontSize: 50, lineHeight: 0.9, color: '#FBF7EE', letterSpacing: '-0.02em' }}>
            {scoreText}
          </span>
          <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 16, lineHeight: 1, color: '#8FA89A' }}>
            / 2,0
          </span>
        </div>
        <div style={{ height: 7, borderRadius: 999, background: 'rgba(255,255,255,0.14)', marginTop: 15, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${scorePct}%`, borderRadius: 999, background: 'linear-gradient(90deg,#C9A24A,#E4C66A)', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11, fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 12, lineHeight: 1, color: '#A9C0B2' }}>
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

      {/* ── Continue session card ───────────────────────────── */}
      {resumeSession && (() => {
        const answered = Object.keys(resumeSession.answers).length
        const tot = resumeSession.questionIds.length
        const firstId = resumeSession.questionIds[0]
        const firstQ = questions.find(x => x.id === firstId)
        const sectionType = firstQ?.type || 'ORD'
        const sectionMeta = SECTIONS.find(s => s.type === sectionType)
        const displayCode = sectionMeta?.code ?? sectionType

        return (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#FFFFFF', border: '1px solid #EAE3D6', borderRadius: 18, padding: '13px 14px', marginTop: 13, cursor: 'pointer' }}
            onClick={() => { saveSession({ ...resumeSession, endTime: undefined }); navigate('/session') }}
          >
            <div style={{ width: 46, height: 46, borderRadius: 13, background: '#E7EDE7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 800, fontSize: 15, color: '#224A3A', flexShrink: 0 }}>
              {displayCode}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 10, lineHeight: 1, letterSpacing: '0.1em', color: '#A89F90' }}>FORTSÄTT DÄR DU SLUTADE</div>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: '#23201A', marginTop: 4 }}>
                {sectionMeta?.name ?? 'Träningspass'}
              </div>
              <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 12, lineHeight: 1, color: '#8B8478', marginTop: 4 }}>
                {answered} av {tot} frågor klara
              </div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#224A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,2 12,7 3,12" fill="#FBF7EE"/></svg>
            </div>
          </div>
        )
      })()}

      {/* ── Weak-area card (app feature, not in prototype — placed after the continue card) ── */}
      {weakTypes.length > 0 && weakAreaIds.length > 0 && (
        <button
          onClick={() => {
            const session = buildSession(weakAreaIds, null, true, 'drill', true)
            saveSession(session)
            navigate('/session')
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, background: '#FFFFFF', border: '1px solid #EAE3D6', borderRadius: 18, padding: '13px 14px', marginTop: 13, cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ width: 46, height: 46, borderRadius: 13, background: '#FBE7D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 800, fontSize: 13, color: '#BF5A33', flexShrink: 0 }}>
            ↗
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 10, lineHeight: 1, letterSpacing: '0.1em', color: '#A89F90' }}>FOKUSTRÄNING</div>
            <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 15, lineHeight: 1.2, color: '#23201A', marginTop: 4 }}>
              Öva på svaga delprov
            </div>
            <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 12, lineHeight: 1, color: '#8B8478', marginTop: 4 }}>
              {weakTypes.slice(0, 3).map(w => w.type).join(' · ')} · {weakAreaIds.length} frågor
            </div>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#BF5A33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><polygon points="3,2 12,7 3,12" fill="#FBF7EE"/></svg>
          </div>
        </button>
      )}

      {/* ── Section category headers ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '20px 2px 11px' }}>
        <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 12, lineHeight: 1, color: '#224A3A', letterSpacing: '0.04em' }}>
          VERBAL
        </span>
        <span style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 12, lineHeight: 1, color: '#BF5A33', letterSpacing: '0.04em' }}>
          KVANTITATIV
        </span>
      </div>

      {/* ── 2-column section grid ───────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {SECTIONS.map(sec => {
          const acc = typeAccuracy[sec.type]
          const pct = acc && acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : 0
          const ringColor = sec.cat === 'verbal' ? '#224A3A' : '#BF5A33'

          return (
            <button
              key={sec.type}
              onClick={() => navigate('/practice', { state: { defaultType: sec.type } })}
              style={{ background: '#FFFFFF', border: '1px solid #EAE3D6', borderRadius: 15, padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 800, fontSize: 16, lineHeight: 1, color: '#23201A' }}>
                  {sec.code}
                </div>
                <div style={{ fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 500, fontSize: 11, lineHeight: 1.2, color: '#8B8478', marginTop: 3 }}>
                  {sec.name}
                </div>
              </div>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(${ringColor} 0 ${pct}%, #E7E0D3 0)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 23, height: 23, borderRadius: '50%', background: '#FFFFFF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Hanken Grotesk', system-ui", fontWeight: 700, fontSize: 8.5, lineHeight: 1, color: ringColor,
                }}>
                  {pct}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
