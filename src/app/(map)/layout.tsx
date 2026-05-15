import { BottomNav } from '@/components/BottomNav'
import { MapShellTopBar } from '@/components/MapShellTopBar'

export default function MapShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-transparent text-[var(--nora-text)]">
      <MapShellTopBar />
      <main className="relative z-0 min-h-0 flex-1 pb-nav-only">{children}</main>
      <BottomNav />
    </div>
  )
}
