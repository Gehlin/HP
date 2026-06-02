import { InlineMath } from './Math'

interface Props {
  text: string
  className?: string
}

// Splits on $$display$$, $inline$, and **bold** — in that priority order
const SPLIT_RE = /(\$\$[\s\S]+?\$\$|\$[^$]+\$|\*\*[^*]+\*\*)/

export default function MathText({ text, className }: Props) {
  const parts = text.split(SPLIT_RE)
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          return (
            <span key={i} style={{ display: 'block', textAlign: 'center', margin: '0.25rem 0' }}>
              <InlineMath math={part.slice(2, -2).trim()} />
            </span>
          )
        }
        if (part.startsWith('$') && part.endsWith('$')) {
          return <InlineMath key={i} math={part.slice(1, -1)} />
        }
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
      })}
    </span>
  )
}
