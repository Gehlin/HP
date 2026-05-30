import { InlineMath } from 'react-katex'

interface Props {
  text: string
  className?: string
}

export default function MathText({ text, className }: Props) {
  const parts = text.split(/(\$[^$]+\$)/)
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const expr = part.slice(1, -1)
          return <InlineMath key={i} math={expr} />
        }
        return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
      })}
    </span>
  )
}
