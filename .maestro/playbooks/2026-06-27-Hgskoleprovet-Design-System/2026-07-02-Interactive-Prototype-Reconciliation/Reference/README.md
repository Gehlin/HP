# Handoff: Högskoleprovet Practice App

## Prompt for Claude Code (paste this in)

> I'm building a React app (with Maestro for E2E testing) to practice for the Swedish **Högskoleprovet**. Attached in `design_handoff_hogskoleprovet/` is a high-fidelity design reference built in HTML (`Högskoleprovet Prototyp.dc.html`) plus a side-by-side screen canvas (`Högskoleprovet App.dc.html`).
>
> These HTML files are **design references, not code to copy**. Recreate them in my React codebase using my existing patterns (components, styling approach, navigation). If a styling system isn't established yet, use CSS Modules or styled-components — match the look pixel-for-pixel either way.
>
> Build these screens: a first-launch **Onboarding** flow (name, goal score, exam date), **Hem/Dashboard, Öva/Practice (with three question layouts: standard, reading-passage, and diagram), Resultat, Granska/Review, Sparade frågor/Saved, Statistik, and Profil**, with a bottom tab bar. The whole UI is in **Swedish**. Implement the practice loop (select → check → reveal correct/incorrect with explanation → next → results → review), the live timer, question bookmarking, and localStorage persistence for (a) onboarding profile, (b) streak + total answered + last practice date, and (c) bookmarked questions. Read the full spec, tokens, and per-screen details in `README.md`. Start by scaffolding the navigation + design tokens, then build onboarding + Hem, then the practice loop.

---

## Overview
A mobile-first study app for the Swedish university entrance exam (Högskoleprovet). Users see a dashboard with their estimated normerat score and progress, pick any of the 8 exam parts (delprov), practice multiple-choice questions with instant feedback, and track progress over time. Light, study-friendly gamification (streak + exam-date countdown).

The exam has 8 parts:
- **Verbal:** ORD (ordförståelse), LÄS (läsförståelse), MEK (meningskomplettering), ELF (engelsk läsförståelse)
- **Kvantitativ:** XYZ (problemlösning), KVA (kvantitativa jämförelser), NOG (tillräcklig information), DTK (diagram, tabeller, kartor)

Scores are reported on the normerade scale **0.00–2.00**. Swedish decimals use a comma (1,15 not 1.15).

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior, not production code. The task is to **recreate them in the target React codebase** using its established components, styling, and navigation patterns. The HTML uses a small custom template runtime ("Design Components") — ignore that machinery; only the visual design, copy, layout, and the logic described below matter.

- `Högskoleprovet Prototyp.dc.html` — the **interactive prototype** (full navigation + practice loop + persistence). This is the source of truth for behavior.
- `Högskoleprovet App.dc.html` — a **static canvas** showing the core screens side by side (Dashboard, Practice, Result, Stats, Profil), useful for seeing them at once. Note: the newest screens (Onboarding, Review, Saved) live only in the interactive prototype — treat the prototype as the complete, authoritative reference.
- `ios-frame.jsx` — the iPhone bezel used only to frame the mockups. **Do not port this** — your app runs on a real device; build the screen contents only.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, and interactions. Recreate the UI pixel-perfectly. All exact values are in **Design Tokens** below.

---

## Design Tokens

### Colors
| Token | Hex | Use |
|---|---|---|
| Paper background | `#F1ECE3` | App background |
| Surface / card | `#FFFFFF` | Cards, list groups |
| Surface warm | `#FBF9F4` | Dimmed option after reveal |
| Hairline border | `#EAE3D6` | Card borders |
| Ink | `#23201A` | Primary text, headings |
| Ink soft | `#33302A` | Option text |
| Muted | `#8B8478` | Secondary text |
| Muted light | `#A89F90` | Tertiary text, inactive tab |
| Green (primary) | `#224A3A` | Primary brand, buttons, active tab, hero card |
| Green deep | `#1A3A2D` | Gradient shadows |
| Cream (on green) | `#FBF7EE` | Text/number on green |
| Cream dim | `#EFE9DD` | Body text on green |
| Green-tint text | `#9FB7A8` / `#8FA89A` / `#A9C0B2` | Labels on green |
| Terracotta (accent) | `#BF5A33` | Quant accent, streak, selected badge |
| Terracotta deep | `#A84A26` | Streak number |
| Terracotta soft bg | `#F3E0D5` / `#F4E7DD` | Streak pill, selected option bg |
| Gold | `#E4C66A` (with `#C9A24A`) | Progress fill, score ring |
| Track | `#E7E0D3` / `#E4DCCC` / `#EFE8DA` | Progress/ring tracks |

