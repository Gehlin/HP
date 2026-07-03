# Copied-Content Manifest

Definitive, individually-verified worklist produced by Phase 03. Every one of the 103 items in `src/data/questions.ts` tagged with a dated real-exam `source` field (pattern `/^\d{4}-\d{2}-\d{2}\s+PP\d+$/`) was checked question-by-question against the real UHR exam PDF its `source` field names — text, options, and correct answer — not sampled. This is the exact worklist Phase 04 (XYZ/KVA) and Phase 05 (NOG/DTK) execute against. Phase 03 did **not** modify `src/data/questions.ts` — identification and verification only.

## Method

1. **Enumeration.** Regex-matched every consecutive `id: '...', type: '...', source: '...'` triple in `src/data/questions.ts` against the dated-source pattern. Found exactly **103** items — **40 XYZ, 28 KVA, 24 NOG, 11 DTK** — confirming Phase 02's aggregate count exactly, with no malformed/near-miss source fields found (no items with a date-like string that didn't cleanly match the full pattern). The aggregate holds.
2. **Source dates involved:** `2026-04-18` (PP3, PP5), `2025-10-19` (PP1, PP4), `2025-04-05` (PP5) — three exam sittings, five provpass. `2025-04-05` was not one of Phase 02's 6 sampled dates and had not been extracted yet; its `provpass-3-kvant`, `provpass-5-kvant`, and facit PDFs were freshly extracted with `pdftotext -layout` for this phase (clean extraction, no issues). `2025-10-19`'s kvant provpass/facit PDFs (partially extracted ad hoc in Phase 02) were completed the same way. `2026-04-18` reused Phase 02's existing extraction.
3. **Matching.** The app's `number` field on each item is the real exam's own question number (confirmed directly: XYZ 1–12, KVA 13–22, NOG 23–28, DTK 29–40 per every sampled provpass's own instruction table). This let every item be looked up directly in the corresponding real provpass text by question number, rather than by fuzzy text search — a reliable, exhaustive method, not spot-checking.
4. **Answer-key cross-check.** Every item's `answer` field was additionally cross-checked against the real facit (parsed programmatically from the official 4-column answer-key PDFs) as a second, independent verification signal beyond text/option comparison. This caught several items where the app's transcription of the real question (usually a fraction, radical, or decimal-comma detail mangled by `pdftotext`'s handling of stacked math notation) diverges from the true real values, and one item (`nog-024`) whose statements and answer don't match the real item at all despite the dated tag.

## Classification counts

| Type | verbatim | near-verbatim | not-a-match | total |
|---|---|---|---|---|
| XYZ | 40 | 0 | 0 | 40 |
| KVA | 28 | 0 | 0 | 28 |
| NOG | 22 | 1 | 1 | 24 |
| DTK | 3 | 8 | 0 | 11 |
| **Total** | **93** | **9** | **1** | **103** |

- **verbatim (93):** question text and options match the real exam PDF essentially word-for-word / number-for-number (differences are only `pdftotext` OCR artifacts like `×` rendering as `$`, or missing radical/root glyphs — not authored differences).
- **near-verbatim (9):** one item (`nog-022`) where the two NOG data-sufficiency statements are copied verbatim but the surrounding setup and answer diverge; eight DTK items where a specific real datapoint or row-total needed to answer the question was reused verbatim (numbers found nowhere else, exact matches to specific real table cells) but the rest of the displayed table/chart was reconstructed or partially fabricated around it.
- **not-a-match (1):** `nog-024` — its dated `source` tag does not correspond to matching content in the named real exam; this is very likely original writing that inherited a `source` tag from copy-paste of a template/neighboring item during authoring, not a copyright violation. **This confirms the phase doc's warning that not every dated-tag item is necessarily a real copy** — the aggregate count of 103 held for *tagged* items, but 1 of the 103 tagged items isn't actually copied content.

## Content-integrity defects found (separate from the copyright issue)

Six items are verbatim/near-verbatim copies whose own `answer` field does **not** match the real exam's official facit answer, because whatever process authored/transcribed them into `questions.ts` mis-read stacked math notation in the source PDF (a decimal comma dropped, a fraction's numerator/denominator swapped with a radical index, etc.). The app's explanation for these is self-consistent with its own (subtly wrong) numbers, so this wasn't previously visible as a bug — the question "works" internally, it just isn't the real question. Affected: `xyz-004`, `xyz-040`, `kva-009`, `kva-014`, `nog-020`, `nog-022` (see per-row notes below for detail on each). Phase 04/05 should not treat these current answer keys as a reference when writing replacements — verify any newly written item's math independently.

## UI visibility of `source`

**`source` is directly user-visible**, not just an internal tag:
- `src/pages/Session.tsx:528` — every question card during an active practice session renders a chip: `{q.source} · #{q.number}`. For the 103 affected items this currently shows e.g. `2026-04-18 PP3 · #1` live to the end user while they answer.
- `src/pages/Bookmarks.tsx:177` — the same `{q.source} · #{q.number}` chip renders on saved/bookmarked questions.
- `src/types.ts:34` declares `source: string` on the `Question` type; no other component reads `.source` (checked all of `src/pages/` and `src/components/`).

This means the current state isn't just a copyright problem — the app is actively telling users "this is question 1 from the real 2026-04-18 exam," which is a second, independent problem (per the phase doc: a fairness issue for future test-takers, since old items get reused in unscored `utprövningspass`). **Recommendation for Phase 04/05's replacement content:** set `source` to `'HP-träning'` for all replaced items, matching the convention already used by the app's unaffected original items (574 items already use this exact value; two other existing values, `'Övning'` and `'Träningsbank'`, are also already in use elsewhere in the bank — `'HP-träning'` is recommended for consistency with the largest existing original-content bucket, not because the other two are wrong). Do **not** fabricate a fake date-shaped source — that would silently reintroduce the same "looks like a real exam" signal to the UI chip that caused this problem, just with fictitious data instead of real data.

For `nog-024` (the one not-a-match item), the fix is different: just correct its `source` field to `'HP-träning'` (or similar) directly in this phase's tracking — no content replacement needed — since its content is original but currently mislabeled as a real exam item, which is itself misleading to users via the same UI chip.

## Full worklist

| id | type | classification | source | action |
|---|---|---|---|---|
| `dtk-001` | DTK | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `dtk-002` | DTK | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `dtk-003` | DTK | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `dtk-004` | DTK | near-verbatim | 2026-04-18 PP5 | Near-verbatim (partial): real 2005 row values (10 330 medlemmar, 45%) reused verbatim to derive the correct answer; other rows/years (1990-2000, 2008, 2012, 2014) and all wrong-answer distractors are fabricated, not present in the real table. |
| `dtk-005` | DTK | near-verbatim | 2026-04-18 PP5 | Near-verbatim (partial): real 2010 datapoint (31 667 invintrade / 7 850 vinterförluster) reused verbatim to derive the correct answer; other columns of that row and the rest of the table are fabricated. |
| `dtk-006` | DTK | near-verbatim | 2026-04-18 PP5 | Near-verbatim (partial): real 2016 datapoint (12 026 medlemmar, 2 294 beräknad totalskörd) reused verbatim to derive the correct answer; other columns/rows fabricated. |
| `dtk-007` | DTK | near-verbatim | 2025-10-19 PP4 | Near-verbatim (partial): per-country figures are fabricated but the 2010 and 2016 row-sum totals (1 056 and 971) match the real table exactly, which is what the question and answer depend on. |
| `dtk-008` | DTK | near-verbatim | 2025-10-19 PP4 | Near-verbatim (partial): reuses the real Sverige-2010 biograf count (489) and platser figure (129 969) needed for the answer; other per-country/year cells fabricated. |
| `dtk-009` | DTK | near-verbatim | 2025-10-19 PP4 | Near-verbatim (partial): table format/category list is a reconstruction of the real "Sveriges utrikeshandel" bar chart with several categories invented (Råvaror utom bränslen, Kemikalier, Transportmedel do not appear in the real chart); answer letter (C) coincides with real facit. |
| `dtk-010` | DTK | near-verbatim | 2025-10-19 PP4 | Near-verbatim (partial) **with a correctness defect**: the three category values used (Mineraliska bränslen, Järn och metall, Malm/metallskrot) are fabricated, not the real chart's figures — app's own answer (C, 65 mdr kr) does **not** match the real facit answer (A, 23 mdr kr) for this real question. Do not carry forward the app's current answer key even as a reference. |
| `dtk-011` | DTK | near-verbatim | 2025-10-19 PP4 | Near-verbatim (partial): reuses the real chart's exact Livsmedel export/import pair (62 / 105 mdr kr) verbatim to derive the correct answer, and even lands on the same answer letter (D) as the real item; other categories/values in the option list are fabricated (Kemikalier, Maskiner och apparater, Råvaror utom bränslen are not in the real chart with these figures). |
| `kva-001` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-002` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-003` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-004` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-005` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-006` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-007` | KVA | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-008` | KVA | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-009` | KVA | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). **Also has a transcription defect** — app's own answer (A) does not match the real facit (B) for this item (real quantities appear to involve a cube-root/coefficient placement the app's transcription got backwards); don't reuse its answer key as a reference. |
| `kva-010` | KVA | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-011` | KVA | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-012` | KVA | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-013` | KVA | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-014` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). **Also has a transcription defect** — app's own answer (C, "lika") does not match the real facit (B); real Kvantitet I is almost certainly "2,5 procent av 16" (decimal comma dropped by PDF extraction and mis-copied as "25 procent") rather than "25 procent av 16" as transcribed; don't reuse its answer key as a reference. |
| `kva-015` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-016` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-017` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-018` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-019` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-020` | KVA | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-021` | KVA | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-022` | KVA | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-023` | KVA | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-024` | KVA | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-025` | KVA | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-026` | KVA | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-027` | KVA | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `kva-028` | KVA | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-001` | NOG | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-002` | NOG | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-003` | NOG | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-004` | NOG | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-005` | NOG | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-006` | NOG | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-007` | NOG | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-008` | NOG | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-009` | NOG | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-010` | NOG | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-011` | NOG | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-012` | NOG | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-013` | NOG | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-014` | NOG | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-015` | NOG | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-016` | NOG | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-017` | NOG | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-018` | NOG | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-019` | NOG | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-020` | NOG | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). **Also has a logic/answer-key defect** — app's own answer (D, "each independently sufficient") does not match the real facit (A, "sufficient in (1) but not (2)"); statement (1) alone already determines a unique positive integer (x=110), so (2) is redundant, but the app's explanation reasons that (2) is also independently sufficient. Don't reuse its answer key as a reference. |
| `nog-021` | NOG | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-022` | NOG | near-verbatim | 2025-10-19 PP4 | Near-verbatim (partial): the two numbered statements — "(1) u + v + w = 180" and "(2) v = w" — are copied word-for-word from the real item, but the descriptive diagram setup text was invented (the real item relies entirely on an unrendered geometric figure with no textual description) and the app's own answer (C) does not match the real facit (B) for the configuration it invented. Replace; do not reuse its answer key. |
| `nog-023` | NOG | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `nog-024` | NOG | **not-a-match** | 2025-10-19 PP4 | **Leave content as-is, do not replace.** Source tag points to 2025-10-19 PP4 #28, but the real #28's statements ("(1) x = y + z", "(2) x = -2y") are completely different from the app's statements ("(1) x + y + z = 15 and x = 5", "(2) y > z"), and the real facit answer (E) differs from the app's answer (C, which is internally correct for the app's own — different — statements). This is original content that inherited a dated `source` tag, not a copy. **Only action needed: correct its `source` field** (recommend `'HP-träning'`) — do not touch `text`/`options`/`answer`/`explanation`. |
| `xyz-001` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-002` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-003` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-004` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). **Also has a transcription defect** — app's own answer (D, 4/5) does not match the real facit (B, 5/4); the real equation is almost certainly "(8/15)·x = 2/3" (x multiplied by the fraction) but was transcribed as "8/(15x) = 2/3" (x in the denominator), a plausible fraction-layout misread of the source PDF. Don't reuse its answer key as a reference. |
| `xyz-005` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-006` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-007` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-008` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-009` | XYZ | verbatim | 2026-04-18 PP3 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-010` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-011` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-012` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-013` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-014` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-015` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-016` | XYZ | verbatim | 2026-04-18 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-017` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-018` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-019` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-020` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-021` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-022` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-023` | XYZ | verbatim | 2025-10-19 PP1 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-024` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-025` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-026` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-027` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-028` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-029` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-030` | XYZ | verbatim | 2025-10-19 PP4 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-031` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-032` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-033` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-034` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-035` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-036` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-037` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-038` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-039` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). |
| `xyz-040` | XYZ | verbatim | 2025-04-05 PP5 | Replace — verbatim copy of real exam item (question text/options match the real PDF essentially word-for-word/number-for-number). **Also has a transcription defect** — app's own answer (C, 6) does not match the real facit (B, 3√2); the real radicand is almost certainly "9 × 2" (giving √18 = 3√2) but was transcribed as "9 × 4" (giving √36 = 6), a plausible misread of the source PDF's radical layout. Don't reuse its answer key as a reference. |

## Scope note for Phase 04/05

- Phase 04 (XYZ + KVA, 68 items): all 68 are `verbatim` — straightforward full replacement, calibrated against `Reference/calibration/XYZ.md` / `KVA.md`. Two (`xyz-004`, `xyz-040`, plus KVA's `kva-009`, `kva-014` — 4 of the 68) carry the transcription-defect flag; no special handling needed beyond not reusing their current answer key as a sanity reference.
- Phase 05 (NOG + DTK, 35 items): 34 need replacement (22 NOG verbatim + 1 NOG near-verbatim [`nog-022`] + 3 DTK verbatim + 8 DTK near-verbatim), calibrated against `Reference/calibration/NOG.md` / `DTK.md`. **1 item, `nog-024`, needs no content replacement** — only a `source` field correction (see its row above). Net: 34 of the 35 NOG/DTK items get replaced, 1 gets relabeled.
