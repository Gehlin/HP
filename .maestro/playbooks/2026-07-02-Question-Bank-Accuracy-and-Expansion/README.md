# Question Bank Accuracy & Expansion

**Goal:** make HP's practice question bank (`src/data/` — ORD, LÄS, MEK, ELF, XYZ, KVA, NOG, DTK) genuinely accurate to the real Högskoleprovet in format, difficulty, and style, then expand its volume — informed by a large corpus of real old exams, without reproducing any real exam text verbatim.

## The boundary (read this before touching any phase)

UHR (Universitets- och högskolerådet) publishes old Högskoleprovet exams for free at studera.nu, explicitly for self-study. That license covers *learning from* them — it does not cover extracting and republishing their content, even into a personal app:

- UHR owns the copyright on exam questions, passages, and answer explanations.
- Old test items are sometimes reused in future `utprövningspass` (unscored pretest passes used to trial future questions) — a leaked verbatim question bank is a fairness problem for future test-takers, not just an IP one.

**What this means in practice, for every phase below:**
- Downloaded exam PDFs live in `Reference/raw-exams/` (git-ignored — see root `.gitignore` — never committed, never copied elsewhere in the repo).
- Anything derived from them and written into this playbook or the app must be **original**: statistics, patterns, structural templates, difficulty calibration — not lifted sentences, not lightly-reworded questions, not real passages with synonyms swapped.
- New/fixed app questions must be freshly written, informed by the patterns found (e.g. "NOG statements are typically one arithmetic fact + one constraint," "ORD words cluster in the mid-frequency written-Swedish band, rarely genuinely obscure," "DTK tables rarely exceed 5 columns on a phone-width layout") — never copied from a specific real question.
- If a phase task ever produces something that reads like a real exam question almost verbatim, that's a stop-and-flag moment, not a ship-it moment.

## Source

UHR's official archive at `studera.nu`, 2013–2026 (~27 test dates, prov + facit PDFs each — the most recent few also include a normering/scoring table). Third-party archives were deliberately excluded (unverified transcription accuracy, and pre-2011 exams used a different subtest structure than the app models).

## Phases

- **Phase 01 — Gather:** download every available official prov + facit PDF into `Reference/raw-exams/`, cataloged in a manifest.
- **Phase 02 — Calibrate:** read the corpus per subtest, produce original derived-pattern docs in `Reference/calibration/` (no verbatim text) covering format, difficulty, and style norms for each of the 8 subtests.

**Reprioritized 2026-07-03:** Phase 02 surfaced that 103 items already in `src/data/questions.ts` (40 XYZ, 28 KVA, 24 NOG, 11 DTK — tagged with dated `source` fields like `'2026-04-18 PP3'`) are verbatim/near-verbatim copies of real exam questions — a live violation of the boundary above, predating this initiative. User decision: fix this before anything else, ahead of the general audit.

- **Phase 03 — Identify & verify copied content:** produce a definitive, individually-verified manifest of every copied question (not just the aggregate count from Phase 02's spot-check).
- **Phase 04 — Replace copied XYZ/KVA content** (68 items) with original questions calibrated against `Reference/calibration/`.
- **Phase 05 — Replace copied NOG/DTK content** (35 items), same approach.
- **Phase 06 — Audit:** the originally-planned general audit — app's full question bank vs. calibration docs per subtest (coverage, difficulty spread, format correctness, e.g. the known ORD 4-vs-5-option mismatch) — produces a gap report.
- **Phase 07+ — Expand:** scoped after Phase 06's findings are in. Added once Phase 06 completes.
