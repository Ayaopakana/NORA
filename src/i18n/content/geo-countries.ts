import type { Locale } from '../config'
import { fuzzySearch } from '@/lib/fuzzy-match'
import type { Country } from '@/lib/countries'

const COUNTRY_CODES = [
  'RU', 'KZ', 'BY', 'UA', 'UZ', 'TJ', 'KG', 'AM', 'AZ', 'GE', 'MD',
  'DE', 'FR', 'ES', 'IT', 'PL', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'FI', 'DK',
  'GB', 'IE', 'PT', 'GR', 'TR', 'AE', 'SA', 'EG', 'US', 'CA', 'MX', 'BR', 'AR', 'CL',
  'CN', 'JP', 'KR', 'IN', 'TH', 'VN', 'ID', 'MY', 'SG', 'AU', 'NZ', 'ZA', 'NG', 'IL',
  'CZ', 'SK', 'HU', 'RO', 'BG', 'HR', 'RS', 'EE', 'LV', 'LT',
] as const

const NAMES: Record<Locale, Record<string, string>> = {
  ru: {
    RU: 'Россия', KZ: 'Казахстан', BY: 'Беларусь', UA: 'Украина', UZ: 'Узбекистан',
    TJ: 'Таджикистан', KG: 'Кыргызстан', AM: 'Армения', AZ: 'Азербайджан', GE: 'Грузия',
    MD: 'Молдова', DE: 'Германия', FR: 'Франция', ES: 'Испания', IT: 'Италия', PL: 'Польша',
    NL: 'Нидерланды', BE: 'Бельгия', AT: 'Австрия', CH: 'Швейцария', SE: 'Швеция',
    NO: 'Норвегия', FI: 'Финляндия', DK: 'Дания', GB: 'Великобритания', IE: 'Ирландия',
    PT: 'Португалия', GR: 'Греция', TR: 'Турция', AE: 'ОАЭ', SA: 'Саудовская Аравия',
    EG: 'Египет', US: 'США', CA: 'Канада', MX: 'Мексика', BR: 'Бразилия', AR: 'Аргентина',
    CL: 'Чили', CN: 'Китай', JP: 'Япония', KR: 'Республика Корея', IN: 'Индия',
    TH: 'Таиланд', VN: 'Вьетнам', ID: 'Индонезия', MY: 'Малайзия', SG: 'Сингапур',
    AU: 'Австралия', NZ: 'Новая Зеландия', ZA: 'ЮАР', NG: 'Нигерия', IL: 'Израиль',
    CZ: 'Чехия', SK: 'Словакия', HU: 'Венгрия', RO: 'Румыния', BG: 'Болгария',
    HR: 'Хорватия', RS: 'Сербия', EE: 'Эстония', LV: 'Латвия', LT: 'Литва',
  },
  en: {
    RU: 'Russia', KZ: 'Kazakhstan', BY: 'Belarus', UA: 'Ukraine', UZ: 'Uzbekistan',
    TJ: 'Tajikistan', KG: 'Kyrgyzstan', AM: 'Armenia', AZ: 'Azerbaijan', GE: 'Georgia',
    MD: 'Moldova', DE: 'Germany', FR: 'France', ES: 'Spain', IT: 'Italy', PL: 'Poland',
    NL: 'Netherlands', BE: 'Belgium', AT: 'Austria', CH: 'Switzerland', SE: 'Sweden',
    NO: 'Norway', FI: 'Finland', DK: 'Denmark', GB: 'United Kingdom', IE: 'Ireland',
    PT: 'Portugal', GR: 'Greece', TR: 'Turkey', AE: 'UAE', SA: 'Saudi Arabia',
    EG: 'Egypt', US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil',
    AR: 'Argentina', CL: 'Chile', CN: 'China', JP: 'Japan', KR: 'South Korea', IN: 'India',
    TH: 'Thailand', VN: 'Vietnam', ID: 'Indonesia', MY: 'Malaysia', SG: 'Singapore',
    AU: 'Australia', NZ: 'New Zealand', ZA: 'South Africa', NG: 'Nigeria', IL: 'Israel',
    CZ: 'Czechia', SK: 'Slovakia', HU: 'Hungary', RO: 'Romania', BG: 'Bulgaria',
    HR: 'Croatia', RS: 'Serbia', EE: 'Estonia', LV: 'Latvia', LT: 'Lithuania',
  },
  ky: {
    RU: 'Россия', KZ: 'Казакстан', BY: 'Беларусь', UA: 'Украина', UZ: 'Өзбекстан',
    TJ: 'Тажикстан', KG: 'Кыргызстан', AM: 'Армения', AZ: 'Азербайжан', GE: 'Грузия',
    MD: 'Молдова', DE: 'Германия', FR: 'Франция', ES: 'Испания', IT: 'Италия', PL: 'Польша',
    NL: 'Нидерланд', BE: 'Бельгия', AT: 'Австрия', CH: 'Швейцария', SE: 'Швеция',
    NO: 'Норвегия', FI: 'Финляндия', DK: 'Дания', GB: 'Улуу Британия', IE: 'Ирландия',
    PT: 'Португалия', GR: 'Греция', TR: 'Түркия', AE: 'БАЭ', SA: 'Сауд Аравиясы',
    EG: 'Мисир', US: 'АКШ', CA: 'Канада', MX: 'Мексика', BR: 'Бразилия', AR: 'Аргентина',
    CL: 'Чили', CN: 'Кытай', JP: 'Жапония', KR: 'Корея', IN: 'Индия',
    TH: 'Тайланд', VN: 'Вьетнам', ID: 'Индонезия', MY: 'Малайзия', SG: 'Сингапур',
    AU: 'Австралия', NZ: 'Жаңы Зеландия', ZA: 'Түштүк Африка', NG: 'Нигерия', IL: 'Израиль',
    CZ: 'Чехия', SK: 'Словакия', HU: 'Венгрия', RO: 'Румыния', BG: 'Болгария',
    HR: 'Хорватия', RS: 'Сербия', EE: 'Эстония', LV: 'Латвия', LT: 'Литва',
  },
  ko: {
    RU: '러시아', KZ: '카자흐스탄', BY: '벨라루스', UA: '우크라이나', UZ: '우즈베키스탄',
    TJ: '타지키스탄', KG: '키르기스스탄', AM: '아르메니아', AZ: '아제르바이잔', GE: '조지아',
    MD: '몰도바', DE: '독일', FR: '프랑스', ES: '스페인', IT: '이탈리아', PL: '폴란드',
    NL: '네덜란드', BE: '벨기에', AT: '오스트리아', CH: '스위스', SE: '스웨덴',
    NO: '노르웨이', FI: '핀란드', DK: '덴마크', GB: '영국', IE: '아일랜드',
    PT: '포르투갈', GR: '그리스', TR: '터키', AE: '아랍에미리트', SA: '사우디아라비아',
    EG: '이집트', US: '미국', CA: '캐나다', MX: '멕시코', BR: '브라질', AR: '아르헨티나',
    CL: '칠레', CN: '중국', JP: '일본', KR: '대한민국', IN: '인도',
    TH: '태국', VN: '베트남', ID: '인도네시아', MY: '말레이시아', SG: '싱가포르',
    AU: '호주', NZ: '뉴질랜드', ZA: '남아프리카', NG: '나이지리아', IL: '이스라엘',
    CZ: '체코', SK: '슬로바키아', HU: '헝가리', RO: '루마니아', BG: '불가리아',
    HR: '크로아티아', RS: '세르비아', EE: '에스토니아', LV: '라트비아', LT: '리투아니아',
  },
}

const SORT_LOCALE: Record<Locale, string> = {
  ru: 'ru',
  en: 'en',
  ky: 'ru',
  ko: 'ko',
}

export function getCountries(locale: Locale): Country[] {
  const table = NAMES[locale]
  return COUNTRY_CODES.map((code) => ({
    code,
    name: table[code] ?? NAMES.ru[code] ?? code,
  })).sort((a, b) =>
    a.name.localeCompare(b.name, SORT_LOCALE[locale]),
  )
}

export function searchCountriesList(
  countries: Country[],
  query: string,
  limit = 10,
): Country[] {
  return fuzzySearch(countries, query, (c) => c.name, { limit, minScore: 28 })
}

export function findCountryInList(
  countries: Country[],
  name: string,
): Country | undefined {
  const n = name.trim().toLowerCase()
  return countries.find((c) => c.name.toLowerCase() === n)
}

export function findCountryByAnyName(name: string): Country | undefined {
  const n = name.trim().toLowerCase()
  for (const locale of ['ru', 'en', 'ky', 'ko'] as const) {
    const hit = getCountries(locale).find((c) => c.name.toLowerCase() === n)
    if (hit) return hit
  }
  return undefined
}
