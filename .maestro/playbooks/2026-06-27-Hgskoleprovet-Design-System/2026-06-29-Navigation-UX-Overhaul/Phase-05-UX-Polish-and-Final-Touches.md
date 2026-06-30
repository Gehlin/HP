# Phase 05: UX Polish and Final Touches

With the structural overhaul complete, this phase sweeps through the remaining rough edges: improving the SRS due-count badge so it shows a number rather than just a dot, adding a contextual sub-label to the Träna tab when repetitions are waiting, tightening the Home page header, and auditing every page for spacing/padding consistency with the new top nav. Small details add up — this phase is what takes the app from "fixed" to "delightful."

## Tasks

- [x] Upgrade the SRS badge in `src/components/TopNav.tsx` from a simple dot to a numeric badge when `dueCount > 0`. Replace the 2px dot with a small pill that shows the count (capped at "9+" for large numbers):
  - If `dueCount > 0`, render: `<span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-amber-500 text-white text-[9px] font-black flex items-center justify-center px-0.5 ring-2 ring-[var(--color-paper)]">{dueCount > 9 ? '9+' : dueCount}</span>`
  - Position it absolutely on the icon container (the `<span className="relative">` wrapper around the icon)
  - **Done:** Replaced the `w-2 h-2` dot at `src/components/TopNav.tsx:67-69` with the numeric pill exactly as specified, kept on the existing `relative` icon wrapper span. `npx tsc --noEmit` passes with zero errors.

- [ ] Add a contextual sub-label under the "Träna" tab in `src/components/TopNav.tsx` when `dueCount > 0`. Instead of just "Träna", show "Träna" label as normal but the tab icon gets a pulsing amber ring to draw attention. Add a CSS animation in `src/index.css`:
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

- [ ] Audit `src/pages/Home.tsx` for visual consistency with the new top nav:
  - The greeting header (`God morgon`, date) should sit well below the nav — confirm `pt-6` gives enough breathing room or increase to `pt-8`
  - The streak pill (`🔥 {stats.streak}`) can be repositioned to the right side of the greeting row — confirm it still looks right
  - Remove `pt-12` if it still appears anywhere (it was the old manual safe-area offset)

- [ ] Audit `src/pages/Practice.tsx` for spacing consistency:
  - Confirm the mode selector cards have correct `mb-6` spacing
  - The Sektionsträning section grid should have consistent gap with the new "Avancerat" toggle below it
  - Ensure the "Starta träning →" button at top and bottom are both clearly tappable (min `py-4`)

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
