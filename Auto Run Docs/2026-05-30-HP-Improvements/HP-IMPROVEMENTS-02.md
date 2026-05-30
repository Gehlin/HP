# HP Improvements — Phase 02: Filtering & Practice Configuration

Add difficulty and topic filters so users can drill specific weak areas.

---

- [ ] **Add difficulty filter to `src/pages/Practice.tsx`**: Below the section-type selector, add a "Svårighetsgrad" row with three toggle buttons: `Lätt`, `Medel`, `Svår` (multi-select, all selected by default). Filter the question pool passed to `buildSession` so only questions whose `difficulty` field matches the selected levels are included. Update the "X tillgängliga" count reactively as filters change. If zero questions match, show an inline warning and disable the Start button.

- [ ] **Add topic/tag filter to `src/pages/Practice.tsx`**: Below the difficulty filter, add a collapsible "Ämnesfilter" section. Extract all unique tags from the questions array and render them as small toggle chips (e.g. `algebra`, `geometri`, `sannolikhet`, `procent`, `funktioner`, `potenser`, `logik`, `talteori`). All tags selected by default. When specific tags are deselected, exclude questions that have none of the selected tags. Show the active tag count as a badge on the collapse button (e.g. "Ämnesfilter (3 av 12)") so users know when a filter is active.

- [ ] **Add "Endast fel" (wrong answers only) quick-drill mode to `src/pages/Practice.tsx`**: At the top of the Practice page, if the user has any session history with incorrect answers, show a highlighted shortcut card: "Öva på dina fel — X frågor du svarat fel på". Clicking it immediately starts an untimed drill session containing only questions the user has answered incorrectly at least once (use `loadHistory` from `session.ts` to compute this set). Use instant feedback mode by default for this mode.
