# Phase 07: Profile Screen (Profil)

This phase builds out the full Profil screen (currently a placeholder from Phase 2) into a complete, polished page matching the design handoff: a user profile card at the top, a forest-green goal/exam-date card below it, two iOS-style grouped settings sections (Studieverktyg and Inställningar) with individual tappable rows and toggles, and a data-management section at the bottom. The profile page replaces the separate Settings page as the primary user control center, while `/settings` remains accessible for backward compatibility.

## Tasks

- [x] Read `src/pages/Settings.tsx` fully to understand all settings controls: exam date picker, notification toggle, focus preference selector, data export/import/reset buttons. Also read the placeholder `src/pages/Profil.tsx` from Phase 2. You'll move relevant settings logic into Profil.tsx and keep Settings.tsx for deep-link compatibility.
  <!-- Done: Read both files. Settings.tsx exports data via exportData(), handles import via FileReader, toggles notifications with requestNotificationPermission()/disableNotifications(), and manages focus via setFocusPreference(). Profil.tsx is a minimal placeholder with 4 nav rows. BottomNav.tsx already has no THEORY_PREFIXES — active detection is already clean. loadStats() returns {xp,streak,lastPracticeDate,longestStreak}; sessions count from loadHistory().length. -->

- [x] Rewrite `src/pages/Profil.tsx` with a proper page structure. Page root: `min-h-screen bg-app pb-28`. All content inside `max-w-2xl mx-auto px-4 pt-12`:
  - Page title section: `flex items-center justify-between mb-6` — "Profil" in `text-2xl font-[var(--font-serif)] text-[var(--color-ink)]`
  <!-- Done: Replaced old MENU_ROWS placeholder with clean page shell — min-h-screen bg-app pb-28 root, max-w-2xl mx-auto px-4 pt-12 inner wrapper, and title h1 with correct font/color tokens. Content sections to be added in subsequent tasks. -->

