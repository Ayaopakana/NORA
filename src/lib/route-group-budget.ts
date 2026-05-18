import { dailyBudgetLabel, normalizeBudgetIndex } from '@/lib/daily-budget'
import { getNoraUserProfile } from '@/lib/nora-users'
import type { Locale } from '@/i18n/config'

export type RouteGroupBudgetMember = {
  id: string
  nickname: string
  budgetIdx: number
  isOrganizer?: boolean
  /** Без аккаунта NORA — бюджет как у организатора */
  isGuest?: boolean
}

export type GroupBudgetAnalysis = {
  groupSize: number
  members: RouteGroupBudgetMember[]
  noraCount: number
  guestCount: number
  avgBudgetIdx: number
  /** Минимум — места подходят всем */
  effectiveBudgetIdx: number
}

export type AnalyzeGroupInput = {
  organizerId: string
  organizerBudgetIdx: number
  participantIds: string[]
  groupSize: number
}

export function analyzeRouteGroup(input: AnalyzeGroupInput): GroupBudgetAnalysis {
  const groupSize = Math.max(1, Math.min(12, Math.round(input.groupSize)))
  const organizerBudget = normalizeBudgetIndex(input.organizerBudgetIdx)
  const participantIds = [...new Set(input.participantIds)].filter(
    (id) => id !== input.organizerId,
  )

  const members: RouteGroupBudgetMember[] = []

  const organizer = getNoraUserProfile(input.organizerId)
  members.push({
    id: input.organizerId,
    nickname: organizer?.nickname ?? 'you',
    budgetIdx: organizerBudget,
    isOrganizer: true,
  })

  for (const id of participantIds) {
    const p = getNoraUserProfile(id)
    if (!p) continue
    members.push({
      id: p.id,
      nickname: p.nickname,
      budgetIdx: normalizeBudgetIndex(p.dailyBudgetIndex),
    })
  }

  const noraCount = members.length
  const guestCount = Math.max(0, groupSize - noraCount)

  for (let i = 0; i < guestCount; i++) {
    members.push({
      id: `guest-${i}`,
      nickname: String(i + 1),
      budgetIdx: organizerBudget,
      isGuest: true,
    })
  }

  const budgets = members.map((m) => m.budgetIdx)
  const sum = budgets.reduce((a, b) => a + b, 0)
  const avgBudgetIdx = normalizeBudgetIndex(
    Math.round(sum / Math.max(1, budgets.length)),
  )
  const effectiveBudgetIdx = Math.min(...budgets)

  return {
    groupSize,
    members,
    noraCount,
    guestCount,
    avgBudgetIdx,
    effectiveBudgetIdx,
  }
}

export function formatGroupBudgetSummary(
  analysis: GroupBudgetAnalysis,
  locale: Locale,
): { avgLabel: string; effectiveLabel: string } {
  return {
    avgLabel: dailyBudgetLabel(analysis.avgBudgetIdx, locale),
    effectiveLabel: dailyBudgetLabel(analysis.effectiveBudgetIdx, locale),
  }
}

/** Самый «молодой» участник для фильтра 18+ */
export function strictestBirthYearInGroup(
  organizerId: string,
  participantIds: string[],
  organizerBirthYear: number | null,
): number | null {
  const years: number[] = []
  if (organizerBirthYear) years.push(organizerBirthYear)
  for (const id of participantIds) {
    const p = getNoraUserProfile(id)
    if (p?.birthYear) years.push(p.birthYear)
  }
  if (!years.length) return organizerBirthYear
  return Math.max(...years)
}
