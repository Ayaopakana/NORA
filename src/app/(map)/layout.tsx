import { BottomNav } from '@/components/BottomNav'
import { ThemeToggle } from '@/components/ThemeToggle'

export default function MapShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-[var(--nora-bg)] text-[var(--nora-text)]">
      <div className="pointer-events-none fixed right-3 top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <div className="min-h-dvh">{children}</div>
      <BottomNav />
    </div>
  )
}
