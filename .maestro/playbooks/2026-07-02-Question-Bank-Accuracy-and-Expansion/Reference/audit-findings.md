# Phase 06 Audit Findings: Existing Question Bank vs. Calibration

**Method note:** `src/data/questions.ts` is ~18,900 lines (three concatenated arrays, `_q1`/`_q2`/`_q3`, re-exported as `questions`), making manual line-by-line review impractical. It was parsed programmatically for this audit — stripped of TS type annotations and evaluated as plain JS (all values are literal strings/numbers/objects, no runtime logic) — to produce exact counts, not estimates. All figures below come from that parse, cross-checked against `src/types.ts`, `src/utils/session.ts`, and a live Playwright render pass for the DTK width check. Total bank size: **1,291 questions**, all carrying one of exactly 3 `source` values (`'HP-träning'`, `'Övning'`, `'Träningsbank'` — the dated-exam `source` leftover that Phases 03–05 existed to eliminate is confirmed fully gone, 0 matches for `/^\d{4}-\d{2}-\d{2}\s+PP\d+$/`).

## Baseline counts

| Type | Total | Easy | Medium | Hard | HP-träning | Övning | Träningsbank | Options |
|---|---|---|---|---|---|---|---|---|
| XYZ | 265 | 118 | 96 | 51 | 95 | 120 | 50 | 210×4, **55×5** |
| KVA | 183 | 71 | 67 | 45 | 88 | 45 | 50 | 183×4 |
| NOG | 162 | 63 | 67 | 32 | 89 | 33 | 40 | 162×5 |
| DTK | 131 | 62 | 51 | 18 | 51 | 26 | 54 | 131×4 |
| ORD | 168 | 64 | 63 | 41 | 108 | 60 | 0 | **168×4** |
| MEK | 175 | 42 | 67 | 66 | 125 | 50 | 0 | 175×4 |
| LAS | 107 | 53 | 43 | 11 | 65 | 42 | 0 | 107×4 |
| ELF | 100 | 45 | 42 | 13 | 56 | 44 | 0 | 100×4 |
| **Total** | **1,291** | 508 | 476 | 307 | 677 | 420 | 194 | |

Observation: `'Träningsbank'` only appears on quant items (XYZ/KVA/NOG/DTK) — verbal items are only ever `'HP-träning'`/`'Övning'`. Not a defect, just a naming-convention asymmetry worth knowing about if Phase 07 wants consistent source labeling.

## Per-subtest findings

### ORD — confirmed option-count mismatch, exact scope

**All 168 of 168 ORD items** (`ord-e01`–`ord-e98` [98], `ord-x01`–`ord-x40` [40], `ord-z01`–`ord-z30` [30]) use exactly **4 options (A–D)**. Zero use 5. `ORD.md` confirmed real exams use 5 options (A–E) in all 6 sampled sittings, 2013–2026, with no exceptions. **This is a 100%-of-bank format mismatch — not a subset.** Structural template otherwise matches (single target word, no shared context, no "none of the above"). Register/difficulty mix (168 items: 64 easy/63 medium/41 hard) roughly tracks the calibration doc's "~⅓ genuinely obscure, rest mid-frequency" description reasonably well at the aggregate level — spot-checked 8 items in the answer-key sample below, all correctly keyed.

### LÄS — passage-question pairing exists but is inconsistently implemented; no paired-text sub-format

107 LAS items split into two parallel passage mechanisms that both work but aren't unified:
- **45 items** use the formal `passageId` + `src/data/passages.ts` link (11 passages, `las-p01`–`las-p11`, 4–5 questions each).
- **62 items** ("no `passageId`") turn out to all carry an inline, per-question-duplicated `context` field instead — grouping into **13 more passages** (4–6 questions each) that exist only as repeated text, not a shared record.
- Combined: **24 total passage groups**, sizes 4–6 questions each. **None land in the real corpus's confirmed 2–3-question range** — `LAS.md` found real sittings mix passage sizes from 2 up to 4; the app's smallest passage-group is 4. This is a real structural gap: the app never exercises the "short 2-question passage" format at all.
- **The paired-text/counterpart sub-format (two opinion pieces presented as counterpoints) does not exist anywhere in the bank** — every passage in `passages.ts` and every inline-context group is a single continuous expository text. Confirms `LAS.md`'s flag.
- Answer-key sample (5 items) all checked out against their source passages.

### MEK — blank-count skew confirmed and has worsened since Phase 02

