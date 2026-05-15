'use client'

'use client'

import { useContext } from 'react'
import { AuthContext } from './auth-context'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен вызываться внутри AuthProvider')
  return ctx
}
