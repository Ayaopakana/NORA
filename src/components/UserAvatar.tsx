import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { displayName } from '../types/user'
import { AvatarFace } from './AvatarFace'
import './UserAvatar.css'

export function UserAvatar() {
  const { user } = useAuth()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [focusInside, setFocusInside] = useState(false)

  useEffect(() => {
    const root = wrapRef.current
    if (!root) return
    const sync = () =>
      requestAnimationFrame(() => {
        setFocusInside(root.matches(':focus-within'))
      })
    root.addEventListener('focusin', sync)
    root.addEventListener('focusout', sync)
    return () => {
      root.removeEventListener('focusin', sync)
      root.removeEventListener('focusout', sync)
    }
  }, [])

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setPinned(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [])

  if (!user) return null

  const nameShown = displayName(user)
  const menuOpen = hover || pinned || focusInside

  return (
    <div
      ref={wrapRef}
      className={`user-avatar-menu${menuOpen ? ' is-open' : ''}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <button
        type="button"
        className="user-avatar-trigger"
        aria-label={`Меню профиля: ${nameShown}`}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setPinned((p) => !p)}
      >
        <AvatarFace
          src={user.avatarUrl}
          displayName={nameShown}
          size={34}
        />
      </button>

      <div
        className="user-avatar-dropdown"
        role="menu"
        aria-label="Меню аккаунта"
      >
        <div className="user-avatar-dropdown-inner">
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `user-avatar-menu-item${isActive ? ' active' : ''}`
            }
            role="menuitem"
            end
            onClick={() => setPinned(false)}
          >
            Профиль
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `user-avatar-menu-item${isActive ? ' active' : ''}`
            }
            role="menuitem"
            onClick={() => setPinned(false)}
          >
            Настройки
          </NavLink>
        </div>
      </div>
    </div>
  )
}
