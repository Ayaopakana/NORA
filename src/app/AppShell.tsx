import { AuthProvider } from '../contexts/AuthProvider'
import AppLayout from '../layouts/AppLayout'

export default function AppShell() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}
