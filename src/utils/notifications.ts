import { computePacing } from './pacing'

const ENABLED_KEY = 'hp_notif_enabled'
const LAST_SHOWN_KEY = 'hp_notif_last_shown'
const PACING_LAST_SHOWN_KEY = 'hp_notif_pacing_last_shown'

export function notificationsSupported(): boolean {
  return 'Notification' in window
}

export function notificationsEnabled(): boolean {
  return (
    notificationsSupported() &&
    Notification.permission === 'granted' &&
    localStorage.getItem(ENABLED_KEY) === '1'
  )
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false
  const result = await Notification.requestPermission()
  const granted = result === 'granted'
  localStorage.setItem(ENABLED_KEY, granted ? '1' : '0')
  return granted
}

export function disableNotifications(): void {
  localStorage.setItem(ENABLED_KEY, '0')
}

/** Show a system notification if conditions are met:
 *  - notifications enabled + granted
 *  - at least 1 question due
 *  - not shown in the last 20 hours
 *  - last session was >3 hours ago (don't interrupt active study)
 */
export function maybeShowDueNotification(dueCount: number, lastSessionTimestamp: number | null): void {
  if (!notificationsEnabled()) return
  if (dueCount === 0) return

  const now = Date.now()
  const lastShown = parseInt(localStorage.getItem(LAST_SHOWN_KEY) ?? '0', 10)
  if (now - lastShown < 20 * 60 * 60 * 1000) return
  if (lastSessionTimestamp && now - lastSessionTimestamp < 3 * 60 * 60 * 1000) return

  localStorage.setItem(LAST_SHOWN_KEY, String(now))

  new Notification('HP Träning', {
    body: `${dueCount} frågor att repetera idag — håll streaken vid liv!`,
    icon: '/icon-192.png',
    tag: 'hp-due-review',
  })
}

/** Show a pacing reminder if the user is meaningfully behind pace and hasn't practiced today.
 *  Respects the same enabled/permission/last-shown/active-study guards as maybeShowDueNotification.
 */
export function maybeShowPacingNotification(lastSessionTimestamp: number | null): void {
  if (!notificationsEnabled()) return

  const pacing = computePacing()
  if (pacing.onTrack) return

  // Don't send if user has already practiced today
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  if (lastSessionTimestamp !== null && lastSessionTimestamp >= todayStart.getTime()) return

  const now = Date.now()
  const lastShown = parseInt(localStorage.getItem(PACING_LAST_SHOWN_KEY) ?? '0', 10)
  if (now - lastShown < 20 * 60 * 60 * 1000) return
  if (lastSessionTimestamp !== null && now - lastSessionTimestamp < 3 * 60 * 60 * 1000) return

  localStorage.setItem(PACING_LAST_SHOWN_KEY, String(now))

  new Notification('HP Träning', {
    body: pacing.message,
    icon: '/icon-192.png',
    tag: 'hp-pacing-reminder',
  })
}