Direct count across all 175 current MEK items (regex on underscore runs `_{2,}` across `text`+`context`, since ~50 items store the actual sentence in `context` with a generic `text` stub — same dual-field pattern as LAS above): **169 double-blank (96.6%), 5 single-blank (2.9%, all `mek-e39/e43/e45/e47/e48`), 1 triple-blank (0.6%, `mek-e77`)**. `MEK.md`'s Phase 02 spot-check found 140/145 double-blank at the time; the bank has since grown by 30 items, and every one of them appears to have been added as double-blank, making the skew *worse*, not better. Real exams mix single-blank as "next most common after double," with triple-blank "a small minority but present every year" — the app is at 1 triple-blank total against a bank of 175. Sampled 9 items for answer-key correctness, all correct; flagged one soft wording-ambiguity (`mek-e48`: "efter" vs. "genom" both arguably fit the single-blank sentence in isolation — not a wrong key, just a slightly under-constrained sentence for a single-blank item).

### ELF — structurally consistent, un-calibratable against real content (confirmed limitation, not a gap to fix)

100 items, same dual passage-mechanism split as LAS: 34 items across 8 formal passages (`elf-p01`–`elf-p08`) + 66 items across 13 inline-context groups = 21 total passage groups, sizes 4–6. Per `ELF.md`, no real ELF exam text exists anywhere in the source corpus (UHR never publishes it), so there is no ground truth to check content against — only structural plausibility (10q/22min position, passage-based format) is checkable, and it checks out. All 4-option, consistent with the app's own established convention (real option count for ELF is simply unknown). Sample of 5 items: all internally consistent (English passage → correct Swedish-question → correct answer, verified against passage text directly).

### XYZ — new finding: 55 items use 5 options instead of 4 (reverse of the ORD problem)

`XYZ.md` confirmed real XYZ is 4-option throughout. Counting the live bank: **210 of 265 XYZ items use 4 options; 55 use 5** — specifically **`xyz-e21` through `xyz-e75`** (a contiguous id range), while `xyz-e01`–`e20` and `xyz-e76`–`e95` (same `xyz-eNN` id family) correctly use 4. This is a self-contained internal inconsistency inside one id block, not related to the 103-item copyright-copy issue (`xyz-001`–`040` were Phase 04's replacement scope; `xyz-e21`–`e75` were never touched by that phase and were not previously flagged anywhere in Phase 02–05's notes). Spot-checked 13 XYZ items (mix of 4- and 5-option, e.g. `xyz-e39` at 5 options) for answer-key correctness — all correct; the extra 5th option is a legitimate 5th distractor, not a placeholder, so these items work fine as practice content, they just don't match the real 4-option format.

### KVA — wording gap confirmed, no new structural issues

183 items, all 4-option, matching real convention on count. `KVA.md`'s wording-fidelity gap (app uses "Storhet I/II" + "störst"/"lika stora"/"går inte att avgöra" vs. real exam's "Kvantitet I/II" + "större än"/"lika med"/"otillräcklig") is confirmed still present across the whole bank (spot-checked options text on 9 sampled items — 100% use the app's "Storhet" convention, 0% use "Kvantitet," consistent with `kva-001`–`028` [Phase 04 replacements] having intentionally moved *away* from "Kvantitet" specifically because that was the real exam's exact wording being copied). All 9 sampled answer keys correct.

### NOG — confirmed correct on format, no new issues

162 items, all 5-option, matching real convention exactly. Wording is the app's own established verbose paraphrase (confirmed identical across every sampled item, copied-and-replaced or original) rather than the real terser convention — already flagged by Phase 02/05 as low priority. 8 sampled items (including `nog-006`, `nog-010` — both inside Phase 05's replacement scope, useful cross-check against that phase's own verification) all correct.

### DTK — format count fine; mobile-width clipping confirmed on existing (pre-Phase-05) content

131 items, all 4-option, matching real convention. The mobile-width issue flagged by `DTK.md` **does reproduce on items Phase 05 never touched** (see dedicated section below) — this is the highest-priority DTK-specific finding. 7 sampled items for answer-key correctness, all correct.

## Volume adequacy (grounded in `buildSession`/`session.ts`, not exam-sitting size)

`src/utils/session.ts`'s `buildSession()` does **no deduplication or rotation of its own** — it just wraps whatever id list it's handed (`groupLinkedPassages` only reorders ids so passage-mates stay adjacent, it never filters). The actual selection logic lives in the callers: `Practice.tsx`'s plain drill flow (`start()`) filters the full bank by type/difficulty/tag, **shuffles the entire filtered pool from scratch**, and slices off `count` questions — every single time, with no memory of what a previous session already showed. The *only* place with cross-session memory is the opt-in SRS "repetition" mode (`getDueQuestions`/`srs.ts`), which most users won't use for every session. So the meaningful volume question isn't "how many questions exist" in isolation, it's: **given the app's own advertised single-subtest session size (`Practice.tsx`'s `TYPE_INFO`), how much overlap should a user expect between two back-to-back sessions of the same type?**

Using expected-overlap ≈ n²/N (session size² over bank size, uniform reshuffle each time):

