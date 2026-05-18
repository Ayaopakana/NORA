import type { MbtiId } from '@/lib/mbti'
import type { PublicProfile } from '@/types/public-profile'
import type { User } from '@/types/user'

export type MatchReasonKey =
  | 'mbtiSame'
  | 'mbtiSimilar'
  | 'mood'
  | 'budget'
  | 'status'
  | 'city'
  | 'interests'

export type PeerMatch = {
  peer: PublicProfile
  score: number
  reasons: MatchReasonKey[]
}

function mbtiLetters(mbti: MbtiId): string[] {
  return mbti.split('')
}

function mbtiSimilarity(a: MbtiId, b: MbtiId): 'same' | 'similar' | 'none' {
  if (a === b) return 'same'
  const la = mbtiLetters(a)
  const lb = mbtiLetters(b)
  const shared = la.filter((ch, i) => lb[i] === ch).length
  if (shared >= 3) return 'similar'
  return 'none'
}

function interestOverlap(a: string[], b: string[]): number {
  const norm = (s: string) => s.trim().toLowerCase()
  const setB = new Set(b.map(norm))
  return a.filter((x) => setB.has(norm(x))).length
}

export function scorePeerMatch(viewer: User, peer: PublicProfile): PeerMatch {
  const reasons: MatchReasonKey[] = []
  let score = 0

  if (viewer.mbti && peer.mbti) {
    const rel = mbtiSimilarity(viewer.mbti, peer.mbti)
    if (rel === 'same') {
      score += 35
      reasons.push('mbtiSame')
    } else if (rel === 'similar') {
      score += 22
      reasons.push('mbtiSimilar')
    }
  }

  const viewerMood = viewer.initialMood || 'calm'
  if (peer.usualMood && peer.usualMood === viewerMood) {
    score += 20
    reasons.push('mood')
  }

  const budgetDiff = Math.abs(
    (viewer.dailyBudgetIndex ?? 1) - (peer.dailyBudgetIndex ?? 1),
  )
  if (budgetDiff === 0) {
    score += 15
    reasons.push('budget')
  } else if (budgetDiff === 1) {
    score += 8
    reasons.push('budget')
  }

  if (
    viewer.userStatus &&
    peer.userStatus &&
    viewer.userStatus === peer.userStatus
  ) {
    score += 12
    reasons.push('status')
  }

  const viewerCity = viewer.cityIntent.trim().toLowerCase()
  const peerCity = peer.city.trim().toLowerCase()
  if (viewerCity && peerCity && viewerCity === peerCity) {
    score += 15
    reasons.push('city')
  }

  const overlap = interestOverlap(
    peer.interests,
    [viewer.bio, viewer.moodNote, viewer.cityIntent].filter(Boolean),
  )
  if (overlap > 0) {
    score += Math.min(24, overlap * 8)
    reasons.push('interests')
  }

  return { peer, score, reasons }
}

export function rankPeerMatches(
  viewer: User,
  peers: PublicProfile[],
): PeerMatch[] {
  return peers
    .map((peer) => scorePeerMatch(viewer, peer))
    .sort((a, b) => b.score - a.score)
}
