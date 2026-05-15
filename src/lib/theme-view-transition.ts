import { flushSync } from 'react-dom'

export type NoraUiTheme = 'light' | 'dark'

/** Синхронно, как в next-themes с attribute="class" (light / dark). */
export function applyThemeClassSync(theme: NoraUiTheme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(theme)
  root.style.colorScheme = theme
}

export function transitionTheme(
  next: NoraUiTheme,
  setTheme: (theme: string) => void,
) {
  const run = () => {
    applyThemeClassSync(next)
    flushSync(() => setTheme(next))
  }

  if (typeof document === 'undefined') return

  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduced) {
    run()
    return
  }

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> }
  }

  if (typeof doc.startViewTransition === 'function') {
    doc.startViewTransition(run)
  } else {
    run()
  }
}
