'use client'

import { Clock, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/useI18n'
import type { WeekdayId } from '@/types/routine'
import type { UserRoutine } from '@/types/routine'
import type { UserZones, ZoneKey } from '@/types/user'
import { cn } from '@/lib/utils'

const WEEKDAY_IDS: WeekdayId[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
]

type ZoneRoutineEditorProps = {
  zones: UserZones
  routine: UserRoutine
  onChange: (routine: UserRoutine) => void
  className?: string
}

const ZONE_ORDER: ZoneKey[] = ['home', 'school', 'work']

export function ZoneRoutineEditor({
  zones,
  routine,
  onChange,
  className,
}: ZoneRoutineEditorProps) {
  const { t } = useI18n()

  const zoneLabels: Record<ZoneKey, string> = {
    home: t('passportForm.zoneHome'),
    school: t('passportForm.zoneStudy'),
    work: t('passportForm.zoneWork'),
  }

  function weekdayLabel(id: WeekdayId) {
    return t(`routine.weekdays.${id}` as 'routine.weekdays.mon')
  }

  function slotsForZone(zone: ZoneKey) {
    return routine.slots.filter((s) => s.zone === zone)
  }

  function addSlot(zone: ZoneKey) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `slot-${Date.now()}`
    onChange({
      slots: [
        ...routine.slots,
        {
          id,
          zone,
          days: ['mon', 'tue', 'wed', 'thu', 'fri'],
          start: zone === 'home' ? '22:00' : '09:00',
          end: zone === 'home' ? '07:00' : '18:00',
        },
      ],
    })
  }

  function updateSlot(
    id: string,
    patch: Partial<Omit<(typeof routine.slots)[number], 'id'>>,
  ) {
    onChange({
      slots: routine.slots.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  function removeSlot(id: string) {
    onChange({ slots: routine.slots.filter((s) => s.id !== id) })
  }

  function toggleDay(slotId: string, day: WeekdayId) {
    const slot = routine.slots.find((s) => s.id === slotId)
    if (!slot) return
    const days = slot.days.includes(day)
      ? slot.days.filter((d) => d !== day)
      : [...slot.days, day]
    updateSlot(slotId, { days })
  }

  const configuredZones = ZONE_ORDER.filter((z) => zones[z])

  return (
    <div className={cn('space-y-3', className)}>
      <p className="text-xs leading-relaxed text-[var(--nora-text-muted)]">
        {t('routine.hint')}
      </p>

      {configuredZones.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--nora-border)] px-3 py-4 text-center text-xs text-[var(--nora-text-muted)]">
          {t('routine.needZones')}
        </p>
      ) : null}

      {configuredZones.map((zone) => (
        <div
          key={zone}
          className="rounded-xl border border-[var(--nora-border-subtle)] bg-[var(--nora-surface-veil)] p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--nora-text)]">
              {zoneLabels[zone]}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 gap-1 text-xs"
              onClick={() => addSlot(zone)}
            >
              <Plus className="h-3.5 w-3.5" />
              {t('routine.addSlot')}
            </Button>
          </div>

          {slotsForZone(zone).length === 0 ? (
            <p className="mt-2 text-[11px] text-[var(--nora-text-muted)]">
              {t('routine.noSlots')}
            </p>
          ) : (
            <ul className="mt-2 space-y-2">
              {slotsForZone(zone).map((slot) => (
                <li
                  key={slot.id}
                  className="rounded-lg border border-[var(--nora-border-subtle)] bg-[var(--nora-surface)] p-2.5"
                >
                  <div className="mb-2 flex flex-wrap gap-1">
                    {WEEKDAY_IDS.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(slot.id, day)}
                        className={cn(
                          'rounded-md px-1.5 py-0.5 text-[10px] font-medium transition-colors',
                          slot.days.includes(day)
                            ? 'bg-sky-400/20 text-sky-700 dark:text-sky-200'
                            : 'bg-[var(--nora-surface-veil)] text-[var(--nora-text-muted)]',
                        )}
                      >
                        {weekdayLabel(day)}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Clock
                      className="h-3.5 w-3.5 shrink-0 text-sky-500"
                      aria-hidden
                    />
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateSlot(slot.id, { start: e.target.value })
                      }
                      className="glass-input h-9 rounded-lg px-2 text-xs"
                      aria-label={t('routine.start')}
                    />
                    <span className="text-xs text-[var(--nora-text-muted)]">—</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateSlot(slot.id, { end: e.target.value })
                      }
                      className="glass-input h-9 rounded-lg px-2 text-xs"
                      aria-label={t('routine.end')}
                    />
                    <button
                      type="button"
                      onClick={() => removeSlot(slot.id)}
                      className="ml-auto rounded-lg p-1.5 text-[var(--nora-text-muted)] hover:bg-[var(--nora-surface-veil)] hover:text-red-400"
                      aria-label={t('routine.removeSlot')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      <p className="flex items-start gap-1.5 rounded-lg border border-sky-400/25 bg-sky-400/8 px-2.5 py-2 text-[10px] leading-snug text-sky-800 dark:text-sky-200">
        {t('routine.aiNote')}
      </p>
    </div>
  )
}
