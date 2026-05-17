'use client'

import { useEffect } from 'react'
import { useI18n } from '@/hooks/useI18n'

export function HtmlLangSync() {
  const { locale, ready } = useI18n()

  useEffect(() => {
    if (!ready) return
    document.documentElement.lang = locale
  }, [locale, ready])

  return null
}
