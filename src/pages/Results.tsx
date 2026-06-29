import { useNavigate } from 'react-router-dom'
import { loadSession, saveSession, buildSession, loadHistory } from '../utils/session'
import { questions } from '../data/questions'
import type { QuestionType, AnswerKey } from '../types'
import MathText from '../components/MathText'
import ExplanationCard from '../components/ExplanationCard'
import { useState, useEffect } from 'react'
import { loadStats, saveStats, getLevel } from '../utils/gamification'
import { getStats as getSrsStats } from '../utils/srs'
import { SECTION_META, HP_AVERAGES, SECTION_ORDER, getQuantExamQuestions } from '../data/exams'
import { hpScoreColor, hpScoreLabel, estimateSectionedScore } from '../utils/hpScore'
import { isBookmarked, toggleBookmark } from '../utils/bookmarks'
import { checkAchievements } from '../utils/achievements'
import AchievementToast from '../components/AchievementToast'
import { notificationsEnabled, notificationsSupported, requestNotificationPermission } from '../utils/notifications'
import { getTopicForQuestion } from '../utils/topicLookup'

interface XpInfo {
  earned: number
  easy: number
  medium: number
  hard: number
  stats: ReturnType<typeof loadStats>
  level: ReturnType<typeof getLevel>
  leveledUp: boolean
  streakIncreased: boolean
}

