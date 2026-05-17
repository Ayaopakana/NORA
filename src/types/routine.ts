import type { ZoneKey } from '@/types/user'

export type WeekdayId =
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat'
  | 'sun'

export const WEEKDAYS: { id: WeekdayId; short: string }[] = [
  { id: 'mon', short: 'Пн' },
  { id: 'tue', short: 'Вт' },
  { id: 'wed', short: 'Ср' },
  { id: 'thu', short: 'Чт' },
  { id: 'fri', short: 'Пт' },
  { id: 'sat', short: 'Сб' },
  { id: 'sun', short: 'Вс' },
]

export type RoutineSlot = {
  id: string
  zone: ZoneKey
  days: WeekdayId[]
  /** HH:mm */
  start: string
  /** HH:mm */
  end: string
  note?: string
}

export type UserRoutine = {
  slots: RoutineSlot[]
}

export function emptyRoutine(): UserRoutine {
  return { slots: [] }
}

function isWeekday(v: unknown): v is WeekdayId {
  return (
    v === 'mon' ||
    v === 'tue' ||
    v === 'wed' ||
    v === 'thu' ||
    v === 'fri' ||
    v === 'sat' ||
    v === 'sun'
  )
}

function isZoneKey(v: unknown): v is ZoneKey {
  return v === 'home' || v === 'school' || v === 'work'
}

export function normalizeRoutine(raw: unknown): UserRoutine {
  if (!raw || typeof raw !== 'object') return emptyRoutine()
  const slotsRaw = (raw as { slots?: unknown }).slots
  if (!Array.isArray(slotsRaw)) return emptyRoutine()

  const slots: RoutineSlot[] = []
  for (const item of slotsRaw) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== 'string' || !isZoneKey(o.zone)) continue
    const days = Array.isArray(o.days)
      ? o.days.filter(isWeekday)
      : []
    const start = typeof o.start === 'string' ? o.start : '09:00'
    const end = typeof o.end === 'string' ? o.end : '18:00'
    if (!days.length) continue
    slots.push({
      id: o.id,
      zone: o.zone,
      days,
      start,
      end,
      note: typeof o.note === 'string' ? o.note : undefined,
    })
  }

  return { slots }
}
