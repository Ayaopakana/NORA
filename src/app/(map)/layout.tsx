import { IslandDock } from '@/components/IslandDock'
import { MapShellPageTransition } from '@/components/MapShellPageTransition'

export default function MapShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-transparent text-[var(--nora-text)]">
      <main className="relative z-0 flex min-h-0 flex-1 flex-col">
        <MapShellPageTransition>{children}</MapShellPageTransition>
      </main>
      <IslandDock />
    </div>
  )
}
