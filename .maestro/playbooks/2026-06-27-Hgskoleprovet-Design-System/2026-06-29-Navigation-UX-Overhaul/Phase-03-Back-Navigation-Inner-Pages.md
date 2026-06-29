# Phase 03: Back Navigation on Inner Pages

Users navigating deep into the app — opening a subject guide, launching SRS, browsing bookmarks — currently have no obvious way to get back. This phase creates a reusable `PageHeader` component with a back arrow and optional title, then applies it consistently to every inner page that is reached by drilling into the app (not by tapping a main tab). The result is a coherent navigation mental model: top nav for main tabs, back arrow for depth.

## Tasks

- [x] Create `src/components/PageHeader.tsx`. This is a simple reusable header for inner pages:
  - Props: `title: string`, `onBack?: () => void` (defaults to `useNavigate()(-1)`), `action?: React.ReactNode` (optional right-side action slot, e.g. a settings icon)
  - Layout: `flex items-center gap-3 px-4 py-3 border-b border-[var(--color-card-border)] bg-[var(--color-paper)]`
  - Back button: `<button onClick={onBack ?? (() => navigate(-1))}` with a left-arrow SVG (`M19 12H5M12 5l-7 7 7 7`, strokeWidth 2, 20×20) in `text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]`
  - Title: `<h1 className="flex-1 text-base font-semibold text-[var(--color-ink)] truncate">{title}</h1>`
  - Action slot rendered on the right if provided
  - The component itself is NOT fixed/sticky — pages that need it will place it after their own `pt-topnav` offset. Since inner pages don't show in the main TopNav (they navigate away from tabs), just render it inline at the top of the page content.

- [x] Apply `PageHeader` to `src/pages/Theory.tsx`:
  - Read the file to find the current header/back button pattern
  - Replace with `<PageHeader title="Teori" />` inside a `pt-topnav` wrapper div
  - Remove any existing manual back button

- [ ] Apply `PageHeader` to `src/pages/SrsQueue.tsx`:
  - Add `<PageHeader title="Spaced Repetition" />` at the top of the page content
  - Ensure the page wrapper has `pt-topnav` and `pb-8` padding
  - Remove any existing back navigation

- [ ] Apply `PageHeader` to `src/pages/Bookmarks.tsx`:
  - Add `<PageHeader title="Bokmärken" />` at the top
  - Ensure `pt-topnav pb-8` on outer wrapper
  - Remove any existing back navigation

- [ ] Apply `PageHeader` to `src/pages/ExamSelect.tsx`:
  - Add `<PageHeader title="Välj prov" />` at the top
  - Ensure `pt-topnav pb-8` on outer wrapper

- [ ] Apply `PageHeader` to `src/pages/ExamStart.tsx`:
  - Add `<PageHeader title="HP-prov" onBack={() => navigate('/exam-select')} />` — back goes to the exam select page rather than history -1, since the session might auto-start
  - Ensure `pt-topnav pb-8` on outer wrapper

- [ ] Apply `PageHeader` to `src/pages/OrdBuilder.tsx`:
  - Add `<PageHeader title="Ordbyggaren" onBack={() => navigate('/practice')} />`
  - Ensure `pt-topnav pb-8` on outer wrapper

- [ ] Apply `PageHeader` to `src/pages/ScorePredictor.tsx`:
  - Add `<PageHeader title="HP-poängprediktor" onBack={() => navigate('/')} />`
  - Ensure `pt-topnav pb-8` on outer wrapper

- [ ] Apply `PageHeader` to the subject guide pages. These all navigate back to either `/verbalt`, `/kvantitativt`, or `/practice`. Read each file to confirm where they are navigated from, then apply:
  - `src/pages/VerbalHub.tsx` → `<PageHeader title="Verbalt" onBack={() => navigate('/practice')} />`
  - `src/pages/QuantHub.tsx` → `<PageHeader title="Kvantitativt" onBack={() => navigate('/practice')} />`
  - `src/pages/KvaGuide.tsx` → `<PageHeader title="KVA – Kvantitativa jämförelser" />`
  - `src/pages/NogGuide.tsx` → `<PageHeader title="NOG – Kvantitativa resonemang" />`
  - `src/pages/XyzGuide.tsx` → `<PageHeader title="XYZ – Matematisk problemlösning" />`
  - `src/pages/DtkGuide.tsx` → `<PageHeader title="DTK – Diagram, tabeller & kartor" />`
  - `src/pages/OrdGuide.tsx` → `<PageHeader title="ORD – Ordförståelse" />`
  - `src/pages/LasGuide.tsx` → `<PageHeader title="LÄS – Läsförståelse" />`
  - `src/pages/MekGuide.tsx` → `<PageHeader title="MEK – Meningskomplettering" />`
  - `src/pages/ElfGuide.tsx` → `<PageHeader title="ELF – Engelsk läsförståelse" />`
  - `src/pages/MathGuide.tsx` → `<PageHeader title="Matematik" />`
  - `src/pages/LiggandeStolenGuide.tsx` → `<PageHeader title="Liggande stolen" />`
  - For each: ensure the outer wrapper has `pt-topnav pb-8`, import `PageHeader`, and remove any existing manual back navigation already present

- [ ] Run `npm run build` to confirm no import errors or missing props.
