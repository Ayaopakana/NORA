import type { MbtiId } from '@/lib/mbti'
import type { MoodPreset, UserStatus } from '@/types/user'

export type DemoUser = {
  id: string
  nickname: string
  bio: string
  city: string
  interests: string[]
  mbti?: MbtiId
  avatarEmoji: string
  avatarUrl?: string | null
  userStatus?: UserStatus
  usualMood?: MoodPreset
  dailyBudgetIndex?: number
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'demo-1',
    nickname: 'alina_maps',
    bio: 'Ищу спокойные кофейни и прогулки по центру',
    city: 'Бишкек',
    interests: ['кофе', 'прогулки', 'фото'],
    mbti: 'INFP',
    avatarEmoji: '🌸',
    userStatus: 'student',
    usualMood: 'calm',
    dailyBudgetIndex: 1,
  },
  {
    id: 'demo-2',
    nickname: 'max_runner',
    bio: 'Бег по набережной, вечерние маршруты',
    city: 'Бишкек',
    interests: ['спорт', 'набережная', 'энергия'],
    mbti: 'ENTP',
    avatarEmoji: '⚡',
    userStatus: 'local',
    usualMood: 'energy',
    dailyBudgetIndex: 2,
  },
  {
    id: 'demo-3',
    nickname: 'darya_calm',
    bio: 'Йога, тихие места, языковой обмен',
    city: 'Бишкек',
    interests: ['йога', 'языки', 'медитация'],
    mbti: 'INFJ',
    avatarEmoji: '🧘',
    userStatus: 'expat',
    usualMood: 'calm',
    dailyBudgetIndex: 1,
  },
  {
    id: 'demo-4',
    nickname: 'kirill_food',
    bio: 'Новые кафе каждую неделю, делюсь находками',
    city: 'Бишкек',
    interests: ['еда', 'обзоры', 'скидки'],
    mbti: 'ESFP',
    avatarEmoji: '🍰',
    userStatus: 'tourist',
    usualMood: 'energy',
    dailyBudgetIndex: 2,
  },
  {
    id: 'demo-5',
    nickname: 'nora_guide',
    bio: 'Помогаю адаптироваться в новом районе',
    city: 'Бишкек',
    interests: ['экспат', 'карта', 'советы'],
    mbti: 'ENFJ',
    avatarEmoji: '🗺️',
    userStatus: 'expat',
    usualMood: 'anxious',
    dailyBudgetIndex: 1,
  },
]

export function findDemoUser(id: string): DemoUser | undefined {
  return DEMO_USERS.find((u) => u.id === id)
}
