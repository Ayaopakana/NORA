'use client'

import { useI18n } from '@/hooks/useI18n'

export function I18nLoadingText({ className }: { className?: string }) {
  const { t } = useI18n()
  return <span className={className}>{t('common.loading')}</span>
}
