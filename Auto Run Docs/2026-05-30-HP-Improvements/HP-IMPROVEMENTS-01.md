# HP Improvements — Phase 01: Keyboard Shortcuts & Session UX

Improve the session experience so users can answer questions without touching the mouse, and add a "flag for review" feature.

---

- [x] **Add keyboard shortcuts in `src/pages/Session.tsx`**: Listen for keydown events on keys `A`, `B`, `C`, `D`, `E` to select the corresponding answer option (only when the question is not yet revealed and the option exists). Listen for `Enter` or `Space` to advance to the next question (equivalent to clicking the "Nästa →" button), and to trigger "Visa svar" if deferred feedback mode is active and an answer is chosen but not yet revealed. Show a subtle keyboard hint below the answer options (e.g. "Tryck A–D för att svara · Enter för att gå vidare") that disappears after the first keyboard interaction. Do not allow keyboard selection when a question is already revealed in instant-feedback mode.
  <!-- Done: Added `keyboardUsed` state + `useEffect` keyboard handler. Keys A–E select options via `key in q.options` check (guards instant-feedback revealed state). Enter/Space either reveals (deferred mode) or advances/finishes. Hint "Tryck A–{lastKey} för att svara · Enter för att gå vidare" shown until first key press. Moved all derived values before effects to satisfy Rules of Hooks. -->

- [ ] **Add question flagging in `src/pages/Session.tsx` and `src/utils/session.ts`**: Add a flag/bookmark button (star icon, text "Markera") in the session header area next to the question counter. Clicking it toggles the current question as flagged. Store flagged question IDs in the active session object (add a `flagged: string[]` field to `ExamSession` in `src/types.ts`). Persist flags via `saveSession`. On the Results page (`src/pages/Results.tsx`), add a "Markerade" filter tab above the review list that shows only flagged questions. Display a small flag indicator on flagged questions in the review list.

- [ ] **Add a "Skip question" button in `src/pages/Session.tsx`**: Add a small "Hoppa över →" text button below the answer options (only visible when no answer is yet chosen). Skipping records no answer for the question and advances to the next. Skipped questions show as unanswered (grey) in the Results review list with the correct answer revealed. Track skipped count in the results summary card.
