import { useEffect, useState } from 'react'
import { getAchievement, RARITY_STYLES } from '../utils/achievements'

interface Props {
  newIds: string[]
  onDone: () => void
}

export default function AchievementToast({ newIds, onDone }: Props) {
  const [visible, setVisible] = useState(true)
  const [idx, setIdx] = useState(0)

  const achievement = newIds[idx] ? getAchievement(newIds[idx]) : null

  useEffect(() => {
    if (!achievement) { onDone(); return }
    const t = setTimeout(() => {
      if (idx < newIds.length - 1) {
        setIdx(i => i + 1)
      } else {
        setVisible(false)
        setTimeout(onDone, 400)
      }
    }, 3000)
    return () => clearTimeout(t)
  }, [idx, achievement])

  if (!achievement || !visible) return null

  const style = RARITY_STYLES[achievement.rarity]

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4`}>
      <div className={`rounded-2xl border ${style.border} ${style.bg} backdrop-blur-sm px-5 py-4 shadow-2xl animate-fade-in`}>
        <div className={`text-[10px] font-black tracking-widest uppercase mb-1 ${style.labelColor}`}>
          Bricka upplåst — {style.label}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{achievement.icon}</span>
          <div>
            <div className="font-black text-white">{achievement.title}</div>
            <div className="text-xs text-slate-400 mt-0.5">{achievement.description}</div>
          </div>
        </div>
        {newIds.length > 1 && (
          <div className="text-[10px] text-slate-500 mt-2 text-right">{idx + 1}/{newIds.length}</div>
        )}
      </div>
    </div>
  )
}