**Answer reveal states:**
- Selected (pre-check): bg `#F4E7DD`, border `#C97A52`, badge bg `#BF5A33` white letter.
- Correct (post-check): bg `#E4EDE6`, border `#3E7A5E`, badge bg `#2E6A4C` with a `✓`, text `#1E3A2E`.
- Wrong-selected (post-check): bg `#F6E3DC`, border `#C0573A`, badge bg `#BF4A2E` with a `✕`, text `#7A3A28`.
- Other (post-check): bg `#FBF9F4`, border `#EEE8DC`, dimmed text `#A89F90`.
- Feedback panel correct: bg `#EAF1EC`, border `#CFE0D4`, title `#2E6A4C`. Wrong: bg `#F8EAE3`, border `#ECD3C6`, title `#A84A26`.

### Typography
Two families, loaded from Google Fonts:
- **Newsreader** (serif) — greetings, big numbers, the exam word in ORD, reading passages, result headings.
- **Hanken Grotesk** (sans) — everything else: UI, body, labels, options, stats. Weights 400/500/600/700/800.

Use `font-variant-numeric: tabular-nums` for timers and stat numbers.

Key sizes: greeting Newsreader 26px · hero score Newsreader 50px · result score Newsreader 46px · question word/heading Newsreader 26–30px · section abbreviation Hanken 800 16px · options Hanken 600 16px · primary button Hanken 700 16px · uppercase labels Hanken 600–700 10–13px with letter-spacing 0.1–0.16em.

### Radius & shape
Cards 15–22px · pills/toggles 999px · answer badges 8px (27×27) · icon tiles 12–16px · score ring is a circle. Progress bars are 7–8px tall, fully rounded.

### Spacing
Screen horizontal padding 18px. Card padding 13–20px. Gaps between stacked cards 10–13px. Bottom tab bar height 84px (content sits above it with ~100px bottom padding).

### Progress rings
Built with a CSS `conic-gradient(<accent> 0 <pct>%, <track> 0)` circle (32px) with a smaller white inner circle (23px) holding the percentage number. Verbal sections use green `#224A3A`, quant use terracotta `#BF5A33`.

---

## Screens / Views

### 1. Hem (Dashboard) — default screen
- **Header:** "God morgon, Elin" (Newsreader 26) + date "Fredag 27 juni" (muted). Right: a streak pill (terracotta soft bg, a small rotated square + the streak number).
- **Hero score card** (green `#224A3A`, radius 22): label "DITT NORMERADE RESULTAT", a `▲ 0,12` delta chip, big "1,15 / 2,0" (Newsreader 50), a gold progress bar (≈57%), footer "Mål 1,40" + "Provet om 38 dagar · 25 okt". Tapping it → Statistik.
- **Continue card** (white): an "ORD" tile, "FORTSÄTT DÄR DU SLUTADE / Ordförståelse / 12 av 20 frågor klara", a round green play button. Tapping → starts ORD practice.
- **Section grid:** column headers "VERBAL" (green) / "KVANTITATIV" (terracotta), then a 2-col grid of 8 cards (left column verbal, right column quant): order ORD, XYZ, LÄS, KVA, MEK, NOG, ELF, DTK. Each card: abbreviation (800/16), name (muted/11), and a progress ring. Tapping a card → starts that section's practice.
- **Bottom tab bar:** Hem (active green) · Öva · Statistik · Profil. Öva launches ORD practice.

Section names & current % (rings): ORD 62, LÄS 54, MEK 48, ELF 70 (green); XYZ 41, KVA 33, NOG 27, DTK 19 (terracotta).

### 2. Öva (Practice)
Fixed header: a back button (→ Hem), a thin progress bar (fills with question index), and a timer pill (live mm:ss). Below: section label "ORD · Ordförståelse" + "Fråga X / N". Then a **scrollable middle area** and a **fixed footer** (a flag/bookmark button + the primary action button).

Three question layouts share one engine — the layout adapts to optional fields on each question:
- **Standard** (ORD, MEK, ELF sentence, XYZ, KVA, NOG): a `lead` line (muted) + a `main` prompt (Newsreader, large) + 4 answer options.
- **Reading passage** (LÄS, ELF reading): a white "LÄSTEXT" card with the passage (Newsreader 15/1.7) above the prompt + options. A passage can carry **multiple linked questions** — the same passage stays on screen while the user answers each one (lead shows e.g. "Text 1 · Fråga 1 av 2").
- **Diagram** (DTK): a white card with a **bar chart** (title + bars + value labels + axis labels, terracotta bars) above the prompt + options.

**Answer options:** rows with a letter badge (A–E) + text. Tap to select (terracotta highlight). The footer button reads "Välj ett svar" (disabled) → "Kontrollera svar" (after a pick) → on check, options reveal correct/incorrect and a feedback panel appears with "Rätt!"/"Inte riktigt" + an explanation → button becomes "Nästa fråga" (or "Se resultat" on the last question).

