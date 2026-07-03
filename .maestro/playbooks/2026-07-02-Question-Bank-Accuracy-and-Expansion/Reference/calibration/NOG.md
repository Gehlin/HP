# NOG (Kvantitativa resonemang) — Calibration Notes

Derived from `pdftotext -layout` extraction of the NOG sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All patterns are original derivations; no real question stem or statement text from any sampled sitting is reproduced here.

## Format facts (stable across all 6 sampled dates)

- **6 questions per sitting** — the shortest block of any subtest, quant or verbal — numbered 23–28, recommended time **10 minutes** (~1 min 40 s/item, the most generous per-item allowance in the quant section).
- **5 answer options (A–E)**, confirmed identical in wording and order across all 6 sampled sittings, 2013 through 2026 (paraphrased here, not quoted): "sufficient using statement (1) alone, not (2)"; "sufficient using statement (2) alone, not (1)"; "sufficient using (1) and (2) together, but neither alone"; "sufficient using either (1) or (2) alone"; "not sufficient even using both together." This is the classic data-sufficiency convention and it is completely stable across the sample.

## Structural template (paraphrased, not copied)

A question stem poses a quantity to be determined (a value, a count, an identity) without giving enough information to solve it. Two numbered statements, labeled (1) and (2), each add a fact or constraint. The task is to judge which statement(s), if any, are sufficient to answer the question — critically, *not* to actually compute the answer. Confirmed pattern across the sample: each statement is almost always a single, self-contained fact or constraint (a numeric relationship, a categorical fact, a described condition) — items essentially never bury two facts inside one statement, which keeps the "which statement(s) suffice" judgment clean.

## Distractor construction patterns (the answer-option structure itself)

Because the 5 options are fixed and identical every time, "distractor construction" in NOG is really about how the two statements are engineered to make more than one option plausible:

- **Individually-insufficient, jointly-sufficient**: the most classic and common shape — each statement alone leaves genuine ambiguity, but combining them pins down a unique answer. This tests whether a test-taker correctly evaluates each statement in isolation *before* considering them together (a common test-taker error is to unconsciously combine the statements while evaluating the first one).
- **One-statement-sufficient, other-insufficient**: one statement alone fully answers the question while the other, evaluated alone, does not — testing careful independent evaluation rather than combining out of habit.
- **Symmetric/either-alone-sufficient**: both statements, independently, are each individually sufficient (typically via two different solution paths) — this is a recognizable minority pattern across the sample, not the majority case, but present in most sampled sittings.
- **Genuinely insufficient**: statements that sound like they should combine to a unique answer but leave a genuine ambiguity (e.g. two valid solutions remain even combined) — the "trap" is that this looks like it should be answer C (sufficient together) when it is actually E.
- A statement's *plausibility as sufficient* is engineered independently of whether it actually is sufficient — a statement can look complex/informative and still not be enough, or look sparse and still nail down the answer. Statement length/complexity is not a reliable difficulty signal by design.

## Difficulty spread

Given only 6 items per sitting, the spread is compressed but still visible: the sample shows 1–2 items per sitting that are resolvable almost by inspection (e.g. one statement is obviously sufficient, the other obviously isn't), and the remaining 4–5 items requiring genuine multi-case checking (testing whether a statement leaves more than one valid scenario) before committing to an answer. NOG's difficulty in the sample comes overwhelmingly from *logical completeness checking* (did I actually rule out all cases?) rather than from computational complexity — items rarely require more than simple arithmetic once the sufficiency judgment is made.

## Topic distribution (as a distribution)

Question stems draw from the same general pool as XYZ/KVA (arithmetic word problems, algebraic relationships, geometric figures, age/counting puzzles, simple combinatorics/logic-grid style setups) but are, on the whole, built around scenarios that lend themselves naturally to "some cases work, some don't" structure — proportion/ratio problems, age-comparison problems, and small logic-puzzle-style multi-entity scenarios (three categories, determine which has which property) recur across the sample more than in XYZ/KVA specifically because they support that ambiguity.

## Cross-reference note

The app's `SECTIONS()` model labels NOG "Tillräcklig info" (cat: quant) — a reasonable short form of the real exam's full name "Kvantitativa resonemang" (though it more directly echoes the answer-sufficiency mechanic than the subtest's official name). The app's NOG bank uses the correct **5-option format**, matching the real-exam convention exactly on option count. Wording check: the app's option text ("Påstående (1) ensamt räcker för att besvara frågan," "Båda påståendena tillsammans räcker för att besvara frågan, men inget ensamt," etc.) is a more verbose, fully-spelled-out paraphrase of the real exam's terser standard phrasing (paraphrased above), and both the fixed 5-option *order* and the "(1)"/"(2)" statement-labeling convention match. This is a wording-verbosity difference, not a structural one — lower priority for Phase 03 than the KVA wording gap or the XYZ verbatim-copy issue.

Separately, and confirmed directly (not inferred): the app's NOG bank contains at least one item (`nog-001`, `source: '2026-04-18 PP3'`) that is a verbatim copy of a real question from the 2026-04-18 sitting — same character names, same two statements word-for-word, checked directly against `Reference/raw-exams/2026-04-18/provpass-3-kvant.txt` (one of this phase's 6 sampled dates). This item happens to use the real exam's terse option wording exactly (unlike the app's original/`'HP-träning'`-sourced NOG items, which use the more verbose paraphrase described above) — a useful tell: dated-`source` items in this bank are copies, `'HP-träning'`-sourced items are original writing with looser wording. All 24 NOG items carrying a `2025`/`2026`-dated `source` field (of 137 NOG items total) should be treated as presumptively verbatim and replaced in Phase 03/04 — see `XYZ.md` for the full scope of this issue across the quant bank (103 dated-source items across XYZ/KVA/NOG/DTK).
