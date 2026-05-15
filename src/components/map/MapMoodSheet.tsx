'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect } from 'react'
import { MbtiHelpDialog } from '@/components/MbtiHelpDialog'
import { cn } from '@/lib/utils'
import type { MoodPreset } from '@/types/user'
import type { MbtiId } from '@/lib/mbti'

export const MAP_MOODS: {
  id: MoodPreset
  emoji: string
  label: string
  ring: string
}[] = [
  {
    id: 'calm',
    emoji: '🧘',
    label: 'В норме',
    ring: 'ring-sky-400/50 shadow-[0_0_20px_rgba(56,189,248,0.35)]',
  },
  {
    id: 'energy',
    emoji: '🔋',
    label: 'Энергична',
    ring: 'ring-cyan-300/55 shadow-[0_0_22px_rgba(34,211,238,0.4)]',
  },
  {
    id: 'tired',
    emoji: '😫',
    label: 'Устала',
    ring: 'ring-blue-500/45 shadow-[0_0_18px_rgba(59,130,246,0.35)]',
  },
  {
    id: 'anxious',
    emoji: '😰',
    label: 'Тревожно',
    ring: 'ring-indigo-400/45 shadow-[0_0_20px_rgba(129,140,248,0.35)]',
  },
]

type MapMoodSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mood: MoodPreset
  onMoodChange: (mood: MoodPreset) => void
  mbti: MbtiId | ''
}

export function MapMoodSheet({
  open,
  onOpenChange,
  mood,
  onMoodChange,
  mbti,
}: MapMoodSheetProps) {
  const activeMood = MAP_MOODS.find((m) => m.id === mood) ?? MAP_MOODS[0]

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          open
            ? 'Закрыть меню состояния'
            : `Состояние: ${activeMood.label}. Открыть меню`
        }
        className={cn(
          'pointer-events-auto fixed z-20 flex flex-col items-center justify-center gap-0.5 rounded-glass-lg glass-panel shadow-glass transition-all duration-300 hover:shadow-glass-lg active:scale-95',
          'left-[max(0.75rem,env(safe-area-inset-left))] top-[max(5.5rem,calc(env(safe-area-inset-top)+4.5rem))]',
          'h-14 w-14',
          open && 'border-sky-400/50 bg-sky-400/10',
        )}
      >
        <span className="text-2xl leading-none" aria-hidden>
          {activeMood.emoji}
        </span>
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 text-sky-400/80 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.button
              type="button"
              aria-label="Закрыть"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-auto fixed inset-0 z-30 bg-[color-mix(in_srgb,var(--nora-bg-base)_40%,transparent)] backdrop-blur-md"
              onClick={() => onOpenChange(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="map-mood-title"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 34 }}
              className={cn(
                'pointer-events-auto fixed z-40 flex w-[min(88vw,320px)] flex-col',
                'left-0 top-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))]',
                'border-r border-[var(--nora-border-subtle)] glass-panel-strong shadow-glass-lg',
              )}
            >
              <header className="flex items-start justify-between gap-2 border-b border-[var(--nora-border)] px-4 py-4">
                <div>
                  <p
                    id="map-mood-title"
                    className="text-xs font-semibold uppercase tracking-wide text-sky-400"
                  >
                    Состояние
                  </p>
                  <p className="mt-1 text-sm text-[var(--nora-text-muted)]">
                    Как вы себя чувствуете сейчас?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-lg p-1.5 text-[var(--nora-text-muted)] hover:bg-white/5 hover:text-[var(--nora-text)]"
                  aria-label="Закрыть"
                >
                  <X className="h-5 w-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                <ul className="space-y-2">
                  {MAP_MOODS.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => onMoodChange(m.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                          mood === m.id
                            ? cn(
                                'border-sky-400/60 bg-sky-400/12 ring-2',
                                m.ring,
                              )
                            : 'border-[var(--nora-border)] bg-[var(--nora-surface)]/40 hover:border-sky-400/30',
                        )}
                      >
                        <span className="text-2xl" aria-hidden>
                          {m.emoji}
                        </span>
                        <span className="text-sm font-medium text-[var(--nora-text)]">
                          {m.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                <section className="mt-5 rounded-glass glass-chip p-3">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      className="h-4 w-4 shrink-0 text-sky-400"
                      aria-hidden
                    />
                    <p className="text-sm font-medium text-[var(--nora-text)]">
                      MBTI
                    </p>
                  </div>
                  {mbti ? (
                    <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
                      Ваш тип:{' '}
                      <span className="font-semibold text-sky-300">{mbti}</span>
                      .{' '}
                      <Link
                        href="/passport"
                        className="text-sky-400 hover:underline"
                        onClick={() => onOpenChange(false)}
                      >
                        Изменить в паспорте
                      </Link>
                    </p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs leading-relaxed text-[var(--nora-text-muted)]">
                        Укажите тип в паспорте — NORA точнее подберёт маршруты и
                        подсказки.
                      </p>
                      <MbtiHelpDialog triggerClassName="text-sm" />
                    </div>
                  )}
                </section>
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
