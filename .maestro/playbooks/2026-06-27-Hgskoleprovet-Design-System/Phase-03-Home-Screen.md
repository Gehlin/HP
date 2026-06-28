# Phase 03: Home Screen (Hem)

This phase redesigns `src/pages/Home.tsx` — the first thing users see. The current dark dashboard with neon section cards becomes a warm, editorial layout: a greeting header with today's date and a terracotta streak pill at the top, a large forest-green hero card showing the HP score estimate, a "Fortsätt" continue card if there's an active session, and an 8-section grid where each section shows its name, question count, and a conic-gradient circular progress ring in the section's accent color. All data (score, streak, section accuracy, continue session) comes from the same `localStorage` utilities already used — only the visual layer changes.

## Tasks

- [x] Read `src/pages/Home.tsx` completely (it's ~47KB — read in two passes if needed: lines 1–250 first, then the rest). Identify: the stats loaded from `loadStats`, `loadHistory`, `computeReadiness`, `getDueQuestions`, `getExamDate`, `isDailyChallengeCompleted`, and the `TYPE_ACCENTS` color map. You'll keep all the data-fetching logic but replace all JSX/rendering.
  <!-- Done. File is 869 lines. Data-fetching inventory:
    - loadStats() → `stats` (GameStats | null) — line 190
    - loadHistory() → used for todayCount, typeAcc (accuracy per type), tagAcc (tag weak spots) — lines 194–257
    - computeReadiness() → `readiness` (score/label/accuracy/mastery/coverage) — line 205
    - getDueQuestions() → `dueCount` — line 209
    - getExamDate() → `examDate` — line 203
    - isDailyChallengeCompleted() → `dailyDone` — line 207
    - TYPE_ACCENTS map (lines 13–22): currently uses dark Tailwind utility classes (text-violet-400, bg-violet-500/10, etc.) — will be replaced with warm hex palette in next task.
    - loadSession() → `resumeSession` (ExamSession | null) — line 199
    All useEffect state hooks live lines 171–188; data-fetching useEffect lines 189–268. JSX starts at line 292. All hooks preserved; only JSX replaced in subsequent tasks. -->


- [x] Replace the `TYPE_ACCENTS` color map at the top of `Home.tsx` with a new map that uses the warm palette. The map should define per-type accent colors compatible with light backgrounds:
  ```
  XYZ: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' }
  KVA: { color: '#2563EB', ring: '#2563EB', bg: 'rgba(37,99,235,0.08)' }
  NOG: { color: var(--color-green) hex #224A3A, ring: '#224A3A', bg: var(--color-green-muted) }
  DTK: { color: '#D97706', ring: '#D97706', bg: 'rgba(217,119,6,0.08)' }
  ORD: { color: '#DC2626', ring: '#DC2626', bg: 'rgba(220,38,38,0.08)' }
  LAS: { color: '#DB2777', ring: '#DB2777', bg: 'rgba(219,39,119,0.08)' }
  MEK: { color: '#9333EA', ring: '#9333EA', bg: 'rgba(147,51,234,0.08)' }
  ELF: { color: '#7C3AED', ring: '#7C3AED', bg: 'rgba(124,58,237,0.08)' }
  ```
  Each entry: `{ color: string, ring: string, bg: string }`

- [x] Rewrite the outer page wrapper and header section of `Home.tsx`. The page root div should use `className="min-h-screen bg-app pb-28"`. The header block (top of the scroll area) should be `px-4 pt-12 pb-4 max-w-2xl mx-auto`:
  - First line: flex row with greeting on left (`text-2xl font-[var(--font-serif)] text-[var(--color-ink)]` — e.g. "God morgon, Sebastian") and the streak pill on the right (`className="streak-pill"` with a flame emoji and streak count)
  - Second line: today's date in Swedish format (`new Date().toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })`) in `text-sm text-[var(--color-ink-faint)]`
  - Keep all existing `useEffect` and state hooks unchanged; only the returned JSX changes
  <!-- Done. Root div changed to `min-h-screen bg-app pb-28`; old dark hero/title section removed. New header added with time-based Swedish greeting (God morgon/dag/kväll), streak-pill, and Swedish date. Inner content wrapped in `max-w-2xl mx-auto px-4`. Unused `const total` removed. TypeScript clean. -->

- [x] Build the hero score card. Inside the page's `max-w-2xl mx-auto px-4` container, after the header, add a `card-green` div (uses the `.card-green` class from Phase 1):
  - Padding: `p-6`
  - Top row: small label "Uppskattat HP-poäng" in `text-sm text-white/70 font-[var(--font-sans)]`
  - Large score number: pull from `computeReadiness` or `hpScore` utility — display as `text-5xl font-[var(--font-serif)] text-white`
  - Below score: a row of 3 mini-stats (Rätt total, Streak, Dagar kvar till HP) in `text-xs text-white/60` with values in `text-base text-white font-semibold`
  - Right side: an SVG score ring — an 80px circle with `stroke-dasharray` and `stroke-dashoffset` computed from the percentage (use `readiness.score / 2.0` as a 0–100 percentage). Ring track: `rgba(255,255,255,0.15)`, ring fill: `white`, `stroke-linecap: round`
  <!-- Done. Added HERO_R=36/HERO_C constants, `totalCorrect` state (computed from full history), and `heroScorePct`/`heroRingOffset` vars. Hero card renders as forest-green `.card-green p-6` div: label + big score on left, 3 mini-stats (Rätt totalt, Streak, Dagar kvar till HP) below, and 80px SVG ring on right. TypeScript clean. -->

- [x] Build the "Fortsätt" continue card. After the hero card, conditionally render (only if `loadSession()` returns a session in progress) a white `.card` div with:
  - Label: "Fortsätt där du slutade" in `text-xs uppercase tracking-widest text-[var(--color-ink-faint)] font-semibold`
  - Session type + number of remaining questions in `text-base font-semibold text-[var(--color-ink)]`
  - A `btn-primary` button "Fortsätt" that navigates to `/session`
  - Layout: flex row, text on left, button on right
  <!-- Done. Replaced the old dark-blue resume banner (bg-blue-500/10) with a white `.card p-4` div. Label "Fortsätt där du slutade" in ink-faint uppercase, session type + remaining count (tot - answered) in ink-colored text, and a `btn-primary` "Fortsätt" button on the right navigating to /session. TypeScript clean. -->

- [x] Build the 8-section grid. After the continue card (or hero card if no session), render a 2-column grid (`grid grid-cols-2 gap-3`). For each question type (XYZ, KVA, NOG, DTK, ORD, LAS, MEK, ELF), render a `.card` div with `p-4`:
  - A conic-gradient SVG progress ring (48px): compute `accuracy` for this type from session history (reuse existing `computeTypeStats` or equivalent logic in the file). Ring background: `var(--color-paper-dark)`, ring fill: the type's `ring` color. The SVG should use a `circle` with `stroke-dasharray="circumference"` and `stroke-dashoffset` computed from accuracy percentage.
  - Section name: `text-sm font-semibold text-[var(--color-ink)]`
  - Accuracy: `text-xs text-[var(--color-ink-faint)]` — e.g. "72% rätt"
  - Question count: `text-xs text-[var(--color-ink-faint)]` — e.g. "12 frågor"
  - Tap the card → navigate to `/practice` with a type filter (use navigate with state: `{ defaultType: type }`)
  - Card background: the type's `bg` color
  <!-- Done. Added `typeAccuracy` state and `SECT_R`/`SECT_C` constants. Extended the useEffect tc-loop to also tally per-type correct/total across all history and call `setTypeAccuracy`. Grid renders 8 `.card` buttons (2 cols, gap-3) each showing a 48px SVG ring (paper-dark track, type ring fill, stroke-dashoffset from accuracy%), type name, accuracy %, and question count. Tap navigates to /practice with `{ state: { defaultType: type } }`. TypeScript clean. -->

- [x] Remove the daily challenge card, recommendation cards, theory link rows, and exam-date widgets from the old Home.tsx JSX — the new design focuses on the score hero + section grid. Keep the streak count and history data being loaded (for the hero card), but strip out any JSX blocks that render those older cards (they were the dark `glass` cards with blue gradients). After stripping, make sure no import is left unused (remove from import list if removed from JSX).
  <!-- Done. Stripped all old JSX blocks: exam countdown + date-picker, stats row (readiness + daily goal ring), XP/level bar, primary CTAs grid (daily challenge, exam sim), smart recommendation card, SRS due widget, weak-spot focus card, Lärväg learning-path widget, section-hub buttons, and the full type-cards accordion. Removed unused state vars (todayCount, showDatePicker, customDate, dynamicTarget, dailyDone, expandedType, dueCount, focusPreference, recommendation, weakTags) and their useEffect logic. Removed unused computed vars (urgency, goalReached, ringProgress, ringOffset, hasActivity, handleSetExamDate). Removed unused constants (TYPE_INFO, RING_R, RING_CIRCUMFERENCE). Cleaned imports: removed getLevel, getDueQuestions, setExamDate, clearExamDate, urgencyLabel, dailyTarget, KNOWN_HP_DATES, isDailyChallengeCompleted, CHALLENGE_SIZE, getFocusPreference, FocusPreference, QuestionType. TypeScript noEmit: zero errors. -->


- [ ] Verify the Home screen visually: `npm run dev`, open `/`. Confirm: warm cream background, serif greeting, green hero card with score, continue card when relevant, 2-column section grid with progress rings. No dark backgrounds should remain on this screen.
