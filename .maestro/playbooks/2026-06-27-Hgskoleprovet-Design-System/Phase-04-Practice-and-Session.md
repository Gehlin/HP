# Phase 04: Practice Selector & Session Screen

This phase redesigns the two most-used screens: `src/pages/Practice.tsx` (the mode selector before a session starts) and `src/pages/Session.tsx` (the actual quiz player). Practice becomes a clean warm card list replacing the dark filter UI. Session gets a fixed warm header with a progress bar and timer, answer options using the `.answer-option` CSS classes from Phase 1, and a fixed footer with the action button. All question logic, answer checking, SRS updates, and bookmarking stays identical — only the visual layer changes.

## Tasks

- [x] Read `src/pages/Practice.tsx` (first 150 lines, then remaining). Identify: the mode state (drill/exam/repetition), type filter chips, difficulty selector, and the "Starta" button. Note the `TYPE_COLOR` and `TYPE_ACTIVE` maps.
  <!-- DONE: mode state is `useState<Mode>('drill')` (line 78). Type chips use TYPE_ACTIVE (border/bg/text per type, dark Tailwind palette) and TYPE_COLOR (text-only variant). Difficulty: `selectedDifficulties` state (line 89) with ALL_DIFFICULTIES=['easy','medium','hard'], 3 pill buttons. "Starta" button: `start()` handler (line 208) calling saveSession + navigate('/session'). TYPE_COLOR/TYPE_ACTIVE both use dark-theme violet/blue/emerald/amber/rose/pink/fuchsia/purple Tailwind classes — all to be replaced with warm CSS vars. -->

- [x] Rewrite `src/pages/Practice.tsx` outer container and header. Page root: `min-h-screen bg-app pb-28 px-4 pt-12 max-w-2xl mx-auto`. Replace the top area with:
  - Page title "Öva" in `text-2xl font-[var(--font-serif)] text-[var(--color-ink)] mb-6`
  - Three mode selector cards (Drill / Timed Exam / Spaced Repetition), each as a `.card` with `p-4 mb-3 cursor-pointer` and a left-side colored dot in the type's accent color. Active mode card: `border-2 border-[var(--color-green)]`. Inactive: `border border-[var(--color-card-border)]`.
  - Each card: icon (simple SVG) + title in `font-semibold text-[var(--color-ink)]` + subtitle description in `text-sm text-[var(--color-ink-faint)]`
  <!-- DONE: Single outer div with min-h-screen bg-app pb-28 px-4 pt-12 max-w-2xl mx-auto. Serif "Öva" h1. Three warm mode cards: Övning (green dot, pencil SVG), Provläge (terracotta dot, clock SVG), Spaced Repetition (gold dot, refresh SVG). Active: border-2 border-[var(--color-green)]; inactive: border border-[var(--color-card-border)]. Old dark Mode grid removed. TypeScript clean. -->

- [x] Rewrite the type filter chips in `Practice.tsx`. Replace `TYPE_COLOR` / `TYPE_ACTIVE` inline maps with a simple per-type color map using the same warm-accent hex values from Phase 3's `TYPE_ACCENTS`. Render chips as small pills: `rounded-full px-3 py-1.5 text-xs font-semibold border`. Inactive: `bg-[var(--color-paper-dark)] border-transparent text-[var(--color-ink-muted)]`. Active: `border-2 border` with the type's ring color, matching `bg` tint. Keep the "Alla" chip. Arrange in a wrapping flex row with `flex-wrap gap-2`.
  <!-- DONE: Replaced TYPE_ACTIVE + TYPE_COLOR maps with single TYPE_ACCENTS map (hex values, same shape as Home.tsx). Delprov section rewritten as flex-wrap pill row: "Alla" chip (green border when all selected, toggles all/none), type pills use inline style for borderColor/backgroundColor/color from TYPE_ACCENTS. Inactive pills: paper-dark bg, transparent border, ink-muted text. Sektionsträning grid buttons updated to TYPE_ACCENTS inline styles. Repetition dueByType grid updated to warm card/ink vars. SectionLabel updated to ink-faint. TypeScript clean. -->

