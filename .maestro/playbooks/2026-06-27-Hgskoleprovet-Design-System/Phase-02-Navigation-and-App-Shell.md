# Phase 02: Navigation & App Shell

This phase rebuilds the bottom navigation bar from the current 5-tab dark design (Hem / Öva / Statistik / Teori / Mer) into the 4-tab warm design (Hem / Öva / Statistik / Profil) from the design handoff. The "Teori" tab content moves into a section inside the new Profil screen; bookmarks, SRS queue, and settings also live under Profil. The nav uses a warm paper background, a forest-green top indicator for the active tab, and green text on active items. This phase also scaffolds a basic `/profil` route so the tab is immediately clickable.

## Tasks

- [x] Read `src/components/BottomNav.tsx` in full, then rewrite it completely. The new component must:
  - Define 4 tabs with paths and labels: `{ path: '/', label: 'Hem' }`, `{ path: '/practice', label: 'Öva' }`, `{ path: '/progress', label: 'Statistik' }`, `{ path: '/profil', label: 'Profil' }`
  - Remove all references to the `/theory` route and the "Mer" drawer (the `showMore` state, `moreRef`, MORE_PATHS, the drawer JSX block)
  - Keep `getDueQuestions` badge on the Öva tab (amber dot indicator, same logic as before)
  - Use inline SVG icons for each tab: Home (house), Practice (pencil), Stats (bar chart), Profile (person silhouette/circle)
  - Bottom bar background: `bg-[var(--color-paper)]` with `border-t border-[var(--color-card-border)]`
  - Active tab: top green line `bg-[var(--color-green)]` (same `nav-pill` animation class), text color `text-[var(--color-green)]`
  - Inactive tab: text color `text-[var(--color-ink-faint)]`
  - Keep `pb-safe` utility on the nav wrapper
  - Keep hiding the nav when `location.pathname.startsWith('/session')`

- [x] Create `src/pages/Profil.tsx` as a scaffold placeholder. It should render a minimal warm-themed page:
  - Same `bg-app` + `min-h-screen` + `pb-24` wrapper as other pages
  - A top heading "Profil" in `font-[var(--font-serif)]` text-2xl text-`[var(--color-ink)]`
  - Three tappable rows in an iOS-style list card (white background, green borders):
    - "Teori" → navigate to `/theory`
    - "Bokmärken" → navigate to `/bookmarks`
    - "Inställningar" → navigate to `/settings`
    - "Repetitionskö" → navigate to `/srs`
  - Each row: flex, gap-3, icon on left (simple SVG), label in `text-[var(--color-ink)]`, chevron `›` on right in `text-[var(--color-ink-faint)]`
  - Wrap rows in a `div` with `bg-[var(--color-card)] rounded-2xl border border-[var(--color-card-border)]`
  - Add `px-4 pt-14 pb-8` padding and `max-w-2xl mx-auto`

- [ ] Register the `/profil` route in `src/App.tsx`:
  - Import `Profil` lazily: `const Profil = lazy(() => import('./pages/Profil'))`
  - Add `<Route path="/profil" element={<Profil />} />` inside the `<Routes>` block
  - Keep all existing routes unchanged

- [ ] Update `MORE_PATHS` active-detection logic removal: since the Mer tab is gone, remove the `isMoreActive` logic and the separate "Mer" button from the old BottomNav. The new `/profil` path should be considered active when `location.pathname === '/profil'` — handled naturally by the generic tab active check in the rewritten component.

- [ ] Verify the navigation works: run the dev server (`npm run dev`) and confirm all 4 tabs are visible with warm paper background, tapping each tab navigates correctly, the active tab shows a green top indicator and green text, and the Profil tab opens the placeholder page with its menu rows.
