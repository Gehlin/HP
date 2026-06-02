import katex from 'katex'

interface MathProps {
  math: string
  errorColor?: string
}

function render(math: string, displayMode: boolean): string {
  return katex.renderToString(math, {
    throwOnError: false,
    displayMode,
    errorColor: '#cc0000',
    output: 'html',
  })
}

export function InlineMath({ math }: MathProps) {
  return <span dangerouslySetInnerHTML={{ __html: render(math, false) }} />
}

export function BlockMath({ math }: MathProps) {
  return <div dangerouslySetInnerHTML={{ __html: render(math, true) }} />
}
