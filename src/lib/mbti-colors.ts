import type { CSSProperties } from 'react'
import type { MbtiId } from '@/lib/mbti'

/** Акценты по типам (NT · NF · SJ · SP) */
export const MBTI_ACCENT_HEX: Record<MbtiId, string> = {
  INTJ: '#9155c4',
  INTP: '#4f85c7',
  ENTJ: '#8348b8',
  ENTP: '#6570e0',
  INFJ: '#36b37a',
  INFP: '#2ec49a',
  ENFJ: '#2daa72',
  ENFP: '#48d494',
  ISTJ: '#3a9ec4',
  ISFJ: '#52b4d4',
  ESTJ: '#2a8aaa',
  ESFJ: '#42b0de',
  ISTP: '#d9a82e',
  ISFP: '#e8926a',
  ESTP: '#e6be38',
  ESFP: '#f09460',
}

export function getMbtiAccentHex(id: MbtiId | ''): string | null {
  if (!id) return null
  return MBTI_ACCENT_HEX[id] ?? null
}

export function mbtiActiveStyle(hex: string): CSSProperties {
  return {
    borderColor: `color-mix(in srgb, ${hex} 70%, transparent)`,
    backgroundColor: `color-mix(in srgb, ${hex} 22%, var(--nora-surface))`,
    boxShadow: [
      `0 0 0 1px color-mix(in srgb, ${hex} 42%, transparent)`,
      `0 10px 28px -8px color-mix(in srgb, ${hex} 36%, transparent)`,
    ].join(', '),
    ['--tw-ring-color' as string]: `color-mix(in srgb, ${hex} 55%, transparent)`,
  }
}

export function mbtiTitleColor(hex: string): CSSProperties {
  return { color: `color-mix(in srgb, ${hex} 94%, var(--nora-text))` }
}
