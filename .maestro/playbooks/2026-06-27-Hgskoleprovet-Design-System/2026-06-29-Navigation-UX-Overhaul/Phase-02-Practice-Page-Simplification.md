# Phase 02: Practice Page Simplification

The Practice page currently overwhelms new users with 6+ configuration panels before they can start a single question. This phase collapses all advanced configuration behind an "Avancerat ▾" toggle, so the default view is clean and inviting: just pick a mode, see the quick-start shortcuts, and hit "Starta träning." Power users can still access every filter by expanding the advanced section. The page title and tab label are also updated from "Öva" to "Träna" — a word that more clearly communicates active practice.

## Tasks

- [x] Confirm the tab label in `src/components/TopNav.tsx` uses "Träna" (not "Öva") for the `/practice` tab. If Phase 01 used "Öva", change it to "Träna" now. Also confirm the `<h1>` in `src/pages/Practice.tsx` reads "Träna".
  <!-- Done: TopNav.tsx line 36 already has label: 'Träna' for /practice. Practice.tsx line 231 h1 already reads "Träna". No changes needed. -->

- [x] Add `advancedOpen` state to `src/pages/Practice.tsx`. Insert near the top of the component, alongside the other `useState` calls:
  ```tsx
  const [advancedOpen, setAdvancedOpen] = useState(false)
  ```
  Also auto-open advanced if `typeParam` or `tagParam` are set (the URL deep-link case):
  ```tsx
  const [advancedOpen, setAdvancedOpen] = useState(() => !!(typeParam || tagParam))
  ```
  <!-- Done: Added `advancedOpen` state at Practice.tsx line 94, after studyMode. Initializes to true when typeParam or tagParam URL params are present. -->

- [x] In `src/pages/Practice.tsx`, wrap the following sections inside a conditional `{advancedOpen && (...)}` block. These are the sections to hide by default:
  - "Delprov" question type chip selector (the `SectionLabel` + chip row for types)
  - "Svårighetsgrad" difficulty selector
  - "Ämnesfilter" tag filter
  - "Antal frågor" count slider
  - "Tidsgräns" timer toggle
  - "Återkoppling" feedback toggle
  - "Studieläge" toggle button
  
  Keep always visible: the mode selector cards (Övning / Provläge / Spaced Repetition), the quick-drill shortcut cards (Fokusträning, Öva på dina fel, Bokmärkta frågor), and the Sektionsträning grid.
  <!-- Done: Wrapped all 7 advanced sections in `{advancedOpen && (<>...</>)}` on lines 410–603 of Practice.tsx. The `{available === 0}` warning remains always visible. Build has one TS6133 warning (`setAdvancedOpen` unused) — expected intermediate state, will be resolved when task 4 adds the toggle button that calls it. -->

- [x] Add an "Avancerat" toggle button in `src/pages/Practice.tsx` between the Sektionsträning grid and the conditionally-shown advanced section. This button expands/collapses the advanced section:
  ```tsx
  <button
    onClick={() => setAdvancedOpen(prev => !prev)}
    className="w-full flex items-center justify-between text-[10px] font-bold tracking-widest text-[var(--color-ink-faint)] uppercase mb-4 mt-2"
  >
    <span>Avancerat</span>
    <span className="text-[var(--color-ink-muted)]">{advancedOpen ? '▲' : '▼'}</span>
  </button>
  ```
  <!-- Done: Added inside the `{mode !== 'repetition'}` block at Practice.tsx, just before the `{advancedOpen && ...}` conditional. Shows ▼ when collapsed, ▲ when expanded. Build passes. -->

- [x] Move the "Starta träning →" button in `src/pages/Practice.tsx` to appear right after the mode selector cards (and quick-drill shortcuts), BEFORE the Sektionsträning grid. This way users can launch immediately without scrolling. Keep the same button at the bottom of the page too (after advanced options) for users who do configure advanced settings. The top button should only show when `mode !== 'repetition' || dueIds.length > 0` and be disabled when `!canStart`.
  <!-- Done: Added top CTA button between quick-drill shortcuts and Sektionsträning grid. Wraps in `{(mode !== 'repetition' || dueIds.length > 0) && ...}`, disabled when `!canStart`. Bottom button unchanged. Build passes. -->

- [x] In the Repetition mode panel, if `mode === 'repetition'` and `dueIds.length === 0`, show the empty-state message inline without needing to scroll — the panel is compact. Confirm this still works correctly after the restructure.
  <!-- Done: Moved the repetition panel from after Sektionsträning to before it (between Top CTA and Section drills). When mode=repetition and dueIds=0, the compact empty-state message now appears above the fold without scrolling. Build passes. -->

- [ ] Run `npm run build` to verify no errors. Also visually verify the page structure makes sense by reviewing the JSX render order: mode cards → quick CTA → quick drills → section drills → Avancerat toggle → [advanced filters hidden by default] → bottom CTA.
