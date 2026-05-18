import {
  getNoraUserProfile,
  getNoraUserProfileSync,
  listNoraUserProfiles,
} from '@/lib/nora-users'
import type { PublicProfile } from '@/types/public-profile'

export async function getPublicProfile(
  id: string,
): Promise<PublicProfile | null> {
  return getNoraUserProfile(id)
}

/** Синхронно — только мок / кэш до загрузки API. */
export function getPublicProfileSync(id: string): PublicProfile | null {
  return getNoraUserProfileSync(id)
}

export async function listPublicProfiles(
  excludeId?: string,
  query = '',
): Promise<PublicProfile[]> {
  return listNoraUserProfiles(excludeId, query)
}
