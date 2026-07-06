# Phase 04: Restructure Nav & Profil

Implements the rest of Phase 02's decisions (see the playbook `README.md`'s "Final decisions" section). Depends on Phase 03 being complete (dead routes gone, quant guides re-parented under Theory, the migrated Settings features in Profil).

## Tasks

- [ ] Add a 5th tab to `AppHeader.tsx`: **Teori**, linking to `Theory.tsx` (now the complete guide index post-Phase-03). Match the existing tab styling/active-state exactly — this is a mechanical addition to an already-designed component, not a redesign of the bar itself. Confirm the bar still looks good with 5 tabs at mobile width (~390-402px) — if 5 tabs genuinely don't fit comfortably, that's worth a quick live check before assuming it's fine, not after.

- [ ] Move `Ordbyggaren` (`OrdBuilder.tsx`) to be reachable from `Theory.tsx` (a learning tool, per the user's decision) rather than from Profil.

- [ ] Restructure `Profil.tsx` down to: identity card, goal/exam-date card, an INSTÄLLNINGAR group (notification toggle, focus priority, the migrated replay-onboarding), and a KONTO group (export/import, the migrated granular resets, reset-all). Remove the STUDIEVERKTYG section entirely — everything in it has been promoted elsewhere by this point (Teori/Ordbyggaren → the new Teori tab; SRS/exam-simulator/bookmarks → Öva, per the next task).

- [ ] Promote SRS (`SrsQueue`), the exam simulator (`ExamSelect`), and bookmarks into `Practice.tsx` (Öva) as visible entry points — not buried in a sub-menu, but alongside the existing mode selector/section grid so they're one tap from Öva. Match Practice's existing visual conventions (card style, spacing) rather than inventing a new pattern.

- [ ] Run `npm run build` and `npm test`. Use Playwright to click through the full nav: confirm all 5 tabs work and show correct active states, confirm Teori/Ordbyggaren reachable from the new tab, confirm Profil now only shows identity/goal/settings (no stray STUDIEVERKTYG remnants), confirm SRS/exam-simulator/bookmarks are all one tap from Öva and still function correctly, and re-run a full click-through of every remaining route in the app (reuse Phase 01's route list minus what Phase 03 deleted) to confirm nothing 404s.

- [ ] Do a final holistic check against the playbook's operating principles: pick 3-4 realistic user goals ("I want to practice my weakest section," "I want to learn how NOG works," "I want to see my saved questions," "I want to simulate a full exam") and count taps-from-Hem for each, comparing against Phase 01's original counts. Report the before/after tap-counts as evidence the redesign actually reduced friction, not just moved it around.

- [ ] Report: confirm the 5-tab bar works and looks right at mobile width, confirm Profil is now minimal, confirm the promoted tools work from Öva, the before/after tap-count comparison, and confirmation build/tests pass.