| Type | Session size (n) | Bank (N) | n²/N | Verdict |
|---|---|---|---|---|
| NOG | 6 | 162 | 0.22 | **Fine as-is** |
| XYZ | 12 | 265 | 0.54 | Fine for now, revisit after volume expansion elsewhere |
| KVA | 10 | 183 | 0.55 | Fine for now |
| MEK | 10 | 175 | 0.57 | Fine for now |
| ORD | 10 | 168 | 0.60 | Fine for now |
| DTK | 12 | 131 | 1.10 | **Thin** — expect ~1 repeat per back-to-back session on average |
| LAS | 16 | 107 | 2.39 | **Thin** — compounded by passage-grouping (only 24 distinct passage groups underlie the 107 items; `groupLinkedPassages` forces whole groups to stay together, so the *effective* pool a session draws from is closer to 24 units, not 107) |
| ELF | 16 | 100 | 2.56 | **Thin** — same passage-grouping effect, only 21 distinct passage groups |

**Recommendation for Phase 07:** prioritize LAS, ELF, and DTK for volume expansion (in that order — LAS/ELF are worst by the numbers, DTK is worst combined with its separate mobile-rendering problem). XYZ/KVA/MEK/ORD/NOG can wait.

## Answer-key sampling (independent recomputation, not re-reading the stored explanation)

