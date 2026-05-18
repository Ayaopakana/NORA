'use client'

import { MotionConfig } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthProvider'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { HtmlLangSync } from '@/components/HtmlLangSync'
import { defaultMotionTransition } from '@/lib/motion'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <MotionConfig reducedMotion="user" transition={defaultMotionTransition}>
        <LocaleProvider>
          <HtmlLangSync />
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </MotionConfig>
    </ThemeProvider>
  )
}
