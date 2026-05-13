import { Link } from 'react-router-dom'
import './NotFoundPage.css'

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <h1>404</h1>
      <p>Страница не найдена.</p>
      <Link to="/" className="not-found-link">
        На главную
      </Link>
    </section>
  )
}
