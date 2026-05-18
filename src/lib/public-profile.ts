import {
  getNoraUserProfile,
  listNoraUserProfiles,
} from '@/lib/nora-users'
import type { PublicProfile } from '@/types/public-profile'

export function getPublicProfile(id: string): PublicProfile | null {
  return getNoraUserProfile(id)
}

export function listPublicProfiles(excludeId?: string): PublicProfile[] {
  return listNoraUserProfiles(excludeId)
}
