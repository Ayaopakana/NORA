/** Варианты для демо; позже заменятся данными с сервера */

export type BudgetComfort = '' | 'economy' | 'moderate' | 'flexible'

export type PsychotypeId =
  | ''
  | 'observer'
  | 'momentum'
  | 'adaptive'
  | 'connector'

export const PSYCHOTYPE_OPTIONS: {
  id: PsychotypeId
  label: string
  hint: string
}[] = [
  {
    id: '',
    label: 'Не выбрано',
    hint: 'Уточните позже — подбор всё равно будет учитывать настроение и бюджет.',
  },
  {
    id: 'observer',
    label: 'Спокойный наблюдатель',
    hint:
      'Цените предсказуемость, глубину и мало шума — NORA подберёт спокойные места и форматы.',
  },
  {
    id: 'momentum',
    label: 'Энергия событий',
    hint:
      'Настроение от новых локаций, афиши и людей — акцент на открытия и впечатления.',
  },
  {
    id: 'adaptive',
    label: 'Гибкий ритм',
    hint:
      'От дня зависит и темп, и контакты — сервис опирается на текущее состояние и бюджет.',
  },
  {
    id: 'connector',
    label: 'Связь и культуры',
    hint:
      'Важны люди, взаимопомощь и точки соприкосновения с разными культурами.',
  },
]

export const BUDGET_OPTIONS: {
  id: BudgetComfort
  label: string
  hint: string
}[] = [
  {
    id: '',
    label: 'Не указано',
    hint: '',
  },
  {
    id: 'economy',
    label: 'Экономно',
    hint: 'Приоритет бесплатных форматов, скидок и самодостаточных прогулок.',
  },
  {
    id: 'moderate',
    label: 'Умеренно',
    hint: 'Готовность тратить на отдельные активности и места «по настроению».',
  },
  {
    id: 'flexible',
    label: 'Гибкий бюджет',
    hint: 'Комфорт и уникальный опыт важнее жёсткого лимита.',
  },
]

export function isBudgetComfort(v: unknown): v is BudgetComfort {
  return (
    v === '' ||
    v === 'economy' ||
    v === 'moderate' ||
    v === 'flexible'
  )
}

export function isPsychotypeId(v: unknown): v is PsychotypeId {
  return (
    v === '' ||
    v === 'observer' ||
    v === 'momentum' ||
    v === 'adaptive' ||
    v === 'connector'
  )
}
