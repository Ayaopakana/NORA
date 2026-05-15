/** Шкала «бюджет на сегодня» для Бишкека (сом). */
export const DAILY_BUDGET_LABELS = [
  'до ~500 сом',
  '~500–1 500 сом',
  '~1 500–3 500 сом',
  '3 500+ сом',
] as const

export function dailyBudgetLabel(index: number): string {
  return DAILY_BUDGET_LABELS[Math.max(0, Math.min(3, Math.round(index)))] ??
    DAILY_BUDGET_LABELS[1]
}

export function normalizeBudgetIndex(index: number | undefined): number {
  if (index === undefined || Number.isNaN(index)) return 1
  return Math.max(0, Math.min(3, Math.round(index)))
}
