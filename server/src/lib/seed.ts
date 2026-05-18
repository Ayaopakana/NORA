import { hashPassword } from './password.js'
import { prisma } from './prisma.js'

const DEMO_USERS = [
  {
    id: 'demo-1',
    email: 'demo-1@nora.local',
    nickname: 'alina_maps',
    name: 'Alina',
    bio: 'Ищу спокойные кофейни и прогулки по центру',
    cityIntent: 'Бишкек',
    interests: ['кофе', 'прогулки', 'фото'],
    mbti: 'INFP',
    avatarEmoji: '🌸',
    userStatus: 'student',
    initialMood: 'calm',
    dailyBudgetIndex: 1,
  },
  {
    id: 'demo-2',
    email: 'demo-2@nora.local',
    nickname: 'max_runner',
    name: 'Max',
    bio: 'Бег по набережной, вечерние маршруты',
    cityIntent: 'Бишкек',
    interests: ['спорт', 'набережная', 'энергия'],
    mbti: 'ENTP',
    avatarEmoji: '⚡',
    userStatus: 'local',
    initialMood: 'energy',
    dailyBudgetIndex: 2,
  },
  {
    id: 'demo-3',
    email: 'demo-3@nora.local',
    nickname: 'darya_calm',
    name: 'Darya',
    bio: 'Йога, тихие места, языковой обмен',
    cityIntent: 'Бишкек',
    interests: ['йога', 'языки', 'медитация'],
    mbti: 'INFJ',
    avatarEmoji: '🧘',
    userStatus: 'expat',
    initialMood: 'calm',
    dailyBudgetIndex: 1,
  },
  {
    id: 'demo-4',
    email: 'demo-4@nora.local',
    nickname: 'kirill_food',
    name: 'Kirill',
    bio: 'Новые кафе каждую неделю, делюсь находками',
    cityIntent: 'Бишкек',
    interests: ['еда', 'обзоры', 'скидки'],
    mbti: 'ESFP',
    avatarEmoji: '🍰',
    userStatus: 'tourist',
    initialMood: 'energy',
    dailyBudgetIndex: 2,
  },
  {
    id: 'demo-5',
    email: 'demo-5@nora.local',
    nickname: 'nora_guide',
    name: 'NORA Guide',
    bio: 'Помогаю адаптироваться в новом районе',
    cityIntent: 'Бишкек',
    interests: ['экспат', 'карта', 'советы'],
    mbti: 'ENFJ',
    avatarEmoji: '🗺️',
    userStatus: 'expat',
    initialMood: 'anxious',
    dailyBudgetIndex: 1,
  },
] as const

const DEMO_REVIEWS = [
  {
    id: 'rev-seed-1',
    placeId: 'calm-1',
    userId: 'demo-4',
    rating: 5,
    text: 'Тихо утром, удобно работать с ноутбуком.',
    daysAgo: 3,
  },
  {
    id: 'rev-seed-2',
    placeId: 'calm-1',
    userId: 'demo-3',
    rating: 4,
    text: 'Мягкий свет и спокойная музыка.',
    daysAgo: 5,
  },
  {
    id: 'rev-seed-3',
    placeId: 'energy-1',
    userId: 'demo-2',
    rating: 5,
    text: 'Живо и вкусно — идеально после пробежки.',
    daysAgo: 2,
  },
] as const

export async function ensureSeedData() {
  const hash = await hashPassword('demo-not-login')

  for (const d of DEMO_USERS) {
    await prisma.user.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        email: d.email,
        passwordHash: hash,
        name: d.name,
        nickname: d.nickname,
        bio: d.bio,
        cityIntent: d.cityIntent,
        interests: JSON.stringify(d.interests),
        mbti: d.mbti,
        avatarEmoji: d.avatarEmoji,
        userStatus: d.userStatus,
        initialMood: d.initialMood,
        dailyBudgetIndex: d.dailyBudgetIndex,
        isDemo: true,
      },
      update: {
        nickname: d.nickname,
        bio: d.bio,
        cityIntent: d.cityIntent,
        interests: JSON.stringify(d.interests),
        mbti: d.mbti,
        avatarEmoji: d.avatarEmoji,
        userStatus: d.userStatus,
        initialMood: d.initialMood,
        dailyBudgetIndex: d.dailyBudgetIndex,
        isDemo: true,
      },
    })
  }

  for (const r of DEMO_REVIEWS) {
    const at = new Date(Date.now() - r.daysAgo * 86400000)
    await prisma.placeReview.upsert({
      where: { userId_placeId: { userId: r.userId, placeId: r.placeId } },
      create: {
        id: r.id,
        placeId: r.placeId,
        userId: r.userId,
        rating: r.rating,
        text: r.text,
        at,
      },
      update: {
        rating: r.rating,
        text: r.text,
        at,
      },
    })
  }
}

/** Входящие заявки от демо-пользователей для нового аккаунта. */
export async function seedIncomingForUser(userId: string) {
  const existing = await prisma.friendRequest.count({ where: { toId: userId } })
  if (existing > 0) return

  for (const fromId of ['demo-2', 'demo-3']) {
    await prisma.friendRequest.upsert({
      where: { fromId_toId: { fromId, toId: userId } },
      create: { fromId, toId: userId },
      update: {},
    })
  }
}