export default function Results() {
  const navigate = useNavigate()
  const session = loadSession()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'wrong' | 'flagged'>('all')
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [bookmarkState, setBookmarkState] = useState<Record<string, boolean>>(() => {
    const s = loadSession()
    if (!s) return {}
    return Object.fromEntries(s.questionIds.map(id => [id, isBookmarked(id)]))
  })
  const [cardVisible, setCardVisible] = useState(false)
  const [xpInfo, setXpInfo] = useState<XpInfo | null>(null)
  const [showScale, setShowScale] = useState(false)
  const [isNewBest, setIsNewBest] = useState(false)
  const [shareFeedback, setShareFeedback] = useState<'idle' | 'copied'>('idle')

  const sessionQuestions = session
    ? (session.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as typeof questions)
    : []

  useEffect(() => {
    if (!session) return

    const sq = session.questionIds
      .map(id => questions.find(q => q.id === id))
      .filter(Boolean) as typeof questions

    const easyCorrect = sq.filter(q => q.difficulty === 'easy' && session.answers[q.id] === q.answer).length
    const medCorrect = sq.filter(q => q.difficulty === 'medium' && session.answers[q.id] === q.answer).length
    const hardCorrect = sq.filter(q => q.difficulty === 'hard' && session.answers[q.id] === q.answer).length
    const earned = easyCorrect * 10 + medCorrect * 15 + hardCorrect * 25 + 20

    let leveledUp = false
    let streakIncreased = false

    if (session.xpEarned === undefined) {
      const statsBefore = loadStats()
      const levelBefore = getLevel(statsBefore.xp)
      const statsAfter = { ...statsBefore, xp: statsBefore.xp + earned }
      saveStats(statsAfter)
      const levelAfter = getLevel(statsAfter.xp)
      leveledUp = levelAfter.level > levelBefore.level
      if (session.streakBefore !== undefined) {
        streakIncreased = statsAfter.streak > session.streakBefore
      }
      saveSession({ ...session, xpEarned: earned })

      // Ask for notification permission after first session, once
      if (notificationsSupported() && !notificationsEnabled() && Notification.permission === 'default') {
        setTimeout(() => requestNotificationPermission(), 3000)
      }

      const prevBest = parseInt(localStorage.getItem('hp_personal_best') ?? '0', 10)
      if (pct > prevBest) {
        if (prevBest > 0) setIsNewBest(true)
        localStorage.setItem('hp_personal_best', String(pct))
      }
    }

    const stats = loadStats()
    setXpInfo({
      earned: session.xpEarned ?? earned,
      easy: easyCorrect,
      medium: medCorrect,
      hard: hardCorrect,
      stats,
      level: getLevel(stats.xp),
      leveledUp,
      streakIncreased,
    })

    const t = setTimeout(() => setCardVisible(true), 150)
    const newlyEarned = checkAchievements()
    if (newlyEarned.length > 0) setTimeout(() => setNewAchievements(newlyEarned), 800)
    return () => clearTimeout(t)
  }, [])

  if (!session) return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl font-black text-[var(--color-ink-faint)] mb-4">—</div>
        <div className="text-[var(--color-ink-muted)] font-semibold mb-1">Ingen session hittades</div>
        <p className="text-[var(--color-ink-faint)] text-sm mb-6">Starta ett träningspass för att se resultat.</p>
        <button onClick={() => navigate('/practice')} className="btn-primary px-6 py-3 rounded-xl font-bold text-sm">
          Starta träning →
        </button>
      </div>
    </div>
  )

  const skipped = session.skipped ?? []
  const correct = sessionQuestions.filter(q => session.answers[q.id] === q.answer).length
  const total = sessionQuestions.length
  const pct = Math.round((correct / total) * 100)

  const byType: Record<QuestionType, { correct: number; total: number }> = {
    XYZ: { correct: 0, total: 0 },
    KVA: { correct: 0, total: 0 },
    NOG: { correct: 0, total: 0 },
    DTK: { correct: 0, total: 0 },
    ORD: { correct: 0, total: 0 },
    LAS: { correct: 0, total: 0 },
    MEK: { correct: 0, total: 0 },
    ELF: { correct: 0, total: 0 },
  }
  sessionQuestions.forEach(q => {
    byType[q.type].total++
    if (session.answers[q.id] === q.answer) byType[q.type].correct++
  })

  const sectionedScore = estimateSectionedScore(byType)

  const duration = session.endTime ? Math.round((session.endTime - session.startTime) / 1000) : 0
  const fmtDuration = `${Math.floor(duration / 60)}m ${duration % 60}s`

  const scoreColor = pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'

  const TYPE_COLORS: Record<QuestionType, { text: string; bar: string }> = {
    XYZ: { text: 'text-violet-400',  bar: 'bg-violet-500'  },
    KVA: { text: 'text-blue-400',    bar: 'bg-blue-500'    },
    NOG: { text: 'text-emerald-400', bar: 'bg-emerald-500' },
    DTK: { text: 'text-amber-400',   bar: 'bg-amber-500'   },
    ORD: { text: 'text-rose-400',    bar: 'bg-rose-500'    },
    LAS: { text: 'text-pink-400',    bar: 'bg-pink-500'    },
    MEK: { text: 'text-fuchsia-400', bar: 'bg-fuchsia-500' },
    ELF: { text: 'text-purple-400',  bar: 'bg-purple-500'  },
  }

  const WARM_TYPE_COLORS: Record<QuestionType, { color: string; ring: string; bg: string }> = {
    XYZ: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
    KVA: { color: '#2563EB', ring: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    NOG: { color: '#224A3A', ring: '#224A3A', bg: 'rgba(34,74,58,0.08)' },
    DTK: { color: '#D97706', ring: '#D97706', bg: 'rgba(217,119,6,0.08)' },
    ORD: { color: '#DC2626', ring: '#DC2626', bg: 'rgba(220,38,38,0.08)' },
    LAS: { color: '#DB2777', ring: '#DB2777', bg: 'rgba(219,39,119,0.08)' },
    MEK: { color: '#9333EA', ring: '#9333EA', bg: 'rgba(147,51,234,0.08)' },
    ELF: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  }

  const ANSWER_KEYS: AnswerKey[] = ['A', 'B', 'C', 'D', 'E']

  const handleShare = async () => {
    const typeLines = (Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
      .filter(([, v]) => v.total > 0)
      .map(([t, v]) => `${t}: ${v.correct}/${v.total}`)
      .join(' · ')

    const { quant: qScore, verbal: vScore, combined: cScore } = sectionedScore
    const displayHpScore = cScore ?? 1.00
    const label = hpScoreLabel(displayHpScore)
    const sectionLine = qScore !== null && vScore !== null
      ? `Kvantitativ: ${qScore.toFixed(2)} · Verbal: ${vScore.toFixed(2)}`
      : null

    const text = [
      `HP Träning — ${new Date().toLocaleDateString('sv-SE')}`,
      `${correct}/${total} rätt (${pct}%) · ${fmtDuration}`,
      typeLines,
      sectionLine,
      `Estimerat betyg: ${displayHpScore.toFixed(2)} (${label})`,
      isNewBest ? '★ Nytt personbästa!' : '',
    ].filter(Boolean).join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: 'HP Träning — resultat', text })
        return
      } catch {
        // fall through to clipboard
      }
    }
    await navigator.clipboard.writeText(text)
    setShareFeedback('copied')
    setTimeout(() => setShareFeedback('idle'), 2000)
  }

  const xpProgress = xpInfo
    ? xpInfo.level.level === 10
      ? 100
      : Math.min(100, Math.round(
          ((xpInfo.stats.xp - xpInfo.level.currentLevelXp) /
            (xpInfo.level.nextLevelXp - xpInfo.level.currentLevelXp)) * 100
        ))
    : 0

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {newAchievements.length > 0 && (
        <AchievementToast newIds={newAchievements} onDone={() => setNewAchievements([])} />
      )}

      {/* ── Hero ─────────────────────────────────── */}
      <div className="bg-[var(--color-green)] px-4 pt-16 pb-10 flex flex-col items-center relative">
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white/90 transition-colors"
        >
          {shareFeedback === 'copied' ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Kopierat!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
              Dela
            </>
          )}
        </button>

        {isNewBest && (
          <div className="inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-[11px] font-bold tracking-wide uppercase px-3 py-1 rounded-full mb-3">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>
            Nytt personbästa!
          </div>
        )}

        <p className="text-xs uppercase tracking-[0.15em] text-white/60 font-[var(--font-sans)] mb-4">Resultat</p>

        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" stroke="rgba(255,255,255,0.15)" strokeWidth="8" fill="none" />
          <circle
            cx="60" cy="60" r="52"
            stroke="white" strokeWidth="8" fill="none"
            strokeLinecap="round"
            strokeDasharray="326.73"
            strokeDashoffset={326.73 * (1 - pct / 100)}
            transform="rotate(-90 60 60)"
          />
          <text
            x="60" y="60"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="22"
            fontFamily="var(--font-serif)"
            fontWeight="bold"
          >
            {pct}%
          </text>
        </svg>

        <div className="text-4xl font-[var(--font-serif)] text-white mt-4">{pct}%</div>
        <div className="text-base text-white/70">{correct} av {total} rätt</div>
      </div>

      {/* ── Three-stat strip ─────────────────────── */}
      <div className="bg-[var(--color-green-light)] px-4 py-4">
        <div className="grid grid-cols-3 divide-x divide-white/20 max-w-2xl mx-auto">
          <div className="flex flex-col items-center py-1">
            <span className="text-xs text-white/60">Rätt svar</span>
            <span className="text-lg font-semibold text-white">{correct}</span>
          </div>
          <div className="flex flex-col items-center py-1">
            <span className="text-xs text-white/60">Tid</span>
            <span className="text-lg font-semibold text-white">
              {String(Math.floor(duration / 60)).padStart(2, '0')}:{String(duration % 60).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col items-center py-1">
            <span className="text-xs text-white/60">Streak</span>
            <span className="text-lg font-semibold text-white flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-orange-400">
                <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.39 1.05-4.55 2.86-6.12C7.1 7.77 8 6.15 8 4.25c0-.41.34-.75.75-.75.19 0 .37.07.5.2C10.68 5.16 11.5 6.77 11.5 8.5c0 .69-.14 1.35-.39 1.94C11.85 10.17 12.5 9.33 12.5 8c0-.32.2-.61.5-.72.29-.11.62-.03.84.2C15.23 9.18 16.5 11.09 16.5 13c0 .78-.16 1.52-.43 2.2.75-.62 1.2-1.48 1.3-2.4.04-.36.27-.67.61-.79.33-.12.7-.03.93.23C20.22 13.96 21 15.9 21 17.5c0 3.03-4.03 5.5-9 5.5z"/>
              </svg>
              {xpInfo?.stats.streak ?? '—'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-paper)] px-4 pt-6 pb-28">
        <div className="max-w-2xl mx-auto">

        {/* ── Streak achievement card ──────────────── */}
        {xpInfo?.streakIncreased && (
          <div className="card p-4 mb-4" style={{ borderLeft: '4px solid var(--color-terracotta)' }}>
            <div className="flex items-center gap-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--color-terracotta)] shrink-0">
                <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.39 1.05-4.55 2.86-6.12C7.1 7.77 8 6.15 8 4.25c0-.41.34-.75.75-.75.19 0 .37.07.5.2C10.68 5.16 11.5 6.77 11.5 8.5c0 .69-.14 1.35-.39 1.94C11.85 10.17 12.5 9.33 12.5 8c0-.32.2-.61.5-.72.29-.11.62-.03.84.2C15.23 9.18 16.5 11.09 16.5 13c0 .78-.16 1.52-.43 2.2.75-.62 1.2-1.48 1.3-2.4.04-.36.27-.67.61-.79.33-.12.7-.03.93.23C20.22 13.96 21 15.9 21 17.5c0 3.03-4.03 5.5-9 5.5z"/>
              </svg>
              <div>
                <div className="font-semibold text-[var(--color-ink)]">Streak! {xpInfo.stats.streak} dagar i rad</div>
                <div className="text-sm text-[var(--color-ink-faint)]">Fortsätt så — du bygger upp en fin vana!</div>
              </div>
            </div>
          </div>
        )}

        {/* ── Action buttons ───────────────────────── */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => navigate('/practice')} className="btn-primary flex-1">Öva igen</button>
          <button onClick={() => navigate('/')} className="btn-ghost flex-1">Hem</button>
        </div>

        {/* XP earned card */}
        {xpInfo && (
          <div className={`mb-6 transition-all duration-500 ${cardVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            {xpInfo.leveledUp && (
              <div className="bg-amber-500/20 border border-amber-500 rounded-xl px-4 py-3 mb-3 text-center">
                <span className="text-amber-400 font-bold">⭐ Ny nivå uppnådd! Nivå {xpInfo.level.level} — {xpInfo.level.label}</span>
              </div>
            )}
            <div className="card border border-blue-200 rounded-2xl p-5">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black text-blue-700">+{xpInfo.earned} XP</span>
                <span className="text-[var(--color-ink-muted)] text-sm">intjänat</span>
              </div>
              <div className="space-y-0.5 mb-4 text-sm text-[var(--color-ink-muted)]">
                {xpInfo.easy > 0 && (
                  <div>{xpInfo.easy} lätt × 10 = <span className="text-[var(--color-ink)]">{xpInfo.easy * 10} XP</span></div>
                )}
                {xpInfo.medium > 0 && (
                  <div>{xpInfo.medium} medel × 15 = <span className="text-[var(--color-ink)]">{xpInfo.medium * 15} XP</span></div>
                )}
                {xpInfo.hard > 0 && (
                  <div>{xpInfo.hard} svår × 25 = <span className="text-[var(--color-ink)]">{xpInfo.hard * 25} XP</span></div>
                )}
                <div>Sessionbonus = <span className="text-[var(--color-ink)]">20 XP</span></div>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)] mb-1.5">
                <span>Nivå {xpInfo.level.level} — {xpInfo.level.label}</span>
                {xpInfo.level.level < 10 && (
                  <span>
                    {xpInfo.stats.xp - xpInfo.level.currentLevelXp} / {xpInfo.level.nextLevelXp - xpInfo.level.currentLevelXp} XP
                  </span>
                )}
              </div>
              <div className="h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                  style={{ width: `${xpProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* HP Score Predictor */}
        {(() => {
          const { quant, verbal, combined } = sectionedScore
          const hasBoth = quant !== null && verbal !== null
          const displayScore = combined ?? 1.00
          const hpColor = hpScoreColor(displayScore)
          const hpLabel = hpScoreLabel(displayScore)
          const hpPct = ((displayScore - 1.00) / 1.00) * 100
          return (
            <div className="card border border-[var(--color-card-border)] rounded-2xl p-5 mb-6">
              <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-3">Estimerat HP-betyg</div>

              {hasBoth && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-[var(--color-paper-dark)] rounded-xl p-3">
                    <div className="text-[9px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-1">Kvantitativ</div>
                    <div className={`text-2xl font-black ${hpScoreColor(quant!)}`}>{quant!.toFixed(2)}</div>
                  </div>
                  <div className="bg-[var(--color-paper-dark)] rounded-xl p-3">
                    <div className="text-[9px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-1">Verbal</div>
                    <div className={`text-2xl font-black ${hpScoreColor(verbal!)}`}>{verbal!.toFixed(2)}</div>
                  </div>
                </div>
              )}

              <div className="flex items-end gap-3 mb-3">
                <span className={`text-5xl font-black ${hpColor}`}>{displayScore.toFixed(2)}</span>
                <div>
                  <div className={`text-sm font-bold ${hpColor}`}>{hpLabel}</div>
                  {hasBoth && <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">kombinerat betyg</div>}
                </div>
              </div>
              <div className="h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${displayScore >= 1.80 ? 'bg-emerald-500' : displayScore >= 1.50 ? 'bg-blue-500' : displayScore >= 1.25 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${hpPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--color-ink-faint)]">
                <span>1.00</span><span>1.25</span><span>1.50</span><span>1.75</span><span>2.00</span>
              </div>
              <p className="text-[11px] text-[var(--color-ink-faint)] mt-2">Uppskattning baserad på normdata från tidigare HP-prov.</p>

              <button
                onClick={() => setShowScale(s => !s)}
                className="mt-3 text-[11px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] transition-colors flex items-center gap-1"
              >
                Betygsskala {showScale ? '▴' : '▾'}
              </button>

              {showScale && (
                <div className="mt-3 space-y-1.5 border-t border-[var(--color-card-border)] pt-3">
                  {([
                    { range: '1.85–2.00', label: 'Toppresultat', dot: 'bg-emerald-500', text: 'text-emerald-600' },
                    { range: '1.70–1.85', label: 'Väldigt bra',  dot: 'bg-emerald-600', text: 'text-emerald-700' },
                    { range: '1.50–1.70', label: 'Bra',           dot: 'bg-blue-500',   text: 'text-blue-600'   },
                    { range: '1.30–1.50', label: 'Godkänt',       dot: 'bg-amber-500',  text: 'text-amber-600'  },
                    { range: '1.00–1.30', label: 'Under medel',   dot: 'bg-red-500',    text: 'text-red-600'    },
                  ] as { range: string; label: string; dot: string; text: string }[]).map(band => {
                    const isCurrentBand = band.label === hpLabel
                    return (
                      <div key={band.range} className="flex items-center gap-2.5 text-xs">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${band.dot}${isCurrentBand ? ' ring-2 ring-[var(--color-card-border)]' : ''}`} />
                        <span className="text-[var(--color-ink-faint)] tabular-nums w-20 shrink-0">{band.range}</span>
                        <span className={isCurrentBand ? band.text + ' font-bold' : 'text-[var(--color-ink-faint)]'}>{band.label}</span>
                        {isCurrentBand && <span className="ml-auto text-[10px] text-[var(--color-ink-faint)]">← ditt resultat</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })()}

        {/* Full HP Day — pass 1 break card */}
        {session.fullDayPass === 1 && (
          <div className="card rounded-2xl p-5 mb-6 border border-indigo-200">
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Pass 1 klart — halvtid!</div>
            <h2 className="text-xl font-black mb-1">Dags för paus</h2>
            <p className="text-sm text-[var(--color-ink-muted)] mb-4 leading-relaxed">
              Ta 10–15 minuters paus. Drick vatten, sträck på dig. Starta sedan det kvantitativa passet när du är redo.
            </p>
            <div className="flex gap-3 mb-4 text-xs text-[var(--color-ink-faint)]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Verbalt klart</span>
              <span>·</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/40 border border-blue-500/50 inline-block" /> Kvantitativt återstår</span>
            </div>
            <button
              onClick={() => {
                const quantQs = getQuantExamQuestions()
                const s = buildSession(quantQs.map(q => q.id), 55 * 60, false, 'exam')
                saveSession({ ...s, examId: 'full-hp-pass2', fullDayPass: 2, fullDayGroupId: session.fullDayGroupId })
                navigate('/session', { replace: true })
              }}
              className="w-full bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl py-3 font-bold text-sm"
            >
              Starta kvantitativt pass →
            </button>
          </div>
        )}

        {/* Full HP Day — pass 2 combined score */}
        {session.fullDayPass === 2 && (() => {
          const history = loadHistory()
          const pass1 = history.find(s => s.fullDayGroupId === session.fullDayGroupId && s.fullDayPass === 1)
          if (!pass1) return null
          const pass1Qs = pass1.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as typeof questions
          const combinedByType: Record<QuestionType, { correct: number; total: number }> = {
            XYZ: { correct: 0, total: 0 }, KVA: { correct: 0, total: 0 },
            NOG: { correct: 0, total: 0 }, DTK: { correct: 0, total: 0 },
            ORD: { correct: 0, total: 0 }, LAS: { correct: 0, total: 0 },
            MEK: { correct: 0, total: 0 }, ELF: { correct: 0, total: 0 },
          }
          pass1Qs.forEach(q => {
            combinedByType[q.type].total++
            if (pass1.answers[q.id] === q.answer) combinedByType[q.type].correct++
          })
          sessionQuestions.forEach(q => {
            combinedByType[q.type].total++
            if (session.answers[q.id] === q.answer) combinedByType[q.type].correct++
          })
          const combinedScore = estimateSectionedScore(combinedByType)
          const combinedTotal = pass1Qs.length + sessionQuestions.length
          const combinedCorrect = pass1Qs.filter(q => pass1.answers[q.id] === q.answer).length +
            sessionQuestions.filter(q => session.answers[q.id] === q.answer).length
          const combinedPct = Math.round((combinedCorrect / combinedTotal) * 100)
          const { quant, verbal, combined } = combinedScore
          const displayScore = combined ?? 1.00
          return (
            <div className="card rounded-2xl p-5 mb-6 border border-indigo-200">
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Komplett HP-dag — sammanlagt resultat</div>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-[var(--color-paper-dark)] rounded-xl p-3 text-center">
                  <div className="text-[9px] font-black tracking-widest uppercase text-rose-600 mb-1">Verbalt</div>
                  <div className={`text-2xl font-black ${verbal !== null ? hpScoreColor(verbal) : 'text-[var(--color-ink-faint)]'}`}>
                    {verbal !== null ? verbal.toFixed(2) : '—'}
                  </div>
                </div>
                <div className="bg-[var(--color-paper-dark)] rounded-xl p-3 text-center">
                  <div className="text-[9px] font-black tracking-widest uppercase text-blue-600 mb-1">Kvant.</div>
                  <div className={`text-2xl font-black ${quant !== null ? hpScoreColor(quant) : 'text-[var(--color-ink-faint)]'}`}>
                    {quant !== null ? quant.toFixed(2) : '—'}
                  </div>
                </div>
                <div className="bg-[var(--color-paper-dark)] rounded-xl p-3 text-center border border-indigo-200">
                  <div className="text-[9px] font-black tracking-widest uppercase text-indigo-600 mb-1">Totalt</div>
                  <div className={`text-2xl font-black ${hpScoreColor(displayScore)}`}>{displayScore.toFixed(2)}</div>
                </div>
              </div>
              <div className="text-xs text-[var(--color-ink-faint)] text-center">{combinedCorrect}/{combinedTotal} rätt ({combinedPct}%) totalt · {hpScoreLabel(displayScore)}</div>
            </div>
          )
        })()}

        {/* Per delprovstyp */}
        <div className="mb-8">
          <div className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">Per delprovstyp</div>
          {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
            .filter(([, v]) => v.total > 0)
            .map(([type, v]) => {
              const p = Math.round((v.correct / v.total) * 100)
              const accent = WARM_TYPE_COLORS[type]
              return (
                <div key={type} className="card p-3 mb-2 flex items-center gap-3">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: accent.bg, color: accent.color }}
                  >
                    {type}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--color-paper-dark)] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${p}%`, backgroundColor: accent.ring }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-ink)] shrink-0 w-10 text-right">{p}%</span>
                </div>
              )
            })}
        </div>

        {/* Time analysis */}
        {Object.keys(session.questionTimes ?? {}).length >= 3 && (() => {
          const qtimes = session.questionTimes!
          const timedQs = sessionQuestions.filter(q => qtimes[q.id] !== undefined)
          const overallAvgSecs = Math.round(
            timedQs.reduce((s, q) => s + qtimes[q.id], 0) / timedQs.length / 1000
          )
          const BENCHMARKS: Record<QuestionType, number> = { XYZ: 60, KVA: 60, NOG: 100, DTK: 115, ORD: 45, LAS: 120, MEK: 50, ELF: 120 }
          const typeAvgs: Partial<Record<QuestionType, number>> = {}
          ;(['XYZ', 'KVA', 'NOG', 'DTK', 'ORD', 'LAS', 'MEK', 'ELF'] as QuestionType[]).forEach(t => {
            const tqs = timedQs.filter(q => q.type === t)
            if (tqs.length > 0)
              typeAvgs[t] = Math.round(tqs.reduce((s, q) => s + qtimes[q.id], 0) / tqs.length / 1000)
          })
          const slowest = [...timedQs]
            .sort((a, b) => qtimes[b.id] - qtimes[a.id])
            .slice(0, 3)
          const fmtSecs = (s: number) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
          return (
            <div className="card rounded-2xl p-5 mb-6">
              <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-4">Tidanalys</div>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-black text-[var(--color-ink)]">{fmtSecs(overallAvgSecs)}</span>
                <span className="text-xs text-[var(--color-ink-faint)]">per fråga i snitt</span>
              </div>
              <div className="space-y-2 mb-4">
                {(Object.entries(typeAvgs) as [QuestionType, number][]).map(([t, avg]) => {
                  const bench = BENCHMARKS[t]
                  const pct = Math.min(100, Math.round((avg / (bench * 1.5)) * 100))
                  const overBudget = avg > bench
                  const tc = TYPE_COLORS[t]
                  return (
                    <div key={t} className="flex items-center gap-3">
                      <span className={`text-[10px] font-black w-8 shrink-0 ${tc.text}`}>{t}</span>
                      <div className="flex-1 h-1.5 bg-[var(--color-paper-dark)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${overBudget ? 'bg-red-500' : tc.bar}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={`text-xs font-mono tabular-nums w-12 text-right ${overBudget ? 'text-red-600' : 'text-[var(--color-ink-muted)]'}`}>
                        {fmtSecs(avg)}
                      </span>
                      <span className="text-[10px] text-[var(--color-ink-faint)] w-12 shrink-0">/ {fmtSecs(bench)}</span>
                    </div>
                  )
                })}
              </div>
              {slowest.length > 0 && (
                <div className="border-t border-[var(--color-card-border)] pt-3">
                  <div className="text-[10px] text-[var(--color-ink-faint)] uppercase tracking-widest mb-2">Långsammaste frågor</div>
                  <div className="space-y-1.5">
                    {slowest.map(q => (
                      <div key={q.id} className="flex items-center gap-2 text-xs">
                        <span className={`font-black w-8 shrink-0 ${TYPE_COLORS[q.type].text}`}>{q.type}</span>
                        <span className="flex-1 text-[var(--color-ink-muted)] truncate"><MathText text={q.text.split('\n')[0].replace(/\*\*/g, '')} /></span>
                        <span className="font-mono text-red-600 shrink-0">{fmtSecs(Math.round(qtimes[q.id] / 1000))}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* Difficulty breakdown */}
        {(['easy', 'medium', 'hard'] as const).some(d => sessionQuestions.some(q => q.difficulty === d)) && (() => {
          const diffData = (['easy', 'medium', 'hard'] as const).map(d => {
            const dqs = sessionQuestions.filter(q => q.difficulty === d)
            const correct = dqs.filter(q => session.answers[q.id] === q.answer).length
            return { d, total: dqs.length, correct }
          }).filter(x => x.total > 0)
          const DIFF_LABELS = { easy: 'Lätt', medium: 'Medel', hard: 'Svår' }
          const DIFF_COLORS = { easy: 'text-emerald-400 bg-emerald-500', medium: 'text-amber-400 bg-amber-500', hard: 'text-red-400 bg-red-500' }
          return (
            <div className="card rounded-2xl p-5 mb-6">
              <div className="text-[10px] font-black tracking-widest uppercase text-[var(--color-ink-faint)] mb-4">Resultat per svårighetsgrad</div>
              <div className="grid grid-cols-3 gap-3">
                {diffData.map(({ d, total, correct }) => {
                  const pct = Math.round((correct / total) * 100)
                  const [textCls, barCls] = DIFF_COLORS[d].split(' ')
                  return (
                    <div key={d} className="bg-[var(--color-paper-dark)] rounded-xl p-3 text-center">
                      <div className={`text-[10px] font-black uppercase tracking-wide mb-1 ${textCls}`}>{DIFF_LABELS[d]}</div>
                      <div className="text-xl font-black text-[var(--color-ink)]">{pct}%</div>
                      <div className="text-[10px] text-[var(--color-ink-faint)] mt-0.5">{correct}/{total}</div>
                      <div className="mt-2 h-1 bg-[var(--color-paper)] rounded-full overflow-hidden">
                        <div className={`h-full ${barCls} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Exam-specific report */}
        {session.type === 'exam' && (() => {
          const timestamps = session.sectionTimestamps ?? {}

          // Compute actual time per section (ms)
          const sectionStarts: Record<string, number> = {
            XYZ: session.startTime,
            KVA: timestamps.KVA ?? 0,
            NOG: timestamps.NOG ?? 0,
            DTK: timestamps.DTK ?? 0,
          }
          const sectionEnds: Record<string, number> = {
            XYZ: timestamps.KVA ?? session.endTime ?? 0,
            KVA: timestamps.NOG ?? session.endTime ?? 0,
            NOG: timestamps.DTK ?? session.endTime ?? 0,
            DTK: session.endTime ?? 0,
          }
          const fmtMin = (ms: number) => {
            if (!ms) return '—'
            const secs = Math.round(ms / 1000)
            return `${Math.floor(secs / 60)}m ${secs % 60}s`
          }

          // Tag accuracy for "Vad du bör öva mer på"
          const tagMap: Record<string, { correct: number; total: number }> = {}
          sessionQuestions.forEach(q => {
            const ok = session.answers[q.id] === q.answer
            q.tags.forEach(tag => {
              if (!tagMap[tag]) tagMap[tag] = { correct: 0, total: 0 }
              tagMap[tag].total++
              if (ok) tagMap[tag].correct++
            })
          })
          const weakTags = Object.entries(tagMap)
            .filter(([, v]) => v.total >= 1)
            .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
            .slice(0, 3)

          return (
            <>
              {/* Section breakdown table */}
              <div className="mb-8">
                <h2 className="text-xl font-black mb-4">Avsnittsresultat</h2>
                <div className="card rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-card-border)] text-[var(--color-ink-muted)] text-xs uppercase tracking-wide">
                        <th className="text-left px-4 py-3">Avsnitt</th>
                        <th className="text-right px-4 py-3">Rätt</th>
                        <th className="text-right px-4 py-3">Resultat</th>
                        <th className="text-right px-4 py-3 hidden sm:table-cell">Rekomm.</th>
                        <th className="text-right px-4 py-3 hidden sm:table-cell">Din tid</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SECTION_ORDER.filter(type => byType[type].total > 0).map(type => {
                        const v = byType[type]
                        const p = Math.round((v.correct / v.total) * 100)
                        const meta = SECTION_META[type]
                        const actualMs = sectionEnds[type] - sectionStarts[type]
                        const hasTime = sectionStarts[type] > 0 && sectionEnds[type] > 0
                        return (
                          <tr key={type} className="border-b border-[var(--color-card-border)] last:border-0">
                            <td className="px-4 py-3">
                              <span className="font-black text-sm">{type}</span>
                              <span className="text-[var(--color-ink-faint)] text-xs ml-2 hidden sm:inline">{meta?.description}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--color-ink-muted)]">{v.correct}/{v.total}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`font-bold ${p >= HP_AVERAGES[type] ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {p}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--color-ink-faint)] hidden sm:table-cell">
                              ~{meta?.recommendedMin}m
                            </td>
                            <td className="px-4 py-3 text-right text-[var(--color-ink-muted)] hidden sm:table-cell">
                              {hasTime ? fmtMin(actualMs) : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* HP average comparison */}
              <div className="card border border-[var(--color-card-border)] rounded-2xl p-5 mb-8">
                <h3 className="font-bold mb-3 text-sm uppercase tracking-widest text-[var(--color-ink-faint)]">Jämförelse med medel</h3>
                <div className="space-y-3">
                  {SECTION_ORDER.filter(type => byType[type].total > 0).map(type => {
                    const v = byType[type]
                    const p = Math.round((v.correct / v.total) * 100)
                    const avg = HP_AVERAGES[type]
                    const diff = p - avg
                    return (
                      <div key={type} className="flex items-center gap-3">
                        <span className="w-10 text-xs font-black text-[var(--color-ink-faint)]">{type}</span>
                        <div className="flex-1 h-2 bg-[var(--color-paper-dark)] rounded-full overflow-hidden relative">
                          <div
                            className="absolute h-full bg-[var(--color-card-border)] rounded-full"
                            style={{ width: `${avg}%` }}
                          />
                          <div
                            className={`absolute h-full rounded-full transition-all ${p >= avg ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${p}%` }}
                          />
                        </div>
                        <span className={`text-xs font-bold w-14 text-right ${diff >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {p}% {diff >= 0 ? `+${diff}` : diff}pp
                        </span>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-[var(--color-ink-faint)] mt-3">pp = procentenheter jämfört med HP-genomsnittet</p>
              </div>

              {/* Weakest topics */}
              {weakTags.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">
                  <h3 className="font-bold mb-3 text-amber-700">Vad du bör öva mer på</h3>
                  <ul className="space-y-2">
                    {weakTags.map(([tag, v]) => {
                      const p = Math.round((v.correct / v.total) * 100)
                      return (
                        <li key={tag} className="flex items-center justify-between text-sm">
                          <span className="text-[var(--color-ink-muted)] capitalize">{tag}</span>
                          <span className="text-amber-600 font-bold">{p}% ({v.correct}/{v.total})</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </>
          )
        })()}

        {/* Review */}
        <div className="text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-widest mb-3">Genomgång</div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => setReviewFilter('all')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'all' ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-[var(--color-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
          >
            Alla ({sessionQuestions.length})
          </button>
          <button
            onClick={() => setReviewFilter('wrong')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'wrong' ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-[var(--color-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
          >
            Fel ({sessionQuestions.filter(q => !skipped.includes(q.id) && session.answers[q.id] !== q.answer).length})
          </button>
          <button
            onClick={() => setReviewFilter('flagged')}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${reviewFilter === 'flagged' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-[var(--color-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
          >
            ★ Markerade ({(session.flagged ?? []).length})
          </button>
        </div>
        <div className="mb-8">
          {sessionQuestions.filter(q => {
            if (reviewFilter === 'wrong') return !skipped.includes(q.id) && session.answers[q.id] !== q.answer
            if (reviewFilter === 'flagged') return (session.flagged ?? []).includes(q.id)
            return true
          }).map((q, index) => {
            const isSkipped = skipped.includes(q.id)
            const userAnswer = session.answers[q.id]
            const ok = !isSkipped && userAnswer === q.answer
            const isFlagged = (session.flagged ?? []).includes(q.id)
            const expanded = expandedId === q.id
            const answerOptions = Object.entries(q.options).filter(([k]) =>
              ANSWER_KEYS.includes(k as AnswerKey)
            ) as [AnswerKey, string][]

            const questionTimeMs = session.questionTimes?.[q.id]
            const fmtQuestionTime = questionTimeMs
              ? questionTimeMs >= 60000
                ? `${Math.floor(questionTimeMs / 60000)}m ${Math.round((questionTimeMs % 60000) / 1000)}s`
                : `${Math.round(questionTimeMs / 1000)}s`
              : null

            const srs = getSrsStats(q.id)
            const srsPill = (() => {
              if (!srs) return null
              if (srs.timesWrong > srs.timesCorrect)
                return { label: 'Repeteras', cls: 'bg-red-500/10 text-red-500 border-red-500/40' }
              if (srs.timesCorrect >= 3 && ok)
                return { label: 'Kan detta', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/40' }
              return { label: 'Övar', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/40' }
            })()

            const accent = WARM_TYPE_COLORS[q.type]

            return (
              <div key={q.id} className="card p-3 mb-2">
                <button
                  onClick={() => setExpandedId(expanded ? null : q.id)}
                  className="w-full flex items-center gap-3 text-left"
                >
                  <div className="shrink-0 flex flex-col items-center gap-1 w-10">
                    <span className="text-[10px] text-[var(--color-ink-faint)]">#{index + 1}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: accent.bg, color: accent.color }}
                    >
                      {q.type}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 text-sm text-[var(--color-ink)] line-clamp-2">
                    <MathText text={q.text} />
                  </div>
                  {ok ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : isSkipped ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-ink-faint)] shrink-0">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap pl-[52px]">
                  <span className="text-[10px] text-[var(--color-ink-faint)]">{q.source}</span>
                  {isFlagged && <span className="text-amber-500 text-xs">★</span>}
                  {srsPill && (
                    <span className={`border rounded px-1.5 py-0.5 text-[10px] font-medium ${srsPill.cls}`}>
                      {srsPill.label}
                    </span>
                  )}
                  {fmtQuestionTime && (
                    <span className="border border-[var(--color-border)] rounded px-1.5 py-0.5 text-[10px] text-[var(--color-ink-faint)]">
                      ⏱ {fmtQuestionTime}
                    </span>
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      const next = toggleBookmark(q.id)
                      setBookmarkState(s => ({ ...s, [q.id]: next }))
                    }}
                    className={`border rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${bookmarkState[q.id] ? 'border-blue-600 text-blue-400 bg-blue-500/10' : 'border-[var(--color-border)] text-[var(--color-ink-faint)] hover:border-[var(--color-ink-muted)]'}`}
                  >
                    🔖 {bookmarkState[q.id] ? 'Sparat' : 'Spara'}
                  </button>
                </div>

                {expanded && (
                  <div className="bg-[var(--color-paper-dark)] rounded-xl p-3 mt-2">
                    <div className="grid gap-2">
                      {answerOptions.map(([key, text]) => {
                        let cls = 'border-[var(--color-border)] text-[var(--color-ink-faint)]'
                        let labelCls = 'bg-[var(--color-paper-dark)] text-[var(--color-ink-muted)]'
                        if (key === q.answer) { cls = 'border-emerald-500/60 text-[var(--color-ink)] bg-emerald-500/10'; labelCls = 'bg-emerald-600 text-white' }
                        if (key === userAnswer && key !== q.answer) { cls = 'border-red-500/60 text-[var(--color-ink)] bg-red-500/10'; labelCls = 'bg-red-600 text-white' }
                        return (
                          <div key={key} className={`border rounded-xl px-3 py-2.5 text-sm flex gap-3 items-start ${cls}`}>
                            <span className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${labelCls}`}>{key}</span>
                            <MathText text={text} />
                          </div>
                        )
                      })}
                    </div>
                    <ExplanationCard
                      isCorrect={!isSkipped && userAnswer === q.answer}
                      correctAnswer={q.answer}
                      explanation={q.explanation}
                      explanationData={q.explanationData}
                      chosenAnswer={userAnswer as AnswerKey | undefined}
                      onLearnMore={(isSkipped || userAnswer !== q.answer) ? (() => {
                        const topic = getTopicForQuestion(q.tags)
                        navigate(topic ? `/matematik?topic=${topic.id}&inner=lesson` : '/matematik')
                      }) : undefined}
                      learnMoreLabel={(isSkipped || userAnswer !== q.answer) ? (() => {
                        const topic = getTopicForQuestion(q.tags)
                        return topic ? `Lär dig ${topic.name}` : 'Öppna Matematikguiden'
                      })() : undefined}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Share card */}
        <div className="mb-6">
          <div className="text-xs font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Dela resultat</div>
          <div className="card border border-[var(--color-card-border)] rounded-2xl p-5">
            {/* Card preview */}
            <div id="share-card" className="bg-[var(--color-paper-dark)] rounded-xl p-5 border border-[var(--color-card-border)] mb-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-violet-600 rounded-md flex items-center justify-center">
                  <span className="text-[9px] font-black text-white">HP</span>
                </div>
                <span className="text-xs font-bold text-[var(--color-ink-faint)]">
                  HP Träning — {sectionedScore.quant !== null && sectionedScore.verbal !== null ? 'Fullständigt prov' : sectionedScore.verbal !== null ? 'Verbal del' : 'Kvantitativ del'}
                </span>
              </div>
              <div className="flex items-end gap-4 mb-3">
                <div className={`text-5xl font-black ${scoreColor}`}>{pct}%</div>
                <div>
                  <div className={`text-xl font-black ${hpScoreColor(sectionedScore.combined ?? 1.00)}`}>
                    {(sectionedScore.combined ?? 1.00).toFixed(2)}
                  </div>
                  <div className="text-xs text-[var(--color-ink-faint)]">{hpScoreLabel(sectionedScore.combined ?? 1.00)}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(Object.entries(byType) as [QuestionType, { correct: number; total: number }][])
                  .filter(([, v]) => v.total > 0)
                  .map(([type, v]) => {
                    const p = Math.round((v.correct / v.total) * 100)
                    return (
                      <div key={type} className="text-center">
                        <div className={`text-[10px] font-black ${TYPE_COLORS[type].text}`}>{type}</div>
                        <div className="text-sm font-bold text-[var(--color-ink)]">{p}%</div>
                      </div>
                    )
                  })}
              </div>
              <div className="text-[10px] text-[var(--color-ink-faint)]">{new Date().toLocaleDateString('sv-SE')}</div>
            </div>
            <p className="text-xs text-[var(--color-ink-faint)] text-center">Ta en skärmbild av kortet ovan för att dela ditt resultat</p>
          </div>
        </div>

        {(() => {
          const wrongIds = sessionQuestions
            .filter(q => !skipped.includes(q.id) && session.answers[q.id] !== q.answer)
            .map(q => q.id)
          if (wrongIds.length === 0) return null
          return (
            <button
              onClick={() => {
                const drill = buildSession(wrongIds, null, true, 'drill', true)
                saveSession(drill)
                navigate('/session')
              }}
              className="w-full mb-3 border border-amber-600/60 bg-amber-900/15 hover:bg-amber-900/30 text-amber-300 rounded-xl py-3 font-bold transition-colors"
            >
              Öva på {wrongIds.length} fel från detta pass →
            </button>
          )
        })()}

        </div>
      </div>
    </div>
  )
}
