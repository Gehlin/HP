# Phase 05: Results Screen

This phase redesigns `src/pages/Results.tsx` — the screen shown after completing a drill or exam session. The new design uses a full-screen forest-green background for the top hero section (matching the home screen hero card color), an SVG score ring showing percentage correct, a three-stat strip (correct answers, time taken, current streak), and a streak achievement card. Below the fold, the per-question breakdown and per-type accuracy bars switch to the warm card style. The same `localStorage` result data is used — only the presentation changes.

## Tasks

- [x] Read `src/pages/Results.tsx` fully (it's ~48KB — read in two passes: first 200 lines, then the rest). Identify: how results are loaded (likely from `loadHistory()` or route state), the accuracy/time/streak calculations, the per-question list render, the per-type stat bars, and the navigation buttons ("Öva igen", "Hem").
  <!-- Results are loaded via `loadSession()` (line 31) from localStorage. Questions resolved via `questionIds.map(id => questions.find(...))`. Accuracy: `correct` count + `pct = Math.round(correct/total*100)` (lines 121-124). Duration: `(endTime - startTime)/1000` formatted as "Xm Ys" (lines 143-144). Streak from `loadStats().streak`. Per-type byType object (lines 126-139) tallied per question. Per-type bars: grid of `.glass` cards at lines 458-475. Per-question list: lines 737-851 with expand/collapse and ExplanationCard. Nav buttons: "Ny träning"→/practice, "Hem"→/ (lines 914-927). -->

- [x] Rewrite the hero section of `Results.tsx`. The top portion of the page (approximately the top 45vh) should be a full-width green block:
  - Outer wrapper div: `bg-[var(--color-green)] px-4 pt-16 pb-10 flex flex-col items-center`
  - Small label: "Resultat" in `text-xs uppercase tracking-[0.15em] text-white/60 font-[var(--font-sans)] mb-4`
  - SVG score ring (120px): a centered circle showing percentage correct. Outer SVG `viewBox="0 0 120 120"`. Track circle: `stroke="rgba(255,255,255,0.15)"`, `strokeWidth="8"`, `fill="none"`. Progress circle: `stroke="white"`, `strokeWidth="8"`, `fill="none"`, `strokeLinecap="round"`, `strokeDasharray` = circumference (≈ 2π×52 ≈ 326.7), `strokeDashoffset` = circumference × (1 - score/100). Center text (via SVG `<text>`): the score percentage in large white serif text.
  - Score percentage label: `text-4xl font-[var(--font-serif)] text-white mt-4` — e.g. "78%"
  - Subtitle: number of correct answers "14 av 20 rätt" in `text-base text-white/70`

- [x] Build the three-stat strip below the hero. Use a `bg-[var(--color-green-light)] px-4 py-4` div (slightly lighter green):
  - Three equal-width columns in a `grid grid-cols-3 divide-x divide-white/20 max-w-2xl mx-auto`
  - Each column: centered, label in `text-xs text-white/60` above value in `text-lg font-semibold text-white`
  - Stat 1: "Rätt svar" → correct count (e.g. "14")
  - Stat 2: "Tid" → total session time formatted as "mm:ss"
  - Stat 3: "Streak" → current streak from `loadStats()` with a 🔥 or flame SVG

- [x] Build the streak/achievement card and action buttons. Below the green header area, add a white-background scrollable section `bg-[var(--color-paper)] px-4 pt-6 pb-28`:
  - If streak increased: render a `.card p-4 mb-4` achievement card with terracotta left border (`border-l-4 border-[var(--color-terracotta)]`), flame icon, "Streak! X dagar i rad" heading in `font-semibold text-[var(--color-ink)]`, subtitle in `text-sm text-[var(--color-ink-faint)]`
  - Two action buttons in `flex gap-3 mb-6`: `btn-primary flex-1` "Öva igen" (navigate back to `/practice`) and `btn-ghost flex-1` "Hem" (navigate to `/`)
  - All content inside `max-w-2xl mx-auto`

- [x] Rewrite the per-type accuracy bars section in `Results.tsx`. For each question type that appeared in the session:
  - Section heading: "Per delprovstyp" in `text-sm font-semibold text-[var(--color-ink-muted)] uppercase tracking-widest mb-3`
  - Each type row in a `.card p-3 mb-2` card: type badge (colored pill using warm hex from Phase 3 accent map), accuracy bar (`h-2 rounded-full bg-[var(--color-paper-dark)]` track, inner div with type's ring color at correct width%), accuracy percentage label on the right
  - Remove any dark background classes (`bg-slate-900/50`, `bg-white/[0.03]`, etc.)
  <!-- Added WARM_TYPE_COLORS map (warm hex per Phase 3 accent map: XYZ=#7C3AED, KVA=#2563EB, NOG=#224A3A, DTK=#D97706, ORD=#DC2626, LAS=#DB2777, MEK=#9333EA, ELF=#7C3AED) alongside existing TYPE_COLORS. Replaced 2-col glass grid with a flat list: section heading + .card rows each showing a colored pill badge, paper-dark track bar with ring-color fill, and right-aligned % label. TypeScript clean. -->

- [ ] Rewrite the per-question breakdown list in `Results.tsx`. Each question row should be a warm card:
  - `.card p-3 mb-2` wrapper
  - Left: question number + type badge
  - Middle: truncated question text in `text-sm text-[var(--color-ink)]`
  - Right: green checkmark SVG if correct, red X SVG if wrong
  - Expandable detail (if already implemented): keep the toggle logic, update the expanded explanation area to use `bg-[var(--color-paper-dark)] rounded-xl p-3 mt-2` instead of dark glass

- [ ] Run `npm run dev`, complete a short drill session (pick any type, 5 questions), and verify the Results screen: green hero with score ring, three-stat strip, warm scrollable section with streak card, action buttons, type bars, and question list. No dark backgrounds should remain.
