import { cn } from '@/lib/utils'

type PageShellProps = {
  children: React.ReactNode
  className?: string
}

/** Отступ под профиль сверху и островки снизу. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg px-4 pb-island-dock pt-[max(4.25rem,env(safe-area-inset-top))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
