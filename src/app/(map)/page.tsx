import { Suspense } from 'react'
import MapHubClient from './MapHubClient'

export default function HomeMapPage() {
  return (
    <Suspense fallback={null}>
      <MapHubClient />
    </Suspense>
  )
}
