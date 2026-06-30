# Phase 01: Token Audit & Foundation Reconciliation

The app already runs a warm "paper" design system (cream background, forest green, terracotta, Newsreader/Hanken Grotesk), but its CSS custom properties in `src/index.css` drifted from the exact Claude Design handoff values during earlier work. The authoritative spec lives at `.maestro/playbooks/2026-06-27-Design-System-Implementation/DESIGN-SYSTEM-01.md` — read it first, it contains the literal token list from the design handoff (ink `#23201A`, surface `#FFFFFF`, hairline `#EAE3D6`, plus a full answer-state/feedback palette that doesn't exist in the app yet). This phase corrects the foundation tokens app-wide in one file, which cascades instantly to every page since 1000+ call sites already reference `var(--color-*)`. By the end, the whole app should visibly shift to the exact spec tones with zero risk of breakage, proving the design system can be tightened without a rewrite.

## Tasks

- [x] Read `.maestro/playbooks/2026-06-27-Design-System-Implementation/DESIGN-SYSTEM-01.md` in full (the exact token spec) and `src/index.css` in full (current implementation). Build a side-by-side mapping table of every current `:root` token vs. its closest spec equivalent. Also run `grep -roh "var(--color-[a-z-]*" src | sort | uniq -c | sort -rn` to see how heavily each current token is used — this tells you the blast radius of changing each value, so prioritize getting high-usage tokens (`--color-ink`, `--color-ink-muted`, `--color-ink-faint`, `--color-card`, `--color-card-border`, `--color-paper-dark`) exactly right.

  **Usage counts (`grep -roh "var(--color-[a-z-]*" src | sort | uniq -c | sort -rn`):**
  ```
  567 --color-ink-faint
  278 --color-ink-muted
  215 --color-ink
  181 --color-card-border
  167 --color-paper-dark
   72 --color-green
   34 --color-paper
   24 --color-card
   15 --color-paper-darker
   11 --color-green-light
   10 --color-error
    8 --color-terracotta
    6 --color-gold
    6 --color-border          (undefined — dead/legacy ref, see note below)
    4 --color-green-muted
    3 --color-success-bg
    3 --color-error-bg
    2 --color-success
    1 --color-gold-muted
  ```

  **Mapping table — current `:root` token → spec equivalent:**

  | Current token | Current value | Spec equivalent | Spec value | Status |
  |---|---|---|---|---|
  | `--color-paper` | `#F1ECE3` | `--color-paper` | `#F1ECE3` | exact match, no change |
  | `--color-paper-dark` | `#E6DFD4` | *(no spec equivalent)* | — | legacy token, not in spec; keep as-is (167 call sites) |
  | `--color-paper-darker` | `#D8CFC3` | *(no spec equivalent)* | — | legacy token, not in spec; keep as-is |
  | `--color-green` | `#224A3A` | `--color-green` | `#224A3A` | exact match, no change |
  | `--color-green-light` | `#2D6150` | *(no spec equivalent)* | — | legacy token; keep as-is |
  | `--color-green-muted` | `rgba(34,74,58,0.08)` | *(no spec equivalent)* | — | legacy token; keep as-is |
  | `--color-terracotta` | `#BF5A33` | `--color-terracotta` | `#BF5A33` | exact match, no change |
  | `--color-terracotta-muted` | `rgba(191,90,51,0.1)` | *(no spec equivalent)* | — | legacy token; keep as-is |
  | `--color-gold` | `#E4C66A` | `--color-gold` | `#E4C66A` | exact match, no change |
  | `--color-gold-muted` | `rgba(228,198,106,0.15)` | *(no spec equivalent)* | — | legacy token; keep as-is |
  | `--color-ink` | `#1A1A18` | `--color-ink` | `#23201A` | **drift — update value** |
  | `--color-ink-muted` | `#4A4A45` | `--color-muted` (`#8B8478`) | `#8B8478` | **drift — update value** (see usage analysis below) |
  | `--color-ink-faint` | `#9A9A92` | `--color-muted-light` | `#A89F90` | **drift — update value** |
  | `--color-card` | `#FDFAF6` | `--color-surface` | `#FFFFFF` | **drift — update value**, keep name `--color-card` |
  | `--color-card-border` | `rgba(34,74,58,0.10)` | `--color-hairline` | `#EAE3D6` | **drift — update value**, keep name `--color-card-border` |
  | `--color-success` | `#2D6150` | *(no spec equivalent)* | — | legacy semantic token; keep as-is |
  | `--color-success-bg` | `rgba(45,97,80,0.10)` | *(no spec equivalent)* | — | legacy semantic token; keep as-is |
  | `--color-error` | `#BF5A33` | *(no spec equivalent)* | — | legacy semantic token; keep as-is |
  | `--color-error-bg` | `rgba(191,90,51,0.10)` | *(no spec equivalent)* | — | legacy semantic token; keep as-is |
  | `--font-serif` | `'Newsreader', Georgia, serif` | `--font-serif` | same | exact match |
  | `--font-sans` | `'Hanken Grotesk', system-ui, sans-serif` | `--font-sans` | same | exact match |

  **`--color-ink-muted` usage sample (278 sites) → decision:** Sampled ~25 call sites (`App.tsx`, `TopNav.tsx`, `PageHeader.tsx`, `ExplanationCard.tsx`, `Onboarding.tsx`, `Settings.tsx`, `achievements.ts`, `examDate.ts`). Every sampled usage is on small/secondary text — section eyebrows (`text-sm uppercase`), stat captions (`text-xs`), helper/description copy, hover state on faint nav labels — never primary body or passage text. This matches the spec's `--color-muted` (`#8B8478`, "secondary labels/captions") far better than `--color-ink-soft` (`#33302A`, "body/passage text close to full ink"). **Decision: map `--color-ink-muted` → spec `--color-muted` value (`#8B8478`).**

  **Side note (not in scope for this task, flagged for the legacy-color sweep task below):** `--color-border` is referenced 6 times in `src/pages/Results.tsx` but is never defined in `:root` — it's a dead/undefined custom property left over from an earlier theme, currently rendering as `border-color: initial` wherever used. Those same lines also hardcode dark-theme utility classes (`border-blue-500`, `text-blue-400`, `bg-blue-500/10`, `border-red-500`, `text-red-400`, etc.) that the later "leftover legacy color references" task should catch and fix together with this.

- [x] Update the values (not the names) of these drifted tokens in `src/index.css` `:root` to match the spec exactly, preserving every existing variable name so the 1000+ existing `var(--color-x)` call sites across the app keep working unchanged:
  - `--color-ink`: `#1A1A18` → `#23201A` (spec ink)
  - `--color-card`: `#FDFAF6` → `#FFFFFF` (spec calls this `--color-surface`; keep the existing `--color-card` name but use the spec's white value)
  - `--color-card-border`: `rgba(34, 74, 58, 0.10)` → a solid warm hairline `#EAE3D6` (spec `--color-hairline`) instead of a green-tinted alpha border
  - `--color-ink-faint`: `#9A9A92` → `#A89F90` (spec `--color-muted-light`)
  - For `--color-ink-muted` (278 call sites): decide between spec `--color-ink-soft` (`#33302A`, for body/passage text close to full ink) and spec `--color-muted` (`#8B8478`, for secondary labels/captions) based on how `--color-ink-muted` is actually used in the codebase (sample a handful of its usages before deciding) — use the closer match, and leave a code comment in `index.css` only if the choice is non-obvious from the variable name alone.
  - Confirm `--color-green` (`#224A3A`), `--color-terracotta` (`#BF5A33`), and `--color-gold` (`#E4C66A`) already match the spec exactly — no change needed there.

  **Completion note:** Applied the values decided in the task-1 mapping table to `src/index.css` `:root`, names unchanged. `--color-ink-muted` mapped to spec `--color-muted` (`#8B8478`) per the task-1 usage sample (secondary labels/captions, not body text); left a one-line comment above it in `index.css` explaining the mapping since it's non-obvious from the name alone. `--color-green`/`--color-terracotta`/`--color-gold` left untouched (already exact matches). Verified with `npm run build` — zero TypeScript errors.

- [x] Add the spec's extended palette as brand-new CSS custom properties in `:root` (additive only, nothing renamed) so later phases can adopt richer, spec-accurate component states: `--color-hairline`, `--color-ink-soft`, `--color-muted`, `--color-muted-light`, `--color-green-deep`, `--color-cream`, `--color-cream-dim`, `--color-green-tint`, `--color-terracotta-deep`, `--color-terracotta-soft`, `--color-terracotta-soft2`, `--color-gold-deep`, `--color-track`, `--color-selected-bg`, `--color-selected-border`, `--color-correct-bg`, `--color-correct-border`, `--color-correct-badge`, `--color-correct-text`, `--color-wrong-bg`, `--color-wrong-border`, `--color-wrong-badge`, `--color-wrong-text`, `--color-feedback-correct-bg`, `--color-feedback-correct-border`, `--color-feedback-correct-title`, `--color-feedback-wrong-bg`, `--color-feedback-wrong-border`, `--color-feedback-wrong-title`. Use the exact hex values listed in `DESIGN-SYSTEM-01.md`.

  **Completion note:** Added all 28 listed tokens verbatim from `DESIGN-SYSTEM-01.md` to `src/index.css` `:root`, directly after the existing token block — purely additive, no existing names or values touched. Note `--color-hairline` (`#EAE3D6`) is numerically identical to the existing `--color-card-border` value set in task 2; both are kept since `--color-card-border` is the established 181-call-site name and `--color-hairline` is the new spec name for future call sites. Verified with `npm run build` — zero TypeScript errors.

- [x] Search `src/index.css` for any remaining utility classes that still hardcode old dark-theme or pre-reconciliation colors instead of referencing a `var(--color-*)` token (e.g. raw hex in `.glow-blue`, `.glow-violet`, or any leftover blue/violet/slate values). Replace any hardcoded color found with the appropriate token reference. Leave class names and layout properties (padding, radius, etc.) untouched — this task is colors only.

  **Completion note:** `.glow-blue` and `.glow-violet` were already neutralized to `box-shadow: none` in earlier phases — no raw blue/violet/slate hex remained. Found two other pre-reconciliation leftovers: the `revealCorrect` keyframes (used by `.reveal-correct`, applied to the correct answer on reveal in `Session.tsx`) hardcoded Tailwind's default emerald `rgba(16, 185, 129, …)`, and the `pulse-ring` keyframes (used by `.due-pulse`, the "items due" nav badge in `TopNav.tsx`) hardcoded Tailwind's default amber `rgba(245, 158, 11, …)` — neither matches any token in the warm palette. Replaced both with the file's existing convention of hardcoded brand-rgb shadows: `rgba(34, 74, 58, …)` (the `--color-green` rgb triplet, semantically "correct") for `revealCorrect`, and `rgba(191, 90, 51, …)` (the `--color-terracotta` rgb triplet, semantically "needs attention") for `pulse-ring`, matching how `.glow-green`/`.glow-terracotta` and the scrollbar/range-input rules already hardcode these same rgb triplets elsewhere in this file. No class names or layout properties touched. Verified with `npm run build` — zero TypeScript errors.

- [ ] Run `npm run build` and confirm it exits with zero TypeScript errors. Then run `npm run dev`, open the app in a browser, and visually confirm: the page background is warm cream, body text reads as a slightly warmer near-black than before, and card borders look like soft warm hairlines rather than green-tinted edges. Take a screenshot of the Home screen for the record.

- [ ] Grep the full `src` directory for any leftover legacy color references that should now route through tokens instead: `#080C14`, `bg-slate-`, `text-slate-`, `border-slate-`, `text-blue-`, `text-violet-`, `bg-violet-`. Fix any matches found (there should be few or none, since most dark-theme cleanup already happened in earlier phases) — this task exists purely as a safety net before building further phases on top of the foundation.
