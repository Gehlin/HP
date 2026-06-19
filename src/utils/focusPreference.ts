export type FocusPreference = 'quant' | 'verbal' | 'both'

const KEY = 'hp_focus_preference'

export function getFocusPreference(): FocusPreference | null {
  const v = localStorage.getItem(KEY)
  if (v === 'quant' || v === 'verbal' || v === 'both') return v
  return null
}

export function setFocusPreference(focus: FocusPreference): void {
  localStorage.setItem(KEY, focus)
}

export function clearFocusPreference(): void {
  localStorage.removeItem(KEY)
}
