import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { loadStats, saveStats, awardXP, updateStreak, getLevel, LEVELS, type GameStats } from './gamification'

const KEY = 'hp_gamification'

function setStats(overrides: Partial<GameStats>) {
  const base: GameStats = { xp: 0, streak: 0, lastPracticeDate: '', longestStreak: 0 }
  localStorage.setItem(KEY, JSON.stringify({ ...base, ...overrides }))
}

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('loadStats', () => {
  it('returns zeroed defaults when nothing stored', () => {
    expect(loadStats()).toEqual({ xp: 0, streak: 0, lastPracticeDate: '', longestStreak: 0 })
  })

  it('round-trips through saveStats', () => {
    const stats: GameStats = { xp: 250, streak: 4, lastPracticeDate: '2026-07-01', longestStreak: 9 }
    saveStats(stats)
    expect(loadStats()).toEqual(stats)
  })
})

describe('awardXP', () => {
  it('awards 10 XP per correct answer + a flat 20 for easy difficulty', () => {
    expect(awardXP(3, 5, 'easy')).toBe(3 * 10 + 20) // 50
  })

  it('awards 15 XP per correct answer for medium difficulty', () => {
    expect(awardXP(2, 4, 'medium')).toBe(2 * 15 + 20) // 50
  })

  it('awards 25 XP per correct answer for hard difficulty', () => {
    expect(awardXP(1, 2, 'hard')).toBe(1 * 25 + 20) // 45
  })

  it('falls back to the easy rate for an unrecognized difficulty string', () => {
    expect(awardXP(2, 2, 'nonsense')).toBe(2 * 10 + 20) // 40 — same as easy
  })

  it('still awards the flat +20 base when correct=0', () => {
    expect(awardXP(0, 5, 'hard')).toBe(20)
  })

  it('ignores the _total parameter entirely (only correct count matters)', () => {
    // Documents that awardXP's signature accepts total but never reads it —
    // a caller passing the wrong total silently has zero effect on the XP awarded.
    expect(awardXP(2, 2, 'easy')).toBe(awardXP(2, 999, 'easy'))
  })
})

describe('updateStreak', () => {
  it('seeds streak to 1 on the very first ever practice (no lastPracticeDate stored)', () => {
    updateStreak()
    const stats = loadStats()
    expect(stats.streak).toBe(1)
    expect(stats.longestStreak).toBe(1)
    expect(stats.lastPracticeDate).toBe(new Date().toISOString().split('T')[0])
  })

  it('same-day: calling updateStreak again the same day leaves the streak unchanged', () => {
    updateStreak() // streak -> 1
    updateStreak() // same day again
    expect(loadStats().streak).toBe(1)
  })

  it('same-day: does not change an existing higher streak either', () => {
    setStats({ streak: 5, longestStreak: 5, lastPracticeDate: new Date().toISOString().split('T')[0] })
    updateStreak()
    expect(loadStats().streak).toBe(5)
  })

  it('exactly one day since last practice: increments the streak by 1', () => {
    setStats({ streak: 3, longestStreak: 3, lastPracticeDate: isoDaysAgo(1) })
    updateStreak()
    expect(loadStats().streak).toBe(4)
  })

  it('more than one day gap: resets the streak to 1', () => {
    setStats({ streak: 10, longestStreak: 10, lastPracticeDate: isoDaysAgo(2) })
    updateStreak()
    expect(loadStats().streak).toBe(1)
  })

  it('a large gap (e.g. a week) also resets to 1, not to 0', () => {
    setStats({ streak: 20, longestStreak: 20, lastPracticeDate: isoDaysAgo(7) })
    updateStreak()
    expect(loadStats().streak).toBe(1)
  })

  it('longestStreak keeps its high-water mark even after the streak resets', () => {
    setStats({ streak: 10, longestStreak: 10, lastPracticeDate: isoDaysAgo(3) })
    updateStreak()
    const stats = loadStats()
    expect(stats.streak).toBe(1)
    expect(stats.longestStreak).toBe(10) // unchanged, not lowered back to 1
  })

  it('longestStreak updates when a new streak exceeds the previous record', () => {
    setStats({ streak: 6, longestStreak: 6, lastPracticeDate: isoDaysAgo(1) })
    updateStreak()
    expect(loadStats()).toMatchObject({ streak: 7, longestStreak: 7 })
  })

  it('builds a multi-day streak correctly across sequential calls', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T09:00:00Z'))
    updateStreak() // day 1 -> streak 1
    vi.setSystemTime(new Date('2026-07-02T09:00:00Z'))
    updateStreak() // day 2 -> streak 2
    vi.setSystemTime(new Date('2026-07-03T09:00:00Z'))
    updateStreak() // day 3 -> streak 3
    expect(loadStats().streak).toBe(3)
    expect(loadStats().longestStreak).toBe(3)
  })

  it('a lastPracticeDate in the future (clock skew / bad data) resets rather than crashing', () => {
    // diffDays comes out negative, which falls into the "else" (reset) branch —
    // documents that the guard is not === 0 / === 1 else-reset, so any non-1
    // difference (including negative) is treated as a gap.
    setStats({ streak: 8, longestStreak: 8, lastPracticeDate: isoDaysAgo(-2) })
    updateStreak()
    expect(loadStats().streak).toBe(1)
  })
})

describe('getLevel', () => {
  it('returns level 1 (Nybörjare) at xp=0', () => {
    expect(getLevel(0)).toMatchObject({ level: 1, label: 'Nybörjare', currentLevelXp: 0, nextLevelXp: 100 })
  })

  it('stays at level 1 one XP below the level-2 threshold', () => {
    expect(getLevel(99)).toMatchObject({ level: 1, label: 'Nybörjare' })
  })

  it('reaches level 2 (Grundnivå) exactly at the threshold', () => {
    expect(getLevel(100)).toMatchObject({ level: 2, label: 'Grundnivå', currentLevelXp: 100, nextLevelXp: 300 })
  })

  it('stays at level 2 one XP below the level-3 threshold', () => {
    expect(getLevel(299)).toMatchObject({ level: 2, label: 'Grundnivå' })
  })

  it('reaches level 3 (Mellanstadium) exactly at its threshold', () => {
    expect(getLevel(300)).toMatchObject({ level: 3, label: 'Mellanstadium' })
  })

  it('reaches the top level (10, HP-Legend) at its threshold', () => {
    expect(getLevel(6000)).toMatchObject({ level: 10, label: 'HP-Legend', currentLevelXp: 6000 })
  })

  it('at the max level, nextLevelXp collapses to currentLevelXp (no level 11 exists)', () => {
    // Documents a real edge case: (nextLevelXp - currentLevelXp) is 0 at max level,
    // so any caller computing a progress-bar fraction from these two fields must
    // special-case level 10 to avoid a division by zero. Progress.tsx/Resultat.tsx
    // both do guard this (isMaxLevel / level===10 checks) — verified by reading them.
    const top = getLevel(6000)
    expect(top.nextLevelXp).toBe(top.currentLevelXp)
  })

  it('well beyond the top threshold still resolves to level 10, not an error', () => {
    expect(getLevel(999_999)).toMatchObject({ level: 10, label: 'HP-Legend' })
  })

  it('LEVELS is ordered ascending by xp (sanity check the lookup table itself)', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      expect(LEVELS[i].xp).toBeGreaterThan(LEVELS[i - 1].xp)
    }
  })
})
