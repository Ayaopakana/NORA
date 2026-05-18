/** JSON-ответ пользователя (без пароля) — зеркало src/types/user.ts на фронте. */
export type ApiUser = {
  id: string
  email: string
  name: string
  nickname: string
  bio: string
  avatarUrl: string | null
  psychotypeId: string
  moodNote: string
  budgetComfort: string
  cityIntent: string
  mbti: string
  countryOrigin: string
  countryCurrent: string
  userStatus: string
  zones: Record<string, { lng: number; lat: number }>
  dailyBudgetIndex: number
  initialMood: string
  birthYear: number | null
  routine: { slots: unknown[] }
}

export type AuthResponse = {
  token: string
  user: ApiUser
}
