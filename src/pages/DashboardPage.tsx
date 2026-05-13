import { AvatarFace } from '../components/AvatarFace'
import { NoraMap } from '../components/NoraMap'
import { useAuth } from '../contexts/useAuth'
import { displayName } from '../types/user'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const shown = displayName(user)

  return (
    <section className="dashboard">
      <div className="dashboard-intro">
        <p className="dashboard-acronym" lang="en">
          Navigation Organized Route Assistant
        </p>
        <div className="dashboard-user-block">
          <AvatarFace
            src={user.avatarUrl}
            displayName={shown}
            size={64}
            className="dashboard-avatar"
          />
          <div className="dashboard-names">
            <h1 className="dashboard-title">Ваш навигатор</h1>
            <p className="dashboard-lead">
              Здравствуйте, <strong>{shown}</strong>
              {user.name !== shown ? (
                <span className="dashboard-name-full">
                  {' '}
                  ({user.name})
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <p className="dashboard-hint">
          Карта ниже — живое окружение рядом с вами. Пока браузер не отдал
          координаты, центр по умолчанию — Москва; разрешите геолокацию, чтобы
          открыть ваш район.
        </p>
      </div>

      <div className="dashboard-map-wrap">
        <h2 className="dashboard-map-heading">Карта рядом с вами</h2>
        <p className="dashboard-map-sub">
          Данные о местах — 2ГИС (нужен ключ API). Полноценная тёмная карта — это
          отдельный стиль в{' '}
          <a
            href="https://styles.2gis.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            редакторе 2ГИС
          </a>
          ; его ID укажите в <code>VITE_2GIS_MAP_STYLE</code>. Без ID используется
          ночная инверсия стандартного дневного стиля.
        </p>
        <NoraMap />
      </div>
    </section>
  )
}
