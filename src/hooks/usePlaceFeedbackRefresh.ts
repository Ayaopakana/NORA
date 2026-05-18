'use client'

import { useEffect, useState } from 'react'

export function usePlaceFeedbackRefresh(): number {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onChange = () => setTick((n) => n + 1)
    window.addEventListener('nora-place-feedback-change', onChange)
    return () => window.removeEventListener('nora-place-feedback-change', onChange)
  }, [])

  return tick
}
