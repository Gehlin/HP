# HP Improvements — Phase 08: UI Polish — Mobile, Animations & Visual Design

Improve visual design, mobile responsiveness, and micro-interactions across all pages.

---

- [x] **Improve mobile layout in `src/pages/Session.tsx`**: On small screens (< 640px), make the answer buttons full-width with larger tap targets (min-height 56px). Move the timer and "Avsluta" button into a compact sticky header that doesn't take vertical space away from the question. Ensure the question text and math formulas don't overflow on narrow screens by adding `overflow-x: auto` to the math container. Test that the "Nästa →" and "Avsluta" buttons are always visible without scrolling on a 375px wide screen.
  <!-- Completed 2026-05-31: Restructured layout to h-screen flex-col on mobile with overflow-y-auto scrollable main. Action buttons (Nästa/Avsluta/Visa svar) extracted to a fixed shrink-0 footer div so they're always visible. Header made sticky with compact mobile padding (px-3 py-2 on mobile, px-6 py-3 on sm+). Answer buttons get min-h-14 (56px) tap targets and w-full. Question text div gets overflow-x-auto. "Markera" label hidden on mobile, showing only the star icon. -->

- [ ] **Add smooth transitions and micro-animations to `src/pages/Session.tsx`**: When advancing to the next question, animate the question card with a quick slide-left fade-out / slide-right fade-in (CSS transition, ~150ms). When an answer is selected and revealed, animate the correct answer border with a brief pulse (scale 1→1.02→1, ~200ms). When the timer drops below 2 minutes, animate the timer text with a subtle pulse to draw attention. Use `@keyframes` in `src/index.css` rather than a JS animation library.

- [ ] **Add a performance heat-map to `src/pages/Progress.tsx`**: Below the session history list, add a GitHub-style contribution calendar grid showing the last 90 days. Each day is a small square: grey if no practice, light blue for 1–10 questions, medium blue for 11–30, dark blue for 30+. Read data from `loadHistory()` and group by date. Add a legend below. This gives a strong visual cue for consistency.

- [ ] **Improve the Home page hero design in `src/pages/Home.tsx`**: Replace the plain gradient background with a subtle grid pattern (CSS `background-image: linear-gradient` mesh). Add a "Dagens mål" card showing a recommended daily target (e.g. "Öva 15 frågor idag") with a progress ring showing how many questions have been answered today (read from session history). Add a motivational tagline that changes daily based on the day of the week (7 different messages).
