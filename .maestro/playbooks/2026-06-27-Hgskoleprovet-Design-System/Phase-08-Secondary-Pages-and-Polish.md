# Phase 08: Secondary Pages & Polish

This phase applies the warm design system to every remaining screen that still uses the dark theme. It covers the theory hub, all 9 topic guides, the verbal/quant hubs, exam flow (ExamSelect, ExamStart), SRS queue, bookmarks, OrdBuilder, ScorePredictor, and the Onboarding component. It also does a final sweep to remove any remaining dark-theme Tailwind classes across the codebase. By the end of this phase, every screen in the app uses the warm paper palette with no dark backgrounds remaining.

## Tasks

- [x] Read `src/pages/Theory.tsx` and update it: replace `bg-[#080C14]`/`bg-hero`/`.glass` with `bg-app`/`.card` equivalents. Section links should be `.card p-4 mb-3` rows with type accent color dot, section name in `text-[var(--color-ink)]`, description in `text-[var(--color-ink-faint)]`, chevron on right. Page title "Teori" in `text-2xl font-[var(--font-serif)] text-[var(--color-ink)] px-4 pt-12 pb-4`. Remove any dark gradient backgrounds.
  <!-- Done: Replaced all dark theme classes (text-white, text-slate-*, border-white/*, bg-[#080C14], .glass, bg-white/*) with warm palette equivalents. Banner components converted to .card rounded-2xl rows with accent-color dot + ChevronRight. TYPE_COLOR/TAB_UNDERLINE updated to warm hex values. Build passes. -->

- [x] Update all 9 topic guide pages: read each file and replace dark-theme classes with warm ones. The files are:
  - `src/pages/MathGuide.tsx`, `src/pages/KvaGuide.tsx`, `src/pages/XyzGuide.tsx`, `src/pages/DtkGuide.tsx`, `src/pages/NogGuide.tsx`
  - `src/pages/LasGuide.tsx`, `src/pages/OrdGuide.tsx`, `src/pages/MekGuide.tsx`, `src/pages/ElfGuide.tsx`
  - `src/pages/LiggandeStolenGuide.tsx`
  - For each: replace `bg-slate-900`/`bg-[#080C14]`/`.glass` with `bg-[var(--color-paper)]`/`.card`. Replace `text-slate-100`/`text-slate-300` with `text-[var(--color-ink)]`/`text-[var(--color-ink-muted)]`. Replace `border-white/[0.06]`/`border-slate-700` with `border-[var(--color-card-border)]`. Replace colored accents (`text-violet-400` etc.) with the warm hex equivalents from the Phase 3 accent map.
  <!-- Done: Applied warm theme to all 10 guide files (9 topic guides + LiggandeStolenGuide). Root containers changed to bg-app text-[var(--color-ink)]. .glass→.card, text-slate-* → ink tokens, border-white/* → color-card-border. MathGuide: TYPE_PILL/TIER_META constants updated to light-mode pill colors (bg-violet-50 text-violet-700), quiz feedback updated to emerald-50/red-50, bg-white/* alpha → paper tokens, all -400 accent text → -600/-700 for contrast on paper. LiggandeStolenGuide active tab: text-white→ink, border-white/[0.15]→color-card-border. OrdGuide emphasis text and hover fixed. Build passes. -->

- [x] Update `src/pages/VerbalHub.tsx` and `src/pages/QuantHub.tsx`: read both and apply the same warm-theme class replacements as the guides above. These are hub/overview pages — ensure section cards use `.card`, headings use `font-[var(--font-serif)]`, and any hero header areas use a subtle `bg-[var(--color-green-muted)]` tint instead of dark gradients.
  <!-- Done: Both files already fully converted to warm design system. Root containers use bg-app text-[var(--color-ink)], section cards use .card rounded-2xl, headings use font-[var(--font-serif)], all text uses ink tokens, borders use color-card-border, action buttons use btn-primary. No dark classes (bg-slate-*, text-slate-*, bg-[#080C14], .glass, border-white/*) found. Type-specific warm pill colors used for header badges (rose-50/rose-200 for Verbal, blue-50/blue-200 for Quant). -->

- [x] Update the exam flow pages. Read `src/pages/ExamSelect.tsx` and `src/pages/ExamStart.tsx`:
  - `ExamSelect`: exam cards should be `.card p-4 mb-3` with title, date, question count. Action button: `btn-primary w-full mt-4`
  - `ExamStart`: this is a full exam session runner similar to Session.tsx — apply the same fixed header (progress bar + timer) and fixed footer (Next button) treatment from Phase 4. Replace all dark classes with warm palette.
  <!-- Done: ExamSelect — TYPE_PILL updated to warm light-mode pill colors (bg-*-50/text-*-700/border-*-200), root uses text-[var(--color-ink)], back button uses ink-faint tokens, badge updated to bg-blue-50/border-blue-200/text-blue-700, Full HP-dag hero uses .card with indigo-600 label, section toggle uses var(--color-green) for quant active and terracotta for verbal active, all exam cards restructured to .card p-4 mb-3 with btn-primary w-full mt-4 action button, dark glass/border-white/* removed. ExamStart — TYPE_COLORS updated to warm (text-*-700/border-*-200/bg-*-50), all .glass→.card, border-white/*→border-[var(--color-card-border)], divide-white/*→divide-[var(--color-card-border)], text-slate-*→ink tokens, text-white→text-[var(--color-ink)], CTA button uses btn-primary w-full, pass header badges keep rose/blue colored circles with text-white for contrast. Build passes. -->

- [x] Update `src/pages/SrsQueue.tsx` and `src/pages/Bookmarks.tsx`: read both files and replace dark-theme classes with warm equivalents. Question cards in both should use `.card p-4 mb-3`. Empty state illustrations/messages: use `text-[var(--color-ink-faint)]`. Action buttons: `btn-primary` or `btn-ghost`.
  <!-- Done: SrsQueue — TYPE_COLORS updated to warm (text-*-700, bg-*-50, border-*-200), root text-white→text-[var(--color-ink)], all .glass→.card, text-slate-*→ink tokens, border-white/*→color-card-border, bg-white/*→color-paper-dark, bg-slate-700→color-paper-dark, text-emerald-400→emerald-700, text-amber-400→amber-600, text-red-400→red-600, amber header badge updated to bg-amber-50/border-amber-200/text-amber-700, ring-white/20 removed from type filter, due count text-white→ink. Bookmarks — TYPE_PILL and FILTER_ACTIVE updated to bg-*-50/text-*-700/border-*-200, root text-white→ink, all .glass→.card, border-white/*→color-card-border, bg-white/*→color-paper-dark, text-slate-*→ink tokens, correct answer card updated to border-emerald-200/bg-emerald-50, wrong answer key bg-white/*→color-paper-dark, drill button bg-blue-600→btn-primary, empty state button→btn-primary. Build passes. -->

- [ ] Update `src/pages/OrdBuilder.tsx` and `src/pages/ScorePredictor.tsx`: read both and apply warm theme. OrdBuilder word cards: `.card p-3` with `text-[var(--color-ink)]`. ScorePredictor: the score gauge and inputs use `var(--color-green)` for active/filled states, paper tones for tracks.

- [ ] Update `src/components/Onboarding.tsx`: read the file, then replace the dark modal overlay (`bg-black/80`, `bg-slate-900`, `border-slate-700`) with warm equivalents:
  - Modal card: `bg-[var(--color-card)] border border-[var(--color-card-border)] rounded-3xl`
  - Text: `text-[var(--color-ink)]` / `text-[var(--color-ink-muted)]`
  - Primary button: `btn-primary`
  - Progress dots: active dot `bg-[var(--color-green)]`, inactive `bg-[var(--color-paper-dark)]`
  - Focus preference chips: same warm-accent style as Phase 4 type chips

- [ ] Update `src/components/InstallBanner.tsx` and `src/components/AchievementToast.tsx` if they use dark classes. Read both files:
  - InstallBanner: replace dark glass with `.card` + green CTA button (`btn-primary`)
  - AchievementToast: replace `bg-slate-900` with `bg-[var(--color-card)]`, accent colors with warm terracotta/gold, text with ink tokens

- [ ] Run a codebase-wide dark-class sweep using grep. Search for remaining instances of these patterns across all files in `src/`:
  - `bg-\[#080C14\]` — replace with `bg-[var(--color-paper)]` or `bg-app`
  - `bg-slate-900` — replace with `bg-[var(--color-card)]`
  - `bg-slate-800` — replace with `bg-[var(--color-paper-dark)]`
  - `text-slate-100` — replace with `text-[var(--color-ink)]`
  - `text-slate-300` — replace with `text-[var(--color-ink-muted)]`
  - `text-slate-500`, `text-slate-600` — replace with `text-[var(--color-ink-faint)]`
  - `border-white/\[0.06\]`, `border-white/\[0.07\]`, `border-white/\[0.08\]`, `border-white/\[0.09\]` — replace with `border-[var(--color-card-border)]`
  - `ring-\[#080C14\]` (used for badge rings) — replace with `ring-[var(--color-paper)]`
  - Fix each occurrence found — do not leave dark-theme stragglers

- [ ] Run `npm run build` to check for TypeScript errors and ensure there are no broken imports from the refactoring across all 8 phases. Fix any type errors found. Then run `npm run dev` and do a full manual smoke test: Home → Practice → Session (answer 3 questions) → Results → Statistics → Profile → tap each Profile menu item → verify all screens are warm-themed with no dark backgrounds remaining.
