export type DemoUser = {
  id: string
  nickname: string
  bio: string
  city: string
  interests: string[]
  mbti?: string
  avatarEmoji: string
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-1',
    nickname: 'alina_maps',
    bio: 'Ищу спокойные кофейни и прогулки по центру',
    city: 'Москва',
    interests: ['кофе', 'прогулки', 'фото'],
    mbti: 'INFP',
    avatarEmoji: '🌸',
  },
  {
    id: 'demo-2',
    nickname: 'max_runner',
    bio: 'Бег по набережной, вечерние маршруты',
    city: 'Москва',
    interests: ['спорт', 'набережная', 'энергия'],
    mbti: 'ENTP',
    avatarEmoji: '⚡',
  },
  {
    id: 'demo-3',
    nickname: 'darya_calm',
    bio: 'Йога, тихие места, языковой обмен',
    city: 'Москва',
    interests: ['йога', 'языки', 'медитация'],
    mbti: 'INFJ',
    avatarEmoji: '🧘',
  },
  {
    id: 'demo-4',
    nickname: 'kirill_food',
    bio: 'Новые кафе каждую неделю, делюсь находками',
    city: 'Москва',
    interests: ['еда', 'обзоры', 'скидки'],
    mbti: 'ESFP',
    avatarEmoji: '🍰',
  },
  {
    id: 'demo-5',
    nickname: 'nora_guide',
    bio: 'Помогаю адаптироваться в новом районе',
    city: 'Москва',
    interests: ['экспат', 'карта', 'советы'],
    mbti: 'ENFJ',
    avatarEmoji: '🗺️',
  },
]

export function findDemoUser(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id)
}
