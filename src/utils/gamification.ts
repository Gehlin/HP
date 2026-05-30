const STORAGE_KEY = 'hp_gamification'

export interface GameStats {
  xp: number
  streak: number
  lastPracticeDate: string
  longestStreak: number
}

const LEVELS = [
  { level: 1, label: 'Nybörjare', xp: 0 },
  { level: 2, label: 'Grundnivå', xp: 100 },
  { level: 3, label: 'Mellanstadium', xp: 300 },
  { level: 4, label: 'Avancerad', xp: 600 },
  { level: 5, label: 'Expert', xp: 1000 },
  { level: 6, label: 'Mästare', xp: 1500 },
  { level: 7, label: 'HP-Veteran', xp: 2200 },
  { level: 8, label: 'Högskolenivå', xp: 3000 },
  { level: 9, label: 'Elite', xp: 4000 },
  { level: 10, label: 'HP-Legend', xp: 6000 },
]

export function loadStats(): GameStats {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return { xp: 0, streak: 0, lastPracticeDate: '', longestStreak: 0 }
  return JSON.parse(raw) as GameStats
}

export function saveStats(s: GameStats): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function awardXP(correct: number, _total: number, difficulty: string): number {
  const rate = difficulty === 'hard' ? 25 : difficulty === 'medium' ? 15 : 10
  return correct * rate + 20
}

export function updateStreak(): void {
  const stats = loadStats()
  const today = new Date().toISOString().split('T')[0]
  if (!stats.lastPracticeDate) {
    stats.streak = 1
  } else {
    const lastDate = new Date(stats.lastPracticeDate)
    const todayDate = new Date(today)
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      // same day — streak unchanged
    } else if (diffDays === 1) {
      stats.streak += 1
    } else {
      stats.streak = 1
    }
  }
  stats.lastPracticeDate = today
  stats.longestStreak = Math.max(stats.longestStreak, stats.streak)
  saveStats(stats)
}

export function getLevel(xp: number): { level: number; label: string; nextLevelXp: number; currentLevelXp: number } {
  let currentIdx = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) currentIdx = i
  }
  const current = LEVELS[currentIdx]
  const next = LEVELS[currentIdx + 1] ?? current
  return {
    level: current.level,
    label: current.label,
    nextLevelXp: next.xp,
    currentLevelXp: current.xp,
  }
}
