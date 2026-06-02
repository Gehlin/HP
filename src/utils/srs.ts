const STORAGE_KEY = 'hp_srs'
const DAY_MS = 24 * 60 * 60 * 1000

export interface SrsRecord {
  interval: number
  easeFactor: number
  nextReview: number
  timesCorrect: number
  timesWrong: number
}

type SrsStore = Record<string, SrsRecord>

function loadStore(): SrsStore {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as SrsStore) : {}
}

function saveStore(store: SrsStore): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

// quality: 0 = wrong, 1 = hard/barely right, 2 = correct, 3 = easy
export function recordAnswer(qid: string, correct: boolean, quality?: number): void {
  const store = loadStore()
  const rec = store[qid] ?? { interval: 1, easeFactor: 2.5, nextReview: 0, timesCorrect: 0, timesWrong: 0 }

  const q = quality ?? (correct ? 2 : 0)

  if (q === 0) {
    store[qid] = {
      ...rec,
      interval: 1,
      easeFactor: Math.max(1.3, rec.easeFactor - 0.2),
      nextReview: Date.now() + DAY_MS,
      timesWrong: rec.timesWrong + 1,
    }
  } else if (q === 1) {
    // Hard but correct — reset interval, slight ef penalty, review tomorrow
    store[qid] = {
      ...rec,
      interval: 1,
      easeFactor: Math.max(1.3, rec.easeFactor - 0.15),
      nextReview: Date.now() + DAY_MS,
      timesCorrect: rec.timesCorrect + 1,
    }
  } else if (q === 2) {
    // Correct — standard SM-2 progression
    const newInterval = Math.max(1, Math.round(rec.interval * rec.easeFactor))
    store[qid] = {
      ...rec,
      interval: newInterval,
      nextReview: Date.now() + newInterval * DAY_MS,
      timesCorrect: rec.timesCorrect + 1,
    }
  } else {
    // Easy — standard progression + ef boost
    const newInterval = Math.max(1, Math.round(rec.interval * rec.easeFactor))
    store[qid] = {
      ...rec,
      interval: newInterval,
      easeFactor: Math.min(3.0, rec.easeFactor + 0.1),
      nextReview: Date.now() + newInterval * DAY_MS,
      timesCorrect: rec.timesCorrect + 1,
    }
  }

  saveStore(store)
}

export function getDueQuestions(allIds: string[]): string[] {
  const store = loadStore()
  const now = Date.now()
  return allIds
    .filter(id => {
      const rec = store[id]
      return rec !== undefined && rec.nextReview <= now
    })
    .sort((a, b) => store[a].nextReview - store[b].nextReview)
}

export function getStats(qid: string): SrsRecord | null {
  return loadStore()[qid] ?? null
}
