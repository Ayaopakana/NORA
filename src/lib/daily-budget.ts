import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

/** Шкала «бюджет на сегодня» для Бишкека (сом). */
export const DAILY_BUDGET_LABELS = [
  'до ~500 сом',
  '~500–1 500 сом',
  '~1 500–3 500 сом',
  '3 500+ сом',
] as const

export function getDailyBudgetLabels(locale: Locale = 'ru'): readonly string[] {
  return getMessages(locale).budget.tiers
}

export function dailyBudgetLabel(index: number, locale: Locale = 'ru'): string {
  const labels = getDailyBudgetLabels(locale)
  return labels[Math.max(0, Math.min(3, Math.round(index)))] ?? labels[1]
}

export function normalizeBudgetIndex(index: number | undefined): number {
  if (index === undefined || Number.isNaN(index)) return 1
  return Math.max(0, Math.min(3, Math.round(index)))
}
