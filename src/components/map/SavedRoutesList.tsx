'use client'

import { Route, Trash2 } from 'lucide-react'
import { formatRouteDuration, type RouteTimeSlot } from '@/lib/build-day-route'
import type { SavedDayRoute } from '@/lib/saved-routes-storage'
import { useI18n } from '@/hooks/useI18n'
import { cn } from '@/lib/utils'

type SavedRoutesListProps = {
  routes: SavedDayRoute[]
  activeRouteId?: string | null
  onSelect: (route: SavedDayRoute) => void
  onDelete: (routeId: string) => void
}

function routeTitle(route: SavedDayRoute) {
  const area = route.area.trim()
  if (area) return area
  return route.stops[0]?.title ?? '—'
}

export function SavedRoutesList({
  routes,
  activeRouteId,
  onSelect,
  onDelete,
}: SavedRoutesListProps) {
  const { locale, t } = useI18n()

  const timeLabels: Record<RouteTimeSlot, string> = {
    morning: t('routeBuilder.timeMorning'),
    afternoon: t('routeBuilder.timeAfternoon'),
    evening: t('routeBuilder.timeEvening'),
    full: t('routeBuilder.timeFull'),
  }

  return (
    <section className="mt-3 rounded-xl border border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] p-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--nora-text-muted)]">
        {t('planner.savedRoutes')}
      </p>
      <p className="mt-0.5 text-[11px] text-[var(--nora-text-muted)]">
        {t('planner.savedRoutesHint')}
      </p>

      {routes.length === 0 ? (
        <p className="mt-2 text-[11px] text-[var(--nora-text-muted)]">
          {t('planner.noSavedRoutes')}
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5">
          {routes.map((route) => {
            const active = route.id === activeRouteId
            const duration = formatRouteDuration(route.totalDurationMin, locale)
            const title = routeTitle(route)
            return (
              <li key={route.id} className="flex gap-1">
                <button
                  type="button"
                  onClick={() => onSelect(route)}
                  aria-label={t('planner.selectSavedRoute', { title })}
                  aria-pressed={active}
                  className={cn(
                    'flex min-w-0 flex-1 items-start gap-2 rounded-xl border px-2.5 py-2 text-left transition-colors',
                    active
                      ? 'border-amber-400/55 bg-amber-400/12 ring-1 ring-amber-400/35'
                      : 'border-[var(--nora-border-subtle)] bg-[var(--nora-surface)] hover:border-sky-400/35',
                  )}
                >
                  <Route
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0',
                      active
                        ? 'text-amber-600 dark:text-amber-300'
                        : 'text-sky-500 dark:text-sky-400',
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium text-[var(--nora-text)]">
                      {title}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[var(--nora-text-muted)]">
                      {timeLabels[route.timeSlot]}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[var(--nora-text-muted)]">
                      {t('routeBuilder.stops', {
                        count: String(route.stops.length),
                        duration,
                      })}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(route.id)}
                  className="flex shrink-0 items-center justify-center rounded-xl border border-[var(--nora-border-subtle)] px-2 text-[var(--nora-text-muted)] hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-600 dark:hover:text-red-300"
                  aria-label={t('planner.deleteSavedRoute')}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