- [x] Build the profile card in `Profil.tsx`. A `.card p-5 mb-4` white card:
  - Avatar: a 64px circle `bg-[var(--color-green)]` with initials "HP" in white serif text (no real user account needed — it's a local app)
  - Name row: "HP Träning" in `text-lg font-semibold text-[var(--color-ink)]`
  - Stats row: `flex gap-4 mt-2` — three mini-stats pulled from `loadStats()`:
    - Total questions answered: `text-sm font-semibold text-[var(--color-ink)]` over `text-xs text-[var(--color-ink-faint)]` "Frågor"
    - Current streak: value + "Streak"
    - Sessions completed: value + "Sessioner"
  <!-- Done: Added profile card with green 64px avatar circle showing "HP" initials in serif font, "HP Träning" name row, and stats row with totalQuestions (summed from loadHistory answers), streak (from loadStats), and sessions count. -->


- [x] Build the forest-green goal card in `Profil.tsx`. A `card-green p-5 mb-6` card:
  - Icon: calendar SVG (white/70 tint)
  - Title: "Ditt mål" in `text-base font-semibold text-white`
  - If exam date set: "HP den [date]" in `text-sm text-white/80` + "X dagar kvar" in `text-sm text-white/60`
  - If no exam date: "Ange ditt provdatum" prompt in `text-sm text-white/70`
  - Edit button: `text-xs text-white/60 underline mt-2` "Ändra datum" — opens a modal or inline date picker. Reuse `setExamDate`/`clearExamDate`/`KNOWN_HP_DATES` from `src/utils/examDate.ts`
  - Date picker modal (if tapping "Ändra datum"): simple modal with `.card` background, list of upcoming HP dates from `KNOWN_HP_DATES`, confirm button with `btn-primary`
  <!-- Done: Added forest-green goal card with inline CalendarIcon SVG, Swedish date formatting via toLocaleDateString('sv-SE'), conditional display (exam date + days-left vs. "Ange ditt provdatum"), "Ändra datum" button that opens a bottom sheet modal. Modal lists all KNOWN_HP_DATES as selectable buttons plus an "Inget datum" option, with Avbryt/Bekräfta actions. State updates Profil.tsx directly without page reload. TypeScript clean. -->

- [x] Build the first iOS-style settings group "Studieverktyg" in `Profil.tsx`. A `.card mb-4 overflow-hidden` card with no padding — each row has `px-4 py-3.5 flex items-center gap-3` and `border-b border-[var(--color-card-border)]` (except last row):
  - Row "Teori & guider" → icon (book SVG), label, chevron → `navigate('/theory')`
  - Row "Bokmärken" → icon (bookmark SVG), label + count badge if bookmarks exist, chevron → `navigate('/bookmarks')`
  - Row "Repetitionskö" → icon (clock/refresh SVG), label + count badge if due questions exist, chevron → `navigate('/srs')`
  - Row "Provsimulatorn" → icon (timer SVG), label, chevron → `navigate('/exam-select')`
  - Row "Ordbyggaren" → icon (type SVG), label, chevron → `navigate('/ord-builder')`
  - Row "HP-poängprediktor" → icon (chart SVG), label, chevron → `navigate('/score')`
  - Import `getDueQuestions` and `getBookmarks` for badge counts
  <!-- Done: Added reusable SettingsRow component with icon/label/badge/chevron. Six inline SVG icons (Book, Bookmark, Clock, Timer, Type, Chart). dueCount via getDueQuestions(allQuestionIds) and bookmarkCount via getBookmarks() computed with useMemo. Section header label "STUDIEVERKTYG" above the card. TypeScript clean, committed and pushed. -->

- [x] Build the second iOS-style settings group "Inställningar" in `Profil.tsx`. Same `.card mb-4 overflow-hidden` structure:
  - Row "Aviseringar": label + iOS toggle switch (a `button` that visually switches between on/off, using `bg-[var(--color-green)]` when on and `bg-[var(--color-paper-darker)]` when off). Toggle state from `localStorage` key `'hp_notif_enabled'`. On toggle: call `requestNotificationPermission()` from `src/utils/notifications.ts` if enabling, update `localStorage`.
  - Row "Fokusprioritet": label + current focus value shown as a chip, tapping opens a small action sheet (bottom modal) with the 3 focus options from `src/utils/focusPreference.ts`. Update via `setFocusPreference()`.
  <!-- Done: Added BellIcon, SlidersIcon, IOSToggle (50×28px pill with animated white circle), FocusChip (green tinted pill). Extended SettingsRowProps with optional `right` override that replaces badge+chevron when provided. "Aviseringar" row uses IOSToggle as right; toggle calls requestNotificationPermission()/disableNotifications() and updates notifEnabled state. "Fokusprioritet" row shows FocusChip (when set) + ChevronIcon; tapping opens a bottom-sheet modal with Kvantitativ/Verbal/Båda options (selected highlights in green), persisted via setFocusPreference(). TypeScript clean. -->

- [ ] Build the data-management section at the bottom of `Profil.tsx`. A `.card mb-4 overflow-hidden` card:
  - Row "Exportera data" → triggers `JSON.stringify(allLocalStorageData)` download (reuse logic from `Settings.tsx`)
  - Row "Importera data" → hidden file input `<input type="file" accept=".json">`, triggers parse & restore (reuse logic from `Settings.tsx`)
  - Row "Återställ all data" → shows a confirmation modal before calling `localStorage.clear()` and reloading. Modal: `.card-green` or `bg-[var(--color-terracotta)]` warning styling, "Säker?" title, confirm + cancel buttons.
  - Import all relevant utility functions already used in `Settings.tsx`

- [ ] Update the `THEORY_PREFIXES` active-detection in `src/components/BottomNav.tsx`: since Teori tab is gone, these paths no longer need to highlight a nav tab. The active check for each tab should be clean: `/` (exact), `/practice` (starts-with), `/progress` (starts-with), `/profil` (starts-with). Remove the `THEORY_PREFIXES` constant from BottomNav if it's still there from Phase 2.

- [ ] Verify the Profile screen: run `npm run dev`, tap the Profil tab, confirm profile card shows stats, green goal card shows exam date (or prompt), both settings groups display correctly, toggles are interactive, and navigation rows open the correct pages.
