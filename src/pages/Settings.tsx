import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { questions } from '../data/questions'
import { loadStats } from '../utils/gamification'
import { loadHistory } from '../utils/session'
import { getBookmarks } from '../utils/bookmarks'
import { getEarnedIds } from '../utils/achievements'

const KEYS = {
  srs:         'hp_srs',
  session:     'hp_current_session',
  history:     'hp_session_history',
  gamification:'hp_gamification',
  bookmarks:   'hp_bookmarks',
  achievements:'hp_achievements',
  onboarding:  'hp_onboarding_done',
  daily:       'hp_daily_done',
  examDate:    'hp_exam_date',
}

type Confirming = 'srs' | 'history' | 'bookmarks' | 'achievements' | 'all' | null

export default function Settings() {
  const navigate = useNavigate()
  const [confirming, setConfirming] = useState<Confirming>(null)
  const [done, setDone] = useState<string | null>(null)

  const stats = loadStats()
  const history = loadHistory()
  const bookmarks = getBookmarks()
  const earned = getEarnedIds()

  const flash = (msg: string) => {
    setDone(msg)
    setTimeout(() => setDone(null), 2500)
  }

  const confirm = (key: Confirming, action: () => void) => {
    if (confirming === key) {
      action()
      setConfirming(null)
    } else {
      setConfirming(key)
      setTimeout(() => setConfirming(null), 4000)
    }
  }

  const resetSrs = () => {
    localStorage.removeItem(KEYS.srs)
    flash('SRS-data rensad')
  }

  const resetHistory = () => {
    localStorage.removeItem(KEYS.history)
    localStorage.removeItem(KEYS.session)
    localStorage.removeItem(KEYS.gamification)
    flash('Träningshistorik och XP nollställda')
  }

  const resetBookmarks = () => {
    localStorage.removeItem(KEYS.bookmarks)
    flash('Bokmärken rensade')
  }

  const resetAchievements = () => {
    localStorage.removeItem(KEYS.achievements)
    flash('Brickor rensade')
  }

  const resetAll = () => {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k))
    flash('All data rensad — välkommen tillbaka!')
    setTimeout(() => navigate('/'), 1500)
  }

  const restartOnboarding = () => {
    localStorage.removeItem(KEYS.onboarding)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-black mb-8">Inställningar</h1>

        {done && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
            ✓ {done}
          </div>
        )}

        {/* Stats summary */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Din data</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-400">{stats.xp}</div>
              <div className="text-xs text-slate-400 mt-1">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-400">{stats.streak}</div>
              <div className="text-xs text-slate-400 mt-1">Dagars streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white">{history.length}</div>
              <div className="text-xs text-slate-400 mt-1">Träningspass</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-400">{earned.length}</div>
              <div className="text-xs text-slate-400 mt-1">Brickor</div>
            </div>
          </div>
        </div>

        {/* Reset options */}
        <div className="space-y-3 mb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Rensa data</div>

          <ResetRow
            label="Nollställ SRS-framsteg"
            description="Tar bort repetitionshistorik. Alla frågor börjar om från noll."
            badge={`${questions.length} frågor`}
            isConfirming={confirming === 'srs'}
            onPress={() => confirm('srs', resetSrs)}
          />

          <ResetRow
            label="Rensa träningshistorik & XP"
            description="Tar bort alla pass, XP och streak. Brickor behålls."
            badge={`${history.length} pass · ${stats.xp} XP`}
            isConfirming={confirming === 'history'}
            onPress={() => confirm('history', resetHistory)}
          />

          <ResetRow
            label="Rensa bokmärken"
            description="Tar bort alla sparade frågor."
            badge={`${bookmarks.length} bokmärken`}
            isConfirming={confirming === 'bookmarks'}
            onPress={() => confirm('bookmarks', resetBookmarks)}
          />

          <ResetRow
            label="Rensa brickor"
            description="Nollställer alla upplåsta achievements."
            badge={`${earned.length} upplåsta`}
            isConfirming={confirming === 'achievements'}
            onPress={() => confirm('achievements', resetAchievements)}
          />
        </div>

        {/* Onboarding */}
        <div className="mb-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Övrigt</div>
          <button
            onClick={restartOnboarding}
            className="w-full text-left bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-xl px-5 py-4 transition-colors"
          >
            <div className="font-semibold text-slate-200">Visa introduktion igen</div>
            <div className="text-xs text-slate-500 mt-1">Starta om välkomstguiden</div>
          </button>
        </div>

        {/* Nuclear reset */}
        <div className="border border-red-900/50 rounded-2xl p-5 bg-red-900/10">
          <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Farlig zon</div>
          <p className="text-sm text-slate-400 mb-4">Tar bort all data permanent — XP, historik, SRS, bokmärken och brickor.</p>
          <button
            onClick={() => confirm('all', resetAll)}
            className={`w-full rounded-xl py-3 font-bold text-sm transition-colors ${
              confirming === 'all'
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'border border-red-700 text-red-400 hover:bg-red-900/30'
            }`}
          >
            {confirming === 'all' ? '⚠️ Tryck igen för att bekräfta' : 'Återställ all data'}
          </button>
        </div>

        {/* App info */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-slate-600">HP Träning — Kvantitativ del</p>
          <p className="text-xs text-slate-600">{questions.length} frågor · Verkliga HP-prov 2025–2026</p>
        </div>
      </div>
    </div>
  )
}

function ResetRow({
  label, description, badge, isConfirming, onPress,
}: {
  label: string
  description: string
  badge: string
  isConfirming: boolean
  onPress: () => void
}) {
  return (
    <button
      onClick={onPress}
      className={`w-full text-left rounded-xl px-5 py-4 border transition-colors ${
        isConfirming
          ? 'border-amber-500 bg-amber-900/20'
          : 'border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-slate-200">{label}</div>
        <span className={`text-xs shrink-0 px-2 py-0.5 rounded-lg font-medium ${isConfirming ? 'text-amber-300 bg-amber-900/40' : 'text-slate-500 bg-slate-700'}`}>
          {isConfirming ? 'Tryck igen' : badge}
        </span>
      </div>
      <div className="text-xs text-slate-500 mt-1">{description}</div>
    </button>
  )
}
