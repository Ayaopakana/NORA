'use client'

import { useParams } from 'next/navigation'
import { PublicProfileView } from '@/components/profile/PublicProfileView'
import { RequireAuth } from '@/components/RequireAuth'

export default function UserProfilePage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''

  return (
    <RequireAuth>
      <PublicProfileView peerId={id} />
    </RequireAuth>
  )
}
