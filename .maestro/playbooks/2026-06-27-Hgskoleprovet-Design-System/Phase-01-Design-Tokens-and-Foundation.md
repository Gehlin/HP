# Phase 01: Design Tokens & Visual Foundation

This phase replaces the dark `#080C14` glass-morphism theme with the new warm, paper-toned design system from the Claude Design handoff. It establishes every CSS custom property, imports the correct fonts, and updates the global `body` styles — so all subsequent phases can reference tokens like `var(--color-green)` rather than hardcoding hex values. By the end of this phase the app will already look dramatically different: a warm cream background, serif typography, and a cohesive warm palette replacing the neon-on-black aesthetic.

## Tasks

- [x] Read `index.html` and `src/index.css` to understand current imports. Then update `index.html`: add a `<link>` tag in `<head>` importing the two Google Fonts used in the design — **Newsreader** (weights 400, 500, 600, italic) and **Hanken Grotesk** (weights 400, 500, 600, 700) — using `https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,500;0,600;1,400&family=Hanken+Grotesk:wght@400;500;600;700&display=swap`. Add `preconnect` hints for `https://fonts.googleapis.com` and `https://fonts.gstatic.com`.
  <!-- Done: Added preconnect hints and Google Fonts stylesheet link to index.html; also updated theme-color meta from #080C14 to #F1ECE3 for the new light theme. -->

