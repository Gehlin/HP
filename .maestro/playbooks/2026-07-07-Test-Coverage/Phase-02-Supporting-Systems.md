# Phase 02: Supporting Systems Tests

Add test coverage to the remaining six untested utility files: `src/utils/achievements.ts`, `src/utils/gamification.ts`, `src/utils/pacing.ts`, `src/utils/notifications.ts`, `src/utils/bookmarks.ts`, `src/utils/dailyChallenge.ts`. Read the playbook `README.md` first, and Phase 01's completion notes for the established testing conventions/style used in this playbook (should match `srs.test.ts`'s existing style too).

## Tasks

- [ ] Read all six files in full. Also check where each is called from (`Profil.tsx`, `Home.tsx`, `Session.tsx`, notification-triggering code) to understand each function's real contract before testing it.

- [ ] Write `src/utils/gamification.test.ts`: streak calculation logic (the exact rule for incrementing/resetting a streak based on last-practiced date — this exact logic was documented carefully during earlier design work, check it's implemented correctly against that spec), XP tracking.

- [ ] Write `src/utils/achievements.test.ts`: badge-unlocking conditions — construct scenarios that should and shouldn't unlock each achievement, including boundary cases (exactly at the threshold, one below it).

- [ ] Write `src/utils/pacing.test.ts`: daily/weekly target calculation across different days-until-exam and current-progress scenarios (plenty of time left, exam very soon, already on track, badly behind).

- [ ] Write `src/utils/notifications.test.ts`, `src/utils/bookmarks.test.ts`, `src/utils/dailyChallenge.test.ts`: cover each file's actual exported logic — notification trigger/cooldown conditions, bookmark add/remove/persistence, daily challenge selection logic (is it deterministic per day, does it avoid repeats appropriately).

- [ ] Run `npm test` and confirm all new and existing tests pass (should now be ~7-8 test files total across both phases). Run `npm run build`. Report per-file test counts, total test count before/after this whole playbook, and any bug the testing process surfaced.
