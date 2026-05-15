import { ThemeToggle } from '@/components/ThemeToggle'
import { RegisterWizard } from './RegisterWizard'

export default function RegisterPage() {
  return (
    <>
      <div className="pointer-events-none fixed right-3 top-0 z-50 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <RegisterWizard />
    </>
  )
}
