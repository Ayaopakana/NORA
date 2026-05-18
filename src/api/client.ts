export const SESSION_KEY = 'nora_session'

function resolveUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')
  if (path.startsWith('http')) return path
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

/** HTTP-клиент для будущего бэкенда; сейчас база может быть пустой. */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { token?: string }
        if (parsed.token) {
          headers.set('Authorization', `Bearer ${parsed.token}`)
        }
      } catch {
        /* ignore */
      }
    }
  }

  return fetch(resolveUrl(path), {
    ...init,
    headers,
  })
}
