'use client'

import { ThemeProvider } from 'next-themes'
import { AuthProvider } from '@/contexts/AuthProvider'
import { LocaleProvider } from '@/contexts/LocaleProvider'
import { HtmlLangSync } from '@/components/HtmlLangSync'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange={false}
    >
      <LocaleProvider>
        <HtmlLangSync />
        <AuthProvider>{children}</AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  )
}
