import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadStats, getLevel, type GameStats } from '../utils/gamification'
import { loadHistory } from '../utils/session'

const DAILY_TARGET = 15

const DAILY_TAGLINES = [
  'Söndag är perfekt för en längre träningssession — ingen stress!',
  'Ny vecka, nya möjligheter. Sätt tonen med en träning idag!',
  'Håll farten uppe — varje dag räknas på vägen mot HP.',
  'Halvvägs i veckan — ett bra tillfälle att mäta dina framsteg.',
  'Torsdagskänslan: du är nära helgen, men målet är ännu närmare.',
  'Avsluta veckan starkt — en session nu ger dig ett försprång.',
  'Lördagsträning bygger lördagsresultat. Kör hårt!',
]

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
  }

  const [stats, setStats] = useState<GameStats | null>(null)
  const [todayCount, setTodayCount] = useState(0)

  useEffect(() => {
    setStats(loadStats())
    const today = new Date().toISOString().slice(0, 10)
    const count = loadHistory()
      .filter(s => new Date(s.startTime).toISOString().slice(0, 10) === today)
      .reduce((sum, s) => sum + Object.keys(s.answers).length, 0)
    setTodayCount(count)
  }, [])

  const tagline = DAILY_TAGLINES[new Date().getDay()]
  const goalReached = todayCount >= DAILY_TARGET
  const ringProgress = Math.min(1, todayCount / DAILY_TARGET)
  const ringOffset = RING_CIRCUMFERENCE * (1 - ringProgress)
  const hasActivity = stats && stats.xp > 0

  return (
    <div className="min-h-screen bg-hero-grid text-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <div className="inline-block bg-blue-600 text-white text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
            Högskoleprov
          </div>
          <h1 className="text-5xl font-black mb-3 tracking-tight">HP Träning</h1>
          <p className="text-slate-400 text-lg">Kvantitativ del — XYZ · KVA · NOG · DTK</p>
          <p className="text-slate-500 text-sm mt-2">{total} frågor · Verkliga HP-prov 2025–2026</p>
          <p className="text-slate-400 text-sm mt-3 italic">{tagline}</p>
        </div>

        {/* Dagens mål card */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 mb-6 flex items-center gap-5">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Dagens mål</div>
            <div className="text-lg font-bold mb-1">Öva {DAILY_TARGET} frågor idag</div>
            <div className={`text-sm ${goalReached ? 'text-green-400' : 'text-slate-400'}`}>
              {goalReached ? 'Mål uppnått för idag!' : `${DAILY_TARGET - todayCount} frågor kvar`}
            </div>
          </div>
          <div className="flex-shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72">
              <circle cx="36" cy="36" r={RING_R} fill="none" stroke="#334155" strokeWidth="6" />
              <circle
                cx="36" cy="36" r={RING_R}
                fill="none"
                stroke={goalReached ? '#4ade80' : '#60a5fa'}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
              <text x="36" y="34" textAnchor="middle" fill="white" fontSize="15" fontWeight="bold">
                {todayCount}
              </text>
              <text x="36" y="47" textAnchor="middle" fill="#94a3b8" fontSize="10">
                /{DAILY_TARGET}
              </text>
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {(Object.entries(byType) as [string, number][]).map(([type, count]) => (
            <div key={type} className="bg-slate-800/70 rounded-2xl p-5 border border-slate-700">
              <div className="text-2xl font-black text-blue-400">{type}</div>
              <div className="text-slate-400 text-sm mt-1">{count} frågor</div>
              <div className="text-xs text-slate-500 mt-1">
                {type === 'XYZ' && 'Matematisk problemlösning'}
                {type === 'KVA' && 'Kvantitativa jämförelser'}
                {type === 'NOG' && 'Kvantitativa resonemang'}
                {type === 'DTK' && 'Diagram, tabeller och kartor'}
              </div>
            </div>
          ))}
        </div>

        {/* Gamification stats bar */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 mb-6">
          {hasActivity && stats ? (
            (() => {
              const levelInfo = getLevel(stats.xp)
              const isMaxLevel = levelInfo.level === 10
              const xpInLevel = stats.xp - levelInfo.currentLevelXp
              const xpNeeded = isMaxLevel ? 1 : levelInfo.nextLevelXp - levelInfo.currentLevelXp
              const progressPct = isMaxLevel ? 100 : Math.min(100, Math.round((xpInLevel / xpNeeded) * 100))
              return (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-xl">🔥</span>
                      <span className="text-orange-400">
                        {stats.streak} {stats.streak === 1 ? 'dags' : 'dagars'} streak
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="text-xl">⭐</span>
                      <span className="text-yellow-400">
                        Nivå {levelInfo.level} — {levelInfo.label}
                      </span>
                    </div>
                    <div className="text-slate-400 text-sm ml-auto">
                      {stats.xp} XP
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>{isMaxLevel ? 'Max nivå uppnådd!' : `${xpInLevel} / ${xpNeeded} XP till nästa nivå`}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })()
          ) : (
            <p className="text-slate-500 text-sm text-center">
              Starta din första träning för att börja samla XP
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => navigate('/practice')}
            className="bg-blue-600 hover:bg-blue-500 transition-colors rounded-2xl p-6 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Börja öva</div>
                <div className="text-blue-200 text-sm mt-1">Välj delprov, tidsgräns och svarsläge</div>
              </div>
              <div className="text-3xl group-hover:translate-x-1 transition-transform">→</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/exam-select')}
            className="bg-slate-800/70 hover:bg-slate-700 transition-colors border border-slate-600 rounded-2xl p-6 text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xl font-bold">Simulera HP-prov</div>
                <div className="text-slate-400 text-sm mt-1">40 frågor · 4 avsnitt · 55 minuter</div>
              </div>
              <div className="text-3xl group-hover:translate-x-1 transition-transform text-slate-400">→</div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/theory')}
              className="bg-slate-800/70 hover:bg-slate-700 transition-colors border border-slate-700 rounded-2xl p-5 text-left group"
            >
              <div className="text-lg font-bold">Teori & Tips</div>
              <div className="text-slate-400 text-sm mt-1">Lär dig metoderna för varje delprov</div>
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="bg-slate-800/70 hover:bg-slate-700 transition-colors border border-slate-700 rounded-2xl p-5 text-left group"
            >
              <div className="text-lg font-bold">Min statistik</div>
              <div className="text-slate-400 text-sm mt-1">Resultat och framsteg</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
