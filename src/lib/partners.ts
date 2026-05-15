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

export const PARTNER_CATEGORIES: { id: PartnerCategory | 'all'; label: string }[] =
  [
    { id: 'all', label: 'Все' },
    { id: 'coffee', label: 'Кофейни' },
    { id: 'food', label: 'Еда' },
    { id: 'coworking', label: 'Коворкинги' },
    { id: 'wellness', label: 'Здоровье' },
  ]

export const PARTNERS: Partner[] = [
  {
    id: 'brew-lab',
    name: 'Brew Lab',
    category: 'coffee',
    tagline: 'Спешелти и тихие столики у окна',
    address: 'ул. Тверская, 12',
    perk: '−15% на напитки для пользователей NORA',
    discount: '−15%',
    emoji: '☕',
  },
  {
    id: 'northern-beans',
    name: 'Northern Beans',
    category: 'coffee',
    tagline: 'Фильтр-кофе и десерты без сахара',
    address: 'Патриаршие пруды',
    perk: 'Бесплатный сироп к любому латте',
    discount: 'Подарок',
    emoji: '🫘',
  },
  {
    id: 'green-bowl',
    name: 'Green Bowl',
    category: 'food',
    tagline: 'Поке и боулы под твоё настроение',
    address: 'Китай-город',
    perk: 'Комбо «В норме» со скидкой 20%',
    discount: '−20%',
    emoji: '🥗',
  },
  {
    id: 'sakura-ramen',
    name: 'Sakura Ramen',
    category: 'food',
    tagline: 'Тёплый бульон после долгого дня',
    address: 'Арбат, 24',
    perk: 'Десерт моти в подарок от 1 500 ₽',
    discount: 'Подарок',
    emoji: '🍜',
  },
  {
    id: 'focus-hub',
    name: 'Focus Hub',
    category: 'coworking',
    tagline: 'Тихие зоны и переговорки по часам',
    address: 'Белорусская',
    perk: 'Первый час коворкинга бесплатно',
    discount: '1 ч бесплатно',
    emoji: '💼',
  },
  {
    id: 'calm-space',
    name: 'Calm Space',
    category: 'wellness',
    tagline: 'Медитация и дыхательные практики',
    address: 'Онлайн + студия на Чистых',
    perk: 'Пробное занятие для новых пользователей',
    discount: 'Проба',
    emoji: '🧘',
  },
]
