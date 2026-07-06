# IA Audit — Findings

Five problems, ordered by how much the data (not intuition) says they matter. Every claim traces to a grep result in `ia-map.md`. **No redesign is proposed here — that is Phase 02.**

## 1. Six routes are effectively unreachable — two orphaned hubs plus the four quant subtest guides they alone gate

`VerbalHub` (`/verbalt`) and `QuantHub` (`/kvantitativt`) have **zero inbound navigation** anywhere in `src/` — no `navigate()`, no `<Link>`, no other reference beyond their own `App.tsx` route/import. They are reachable only by typing the URL. This matters more than a normal dead page because `QuantHub` is the **only** inbound edge for four subtest guides — `KvaGuide`, `DtkGuide`, `NogGuide`, `XyzGuide` (their sole call site is `QuantHub.tsx`'s `guideRoute` field, lines 34/48/62/76). Because the hub is orphaned, all four inherit its dead-ness. That is 6 routes — nearly a quarter of the app — that a user cannot reach through any button. The bitter irony: the hubs are the app's **richest, most complete** guide indexes (each lists all four subtests + section practice + a full exam pass + the ord-builder), i.e. exactly the "one screen per section that shows everything" structure the operating principles call for — built, then never linked.

## 2. The reachable Theory index is incomplete and competes with the unreachable hubs — no single reachable screen lists all subtest guides

`Theory` (`/theory`, the "Teori & guider" row in Profil) is the *only* reachable guide index, but it lists just **Matematik + the 4 verbal guides + Liggande stolen** (`Theory.tsx:86–166`). It **omits all four quant subtest guides** (KVA/DTK/NOG/XYZ). The complete index exists — but it's the orphaned `VerbalHub`/`QuantHub` (Finding 1). So the app has *two* guide-index systems: one reachable and incomplete, one complete and unreachable, with no screen that shows a student the full set of subtest theory. Everything Theory *does* reach sits at **3 taps** (Hem → Profil → Teori & guider → guide).

## 3. Profil is a catch-all drawer: essentially every non-tab feature is reachable only/primarily through it, and recurring study tools sit at the same depth as one-time account settings

Of the app's features beyond the 4 tabs and the session flow, these are reached through Profil's flat `SettingsRow` lists: **Teori & guider** (`/theory`), **Repetitionskö** (`/srs`), **Provsimulatorn** (`/exam-select`), **Ordbyggaren** (`/ord-builder`), **HP-poängprediktor** (`/score`), and the **Sparade frågor** card (`/bookmarks`). Five of these six have *no other* discoverable entrance (`/score` is the lone exception, also on Statistik). Crucially, high-frequency study tools — the SRS repetition queue, the exam simulator, saved questions — are nested at the **exact same depth (2 taps) and in the same visual list style** as genuinely one-time account actions (Exportera/Importera/Återställ data). The "STUDIEVERKTYG" group mixes a daily-use SRS queue and a full exam simulator in with a word game and a score calculator, with no signal about which a student should use when. This is the "nested navigation inside a settings list" pattern the operating principles explicitly warn against — **hypothesis confirmed.**

## 4. `/settings` (Settings.tsx) is a fully orphaned duplicate of Profil

`Settings` has **zero inbound navigation** (nothing renders a link to `/settings`). It re-implements features that already live in Profil: data export/import/reset (`Settings.tsx:35–53` mirrors `Profil.tsx:139–157`, same `hp_*` keys), notification permission, and focus preference. It is dead code and a maintenance liability (two divergent copies of the export/reset logic). Distinct from Finding 1 only in that it is a redundant *duplicate*, not a hidden *feature*.

## 5. Overlapping surfaces with no differentiation — the same job offered several unlabelled ways

Concrete overlaps the grep surfaced, where a user cannot tell why two things both exist:
- **MathGuide (`/matematik`, reachable) vs XyzGuide (`/xyz-guide`, unreachable):** both are quant math-problem guides; `XyzGuide` even links *out* to `/matematik` (`XyzGuide.tsx:237`). Redundant coverage, one of the two orphaned.
- **Three separate "start a section" surfaces:** Home's DELPROV cards (`Home.tsx:288` → `/practice` with a type), Practice's own "Sektionsträning" grid (`Practice.tsx:366–389`), and the hubs' "Öva [section]" buttons — three entry points to the same drill, differently styled, no stated difference.
- **SRS reachable two conceptually different ways:** as a standalone page `/srs` (Profil → Repetitionskö) *and* as a "Spaced Repetition" mode inside Öva (`Practice.tsx:232`) — same underlying due-queue, two destinations.
- **Bookmarks reachable two ways:** Profil "Sparade frågor" card and Practice "Bläddra" button — both to `/bookmarks`; fine functionally, but reinforces that features are scattered rather than placed.

---

**Bottom line for Phase 02 (map only, no solution proposed here):** the app's real study functionality is either (a) buried 2–3 taps inside Profil, or (b) built but unlinked. A complete section-index UI already exists in `VerbalHub`/`QuantHub` — it is simply not wired into navigation. The redesign decisions (promote / merge / delete / rename) are deferred to Phase 02 per the playbook.
