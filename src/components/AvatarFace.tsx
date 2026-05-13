import { initialsFromDisplay } from '../types/user'
import './AvatarFace.css'

type AvatarFaceProps = {
  src: string | null
  displayName: string
  size?: number
  className?: string
}

export function AvatarFace({
  src,
  displayName,
  size = 40,
  className = '',
}: AvatarFaceProps) {
  const label = displayName.trim() || 'Профиль'
  const initials = initialsFromDisplay(label)

  return (
    <span
      className={`avatar-face ${className}`.trim()}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      role="img"
      aria-label={label}
    >
      {src ? (
        <img src={src} alt="" width={size} height={size} />
      ) : (
        <span className="avatar-face-fallback" aria-hidden="true">
          {initials}
        </span>
      )}
    </span>
  )
}
