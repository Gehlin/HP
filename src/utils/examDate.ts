const KEY = 'hp_exam_date'

// Upcoming HP exam dates (prototype EXAM_OPTIONS — single source of truth,
// used by both Onboarding step 3 and Profil's "Ändra" flow; update each year)
export const EXAM_OPTIONS: { iso: string; label: string; sub: string }[] = [
  { iso: '2026-10-25', label: '25 oktober 2026', sub: 'Höstens prov' },
  { iso: '2027-04-10', label: '10 april 2027',   sub: 'Vårens prov' },
  { iso: '2027-10-24', label: '24 oktober 2027', sub: 'Höstens prov' },
]

export function getExamDate(): Date | null {
  const raw = localStorage.getItem(KEY)
  return raw ? new Date(raw) : null
}

export function setExamDate(isoDate: string) {
  localStorage.setItem(KEY, isoDate)
}

export function clearExamDate() {
  localStorage.removeItem(KEY)
}

export function daysUntilExam(): number | null {
  const d = getExamDate()
  if (!d) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exam = new Date(d)
  exam.setHours(0, 0, 0, 0)
  return Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function urgencyLabel(days: number): { text: string; color: string } {
  if (days < 0)  return { text: 'Provet har passerat', color: 'text-[var(--color-ink-faint)]' }
  if (days === 0) return { text: 'Provet är idag!', color: 'text-emerald-700' }
  if (days <= 7)  return { text: 'Sista veckan — kör hårt!', color: 'text-red-600' }
  if (days <= 14) return { text: 'Två veckor kvar — intensifiera nu', color: 'text-amber-600' }
  if (days <= 30) return { text: 'En månad kvar — bygg momentum', color: 'text-blue-700' }
  return { text: 'God tid kvar — var konsekvent', color: 'text-[var(--color-ink-muted)]' }
}

// Recommended daily question count given days left and backlog
export function dailyTarget(daysLeft: number, srsBacklog: number, unseenCount: number): number {
  if (daysLeft <= 0) return 20
  const srsPerDay = Math.ceil(srsBacklog / Math.max(1, daysLeft))
  const newPerDay = Math.ceil(unseenCount / Math.max(1, daysLeft))
  return Math.min(50, Math.max(10, srsPerDay + newPerDay))
}
