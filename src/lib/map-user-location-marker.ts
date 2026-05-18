import { initialsFromDisplay } from '@/types/user'

export type UserLocationAppearance = {
  avatarUrl: string | null
  displayName: string
}

function showInitials(ring: HTMLElement, displayName: string) {
  const span = document.createElement('span')
  span.className = 'nora-user-location-initials'
  span.setAttribute('aria-hidden', 'true')
  span.textContent = initialsFromDisplay(displayName)
  ring.appendChild(span)
}

function fillAvatarRing(ring: HTMLElement, appearance: UserLocationAppearance) {
  ring.replaceChildren()

  if (appearance.avatarUrl) {
    const img = document.createElement('img')
    img.className = 'nora-user-location-avatar-img'
    img.src = appearance.avatarUrl
    img.alt = ''
    img.decoding = 'async'
    img.addEventListener('error', () => {
      ring.replaceChildren()
      showInitials(ring, appearance.displayName)
    })
    ring.appendChild(img)
    return
  }

  showInitials(ring, appearance.displayName)
}

export function appearanceKey(appearance: UserLocationAppearance): string {
  return `${appearance.avatarUrl ?? ''}\0${appearance.displayName}`
}

export function createUserLocationMarkerElement(
  appearance: UserLocationAppearance,
): HTMLElement {
  const root = document.createElement('div')
  root.className = 'nora-user-location'
  root.dataset.appearanceKey = appearanceKey(appearance)

  const pulse = document.createElement('span')
  pulse.className = 'nora-user-location-pulse'
  root.appendChild(pulse)

  const avatar = document.createElement('div')
  avatar.className = 'nora-user-location-avatar'
  fillAvatarRing(avatar, appearance)
  root.appendChild(avatar)

  return root
}

export function updateUserLocationMarkerElement(
  root: HTMLElement,
  appearance: UserLocationAppearance,
) {
  const key = appearanceKey(appearance)
  if (root.dataset.appearanceKey === key) return
  root.dataset.appearanceKey = key

  const ring = root.querySelector('.nora-user-location-avatar')
  if (!ring) return
  fillAvatarRing(ring as HTMLElement, appearance)
}
