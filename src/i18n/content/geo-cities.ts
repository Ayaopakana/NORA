import type { Locale } from '../config'
import { fuzzySearch } from '@/lib/fuzzy-match'
import type { City } from '@/lib/cities'

const CITY_IDS = [
  'bishkek', 'osh', 'karakol', 'jalal-abad', 'almaty', 'astana', 'shymkent',
  'tashkent', 'samarkand', 'bukhara', 'dushanbe', 'moscow', 'spb', 'kazan',
  'yekaterinburg', 'novosibirsk', 'minsk', 'kyiv', 'tbilisi', 'yerevan', 'baku',
  'istanbul', 'dubai', 'berlin', 'paris', 'london', 'new-york', 'los-angeles',
  'beijing', 'shanghai', 'seoul', 'tokyo', 'bangkok',
] as const

type CityRow = { name: string; country: string }

const ROWS: Record<(typeof CITY_IDS)[number], Record<Locale, CityRow>> = {
  bishkek: {
    ru: { name: 'Бишкек', country: 'Кыргызстан' },
    en: { name: 'Bishkek', country: 'Kyrgyzstan' },
    ky: { name: 'Бишкек', country: 'Кыргызстан' },
    ko: { name: '비슈케크', country: '키르기스스탄' },
  },
  osh: {
    ru: { name: 'Ош', country: 'Кыргызстан' },
    en: { name: 'Osh', country: 'Kyrgyzstan' },
    ky: { name: 'Ош', country: 'Кыргызстан' },
    ko: { name: '오시', country: '키르기스스탄' },
  },
  karakol: {
    ru: { name: 'Каракол', country: 'Кыргызстан' },
    en: { name: 'Karakol', country: 'Kyrgyzstan' },
    ky: { name: 'Каракол', country: 'Кыргызстан' },
    ko: { name: '카라콜', country: '키르기스스탄' },
  },
  'jalal-abad': {
    ru: { name: 'Джалал-Абад', country: 'Кыргызстан' },
    en: { name: 'Jalal-Abad', country: 'Kyrgyzstan' },
    ky: { name: 'Жалал-Абад', country: 'Кыргызстан' },
    ko: { name: '잘랄아바드', country: '키르기스스탄' },
  },
  almaty: {
    ru: { name: 'Алматы', country: 'Казахстан' },
    en: { name: 'Almaty', country: 'Kazakhstan' },
    ky: { name: 'Алматы', country: 'Казакстан' },
    ko: { name: '알마티', country: '카자흐스탄' },
  },
  astana: {
    ru: { name: 'Астана', country: 'Казахстан' },
    en: { name: 'Astana', country: 'Kazakhstan' },
    ky: { name: 'Астана', country: 'Казакстан' },
    ko: { name: '아스타나', country: '카자흐스탄' },
  },
  shymkent: {
    ru: { name: 'Шымкент', country: 'Казахстан' },
    en: { name: 'Shymkent', country: 'Kazakhstan' },
    ky: { name: 'Шымкент', country: 'Казакстан' },
    ko: { name: '심켄트', country: '카자흐스탄' },
  },
  tashkent: {
    ru: { name: 'Ташкент', country: 'Узбекистан' },
    en: { name: 'Tashkent', country: 'Uzbekistan' },
    ky: { name: 'Ташкент', country: 'Өзбекстан' },
    ko: { name: '타슈켄트', country: '우즈베키스탄' },
  },
  samarkand: {
    ru: { name: 'Самарканд', country: 'Узбекистан' },
    en: { name: 'Samarkand', country: 'Uzbekistan' },
    ky: { name: 'Самарканд', country: 'Өзбекстан' },
    ko: { name: '사마르칸트', country: '우즈베키스탄' },
  },
  bukhara: {
    ru: { name: 'Бухара', country: 'Узбекистан' },
    en: { name: 'Bukhara', country: 'Uzbekistan' },
    ky: { name: 'Бухара', country: 'Өзбекстан' },
    ko: { name: '부하라', country: '우즈베키스탄' },
  },
  dushanbe: {
    ru: { name: 'Душанбе', country: 'Таджикистан' },
    en: { name: 'Dushanbe', country: 'Tajikistan' },
    ky: { name: 'Душанбе', country: 'Тажикстан' },
    ko: { name: '두샨베', country: '타지키스탄' },
  },
  moscow: {
    ru: { name: 'Москва', country: 'Россия' },
    en: { name: 'Moscow', country: 'Russia' },
    ky: { name: 'Москва', country: 'Россия' },
    ko: { name: '모스크바', country: '러시아' },
  },
  spb: {
    ru: { name: 'Санкт-Петербург', country: 'Россия' },
    en: { name: 'Saint Petersburg', country: 'Russia' },
    ky: { name: 'Санкт-Петербург', country: 'Россия' },
    ko: { name: '상트페테르부르크', country: '러시아' },
  },
  kazan: {
    ru: { name: 'Казань', country: 'Россия' },
    en: { name: 'Kazan', country: 'Russia' },
    ky: { name: 'Казань', country: 'Россия' },
    ko: { name: '카잔', country: '러시아' },
  },
  yekaterinburg: {
    ru: { name: 'Екатеринбург', country: 'Россия' },
    en: { name: 'Yekaterinburg', country: 'Russia' },
    ky: { name: 'Екатеринбург', country: 'Россия' },
    ko: { name: '예카테린부르크', country: '러시아' },
  },
  novosibirsk: {
    ru: { name: 'Новосибирск', country: 'Россия' },
    en: { name: 'Novosibirsk', country: 'Russia' },
    ky: { name: 'Новосибирск', country: 'Россия' },
    ko: { name: '노보시비르스크', country: '러시아' },
  },
  minsk: {
    ru: { name: 'Минск', country: 'Беларусь' },
    en: { name: 'Minsk', country: 'Belarus' },
    ky: { name: 'Минск', country: 'Беларусь' },
    ko: { name: '민스크', country: '벨라루스' },
  },
  kyiv: {
    ru: { name: 'Киев', country: 'Украина' },
    en: { name: 'Kyiv', country: 'Ukraine' },
    ky: { name: 'Киев', country: 'Украина' },
    ko: { name: '키이우', country: '우크라이나' },
  },
  tbilisi: {
    ru: { name: 'Тбилиси', country: 'Грузия' },
    en: { name: 'Tbilisi', country: 'Georgia' },
    ky: { name: 'Тбилиси', country: 'Грузия' },
    ko: { name: '트빌리시', country: '조지아' },
  },
  yerevan: {
    ru: { name: 'Ереван', country: 'Армения' },
    en: { name: 'Yerevan', country: 'Armenia' },
    ky: { name: 'Ереван', country: 'Армения' },
    ko: { name: '예레반', country: '아르메니아' },
  },
  baku: {
    ru: { name: 'Баку', country: 'Азербайджан' },
    en: { name: 'Baku', country: 'Azerbaijan' },
    ky: { name: 'Баку', country: 'Азербайжан' },
    ko: { name: '바쿠', country: '아제르바이잔' },
  },
  istanbul: {
    ru: { name: 'Стамбул', country: 'Турция' },
    en: { name: 'Istanbul', country: 'Turkey' },
    ky: { name: 'Стамбул', country: 'Түркия' },
    ko: { name: '이스탄불', country: '터키' },
  },
  dubai: {
    ru: { name: 'Дубай', country: 'ОАЭ' },
    en: { name: 'Dubai', country: 'UAE' },
    ky: { name: 'Дубай', country: 'БАЭ' },
    ko: { name: '두바이', country: '아랍에미리트' },
  },
  berlin: {
    ru: { name: 'Берлин', country: 'Германия' },
    en: { name: 'Berlin', country: 'Germany' },
    ky: { name: 'Берлин', country: 'Германия' },
    ko: { name: '베를린', country: '독일' },
  },
  paris: {
    ru: { name: 'Париж', country: 'Франция' },
    en: { name: 'Paris', country: 'France' },
    ky: { name: 'Париж', country: 'Франция' },
    ko: { name: '파리', country: '프랑스' },
  },
  london: {
    ru: { name: 'Лондон', country: 'Великобритания' },
    en: { name: 'London', country: 'United Kingdom' },
    ky: { name: 'Лондон', country: 'Улуу Британия' },
    ko: { name: '런던', country: '영국' },
  },
  'new-york': {
    ru: { name: 'Нью-Йорк', country: 'США' },
    en: { name: 'New York', country: 'United States' },
    ky: { name: 'Нью-Йорк', country: 'АКШ' },
    ko: { name: '뉴욕', country: '미국' },
  },
  'los-angeles': {
    ru: { name: 'Лос-Анджелес', country: 'США' },
    en: { name: 'Los Angeles', country: 'United States' },
    ky: { name: 'Лос-Анджелес', country: 'АКШ' },
    ko: { name: '로스앤젤레스', country: '미국' },
  },
  beijing: {
    ru: { name: 'Пекин', country: 'Китай' },
    en: { name: 'Beijing', country: 'China' },
    ky: { name: 'Пекин', country: 'Кытай' },
    ko: { name: '베이징', country: '중국' },
  },
  shanghai: {
    ru: { name: 'Шанхай', country: 'Китай' },
    en: { name: 'Shanghai', country: 'China' },
    ky: { name: 'Шанхай', country: 'Кытай' },
    ko: { name: '상하이', country: '중국' },
  },
  seoul: {
    ru: { name: 'Сеул', country: 'Корея' },
    en: { name: 'Seoul', country: 'South Korea' },
    ky: { name: 'Сеул', country: 'Корея' },
    ko: { name: '서울', country: '대한민국' },
  },
  tokyo: {
    ru: { name: 'Токио', country: 'Япония' },
    en: { name: 'Tokyo', country: 'Japan' },
    ky: { name: 'Токио', country: 'Жапония' },
    ko: { name: '도쿄', country: '일본' },
  },
  bangkok: {
    ru: { name: 'Бангкок', country: 'Таиланд' },
    en: { name: 'Bangkok', country: 'Thailand' },
    ky: { name: 'Бангкок', country: 'Тайланд' },
    ko: { name: '방콕', country: '태국' },
  },
}