Sampled a stratified ~5%-per-type slice (weighted 2:1 toward `'Övning'`/`'Träningsbank'` sources over `'HP-träning'`, since the latter includes Phase 04/05's already-rigorously-verified replacements): **64 items total** (13 XYZ, 9 KVA, 8 NOG, 7 DTK, 8 ORD, 5 LAS, 9 MEK, 5 ELF). For quant items, recomputed the math from scratch (arithmetic, algebra, combinatorics, data-sufficiency logic, table/chart lookups) without reading the stored `explanationData` first. For verbal items, independently re-derived the answer from the passage/sentence/word meaning, then compared to the stored key.

**Result: 0 of 64 sampled items had an incorrect or internally-inconsistent answer key.** All 64 checked out. Two soft, non-blocking wording-ambiguity notes were found (both MEK, both single-blank items where a second option is grammatically plausible in isolation — `mek-y40` and `mek-e48` — but the stored answer is still the best fit given the full sentence, not a wrong key).

**Interpretation:** with 0 errors in 64 independent samples, a rule-of-three estimate puts the upper bound on the true remaining defect rate at roughly **~4.7% (95% confidence)** across the bank outside the already-fixed copied content. Combined with the fact that Phase 03's 6 known defects were specifically traced to `pdftotext` mishandling *only in the copied items* (which are now gone), this suggests the original hand-authored bank (`'Övning'`/`'Träningsbank'`/pre-existing `'HP-träning'`) does **not** have a widespread answer-key defect problem. This is a genuinely reassuring finding — Phase 07 should **not** treat blanket answer-key re-verification as a priority; the sample here (64 items, no defects) doesn't justify the cost of auditing all 1,291.

## DTK mobile-width check (existing bank, not just Phase 05's new items)

Grepped every `tableData.headers.length` and `chartData.series`/`xLabels` length across all 131 DTK items. 74 items carry `tableData`, 37 carry `chartData`. Column distribution: 2-col×4, 3-col×10, 4-col×23, 5-col×20, 6-col×12, 7-col×5.

**17 items across 5 distinct tables have 6–7 columns and predate Phase 05** (none are in the `dtk-001`–`011` range Phase 05 rewrote): `dtk-016`–`020` (6-col, vehicle registrations), `dtk-031`–`035` (7-col, e-commerce spend), `dtk-036`–`040` (6-col, electricity prices by country), `dtk-e14` (6-col, sports league table), `dtk-e26` (6-col, distance matrix).

Rather than assume column-count alone predicts clipping (Phase 05's own note found a 6-column table clipped), this was verified live: ran the dev server, injected each id into `hp_current_session`, and screenshotted `/session` at a 390×844 mobile viewport (same method Phase 05 used), checking the table wrapper's `scrollWidth` vs. `clientWidth`.

**Result — column count alone does not predict clipping, cell content width does:**
- `dtk-016`–`020` (6 cols, but short numeric content + short header "Totalt"): **fits, no overflow** (324px vs. 356px available).
- `dtk-e26` (6 cols, single-letter headers "A"–"E"): **fits, no overflow** (324px vs. 356px).
- `dtk-031`–`035` (7 cols, includes the label "Böcker & Media"): **overflows** (434px content vs. 356px available) — the "Övrigt" and "Totalt" columns are entirely invisible without scrolling, confirmed visually (screenshot shows only a "Öv…" sliver at the right edge).
- `dtk-036`–`040` (6 cols, "Årsmedel" header + country-name row labels): **overflows** (367px vs. 356px) — "Årsmedel" column clipped to a sliver.
- `dtk-e14` (6 cols, "Oavgjorda"/"Förlorade" long headers): **overflows** (374px vs. 356px) — "Poäng" (the answer-relevant column) clipped almost entirely.

So **11 of the 17 wide, pre-existing items (dtk-031–035, dtk-036–040, dtk-e14) visibly clip on mobile today**; the other 6 (dtk-016–020, dtk-e26) happen to fit because their cell content is short. The table wrapper does have `overflow-x-auto` (`Session.tsx` line ~577) — content isn't destroyed, it's reachable by horizontal scroll — but there's no visual affordance (no scroll shadow/arrow) hinting that more columns exist, so a user is likely to answer using only what's visible, which for `dtk-036`–`040` and `dtk-e14` specifically hides the very column the question asks about. **This is worse than Phase 05 realized**: it already knew *new* wide tables clip; this audit shows the *existing* bank has the same problem, unfixed, in 11 live practice items.

Checked `chartData` too, since one item (`dtk-e29`) has 20 x-axis points on a line chart — worth checking for label crowding, not just table width. Live-rendered: labels ("1"–"20") stayed legible at that density; not a defect. No chart-based clipping issues found.

## Prioritized recommendations for Phase 07+

1. **DTK: fix the 11 clipping items** (`dtk-031`–`035`, `dtk-036`–`040`, `dtk-e14`) — either trim columns (Phase 05 precedent: drop a column the question doesn't depend on) or add a scroll affordance to the table wrapper. Low content-writing cost (mechanical edit to existing tables), but currently live and broken for real users today — should rank above net-new volume expansion.
2. **LAS/ELF volume expansion** — worst volume-adequacy numbers of any type, and the smallest two banks overall (107, 100). Also a good opportunity to add the missing 2–3-question-passage size and the wholly-absent paired-text sub-format while writing new content.
3. **MEK blank-count rebalancing** — when adding new MEK content, deliberately skew toward single-blank and triple-blank to correct the 96.6%-double-blank skew; needs no fix to existing items, just different authoring going forward.
4. **DTK volume expansion** (second-lowest volume-adequacy score after LAS/ELF).
5. **XYZ 5-option cleanup** (`xyz-e21`–`e75`, 55 items) — mechanical, not content-writing: drop the extra distractor to match the real 4-option format. Low cost, low urgency (doesn't affect answer correctness, only format fidelity).
6. **KVA wording standardization** ("Storhet"→"Kvantitet" terminology) — cosmetic, low priority, no urgency.
7. **ORD 5th-option retrofit** — see the decision flag below. This is the single largest-scope item in the whole audit and should not be scheduled until the user has chosen an approach.

## Decisions needed from the user before Phase 07 can be scoped

1. **ORD option-count retrofit (the big one).** All 168 ORD items need a genuine 5th distractor to match the real exam's confirmed A–E format. Per the phase doc's framing, this is **real content-writing work, not a mechanical fix** — a 5th plausible distractor has to be independently invented per word, following `ORD.md`'s distractor-construction taxonomy (near-miss register, antonym trap, same-domain-wrong-specificity, morphological false friend), not auto-generated. Sizing: 168 items × 1 new option each, each option needing to be a genuinely plausible-but-wrong answer (not a throwaway filler) — this is comparable in effort to writing ~168 small pieces of original content, not a batch script. Options to flag for a decision:
   - (a) Retrofit all 168 in one dedicated phase before any other Phase 07 work,
   - (b) retrofit incrementally alongside other Phase 07 volume work (slower, but spreads the cost),
   - (c) leave the 4-option format as a deliberate, documented simplification and don't retrofit at all (the app would remain internally consistent, just not format-identical to the real exam).
   No option is obviously "free" — (a)/(b) are ~168 items of genuine authoring effort; (c) leaves a confirmed, known format gap permanently. **Needs an explicit choice before Phase 07 scoping.**
2. **DTK clipping fix approach** — trim the 11 affected items' columns (fast, matches Phase 05's precedent, but loses a data column from the display) vs. investing in a proper scroll-affordance fix to `Session.tsx`'s table renderer (fixes the root cause for all future wide tables, but is a component-level UI change outside this playbook's original "question content" scope). Recommend (a) trimming for Phase 07 given precedent and scope, but flagging since it does touch a shared component pattern question.
3. **XYZ 5-option cleanup timing** — bundle into the ORD decision (both are "existing items don't match the real option-count convention") or treat as a quick, separate mechanical fix Phase 07 can knock out early regardless of what's decided for ORD. Low-stakes either way, but worth an explicit nod so Phase 07 doesn't have to re-derive this reasoning.
