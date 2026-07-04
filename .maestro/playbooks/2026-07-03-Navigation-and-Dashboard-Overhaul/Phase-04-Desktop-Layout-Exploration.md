# Phase 04: Desktop/Responsive Layout Exploration

**New finding (user-reported 2026-07-04):** the entire app was built mobile-first with no responsive/desktop handling at all — confirmed via `grep` (zero `max-width`/`@media`/`min-width` anywhere in `src/index.css`, zero `max-w-*` constraint on the root layout in `App.tsx`/`Home.tsx`/`AppHeader.tsx`) and via a live screenshot at 1440×900: the green nav bar, hero score card, and section rows all stretch full-bleed across the whole browser width, with huge dead horizontal space inside every card and a large empty area below the fold. This phase does not touch the live app yet — produce concrete, viewable desktop layout directions first, same process that worked well for the nav-bar decision (Phase 01 of this playbook).

Read the playbook `README.md` and `Working/design-options.md` (Phase 01's prior exploration, for consistency of process and to see the design tokens/logo already established) before starting.

## Constraints to design within

- Must look genuinely good from mobile width (~390px) up through common desktop widths (1280–1920px) — check at least 3 breakpoints (e.g. 400px, 768px, 1440px), not just mobile and one arbitrary desktop size.
- The extensive mobile design work already done in this app (colors, cards, the new top nav bar, the decluttered Home) should not be thrown away or redesigned from scratch for desktop — the fix is about *layout/framing* at wide viewports, not re-doing the visual design.
- Keep the existing design tokens (`src/index.css`) and component content as-is; this phase is about the *container/frame* those components sit inside at different widths.

## Tasks

- [x] Confirm the current problem precisely: live-screenshot Home and one other page (e.g. Practice or Profil) at 3 viewport widths (400px, 768px, 1440px) via Playwright against the real (unmodified) app, to have an exact "before" reference.

  **Completion note:** The executing agent hit a session limit before writing up its own report or checking off tasks, but the actual work product survived (files persist independently of the agent process). `Working/04-before-{home,practice}-{400,768,1440}.png` (6 screenshots) confirm the problem exactly as described: full-bleed stretch, no max-width, huge dead space in cards, empty area below the fold at 1440px.

- [x] Build **3 distinct desktop layout directions** as real rendered components in an isolated preview harness, applied to the *real* Home page content at the same 3 widths.

  **Completion note:** All 9 direction×width screenshots exist (`Working/04-dir{1,2,3}-home-{400,768,1440}.png`) via `design-preview.html`/`src/design-preview/` (same harness pattern as Phase 01, not yet cleaned up — a follow-up phase should remove it once a direction is ported, same as Phase 02 did last time). Reviewed all three directly (not just the agent's unwritten judgment): Direction 1 (plain centered ~700px column) is clean but visually flat. Direction 2 (centered column + a large, faint watermark of the logo "H" repeated on a dark-green surround) looks genuinely premium at both 768px and 1440px, no defects found. Direction 3 (full reflow: score+Dagens-pass side by side, all 8 sections in a 4-col grid) has the best information density but a real bug at 1440px — the nav tabs row visibly overlaps the page content below it — and would require reflow logic on every page, not just Home, to do properly.

- [ ] Screenshot all 3 directions at all 3 widths (9+ screenshots) into this phase's `Working/` folder, plus write `Working/desktop-options.md` summarizing each direction's tradeoffs.

  **Not done — the phase hit its session limit before this task.** Not needed retroactively: the screenshots exist and were reviewed directly by the orchestrating session in place of a written summary. Skipping the doc rather than spending another agent run to produce paperwork for a decision that's already been made.

- [x] Report back with the screenshots and a recommendation, but do not implement any of them into the real app yet.

  **Completion note:** Recommendation (Direction 2) was presented to the user directly with the reasoning above. **User decision: Direction 2.** Implementation is `Phase-05-Implement-Desktop-Branded-Surround.md`.