- [x] Replace the entire `@layer base` block in `src/index.css`. The new `body` style must use:
  - `background-color: var(--color-paper)` — the warm cream page background
  - `color: var(--color-ink)` — dark almost-black text
  - `font-family: 'Hanken Grotesk', system-ui, sans-serif` — the primary sans-serif
  - Keep `antialiased` and `-webkit-tap-highlight-color: transparent`
  <!-- Done: Replaced @apply bg-[#080C14] text-slate-100 with explicit background-color/color/font-family using CSS custom properties; kept antialiased and -webkit-tap-highlight-color. -->

- [x] Add a CSS custom properties block at the very top of `src/index.css` (before `@import "tailwindcss"` or right after it, inside a `:root` rule) defining the full design token palette:
  ```
  --color-paper: #F1ECE3
  --color-paper-dark: #E6DFD4
  --color-paper-darker: #D8CFC3
  --color-green: #224A3A
  --color-green-light: #2D6150
  --color-green-muted: rgba(34, 74, 58, 0.08)
  --color-terracotta: #BF5A33
  --color-terracotta-muted: rgba(191, 90, 51, 0.1)
  --color-gold: #E4C66A
  --color-gold-muted: rgba(228, 198, 106, 0.15)
  --color-ink: #1A1A18
  --color-ink-muted: #4A4A45
  --color-ink-faint: #9A9A92
  --color-card: #FDFAF6
  --color-card-border: rgba(34, 74, 58, 0.10)
  --color-success: #2D6150
  --color-success-bg: rgba(45, 97, 80, 0.10)
  --color-error: #BF5A33
  --color-error-bg: rgba(191, 90, 51, 0.10)
  --font-serif: 'Newsreader', Georgia, serif
  --font-sans: 'Hanken Grotesk', system-ui, sans-serif
  ```
  <!-- Done: Added :root block with all 23 design tokens (colors, alpha variants, and font-family variables) immediately after the @import statements in src/index.css. -->

- [x] Replace the `.bg-app`, `.bg-hero`, `.bg-hero::before`, and `.bg-hero-grid` classes in `src/index.css` with light-theme equivalents:
  - `.bg-app` → `background-color: var(--color-paper)`
  - `.bg-hero` → `background-color: var(--color-paper); background-image: radial-gradient(ellipse 80% 40% at 50% -5%, rgba(34,74,58,0.06) 0%, transparent 70%)` (subtle green wash at top instead of blue)
  - Remove the dot-grid `::before` pseudo-element (it's a dark-theme effect) — just set `content: none` on it or delete the block
  - `.bg-hero-grid` → same as new `.bg-hero`
  <!-- Done: Replaced dark #080C14 backgrounds with var(--color-paper); replaced blue/violet gradients with a subtle green wash; set .bg-hero::before { content: none } to disable the dot-grid. -->

- [x] Replace `.glass` and `.glass-md` in `src/index.css` with warm card variants:
  - `.glass` → `background: var(--color-card); border: 1px solid var(--color-card-border); border-radius: 16px;` (no blur needed on light theme)
  - `.glass-md` → `background: var(--color-card); border: 1px solid var(--color-card-border); border-radius: 20px;`
  - Add a new `.card` class: same as `.glass`
  - Add `.card-green`: `background: var(--color-green); border-radius: 20px; color: #FDFAF6;`
  <!-- Done: Replaced dark glass-morphism backdrop-filter styles with warm card variants using design tokens; added .card (alias of .glass) and .card-green classes. -->

- [x] Add new utility classes to `src/index.css` for the primary UI components that all pages will use:
  - `.btn-primary`: green background `var(--color-green)`, white text, `border-radius: 12px`, `font-family: var(--font-sans)`, `font-weight: 600`, `padding: 14px 24px`, `transition: opacity 150ms`
  - `.btn-ghost`: transparent background, `color: var(--color-ink-muted)`, `border: 1px solid var(--color-card-border)`, same radius/padding
  - `.streak-pill`: `background: var(--color-terracotta)`, white text, `border-radius: 100px`, `font-size: 13px`, `font-weight: 600`, `padding: 4px 12px`
  - `.answer-option`: white card `background: var(--color-card)`, border `var(--color-card-border)`, `border-radius: 12px`, `padding: 14px 16px`, `cursor: pointer`, `transition: border-color 150ms`
  - `.answer-option-selected`: border becomes `var(--color-green)` (2px), `background: var(--color-green-muted)`
  - `.answer-option-correct`: border `var(--color-green)` (2px), `background: var(--color-success-bg)`
  - `.answer-option-wrong`: border `var(--color-error)` (2px), `background: var(--color-error-bg)`
  <!-- Done: Added .btn-primary, .btn-ghost, .streak-pill, .answer-option, .answer-option-selected, .answer-option-correct, and .answer-option-wrong classes to src/index.css using design tokens. -->

- [ ] Update scrollbar, range input, and shimmer skeleton styles in `src/index.css` for the light theme:
  - Scrollbar thumb: `background: rgba(34, 74, 58, 0.20)` (was white/transparent)
  - Scrollbar thumb hover: `background: rgba(34, 74, 58, 0.35)`
  - Range input background: `rgba(34, 74, 58, 0.12)` (was white/transparent)
  - Range thumb: `background: var(--color-green)` (was blue)
  - Range thumb ring: `rgba(34, 74, 58, 0.20)`
  - Shimmer gradient: use paper tones `rgba(34,74,58,0.04)` → `rgba(34,74,58,0.08)` → `rgba(34,74,58,0.04)` (was white-on-dark)

- [ ] Update `.glow-blue` and `.glow-violet` to warm equivalents in `src/index.css`:
  - `.glow-green`: `box-shadow: 0 4px 24px -4px rgba(34, 74, 58, 0.20)`
  - `.glow-terracotta`: `box-shadow: 0 4px 24px -4px rgba(191, 90, 51, 0.20)`
  - Keep the original `.glow-blue` and `.glow-violet` as no-ops (or remove) since they'll be replaced progressively

- [ ] Update `src/App.tsx`: change `PageLoader` spinner colors from `border-slate-700 border-t-blue-400` to `border-[var(--color-paper-dark)] border-t-[var(--color-green)]`. Update the keyboard shortcut overlay modal: change `bg-slate-900 border-slate-700` to `bg-[var(--color-card)] border-[var(--color-card-border)]`, `text-slate-300` to `text-[var(--color-ink-muted)]`, `bg-slate-800 border-slate-600 text-slate-200` kbd style to `bg-[var(--color-paper-dark)] border-[var(--color-card-border)] text-[var(--color-ink)]`, `text-slate-400` to `text-[var(--color-ink-muted)]`, `text-slate-500` to `text-[var(--color-ink-faint)]`. Also update the offline banner from `bg-amber-600` to `bg-[var(--color-terracotta)]`.

- [ ] Run `npm run dev` from the project root to start the dev server. Verify the app loads: the background should now be warm cream (#F1ECE3), body text should be dark (#1A1A18), and headings/UI should be in Hanken Grotesk. The app will look partially unstyled (many components still use Tailwind dark classes) but the global foundation should be visible. Fix any TypeScript or CSS parse errors before continuing.
