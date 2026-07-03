# KVA (Kvantitativa jämförelser) — Calibration Notes

Derived from `pdftotext -layout` extraction of the KVA sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All patterns are original derivations; no real problem setup or option text from any sampled sitting is reproduced here.

## Format facts (stable across all 6 sampled dates)

- **10 questions per sitting**, numbered 13–22, recommended time **10 minutes** (~1 min/item).
- **4 answer options (A–D)**, with the *exact same four option labels reused verbatim on every single item, every sitting, every sampled year*: a "quantity I is larger," "quantity II is larger," "the two quantities are equal," and "the information given is insufficient to determine" — always in that order, always all four present. Confirmed word-for-word identical option phrasing across all 6 sampled sittings, 2013 through 2026 (paraphrased here per the copyright boundary, not quoted).
- The two compared quantities are consistently labeled with the Swedish word for "quantity" (not "storhet" — a different, less common Swedish math term) followed by a Roman numeral I / II, printed as two short labeled lines above the answer options, with the mathematical setup itself given either as a shared preamble (e.g. one or two given facts/expressions relevant to both quantities) or with no preamble at all when the quantities are self-contained expressions.

## Structural template (paraphrased)

An item states zero, one, or two shared facts/constraints (an equation, a described geometric figure, a defined variable relationship), then presents "Quantity I" and "Quantity II" as two expressions or described values to compare. The test-taker judges the size relationship, not the actual values — many items are solvable without ever computing a concrete number, by reasoning about the relationship structurally (a deliberate design feature of the format, not incidental).

## Topic distribution (as a distribution, not a list)

Across the sample, KVA items draw on the same broad topic pool as XYZ — algebra (inequalities, expressions with unknowns), geometry (comparing lengths/areas/angles derived from a described figure), and arithmetic/number properties (parity, sign, exponent rules) — but the *format itself* (comparison rather than compute-the-value) means items are frequently built around properties that hold or fail depending on unstated assumptions (e.g. whether a variable can be negative, zero, or fractional), making "informationen är otillräcklig" a genuinely common correct answer, not a rare trap option. Geometric figure-based comparisons (comparing two lengths or angles from one described figure) appear consistently across sampled sittings as a recurring sub-category distinct from pure algebraic comparison items.

## Distractor construction patterns

- **Missing-case trap**: the single most characteristic KVA distractor pattern — a test-taker mentally tests one case (e.g. assumes a variable is positive) and picks "I is larger" or "II is larger" based on that one case, when a different valid case reverses the relationship, making "insufficient information" the actual correct answer. This pattern recurs across the sample far more than in XYZ.
- **Superficial equality**: an item is constructed so two expressions look structurally identical or symmetric, tempting the "equal" answer, when a specific numeric detail actually breaks the symmetry.
- **Direction reversal**: swapping which of I/II is described as larger is a natural distractor pair (if I is actually larger, "II is larger" is an obvious wrong option) — meaning KVA items always effectively contain their own mirror-image wrong answer, more so than any other subtest.

## Difficulty spread

Items with a concrete numeric setup and no free variables are the easiest (reduce to simple computation). Items involving free variables with unstated sign/range constraints, or geometric comparisons requiring recognizing a non-obvious relationship (e.g. triangle inequality reasoning), are the hardest — and correlate strongly with "insufficient information" being the correct answer. Difficulty is not strictly increasing across the 13–22 sequence but the harder, case-dependent items are noticeably more concentrated in the second half of the block across the sample.

## Cross-reference note

The app's `SECTIONS()` model labels KVA "Jämförelser" (cat: quant) — name is a reasonable short form but the real exam's own full name is "Kvantitativa jämförelser." The playbook's own phase doc assumed KVA's 4 options would read "I är större", "II är större", "lika stora", "kan ej avgöras" — **checked directly against the sample and this exact wording is not what real exams use.** The real, confirmed convention (paraphrased) is closer to "quantity I is greater than II," "quantity II is greater than I," "quantity I equals quantity II," and "the information is insufficient." The app's current KVA bank (`src/data/questions.ts`) uses its own paraphrase — "Storhet I är störst" / "Storhet II är störst" / "Storheter är lika stora" / "Det går inte att avgöra" — which is semantically equivalent to the real convention but uses "Storhet" (a valid but different Swedish math term) instead of the real exam's "Kvantitet," and a different English-order phrasing ("is largest" vs. "is greater than [the other]"). Flagged for Phase 03: not a functional bug, but a wording-fidelity gap worth standardizing toward the real exam's actual terminology and phrasing pattern.

Separately, and confirmed directly: `kva-001` (`source: '2026-04-18 PP3'`) reproduces a real item's exact numeric setup and uses the real exam's actual "Kvantitet I/II" and "informationen är otillräcklig" wording verbatim — because it's a direct copy, checked against `Reference/raw-exams/2026-04-18/provpass-3-kvant.txt` question 13. This is the same verbatim-copy issue documented in `XYZ.md`, `NOG.md`, and `DTK.md`, confirmed here to extend to KVA as well. All 28 KVA items carrying a `2025`/`2026`-dated `source` field should be treated as presumptively verbatim and replaced — see `XYZ.md` for the full scope (103 dated-source items total across XYZ/KVA/NOG/DTK).
