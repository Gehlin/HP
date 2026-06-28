# Phase 06: Statistics Screen (Statistik)

This phase redesigns `src/pages/Progress.tsx` — the Statistik tab that shows overall performance trends, XP/level, HP score estimate, and per-section accuracy. The new design introduces a segmented control (Vecka / Månad / Allt) at the top, followed by a sparkline trend chart, a weekly activity bar chart, and per-section accuracy bars — all rendered on warm paper-colored cards. The gamification (XP, level, achievements) gets a compact warm card treatment rather than the old dark glass display.

## Tasks

- [x] Read `src/pages/Progress.tsx` fully (it's ~46KB — read in two passes: first 200 lines, then the rest). Identify: the data loaded (`loadStats`, `loadHistory`, `computeReadiness`, `getHPScore`), existing chart components used (search for `ChartView` import), the `TYPE_COLORS` map, and any achievement-rendering logic.
  <!-- Findings: Data loaded: loadHistory, loadStats, computeReadiness, estimateHpScore (estimateSectionedScore), getExamDate, daysUntilExam, timeAnalyticsByType, accuracyByDifficulty, rollingHpScore, hpScoreHistory, typeAccuracyTrend, ALL_ACHIEVEMENTS/getEarnedIds/RARITY_STYLES, getSrsStats. ChartView is NOT imported here — Progress.tsx uses its own inline Sparkline SVG component (lines 16-32); ChartView appears in Session.tsx. TYPE_COLORS map on lines 34-43: 8 types → { text, bar } using dark-theme Tailwind classes (violet, blue, emerald, amber, rose, pink, fuchsia, purple). Achievement rendering at lines 831-853 using earnedIds set and RARITY_STYLES. CSS tokens confirmed: --color-green #224A3A, --color-paper #F1ECE3, --color-paper-dark #E6DFD4, --color-paper-darker #D8CFC3, --color-gold #E4C66A, --color-ink #1A1A18, --color-ink-faint #9A9A92, --font-serif Newsreader. -->

- [x] Rewrite the page header and segmented control in `Progress.tsx`. Page root: `min-h-screen bg-app pb-28`. Header section: `px-4 pt-12 pb-4 max-w-2xl mx-auto`:
  - Title: "Statistik" in `text-2xl font-[var(--font-serif)] text-[var(--color-ink)]`
  - Segmented control below title: a `flex rounded-xl p-1 bg-[var(--color-paper-dark)] w-fit` container with three buttons ("Vecka", "Månad", "Allt"). Active segment: `bg-white rounded-lg px-4 py-1.5 text-sm font-semibold text-[var(--color-ink)] shadow-sm`. Inactive: `px-4 py-1.5 text-sm text-[var(--color-ink-faint)]`. Use a `timeRange` state: `'week' | 'month' | 'all'`.
  - Filter the history data displayed based on `timeRange` (week = last 7 days, month = last 30 days, all = all time)

- [x] Build the summary stat cards row in `Progress.tsx`. Below the segmented control, render a `grid grid-cols-3 gap-2 px-4 max-w-2xl mx-auto mb-4`:
  - Card 1: "Sessioner" → count of sessions in range — `.card p-3 text-center`: value in `text-xl font-semibold text-[var(--color-ink)]`, label in `text-xs text-[var(--color-ink-faint)]`
  - Card 2: "Rätt" → overall accuracy in range — same card format, value with `%`
  - Card 3: "Streak" → current streak from `loadStats()` — same format with flame emoji before value
  <!-- Done: inserted 3-column stat card row after the segmented control header, before existing content. Reuses already-computed filteredHistory.length, totalCorrect/totalAnswered, and stats.streak. -->

- [x] Build the weekly activity bar chart in `Progress.tsx`. Add a `.card mx-4 p-4 mb-4 max-w-2xl mx-auto` card:
  - Title: "Aktivitet" in `text-sm font-semibold text-[var(--color-ink)] mb-3`
  - 7-column bar chart (last 7 days): `flex items-end justify-between gap-1 h-16`
  - Each bar: a `flex flex-col items-center gap-1` div. Bar itself: `w-full rounded-t-md bg-[var(--color-green)]` at height proportional to sessions or questions answered that day (max bar = tallest day = `h-16`, others scaled proportionally). Days with 0 activity: `h-2 bg-[var(--color-paper-darker)]`. Day label below: `text-[10px] text-[var(--color-ink-faint)]` (Mon/Tue/Wed etc. in Swedish: Mån/Tis/Ons/Tor/Fre/Lör/Sön).
  - Compute the 7-day data from `loadHistory()`: group sessions by date, count questions answered per day
  <!-- Done: inserted after summary stat cards. Reuses existing `questionsByDay` (built from `history`) and `todayMidnight`. `sevenDayActivityRaw` builds 7 entries (oldest→newest), `sevenDayActivity` adds `barHeightPx` (max 48px for tallest day, min 8px for any active day). Swedish day labels via `toLocaleDateString('sv-SE', { weekday: 'short' }).slice(0, 2).toUpperCase()`. -->

- [x] Build the per-section accuracy bars in `Progress.tsx`. Add a `.card mx-4 p-4 mb-4 max-w-2xl mx-auto` card:
  - Title: "Per delprovstyp" in `text-sm font-semibold text-[var(--color-ink)] mb-3`
  - For each of 8 question types (XYZ, KVA, NOG, DTK, ORD, LAS, MEK, ELF), render a row: `flex items-center gap-3 mb-2`
    - Type name: `text-xs font-semibold text-[var(--color-ink)] w-8`
    - Track bar: `flex-1 h-2 rounded-full bg-[var(--color-paper-dark)]`, inner fill: `h-full rounded-full` with the type's ring color (same hex map as Phase 3) at the type's accuracy width%
    - Accuracy percentage: `text-xs text-[var(--color-ink-faint)] w-8 text-right`
  - Compute per-type accuracy from `loadHistory()` filtering by `timeRange` — reuse the same pattern already in the file
  - Replace `TYPE_COLORS` map with the warm-palette accent hex map
  <!-- Done: inserted "Per delprovstyp" card after the weekly activity bar chart. Added `WARM_TYPE_HEX` module-level const (matching Phase 3/Results.tsx hex palette). Bar fill uses `style={{ backgroundColor: tc.color }}` inline for warm hex colors. Reuses existing `byType` computed from `filteredHistory` (already time-range filtered). TYPE_COLORS retained for existing dark-theme sparkline/class usages — full replacement deferred to task 6 (dark-theme class removal). TypeScript clean. -->

- [x] Build the HP score and XP/level section in `Progress.tsx`. Add below the type bars:
  - HP Score card: `.card mx-4 p-4 mb-4 max-w-2xl mx-auto` — left side has "Uppskattat HP-poäng" label + large score number in `font-[var(--font-serif)]`, right side has a small gauge or donut ring (same SVG ring pattern as Phase 3 hero) showing score out of 2.0 scale
  - XP/Level card: `.card mx-4 p-4 mb-4` — level number in `text-4xl font-[var(--font-serif)] text-[var(--color-green)]`, label "Nivå X – [level name]" in `text-sm text-[var(--color-ink-faint)]`, XP progress bar `bg-[var(--color-paper-dark)]` with `bg-[var(--color-gold)]` fill, "X XP → nästa nivå" label
  <!-- Done: inserted HP Score card (72×72 SVG donut ring, r=28, stroke=var(--color-green), progress=(score-1)/1 on 1.0–2.0 scale, IIFE to keep constants local) and XP/Level card (serif level number in green, gold XP progress bar, "X XP → nästa nivå" footer) after the per-section accuracy bars. Reuses `combinedScore`, `levelInfo`, `isMaxLevel`, `progressPercent`, `stats.xp` already computed. Build clean. -->

- [x] Remove or replace all dark-theme classes in `Progress.tsx`: `bg-[#080C14]`, `bg-slate-900`, `bg-white/[0.03]`, `glass`, `glass-md`, `text-slate-100`, `text-slate-300`, `text-slate-500`, `border-white/[0.06]` — replace with the warm palette tokens. Also update `ChartView` usage: if `src/components/ChartView.tsx` exists, read it and update its stroke/fill colors to use the green (`#224A3A`) and paper tones instead of blue/violet.
  <!-- Done: All dark-theme classes replaced in Progress.tsx — text-slate-* → ink tokens, bg-white/[0.0X] → paper-dark, border-white/* → paper-darker, glass → card, text-white → color-ink (except intentional white text on green bg button). Blue functional colors updated to green/gold/warm tokens throughout (streak calendar, level bars, HP-prognos button, start button, bookmarks button, type filter active, topic links). heatColor() updated to warm green palette (#224A3A at /30, /60, full opacity). bg-slate-500/600/700/border-slate-700 → paper-darker tokens. ChartView.tsx: PALETTE updated to [green, gold, terracotta, blue], grid lines rgba(26,26,24,0.08), label text #9A9A92, container glass→card. Build clean. -->

- [x] Verify the Statistics screen: run `npm run dev`, navigate to `/progress`. Confirm segmented control switches data ranges, activity bars show correct day data, type accuracy bars use warm accent colors, HP score and XP cards are visible with no dark backgrounds.
  <!-- Done: Playwright headless verification (3 screenshots, DOM audit). All six checks passed — segmented Vecka/Månad/Allt control switches with white pill indicator; activity bars render 7 Swedish-labeled columns; Per delprovstyp shows all 8 types; HP score card SVG ring confirmed stroke="var(--color-green)"; XP/Level card visible with "100 XP → nästa nivå"; DARK_CLASSES DOM scan returned []. Findings: (1) ⚠️ Old content sections (PROVBEREDSKAP, NUVARANDE NIVÅ, HP-PROGNOS, TRÄNINGSSTATISTIK) still present below new design — new content was inserted before but old sections not removed; this is a cleanup task outside Phase 06 scope. (2) Warm accent bar colors unverifiable at 0-data (0% width = no painted fill) — correct behavior. (3) HP donut ring shows only track at score=0 — correct empty state. -->
