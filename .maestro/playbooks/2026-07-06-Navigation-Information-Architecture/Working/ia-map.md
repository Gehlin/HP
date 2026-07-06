# IA Map — every route in the app

**Method.** Enumerated the `<Routes>` block in `src/App.tsx` (28 `<Route>` entries — 27 real pages + 1 redirect). For each route I grepped the whole `src/` tree for the literal path string, every `navigate(...)` call, and every `<Link to=...>` — not just the "obvious" nav path — to find *all* inbound edges. Tap-count is the shortest **discoverable** path from Hem (`/`), where one tap = one click on a real, visible UI control. The four top-nav tabs in `AppHeader.tsx` (Hem `/`, Öva `/practice`, Statistik `/progress`, Profil `/profil`) are present on every non-session screen, so anything they reach is 1 tap.

## Complete route table

| # | Route | Component | Inbound nav (every call site found) | Shortest path from Hem | Taps | Group | Reachability note |
|---|-------|-----------|-------------------------------------|------------------------|------|-------|-------------------|
| 1 | `/` | Home | AppHeader Hem tab + logo (`AppHeader.tsx:120,173`); `Progress.tsx:599`; `Resultat.tsx:384`; `ScorePredictor.tsx:144`; `Settings.tsx:93` | — (is Hem) | 0 / 1 | Core nav | Fine. |
| 2 | `/practice` | Practice | AppHeader Öva tab; `Home.tsx:288`; hubs' PageHeader back; `Progress.tsx:76,790`; `Resultat/Granska:` empty-state; `ScorePredictor:161,368` | Öva tab | 1 | Core nav | Fine. |
| 3 | `/progress` | Progress | AppHeader Statistik tab; Home score card (`Home.tsx:168`) | Statistik tab / Home score card | 1 | Core nav | Fine. |
| 4 | `/profil` | Profil | AppHeader Profil tab; Home "Ange provdatum" (`Home.tsx:201`) | Profil tab | 1 | Core nav | Fine — but overloaded (see findings). |
| 5 | `/session` | Session | Home Dagens-pass card (`Home.tsx:127,132`); Practice starts (`:136,145,169,177,193,270,379`); QuantHub/VerbalHub/SrsQueue/Bookmarks/Resultat/Granska starts | Home "Dagens pass" card (when a resume/weak-drill exists) else Öva → Starta | 1–2 | Session flow | Reachable, but only via a session-start action, never a plain link. |
| 6 | `/resultat` | Resultat | `Session.tsx:191` (on finish); `Granska.tsx:53`; `/results` redirect | complete a session | flow | Session flow | Not navigable; terminal of a session. |
| 7 | `/granska` | Granska | `Resultat.tsx:371` ("Granska dina svar") | Resultat → Granska | flow | Session flow | Only after a session ends. |
| 8 | `/results` | → `/resultat` | `<Navigate replace>` (`App.tsx:164`) | n/a | n/a | Redirect | Legacy alias; no UI points at it. |
| 9 | `/theory` | Theory | **only** `Profil.tsx:409` ("Teori & guider") | Hem → Profil → Teori & guider | 2 | Theory index | Single entry, buried in Profil. Incomplete index (see findings). |
| 10 | `/exam-select` | ExamSelect | `Profil.tsx:411` ("Provsimulatorn"); ExamStart back button | Hem → Profil → Provsimulatorn | 2 | Exam simulator | Core feature, only reachable through Profil. |
| 11 | `/exam/:examId` | ExamStart | `ExamSelect.tsx:56,104,132,143,169`; `Resultat.tsx:418`; `VerbalHub:302`/`QuantHub:287` (unreachable) | Hem → Profil → Provsimulatorn → pick exam | 3 | Exam simulator | 3 taps deep. |
| 12 | `/settings` | Settings | **none** | direct URL only | ∞ | Orphan / dup | Zero inbound links. Duplicates Profil's data/notif/focus features. |
| 13 | `/matematik` | MathGuide | `Theory.tsx:86`; `Session.tsx:679,680`; `XyzGuide.tsx:237` | Hem → Profil → Teori & guider → Matematik | 3 | Theory (quant) | 3 taps. |
| 14 | `/bookmarks` | Bookmarks | `Profil.tsx:394` ("Sparade frågor"); `Practice.tsx:307` ("Bläddra") | Hem → Profil → Sparade frågor | 2 | Recurring feature | Recurring-use, at settings depth. |
| 15 | `/srs` | SrsQueue | **only** `Profil.tsx:410` ("Repetitionskö") | Hem → Profil → Repetitionskö | 2 | Recurring feature | The *page* only via Profil; SRS also exists as an Öva mode (overlap). |
| 16 | `/liggande-stolen` | LiggandeStolenGuide | `Theory.tsx:166`; `NogGuide.tsx:303` | Hem → Profil → Teori & guider → Liggande stolen | 3 | Theory (quant) | 3 taps. |
| 17 | `/ord-guide` | OrdGuide | `Theory.tsx:102`; `VerbalHub.tsx:34` guideRoute (unreachable) | Hem → Profil → Teori & guider → ORD | 3 | Theory (verbal) | 3 taps. |
| 18 | `/mek-guide` | MekGuide | `Theory.tsx:118`; `VerbalHub.tsx:62` (unreachable) | Hem → Profil → Teori & guider → MEK | 3 | Theory (verbal) | 3 taps. |
| 19 | `/las-guide` | LasGuide | `Theory.tsx:134`; `VerbalHub.tsx:48` (unreachable) | Hem → Profil → Teori & guider → LÄS | 3 | Theory (verbal) | 3 taps. |
| 20 | `/elf-guide` | ElfGuide | `Theory.tsx:150`; `VerbalHub.tsx:76` (unreachable) | Hem → Profil → Teori & guider → ELF | 3 | Theory (verbal) | 3 taps. |
| 21 | `/score` | ScorePredictor | `Profil.tsx:413`; `Progress.tsx:691` (HP-prognos card) | Hem → Statistik → HP-prognos card | 2 | Score tool | Two paths (Statistik + Profil); reasonable. |
| 22 | `/verbalt` | VerbalHub | **none** | direct URL only | ∞ | Orphan hub | Zero inbound. The most complete *verbal* guide index, unreachable. |
| 23 | `/kvantitativt` | QuantHub | **none** | direct URL only | ∞ | Orphan hub | Zero inbound. Only entry to the 4 quant guides below — all inherit its dead-ness. |
| 24 | `/kva-guide` | KvaGuide | **only** `QuantHub.tsx:48` guideRoute | none (QuantHub orphaned) | ∞ | Theory (quant) | Effectively unreachable. |
| 25 | `/dtk-guide` | DtkGuide | **only** `QuantHub.tsx:76` guideRoute | none (QuantHub orphaned) | ∞ | Theory (quant) | Effectively unreachable. |
| 26 | `/nog-guide` | NogGuide | **only** `QuantHub.tsx:62` guideRoute | none (QuantHub orphaned) | ∞ | Theory (quant) | Effectively unreachable (links *out* to liggande-stolen, nothing in). |
| 27 | `/xyz-guide` | XyzGuide | **only** `QuantHub.tsx:34` guideRoute | none (QuantHub orphaned) | ∞ | Theory (quant) | Effectively unreachable. Overlaps MathGuide (see findings). |
| 28 | `/ord-builder` | OrdBuilder | `Profil.tsx:412` ("Ordbyggaren"); `VerbalHub.tsx:287` (unreachable) | Hem → Profil → Ordbyggaren | 2 | Verbal tool | Only real path is via Profil. |

