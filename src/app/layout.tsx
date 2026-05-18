import type { Metadata, Viewport } from 'next'
import { Onest } from 'next/font/google'
import './globals.css'
import './shell.css'
import { AppProviders } from './providers'

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'NORA — Navigation Organized Route Assistant',
    template: '%s · NORA',
  },
  description:
    'Адаптивный навигатор: карта, настроение, маршруты и ментальный паспорт.',
  manifest: '/manifest.json',
  appleWebApp: {
    statusBarStyle: 'black-translucent',
    title: 'NORA',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1a1824' },
    { media: '(prefers-color-scheme: light)', color: '#f8f6f3' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" className={onest.variable} suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
