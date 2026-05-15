import { cn } from '@/lib/utils'

type PageShellProps = {
  children: React.ReactNode
  className?: string
}

/** Отступ под верхний toggle и нижнюю навигацию. */
export function PageShell({ children, className }: PageShellProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-lg px-4 pb-nav-only pt-[max(4.5rem,env(safe-area-inset-top))]',
        className,
      )}
    >
      {children}
    </div>
  )
}
