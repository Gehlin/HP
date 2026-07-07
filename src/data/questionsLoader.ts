import { useEffect, useState } from 'react'
import type { Question } from '../types'

// The question bank (`./questions`) is ~1.7MB of source and was, until this
// loader existed, statically imported by 17+ different files — which forced
// Rollup to bundle it into the shared eager entry chunk no matter what any
// single consumer actually needed. The fix is not splitting the data file;
// most consumers need cross-type lookup by id (a bookmark list or a
// weak-area drill can mix XYZ/KVA/NOG/DTK/ORD/LAS/MEK/ELF freely). The fix
// is converting every static import to this one shared *dynamic* import, so
// the module can finally become its own lazy chunk.
//
// `loadQuestions()` caches the resolved promise (not just the resolved
// value) so concurrent callers during the same tick share one in-flight
// import, and every call after the first resolves synchronously-fast off
// the cached array with no re-fetch and no loading flash.
let cached: Promise<Question[]> | null = null

export function loadQuestions(): Promise<Question[]> {
  if (!cached) {
    cached = import('./questions').then(mod => mod.questions)
  }
  return cached
}

/**
 * React hook wrapping `loadQuestions()` with an explicit loading state.
 * Returns `null` until the question bank has resolved at least once in
 * this app session; every subsequent mount resolves on the next tick from
 * the cached promise (no flash, no re-import).
 */
export function useQuestions(): Question[] | null {
  const [data, setData] = useState<Question[] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadQuestions().then(qs => {
      if (!cancelled) setData(qs)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return data
}
