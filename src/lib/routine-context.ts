import type { User } from '@/types/user'
import type { RoutineSlot, WeekdayId } from '@/types/routine'
import { getAgeFromBirthYear } from '@/lib/age-policy'

const WEEKDAY_INDEX: Record<WeekdayId, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

function parseMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0
  return h * 60 + m
}

function isInSlot(date: Date, slot: RoutineSlot): boolean {
  const dayIdx = date.getDay()
  const weekday = (Object.keys(WEEKDAY_INDEX) as WeekdayId[]).find(
    (k) => WEEKDAY_INDEX[k] === dayIdx,
  )
  if (!weekday || !slot.days.includes(weekday)) return false

  const now = date.getHours() * 60 + date.getMinutes()
  const start = parseMinutes(slot.start)
  const end = parseMinutes(slot.end)
  if (start <= end) return now >= start && now < end
  return now >= start || now < end
}

/** Какая зона сейчас по расписанию (для будущей ИИ-логики). */
export function getActiveRoutineZone(
  user: Pick<User, 'routine'>,
  at: Date = new Date(),
): RoutineSlot | null {
  for (const slot of user.routine.slots) {
    if (isInSlot(at, slot)) return slot
  }
  return null
}

/** Текстовый контекст для будущего ИИ-ассистента. */
export function buildRoutineAiContext(user: User): string {
  const lines: string[] = []
  const age = getAgeFromBirthYear(user.birthYear)
  if (age !== null) lines.push(`Возраст: ${age} лет.`)

  if (user.routine.slots.length === 0) {
    lines.push('Расписание зон не заполнено.')
    return lines.join(' ')
  }

  lines.push('Обычное расписание:')
  for (const slot of user.routine.slots) {
    const zoneLabel =
      slot.zone === 'home'
        ? 'дом'
        : slot.zone === 'work'
          ? 'работа'
          : 'учёба'
    const days = slot.days.join(',')
    lines.push(
      `- ${zoneLabel}: ${days} ${slot.start}–${slot.end}${slot.note ? ` (${slot.note})` : ''}`,
    )
  }

  const active = getActiveRoutineZone(user)
  if (active) {
    lines.push(
      `Сейчас по расписанию: ${active.zone}, занят до ${active.end}.`,
    )
  }

  return lines.join('\n')
}
