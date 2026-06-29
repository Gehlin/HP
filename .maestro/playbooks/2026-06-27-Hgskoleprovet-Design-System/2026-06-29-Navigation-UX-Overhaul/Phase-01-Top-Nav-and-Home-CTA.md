# Phase 01: Top Navigation Bar + Home Hero CTA

This phase delivers the biggest visible transformation: ripping out the bottom tab bar and replacing it with a clean sticky top navigation, then adding a prominent "Starta träning →" call-to-action on the Home page so users know exactly where to start. By the end of this phase the app looks and feels like a polished mobile product — the kind of change that makes the user go "oh wow, this is so much better."

## Tasks

- [x] Add a CSS utility class to `src/index.css` for top-nav offset. Inside the existing utilities block, add:
  ```css
  .pt-topnav {
    padding-top: calc(3.5rem + env(safe-area-inset-top, 0px));
  }
  ```
  This will be used by all page wrappers to clear the fixed nav.

- [x] Create `src/components/TopNav.tsx`. This replaces `BottomNav.tsx` entirely. Requirements:
  - `fixed top-0 inset-x-0 z-50` positioning
  - Inner wrapper: `pt-safe` (or inline style `paddingTop: 'env(safe-area-inset-top, 0px)'`) to handle iOS status bar
  - Background `bg-[var(--color-paper)]`, bottom border `border-b border-[var(--color-card-border)]`
  - Max-width `max-w-2xl mx-auto` inner container using `flex items-stretch`
  - Left slot: "HP" in `font-[var(--font-serif)] font-black text-lg text-[var(--color-green)]` with `px-4 flex items-center`
  - Tab area: `flex flex-1 justify-end` containing the four tabs
  - Four tabs: Hem (`/`), Träna (`/practice`), Statistik (`/progress`), Profil (`/profil`)
  - Reuse the same SVG icons from `BottomNav.tsx` (HomeIcon, PracticeIcon, StatsIcon, ProfileIcon)
  - Each tab: `flex flex-col items-center justify-center gap-0.5 px-3 py-2 relative group min-w-[3.5rem]`
  - Active state: `text-[var(--color-green)]` for icon and label; inactive: `text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-muted)]`
  - Active indicator: `absolute bottom-0 inset-x-3 h-[2px] bg-[var(--color-green)] rounded-full` (line at the bottom of the tab, not the top)
  - Label: `text-[10px] font-medium leading-none` — use "Hem", "Träna", "Statistik", "Profil"
  - SRS due badge: same logic as BottomNav — amber dot `absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[var(--color-paper)]` on the Träna icon when `dueCount > 0`
  - Return `null` when `location.pathname.startsWith('/session')` (same as BottomNav)
  - Also hide on sub-routes: `/exam/`, `/srs`, `/bookmarks`, `/results` — return null if `inSession || location.pathname.startsWith('/exam/') || ['/srs', '/bookmarks', '/results'].some(p => location.pathname.startsWith(p))`... actually just keep it visible on all non-session routes for now — inner pages have their own back nav. Only hide during `/session`.

- [x] Update `src/App.tsx`:
  - Replace `import BottomNav from './components/BottomNav'` → `import TopNav from './components/TopNav'`
  - Replace `{!inSession && <BottomNav />}` → `<TopNav />` (TopNav handles its own visibility via the null return)
  - No other changes needed

- [x] Update `src/pages/Home.tsx` layout and add the CTA hero:
  - Change the outer div from `min-h-screen bg-app pb-28` → `min-h-screen bg-app pb-8`
  - Change the header div from `px-4 pt-12 pb-4 max-w-2xl mx-auto` → `px-4 pt-6 pb-4 max-w-2xl mx-auto` — the `pt-topnav` goes on the outermost div instead. So outer div becomes `min-h-screen bg-app pb-8 pt-topnav`
  - Directly after the opening `<div className="max-w-2xl mx-auto px-4">` (i.e., before the hero score card), insert a prominent CTA card:
    ```tsx
    <button
      onClick={() => navigate('/practice')}
      className="w-full btn-primary py-4 text-base font-bold mb-4 rounded-2xl"
    >
      Starta träning →
    </button>
    ```
  - Keep all existing content (score card, resume card, section grid) as-is

- [x] Update `src/pages/Practice.tsx` layout:
  - Change outer div class from `min-h-screen bg-app pb-28 px-4 pt-12 max-w-2xl mx-auto` → `min-h-screen bg-app pb-8 px-4 pt-6 max-w-2xl mx-auto pt-topnav` — but note `pt-topnav` and `pt-6` conflict. Use a wrapper pattern: outer div `min-h-screen bg-app pt-topnav`, inner div `max-w-2xl mx-auto px-4 pb-8`
  - Update the `<h1>` text from "Öva" → "Träna"
  - Also removed stale `inSession`/`useLocation` from `App.tsx` (left over from BottomNav→TopNav swap, caused TS6133 build error)

- [x] Update `src/pages/Progress.tsx` layout:
  - Find the outermost page div and replace `pb-28` with `pb-8`, and the top padding (usually `pt-12` or `py-8`) with `pt-topnav` on the outermost wrapper. Read the file first to identify the exact class string.
  <!-- Done: outer div `min-h-screen bg-app pb-28` → `min-h-screen bg-app pb-8 pt-topnav`; inner header div `px-4 pt-12 pb-4 max-w-2xl mx-auto` → `px-4 pb-4 max-w-2xl mx-auto` (pt-12 removed, topnav offset now on outermost wrapper). -->

- [ ] Update `src/pages/Profil.tsx` layout:
  - Same pattern — replace bottom nav clearance `pb-28` with `pb-8`, and add `pt-topnav` to the outermost div. Read the file to identify exact class strings.

- [ ] Run `npm run build` in the project root to verify no TypeScript or Tailwind errors. Fix any import errors or type issues that surface.
