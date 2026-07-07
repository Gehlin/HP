# Test Coverage

**Goal:** the app currently has exactly one test file (`src/utils/srs.test.ts`, 14 tests covering only the spaced-repetition algorithm). Everything else in `src/utils/` — session/exam building, score prediction, weak-area analytics, achievements, gamification, pacing, readiness, notifications, bookmarks, daily challenges — has zero tests, despite being the logic that actually determines what a student sees as their score, their next recommended action, and their progress. This playbook adds real unit test coverage to that logic.

## Why this matters for this specific app

This isn't generic "more tests is good" — it's specific to what's at stake: a student trusting this app's normerat score estimate, weak-area recommendations, and streak/achievement tracking to guide real study decisions toward a 2.0. A silent regression in `hpScore.ts` or `analytics.ts` wouldn't crash anything — it would just quietly tell a student the wrong thing about their own preparation. Tests here are a correctness safety net for exactly the same reason the question-bank accuracy work mattered: getting the numbers right is the actual product, not a nice-to-have.

## Scope

Ten untested files in `src/utils/` (line counts as of 2026-07-07):
- `session.ts` (126) — session/exam building, the core loop every practice/exam flow runs through
- `hpScore.ts` (95) — normerat score estimation
- `analytics.ts` (204) — weak-area detection, used by Home's "Dagens pass" card
- `readiness.ts` (58) — overall readiness/composite scoring
- `achievements.ts` (131) — achievement/badge unlocking logic
- `gamification.ts` (73) — streak/XP tracking
- `pacing.ts` (73) — daily/weekly target calculation
- `notifications.ts` (81) — notification trigger conditions
- `bookmarks.ts` (25) — bookmark persistence
- `dailyChallenge.ts` (33) — daily challenge selection

## Process

Read each file's actual logic before writing tests against it (don't guess at behavior from the function name). Prioritize: (1) the calculation/decision logic a wrong answer would actually mislead a student about, (2) edge cases that are easy to get wrong (empty history, first-ever session, boundary dates, zero/negative inputs), (3) straightforward happy-path coverage for the rest. A test that just re-states what the code already does with no real assertion of correctness isn't worth writing — verify against the actual intended behavior (cross-check against how the calling page uses the result, or basic domain reasoning), the same rigor used when verifying question answers in the content-accuracy playbook.

## Model

Sonnet 5 (established convention for logic/correctness-verification work in this repo, distinct from Fable 5's frontend/design role).

## Phases

- **Phase 01 — Core scoring & session logic:** `session.ts`, `hpScore.ts`, `analytics.ts`, `readiness.ts` — the calculations that directly tell a student what their score is and what to study next.
- **Phase 02 — Supporting systems:** `achievements.ts`, `gamification.ts`, `pacing.ts`, `notifications.ts`, `bookmarks.ts`, `dailyChallenge.ts`.
