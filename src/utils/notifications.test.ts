import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { PacingResult } from './pacing'

// notifications.ts calls computePacing() inside maybeShowPacingNotification; mock it so
// each scenario can supply an exact onTrack/message without constructing history + exam
// date + readiness state (already covered independently by pacing.test.ts).
vi.mock('./pacing', () => ({ computePacing: vi.fn() }))

const ENABLED_KEY = 'hp_notif_enabled'
const LAST_SHOWN_KEY = 'hp_notif_last_shown'
const PACING_LAST_SHOWN_KEY = 'hp_notif_pacing_last_shown'

const HOUR = 60 * 60 * 1000

/** Minimal fake Notification global — jsdom does not implement the real one. */
class FakeNotification {
  static permission: NotificationPermission = 'default'
  static requestPermission = vi.fn(async () => FakeNotification.permission)
  static instances: { title: string; options?: NotificationOptions }[] = []
  constructor(title: string, options?: NotificationOptions) {
    FakeNotification.instances.push({ title, options })
  }
}

function enableNotifications() {
  FakeNotification.permission = 'granted'
  localStorage.setItem(ENABLED_KEY, '1')
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  FakeNotification.permission = 'default'
  FakeNotification.instances = []
  ;(globalThis as unknown as { Notification: typeof FakeNotification }).Notification = FakeNotification
})

afterEach(() => {
  vi.useRealTimers()
  delete (globalThis as { Notification?: unknown }).Notification
})

describe('notificationsSupported', () => {
  it('is true when a Notification global exists', async () => {
    const { notificationsSupported } = await import('./notifications')
    expect(notificationsSupported()).toBe(true)
  })

  it('is false when there is no Notification global', async () => {
    delete (globalThis as { Notification?: unknown }).Notification
    const { notificationsSupported } = await import('./notifications')
    expect(notificationsSupported()).toBe(false)
  })
})

describe('notificationsEnabled', () => {
  it('is false with no Notification support at all', async () => {
    delete (globalThis as { Notification?: unknown }).Notification
    const { notificationsEnabled } = await import('./notifications')
    expect(notificationsEnabled()).toBe(false)
  })

  it('is false when supported but permission was never granted', async () => {
    FakeNotification.permission = 'denied'
    localStorage.setItem(ENABLED_KEY, '1')
    const { notificationsEnabled } = await import('./notifications')
    expect(notificationsEnabled()).toBe(false)
  })

  it('is false when permission is granted but the user toggle is off', async () => {
    FakeNotification.permission = 'granted'
    localStorage.setItem(ENABLED_KEY, '0')
    const { notificationsEnabled } = await import('./notifications')
    expect(notificationsEnabled()).toBe(false)
  })

  it('is true only when supported + granted + the toggle is on', async () => {
    enableNotifications()
    const { notificationsEnabled } = await import('./notifications')
    expect(notificationsEnabled()).toBe(true)
  })
})

describe('requestNotificationPermission', () => {
  it('resolves false immediately (and writes nothing) when unsupported', async () => {
    delete (globalThis as { Notification?: unknown }).Notification
    const { requestNotificationPermission } = await import('./notifications')
    const granted = await requestNotificationPermission()
    expect(granted).toBe(false)
    expect(localStorage.getItem(ENABLED_KEY)).toBeNull()
  })

  it('persists "1" and returns true when the user grants permission', async () => {
    FakeNotification.permission = 'granted'
    const { requestNotificationPermission } = await import('./notifications')
    const granted = await requestNotificationPermission()
    expect(granted).toBe(true)
    expect(localStorage.getItem(ENABLED_KEY)).toBe('1')
  })

  it('persists "0" and returns false when the user denies permission', async () => {
    FakeNotification.permission = 'denied'
    const { requestNotificationPermission } = await import('./notifications')
    const granted = await requestNotificationPermission()
    expect(granted).toBe(false)
    expect(localStorage.getItem(ENABLED_KEY)).toBe('0')
  })
})

describe('disableNotifications', () => {
  it('writes "0" to the enabled key', async () => {
    localStorage.setItem(ENABLED_KEY, '1')
    const { disableNotifications } = await import('./notifications')
    disableNotifications()
    expect(localStorage.getItem(ENABLED_KEY)).toBe('0')
  })
})

