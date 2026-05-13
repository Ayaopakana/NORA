import { NavLink, Outlet } from 'react-router-dom'
import { UserAvatar } from '../components/UserAvatar'
import { useAuth } from '../contexts/useAuth'
import './AppLayout.css'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/" className="app-brand" end title="Navigation Organized Route Assistant">
          NORA
        </NavLink>
        <nav className="app-nav" aria-label="Основное меню">
          <NavLink to="/" className="app-nav-link" end>
            Главная
          </NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard" className="app-nav-link">
                Навигатор
              </NavLink>
              <div className="app-user">
                <UserAvatar />
              </div>
              <button type="button" className="app-nav-btn" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="app-nav-link">
                Вход
              </NavLink>
              <NavLink to="/register" className="app-nav-link app-nav-cta">
                Регистрация
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="app-footer">
        <span>
          NORA — ваш персональный навигатор по городу. Интерфейс готов к API.
        </span>
      </footer>
    </div>
  )
}
