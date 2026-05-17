import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import { localizePlannerPool } from '@/i18n/planner-text'
import type { MbtiId } from '@/lib/mbti'
import { dailyBudgetLabel, normalizeBudgetIndex } from '@/lib/daily-budget'
import type { MoodPreset } from '@/types/user'

export type PlannerMood = Exclude<MoodPreset, ''>

export type PlannerRecommendation = {
  id: string
  title: string
  place: string
  address: string
  lng: number
  lat: number
  duration: string
  /** 0 = эконом, 3 = без ограничений */
  budgetTier: number
  badge: string
  mbtiFit?: MbtiId[]
}

export const PLANNER_MOOD_META: Record<
  PlannerMood,
  { emoji: string; label: string; hint: string }
> = {
  calm: {
    emoji: '🧘',
    label: 'В норме',
    hint: 'Спокойный ритм без перегруза',
  },
  energy: {
    emoji: '🔋',
    label: 'Энергична',
    hint: 'Движение, люди и новые впечатления',
  },
  tired: {
    emoji: '😫',
    label: 'Устала',
    hint: 'Коротко, уютно и с минимумом решений',
  },
  anxious: {
    emoji: '😰',
    label: 'Тревожно',
    hint: 'Тихие места, предсказуемость и опора',
  },
}

/** Рекомендации по настроению — демо-точки в Бишкеке. */
export const PLANNER_BY_MOOD: Record<PlannerMood, PlannerRecommendation[]> = {
  calm: [
    {
      id: 'calm-1',
      title: 'Тихий кофе и чтение',
      place: 'Sierra Coffee',
      address: 'ул. Киевская, 107',
      lng: 74.6142,
      lat: 42.8708,
      duration: '1 ч 10 мин',
      budgetTier: 1,
      badge: 'Мягкий темп — хорошо для восстановления фокуса',
      mbtiFit: ['INFP', 'INFJ', 'ISFP'],
    },
    {
      id: 'calm-2',
      title: 'Прогулка в тени',
      place: 'Парк «Дубовый»',
      address: 'бул. Эркиндик',
      lng: 74.6038,
      lat: 42.8735,
      duration: '50 мин',
      budgetTier: 0,
      badge: 'Ровный маршрут и открытое пространство',
      mbtiFit: ['ISTJ', 'ISFJ', 'INTJ'],
    },
    {
      id: 'calm-3',
      title: 'Книги и чай',
      place: 'Kitap.kg Store',
      address: 'пр. Чуй, 124',
      lng: 74.6195,
      lat: 42.8749,
      duration: '45 мин',
      budgetTier: 1,
      badge: 'Тишина и привычный сценарий дня',
      mbtiFit: ['INTP', 'INFJ'],
    },
    {
      id: 'calm-4',
      title: 'Закат у фонтана',
      place: 'Площадь «Ала-Тоо»',
      address: 'пр. Чуй',
      lng: 74.6034,
      lat: 42.8775,
      duration: '40 мин',
      budgetTier: 0,
      badge: 'Бесплатная прогулка в центре',
      mbtiFit: ['ISFP', 'INFJ'],
    },
  ],
  energy: [
    {
      id: 'energy-1',
      title: 'Рынок и вкусы',
      place: 'Ошский базар',
      address: 'ул. Айни, 14',
      lng: 74.5692,
      lat: 42.8741,
      duration: '1 ч 15 мин',
      budgetTier: 1,
      badge: 'Живые впечатления и лёгкий драйв',
      mbtiFit: ['ENFP', 'ESFP', 'ENTP'],
    },
    {
      id: 'energy-2',
      title: 'Центр и огни',
      place: 'Площадь «Ала-Тоо»',
      address: 'пр. Чуй',
      lng: 74.6034,
      lat: 42.8775,
      duration: '55 мин',
      budgetTier: 0,
      badge: 'Много пространства — заряд бодрости',
      mbtiFit: ['ENTJ', 'ESTP', 'ENFJ'],
    },
    {
      id: 'energy-3',
      title: 'Парк Победы',
      place: 'Парк «Победы»',
      address: 'ул. Токтогула',
      lng: 74.5436,
      lat: 42.8821,
      duration: '1 ч 20 мин',
      budgetTier: 0,
      badge: 'Длинная прогулка с видами на город',
      mbtiFit: ['ESTJ', 'ESFJ'],
    },
    {
      id: 'energy-4',
      title: 'Ужин с видом',
      place: 'Supara Ethno-Complex',
      address: 'ул. Карасаева, 1',
      lng: 74.6285,
      lat: 42.8558,
      duration: '1 ч 30 мин',
      budgetTier: 3,
      badge: 'Яркий вечер — если бюджет позволяет',
      mbtiFit: ['ENFJ', 'ENTJ'],
    },
  ],
  tired: [
    {
      id: 'tired-1',
      title: 'Тёплый напиток рядом',
      place: 'Coffee 3.0',
      address: 'ул. Токтогула, 87',
      lng: 74.5856,
      lat: 42.8768,
      duration: '35 мин',
      budgetTier: 0,
      badge: 'Близко, без лишних переходов',
      mbtiFit: ['ISFP', 'INFP', 'ISFJ'],
    },
    {
      id: 'tired-2',
      title: 'Короткая прогулка',
      place: 'Бульвар Эркиндик',
      address: 'бул. Эркиндик',
      lng: 74.6152,
      lat: 42.8695,
      duration: '30 мин',
      budgetTier: 0,
      badge: 'Можно остановиться, когда устанете',
      mbtiFit: ['ISTP', 'INFJ'],
    },
    {
      id: 'tired-3',
      title: 'Уютный обед',
      place: 'Faiza',
      address: 'ул. Жибек-Жолу, 555',
      lng: 74.5698,
      lat: 42.8812,
      duration: '50 мин',
      budgetTier: 1,
      badge: 'Спокойная еда — меньше решений',
      mbtiFit: ['ISFJ', 'ISTJ'],
    },
    {
      id: 'tired-4',
      title: 'Чайная пауза',
      place: 'Чайхана «Бухара»',
      address: 'ул. Ибраимова, 103',
      lng: 74.6124,
      lat: 42.8824,
      duration: '45 мин',
      budgetTier: 2,
      badge: 'Сесть и отдохнуть без спешки',
      mbtiFit: ['ISFJ', 'INFJ'],
    },
  ],
  anxious: [
    {
      id: 'anxious-1',
      title: 'Зелёный оазис',
      place: 'Парк им. Панфилова',
      address: 'ул. Токтогула',
      lng: 74.5882,
      lat: 42.8863,
      duration: '55 мин',
      budgetTier: 0,
      badge: 'Предсказуемая тропа и мало шума',
      mbtiFit: ['INFJ', 'INFP', 'ISFJ'],
    },
    {
      id: 'anxious-2',
      title: 'Тихая аллея',
      place: 'Сквер у филармонии',
      address: 'пр. Чуй, 245',
      lng: 74.6021,
      lat: 42.8819,
      duration: '40 мин',
      budgetTier: 0,
      badge: 'Уютный дворик в центре',
      mbtiFit: ['INTJ', 'ISTJ', 'INTP'],
    },
    {
      id: 'anxious-3',
      title: 'Ботанический сад',
      place: 'Ботсад КР',
      address: 'ул. Коенкозова',
      lng: 74.5512,
      lat: 42.8895,
      duration: '1 ч',
      budgetTier: 1,
      badge: 'Монотонное движение успокаивает',
      mbtiFit: ['ISFP', 'INFJ'],
    },
    {
      id: 'anxious-4',
      title: 'Спокойное кафе',
      place: 'Ants Cafe',
      address: 'ул. Ахунбаева, 127',
      lng: 74.6318,
      lat: 42.8672,
      duration: '50 мин',
      budgetTier: 2,
      badge: 'Мало людей в межсезонье',
      mbtiFit: ['INFP', 'INTP'],
    },
  ],
}

