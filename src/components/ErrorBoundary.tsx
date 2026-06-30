import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[HP] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-app flex flex-col items-center justify-center p-8 text-center">
          <div className="text-5xl mb-5 select-none">⚠️</div>
          <h1 className="text-xl font-black text-[var(--color-ink)] mb-2 tracking-tight">Något gick fel</h1>
          <p className="text-[var(--color-ink-muted)] text-sm mb-1 max-w-xs leading-relaxed">
            Ett oväntat fel inträffade. Dina svar och framsteg är sparade.
          </p>
          <p className="text-[var(--color-ink-faint)] text-xs mb-8 font-mono break-all max-w-xs">
            {this.state.error.message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            className="bg-[var(--color-green)] hover:opacity-90 text-[var(--color-cream)] px-7 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Gå till startsidan
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