**Bookmark button** (footer left): toggles a bookmark on the current question. Filled terracotta (bg `#F3E0D5`, border `#E0B79F`, icon fill/stroke `#BF5A33`) when saved, plain white otherwise. Persists — see State Management.

### 3. Resultat
Green full-screen. "PASS SLUTFÖRT · <SECTION>" + a heading that varies by score ("Bra jobbat" ≥80%, "Bra kämpat" ≥50%, else "Fortsätt kämpa"). A **score ring** (gold arc on the green, white inner circle) showing "16/20" + "80 % RÄTT". A 3-up stat strip: Total tid (mm:ss), Snitt/fråga (s), Normerat (+0,0X, gold). A streak card ("<streak> dagars svit!" + "<answered> frågor besvarade totalt."). Three actions: **"Granska dina svar"** (cream solid, primary → Review screen), then a row of two outline buttons "Öva igen" (restarts the set) and "Till hem".

### 4. Granska (Review)
Entered from Resultat. Paper background, header with back arrow (→ Resultat) + "Granska dina svar". A scrollable list of cards, one per answered question: a Rätt/Fel pill (green/terracotta), "Fråga N", the question `main` (Newsreader), "Ditt svar: …" (colored green if right, terracotta if wrong), "Rätt svar: …" shown only when the user was wrong, a divider, and the explanation.

### 5. Sparade frågor (Saved)
Entered from the Profil "Sparade frågor" row. Header with back arrow (→ Profil) + "Sparade frågor". If there are saved questions: a primary "Öva alla sparade frågor" button (starts a **custom practice set** of just the bookmarked questions) + a scrollable list of cards (section tag + question, plus a filled-bookmark button to remove it). If none: a centered empty state (bookmark icon, "Inga sparade frågor än", helper text).

### 6. Statistik
Title + subtitle. A segmented control (Vecka / Månad / Allt; Månad active). A trend card: "NORMERAT (ESTIMAT)" 1,15 with `▲ 0,25 sedan februari` and a line/area chart over feb–jun. A "Den här veckan" card with 7 day bars (mån–sön) + total. A "Träffsäkerhet per delprov" card: 8 horizontal bars sorted by %, verbal green / quant terracotta. Bottom tab bar (Statistik active).

### 7. Profil
Title. A profile card (avatar = user initials, name, member-since). A green goal card: "DITT MÅL <goal> | PROVDATUM <date> (om N dagar)" + an "Ändra" pill (→ jumps back into the onboarding goal/date steps). A tappable **"Sparade frågor"** row with a live count (→ Saved screen). Grouped iOS-style settings — **ÖVNING:** Daglig påminnelse (toggle on), Dagligt mål (20 frågor), Svårighetsgrad (Adaptiv), Ljudeffekter (toggle off). **KONTO:** Språk (Svenska), Hjälp & support, Logga ut (terracotta). Bottom tab bar (Profil active).

### 8. Onboarding (first launch only)
A 4-step flow shown only when no onboarding profile is stored. Top: a back button (from step 2 on) + progress dots (active dot elongates). Steps: (0) **Welcome** — an "H" app mark tile, serif headline "Plugga smartare inför provet.", supporting copy, CTA "Kom igång". (1) **Name** — "Vad ska vi kalla dig?" + a text input, CTA "Fortsätt". (2) **Goal** — "Vilket resultat siktar du på?" + chips 1,20 / 1,40 / 1,60 / 1,80 / 2,00 (selected = green), CTA "Fortsätt". (3) **Exam date** — "När skriver du provet?" + radio cards for the upcoming exam dates (each shows a live "om N dagar"), CTA "Sätt igång" (writes the profile, goes to Hem). The chosen name, goal, and date flow into the Hem greeting/hero and Profil. The greeting also varies by time of day (God morgon/dag/kväll).

---

## Interactions & Behavior
- **Navigation:** bottom tabs switch between Hem / Öva / Statistik / Profil. Practice, Result, Review, and Saved are full-screen flows (no tab bar). Section cards, the continue card, and the Öva tab all enter the practice flow.
- **Practice loop:** select option (only before checking) → "Kontrollera svar" reveals correctness + explanation → "Nästa fråga" advances and resets selection → after the last question, results are computed and the Result screen shows. "Se resultat" appears instead of "Nästa fråga" on the final question. From Result, "Granska dina svar" opens the Review screen.
- **Bookmarks:** the practice footer bookmark toggles the current question in/out of the saved set (persisted). Saved questions are listed on the Saved screen and can be practiced as a custom set via "Öva alla sparade frågor".
- **Onboarding:** shown only on first launch (no stored profile). Completing it writes the profile and lands on Hem. The Profil "Ändra" pill re-enters it at the goal step.
- **Timer:** counts up (1s interval) only while in the practice view; resets when a new practice set starts. Format mm:ss.
- **Transitions:** option background/border ease 0.15s; progress bar width eases 0.3s; onboarding dots/selection 0.15–0.25s. Keep subtle.
- **App launch:** after onboarding, always opens on Hem (never resumes mid-practice).

