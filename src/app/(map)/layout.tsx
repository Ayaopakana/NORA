import { BottomNav } from '@/components/BottomNav'
import { MapShellPageTransition } from '@/components/MapShellPageTransition'
import { MapShellTopBar } from '@/components/MapShellTopBar'

export default function MapShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-transparent text-[var(--nora-text)]">
      <MapShellTopBar />
      <main className="relative z-0 flex min-h-0 flex-1 flex-col pb-nav-only">
        <MapShellPageTransition>{children}</MapShellPageTransition>
      </main>
      <BottomNav />
    </div>
  )
}
