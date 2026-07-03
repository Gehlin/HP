# Design options — top nav bar & Home declutter (Phase 01)

All options are real rendered React components, screenshotted at 402×874 (2x) against the live Vite dev server via a temporary harness (`/design-preview.html` + `src/design-preview/` — nothing in the real app imports these; `App.tsx`, `TopNav.tsx` and all pages untouched). The nav screenshots show each bar over the **real** `Home.tsx` and `Practice.tsx` components (seeded with a realistic profile: Elin, mål 1,60, streak 12, 3 sessions of history, one unfinished ORD-pass), so the interaction with actual page content is what you see.

**Baseline for comparison:** `current-hem-baseline.png` (today's Home with the bottom tab bar).

## The logo mark

All three directions reuse the mark the app already established in onboarding — the forest-green rounded square (radius ≈ 30% of size) with a Newsreader serif "H" in cream — scaled to 31–34px for the bar and given a very subtle inset gold keyline (`rgba(228,198,106,0.35)`) so it reads as a brand mark rather than a button. Direction C inverts it (cream tile, green H) to sit on the green band. Wordmark: "HP Träning" (serif in A/C, bold sans in B). The logo links to `/` in all directions. No unrelated new mark emerged that beat building on the established tile.

## Direction A — "Hårfin" (compact frosted single row)

`nav-a-hem.png`, `nav-a-ova.png`, overview in `nav-00-overview.png`

- One 58px row: logo + serif wordmark left; the four tabs right as 21px icon + 9px label stacks (same icon geometry as today's bottom bar, so it feels familiar).
- Frosted paper chrome — `rgba(241,236,227,0.92)` + 12px backdrop blur + 1px `#E4DCCC` hairline — i.e. today's bottom-bar material moved to the top.
- Active tab: green `#224A3A` + an 18×3px gold (`#E4C66A`) underline tick pinned to the bar's bottom edge.
- Cheapest vertical cost (58px) → most content visible. The quietest of the three; "impressive" here comes from restraint + the gold tick detail.
- Logo-only mode (session/results/review/exam): nav items drop out, same 58px height — zero layout jump.

## Direction B — "Tvåradig" (identity row + segmented pill nav)

`nav-b-hem.png`, `nav-b-ova.png`

- Row 1 (54px): 34px logo + two-line lockup ("HP Träning" bold sans over a live "114 dagar till provet" countdown) left; the streak pill right.
- Row 2: full-width segmented control on the `#E7E0D3` track (radius 999, 3px inner padding); active tab is a white pill with green text and a soft shadow — big, unmissable tap targets with text-only labels.
- Total 106px. Most "app-like/product-y" direction; the bar itself carries user context (countdown + streak), which lets Home's own header shed its streak pill (note: the screenshots show the pill twice — bar *and* page — because the real unmodified Home renders below; in implementation the Home one would be removed).
- Logo-only mode: row 2 drops away, bar shrinks to 54px (screenshot in overview). This is the one direction whose height changes between modes — worth weighing against the layout-jump concern (mitigable by keeping row 2 and showing a progress strip instead).

## Direction C — "Grönt band" (branded masthead)

`nav-c-hem.png`, `nav-c-ova.png`

- Solid forest-green `#224A3A` band, echoing the hero score card — the strongest brand statement of the three. Soft green drop shadow instead of a hairline.
- Row 1 (54px): inverted cream logo tile + cream serif wordmark; gold streak chip right (`rgba(255,255,255,0.12)` pill, gold diamond + count).
- Row 2 (43px, separated by a `rgba(251,247,238,0.12)` inner hairline): four evenly-spread text tabs — active gold `#E4C66A` with a 26×2.5px gold underline, inactive cream at 55%.
- Total 97px. Editorial/masthead feel; the gold-on-green active state is the most distinctive tab treatment. Caveat visible in `nav-c-hem.png`: the green band sits close to the green hero card on Hem — works as a deliberate "brand column", but the paper gap between them matters (the declutter proposals that shrink/demote the hero would relieve this entirely).
- Logo-only mode: tabs row drops, 54px green band remains (overview shot) — the app stays visibly branded even inside a session.

## Home declutter proposals

Both keep **every** existing feature (greeting, streak, score/goal/countdown, continue-session, weak-area drill, all 8 sections with accuracy rings). Shot with Direction A on top purely for context — the nav choice is independent.

### Proposal 1 — "Ett tydligt nästa steg" (merge + progressive disclosure)

`declutter-1-collapsed.png` (default), `declutter-1-expanded.png`

- Hero score card kept exactly as today — it stays the identity anchor.
- Continue-session + weak-area cards **merged into one "DAGENS PASS" card**: the primary action (continue, or the weak-area drill when nothing is unfinished) gets the full row + play button; the other becomes a quiet 12.5px text row under an inner hairline. Two competing full-weight cards → one clear action.
- The 8-card section grid collapses to the **3 weakest sections as slim rows** ("svagast först", with VERBAL/KVANT tags and 30px rings) + a dashed "Visa alla 8 delprov ▾" expander. Expanded state = all 8 rows (second screenshot).
- Net: default view is 5 tappable things instead of 12, everything above the fold, nothing removed.

### Proposal 2 — "Idag-vyn" (action-first, score demoted)

`declutter-2.png`

- The big green hero is **demoted to a slim 3-stat strip** (Normerat 1,42 / Mål 1,60 / 114 dagar kvar — serif numerals, taps through to Statistik, where the full hero analysis already lives).
- The green anchor card becomes the **action**: "REKOMMENDERAT IDAG — Öva svaga delprov, MEK · NOG · KVA — 20 frågor, ca 15 min" with a gold "Starta passet" button. First thing you can *do*, not read.
- Continue-session kept as a compact secondary row below it.
- Sections become **one horizontal snap-scroll row** (132px cards, ring + category tick) with "Visa alla →" — one swipe lane instead of a 8-card wall.
- Net: bolder restructure; best if the "overwhelming" feeling comes from being shown *status* before *action*. Riskier in that the score loses prominence (some users are motivated by it).

## ScrollToTop verification (live, Playwright)

Tested against the real app (seeded profile + history, 402×650 viewport so every page genuinely scrolls). Method: scroll each page to the bottom, navigate via the app's own UI, read `window.scrollY` / `document.scrollingElement.scrollTop` / any inner scrolled element after arrival.

**PUSH navigations: works everywhere tested.** Hem→Öva, Öva→Statistik, Statistik→Profil, Profil→/theory, /theory→Hem, Hem→Öva (return visit), Statistik→/score — all landed at exactly 0 with no inner scrolled containers (before-scroll offsets up to 5185px on Statistik).

**POP navigations (back): broken.** Both the browser/gesture back **and the app's own back chevron** (`PageHeader.tsx` line 23 defaults to `navigate(-1)`, used by ~15 pages: Settings, Theory, guides, ExamSelect, SrsQueue, OrdBuilder, …) land mid-page. Repro: Profil (scrolled to 461) → /theory → back ⇒ arrives at /profil with `scrollY` ≈ 105, not 0; same for /score → back ⇒ /practice at 1615. Cause: `ScrollToTop`'s `window.scrollTo(0,0)` does fire on the pathname change, but Chromium's native scroll restoration (`history.scrollRestoration` defaults to `'auto'`; nothing in `src/` sets it) re-applies the saved offset afterwards — and against a lazy-loaded page it restores a clamped/arbitrary offset, so it's not even a clean "restore where you were".

**Phase 02+ fix (one line + placement):** set `window.history.scrollRestoration = 'manual'` once (e.g. in `App.tsx` or `main.tsx`); optionally move the reset to `useLayoutEffect` to kill the one-frame flash of stale scroll.

## Screenshot index

| File | Content |
|---|---|
| `nav-00-overview.png` | All 3 bars + all 3 logo-only modes, one sheet |
| `nav-a-hem.png` / `nav-a-ova.png` | Direction A over real Hem / Öva |
| `nav-b-hem.png` / `nav-b-ova.png` | Direction B over real Hem / Öva |
| `nav-c-hem.png` / `nav-c-ova.png` | Direction C over real Hem / Öva |
| `declutter-1-collapsed.png` / `declutter-1-expanded.png` | Proposal 1, both disclosure states |
| `declutter-2.png` | Proposal 2 |
| `current-hem-baseline.png` | Today's Home + bottom bar, same seeded data |

## Notes for Phase 02 (whichever direction wins)

- Every page currently assumes `pt-topnav` = `max(20px, safe-area-top)` **top** padding and `pb-bottomnav` = `84px + safe-area-bottom` **bottom** padding (Home hardcodes its own inline equivalents). A top bar flips this: `pt-topnav` must grow to bar height + gap (58 / 106 / 97px + safe-area) and `pb-bottomnav` shrinks to plain safe-area padding — one CSS-utility change covers most pages, plus Home's inline values.
- Recommendation from the constraint analysis: on `/session`, `/resultat`, `/granska`, `/exam/*` use logo-only mode rather than unmounting the bar (a disappearing top element causes layout jump in a way the bottom bar never did). Direction A is the only one whose height is identical in both modes.
- The temporary harness (`design-preview.html`, `src/design-preview/`) should be deleted in the final phase.
