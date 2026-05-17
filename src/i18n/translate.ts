import type { Messages } from './messages/ru'

export type { Messages }

export function translate(
  messages: Messages,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const parts = key.split('.')
  let cur: unknown = messages
  for (const part of parts) {
    if (cur === null || cur === undefined || typeof cur !== 'object') {
      return key
    }
    cur = (cur as Record<string, unknown>)[part]
  }
  if (typeof cur !== 'string') return key
  if (!vars) return cur
  return cur.replace(/\{(\w+)\}/g, (_, name: string) => {
    const val = vars[name]
    return val === undefined ? `{${name}}` : String(val)
  })
}
