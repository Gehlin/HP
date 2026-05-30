# HP Improvements — Phase 04: Spaced Repetition

Automatically resurface questions the user has answered incorrectly, weighted by recency and error frequency.

---

- [x] **Create `src/utils/srs.ts` (Spaced Repetition System)**: Implement a simple SM-2-inspired system stored in localStorage under `hp_srs`. Data shape: `Record<questionId, { interval: number, easeFactor: number, nextReview: number, timesCorrect: number, timesWrong: number }>`. Export: `recordAnswer(qid: string, correct: boolean): void` — updates interval and ease factor using SM-2 logic (correct easy = interval×ease, correct hard = interval×1.2, wrong = reset interval to 1 day); `getDueQuestions(allIds: string[]): string[]` — returns question IDs whose `nextReview` timestamp is ≤ now, sorted by most overdue first; `getStats(qid: string)` — returns the SRS record for a question.
  - Added vitest + jsdom (14 tests, all passing) covering recordAnswer, getDueQuestions, getStats edge cases.

- [x] **Add "Repetition" mode to `src/pages/Practice.tsx`**: Add a third mode card alongside "Övning" and "Provläge": "Repetition — X frågor att repetera" where X is the count from `getDueQuestions`. When selected, the question pool is exactly the due questions (no count slider shown — all due questions are always included). If no questions are due, show "Inga frågor att repetera idag — kom tillbaka imorgon!" and disable the Start button for this mode. Wire `recordAnswer` into the session answer flow: call it in `src/utils/session.ts`'s `finishSession` after the session ends by iterating the session's answers.
  - Mode grid changed to 3 columns; drill-specific sections (type, difficulty, tags, count, timer, feedback) hidden in repetition mode. `finishSession` in session.ts now calls `recordAnswer` for every answered question.

- [x] **Show SRS metadata on question cards in `src/pages/Results.tsx`**: In the review list, for each question show a small "SRS" pill with: green "Kan detta" if timesCorrect ≥ 3 and last answer correct, yellow "Övar" if mixed history, red "Repeteras" if timesWrong > timesCorrect. This gives the user a quick sense of which questions are memorized vs. still shaky.
  - Pills only appear after at least one SRS-tracked session; skipped questions show no pill.
