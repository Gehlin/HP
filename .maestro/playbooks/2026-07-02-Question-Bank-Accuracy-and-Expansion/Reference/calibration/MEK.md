# MEK (Meningskomplettering) — Calibration Notes

Derived from `pdftotext -layout` extraction of the MEK sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All patterns are original derivations; no real sentence or option text from any sampled sitting is reproduced here.

## Format facts (stable across all 6 sampled dates)

- **10 questions per sitting**, numbered 21–30, recommended time **8 minutes** (~48 seconds/item).
- **4 answer options (A–D)** throughout, in every sampled sitting.
- Each item is a single Swedish sentence (occasionally two related sentences forming one item) with one, two, or three blanks (marked with an underscore run, e.g. "____"), and each option row supplies a complete set of words/phrases — one per blank — as a single option. Test-takers pick the *one* option whose full set of words fits every blank coherently, not per-blank independent choices.
- Blank count per item varies within a single sitting: the sample shows single-blank, double-blank, and triple-blank items coexisting in the same 10-item block, with double-blank items the most common, single-blank items next, and triple-blank items the rarest (a small minority per sitting, but present in every sampled year, not a one-off).

## Structural template (paraphrased)

A sentence — often syntactically complex, sometimes drawn from a register resembling factual/expository nonfiction (history, science reporting, general knowledge trivia, or humorous/informal register in a minority of items) — has one or more words removed. The four options each substitute their own word(s)/phrase(s) for the blank(s), and all four are grammatically valid substitutions; the test is semantic (which combination makes logical/contextual sense), not grammatical.

## Distractor construction patterns

- **Single-word swap plausibility**: for multi-blank items, distractor option sets are usually correct on some blanks and wrong on just one — a test-taker who is careless about one blank in an otherwise-right-sounding option will pick a distractor. This "almost right" structure is the dominant distractor mechanism in MEK, more so than any other verbal subtest.
- **Register mismatch**: a distractor word is topically plausible but breaks the sentence's tone (e.g. an overly casual or overly technical term inserted into a sentence with a different register).
- **Logical-relation reversal**: for sentences built around a two-part logical relationship (contrast, cause-effect, concession), at least one distractor option supplies words that assert the *opposite* logical relationship of what the rest of the sentence requires — this is a very common trap specifically in double- and triple-blank items.
- **Semantically-adjacent-but-wrong-shade**: single-word distractors that are near-synonyms of the correct word but carry a subtly wrong connotation or degree (similar in flavor to ORD's distractor style, but constrained by having to also fit correctly into a full sentence).

## Difficulty spread

Single-blank items are, on average, the easiest — usually solvable from local sentence context alone. Double- and (especially) triple-blank items are harder because an error in reasoning about any one blank can eliminate the correct answer or wrongly validate a distractor; triple-blank items in the sample consistently sit at the harder end of the 10-item block. Sentence topic/register also affects difficulty independent of blank count — sentences using specialized vocabulary (medical, legal, technical/engineering, historical-academic) register as harder than sentences using general-knowledge or narrative register, even at the same blank count.

## Topic/register distribution (as a distribution)

Sentence subject matter across the sample spans: factual/historical statements, natural-science or technical explanations, general cultural or social commentary, and a recurring minority of intentionally informal/wry or first-person sentences (reviews, personal complaints, humor) that contrast with the otherwise formal register of the block. No topic dominates; MEK functions more as a syntax-and-logic test using varied subject matter as raw material than as a subject-knowledge test.

## Cross-reference note

The app's `SECTIONS()` model labels MEK "Meningskompl." (cat: verbal) — name matches (abbreviation of Meningskomplettering). The app's MEK question bank uses 4 options consistently, matching the real-exam convention. No option-count mismatch found for MEK. Checked directly: the app's MEK bank (145 items) has 140 double-blank items and only 1 triple-blank item, with the rest single-blank — double-blank is heavily over-represented relative to the real corpus (where single-blank items are a substantial share too, not a small minority), and triple-blank items are essentially unrepresented. Flagged for Phase 03's audit as a blank-count distribution gap, not just an option-count check.
