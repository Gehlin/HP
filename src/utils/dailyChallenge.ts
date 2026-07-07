import { loadQuestions } from '../data/questionsLoader'

export const CHALLENGE_SIZE = 10
const DONE_KEY = 'hp_daily_done'

function seedRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }
}

function todaySeed(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

// Async: needs the full question bank to shuffle, loaded via the shared
// cached loader rather than a static import so this file no longer pulls
// questions.ts into every consumer's chunk. Only caller (Practice.tsx) is
// already inside a `useEffect`, so the async signature has no ripple effect.
export async function getDailyChallengeIds(): Promise<string[]> {
  const questions = await loadQuestions()
  const rng = seedRng(todaySeed())
  const shuffled = [...questions].sort(() => rng() - 0.5)
  return shuffled.slice(0, CHALLENGE_SIZE).map(q => q.id)
}

export function isDailyChallengeCompleted(): boolean {
  const raw = localStorage.getItem(DONE_KEY)
  if (!raw) return false
  return raw === new Date().toISOString().slice(0, 10)
}

export function markDailyChallengeCompleted(): void {
  localStorage.setItem(DONE_KEY, new Date().toISOString().slice(0, 10))
}