## State Management
Per-session (component) state:
- `view`: 'onboard' | 'home' | 'practice' | 'result' | 'review' | 'saved' | 'stats' | 'profile'
- `section`: current delprov code
- `customQs`: when set, the active practice list is these questions (used for "öva sparade") instead of the section's bank; otherwise null
- `qIndex`: index into the active question list
- `selected`: chosen option index (or null)
- `checked`: whether the answer was revealed
- `results`: array of booleans (per answered question) for the current set
- `answers`: array of selected option indices for the current set (parallel to `results`; powers the Review screen)
- `elapsed`: seconds, for the timer
- `name`, `goal`, `examISO`, `onboardStep`: onboarding profile + wizard position

Persisted across three localStorage keys:
- **`hp_onboard_v1`** — `{ name, goal, examISO }`. Absence = show onboarding. Defaults if present-but-partial: name "Elin", goal "1,40", examISO "2026-10-25".
- **`hp_progress_v1`** — `{ streak, answered, lastDate }` (defaults 12 / 247 / null).
- **`hp_bookmarks_v1`** — array of question keys `"<SECTION>:<index>"` (e.g. `"ORD:3"`).

**Progress persistence logic** (run when a practice set completes):
```
answered += results.length
today = new Date().toDateString()
yesterday = toDateString(now - 1 day)
if lastDate !== today:
    if lastDate === yesterday: streak += 1
    else if lastDate is set:   streak = 1   // missed a day → reset
    else:                      streak stays  // first ever completion keeps seed
lastDate = today
// write { streak, answered, lastDate } to localStorage
```
On launch, read all three keys and hydrate. The streak shows on the Hem header pill and the Result card; total answered shows on the Result card. A question is bookmarked when its `"<SECTION>:<index>"` key is in the bookmarks array; the Saved screen resolves those keys back to questions from the bank.

## Question Data Model
Each question is an object; a section is an array of them:
```
{
  lead: string,            // small prompt line above the question
  main: string,            // the big prompt / word / equation
  options: string[],       // 4 (sometimes 5) choices
  correct: number,         // index into options
  expl: string,            // explanation shown after checking
  passage?: string,        // present for reading questions (shared across linked Qs)
  chart?: {                // present for diagram (DTK) questions
    title: string,
    bars: { label: string, value: number }[]
  }
}
```
Linked reading questions = consecutive items that reference the **same** `passage` string. Bar heights = `value / max(values) * chartHeight`. A full sample bank (all 8 sections, Swedish content + explanations) lives in the `BANK()` method of `Högskoleprovet Prototyp.dc.html` — lift the content from there.

## Assets
No bitmap assets. Icons are simple inline SVGs (home, play, bars, person, chevrons, flag) — re-draw with your icon library (e.g. lucide-react: Home, Play, BarChart3, User, ChevronRight, Bookmark). Fonts: **Newsreader** and **Hanken Grotesk** from Google Fonts. Charts/rings are CSS/SVG, no library required (though you may use your charting lib for Statistik).

## Files
- `Högskoleprovet Prototyp.dc.html` — interactive prototype (behavior source of truth; see `BANK()` for question content and the logic class for state/persistence).
- `Högskoleprovet App.dc.html` — static 5-screen canvas.
- `ios-frame.jsx` — mockup bezel only; do not port.

---

## Note on this repo's context (added by Claude Code, not part of the original handoff)

This handoff prompt assumes a blank-slate app. **That is not the case here.** This codebase already has two completed rounds of design-system reconciliation against an earlier *prose* version of this same spec (`.maestro/playbooks/2026-06-27-Design-System-Implementation/DESIGN-SYSTEM-01.md` through `08.md` — same tokens, same screens, described in markdown instead of a working prototype), plus a features round (`2026-06-29-Navigation-UX-Overhaul/.../Phase-04-Prep-Concept-Feature-Enhancements.md`) that added pacing nudges, weak-area drilling, adaptive difficulty, and a consistency calendar — none of which exist in this prototype.

**Do not treat this prototype as a spec to rebuild from scratch.** Treat it as a higher-fidelity ground truth to *audit the existing app against*, screen by screen, catching drift and gaps the earlier prose-based rounds missed (exact copy strings, exact interaction sequences, the 4-step onboarding wizard, multi-question reading passages, diagram/chart questions, the Resultat/Granska split, the Sparade frågor screen). Preserve every feature already built that isn't in this prototype (XP/achievements, SRS queue, exam simulator, adaptive difficulty, pacing, weak-area drilling, theory pages, per-section guide pages) — this prototype is a narrower behavioral reference, not a feature ceiling.