const SORT_LOCALE: Record<Locale, string> = {
  ru: 'ru',
  en: 'en',
  ky: 'ru',
  ko: 'ko',
}

export function getCities(locale: Locale): City[] {
  return CITY_IDS.map((id) => {
    const row = ROWS[id][locale]
    return { id, name: row.name, country: row.country }
  }).sort((a, b) => a.name.localeCompare(b.name, SORT_LOCALE[locale]))
}

export function searchCitiesList(
  cities: City[],
  query: string,
  limit = 10,
): City[] {
  return fuzzySearch(
    cities,
    query,
    (c) => `${c.name} ${c.country}`,
    { limit, minScore: 26 },
  )
}

export function findCityInList(
  cities: City[],
  name: string,
): City | undefined {
  const n = name.trim().toLowerCase()
  return cities.find((c) => c.name.toLowerCase() === n)
}

export function findCityByAnyName(name: string): City | undefined {
  const n = name.trim().toLowerCase()
  for (const locale of ['ru', 'en', 'ky', 'ko'] as const) {
    const hit = getCities(locale).find((c) => c.name.toLowerCase() === n)
    if (hit) return hit
  }
  return undefined
}

export function resolveCityLabel(stored: string, locale: Locale): string {
  if (!stored.trim()) return ''
  const byId = getCities(locale).find((c) => c.id === stored)
  if (byId) return byId.name
  const known = findCityByAnyName(stored)
  if (known) {
    return getCities(locale).find((c) => c.id === known.id)?.name ?? stored
  }
  return stored
}
