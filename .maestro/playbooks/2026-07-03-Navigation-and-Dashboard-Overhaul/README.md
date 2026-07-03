# Navigation & Dashboard Overhaul

**Goal:** replace the app's current bottom tab bar with a genuinely impressive top navigation bar (logo top-left, linking to Hem, primary nav — Hem/Öva/Statistik/Profil — integrated into it), redesign the Hem (dashboard/first) page to feel less overwhelming and easier to navigate, and confirm scroll-to-top actually works on every page.

## User's stated problem (2026-07-03)

"The user currently feels overwhelmed and not sure how to navigate the app." Concretely requested:
- A better nav bar **displayed on top of the page**, not at the bottom (explicit: doesn't want Hem/Öva/Statistik/Profil at the bottom anymore).
- A logo top-left, clicking it goes to Hem.
- Every page should start scrolled to the top (an app-wide `ScrollToTop` already exists in `App.tsx` — needs verification it actually covers every page rather than being assumed fixed).
- The Hem/dashboard page specifically should be "way better."
- General reduction in how overwhelming/hard-to-navigate the app feels.

## Current state (confirmed 2026-07-03)

- `src/components/TopNav.tsx` is, despite its name, a **bottom-fixed** tab bar (4 icon+label buttons, 84px tall, hidden on `/session`/`/resultat`/`/granska`/`/exam/*`). No logo anywhere in the app's chrome.
- `App.tsx` has a global `ScrollToTop` component calling `window.scrollTo(0,0)` on every route change — should work, but not yet re-verified live across all ~26 pages since it was added (Phase 05 of the earlier design-reconciliation playbook).
- Home.tsx currently stacks: greeting header, hero score card, continue-session card, a pacing-nudge card, a weak-area-drill card, then an 8-item VERBAL/KVANTITATIV section grid — a lot of vertically-stacked cards, a plausible source of "overwhelming."

## Model

Fable 5 for the design/frontend implementation work (matches established precedent from the earlier design-reconciliation playbook), same phase-doc-with-completion-notes convention as the other two playbooks in this repo.

## Phases

- **Phase 01 — Design exploration:** don't touch the live app yet. Produce 2-3 concrete top-bar design directions (as real rendered React components in an isolated preview, not just descriptions) plus a Home-page decluttering proposal, and present screenshots for a decision before wiring anything into the real app.
- **Phase 02+ — scoped after Phase 01's design is chosen.**
