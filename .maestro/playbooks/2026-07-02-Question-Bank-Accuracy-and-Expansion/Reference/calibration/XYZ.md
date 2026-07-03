# XYZ (Matematisk problemlösning) — Calibration Notes

Derived from `pdftotext -layout` extraction of the XYZ sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All patterns are original derivations; no real problem text, numeric setup, or option text from any sampled sitting is reproduced here.

## Format facts (stable across all 6 sampled dates)

- **12 questions per sitting**, numbered 1–12 (first block in the quant provpass), recommended time **12 minutes** (~1 min/item).
- **4 answer options (A–D)** throughout, in every sampled sitting.
- Each item is a self-contained problem — a short verbal setup, an equation/expression, or a small geometric figure with a question — with no shared context across items (unlike DTK, where several items can share one chart/table).

## Structural template (paraphrased)

Most items follow one of a few recurring shapes: (a) a bare symbolic/algebraic expression to simplify or evaluate; (b) a short word problem requiring translation into an equation before solving; (c) a geometric figure (triangle, circle, rectangle, coordinate points) with a numeric or ratio question; (d) an abstract "which of the following must/could be true" reasoning item using variables rather than concrete numbers. Figures, when present, are simple line diagrams with minimal labeling.

## Topic distribution (as a rough distribution across the sample, not a list of exact problems)

Across the 6 sittings (72 items observed), the topic mix skews toward algebra (equation manipulation, expressions, functions defined by a formula) as the single largest category, followed by geometry (triangles, circles, coordinate geometry, angle relationships) as a close second. Arithmetic/number-sense items (fractions, ratios, percentages, divisibility/parity reasoning) form a consistent third category. Probability and combinatorics appear only occasionally — present in most but not all sampled sittings, and never more than one or two items per 12-item block. Pure abstract-reasoning items (true/false about variables with no concrete numbers) appear as a recurring minority pattern across years, not a one-off.

## Distractor construction patterns

- **Sign/operation error**: a distractor matches what you'd get from a very common computational slip — adding instead of multiplying, wrong sign on a negative term, using the wrong denominator — reproducing an error path a real test-taker could plausibly make, not a random wrong number.
- **Partial-solution value**: a distractor is an intermediate value from the correct solution path, offered as if it were the final answer — testing whether the test-taker stopped one step too early.
- **Off-by-structure**: for geometry/ratio items, a distractor applies the right general method to the wrong quantity (e.g. area formula reasoning applied where perimeter was asked, or vice versa).
- **Reversed relationship**: for "solve for x" style items framed as an equation between two expressions, a distractor corresponds to solving the mirrored/reciprocal relationship.
- Distractors in XYZ are consistently numerically "close enough to be tempting" rather than wildly implausible — a hallmark of the subtest being scored on genuine mathematical error rather than guessing.

## Difficulty spread

Items early in the 1–12 sequence trend toward more direct computation (fewer steps, more standard formulas), while later items trend toward requiring an extra translation or reasoning step (word problems needing to be set up before solving, or "which must be true" items requiring checking multiple cases) — this ordering-by-difficulty tendency is visible but not absolute; easier and harder items are interspersed throughout, especially past item 6 or so. Multi-step algebra and case-based reasoning items ("could x be...", "must the following be true...") are consistently the hardest category observed.

## Cross-reference note

The app's `SECTIONS()` model labels XYZ "Problemlösning" (cat: quant) — name matches. The app's XYZ question bank uses 4 options consistently, matching the real-exam convention. **Separately and more seriously**: while reviewing `src/data/questions.ts` for option-count verification, roughly 100 quant items (tagged with `source` fields like `'2026-04-18 PP3'`, `'2025-10-19 PP1'`, `'2025-10-19 PP4'`, `'2025-04-05 PP5'`, `'2026-04-18 PP5'`) were spot-checked against the corresponding real provpass PDFs in `Reference/raw-exams/` and found to be **verbatim or near-verbatim reproductions of real exam items** — identical numeric setups, identical answer option values, same correct answer, differing only in cosmetic LaTeX re-typesetting of the math. This is a direct violation of the copyright boundary this whole initiative operates under (see root `README.md`) and predates this phase's work — it was not introduced here. This is flagged prominently for Phase 03/04 as the single highest-priority item: these ~100 items need to be identified precisely and replaced with freshly-written originals, not merely reviewed for "gaps." See this phase's completion notes for the full cross-reference writeup.
