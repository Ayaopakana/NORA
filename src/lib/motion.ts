import type { Transition } from 'framer-motion'

/** Плавный ease-out — предсказуемый 60fps на transform/opacity */
export const NORA_EASE = [0.32, 0.72, 0, 1] as const

export const tween = {
  fast: { duration: 0.22, ease: NORA_EASE },
  medium: { duration: 0.3, ease: NORA_EASE },
  enter: { duration: 0.36, ease: NORA_EASE },
  panel: { duration: 0.34, ease: NORA_EASE },
} as const satisfies Record<string, Transition>

/** Высокий damping — без «дрожи», стабильнее на слабых GPU */
export const spring = {
  snappy: { type: 'spring', stiffness: 460, damping: 42, mass: 0.8 },
  smooth: { type: 'spring', stiffness: 340, damping: 38, mass: 0.85 },
  layout: { type: 'spring', stiffness: 520, damping: 44, mass: 0.75 },
  sheet: { type: 'spring', stiffness: 380, damping: 40, mass: 0.9 },
} as const satisfies Record<string, Transition>

export const defaultMotionTransition: Transition = tween.medium

/** Подсказка композитору: анимировать только transform/opacity */
export const motionGpuClass =
  'will-change-[transform,opacity] [transform:translateZ(0)] [backface-visibility:hidden]'
