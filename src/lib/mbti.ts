export const MBTI_TYPES = [
  { id: 'INTJ', title: 'INTJ', subtitle: 'Стратег' },
  { id: 'INTP', title: 'INTP', subtitle: 'Мыслитель' },
  { id: 'ENTJ', title: 'ENTJ', subtitle: 'Командир' },
  { id: 'ENTP', title: 'ENTP', subtitle: 'Полемист' },
  { id: 'INFJ', title: 'INFJ', subtitle: 'Советник' },
  { id: 'INFP', title: 'INFP', subtitle: 'Посредник' },
  { id: 'ENFJ', title: 'ENFJ', subtitle: 'Наставник' },
  { id: 'ENFP', title: 'ENFP', subtitle: 'Борец' },
  { id: 'ISTJ', title: 'ISTJ', subtitle: 'Администратор' },
  { id: 'ISFJ', title: 'ISFJ', subtitle: 'Защитник' },
  { id: 'ESTJ', title: 'ESTJ', subtitle: 'Менеджер' },
  { id: 'ESFJ', title: 'ESFJ', subtitle: 'Консул' },
  { id: 'ISTP', title: 'ISTP', subtitle: 'Виртуоз' },
  { id: 'ISFP', title: 'ISFP', subtitle: 'Артист' },
  { id: 'ESTP', title: 'ESTP', subtitle: 'Делатель' },
  { id: 'ESFP', title: 'ESFP', subtitle: 'Развлекатель' },
] as const

export type MbtiId = (typeof MBTI_TYPES)[number]['id']

export function isMbtiId(v: unknown): v is MbtiId {
  return typeof v === 'string' && MBTI_TYPES.some((t) => t.id === v)
}
