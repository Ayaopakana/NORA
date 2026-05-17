import type { Locale } from '../config'

export type PartnerCategory = 'coffee' | 'food' | 'coworking' | 'wellness'

export type Partner = {
  id: string
  name: string
  category: PartnerCategory
  tagline: string
  address: string
  perk: string
  discount?: string
  emoji: string
}

type Cat = { id: PartnerCategory | 'all'; label: string }

const CATEGORIES: Record<Locale, Cat[]> = {
  ru: [
    { id: 'all', label: 'Все' },
    { id: 'coffee', label: 'Кофейни' },
    { id: 'food', label: 'Еда' },
    { id: 'coworking', label: 'Коворкинги' },
    { id: 'wellness', label: 'Здоровье' },
  ],
  en: [
    { id: 'all', label: 'All' },
    { id: 'coffee', label: 'Coffee' },
    { id: 'food', label: 'Food' },
    { id: 'coworking', label: 'Coworking' },
    { id: 'wellness', label: 'Wellness' },
  ],
  ky: [
    { id: 'all', label: 'Баары' },
    { id: 'coffee', label: 'Кофейнялар' },
    { id: 'food', label: 'Тамак' },
    { id: 'coworking', label: 'Коворкинг' },
    { id: 'wellness', label: 'Ден соолук' },
  ],
  ko: [
    { id: 'all', label: '전체' },
    { id: 'coffee', label: '카페' },
    { id: 'food', label: '음식' },
    { id: 'coworking', label: '코워킹' },
    { id: 'wellness', label: '웰니스' },
  ],
}

const BASE: Omit<Partner, 'tagline' | 'perk' | 'discount'>[] = [
  {
    id: 'brew-lab',
    name: 'Brew Lab',
    category: 'coffee',
    address: 'ул. Тверская, 12',
    emoji: '☕',
  },
  {
    id: 'northern-beans',
    name: 'Northern Beans',
    category: 'coffee',
    address: 'Патриаршие пруды',
    emoji: '🫘',
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl',
    category: 'food',
    address: 'Китай-город',
    emoji: '🥗',
  },
  {
    id: 'sakura-ramen',
    name: 'Sakura Ramen',
    category: 'food',
    address: 'Арбат, 24',
    emoji: '🍜',
  },
  {
    id: 'focus-hub',
    name: 'Focus Hub',
    category: 'coworking',
    address: 'Белорусская',
    emoji: '💼',
  },
  {
    id: 'calm-space',
    name: 'Calm Space',
    category: 'wellness',
    address: 'Онлайн + студия на Чистых',
    emoji: '🧘',
  },
]

const COPY: Record<
  Locale,
  Record<string, { tagline: string; perk: string; discount?: string }>
> = {
  ru: {
    'brew-lab': {
      tagline: 'Спешелти и тихие столики у окна',
      perk: '−15% на напитки для пользователей NORA',
      discount: '−15%',
    },
    'northern-beans': {
      tagline: 'Фильтр-кофе и десерты без сахара',
      perk: 'Бесплатный сироп к любому латте',
      discount: 'Подарок',
    },
    'green-bowl': {
      tagline: 'Поке и боулы под твоё настроение',
      perk: 'Комбо «В норме» со скидкой 20%',
      discount: '−20%',
    },
    'sakura-ramen': {
      tagline: 'Тёплый бульон после долгого дня',
      perk: 'Десерт моти в подарок от 1 500 ₽',
      discount: 'Подарок',
    },
    'focus-hub': {
      tagline: 'Тихие зоны и переговорки по часам',
      perk: 'Первый час коворкинга бесплатно',
      discount: '1 ч бесплатно',
    },
    'calm-space': {
      tagline: 'Медитация и дыхательные практики',
      perk: 'Пробное занятие для новых пользователей',
      discount: 'Проба',
    },
  },
  en: {
    'brew-lab': {
      tagline: 'Specialty coffee and quiet window seats',
      perk: '15% off drinks for NORA users',
      discount: '−15%',
    },
    'northern-beans': {
      tagline: 'Filter coffee and low-sugar desserts',
      perk: 'Free syrup with any latte',
      discount: 'Gift',
    },
    'green-bowl': {
      tagline: 'Poke and bowls for your mood',
      perk: '20% off the “Balanced” combo',
      discount: '−20%',
    },
    'sakura-ramen': {
      tagline: 'Warm broth after a long day',
      perk: 'Free mochi dessert from 1,500 ₽',
      discount: 'Gift',
    },
    'focus-hub': {
      tagline: 'Quiet zones and hourly meeting rooms',
      perk: 'First coworking hour free',
      discount: '1h free',
    },
    'calm-space': {
      tagline: 'Meditation and breathwork',
      perk: 'Trial class for new NORA users',
      discount: 'Trial',
    },
  },
  ky: {
    'brew-lab': {
      tagline: 'Спешелти кофе жана терезе жанындагы столиктер',
      perk: 'NORA колдонуучуларына ичимдиктерге −15%',
      discount: '−15%',
    },
    'northern-beans': {
      tagline: 'Фильтр кофе жана кантсыз таттуулар',
      perk: 'Ар бир латтеге акысыз сироп',
      discount: 'Белек',
    },
    'green-bowl': {
      tagline: 'Көңүл-күйүңүзгө ылайык поке жана боулдар',
      perk: '«Тынч» комбо 20% арзандатуу',
      discount: '−20%',
    },
    'sakura-ramen': {
      tagline: 'Узак күндөн кийин жылытылган сорпа',
      perk: '1 500 ₽дан баштап моти белеги',
      discount: 'Белек',
    },
    'focus-hub': {
      tagline: 'Тынч зоналар жана сааттык мажлиш бөлмөлөр',
      perk: 'Биринчи саат коворкинг акысыз',
      discount: '1 саат',
    },
    'calm-space': {
      tagline: 'Медитация жана дем алуу практикалары',
      perk: 'Жаңы колдонуучуларга сыноо сабак',
      discount: 'Сыноо',
    },
  },
  ko: {
    'brew-lab': {
      tagline: '스페셜티 커피와 창가 조용한 자리',
      perk: 'NORA 사용자 음료 15% 할인',
      discount: '−15%',
    },
    'northern-beans': {
      tagline: '필터 커피와 저당 디저트',
      perk: '라떼에 무료 시럽',
      discount: '선물',
    },
    'green-bowl': {
      tagline: '기분에 맞는 포케와 보울',
      perk: '「안정」 콤보 20% 할인',
      discount: '−20%',
    },
    'sakura-ramen': {
      tagline: '긴 하루 뒤 따뜻한 국물',
      perk: '1,500₽ 이상 모찌 디저트 증정',
      discount: '선물',
    },
    'focus-hub': {
      tagline: '조용한 존과 시간제 회의실',
      perk: '코워킹 첫 1시간 무료',
      discount: '1시간',
    },
    'calm-space': {
      tagline: '명상과 호흡 연습',
      perk: '신규 사용자 체험 수업',
      discount: '체험',
    },
  },
}

export function getPartnerCategories(locale: Locale): Cat[] {
  return CATEGORIES[locale] ?? CATEGORIES.ru
}

export function getPartners(locale: Locale): Partner[] {
  const copy = COPY[locale] ?? COPY.ru
  return BASE.map((p) => ({ ...p, ...copy[p.id] }))
}
