# LÄS (Läsförståelse) — Calibration Notes

Derived from `pdftotext -layout` extraction of the LÄS sections in 6 sampled real exam sittings (2013-10-26, 2017-04-01, 2019-04-06, 2021-10-24, 2023-10-22, 2026-04-18). All patterns are original derivations, not quoted text. No real passage content, title, or question wording from any sampled sitting is reproduced here — passage subjects below are described as categories, not as the actual topics used.

## Format facts (stable across all 6 sampled dates)

- **10 questions per sitting**, numbered 11–20 (continuing ORD's numbering within the verbal provpass), recommended time **22 minutes** — by far the most time-per-question of any verbal subtest (~2.2 min/item), consistent with needing to read passages first.
- **4 answer options (A–D)** throughout, in every sampled sitting.
- Passages are spread across the 10 questions in a *variable* split, not a fixed formula — across the sample it ranged from 3–5 passages per sitting. The most common pattern seen was several short passages carrying 2 questions each plus one longer passage (or a paired two-text set) carrying 4 questions, but sittings differ (e.g. one sample had a 2+4+4 split, another 2+2+2+4). The one constant: no passage in the sample carried fewer than 2 questions, and single-passage blocks topped out at 4 questions.
- One structural variant recurs across sittings: an occasional **paired-text item** where two short opinion pieces on the same topic (presented as counterpoints to each other) are printed side by side, with questions that require comparing the two rather than reading a single continuous text. This is a distinct sub-format from the single-author expository passage and should be represented in the app's LÄS bank as its own template, not folded into ordinary single-passage items.

## Typical passage length and register

Individual passages in the sample run from roughly 300–600 words for the shorter (2-question) passages, up to around 600–900 words for the longer (4-question) passages — none of the sampled passages ran to full-page multi-column newspaper-article length; they are edited/excerpted to a compact size that fits a printed exam page. Register is consistently formal written Swedish, closer to opinion journalism, popular-science reporting, or short nonfiction essay style than to either casual/conversational register or dense academic prose — passages are accessible to a general adult reader but assume no difficulty with abstract argumentation or scientific reporting conventions (attributed quotes from named researchers/authors, hedged claims, causal reasoning).

## Topic domain distribution (as a distribution, not a list)

Across the 6 sampled sittings (≈20+ passages observed), topics cluster into a fairly stable set of domains, roughly in this order of frequency: natural/biological science reporting (research findings summarized for a lay audience), social science and public-debate topics (education policy, media/technology and society, ethics of language use), personal essay/memoir-style narrative pieces (first-person or biographical framing), and history/humanities topics (cultural or historical analysis). Paired opinion-piece passages (see above) most often concern a contemporary cultural or technology debate. No topic domain dominates outright — the mix functions as a general-knowledge/general-literacy sampler rather than favoring any one field, and passages avoid requiring specialist prior knowledge to follow the argument.

## Distractor construction patterns

- **Right-topic-wrong-detail**: the most common distractor type — an option that correctly identifies the general subject or claim of a passage segment but misstates a specific detail (direction of a causal claim, which of two named parties did what, a number or scope that was actually different in the text).
- **Overreach/overgeneralization**: an option that extends a claim the passage supports only partially or conditionally into an absolute, unqualified statement — testing whether the test-taker notices hedging language.
- **Plausible-but-unsupported inference**: an option that sounds like something the passage's argument *could* imply, but that the text does not actually state or support — testing text-grounding rather than general reasoning.
- **Reversed relationship**: for questions about which of two things influences/causes/exemplifies the other, at least one distractor swaps the direction.
- Distractors are rarely absurd or obviously off-topic; nearly all four options in a typical item are topically relevant to the passage, which is what makes LÄS items time-consuming rather than merely a vocabulary check.

## Difficulty spread

Difficulty within a 10-question LÄS block correlates more with inference depth than passage length: items asking for an explicitly stated fact or the passage's stated main claim are comparatively easy, while items asking the test-taker to characterize an author's *implicit* stance, compare two texts' differing emphases, or identify the *function* of a specific sentence/paragraph within the argument are markedly harder. Both easy and hard items coexist within every sampled passage's question set — a passage is not "the hard passage" or "the easy passage" as a whole.

## Cross-reference note

The app's `SECTIONS()` model (`src/pages/Home.tsx`) labels LÄS "Läsförståelse" (cat: verbal) — name matches. The app's LÄS question bank (`src/data/questions.ts`) uses 4 options consistently, matching the real-exam convention confirmed above. No option-count mismatch found for LÄS. The paired-text/counterpoint passage sub-format observed in the real corpus does not appear to have a distinct representation in the current question bank structure (worth checking in Phase 03's audit — see also `src/data/passages.ts`).
