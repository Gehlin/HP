const STORAGE_KEY = 'hp_srs'
const DAY_MS = 24 * 60 * 60 * 1000

// Shared "mastery" cutoff used by both achievements.ts and readiness.ts.
//
// The SM-2-style progression below only ever produces intervals of
// 1 (new) -> 3 -> 8 -> 20 -> 50 -> 125 ... (round(interval * easeFactor), easeFactor
// starting at 2.5) for a question answered correctly on every review. A cutoff of
// 20 is the last of those steps reachable after three consecutive correct reviews
// spaced roughly three weeks apart in total — genuinely "known long-term" without
// requiring a fourth review (interval=50, ~7 weeks) that would make even the
// bronze-tier mastery achievement unreasonably slow to earn. Values like 7 or 21
// don't correspond to any interval the algorithm actually produces: 7 is crossed
// automatically on the *second* correct review (interval=8) and so undercounts
// "mastered", while 21 sits just past the third review's interval=20 and so quietly
// demands the fourth review's jump to 50 — neither is a real, defensible line.
export const MASTERY_INTERVAL_DAYS = 20

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
