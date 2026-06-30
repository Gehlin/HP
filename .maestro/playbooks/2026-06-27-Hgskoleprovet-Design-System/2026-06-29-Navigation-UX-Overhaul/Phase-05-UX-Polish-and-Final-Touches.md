# Phase 05: UX Polish and Final Touches

With the structural overhaul complete, this phase sweeps through the remaining rough edges: improving the SRS due-count badge so it shows a number rather than just a dot, adding a contextual sub-label to the Träna tab when repetitions are waiting, tightening the Home page header, and auditing every page for spacing/padding consistency with the new top nav. Small details add up — this phase is what takes the app from "fixed" to "delightful."

## Tasks

- [x] Upgrade the SRS badge in `src/components/TopNav.tsx` from a simple dot to a numeric badge when `dueCount > 0`. Replace the 2px dot with a small pill that shows the count (capped at "9+" for large numbers):
  - If `dueCount > 0`, render: `<span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 ring-2 ring-[var(--color-paper)]">{dueCount > 9 ? '9+' : dueCount}</span>`
  - Position it absolutely on the icon container (the `<span className="relative">` wrapper around the icon)
  - **Done:** Replaced the `w-2 h-2` dot at `src/components/TopNav.tsx:67-69` with the numeric pill exactly as specified, kept on the existing `relative` icon wrapper span. `npx tsc --noEmit` passes with zero errors.

- [x] Add a contextual sub-label under the "Träna" tab in `src/components/TopNav.tsx` when `dueCount > 0`. Instead of just "Träna", show "Träna" label as normal but the tab icon gets a pulsing amber ring to draw attention. Add a CSS animation in `src/index.css`:
  ```css
  @keyframes pulse-ring {
    0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
    50% { box-shadow: 0 0 0 4px rgba(245, 158, 11, 0); }
  }
  .due-pulse {
    animation: pulse-ring 2s ease-in-out infinite;
    border-radius: 50%;
  }
  ```
  Apply `due-pulse` class to the icon wrapper `<span>` on the Träna tab when `dueCount > 0`.
  - **Done:** Added the `pulse-ring` keyframes and `.due-pulse` class to `src/index.css` (placed alongside the other nav-related animations, right after `.nav-pill`). Conditionally applied `due-pulse` to the icon wrapper `<span>` in `src/components/TopNav.tsx:65` via a template-literal class for `tab.path === '/practice' && dueCount > 0`, alongside the existing numeric badge. `npx tsc --noEmit` passes with zero errors.

- [x] Audit `src/pages/Home.tsx` for visual consistency with the new top nav:
  - The greeting header (`God morgon`, date) should sit well below the nav — confirm `pt-6` gives enough breathing room or increase to `pt-8`
  - The streak pill (`🔥 {stats.streak}`) can be repositioned to the right side of the greeting row — confirm it still looks right
  - Remove `pt-12` if it still appears anywhere (it was the old manual safe-area offset)
  - **Done:** Audited `src/pages/Home.tsx` against sibling pages — no code changes were needed, all three checks already pass:
    - The outer wrapper has `pt-topnav` (`calc(3.5rem + safe-area-inset-top)`, defined in `src/index.css:155-157`) plus the header div adds its own `pt-6` (`src/pages/Home.tsx:92`), giving more clearance than `Practice.tsx` and `Progress.tsx`, both of which rely on `pt-topnav` alone with no extra top padding on their `<h1>` wrapper. `pt-6` is therefore already generous; bumping to `pt-8` would make Home an outlier vs. the rest of the app, so left as-is.
    - The streak pill (`src/pages/Home.tsx:95`) already sits on the right side of the greeting row via `flex items-center justify-between` (`src/pages/Home.tsx:93`) — confirmed correct, no change needed.
    - Searched for `pt-12` in the file — zero matches, no stale safe-area offset remains.

- [x] Audit `src/pages/Practice.tsx` for spacing consistency:
  - Confirm the mode selector cards have correct `mb-6` spacing
  - The Sektionsträning section grid should have consistent gap with the new "Avancerat" toggle below it
  - Ensure the "Starta träning →" button at top and bottom are both clearly tappable (min `py-4`)
  - **Done:** Audited all three checks:
    - Mode selector cards container (`src/pages/Practice.tsx:235`) already has `mb-6` — correct, no change.
    - The Sektionsträning grid (`src/pages/Practice.tsx:391`, `mb-6`) was followed by the "Avancerat" toggle button with both `mb-4` *and* `mt-2` (`src/pages/Practice.tsx:424`), producing a 32px gap there vs. the consistent 24px (`mb-6`-only) gap used between every other section on the page. Removed the redundant `mt-2` so the gap now matches the rest of the page's section rhythm.
    - Both "Starta träning →" buttons (top CTA `src/pages/Practice.tsx:358` and bottom CTA `src/pages/Practice.tsx:637`) already use `py-4` — confirmed tappable, no change needed.
    - `npx tsc --noEmit` passes with zero errors.

