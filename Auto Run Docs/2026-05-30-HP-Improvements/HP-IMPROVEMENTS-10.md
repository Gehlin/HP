# HP Improvements — Phase 10: Full Exam Simulation Mode

Implement a true HP-style full exam: 40 questions in section order, section timers, section-break screens, and a detailed post-exam score report.

---

- [ ] **Create `src/data/exams.ts`** defining structured exam objects. Each exam has an ID, name (e.g. "2026-04-18 Provpass 3"), and four section arrays with specific question IDs in order. Create at least 2 full exam objects using the real questions already in `questions.ts` (group them by their `source` field). Export `getExamQuestions(examId: string): Question[]` which returns the 40 questions in correct section order (all XYZ first, then KVA, NOG, DTK). If fewer than 40 real questions exist for an exam, fill with randomly selected same-type questions from the pool so the exam always has exactly 12/10/6/12.

- [ ] **Add an "Examen" route and page `src/pages/ExamSelect.tsx`**: Accessible from the Home page via a new "Simulera HP-prov" button. Show a list of available full exams with name, date, and a "Starta" button per exam. Below the list, add a "Slumpmässigt prov" option that assembles a random 40-question exam from the full pool (12 XYZ + 10 KVA + 6 NOG + 12 DTK, random selection). Add the `/exam-select` and `/exam/:examId` routes to `src/App.tsx`.

- [ ] **Modify `src/pages/Session.tsx` to support section-break screens**: When the `type` is `'exam'`, detect when the user crosses a section boundary (XYZ→KVA, KVA→NOG, NOG→DTK) and show a full-screen interstitial for 3 seconds showing: section name, number of questions, recommended time, and a "Fortsätt →" button. Show the current section name in the header (replacing the question type badge). At the bottom of each section, show "Avsnitt X av 4 klart — X frågor kvar".

- [ ] **Create a detailed post-exam report in `src/pages/Results.tsx`**: When the session type is `'exam'`, show an enhanced results view modelled on the real HP score report. Add: a section breakdown table (section | questions | correct | % | recommended vs. actual time); a "Jämförelse med medel" note (based on approximate HP averages: XYZ ~55%, KVA ~60%, NOG ~50%, DTK ~65%); and a "Vad du bör öva mer på" recommendation list — automatically list the 3 topic tags with the lowest accuracy from this session.
