import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { AvatarFace } from '../components/AvatarFace'
import { readFileAsDataURL, validateAvatarFile } from '../lib/readImage'
import './forms.css'
import './RegisterPage.css'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const previewLabel =
    nickname.trim() || name.trim() || 'Вы'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Пароли не совпадают')
      return
    }
    if (password.length < 4) {
      setError('Пароль не короче 4 символов')
      return
    }
    if (nickname.trim().length < 2) {
      setError('Никнейм не короче 2 символов')
      return
    }
    setPending(true)
    try {
      await register(name, nickname, email, password, avatarDataUrl)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось зарегистрироваться',
      )
    } finally {
      setPending(false)
    }
  }

  function onPickAvatar() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) return
      const err = validateAvatarFile(file)
      if (err) {
        setAvatarError(err)
        return
      }
      setAvatarError(null)
      readFileAsDataURL(file)
        .then(setAvatarDataUrl)
        .catch(() => setAvatarError('Не удалось прочитать файл'))
    })
    input.click()
  }

  return (
    <section className="form-page">
      <h1>Регистрация</h1>
      <p className="form-lead">
        Создайте аккаунт NORA. Данные пока только в браузере — после API перейдём
        на серверную авторизацию.
      </p>

      <form className="form-card" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="reg-name">Имя</label>
          <input
            id="reg-name"
            name="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>
        <div className="form-field">
          <label htmlFor="reg-nickname">Никнейм</label>
          <input
            id="reg-nickname"
            name="nickname"
            type="text"
            autoComplete="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            required
            minLength={2}
            maxLength={40}
            placeholder="Как вас показывать в приложении"
          />
        </div>

        <div className="reg-avatar-block">
          <span className="reg-avatar-label" id="reg-avatar-label">
            Фото профиля
          </span>
          <div className="reg-avatar-row">
            <AvatarFace
              src={avatarDataUrl}
              displayName={previewLabel}
              size={72}
            />
            <div className="reg-avatar-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={onPickAvatar}
              >
                {avatarDataUrl ? 'Другое фото' : 'Выбрать фото'}
              </button>
              {avatarDataUrl ? (
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => {
                    setAvatarDataUrl(null)
                    setAvatarError(null)
                  }}
                >
                  Убрать фото
                </button>
              ) : null}
            </div>
          </div>
          <p className="reg-avatar-hint" id="reg-avatar-hint">
            Необязательно. JPEG, PNG, WebP до 2 МБ.
          </p>
          {avatarError ? (
            <p className="form-error" role="alert">
              {avatarError}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="reg-email">Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="reg-password">Пароль</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={4}
          />
        </div>
        <div className="form-field">
          <label htmlFor="reg-confirm">Повтор пароля</label>
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={4}
          />
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? 'Создание…' : 'Создать аккаунт'}
          </button>
        </div>
        <p className="form-alt">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </form>
    </section>
  )
}
