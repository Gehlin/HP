# ORD (Ordförståelse) — Calibration Notes

Derived from `pdftotext -layout` extraction of the ORD sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All statistics and patterns below are original observations/derivations, not quoted exam text — see the playbook `README.md` boundary. No real ORD word, target term, or answer option from any sampled sitting is reproduced here.

## Format facts (stable across all 6 sampled dates, 2013–2026)

- **10 questions per sitting**, numbered 1–10, recommended time **3 minutes** (by far the fastest-paced subtest per question — roughly 18 seconds/item).
- **5 answer options (A–E)**, not 4. This is consistent across every sampled date, oldest to newest — ORD is the only verbal subtest that consistently uses a 5-option format matching NOG's option count on the quant side, rather than the 4-option format used by LÄS/MEK/ELF.
- Layout: questions are typeset two-per-row (odd-numbered question on the left, even-numbered on the right), each followed immediately by its own vertical A–E option list. No shared passage or stem context — each item is fully self-contained.
- No per-question instructional phrase (no repeated "betyder ungefär detsamma som" boilerplate attached to each item) — the task framing is established once, in the exam's general anvisningar/exempel booklet, which is administrative boilerplate excluded from the downloaded archive (see Phase 01 notes) and was not analyzed here. A single clear instructional stem per question (as the app currently uses) is a defensible simplification, just not literally how the primary provhäfte layout works.

## Structural template (paraphrased, not copied)

Each item presents one Swedish target word — typically a single lexical item, occasionally a fixed idiomatic/compound form — with no surrounding sentence or context. The five options are single words or short (2–4 word) phrases the test-taker must judge as closest in meaning to the target. There is no "none of the above" or "cannot be determined" option; all five slots are always filled with plausible answer candidates.

## Difficulty spread within a single sitting

Each 10-item ORD block visibly mixes registers: a handful of items use words that are recognizable to an educated general reader (moderately formal written Swedish — the kind found in newspaper opinion pieces or nonfiction), while others draw on genuinely low-frequency vocabulary (domain-specific terms from medicine, law, natural science, or older/literary Swedish) that most test-takers would not encounter in everyday speech. There is no visible block-ordering by difficulty (i.e., items are not sorted easy-to-hard) — an easy and a hard item can sit adjacent. Across the sample, roughly a third of items per sitting land solidly in "genuinely obscure" territory, with the rest spread across a mid-frequency band — words a well-read adult would recognize but not use actively.

## Distractor construction patterns

Wrong options observed clustering into a few repeatable patterns, generalized here (not tied to any specific sampled item):

- **Near-miss register/connotation**: a distractor shares emotional tone or domain with the correct answer but is off on intensity or specificity (e.g., a word that means "annoyed" offered as a distractor for a target meaning "furious").
- **Opposite/antonym trap**: at least one distractor per item is frequently the near-opposite of the correct meaning, testing whether the test-taker actually knows the word versus vaguely recalling its "charge" (positive/negative).
- **Same-domain-wrong-specificity**: distractors drawn from the same conceptual field as the target but denoting a different specific concept within it (e.g., for a target from medical vocabulary, distractors that are also medical terms but describe a different condition/process).
- **Morphological false friend**: a distractor that superficially resembles the target word's root or a common cognate, tempting a test-taker to guess from word shape rather than actual meaning.
- Rarely, one distractor is a plainly implausible outlier included mainly to fill the option count rather than to mislead — but this is the exception, not the norm; most distractors in the sample are genuinely plausible to someone who half-knows the word.

## Register/topic distribution (as a distribution, not a list of actual words seen)

Target words cluster predominantly in formal/written-register general Swedish vocabulary (the kind found in quality journalism, essays, and nonfiction), with a consistent minority drawn from specialized domains — medicine, law/administration, natural science, and classical/Latin-derived academic vocabulary appear repeatedly across sittings. Everyday conversational vocabulary essentially never appears as a target (though it does appear as distractor material). This matches the general characterization already in the playbook README: "ORD words cluster in the mid-frequency written-Swedish band, rarely genuinely obscure" — largely true, with a genuinely-obscure minority (see difficulty spread above) rather than none.

## Cross-reference note (see also Phase 02 completion notes in `Phase-02-Calibration-Patterns.md`)

The app's current ORD question bank (`src/data/questions.ts`) uses **4 options (A–D)** for every ORD item. All 6 sampled real sittings, spanning the full 2013–2026 range, use **5 options (A–E)**. This is a confirmed, high-confidence format mismatch — flagged for Phase 03's audit.
