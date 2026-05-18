export type AvatarPrivacy = 'open' | 'preview'

export function isAvatarPrivacy(v: unknown): v is AvatarPrivacy {
  return v === 'open' || v === 'preview'
}

export function canOpenProfileAvatar(
  hasUrl: boolean,
  privacy: AvatarPrivacy,
  isOwner: boolean,
): boolean {
  if (!hasUrl) return false
  if (isOwner) return true
  return privacy === 'open'
}
