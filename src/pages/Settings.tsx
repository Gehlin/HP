import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import { questions } from '../data/questions'
import { getFocusPreference, setFocusPreference, type FocusPreference } from '../utils/focusPreference'
import { loadStats } from '../utils/gamification'
import { loadHistory } from '../utils/session'
import { getBookmarks } from '../utils/bookmarks'
import { getEarnedIds } from '../utils/achievements'
import {
  notificationsSupported,
  notificationsEnabled,
  requestNotificationPermission,
  disableNotifications,
} from '../utils/notifications'

const KEYS = {
  srs:          'hp_srs',
  session:      'hp_current_session',
  history:      'hp_session_history',
  gamification: 'hp_gamification',
  bookmarks:    'hp_bookmarks',
  achievements: 'hp_achievements',
  onboarding:   'hp_onboarding_done',
  daily:        'hp_daily_done',
  examDate:     'hp_exam_date',
  notifEnabled: 'hp_notif_enabled',
  notifLastShown: 'hp_notif_last_shown',
}

const ALL_KEYS = Object.values(KEYS)

type Confirming = 'srs' | 'history' | 'bookmarks' | 'achievements' | 'all' | null

function exportData(): void {
  const data: Record<string, unknown> = {}
  ALL_KEYS.forEach(k => {
    const v = localStorage.getItem(k)
    if (v !== null) {
      try { data[k] = JSON.parse(v) } catch { data[k] = v }
    }
  })
  const payload = JSON.stringify({ version: 1, exported: new Date().toISOString(), data }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `hp-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function Settings() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [confirming, setConfirming] = useState<Confirming>(null)
  const [done, setDone] = useState<string | null>(null)
  const [notifOn, setNotifOn] = useState(() => notificationsEnabled())
  const [focus, setFocus] = useState<FocusPreference | null>(() => getFocusPreference())

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

  const resetSrs = () => { localStorage.removeItem(KEYS.srs); flash('SRS-data rensad') }
  const resetHistory = () => {
    ;[KEYS.history, KEYS.session, KEYS.gamification].forEach(k => localStorage.removeItem(k))
    flash('Träningshistorik och XP nollställda')
  }
  const resetBookmarks = () => { localStorage.removeItem(KEYS.bookmarks); flash('Bokmärken rensade') }
  const resetAchievements = () => { localStorage.removeItem(KEYS.achievements); flash('Brickor rensade') }
  const resetAll = () => {
    ALL_KEYS.forEach(k => localStorage.removeItem(k))
    flash('All data rensad — välkommen tillbaka!')
    setTimeout(() => navigate('/'), 1500)
  }

  const handleImport = (file: File) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target?.result as string)
        if (!json.data || typeof json.data !== 'object') throw new Error()
        Object.entries(json.data).forEach(([k, v]) => {
          if (ALL_KEYS.includes(k)) localStorage.setItem(k, JSON.stringify(v))
        })
        flash('Data importerad!')
        setTimeout(() => window.location.reload(), 1200)
      } catch {
        flash('Fel: ogiltig backupfil')
      }
    }
    reader.readAsText(file)
  }

  const toggleNotifications = async () => {
    if (notifOn) {
      disableNotifications()
      setNotifOn(false)
    } else {
      const granted = await requestNotificationPermission()
      setNotifOn(granted)
      if (!granted) flash('Notiser blockerade av webbläsaren')
    }
  }

  return (
    <div className="min-h-screen bg-app text-[var(--color-ink)] pt-topnav pb-24">
      <PageHeader title="Inställningar" />
      <div className="max-w-2xl mx-auto px-6 py-6">

        {done && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[400] bg-emerald-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg animate-fade-in">
            ✓ {done}
          </div>
        )}

        {/* Stats summary */}
        <div className="card rounded-2xl p-6 mb-6">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-4">Din data</div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-black text-blue-600">{stats.xp}</div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-1">XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-orange-600">{stats.streak}</div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-1">Dagars streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-[var(--color-ink)]">{history.length}</div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-1">Träningspass</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-600">{earned.length}</div>
              <div className="text-xs text-[var(--color-ink-muted)] mt-1">Brickor</div>
            </div>
          </div>
        </div>

        {/* Backup & restore */}
        <div className="mb-8">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Säkerhetskopiering</div>
          <div className="space-y-3">
            <button
              onClick={exportData}
              className="w-full text-left card hover:bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-5 py-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--color-ink)]">Exportera data</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Laddar ner en JSON-fil med all din data</div>
                </div>
                <span className="text-[var(--color-ink-muted)] text-lg shrink-0">⬇</span>
              </div>
            </button>

            <button
              onClick={() => fileRef.current?.click()}
              className="w-full text-left card hover:bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-5 py-4 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--color-ink)]">Importera data</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">Återställ från en tidigare exporterad fil</div>
                </div>
                <span className="text-[var(--color-ink-muted)] text-lg shrink-0">⬆</span>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }}
            />
          </div>
        </div>

        {/* Notifications */}
        {notificationsSupported() && (
          <div className="mb-8">
            <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Notiser</div>
            <button
              onClick={toggleNotifications}
              className="w-full text-left card hover:bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-5 py-4 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-[var(--color-ink)]">Påminnelser om repetition</div>
                  <div className="text-xs text-[var(--color-ink-faint)] mt-1">
                    {Notification.permission === 'denied'
                      ? 'Blockerade av webbläsaren — ändra i webbläsarinställningarna'
                      : 'Visa en systemnotis när du har frågor att repetera'}
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full transition-colors flex items-center shrink-0 ${notifOn ? 'bg-blue-600' : 'bg-[var(--color-paper-dark)]'} ${Notification.permission === 'denied' ? 'opacity-40' : ''}`}>
                  <div className={`w-4 h-4 rounded-full bg-white mx-1 transition-transform ${notifOn ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Reset options */}
        <div className="space-y-3 mb-8">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Rensa data</div>

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

        {/* Focus preference */}
        <div className="mb-8">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Träningsfokus</div>
          <div className="card rounded-xl p-4 border border-[var(--color-card-border)]">
            <div className="text-sm font-semibold text-[var(--color-ink)] mb-1">Vad vill du fokusera på?</div>
            <div className="text-xs text-[var(--color-ink-faint)] mb-3">Styr startsidan och rekommendationer</div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'quant' as FocusPreference, label: 'Kvantitativt', sub: 'XYZ·KVA·NOG·DTK', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                { value: 'verbal' as FocusPreference, label: 'Verbalt', sub: 'ORD·LÄS·MEK·ELF', color: 'border-rose-400 bg-rose-50 text-rose-700' },
                { value: 'both' as FocusPreference, label: 'Hela provet', sub: 'Alla 8 delproven', color: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { setFocusPreference(opt.value); setFocus(opt.value); flash('Fokus uppdaterat') }}
                  className={`rounded-xl px-2 py-3 text-center border transition-all ${focus === opt.value ? opt.color : 'border-[var(--color-card-border)] bg-[var(--color-paper)] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-dark)]'}`}
                >
                  <div className={`text-xs font-black ${focus === opt.value ? '' : 'text-[var(--color-ink-muted)]'}`}>{opt.label}</div>
                  <div className="text-[9px] mt-0.5 opacity-70">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Misc */}
        <div className="mb-8">
          <div className="text-[10px] font-bold text-[var(--color-ink-faint)] uppercase tracking-widest mb-3">Övrigt</div>
          <button
            onClick={() => { localStorage.removeItem(KEYS.onboarding); window.location.href = '/' }}
            className="w-full text-left card hover:bg-[var(--color-paper-dark)] border border-[var(--color-card-border)] rounded-xl px-5 py-4 transition-colors"
          >
            <div className="font-semibold text-[var(--color-ink)]">Visa introduktion igen</div>
            <div className="text-xs text-[var(--color-ink-faint)] mt-1">Starta om välkomstguiden</div>
          </button>
        </div>

        {/* Nuclear reset */}
        <div className="border border-red-200 rounded-2xl p-5 bg-red-50">
          <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Farlig zon</div>
          <p className="text-sm text-[var(--color-ink-muted)] mb-4">Tar bort all data permanent — XP, historik, SRS, bokmärken och brickor.</p>
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

        <div className="mt-8 text-center space-y-1">
          <p className="text-xs text-[var(--color-ink-faint)]">HP Träning — Kvantitativt &amp; Verbalt</p>
          <p className="text-xs text-[var(--color-ink-faint)]">{questions.length} frågor · Verkliga HP-prov 2025–2026</p>
        </div>
      </div>
    </div>
  )
}

function ResetRow({ label, description, badge, isConfirming, onPress }: {
  label: string; description: string; badge: string; isConfirming: boolean; onPress: () => void
}) {
  return (
    <button
      onClick={onPress}
      className={`w-full text-left rounded-xl px-5 py-4 border transition-colors ${
        isConfirming
          ? 'border-amber-500 bg-amber-50'
          : 'border-[var(--color-card-border)] card hover:bg-[var(--color-paper-dark)]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold text-[var(--color-ink)]">{label}</div>
        <span className={`text-xs shrink-0 px-2 py-0.5 rounded-lg font-medium ${isConfirming ? 'text-amber-700 bg-amber-100' : 'text-[var(--color-ink-faint)] bg-[var(--color-paper-dark)]'}`}>
          {isConfirming ? 'Tryck igen' : badge}
        </span>
      </div>
      <div className="text-xs text-[var(--color-ink-faint)] mt-1">{description}</div>
    </button>
  )
}
