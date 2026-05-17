export type NotificationPrefs = {
  pushEnabled: boolean
  importantOnly: boolean
}

const KEY = 'nora_notification_prefs'

const DEFAULT: NotificationPrefs = {
  pushEnabled: true,
  importantOnly: false,
}

export function getNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT }
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return {
      pushEnabled:
        typeof parsed.pushEnabled === 'boolean'
          ? parsed.pushEnabled
          : DEFAULT.pushEnabled,
      importantOnly:
        typeof parsed.importantOnly === 'boolean'
          ? parsed.importantOnly
          : DEFAULT.importantOnly,
    }
  } catch {
    return { ...DEFAULT }
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
    window.dispatchEvent(new Event('nora-settings-change'))
  } catch {
    /* quota */
  }
}
