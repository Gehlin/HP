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

- [ ] Audit `src/pages/Progress.tsx` and `src/pages/Profil.tsx` for padding consistency:
  - Both should use `pt-topnav` on their outermost wrapper (added in Phase 01, but verify)
  - Content should not feel cramped at the top — add `pt-4` inside the topnav-offset wrapper if needed
  - Confirm `pb-8` is sufficient (no more `pb-28` bottom padding for the old bottom nav)

- [ ] Improve the Settings page navigation in `src/pages/Settings.tsx`:
  - The current "← Tillbaka" button at the top uses `navigate('/')` hardcoded to home. Change to `navigate(-1)` so it goes back to wherever the user came from (likely Profil tab)
  - Apply `PageHeader` component (created in Phase 03) to Settings: `<PageHeader title="Inställningar" />` — this replaces the existing manual back button and `<h1>` title at the top. Import `PageHeader` and remove the old manual button and `h1`
  - The page wrapper should also get `pt-topnav` if it doesn't have it already

- [ ] Do a final scan of all pages in `src/pages/` using Glob, then Read any page not yet touched in this playbook to confirm it has `pt-topnav` on its outermost wrapper and no remaining `pb-28` from the old bottom nav. Fix any stragglers.

- [ ] Run `npm run build` for a final clean build. Confirm zero TypeScript errors and zero ESLint errors if a lint script exists.
