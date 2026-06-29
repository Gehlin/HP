import { useNavigate } from 'react-router-dom'

function ArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

interface PageHeaderProps {
  title: string
  onBack?: () => void
  action?: React.ReactNode
}

export default function PageHeader({ title, onBack, action }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-card-border)] bg-[var(--color-paper)]">
      <button
        onClick={onBack ?? (() => navigate(-1))}
        className="shrink-0 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
        aria-label="Tillbaka"
      >
        <ArrowLeft />
      </button>
      <h1 className="flex-1 text-base font-semibold text-[var(--color-ink)] truncate">{title}</h1>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
