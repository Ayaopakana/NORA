'use client'

import { useI18n } from '@/hooks/useI18n'

export function MapLoadingFallback() {
  const { t } = useI18n()

  return (
    <div className="fixed inset-0 z-0 flex flex-col items-center justify-center gap-2 bg-[#020617] text-slate-300">
      <span className="text-sm font-medium text-sky-400">NORA</span>
      <p className="text-xs text-slate-500">{t('map.loading')}</p>
    </div>
  )
}
