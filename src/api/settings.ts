import type { NotificationPrefs } from '@/lib/settings-preferences'
import { apiFetch } from '@/api/client'
import { parseJson } from '@/api/json'

export async function apiGetNotificationPrefs(): Promise<NotificationPrefs> {
  const res = await apiFetch('/users/me/settings')
  const data = await parseJson<{ settings: NotificationPrefs }>(res)
  return data.settings
}

export async function apiSaveNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<NotificationPrefs> {
  const res = await apiFetch('/users/me/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  })
  const data = await parseJson<{ settings: NotificationPrefs }>(res)
  return data.settings
}
