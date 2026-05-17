import type { Locale } from './config'
import type {
  PlannerMood,
  PlannerRecommendation,
} from '@/lib/planner-recommendations'

type PlacePatch = Pick<PlannerRecommendation, 'title' | 'badge' | 'duration'>

const EN: Record<string, PlacePatch> = {
  'calm-1': {
    title: 'Quiet coffee and reading',
    duration: '1 h 10 min',
    badge: 'Gentle pace — good for regaining focus',
  },
  'calm-2': {
    title: 'Walk in the shade',
    duration: '50 min',
    badge: 'Even route and open space',
  },
  'calm-3': {
    title: 'Books and tea',
    duration: '45 min',
    badge: 'Quiet and a familiar daily rhythm',
  },
  'calm-4': {
    title: 'Sunset by the fountain',
    duration: '40 min',
    badge: 'Free stroll downtown',
  },
  'energy-1': {
    title: 'Market and flavors',
    duration: '1 h 15 min',
    badge: 'Vivid impressions and light energy',
  },
  'energy-2': {
    title: 'Center and lights',
    duration: '55 min',
    badge: 'Lots of space — a boost of energy',
  },
  'energy-3': {
    title: 'Victory Park',
    duration: '1 h 20 min',
    badge: 'Long walk with city views',
  },
  'energy-4': {
    title: 'Dinner with a view',
    duration: '1 h 30 min',
    badge: 'Vibrant evening — if budget allows',
  },
  'tired-1': {
    title: 'Warm drink nearby',
    duration: '35 min',
    badge: 'Close by, no extra transfers',
  },
  'tired-2': {
    title: 'Short walk',
    duration: '30 min',
    badge: 'Stop whenever you feel tired',
  },
  'tired-3': {
    title: 'Cozy lunch',
    duration: '50 min',
    badge: 'Calm food — fewer decisions',
  },
  'tired-4': {
    title: 'Tea break',
    duration: '45 min',
    badge: 'Sit and rest without rushing',
  },
  'anxious-1': {
    title: 'Green oasis',
    duration: '55 min',
    badge: 'Predictable path and little noise',
  },
  'anxious-2': {
    title: 'Quiet alley',
    duration: '40 min',
    badge: 'Cozy courtyard downtown',
  },
  'anxious-3': {
    title: 'Botanical garden',
    duration: '1 h',
    badge: 'Steady movement is calming',
  },
  'anxious-4': {
    title: 'Calm café',
    duration: '50 min',
    badge: 'Fewer people off-season',
  },
}

const KY: Record<string, PlacePatch> = {
  'calm-1': {
    title: 'Тынч кофе жана окуу',
    duration: '1 саат 10 мүн',
    badge: 'Жумшак темп — фокусту калыбына келтирүүгө жакшы',
  },
  'calm-2': {
    title: 'Көлөкөдө сейилдөө',
    duration: '50 мүн',
    badge: 'Тегиз маршрут жана ачык мейкиндик',
  },
  'calm-3': {
    title: 'Китептер жана чай',
    duration: '45 мүн',
    badge: 'Тынчтык жана тааныш күнүмдүк сценарий',
  },
  'calm-4': {
    title: 'Фонтандагы күн батышы',
    duration: '40 мүн',
    badge: 'Борбордогу акысыз сейилдөө',
  },
  'energy-1': {
    title: 'Базар жана даамдар',
    duration: '1 саат 15 мүн',
    badge: 'Жандуу тажрыйбалар жана жеңил драйв',
  },
  'energy-2': {
    title: 'Борбор жана жарыктар',
    duration: '55 мүн',
    badge: 'Кең мейкиндик — сергитүү',
  },
  'energy-3': {
    title: 'Жеңиш паркы',
    duration: '1 саат 20 мүн',
    badge: 'Шаар көрүнүштөрү менен узун сейилдөө',
  },
  'energy-4': {
    title: 'Көрүнүштүү кечки тамак',
    duration: '1 саат 30 мүн',
    badge: 'Жаркыраак кеч — бюджет жетсе',
  },
  'tired-1': {
    title: 'Жакын жылытылган суусундук',
    duration: '35 мүн',
    badge: 'Жакын, артык көчүүсүз',
  },
  'tired-2': {
    title: 'Кыска сейилдөө',
    duration: '30 мүн',
    badge: 'Чарчаганда токтоп алсаңыз болот',
  },
  'tired-3': {
    title: 'Жайлуу түшкү тамак',
    duration: '50 мүн',
    badge: 'Тынч тамак — аз чечим',
  },
  'tired-4': {
    title: 'Чай тыныгуусу',
    duration: '45 мүн',
    badge: 'Шашпай отуруп эс алуу',
  },
  'anxious-1': {
    title: 'Жашыл оазис',
    duration: '55 мүн',
    badge: 'Болжолдуу жол жана аз ызы-чуу',
  },
  'anxious-2': {
    title: 'Тынч көчө',
    duration: '40 мүн',
    badge: 'Борбордогу жайлуу дворик',
  },
  'anxious-3': {
    title: 'Ботаникалык бак',
    duration: '1 саат',
    badge: 'Биркелки кыймыл тынчтандырат',
  },
  'anxious-4': {
    title: 'Тынч кафе',
    duration: '50 мүн',
    badge: 'Мезгил арасында аз адам',
  },
}

