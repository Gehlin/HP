# Navigation & Information Architecture Simplification

**Goal:** make the app's navigation genuinely effortless — a first-time, nervous, exam-prep student should open it and immediately understand how to study, without stopping to think "where am I," "what do I do next," or "where is the thing I need." This is a structural/information-architecture initiative, not another visual pass — the earlier `2026-07-03-Navigation-and-Dashboard-Overhaul` playbook fixed the app's *chrome* (top bar, Home layout, desktop responsiveness). This one is about whether the app's *features are reachable at all*, and whether the path to reach them is short and obvious.

## Operating principles (user-directed, 2026-07-06, refined for this app)

1. **Navigation is the top priority.** If a screen makes a user pause and wonder where they are or what to do next, that is a defect — fix the navigation before adding anything new. This applies retroactively too: an already-shipped feature that's only reachable through a confusing path is not "done," it's a navigation bug wearing a checkmark.

2. **One clear purpose per screen. One primary action, where an action is the point.** This app has two kinds of screens: *action* screens (Hem, Öva, a practice session) which should have exactly one obvious next step, and *information* screens (Statistik, Profil) which exist to be scanned — forcing a fake CTA onto those to satisfy the letter of this rule is the wrong move. Match the rule to the screen's job, don't apply it mechanically.

3. **Reduce before you add.** Fewer menus, no unnecessary nesting, a clear visual hierarchy, an obvious next step at all times. A feature buried three taps deep inside a settings list is functionally invisible to most users — that's not a feature, it's dead code with good intentions. Before shipping a new page or button, ask whether an existing one should be simplified, merged, or removed instead.

4. **Audit before redesigning.** Don't guess at what's confusing — map the actual current structure first (every page, every way it's reached, how many taps from Hem) and identify concretely where the nesting/burial problems are. Decisions about what to cut, rename, merge, or promote get made from that map, not from intuition alone.

5. **Simple, maintainable engineering.** Reusable components, clear naming, minimal complexity, don't be clever. Optimize for a future reader (human or AI) understanding the code quickly, not for showing off.

6. **Explain trade-offs before implementing.** For any non-trivial IA decision (cutting a feature's visibility, merging two screens, changing a primary nav destination), present the options and reasoning before writing code — same as how the earlier nav-bar and desktop-layout decisions were made with real screenshots, not assumptions.

**Success metric:** a first-time user opens the app and understands how to start studying within seconds, without needing to explore Profil or any settings menu to discover core functionality.

## Process

Same pattern that's worked well twice already in this repo: audit/investigate first with real data (not guesses), present concrete findings and options, get a decision, then implement and verify live with Playwright before calling anything done.

## Model

Given the strategic/product-judgment nature of the audit and IA-redesign phases (deciding what to cut, merge, or promote — not just how to style something), those phases use **Opus 4.8** (the most capable model available) per the user's request. Implementation phases, once decisions are made, use **Fable 5** (established convention for frontend work in this repo).

## Phases

- **Phase 01 — IA Audit (complete):** mapped every page, how it's reached, tap-count from Hem. Found 6 effectively-dead routes (`VerbalHub`, `QuantHub`, `Settings`, and the 4 quant guides orphaned by `QuantHub`), an incomplete guide index, Profil confirmed as an undifferentiated catch-all, several redundant pairs.
- **Phase 02 — IA Redesign Proposal (complete):** decided the disposition of every flagged route, proposed a restructured Profil. Full detail in `Working/ia-redesign-proposal.md`.

### Final decisions (user + Claude, 2026-07-06 — resolves Phase 02's 3 open questions)

1. **Delete `VerbalHub`, `QuantHub`, `Settings.tsx`.** Confirmed: none contain unique educational/knowledge content — they're dashboards/utilities layered over content that lives elsewhere (the individual guide pages, Profil). No study material is lost. Their salvageable bits (whole-section exam pass → `ExamSelect`; Settings' granular resets + replay-onboarding → `Profil`) get migrated first.
2. **Theori gets its own 5th top-nav tab** (overrides Phase 02's recommendation to fold it into Öva). Reasoning: this app's stated purpose is helping a student actually *learn* toward a 2.0, not just drill — theory study and practice are two different activities, not one nested inside the other. Burying Teori inside Öva risks turning Öva into the next Profil-style catch-all. `Ordbyggaren` (word builder) moves under Teori too, since it's a learning tool, not a timed drill. `SrsQueue`/bookmarks/exam-simulator remain promoted into the Öva orbit (they're practice-adjacent, not learning-adjacent).
3. **Migrate Settings' two unique features into Profil** rather than dropping them (cheap to keep, no reason to lose replay-onboarding just for a cleaner deletion).

- **Phase 03 — Delete Dead Routes & Salvage:** remove `VerbalHub`/`QuantHub`/`Settings.tsx`, migrate their unique bits, re-parent the 4 quant guides under `Theory`, fix the Home pre-selection bug Phase 02 found, consolidate the SRS-mode/bookmarks redundancies.
- **Phase 04 — Restructure Nav & Profil:** add the 5th Teori tab, demote Profil to identity+settings, promote SRS/bookmarks/exam-simulator into the Öva orbit, move Ordbyggaren under Teori.
