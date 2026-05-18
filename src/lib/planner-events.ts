import type { Locale } from '@/i18n/config'
import type { PlannerMood, PlannerRecommendation } from '@/lib/planner-recommendations'

const EVENTS: Record<
  Locale,
  Partial<Record<PlannerMood, PlannerRecommendation[]>>
> = {
  ru: {
    calm: [
      {
        id: 'event-calm-1',
        title: 'Джаз на открытом воздухе',
        place: 'Этнокомплекс «Дордой»',
        address: 'с. Кашка-Суу',
        lng: 74.72,
        lat: 42.88,
        duration: '2 ч',
        budgetTier: 1,
        badge: 'Событие · спокойный вечер',
        mbtiFit: ['INFJ', 'INFP', 'ISFP'],
        venueTags: ['culture'],
      },
    ],
    energy: [
      {
        id: 'event-energy-1',
        title: 'Фуд-маркет выходного дня',
        place: 'Орто-Сай',
        address: 'пр. Чуй',
        lng: 74.61,
        lat: 42.875,
        duration: '1 ч 30 мин',
        budgetTier: 2,
        badge: 'Событие · люди и вкусы',
        mbtiFit: ['ENFP', 'ESFP', 'ENTP'],
        venueTags: ['food'],
      },
    ],
  },
  en: {
    calm: [
      {
        id: 'event-calm-1',
        title: 'Open-air jazz',
        place: 'Dordoi ethno complex',
        address: 'Kashka-Suu',
        lng: 74.72,
        lat: 42.88,
        duration: '2 h',
        budgetTier: 1,
        badge: 'Event · calm evening',
        mbtiFit: ['INFJ', 'INFP', 'ISFP'],
        venueTags: ['culture'],
      },
    ],
    energy: [
      {
        id: 'event-energy-1',
        title: 'Weekend food market',
        place: 'Orto-Sai',
        address: 'Chuy Ave',
        lng: 74.61,
        lat: 42.875,
        duration: '1 h 30 min',
        budgetTier: 2,
        badge: 'Event · people and flavors',
        mbtiFit: ['ENFP', 'ESFP', 'ENTP'],
        venueTags: ['food'],
      },
    ],
  },
  ky: {
    calm: [
      {
        id: 'event-calm-1',
        title: 'Ачык абадагы джаз',
        place: '«Дордой» этнокомплекс',
        address: 'Кашка-Суу',
        lng: 74.72,
        lat: 42.88,
        duration: '2 саат',
        budgetTier: 1,
        badge: 'Иш-чара · тынч кеч',
        mbtiFit: ['INFJ', 'INFP', 'ISFP'],
        venueTags: ['culture'],
      },
    ],
    energy: [
      {
        id: 'event-energy-1',
        title: 'Дем алыш күнү фуд-маркет',
        place: 'Орто-Сай',
        address: 'Чүй проспекти',
        lng: 74.61,
        lat: 42.875,
        duration: '1 саат 30 мүн',
        budgetTier: 2,
        badge: 'Иш-чара · адамдар жана даамдар',
        mbtiFit: ['ENFP', 'ESFP', 'ENTP'],
        venueTags: ['food'],
      },
    ],
  },
  ko: {
    calm: [
      {
        id: 'event-calm-1',
        title: '야외 재즈',
        place: '도르doi 에스닉 단지',
        address: '카슈카수',
        lng: 74.72,
        lat: 42.88,
        duration: '2시간',
        budgetTier: 1,
        badge: '이벤트 · 차분한 저녁',
        mbtiFit: ['INFJ', 'INFP', 'ISFP'],
        venueTags: ['culture'],
      },
    ],
    energy: [
      {
        id: 'event-energy-1',
        title: '주말 푸드 마켓',
        place: '오르토사이',
        address: '추이 대로',
        lng: 74.61,
        lat: 42.875,
        duration: '1시간 30분',
        budgetTier: 2,
        badge: '이벤트 · 사람과 맛',
        mbtiFit: ['ENFP', 'ESFP', 'ENTP'],
        venueTags: ['food'],
      },
    ],
  },
}

export function getPlannerEvents(
  mood: PlannerMood,
  locale: Locale,
): PlannerRecommendation[] {
  return EVENTS[locale]?.[mood] ?? EVENTS.ru[mood] ?? []
}
