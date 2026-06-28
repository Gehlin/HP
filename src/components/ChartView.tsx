import type { ChartData } from '../types'

const PALETTE = ['#224A3A', '#E4C66A', '#BF5A33', '#2563EB']
const W = 360, H = 220, mL = 50, mR = 10, mT = 28, mB = 32
const pW = W - mL - mR, pH = H - mT - mB

function niceStep(rough: number): number {
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const f = rough / mag
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * mag
}

function niceBounds(lo: number, hi: number): [number, number, number, number] {
  const step = niceStep((hi - lo || hi || 1) / 4)
  const min = Math.floor(lo / step) * step
  const max = Math.ceil(hi / step) * step
  const ticks = Math.round((max - min) / step)
  return [min, max, step, ticks]
}

function fmt(v: number): string {
  if (Math.abs(v) >= 10000) return `${Math.round(v / 1000)}k`
  return String(Math.round(v))
}

function Legend({ series }: { series: ChartData['series'] }) {
  return (
    <>
      {series.map((s, i) => (
        <g key={i} transform={`translate(${mL + i * 85}, 6)`}>
          <rect x={0} y={1} width={10} height={10} fill={s.color ?? PALETTE[i % 4]} rx={2} />
          <text x={14} y={10} fontSize={10} fill="#9A9A92">{s.label}</text>
        </g>
      ))}
    </>
  )
}

function YAxis({ min, max, step, ticks }: { min: number; max: number; step: number; ticks: number }) {
  const range = max - min || 1
  return (
    <>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const v = min + step * i
        const y = mT + pH - ((v - min) / range) * pH
        return (
          <g key={i}>
            <line x1={mL} x2={W - mR} y1={y} y2={y} stroke="rgba(26,26,24,0.08)" strokeWidth={1} />
            <text x={mL - 4} y={y + 3.5} textAnchor="end" fontSize={9} fill="#9A9A92">{fmt(v)}</text>
          </g>
        )
      })}
    </>
  )
}

function BarChart({ data }: { data: ChartData }) {
  const allVals = data.series.flatMap(s => s.values)
  const [min, max, step, ticks] = niceBounds(0, Math.max(...allVals))
  const range = max - min || 1
  const nGroups = data.xLabels.length
  const nSeries = data.series.length
  const groupW = pW / nGroups
  const barW = Math.min(20, Math.floor((groupW - 6) / nSeries))
  const groupOffset = (groupW - barW * nSeries) / 2

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <Legend series={data.series} />
      <YAxis min={min} max={max} step={step} ticks={ticks} />
      {data.series.map((s, si) => {
        const color = s.color ?? PALETTE[si % 4]
        return s.values.map((v, gi) => {
          const bH = Math.max(0, ((v - min) / range) * pH)
          const x = mL + gi * groupW + groupOffset + si * barW
          const y = mT + pH - bH
          return <rect key={`${si}-${gi}`} x={x} y={y} width={barW - 2} height={bH} fill={color} opacity={0.82} rx={1.5} />
        })
      })}
      {data.xLabels.map((lbl, i) => (
        <text key={i} x={mL + i * groupW + groupW / 2} y={H - mB + 16} textAnchor="middle" fontSize={9} fill="#9A9A92">{lbl}</text>
      ))}
    </svg>
  )
}

function LineChart({ data }: { data: ChartData }) {
  const allVals = data.series.flatMap(s => s.values)
  const [min, max, step, ticks] = niceBounds(Math.min(...allVals), Math.max(...allVals))
  const range = max - min || 1
  const n = data.xLabels.length
  const toX = (i: number) => mL + (n <= 1 ? pW / 2 : (i / (n - 1)) * pW)
  const toY = (v: number) => mT + pH - ((v - min) / range) * pH

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <Legend series={data.series} />
      <YAxis min={min} max={max} step={step} ticks={ticks} />
      {data.series.map((s, si) => {
        const color = s.color ?? PALETTE[si % 4]
        const pts = s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
        return (
          <g key={si}>
            <polyline points={pts} fill="none" stroke={color} strokeWidth={2.5}
              strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
            {s.values.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r={3.5} fill={color} />
            ))}
          </g>
        )
      })}
      {data.xLabels.map((lbl, i) => (
        <text key={i} x={toX(i)} y={H - mB + 16} textAnchor="middle" fontSize={9} fill="#9A9A92">{lbl}</text>
      ))}
    </svg>
  )
}

export default function ChartView({ data }: { data: ChartData }) {
  return (
    <div className="card rounded-2xl p-4 mb-5 overflow-x-auto">
      {data.title && <p className="text-xs text-[#9A9A92] mb-3">{data.title}</p>}
      {data.type === 'bar' ? <BarChart data={data} /> : <LineChart data={data} />}
    </div>
  )
}
