# HP Improvements — Phase 05: More XYZ Questions (Harder)

Expand the XYZ question bank with 80+ harder questions covering coordinate geometry, compound interest, logarithms, statistics, and advanced algebra. All questions use KaTeX `$...$` math notation and include full Swedish explanations.

---

- [x] **Add 25 hard XYZ questions on coordinate geometry and linear/quadratic functions to `src/data/questions.ts`**: Include questions on: finding the equation of a line through two points, distance between two points, midpoint, finding intersection of two lines, determining if a point lies on a curve, reading a parabola's vertex and roots, identifying graph transformations (f(x)+k, f(x+k), -f(x), af(x)), and parallel/perpendicular line conditions. All marked `difficulty: 'hard'` and tagged `['coordinate geometry', 'functions']`. Example question: "En linje går genom punkterna $(2, 1)$ och $(4, 7)$. Vilket är linjens $y$-värde när $x = 10$?"
  <!-- Completed 2026-05-30: Added xyz-cg01 through xyz-cg25 covering all specified topics. Build passes. -->

- [x] **Add 20 medium/hard XYZ questions on percentages, compound interest, and financial math to `src/data/questions.ts`**: Include: compound interest formula $A = P(1+r)^n$, percentage of percentage, reverse percentage (find original price), repeated percentage changes, VAT calculations, profit/loss margin, and mixture problems. All tagged `['percentages', 'compound interest', 'financial']`. Example: "Ett kapital växer med 4 % per år. Med hur många procent har det ökat efter 3 år?"
  <!-- Completed 2026-05-30: Added xyz-fi01 through xyz-fi20 covering compound interest (A=P(1+r)^n), reverse percentages, successive percentage changes, VAT (add & remove), profit/loss margin, repeated decrease, time-to-double, mixture problems, simple vs compound interest comparison, and net price after opposing changes. Build passes. -->

- [ ] **Add 20 medium/hard XYZ questions on statistics and combinatorics to `src/data/questions.ts`**: Include: mean/median/mode of data sets, effect of adding/removing a value on the mean, standard deviation concepts (without formula — just comparative reasoning), permutations (ordered selections), combinations (unordered), probability of compound events, conditional probability basics, and birthday-type problems. All tagged `['statistics', 'combinatorics', 'probability']`.

- [ ] **Add 15 hard XYZ questions on advanced algebra and number theory to `src/data/questions.ts`**: Include: solving systems of 3 equations, quadratic formula with irrational roots, simplifying nested fractions, working with absolute value equations $|2x-3| = 5$, floor/ceiling reasoning, divisibility rules, LCM/GCD applications, and modular arithmetic. All tagged `['algebra', 'number theory']`.
