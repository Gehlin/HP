# Question Bank Code-Splitting

**Goal:** the main JS bundle is 1.8MB because `src/data/questions.ts` (1,456 questions, 1.7MB source) is statically imported by 17 different files, forcing Rollup to bundle it into the shared/eager entry chunk regardless of what any single one of them does.

**Important correction to the original framing:** the fix is *not* splitting `questions.ts` into per-subtest files. Most consumers (`Bookmarks.tsx`, `Granska.tsx`, `Resultat.tsx`, `achievements.ts`, etc.) need to look up *any* question by id regardless of subtest — a weak-area drill session or a bookmark list can mix types freely. Splitting by subtest wouldn't help those consumers and would just move the "load everything" problem elsewhere. The actual fix: convert every static `import { questions } from '../data/questions'` to a dynamic `import()`, consistently, everywhere — Vite's own build warning explicitly said the dynamic import in `App.tsx` (done in an earlier session) had no effect *because 17 other files still import it statically*. Remove all the static imports and the module can finally become its own lazy chunk.

## Approach

Build one shared async-loading utility (a hook or a cached-promise loader) that all 17 consumers switch to, rather than each inventing its own loading pattern. This is a behavior change (sync → async data access), not just a mechanical find-replace — every consuming component needs a loading state for the brief moment before the question bank resolves (in practice: near-instant after the first page load, since it'll be cached, but the *first* page that needs it will have a real async gap).

**This is a bigger and riskier refactor than a simple fix** — it touches how 17 different pages load their core data. Verify thoroughly and incrementally; a broken async load shows as blank/missing content, not a crash, so it could go unnoticed without real clicking-through.

## Preliminary cleanup

`src/components/BottomNav.tsx` (81 lines) is confirmed dead code — zero imports anywhere in the codebase, superseded twice over (by `TopNav.tsx`, then by `AppHeader.tsx`) and never removed. Delete it first; it also imports `questions.ts` and removing it shrinks the consumer list by one.

## Phases

- **Phase 01 — Build the shared loader, convert simple/leaf consumers, verify the bundle-size win.**
- **Phase 02 — Convert the remaining complex consumers** (Session.tsx, Practice.tsx, Home.tsx, and whatever else Phase 01 didn't get to), full app click-through verification.
