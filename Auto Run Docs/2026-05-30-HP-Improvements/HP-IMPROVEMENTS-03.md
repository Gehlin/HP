# HP Improvements — Phase 03: Gamification — Streaks, XP & Levels

Add a lightweight gamification layer to reward daily practice and make progress feel tangible.

---

- [x] **Create `src/utils/gamification.ts`**: Implement streak tracking and XP/level logic stored in localStorage under key `hp_gamification`. The data shape: `{ xp: number, streak: number, lastPracticeDate: string, longestStreak: number }`. Export functions: `awardXP(correct: number, total: number, difficulty: string): number` — awards 10 XP per correct answer on easy, 15 on medium, 25 on hard, plus a 20 XP session completion bonus; `updateStreak(): void` — called when a session finishes, increments streak if last practice was yesterday, resets to 1 if more than 1 day has passed, keeps streak if same day; `getLevel(xp: number): { level: number, label: string, nextLevelXp: number, currentLevelXp: number }` — define 10 levels: Nybörjare (0), Grundnivå (100), Mellanstadium (300), Avancerad (600), Expert (1000), Mästare (1500), HP-Veteran (2200), Högskolenivå (3000), Elite (4000), HP-Legend (6000); `loadStats(): GameStats`; `saveStats(s: GameStats): void`.

- [ ] **Integrate XP and streak into session finish flow in `src/pages/Results.tsx` and `src/utils/session.ts`**: After a session ends, call `awardXP` and `updateStreak` from `gamification.ts`. On the Results page, show an animated XP-earned card at the top: "+X XP" in large text with the difficulty breakdown, current level label, and an XP progress bar towards the next level. If the streak increased, show a streak banner: "🔥 X dagars streak!". If a new level was reached, show a level-up banner.

- [ ] **Add XP, level, and streak display to `src/pages/Home.tsx`**: Below the section-count grid on the home page, add a stats bar showing: flame icon + current streak ("3 dagars streak"), star icon + current level label ("Nivå 4 — Expert"), and an XP progress bar (current XP within the level / XP needed for next level). Load stats from `gamification.ts` on mount. If no sessions yet, show placeholder "Starta din första träning för att börja samla XP".

- [ ] **Add full XP history and level progress to `src/pages/Progress.tsx`**: Replace or augment the current stats with a Level card at the top showing the current level, XP total, XP needed for next level, and a segmented progress bar showing all 10 levels. Below that show streak stats: current streak, longest streak, total sessions, total questions answered, total correct. Keep the existing per-type accuracy grid and session history list below.
