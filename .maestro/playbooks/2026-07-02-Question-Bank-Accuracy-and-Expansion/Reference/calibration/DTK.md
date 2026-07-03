# DTK (Diagram, tabeller och kartor) — Calibration Notes

Derived from `pdftotext -layout` extraction of the DTK sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All patterns are original derivations; no real chart title, dataset, or question text from any sampled sitting is reproduced here except where explicitly noted as a confirmed-copy finding below (which is deliberately not paraphrased, since flagging the exact match is the point).

## Format facts (stable across all 6 sampled dates)

- **12 questions per sitting**, numbered 29–40 (last block in the quant provpass), recommended time **23 minutes** — the largest time allotment of any single subtest block, reflecting that DTK items require reading a data display before answering, and that several questions typically share one display.
- **4 answer options (A–D)** throughout, in every sampled sitting.
- Unlike XYZ/KVA/NOG (one self-contained item each), DTK items are grouped: one chart/table/map typically anchors 2–4 consecutive questions, so a 12-question block draws on roughly 3–5 distinct data displays per sitting, not 12.

## Chart/table/map type mix (as a distribution across the sample)

Across the 6 sittings, data displays observed include: multi-column statistical tables (the single most common type — a labeled-row, multi-column-of-numbers table, sometimes split into two side-by-side blocks to fit a page), line/bar charts showing a trend over a span of years, stacked or grouped bar charts breaking a total down by category and sub-category simultaneously, pie/proportion charts, and — less frequently but present across multiple sampled years — maps with regional data annotations. Tables are the dominant format by a clear margin in the sample; pure maps are the rarest of the types observed.

## Table width and column count — flagged finding

This directly addresses the concern noted during the design-reconciliation verification about the app's DTK tables risking clipping on phone-width layouts. Checked directly against the sample: real DTK tables are frequently **wide**. One sampled table (a hospital-statistics table, 2026-04-18 sitting) lists dozens of rows across **8 data columns** (row label + 3 numeric measures, printed as two side-by-side 4-column blocks to fit the page). A separate sampled table (regional demographic breakdown, 2023-10-22 sitting) runs **9 columns** (a label plus 8 numeric sub-categories). A third (grades-by-subject breakdown, 2021-10-24 sitting) runs roughly **10 columns** (subject name, total count, gender split, then percentage columns for each of 6 grade levels plus a "no data" column). None of the sampled DTK tables were narrower than about 4–5 columns; the norm across the sample skews toward **6–10 columns**, not the narrower 3–5-column range that fits comfortably in a typical phone-width card layout. **This is a real format mismatch to flag for Phase 03/04**: any app DTK table rendering that assumes tables will usually be narrow enough to avoid horizontal scrolling on mobile does not match the real exam's typical table width.

## Distractor construction patterns

- **Wrong-column/wrong-row read**: a distractor value corresponds to correctly reading the chart/table but at the wrong row, column, or year — the most common DTK distractor type, testing careful lookup rather than reasoning.
- **Right-value-wrong-operation**: a distractor applies the wrong arithmetic operation to correctly-read values (e.g. sums two values that should have been compared as a ratio, or computes a percentage of the wrong total).
- **Interpolation/extrapolation trap**: for trend-chart items asking about a year not explicitly labeled, a distractor reflects a naive linear-interpolation error rather than correctly reading the nearest labeled point or trend shape.
- **Base-rate confusion**: for percentage/proportion questions, a distractor results from computing a percentage of the wrong base total (e.g. a sub-group total instead of the grand total) — recurs specifically in the denser multi-column tables.

## Difficulty spread

The easiest items in a DTK block are direct single-value lookups (read one cell/point correctly). Medium items require a single comparison or simple computation across two values (a difference, a ratio, "which is largest"). The hardest items require combining information across multiple rows/columns or across two different displays anchored to the same passage of questions, and/or require correctly identifying the right subset of data to use before computing anything — this last pattern (identifying the right subset in a wide, dense table) is where DTK's difficulty most often actually lives, more than the arithmetic itself.

## Cross-reference note

The app's `SECTIONS()` model labels DTK "Diagram & kartor" (cat: quant) — a shortened form of the real exam's full name "Diagram, tabeller och kartor" that drops "tabeller" (tables) from the label despite tables being the single most common display type in the real corpus (see above); worth a naming-completeness look in Phase 03, low priority. The app's DTK bank uses 4 options consistently, matching the real convention. **Higher-priority finding, confirmed directly**: at least one app DTK item (`dtk-001`, `source: '2026-04-18 PP3'`) reproduces a real table's exact title, exact row labels (hospital names), and near-identical question phrasing from the corresponding real provpass PDF in `Reference/raw-exams/2026-04-18/`. This is the same verbatim-copy issue documented in `XYZ.md` and `NOG.md`, confirmed here to extend to DTK as well — all 11 DTK items carrying a `2025`/`2026`-dated `source` field should be treated as presumptively verbatim and replaced.