## Conceptual grouping (what these are to a user, not by filename)

- **Core nav (4):** `/`, `/practice`, `/progress`, `/profil` — the 4 tabs. All 1 tap.
- **Session flow (3):** `/session`, `/resultat`, `/granska` (+ `/results` alias) — one linear pass; not independently navigable, correctly so.
- **Delprov-teori — one feature, many entrances (9 pages + 2 indexes):** the subtest guides `OrdGuide`, `MekGuide`, `LasGuide`, `ElfGuide`, `KvaGuide`, `DtkGuide`, `NogGuide`, `XyzGuide`, plus `MathGuide` and `LiggandeStolenGuide`. Two competing indexes point at them: **`Theory`** (reachable via Profil, but only lists Matematik + the 4 verbal guides + liggande-stolen — *omits* the 4 quant subtest guides) and **`VerbalHub`/`QuantHub`** (complete — cover all subtests — but themselves orphaned). Net result: no single reachable screen lists all subtest guides, and the 4 quant subtest guides are reachable nowhere.
- **Exam simulator (2):** `/exam-select` + `/exam/:examId` ("Provsimulatorn") — buried under Profil, 2–3 taps.
- **Recurring study tools buried in Profil (3):** `/srs` (Repetitionskö), `/bookmarks` (Sparade frågor), `/ord-builder` (Ordbyggaren) — all 2 taps via Profil.
- **Score tool (1):** `/score` — 2 taps, reachable from both Statistik and Profil (the healthiest non-tab feature).
- **Orphans / redundant (3):** `/settings` (dead duplicate of Profil), `/verbalt`, `/kvantitativt` (dead hubs).

## Reachability tally (27 real pages, excluding the `/results` redirect)

| Bucket | Count | Routes |
|--------|-------|--------|
| 1 tap | 4 | `/`, `/practice`, `/progress`, `/profil` |
| 1–2 taps (session start) | 1 | `/session` (1 tap via Home card when present, else 2 via Öva) |
| 2 taps | 6 | `/theory`, `/exam-select`, `/bookmarks`, `/srs`, `/score`, `/ord-builder` |
| 3 taps | 7 | `/exam/:examId`, `/matematik`, `/liggande-stolen`, `/ord-guide`, `/mek-guide`, `/las-guide`, `/elf-guide` |
| Session-flow terminal (not navigable) | 2 | `/resultat`, `/granska` |
| Effectively unreachable (URL only) | 7 | `/settings`, `/verbalt`, `/kvantitativt`, `/kva-guide`, `/dtk-guide`, `/nog-guide`, `/xyz-guide` |

Every 2-tap non-tab feature and every 3-tap feature funnels through **Profil** (the exam simulator, SRS, bookmarks, ord-builder, and the entire Theory tree). `/score` is the only non-tab feature with a second, non-Profil entrance (the Statistik HP-prognos card). This confirms the playbook's working hypothesis.

Findings are recorded in `ia-findings.md` in this folder.
