# ELF (Engelsk läsförståelse) — Calibration Notes

## Important limitation: no real ELF exam content exists in the corpus

This is the one subtest where the calibration is materially thinner than the other seven, and that thinness is itself the key finding, not a sampling shortcut.

Every single downloaded verbal-part prov PDF across **all 27 dates** in `Reference/raw-exams/` (not just the 6 sampled for this phase) is explicitly named "utan elf" / "ej elf" / "uelf" by UHR itself (e.g. `provpass1verbutanelf.pdf`, `provpass-2-verb-utan-elf.pdf`), and this was verified directly, not just inferred from filenames: opening the sampled verbal PDFs (`pdftotext -layout` + `pdfinfo`) confirms each one physically ends after the MEK section (question 30) — the booklet is 10–11 pages and simply stops, with no ELF passage or questions 31–40 printed anywhere in the file, in every one of the 6 sampled sittings from 2013-10-26 through 2026-04-18.

At the same time, the facit (answer key) for every sampled sitting **does** list 40 answers per verbal provpass, not 30 — including answers for items 31–40 — and the instruction page printed on every verbal booklet's cover consistently describes ELF as the fourth of four verbal subtests, 10 questions (31–40), 22 minutes recommended time, identical across all 6 sampled years. So ELF is confirmed to still be a real, scored part of the actual exam administration in every sampled year — UHR simply never publishes the ELF passage/question content itself in the public self-study archive, in any year sampled. The only ELF-related file UHR links from these landing pages is a generic, undated "ELF example test" (`elfexempel.pdf` / `facit_elf_exempelprov.pdf`) used to illustrate the format in the general instructions booklet — Phase 01 correctly excluded this as administrative boilerplate rather than dated exam content, and it was not analyzed for this phase either, so no example-test content (real or generic) informs this document.

**Practical consequence**: nothing below about ELF's *content* patterns (topic distribution, distractor construction, difficulty spread) can be derived from real exam text the way the other 7 subtests' docs were built, because no real ELF exam text exists anywhere in the gathered corpus. What follows is limited to the structurally confirmed facts (count, timing, position in the exam) plus reasoning from ELF's declared analogy to LÄS (same "läsförståelse" format, different language) in UHR's own instruction text.

## Format facts (confirmed via facit answer counts + instruction-page tables, all 6 sampled dates, 2013–2026)

- **10 questions per sitting**, numbered 31–40, positioned as the last block in the verbal provpass.
- Recommended time **22 minutes** — identical to LÄS's allotment, which is the strongest available evidence that ELF is structurally LÄS's English-language counterpart (a passage-based reading comprehension format), not a grammar/vocabulary drill format.
- This 10-question / 22-minute allocation is unchanged across every sampled year from 2013 through 2026 — whatever ELF's actual content, its position and weight in the exam has been stable for over a decade.

## What cannot be confirmed from this corpus

- Option count (4 vs 5) for ELF items — no sampled source shows this. (For reference, the app's current bank uses 4 options for ELF.)
- Passage length, register, or topic domains in English-language passages.
- Distractor construction patterns.
- Whether ELF passages are adapted/simplified English or authentic unedited English source text.

## Cross-reference note

The app's `SECTIONS()` model (`src/pages/Home.tsx`) includes ELF ("Engelsk läsning", cat: verbal) as one of the 8 subtests, and `src/data/questions.ts` contains a real ELF question bank (~100 items, 4-option format, organized into short English passages with 4–5 questions each). Given the finding above, this is actually the *right* structural instinct (ELF is real, scored, and passage-based) — but none of it could have been calibrated against real exam text, because UHR does not publish any. This means Phase 03's audit cannot do a content-fidelity check for ELF the way it can for the other 7 subtests; at most it can confirm the app's ELF format (question count per passage, option count, timing-implied difficulty) is *internally consistent* and *plausible* given LÄS's confirmed structure, not that it matches real ELF items, because no real ELF items are available to check against anywhere in this initiative's source material.