export function findPlannerRecommendation(
  id: string,
  locale: Locale = 'ru',
): PlannerRecommendation | null {
  const pools = localizePlannerPool(PLANNER_BY_MOOD, locale)
  for (const mood of Object.keys(pools) as PlannerMood[]) {
    const hit = pools[mood].find((r) => r.id === id)
    if (hit) return hit
  }
  return null
}

export function normalizePlannerMood(m: MoodPreset | undefined): PlannerMood {
  if (m === 'energy' || m === 'tired' || m === 'anxious') return m
  return 'calm'
}

export function getPlannerMoodMeta(locale: Locale) {
  const m = getMessages(locale).moods
  return {
    calm: { emoji: '🧘', label: m.calm.label, hint: m.calm.hint },
    energy: { emoji: '🔋', label: m.energy.label, hint: m.energy.hint },
    tired: { emoji: '😫', label: m.tired.label, hint: m.tired.hint },
    anxious: { emoji: '😰', label: m.anxious.label, hint: m.anxious.hint },
  } satisfies Record<PlannerMood, { emoji: string; label: string; hint: string }>
}

/** Места, которые помещаются в выбранный дневной бюджет. */
export function getRecommendationsForMoodAndBudget(
  mood: PlannerMood,
  budgetIndex: number,
  locale: Locale = 'ru',
): PlannerRecommendation[] {
  const budget = normalizeBudgetIndex(budgetIndex)
  const pools = localizePlannerPool(PLANNER_BY_MOOD, locale)
  const pool = pools[mood]

  const affordable = pool.filter((r) => r.budgetTier <= budget)
  const sorted = [...affordable].sort((a, b) => b.budgetTier - a.budgetTier)

  if (sorted.length >= 4) return sorted.slice(0, 4)

  const extra = pool
    .filter((r) => r.budgetTier > budget && !sorted.some((s) => s.id === r.id))
    .sort((a, b) => a.budgetTier - b.budgetTier)

  return [...sorted, ...extra].slice(0, 4)
}

export function budgetLabelForTier(tier: number, locale: Locale = 'ru'): string {
  return dailyBudgetLabel(tier, locale)
}

export function fitsUserBudget(
  rec: PlannerRecommendation,
  budgetIndex: number,
): boolean {
  return rec.budgetTier <= normalizeBudgetIndex(budgetIndex)
}

export function recommendationInsight(
  rec: PlannerRecommendation,
  mbti: MbtiId | '',
  budgetIndex: number,
  locale: Locale = 'ru',
): string {
  const budget = getMessages(locale).budget
  const parts: string[] = []

  if (!fitsUserBudget(rec, budgetIndex)) {
    parts.push(budget.aboveBudget)
  } else {
    parts.push(rec.badge)
  }

  if (mbti && rec.mbtiFit?.includes(mbti)) {
    parts.push(budget.idealMbti.replace('{mbti}', mbti))
  } else if (mbti) {
    parts.push(budget.typeMbti.replace('{mbti}', mbti))
  }

  return parts.join(' · ')
}
