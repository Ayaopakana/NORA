import type { MoodPreset } from '@/types/user'

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
    ring: 'ring-sky-400/50 shadow-[0_0_16px_rgba(56,189,248,0.3)]',
  },
  {
    id: 'energy',
    emoji: '🔋',
    label: 'Энергична',
    ring: 'ring-cyan-300/55 shadow-[0_0_18px_rgba(34,211,238,0.35)]',
  },
  {
    id: 'tired',
    emoji: '😫',
    label: 'Устала',
    ring: 'ring-blue-500/45 shadow-[0_0_14px_rgba(59,130,246,0.3)]',
  },
  {
    id: 'anxious',
    emoji: '😰',
    label: 'Тревожно',
    ring: 'ring-indigo-400/45 shadow-[0_0_16px_rgba(129,140,248,0.3)]',
  },
]
