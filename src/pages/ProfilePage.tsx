import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { AvatarFace } from '../components/AvatarFace'
import {
  BUDGET_OPTIONS,
  PSYCHOTYPE_OPTIONS,
  type PsychotypeId,
} from '../profile/noraProfile'
import { useAuth } from '../contexts/useAuth'
import type { User } from '../types/user'
import { displayName } from '../types/user'
import { readFileAsDataURL, validateAvatarFile } from '../lib/readImage'
import './forms.css'
import './ProfilePage.css'

function profilePersistKey(u: User) {
  return `${u.id}:${u.psychotypeId}:${u.moodNote}:${u.budgetComfort}:${u.cityIntent}`
}

type ProfileEditorProps = {
  user: User
}

function ProfileEditor({ user }: ProfileEditorProps) {
  const { updateProfile } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const formId = useId()
  const [fileError, setFileError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  const [psychotypeId, setPsychotypeId] = useState(user.psychotypeId)
  const [moodNote, setMoodNote] = useState(user.moodNote)
  const [budgetComfort, setBudgetComfort] = useState(user.budgetComfort)
  const [cityIntent, setCityIntent] = useState(user.cityIntent)

  const shown = displayName(user)
  const psychHint =
    PSYCHOTYPE_OPTIONS.find((o) => o.id === psychotypeId)?.hint ?? ''

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const err = validateAvatarFile(file)
    if (err) {
      setFileError(err)
      return
    }
    setFileError(null)
    try {
      const dataUrl = await readFileAsDataURL(file)
      updateProfile({ avatarUrl: dataUrl })
    } catch {
      setFileError('Не удалось прочитать файл')
    }
  }

  function onSaveNoraContext(e: FormEvent) {
    e.preventDefault()
    updateProfile({
      psychotypeId,
      moodNote,
      budgetComfort,
      cityIntent,
    })
    setSavedFlash(true)
    window.setTimeout(() => setSavedFlash(false), 2200)
  }

  return (
    <>
      <header className="profile-header">
        <div className="profile-header-visual">
          <AvatarFace src={user.avatarUrl} displayName={shown} size={96} />
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/*"
            className="profile-file-input"
            aria-label="Выбрать новое фото профиля"
            onChange={onFileChange}
          />
          <div className="profile-avatar-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setFileError(null)
                inputRef.current?.click()
              }}
            >
              Сменить фото
            </button>
            {user.avatarUrl ? (
              <button
                type="button"
                className="btn-text"
                onClick={() => {
                  setFileError(null)
                  updateProfile({ avatarUrl: null })
                }}
              >
                Убрать фото
              </button>
            ) : null}
          </div>
          {fileError ? (
            <p className="form-error profile-file-error" role="alert">
              {fileError}
            </p>
          ) : null}
          <p className="profile-file-hint">JPEG, PNG, WebP до 2 МБ.</p>
        </div>
        <div className="profile-header-text">
          <h1>Профиль</h1>
          <p className="profile-lead">
            NORA учитывает личность, настроение и бюджет, чтобы настроить город
            под вас: люди, события, места и карта — от взаимопомощи до новых
            культур.
          </p>
        </div>
      </header>

      <form
        id={formId}
        className="profile-nora-card"
        onSubmit={onSaveNoraContext}
      >
        <h2 className="profile-section-title">Ваш контекст для подбора</h2>
        <p className="profile-section-intro">
          Эти данные — задел под анализ личности и сервиса рекомендаций (сейчас
          сохраняются локально в браузере).
        </p>

        <div className="form-field">
          <label htmlFor="profile-psychotype">Стиль восприятия</label>
          <select
            id="profile-psychotype"
            value={psychotypeId}
            onChange={(e) =>
              setPsychotypeId(e.target.value as PsychotypeId)
            }
          >
            {PSYCHOTYPE_OPTIONS.map((o) => (
              <option key={o.id || 'none'} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
          {psychHint ? (
            <p className="profile-field-hint" role="note">
              {psychHint}
            </p>
          ) : null}
        </div>

        <div className="form-field">
          <label htmlFor="profile-mood">Настроение и ритм сейчас</label>
          <textarea
            id="profile-mood"
            rows={3}
            placeholder="Например: хочу спокойный вечер / открыт(а) к знакомствам / устал(а) от шума…"
            value={moodNote}
            onChange={(e) => setMoodNote(e.target.value)}
          />
        </div>

        <fieldset className="profile-fieldset">
          <legend className="profile-legend">Комфортный бюджет на активности</legend>
          <div className="profile-radio-grid">
            {BUDGET_OPTIONS.filter((o) => o.id !== '').map((o) => (
              <label key={o.id} className="profile-radio">
                <input
                  type="radio"
                  name="budget"
                  value={o.id}
                  checked={budgetComfort === o.id}
                  onChange={() => setBudgetComfort(o.id)}
                />
                <span className="profile-radio-body">
                  <span className="profile-radio-label">{o.label}</span>
                  {o.hint ? (
                    <span className="profile-radio-hint">{o.hint}</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
          <label className="profile-radio profile-radio-clear">
            <input
              type="radio"
              name="budget"
              value=""
              checked={budgetComfort === ''}
              onChange={() => setBudgetComfort('')}
            />
            <span>Не указывать</span>
          </label>
        </fieldset>

        <div className="form-field">
          <label htmlFor="profile-intent">Что вы ищете в городе</label>
          <textarea
            id="profile-intent"
            rows={4}
            placeholder="Люди для взаимопомощи, языковой обмен, события, спокойные локации, знакомство со средой…"
            value={cityIntent}
            onChange={(e) => setCityIntent(e.target.value)}
          />
        </div>

        <div className="profile-save-row">
          <button type="submit" className="btn-primary">
            Сохранить контекст
          </button>
          {savedFlash ? (
            <span className="profile-saved" role="status">
              Сохранено
            </span>
          ) : null}
        </div>
      </form>

      <div className="profile-account-card">
        <h2 className="profile-section-title">Аккаунт</h2>
        <dl className="profile-fields">
          <div>
            <dt>Никнейм</dt>
            <dd>{shown}</dd>
          </div>
          <div>
            <dt>Имя</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
        </dl>
      </div>
    </>
  )
}

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <section className="profile-page">
      <ProfileEditor key={profilePersistKey(user)} user={user} />
    </section>
  )
}
