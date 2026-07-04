/**
 * DesktopFrame — the desktop "branded surround" (Direction 2 from the
 * 2026-07-03 Navigation & Dashboard Overhaul playbook, Phase 04 exploration,
 * ported from the Phase 04 design-preview harness in Phase 05).
 *
 * Wraps the app's routed content once, in App.tsx. The mobile-first pages
 * render unchanged inside a centered paper "sheet" capped at
 * --content-max-width (528px); at viewports wider than that, the space
 * outside the sheet shows a dark forest-green gradient with a faint dot
 * motif and (≥900px) two large watermark serif "H" glyphs. At mobile widths
 * the sheet fills the whole viewport, so this component is visually inert —
 * pixel-identical to rendering the pages bare.
 *
 * All styling lives in src/index.css (`.desktop-frame*`). Fixed-position
 * chrome (AppHeader, Session's header/footer bars, FormulaDrawer) caps
 * itself at the same --content-max-width so it stays aligned with the
 * sheet; no transform is used anywhere in this wrapper, so fixed children
 * keep the viewport as their containing block.
 */
import type { ReactNode } from 'react'

export default function DesktopFrame({ children }: { children: ReactNode }) {
  return (
    <div className="desktop-frame">
      <span className="desktop-frame-watermark left" aria-hidden>H</span>
      <span className="desktop-frame-watermark right" aria-hidden>H</span>
      <div className="desktop-frame-sheet">{children}</div>
    </div>
  )
}