- [x] Rewrite the difficulty selector and "Starta" button in `Practice.tsx`. Difficulty: 3 pill chips (Lätt / Medel / Svår) styled like the type chips but in a fixed row. The "Starta" button: `btn-primary w-full mt-6 py-4 text-base`. Keep all existing handler logic (starting the session, `saveSession`, `navigate('/session')`) — only replace JSX/class names.
  <!-- DONE: Added DIFFICULTY_ACCENTS map (easy→green #224A3A, medium→amber #D97706, hard→red #DC2626 with 10% opacity tint). Difficulty buttons rewritten as rounded-full pills matching type chip style: inactive uses paper-dark bg / transparent border / ink-muted text; active uses border-2 with inline borderColor/backgroundColor/color from DIFFICULTY_ACCENTS. Starta button rewritten as `btn-primary w-full mt-6 py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed`. All handler logic (start(), saveSession, navigate) untouched. -->

- [ ] Read `src/pages/Session.tsx` (read in two passes: lines 1–200 first, then 201–end). Identify: question state, answer handling (`handleAnswer`), timer logic, bookmark toggling, the `revealed` state, and the `ExplanationCard` render. Note the `TYPE_TEXT`, `TYPE_PROGRESS`, `TYPE_BORDER_L` maps.

- [ ] Rewrite the Session screen outer layout and fixed header in `Session.tsx`. The outer `div` should be `min-h-screen bg-[var(--color-paper)] flex flex-col`. The fixed header (`fixed top-0 inset-x-0 z-40`):
  - Background: `bg-[var(--color-paper)] border-b border-[var(--color-card-border)]`
  - Content inside `max-w-2xl mx-auto px-4 h-14 flex items-center justify-between`:
    - Left: back/close button (X icon) in `text-[var(--color-ink-muted)]`
    - Center: question counter "7 / 20" in `text-sm font-semibold text-[var(--color-ink)]`
    - Right: timer display "01:23" in `font-mono text-sm text-[var(--color-ink-muted)]` (add `.timer-warning` class when < 30s)
  - Below the header row: a linear progress bar — a full-width div with `h-1 bg-[var(--color-paper-dark)]`, inner div `h-full bg-[var(--color-green)] transition-all duration-300` whose width is `(currentIndex / total * 100)%`

- [ ] Rewrite the question content area in `Session.tsx`. The scrollable body should be `flex-1 overflow-y-auto pt-[72px] pb-[96px] px-4 max-w-2xl mx-auto w-full`:
  - Question text: `text-base leading-relaxed text-[var(--color-ink)] font-[var(--font-sans)] mb-6`
  - If `question.context` exists (passage/context text): render it first in a `card p-4 mb-4 text-sm text-[var(--color-ink-muted)] leading-relaxed` card
  - Answer options A–D (or A–E for NOG): each uses the `.answer-option` class. Apply `.answer-option-selected` when selected but not yet revealed. Apply `.answer-option-correct` / `.answer-option-wrong` after reveal. Inside each option: a small letter badge (`A`, `B`…) in `w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold` — green/white for correct, red/white for wrong, paper-dark/ink for default — and the option text in `text-sm text-[var(--color-ink)] flex-1`
  - Replace `TYPE_TEXT`, `TYPE_PROGRESS`, `TYPE_BORDER_L` maps with references to the warm color map from Phase 3 (import or inline them)

- [ ] Rewrite the fixed footer in `Session.tsx`. The footer (`fixed bottom-0 inset-x-0 z-40 bg-[var(--color-paper)] border-t border-[var(--color-card-border)] pb-safe`):
  - Content in `max-w-2xl mx-auto px-4 py-3 flex items-center justify-between`
  - Left side: bookmark toggle icon button (`text-[var(--color-ink-faint)]`, filled when bookmarked)
  - Right side: before reveal — `btn-primary px-8` "Visa svar" button. After reveal — `btn-primary px-8` "Nästa" button (or "Slutför" on last question).
  - Keep all existing `handleAnswer`, `handleNext`, `handleBookmark` handler wiring

- [ ] Update `src/components/ExplanationCard.tsx`: read it first, then replace dark-theme classes (`bg-slate-900`, `border-slate-700`, `text-slate-300`, `text-emerald-400`, `text-red-400`, `bg-emerald-500/10`, etc.) with warm equivalents:
  - Card wrapper: `bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-2xl`
  - Correct answer highlight: `bg-[var(--color-success-bg)] text-[var(--color-success)]`
  - Wrong answer: `bg-[var(--color-error-bg)] text-[var(--color-error)]`
  - Body text: `text-[var(--color-ink-muted)]`
  - Section labels: `text-[var(--color-ink-faint)] uppercase tracking-widest text-xs`

- [ ] Verify the Practice and Session flow: start the dev server, go to `/practice`, confirm the warm mode-selector and type chips render correctly. Start a drill session and check: warm header with progress bar, clean question text, warm answer options with correct state transitions after reveal, explanation card in light theme, correct footer buttons.
