import { questions } from '../data/questions'
import { loadHistory } from './session'
import { loadStats } from './gamification'
import { getStats as getSrsStats } from './srs'
import { getBookmarks } from './bookmarks'
import { estimateHpScore } from './hpScore'

const STORAGE_KEY = 'hp_achievements'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  rarity: 'bronze' | 'silver' | 'gold' | 'platinum'
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_session',   title: 'Igångsättaren',    icon: '🚀', rarity: 'bronze',   description: 'Genomför ditt första träningspass' },
  { id: 'streak_3',        title: 'Tre i rad',        icon: '🔥', rarity: 'bronze',   description: '3 dagars träningsstreak' },
  { id: 'streak_7',        title: 'Veckovinnaren',    icon: '🔥', rarity: 'silver',   description: '7 dagars träningsstreak' },
  { id: 'streak_30',       title: 'Månadshjälten',    icon: '🔥', rarity: 'gold',     description: '30 dagars träningsstreak' },
  { id: 'sessions_10',     title: 'Tioaren',          icon: '📚', rarity: 'bronze',   description: '10 genomförda träningspass' },
  { id: 'sessions_50',     title: 'HP-veteran',       icon: '📚', rarity: 'silver',   description: '50 genomförda träningspass' },
  { id: 'sessions_100',    title: 'Legenden',         icon: '📚', rarity: 'gold',     description: '100 genomförda träningspass' },
  { id: 'perfect_session', title: 'Perfekt pass',     icon: '⭐', rarity: 'silver',   description: '100% rätt i ett pass med minst 5 frågor' },
  { id: 'hp_150',          title: 'Halvvägs till toppen', icon: '📈', rarity: 'bronze', description: 'Uppnå estimerat HP-betyg 1.50 i ett pass' },
  { id: 'hp_175',          title: 'Välbetyg',         icon: '📈', rarity: 'silver',   description: 'Uppnå estimerat HP-betyg 1.75 i ett pass' },
  { id: 'hp_190',          title: 'Toppresultat',     icon: '🏆', rarity: 'gold',     description: 'Uppnå estimerat HP-betyg 1.90 i ett pass' },
  { id: 'hp_200',          title: 'HP-mästaren',      icon: '👑', rarity: 'platinum', description: 'Uppnå estimerat HP-betyg 2.00 i ett pass' },
  { id: 'mastered_10',     title: 'Memoreraren',      icon: '🧠', rarity: 'bronze',   description: '10 bemästrade frågor (SRS ≥21 dagar)' },
  { id: 'mastered_50',     title: 'Kunskapsbanken',   icon: '🧠', rarity: 'silver',   description: '50 bemästrade frågor' },
  { id: 'mastered_100',    title: 'Encyklopedin',     icon: '🧠', rarity: 'gold',     description: '100 bemästrade frågor' },
  { id: 'bookmarks_10',    title: 'Bokmärkaren',      icon: '🔖', rarity: 'bronze',   description: 'Spara 10 bokmärkta frågor' },
  { id: 'allrounder',      title: 'Allrounder',       icon: '🎯', rarity: 'gold',     description: '≥70% i alla 4 delproven i ett och samma pass' },
  { id: 'speed_demon',     title: 'Hastighetsguden',  icon: '⚡', rarity: 'silver',   description: 'Svara snabbare än HP-standard i alla typer' },
]

export function getEarnedIds(): string[] {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as string[]
}

function earn(id: string): void {
  const current = getEarnedIds()
  if (!current.includes(id)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, id]))
  }
}

// Returns newly unlocked achievement IDs after checking current state
export function checkAchievements(): string[] {
  const history = loadHistory()
  const stats = loadStats()
  const earned = new Set(getEarnedIds())
  const newlyEarned: string[] = []

  const unlock = (id: string) => {
    if (!earned.has(id)) {
      earn(id)
      earned.add(id)
      newlyEarned.push(id)
    }
  }

  // first_session
  if (history.length >= 1) unlock('first_session')

  // streak
  if (stats.streak >= 3)  unlock('streak_3')
  if (stats.streak >= 7)  unlock('streak_7')
  if (stats.streak >= 30) unlock('streak_30')

  // session counts
  if (history.length >= 10)  unlock('sessions_10')
  if (history.length >= 50)  unlock('sessions_50')
  if (history.length >= 100) unlock('sessions_100')

  // bookmarks
  if (getBookmarks().length >= 10) unlock('bookmarks_10')

  // SRS mastery
  const mastered = questions.filter(q => {
    const r = getSrsStats(q.id)
    return r !== null && r.interval >= 21
  }).length
  if (mastered >= 10)  unlock('mastered_10')
  if (mastered >= 50)  unlock('mastered_50')
  if (mastered >= 100) unlock('mastered_100')

  // Per-session checks on most recent session
  const latest = history[0]
  if (latest) {
    const qs = latest.questionIds.map(id => questions.find(q => q.id === id)).filter(Boolean)
    const correct = qs.filter(q => q && latest.answers[q.id] === q.answer).length
    const total = qs.length
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0
    const hp = estimateHpScore(pct)

    if (total >= 5 && pct === 100) unlock('perfect_session')
    if (hp >= 1.50) unlock('hp_150')
    if (hp >= 1.75) unlock('hp_175')
    if (hp >= 1.90) unlock('hp_190')
    if (hp >= 2.00) unlock('hp_200')

    // Allrounder: ≥70% in all 4 types (only if session has all 4 types)
    const byType: Record<string, { correct: number; total: number }> = {}
    qs.forEach(q => {
      if (!q) return
      if (!byType[q.type]) byType[q.type] = { correct: 0, total: 0 }
      byType[q.type].total++
      if (latest.answers[q.id] === q.answer) byType[q.type].correct++
    })
    const types = Object.keys(byType)
    if (types.length === 4 && types.every(t => byType[t].total > 0 && (byType[t].correct / byType[t].total) >= 0.7)) {
      unlock('allrounder')
    }
  }

  return newlyEarned
}

export function getAchievement(id: string): Achievement | undefined {
  return ALL_ACHIEVEMENTS.find(a => a.id === id)
}

export const RARITY_STYLES: Record<Achievement['rarity'], { border: string; bg: string; label: string; labelColor: string }> = {
  bronze:   { border: 'border-[var(--color-gold-deep)]',      bg: 'bg-[var(--color-gold-muted)]',      label: 'Brons',   labelColor: 'text-[var(--color-gold-deep)]'  },
  silver:   { border: 'border-[var(--color-card-border)]',    bg: 'bg-[var(--color-paper-dark)]',      label: 'Silver',  labelColor: 'text-[var(--color-ink-muted)]'  },
  gold:     { border: 'border-[var(--color-gold)]',           bg: 'bg-[var(--color-gold-muted)]',      label: 'Guld',    labelColor: 'text-[var(--color-gold-deep)]'  },
  platinum: { border: 'border-[var(--color-terracotta)]',     bg: 'bg-[var(--color-terracotta-muted)]', label: 'Platina', labelColor: 'text-[var(--color-terracotta)]' },
}
