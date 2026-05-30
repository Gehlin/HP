# HP Improvements — Phase 07: More KVA & NOG Questions

Expand KVA to 80+ questions and NOG to 60+ questions, covering all common patterns and difficulty levels.

---

- [ ] **Add 30 more KVA questions to `src/data/questions.ts`**: Cover the following patterns not yet represented — (a) comparing algebraic expressions with constraints like $0 < x < 1$, $x < 0$, $|x| < 1$; (b) comparing geometric quantities (areas, perimeters) where one shape's dimensions are given indirectly; (c) comparing probabilities; (d) comparing sums/products of sequences; (e) comparing expressions involving square roots and absolute values; (f) age/ordering problems. Include a mix of A, B, C, D answers — avoid over-representing any single answer. All questions tagged with relevant topics, marked `difficulty: 'medium'` or `'hard'`, sourced as `'Övning'`.

- [ ] **Add 20 more NOG questions to `src/data/questions.ts`** covering the following common NOG patterns not yet well-covered: (a) "What is the value of x?" problems where one statement gives it directly; (b) geometric sufficiency (is triangle equilateral? is angle right?); (c) percentage sufficiency (what is the original price?); (d) ordering/ranking problems with 4+ people; (e) "is X > Y?" questions; (f) mixture/rate problems. Each question must have exactly 5 answer options (A–E), the full NOG answer wording, a detailed Swedish explanation, and be tagged and difficulty-rated. Source as `'Övning'`.

- [ ] **Add 15 NOG questions directly from the 2025-10-19 PP4 exam to `src/data/questions.ts`**: Encode NOG questions 23–28 from Provpass 4 (already extracted): (23) Astrid/Bella/Conny/Dylan husdjur — answer C; (24) Johan studsbollar — answer D; (25) Är L1 och L2 parallella? — answer C (u+v+w=180 and v=w together confirm parallel); (26) Malin sparbössa mynt — answer A; (27) Radhusområde katt/hund — answer C (10 families have cat not dog from (1), 4 have both from (2), total with dog = 45–14–(31–hund) needs both); (28) Vilket av x, y, z är störst? — answer C. Verify each answer with the full logical derivation in the explanation field.
