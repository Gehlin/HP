# IA Redesign Proposal (Phase 02)

**Status: decisions for approval — no code touched.** Built on `ia-map.md` + `ia-findings.md`, but every claim below was re-verified against the actual source (not taken from Phase 01's summary). Corrections to Phase 01 are called out inline as **[verify]**.

The whole proposal reduces to one structural move: **the app has two guide-index systems, three "start a section" surfaces, two settings screens, and a Profil that doubles as the drawer for every feature. Collapse each of those to one, and lift the daily-use tools out of Profil into the surfaces where the user is already acting (Öva, Statistik).**

Operating-principle shorthand used below: **[P1]** navigation is the priority / a built-but-unlinked feature is a nav bug; **[P2]** one purpose per screen; **[P3]** reduce before add / no burial; **[P5]** simple, no divergent copies.

---

## Part A — the 6 dead/orphaned routes

### A1. `VerbalHub` (`/verbalt`) + `QuantHub` (`/kvantitativt`) — **DELETE both**, distribute their parts

**What they actually are [verify].** Phase 01 called them "the richest, most complete guide indexes." Reading them in full: they are *not* guide indexes — they are **section practice dashboards**. Each screen carries (1) a section HP-estimate card, (2) four per-subtest cards with accuracy bar + due-count + "Öva" drill + "↻ SRS" launcher, (3) a strategy tip, (4) a link to that subtest's standalone guide, plus (5) Ordbyggaren (verbal only) and (6) a "Starta [section] provpass" button (`/exam/verbal-random`, `/exam/quant-random`). So they mix *stats + drill-launch + guide-links + exam-pass* on one screen — the opposite of one-purpose-per-screen **[P2]**.

**Why not promote them as the section landing page.** Their four constituent jobs already have healthy homes elsewhere: per-subtest drill = Practice's Sektionsträning grid; per-subtest SRS = the SrsQueue dashboard's clickable per-type tiles; section HP-estimate = Statistik + ScorePredictor; guide links = Theory. Wiring a hub in would re-introduce a **third** "start a section" surface and a **second** guide index — re-creating the exact overlaps we're trying to remove. Keeping them means fixing the app's disease (two of everything) by declaring the fancier copy the winner, then still owning the overlap.

**Disposition: DELETE** both routes/components. Relocate the one genuinely-unique affordance — the **whole-section exam pass** (`/exam/verbal-random`, `/exam/quant-random`) — into ExamSelect as two named "quick pass" entries (see C-exam). Everything else they do already exists. **[P3]** removes 2 routes; **[P2]** each surviving job lives on one screen.

> This is the proposal's biggest judgment call — see **Open Question 1**. The user may prefer to wire the hubs in as real section landing pages instead; that trade is theirs to make.

### A2. The 4 quant guides `KvaGuide` / `DtkGuide` / `NogGuide` / `XyzGuide` — **KEEP, re-parent under Theory**

Their only inbound edge today is the (dead) QuantHub. Once the hub is deleted they'd be fully unreachable, so they must be re-homed. **Theory already has XYZ/KVA/NOG/DTK tabs**, and those tabs already render inline strategy content — but, unlike the verbal tabs, they carry **no "open full guide" banner** to the standalone quant guide **[verify — confirmed: `Theory.tsx` has `OrdGuideBanner`/`MekGuideBanner`/`LasGuideBanner`/`ElfGuideBanner` + `MathGuideBanner`/`LiggandeStolenBanner`, but nothing pointing at `/xyz-guide` `/kva-guide` `/nog-guide` `/dtk-guide`]**. Fix = add four banners mirroring the verbal ones. This is *simplifying an existing screen*, not adding a page **[P3]**. Result: each quant guide is reachable at the same depth as every verbal guide.

### A3. `Settings.tsx` (`/settings`) — **DELETE**, migrate two small pieces first

**Diffed against Profil [verify — correction to Phase 01].** Phase 01 called it "a fully orphaned duplicate." It is orphaned (zero inbound) and its core *is* duplicated — `Settings.exportData` uses the same `ALL_KEYS`/`DATA_KEYS`, same import handler, same reset-all, same notification toggle, same focus preference as Profil. But it is **not a pure duplicate**: Settings additionally offers **granular per-category resets** (SRS / history+XP / bookmarks / achievements individually) and a **"Visa introduktion igen"** (replay onboarding) action that Profil does *not* have. Profil only offers a single nuclear reset.

**Disposition: DELETE** the route/component (a second, divergent copy of export/reset logic is a maintenance liability **[P5]**, and a zero-inbound screen is dead weight **[P3]**). Before deleting, **migrate the two non-duplicated affordances into Profil's KONTO group**: (a) an optional "granular reset" expander, (b) "Visa introduktion igen." Deleting outright is also defensible if those two are judged not worth keeping — see **Open Question 3**.

---

## Part B — the redundant/overlapping pairs

### B1. `MathGuide` (`/matematik`) vs `XyzGuide` (`/xyz-guide`) — **KEEP BOTH, differentiate labels [verify — correction to Phase 01]**

Phase 01 Finding 5 implied these are redundant ("both quant math-problem guides; XyzGuide even links out to /matematik"). Reading both: they are **layered, not duplicate**. `XyzGuide` is the **XYZ subtest guide** — a light tabbed (Ämnen / Strategi / Formler) screen at the same altitude as the KVA/NOG/DTK subtest guides. `MathGuide` is a **deep cross-cutting math reference** — 10 topic cards with LaTeX (`MathText`), worked examples, lessons, self-check and drill launches — and `XyzGuide` deliberately links *into* it ("Fördjupa dig i matematiken → 10 ämnen"). That's textbook progressive disclosure, not duplication. The `/matematik` link inside XyzGuide is a feature, not evidence of redundancy.

**Disposition: KEEP both.** Clarify roles so a user knows which is which: `XyzGuide` = "XYZ-guide" (subtest slot, one of 8); `MathGuide` = "Matematikguide — fördjupning" reached from the Overview tab and from each quant subtest guide. No merge. Merging would flatten a working two-tier structure and bloat the subtest slot **[P2]**.

### B2. Three "start a section" surfaces — **CONSOLIDATE to two; fix a latent bug**

The three surfaces: (a) Home DELPROV cards, (b) Practice "Sektionsträning" grid, (c) the hubs' "Öva [section]" buttons.

- (c) disappears with the hubs (A1). Down to two.
- (a) and (b) serve **genuinely different moments** and should both stay **[P2]**: (a) Home = "from my dashboard, jump into my weakest delprov"; (b) Öva = "I'm already in practice, one-tap a timed section drill." Consolidating them would force the dashboard user through Öva's full config screen — worse, not better.
- **But (a) is silently broken [verify — new finding].** `Home.tsx:288` does `navigate('/practice', { state: { defaultType: sec.type } })`, yet `Practice.tsx` reads its pre-selection from `searchParams.get('type')` and **never reads `location.state`** (it imports `useSearchParams`, not `useLocation`). So tapping a specific delprov on Home lands you on a generic Öva with the type **not** pre-selected. Fix: navigate to `/practice?type=XYZ` so Practice's existing `typeParam` path honors it. This makes the "next step obvious" **[P1]** with zero new UI.

**Disposition:** keep (a) + (b) with clear roles; fix (a)'s pre-selection; (c) removed with the hubs.

### B3. SRS as a page (`/srs`) vs a Practice mode — **KEEP the page as SRS's home; make the Öva entry its door, not a parallel launcher [verify]**

They are **not** equivalent. `SrsQueue` is a real dashboard: due-now count + overdue, per-type due tiles (each launches a per-type SRS drill), a mastery breakdown (unseen / learning / mastered), a 7-day upcoming-review forecast, and a per-delprov distribution. Öva's "Spaced Repetition" mode card only **launches** the due drill — it duplicates the page's "Alla →" button, nothing more.

**Disposition:** `SrsQueue` is the single home for SRS. Replace Öva's parallel repetition *mode* with a **repetition entry that navigates to the SRS dashboard** (which then launches). One destination for "review due questions," reached from where practice happens **[P3]**. This also lifts SRS out of Profil (see C-profil).

### B4. Bookmarks reachable two ways — **KEEP both entrances; set the primary home in Öva**

`/bookmarks` is reached from Profil ("Sparade frågor") and Practice ("Bläddra" + "Drill"). Both are legitimate but serve different intents: Profil = "review my saved list"; Öva = "drill my saved." Bookmarks are **practice-adjacent, not profile-adjacent**. Make Öva the primary home (already has Bläddra + Drill). The Profil "Sparade frågor" row becomes an optional secondary shortcut — acceptable to keep (it's a lightweight review link, not a buried feature), or drop it if Profil is being stripped to pure settings. Recommended: **drop it from Profil** for a cleaner set-once screen; bookmarks live in Öva. **[P2]/[P3]**

---

## Part C — restructured Profil + where things live

### C-profil. Profil becomes an identity + set-once screen

Today Profil is the drawer for every non-tab feature, mixing daily tools with one-time settings at equal depth (Finding 3, confirmed). Strip it to what genuinely belongs on a profile/settings screen:

**New Profil (top to bottom):**
1. Identity card — avatar, name, member-since, stats (kept as-is).
2. Goal + exam-date card (kept as-is).
3. **INSTÄLLNINGAR** — Daglig påminnelse (notif toggle), Fokusprioritet. *(These are the only true "set once and forget" toggles.)*
4. **KONTO** — Exportera data, Importera data, (migrated) granular reset expander + "Visa introduktion igen", Återställ all data.

**Everything else in today's STUDIEVERKTYG group is promoted out of Profil:**

| Today (in Profil) | New home | Why |
|---|---|---|
| Teori & guider (`/theory`) | **Öva** (a "Teori & guider" card at the top of Öva) + Home surface | Learning is practice-adjacent; index shouldn't be a settings row **[P1]** |
| Repetitionskö (`/srs`) | **Öva** (repetition entry → SRS dashboard, per B3) | Daily study tool, belongs next to practice **[P3]** |
| Provsimulatorn (`/exam-select`) | **Öva** and/or Home | Core practice, not a setting |
| Ordbyggaren (`/ord-builder`) | **Öva** (with Teori, as a learning tool) | Verbal learning tool, practice-adjacent |
| HP-poängprediktor (`/score`) | **Statistik only** (already dual-homed there) | It's an analysis/prediction tool; remove the Profil copy — Statistik is its natural home |
| Sparade frågor (`/bookmarks`) | **Öva** (primary), drop the Profil row | Practice-adjacent (B4) |

Result: no daily-use feature is buried in Profil; every promoted tool is 1 tap to its logical home (Öva or Statistik) + 1 = 2 taps, but from a screen whose job it obviously is — versus today's 2–3 taps through an undifferentiated settings list. **[P1]/[P3]**

### C-exam. Exam simulator

`ExamSelect` (real past-paper picker) is promoted to Öva/Home alongside the other practice entries. Note a pre-existing overlap to keep an eye on (not resolved here): Öva already has a generic 40-question "Provläge" mode, which is conceptually near "Provsimulatorn." They differ (generated vs real past papers) — flagging so the implementation phase differentiates their labels rather than stacking two "exam" entries. The two whole-section quick passes salvaged from the hubs (A1) become named entries inside ExamSelect ("Verbalt provpass", "Kvantitativt provpass").

### C-theory. The single guide index

- **Theory is the one index.** Fix its completeness (A2: add 4 quant-guide banners) and promote its entrance from a Profil row to an Öva card (C-profil). Reachable, complete, and one screen **[P1]/[P3]**.
- All standalone guides (the 9 subtest guides + `LiggandeStolenGuide` + `MathGuide`) are **kept**, re-parented under Theory's tabs/banners.
- No second index (hubs deleted, A1).

---

## Disposition table (every route touched)

| Route / component | Disposition | One-line reason |
|---|---|---|
| `/verbalt` VerbalHub | **DELETE** | Orphaned kitchen-sink screen; its jobs already live elsewhere **[P2/P3]** |
| `/kvantitativt` QuantHub | **DELETE** | Same; sole non-hub value (section exam pass) moves to ExamSelect |
| `/xyz-guide` XyzGuide | **KEEP, re-parent → Theory** | Legitimate XYZ subtest guide; wire into Theory tab |
| `/kva-guide` KvaGuide | **KEEP, re-parent → Theory** | Add Theory KVA banner so it's reachable |
| `/nog-guide` NogGuide | **KEEP, re-parent → Theory** | Add Theory NOG banner |
| `/dtk-guide` DtkGuide | **KEEP, re-parent → Theory** | Add Theory DTK banner |
| `/settings` Settings | **DELETE** (migrate 2 bits first) | Orphaned + divergent copy of Profil's data logic **[P5]** |
| `/matematik` MathGuide | **KEEP** | Deep math reference; layered under the subtest guides, not a duplicate |
| `/theory` Theory | **KEEP + PROMOTE + complete** | Becomes the single guide index; entrance lifted out of Profil |
| `/srs` SrsQueue | **KEEP + PROMOTE** | Real SRS dashboard; move its door to Öva, retire the parallel Öva launcher |
| `/bookmarks` Bookmarks | **KEEP; primary home → Öva** | Practice-adjacent; drop the Profil row |
| `/exam-select` ExamSelect | **KEEP + PROMOTE → Öva/Home** | Core practice, not a Profil setting |
| `/ord-builder` OrdBuilder | **KEEP; move → Öva (learning)** | Verbal learning tool, practice-adjacent |
| `/score` ScorePredictor | **KEEP; Statistik only** | Analysis tool; remove Profil copy, keep Statistik entrance |
| `/profil` Profil | **DEMOTE to identity+settings** | Strip daily tools; keep identity, goal, INSTÄLLNINGAR, KONTO |
| Home DELPROV cards | **FIX** | `navigate` passes `state` Practice ignores → use `?type=` |
| Öva Sektionsträning | **KEEP** | Distinct "in-practice quick drill" moment |
| Öva "Spaced Repetition" mode | **REPLACE with link to `/srs`** | Was a duplicate launcher of the SRS dashboard |

Routes not touched: `/`, `/practice`, `/progress`, `/session`, `/resultat`, `/granska`, `/results` (redirect), `/exam/:examId`, the 4 verbal guides (already Theory-linked), `/liggande-stolen`.

---

## Open questions for the user (genuine trade-offs — your call, not the model's)

**Open Question 1 — Hubs: delete-and-distribute vs. wire-in-as-section-landing.**
My recommendation deletes VerbalHub/QuantHub and spreads their parts to Theory (guides), Öva (drills), Statistik (score), ExamSelect (section pass). This maximises **[P2]** one-purpose-per-screen and **[P3]** fewer routes. The counter-argument is real: those hubs are the closest thing the app has to "one rich screen per section with an obvious next step," which is exactly what **[P3]**'s *"clear visual hierarchy, an obvious next step at all times"* praises. Keeping them (wired into Öva as two section landing pages) would give a stronger single "here's your Verbal / here's your Quant" hub — at the cost of a third section-start surface and a second place guide links live. **Fewer/cleaner screens vs. one obvious rich hub per section.** I lean delete; you should confirm.

**Open Question 2 — Teori discoverability: 5th nav tab vs. surfaced-within-Öva.**
I propose surfacing Teori inside Öva (keeps the nav at 4 clean tabs, **[P3]**), which makes it 2 taps. The alternative — a 5th top-nav tab — makes theory always 1 tap and maximally discoverable (**[P1]**), at the cost of diluting the 4-tab simplicity the previous playbook deliberately built. This is a straight **"discoverability (5th tab)" vs "nav minimalism (4 tabs)"** toss-up.

**Open Question 3 — Settings.tsx's two unique features.**
Delete `/settings`, but do we bother migrating its granular per-category resets + "replay onboarding" into Profil, or drop them? Migrating preserves capability at a small complexity cost; dropping is cleaner but loses two minor (arguably power-user) affordances. Low stakes — flagging so nothing of value is deleted silently.
