'use client'

import { useEffect, useState } from 'react'

/** Перерисовка при изменении друзей / заявок в localStorage. */
export function useSocialRefresh() {
  const [, setTick] = useState(0)

  useEffect(() => {
    const onChange = () => setTick((t) => t + 1)
    window.addEventListener('nora-social-change', onChange)
    return () => window.removeEventListener('nora-social-change', onChange)
  }, [])

  return setTick
}
