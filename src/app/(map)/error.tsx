'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MapSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-[var(--nora-bg)] px-6 text-center text-[var(--nora-text)]">
      <p className="text-sm font-medium text-sky-400">Карта</p>
      <h1 className="text-lg font-semibold">Не удалось загрузить карту</h1>
      <p className="max-w-md text-sm text-[var(--nora-text-muted)]">
        Проверьте, что выполнен <code className="rounded bg-slate-800/80 px-1.5 py-0.5 text-sky-200">npm install</code> и
        пакет <code className="rounded px-1.5">maplibre-gl</code> установлен. Перезапустите{' '}
        <code className="rounded px-1.5">npm run dev</code>.
      </p>
      <p className="max-w-md text-xs text-[var(--nora-text-muted)] break-all">
        {error.message}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={() => reset()}>
          Повторить
        </Button>
        <Button type="button" variant="secondary" asChild>
          <Link href="/planner">Планер</Link>
        </Button>
      </div>
    </div>
  )
}
