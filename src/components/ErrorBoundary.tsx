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
          <h1 className="text-xl font-black text-white mb-2 tracking-tight">Något gick fel</h1>
          <p className="text-slate-400 text-sm mb-1 max-w-xs leading-relaxed">
            Ett oväntat fel inträffade. Dina svar och framsteg är sparade.
          </p>
          <p className="text-slate-600 text-xs mb-8 font-mono break-all max-w-xs">
            {this.state.error.message}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.href = '/' }}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-7 py-2.5 rounded-xl text-sm font-semibold transition-colors"
          >
            Gå till startsidan
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
