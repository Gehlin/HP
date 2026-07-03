import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_KEY = 'hp_install_dismissed'

export default function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem(DISMISSED_KEY, '1')
  }

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const { outcome } = await promptEvent.userChoice
    if (outcome === 'accepted') setVisible(false)
    else dismiss()
  }

  if (!visible) return null

  return (
    // bottom-20 used to clear the old fixed bottom tab bar — no longer needed
    <div className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 right-4 z-[150] max-w-md mx-auto">
      <div className="card border border-[var(--color-card-border)] rounded-2xl p-4 flex items-center gap-4 shadow-2xl animate-slide-up">
        <div className="w-10 h-10 bg-[var(--color-green)] rounded-xl flex items-center justify-center shrink-0">
          <span className="text-[var(--color-cream)] text-xs font-black">HP</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[var(--color-ink)]">Lägg till på hemskärmen</div>
          <div className="text-xs text-[var(--color-ink-faint)] mt-0.5">Snabbare åtkomst, fungerar offline</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={dismiss} className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors text-lg leading-none">×</button>
          <button
            onClick={install}
            className="btn-primary text-xs px-3 py-1.5 whitespace-nowrap"
          >
            Installera
          </button>
        </div>
      </div>
    </div>
  )
}
