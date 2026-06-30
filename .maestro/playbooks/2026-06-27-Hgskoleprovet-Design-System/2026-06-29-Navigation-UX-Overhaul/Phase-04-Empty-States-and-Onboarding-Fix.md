# Phase 04: Empty States + Onboarding Replay Fix

Two problems make the app feel broken for new users: the Home page shows a score card full of zeros with no explanation, and the "Visa introduktion igen" button in Settings is silently broken (it clears localStorage and navigates to `/` but the onboarding state in `AppInner` is initialized once and never re-reads from localStorage). This phase adds friendly empty states across the app and properly fixes the onboarding replay flow.

## Tasks

- [x] Fix the onboarding replay in `src/pages/Settings.tsx`. The current code does:
  ```tsx
  onClick={() => { localStorage.removeItem(KEYS.onboarding); navigate('/') }}
  ```
  This doesn't work because `AppInner` reads `isOnboardingDone()` only once via `useState`. Fix by replacing `navigate('/')` with `window.location.href = '/'` — this triggers a full page reload, so `AppInner` re-initializes its state and sees the cleared localStorage key:
  ```tsx
  onClick={() => { localStorage.removeItem(KEYS.onboarding); window.location.href = '/' }}
  ```
  **Done:** Updated `src/pages/Settings.tsx:289` to use `window.location.href = '/'` instead of `navigate('/')`. Verified with `tsc --noEmit` that no type errors were introduced; `navigate` is still used elsewhere in the file so no unused-import issue.

- [ ] Add a first-use empty state to `src/pages/Home.tsx`. Load `loadHistory()` in the existing `useEffect` (it's already called there). Derive `const hasHistory = history.length > 0`. Conditionally render a welcome card ABOVE the hero score card when `!hasHistory`:
  ```tsx
  {!hasHistory && (
    <div className="card p-5 mb-4 border-l-4 border-l-[var(--color-green)]">
      <div className="text-sm font-bold text-[var(--color-ink)] mb-1">Välkommen! Kom igång nu.</div>
      <p className="text-xs text-[var(--color-ink-faint)] mb-3 leading-relaxed">
        Du har inte tränat än. Starta ett pass för att se dina framsteg här.
      </p>
      <button onClick={() => navigate('/practice')} className="btn-primary text-sm py-2 px-4">
        Starta ditt första pass →
      </button>
    </div>
  )}
  ```
  Store `hasHistory` in state (derive from the history loaded in `useEffect`) and initialize to `false` so the welcome card shows on first render.

- [ ] Add an empty state to `src/pages/Progress.tsx`. Read the file to find where the history/stats data is loaded. Add a check: if `history.length === 0`, render a full-page empty state instead of the charts:
  - A simple centered layout with an icon (e.g. chart bars SVG), heading "Inga träningspass än", body "Gör ditt första pass för att se statistik här.", and a button "Starta träning →" that navigates to `/practice`
  - Use `pt-topnav` on the wrapper, apply consistent card styling

- [ ] Add an empty state to `src/pages/Bookmarks.tsx`. Read the file to find where `getBookmarks()` is called. When the bookmarks array is empty, show instead of the list:
  - Centered layout: bookmark icon SVG, heading "Inga bokmärken än", body "Tryck på bokmärkesikonen på en fråga för att spara den här.", button "Öva nu →" navigating to `/practice`

- [ ] Add an empty state to `src/pages/SrsQueue.tsx`. Read the file to find the due-questions loading. When no questions are due, show:
  - Centered layout: ↻ icon or checkmark, heading "Inget att repetera idag!", body "Du är à jour. Kom tillbaka imorgon för fler repetitioner.", a smaller note with the next due time if available
  - Keep the existing logic for when due questions exist

- [ ] Add an exam date prompt to `src/pages/Home.tsx`. This shows only when no exam date is set AND the user has some history (showing it on first use would be overwhelming). After the "Starta träning" hero button, conditionally render:
  ```tsx
  {hasHistory && !examDate && (
    <button
      onClick={() => navigate('/profil')}
      className="w-full card p-4 mb-4 text-left flex items-center justify-between gap-3 border border-amber-500/30 bg-amber-500/5"
    >
      <div>
        <div className="text-sm font-semibold text-[var(--color-ink)]">Ange ditt provdatum</div>
        <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">Se nedräkning och anpassa träningsplanen</div>
      </div>
      <span className="text-amber-600 text-lg shrink-0">→</span>
    </button>
  )}
  ```

- [ ] Run `npm run build` to verify no TypeScript errors.