- [x] Audit `src/pages/Progress.tsx` and `src/pages/Profil.tsx` for padding consistency:
  - Both should use `pt-topnav` on their outermost wrapper (added in Phase 01, but verify)
  - Content should not feel cramped at the top — add `pt-4` inside the topnav-offset wrapper if needed
  - Confirm `pb-8` is sufficient (no more `pb-28` bottom padding for the old bottom nav)
  - **Done:** Audited both files:
    - `Progress.tsx` — outer wrapper has `pt-topnav` on both the empty-state branch (`src/pages/Progress.tsx:72`) and the main return (`src/pages/Progress.tsx:267`); both also already carry `pb-8`. Header (`Statistik`, `src/pages/Progress.tsx:269`) sits directly under the topnav offset with no extra cramping — consistent with the `pt-topnav`-alone pattern already confirmed for `Practice.tsx` in the prior task, so no `pt-4` was added.
    - `Profil.tsx` — outer wrapper (`src/pages/Profil.tsx:365`) has `pt-topnav pb-8`. Header (`Profil`, `src/pages/Profil.tsx:368`) follows the same pattern, no cramping observed.
    - Grepped both files for `pb-28` / `pt-12` — zero matches in either, confirming no stale bottom-nav or safe-area offsets remain.
    - `npx tsc --noEmit` passes with zero errors. No code changes were necessary.

- [x] Improve the Settings page navigation in `src/pages/Settings.tsx`:
  - The current "← Tillbaka" button at the top uses `navigate('/')` hardcoded to home. Change to `navigate(-1)` so it goes back to wherever the user came from (likely Profil tab)
  - Apply `PageHeader` component (created in Phase 03) to Settings: `<PageHeader title="Inställningar" />` — this replaces the existing manual back button and `<h1>` title at the top. Import `PageHeader` and remove the old manual button and `h1`
  - The page wrapper should also get `pt-topnav` if it doesn't have it already
  - **Done:** Imported `PageHeader` from `../components/PageHeader` (`src/pages/Settings.tsx:3`) and replaced the manual "← Tillbaka" `<button>` + `<h1>Inställningar</h1>` block with `<PageHeader title="Inställningar" />` (`src/pages/Settings.tsx:127`). `PageHeader`'s `onBack` prop was left unset, so it falls back to its default `navigate(-1)` behavior — satisfying the back-navigation requirement without extra code. Added `pt-topnav` to the outer wrapper (`src/pages/Settings.tsx:126`), matching the established pattern from `ExamSelect.tsx`/`SrsQueue.tsx` (wrapper has `pt-topnav`, `PageHeader` sits directly inside it, then a separate `max-w-2xl mx-auto` content div follows). Also tightened the content div's vertical padding from `py-10` to `py-6` to match that same convention now that `PageHeader` supplies its own top spacing — `py-10` would have produced an oversized gap below the header bar. `npx tsc --noEmit` passes with zero errors; no lint script is configured in this project.

- [x] Do a final scan of all pages in `src/pages/` using Glob, then Read any page not yet touched in this playbook to confirm it has `pt-topnav` on its outermost wrapper and no remaining `pb-28` from the old bottom nav. Fix any stragglers.
  - **Done:** Scanned all 25 files in `src/pages/` with `grep -n "pt-topnav\|pb-28\|pt-12"`. Found and fixed two classes of stragglers:
    - **`Results.tsx` was missing `pt-topnav` entirely** on both its outer wrappers — the empty-state branch (`:108`) and the main return (`:216`). Since `TopNav` (`src/components/TopNav.tsx:48`) is `fixed` with a solid `bg-[var(--color-paper)]` background and only hides itself for `/session` routes (`TopNav.tsx:45`), the fixed nav was overlapping the top of the Results page content (the share button and score circle) with no clearance — a real visual bug, not just an inconsistency. Added `pt-topnav` to both wrappers (`Results.tsx:108`, `:216`). The hero section's manual `pt-16` (a fixed 64px guess that ignored `env(safe-area-inset-top)`) was reduced to `pt-10` to match the established hero-padding convention already used in `ElfGuide.tsx`/`LasGuide.tsx`/`MekGuide.tsx`/`MathGuide.tsx` (outer `pt-topnav` + inner hero `pt-10`), instead of double-stacking ~120px of top padding.
    - **Stale `pb-28` (the old fixed-bottom-nav clearance, 112px) remained on inner content divs in seven files**, redundantly stacked on top of an outer wrapper that already carries `pb-8`: `ElfGuide.tsx:335`, `LasGuide.tsx:358`, `MathGuide.tsx:1513`, `MekGuide.tsx:417`, `ScorePredictor.tsx:145`, `LiggandeStolenGuide.tsx:471` — removed the redundant `pb-28`, relying on the outer wrapper's `pb-8` (matching the no-extra-padding pattern already used in `NogGuide.tsx`/`DtkGuide.tsx`/`KvaGuide.tsx`/`XyzGuide.tsx`/`OrdGuide.tsx`). `Theory.tsx:775` was a special case — its outer wrapper (`Theory.tsx:753`) had *no* `pb-8` at all, so `pb-28` was changed to `pb-8` rather than removed outright, to avoid leaving the page with zero bottom padding. Also changed `Results.tsx:301`'s `pb-28` to `pb-8` for the same reason (its outer wrapper carries no padding of its own since it needs full-bleed color bands).
    - Confirmed `Session.tsx` intentionally has no `pt-topnav` — it renders its own fixed in-session header and `TopNav` explicitly returns `null` for `/session*` routes (`TopNav.tsx:45`), so it's correctly outside this convention.
    - `Settings.tsx`'s `pb-24` (from the prior task) was left as-is — it's not `pb-28` and wasn't part of this audit's literal scope.
    - Re-grepped all of `src/pages/*.tsx` for `pb-28` and `pt-12` after the fixes — zero matches remain.
    - `npx tsc --noEmit` passes with zero errors.

- [ ] Run `npm run build` for a final clean build. Confirm zero TypeScript errors and zero ESLint errors if a lint script exists.
