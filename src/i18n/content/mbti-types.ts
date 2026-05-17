import type { Locale } from '../config'
import type { MbtiId } from '@/lib/mbti'

type MbtiEntry = { id: MbtiId; title: MbtiId; subtitle: string }

const RU: Record<MbtiId, string> = {
  INTJ: 'Стратег',
  INTP: 'Мыслитель',
  ENTJ: 'Командир',
  ENTP: 'Полемист',
  INFJ: 'Советник',
  INFP: 'Посредник',
  ENFJ: 'Наставник',
  ENFP: 'Борец',
  ISTJ: 'Администратор',
  ISFJ: 'Защитник',
  ESTJ: 'Менеджер',
  ESFJ: 'Консул',
  ISTP: 'Виртуоз',
  ISFP: 'Артист',
  ESTP: 'Делатель',
  ESFP: 'Развлекатель',
}

const EN: Record<MbtiId, string> = {
  INTJ: 'Strategist',
  INTP: 'Thinker',
  ENTJ: 'Commander',
  ENTP: 'Debater',
  INFJ: 'Advocate',
  INFP: 'Mediator',
  ENFJ: 'Protagonist',
  ENFP: 'Campaigner',
  ISTJ: 'Logistician',
  ISFJ: 'Defender',
  ESTJ: 'Executive',
  ESFJ: 'Consul',
  ISTP: 'Virtuoso',
  ISFP: 'Adventurer',
  ESTP: 'Entrepreneur',
  ESFP: 'Entertainer',
}

const KY: Record<MbtiId, string> = {
  INTJ: 'Стратег',
  INTP: 'Ойлоочу',
  ENTJ: 'Командир',
  ENTP: 'Полемист',
  INFJ: 'Кеңешчи',
  INFP: 'Орточу',
  ENFJ: 'Үйрөткүч',
  ENFP: 'Күрөшкер',
  ISTJ: 'Администратор',
  ISFJ: 'Коргоочу',
  ESTJ: 'Менеджер',
  ESFJ: 'Консул',
  ISTP: 'Виртуоз',
  ISFP: 'Артист',
  ESTP: 'Ишкер',
  ESFP: 'Көркөмчү',
}

const KO: Record<MbtiId, string> = {
  INTJ: '전략가',
  INTP: '논리술사',
  ENTJ: '통솔자',
  ENTP: '변론가',
  INFJ: '옹호자',
  INFP: '중재자',
  ENFJ: '선도자',
  ENFP: '활동가',
  ISTJ: '현실주의자',
  ISFJ: '수호자',
  ESTJ: '경영자',
  ESFJ: '집정관',
  ISTP: '장인',
  ISFP: '모험가',
  ESTP: '사업가',
  ESFP: '연예인',
}

const SUBTITLES: Record<Locale, Record<MbtiId, string>> = {
  ru: RU,
  en: EN,
  ky: KY,
  ko: KO,
}

const IDS: MbtiId[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP',
]

export function getMbtiTypes(locale: Locale): MbtiEntry[] {
  const table = SUBTITLES[locale] ?? SUBTITLES.ru
  return IDS.map((id) => ({ id, title: id, subtitle: table[id] }))
}
