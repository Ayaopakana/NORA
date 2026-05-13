import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import heroImg from '../assets/hero.png'
import './HomePage.css'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-visual">
          <img
            src={heroImg}
            className="home-hero-img"
            width={170}
            height={179}
            alt=""
          />
        </div>
        <p className="home-acronym" lang="en">
          Navigation Organized Route Assistant
        </p>
        <h1>NORA</h1>
        <p className="home-tagline">
          Адаптивная платформа для тех, кто хочет{' '}
          <strong>мгновенно чувствовать себя комфортно</strong> — в новой стране
          или в родном городе. Мы учитываем вашу личность, настроение и бюджет и
          настраиваем среду под вас.
        </p>
        <p className="home-tagline home-tagline-secondary">
          От поиска людей для взаимопомощи до событий, локаций и заведений на
          интерактивной карте — NORA снимает стресс незнакомой среды и помогает
          находить точки соприкосновения с культурами и обмениваться опытом.
        </p>
        <div className="home-actions">
          {user ? (
            <Link to="/dashboard" className="home-btn home-btn-primary">
              Открыть навигатор
            </Link>
          ) : (
            <>
              <Link to="/register" className="home-btn home-btn-primary">
                Начать с NORA
              </Link>
              <Link to="/login" className="home-btn home-btn-ghost">
                Уже есть аккаунт
              </Link>
            </>
          )}
        </div>
      </section>

      <div className="home-ticks" aria-hidden="true" />

      <section className="home-pillars" aria-labelledby="pillars-heading">
        <h2 id="pillars-heading">Что внутри платформы</h2>
        <ul className="home-pillar-grid">
          <li className="home-pillar-card">
            <h3>Учёт личности и контекста</h3>
            <p>
              Анализ черт личности, текущего настроения и бюджета — чтобы
              рекомендации были про вас, а не про «усреднённого туриста».
            </p>
          </li>
          <li className="home-pillar-card">
            <h3>Карта и места</h3>
            <p>
              Интерактивная карта с подбором актуальных событий, локаций и
              заведений под ваш запрос и состояние.
            </p>
          </li>
          <li className="home-pillar-card">
            <h3>Люди и взаимопомощь</h3>
            <p>
              Поиск людей для поддержки, совместного досуга и обмена опытом —
              там, где вы сейчас.
            </p>
          </li>
          <li className="home-pillar-card">
            <h3>Спокойствие в новой среде</h3>
            <p>
              Персональный навигатор превращает незнакомую среду в понятное и
              дружелюбное пространство — где бы вы ни находились.
            </p>
          </li>
        </ul>
      </section>

      <section className="home-dev-note" aria-labelledby="dev-note-heading">
        <h2 id="dev-note-heading">Для команды разработки</h2>
        <p>
          Сейчас в интерфейсе — маршруты, демо-авторизация и HTTP-клиент с{' '}
          <code>VITE_API_URL</code>. Подключение аналитики, карты и подборов —
          на стороне API.
        </p>
      </section>
    </>
  )
}
