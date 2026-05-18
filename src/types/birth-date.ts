/** День / месяц / год рождения для точного возраста и фильтра 18+. */
export type BirthDateParts = {
  day: number
  month: number
  year: number
}

export type BirthDateLike = Partial<
  BirthDateParts & {
    birthDay?: number | null
    birthMonth?: number | null
    birthYear?: number | null
  }
>

export type BirthDateInput = BirthDateLike | null

export function hasBirthDate(
  v: Partial<BirthDateParts> | null | undefined,
): v is BirthDateParts {
  if (!v) return false
  const { day, month, year } = v
  return (
    Number.isFinite(day) &&
    Number.isFinite(month) &&
    Number.isFinite(year) &&
    (day as number) >= 1 &&
    (month as number) >= 1 &&
    (year as number) >= 1920
  )
}

/** Собрать дату из полей пользователя; для старых записей только с годом — 31.12 (строже для несовершеннолетних). */
export function resolveBirthDate(
  user: BirthDateLike | null | undefined,
): BirthDateParts | null {
  if (!user) return null
  const year = Number(user.year ?? user.birthYear)
  if (!Number.isFinite(year) || year < 1920 || year > new Date().getFullYear()) {
    return null
  }
  const monthRaw = Number(user.month ?? user.birthMonth)
  const dayRaw = Number(user.day ?? user.birthDay)
  const hasFull =
    Number.isFinite(monthRaw) &&
    Number.isFinite(dayRaw) &&
    monthRaw >= 1 &&
    monthRaw <= 12 &&
    dayRaw >= 1 &&
    dayRaw <= 31
  if (hasFull) {
    return {
      year: Math.round(year),
      month: Math.round(monthRaw),
      day: Math.round(dayRaw),
    }
  }
  return { year: Math.round(year), month: 12, day: 31 }
}