const KO: Record<string, PlacePatch> = {
  'calm-1': {
    title: '조용한 커피와 독서',
    duration: '1시간 10분',
    badge: '부드러운 템포 — 집중 회복에 좋음',
  },
  'calm-2': {
    title: '그늘 아래 산책',
    duration: '50분',
    badge: '고른 코스와 열린 공간',
  },
  'calm-3': {
    title: '책과 차',
    duration: '45분',
    badge: '조용함과 익숙한 하루 패턴',
  },
  'calm-4': {
    title: '분수대 옆 노을',
    duration: '40분',
    badge: '도심 무료 산책',
  },
  'energy-1': {
    title: '시장과 맛',
    duration: '1시간 15분',
    badge: '생생한 경험과 가벼운 활력',
  },
  'energy-2': {
    title: '중심가와 불빛',
    duration: '55분',
    badge: '넓은 공간 — 활력 충전',
  },
  'energy-3': {
    title: '승리 공원',
    duration: '1시간 20분',
    badge: '도시 전망이 있는 긴 산책',
  },
  'energy-4': {
    title: '전망 있는 저녁',
    duration: '1시간 30분',
    badge: '화려한 저녁 — 예산이 되면',
  },
  'tired-1': {
    title: '가까운 따뜻한 음료',
    duration: '35분',
    badge: '가깝고 환승 없음',
  },
  'tired-2': {
    title: '짧은 산책',
    duration: '30분',
    badge: '피곤하면 언제든 멈춤',
  },
  'tired-3': {
    title: '아늑한 점심',
    duration: '50분',
    badge: '차분한 식사 — 결정 최소화',
  },
  'tired-4': {
    title: '차 한잔 휴식',
    duration: '45분',
    badge: '서두르지 않고 쉬기',
  },
  'anxious-1': {
    title: '녹색 오아시스',
    duration: '55분',
    badge: '예측 가능한 길과 적은 소음',
  },
  'anxious-2': {
    title: '조용한 골목',
    duration: '40분',
    badge: '도심의 아늑한 마당',
  },
  'anxious-3': {
    title: '식물원',
    duration: '1시간',
    badge: '규칙적인 걸음이 진정에 도움',
  },
  'anxious-4': {
    title: '조용한 카페',
    duration: '50분',
    badge: '비수기에는 사람이 적음',
  },
}

export const PLANNER_TEXT_PATCHES: Partial<
  Record<Locale, Record<string, PlacePatch>>
> = {
  en: EN,
  ky: KY,
  ko: KO,
}

export function localizeRecommendation(
  rec: PlannerRecommendation,
  locale: Locale,
): PlannerRecommendation {
  const patch = PLANNER_TEXT_PATCHES[locale]?.[rec.id]
  return patch ? { ...rec, ...patch } : rec
}

export function localizePlannerPool(
  pool: Record<PlannerMood, PlannerRecommendation[]>,
  locale: Locale,
): Record<PlannerMood, PlannerRecommendation[]> {
  if (locale === 'ru' || !PLANNER_TEXT_PATCHES[locale]) return pool
  const out = {} as Record<PlannerMood, PlannerRecommendation[]>
  for (const mood of Object.keys(pool) as PlannerMood[]) {
    out[mood] = pool[mood].map((r) => localizeRecommendation(r, locale))
  }
  return out
}