describe('maybeShowDueNotification', () => {
  it('does nothing when notifications are not enabled', async () => {
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(5, null)
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('does nothing when dueCount is 0, even if enabled', async () => {
    enableNotifications()
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(0, null)
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('shows a notification the first time, with no prior last-shown or recent session', async () => {
    enableNotifications()
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(3, null)
    expect(FakeNotification.instances).toHaveLength(1)
    expect(FakeNotification.instances[0].title).toBe('HP Träning')
    expect(FakeNotification.instances[0].options?.body).toContain('3 frågor')
    expect(localStorage.getItem(LAST_SHOWN_KEY)).not.toBeNull()
  })

  it('suppresses a repeat within the 20-hour cooldown', async () => {
    enableNotifications()
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now() - (20 * HOUR - 1000)))
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(3, null)
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('allows a repeat once just past the 20-hour cooldown', async () => {
    enableNotifications()
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now() - (20 * HOUR + 1000)))
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(3, null)
    expect(FakeNotification.instances).toHaveLength(1)
  })

  it('suppresses when the last session was less than 3 hours ago (active-study guard)', async () => {
    enableNotifications()
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(3, Date.now() - (3 * HOUR - 1000))
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('allows showing once the last session is just past 3 hours ago', async () => {
    enableNotifications()
    const { maybeShowDueNotification } = await import('./notifications')
    maybeShowDueNotification(3, Date.now() - (3 * HOUR + 1000))
    expect(FakeNotification.instances).toHaveLength(1)
  })
})

describe('maybeShowPacingNotification', () => {
  async function mockPacing(result: PacingResult) {
    const { computePacing } = await import('./pacing')
    vi.mocked(computePacing).mockResolvedValue(result)
  }

  const onTrack: PacingResult = { dailyTarget: 20, weeklyTarget: 140, onTrack: true, message: 'on track' }
  const behind: PacingResult = { dailyTarget: 30, weeklyTarget: 210, onTrack: false, message: 'Öka tempot med 10 extra frågor om dagen för att nå målet till provet.' }

  it('does nothing when notifications are disabled, regardless of pacing', async () => {
    await mockPacing(behind)
    const { maybeShowPacingNotification } = await import('./notifications')
    await maybeShowPacingNotification(null)
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('does nothing when the user is on track', async () => {
    enableNotifications()
    await mockPacing(onTrack)
    const { maybeShowPacingNotification } = await import('./notifications')
    await maybeShowPacingNotification(null)
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('does nothing if the user already practiced today', async () => {
    enableNotifications()
    await mockPacing(behind)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const { maybeShowPacingNotification } = await import('./notifications')
    await maybeShowPacingNotification(todayStart.getTime() + HOUR) // practiced this morning
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('shows the pacing message when behind, not yet practiced today, and no cooldown active', async () => {
    enableNotifications()
    await mockPacing(behind)
    const { maybeShowPacingNotification } = await import('./notifications')
    // lastSessionTimestamp from yesterday -> not today, and > 3h ago
    const yesterday = Date.now() - 26 * HOUR
    await maybeShowPacingNotification(yesterday)
    expect(FakeNotification.instances).toHaveLength(1)
    expect(FakeNotification.instances[0].options?.body).toBe(behind.message)
    expect(localStorage.getItem(PACING_LAST_SHOWN_KEY)).not.toBeNull()
  })

  it('respects its own 20h cooldown independently from the due-notification cooldown', async () => {
    enableNotifications()
    await mockPacing(behind)
    // due-notification was shown recently, but pacing never was -> pacing should still fire
    localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()))
    const { maybeShowPacingNotification } = await import('./notifications')
    await maybeShowPacingNotification(Date.now() - 26 * HOUR)
    expect(FakeNotification.instances).toHaveLength(1)
  })

  it('suppresses within its own 20h cooldown', async () => {
    enableNotifications()
    await mockPacing(behind)
    localStorage.setItem(PACING_LAST_SHOWN_KEY, String(Date.now() - (20 * HOUR - 1000)))
    const { maybeShowPacingNotification } = await import('./notifications')
    await maybeShowPacingNotification(Date.now() - 26 * HOUR)
    expect(FakeNotification.instances).toHaveLength(0)
  })

  it('suppresses when the last session (even if not today) was less than 3 hours ago', async () => {
    enableNotifications()
    await mockPacing(behind)
    const { maybeShowPacingNotification } = await import('./notifications')
    await maybeShowPacingNotification(Date.now() - (3 * HOUR - 1000))
    expect(FakeNotification.instances).toHaveLength(0)
  })
})
