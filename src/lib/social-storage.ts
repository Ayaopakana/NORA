import { isApiEnabled } from '@/api/config'
import * as socialApi from '@/api/social'
import { findDemoUser } from './demoUsers'

const FRIENDS_KEY = 'nora_friends'
const OUTGOING_KEY = 'nora_outgoing_requests'
const INCOMING_KEY = 'nora_incoming_requests'
const CHATS_KEY = 'nora_chats'
const SOCIAL_SEEDED_KEY = 'nora_social_seeded'

export type ChatMessage = {
  id: string
  fromId: string
  text: string
  at: number
}

export type ChatThread = {
  peerId: string
  messages: ChatMessage[]
}

let apiFriends: string[] | null = null
let apiOutgoing: string[] | null = null
let apiIncoming: string[] | null = null
let apiChats: ChatThread[] | null = null

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota */
  }
}

export function notifySocialChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nora-social-change'))
  }
}

export function clearSocialApiCache() {
  apiFriends = null
  apiOutgoing = null
  apiIncoming = null
  apiChats = null
}

export async function refreshSocialFromApi(): Promise<void> {
  if (!isApiEnabled()) return
  const [friends, outgoing, incoming, threads] = await Promise.all([
    socialApi.apiGetFriendIds(),
    socialApi.apiGetOutgoingRequestIds(),
    socialApi.apiGetIncomingRequestIds(),
    socialApi.apiGetChatThreads(),
  ])
  apiFriends = friends
  apiOutgoing = outgoing
  apiIncoming = incoming
  apiChats = threads
}

function ensureDemoIncoming() {
  if (isApiEnabled()) return
  if (readJson(SOCIAL_SEEDED_KEY, false)) return
  const incoming = readJson<string[]>(INCOMING_KEY, [])
  if (incoming.length === 0) {
    writeJson(INCOMING_KEY, ['demo-2', 'demo-3'])
  }
  writeJson(SOCIAL_SEEDED_KEY, true)
}

export function getFriendIds(): string[] {
  if (isApiEnabled() && apiFriends) return apiFriends
  ensureDemoIncoming()
  return readJson<string[]>(FRIENDS_KEY, [])
}

export function getOutgoingRequestIds(): string[] {
  if (isApiEnabled() && apiOutgoing) return apiOutgoing
  ensureDemoIncoming()
  return readJson<string[]>(OUTGOING_KEY, [])
}

export function getIncomingRequestIds(): string[] {
  if (isApiEnabled() && apiIncoming) return apiIncoming
  ensureDemoIncoming()
  return readJson<string[]>(INCOMING_KEY, [])
}

export function isFriend(peerId: string): boolean {
  return getFriendIds().includes(peerId)
}

export function hasOutgoingRequest(peerId: string): boolean {
  return getOutgoingRequestIds().includes(peerId)
}

export function hasIncomingRequest(peerId: string): boolean {
  return getIncomingRequestIds().includes(peerId)
}

function ensureChatThreadLocal(peerId: string) {
  const chats = getChatThreads()
  if (chats.some((t) => t.peerId === peerId)) return
  const peer = findDemoUser(peerId)
  writeJson(CHATS_KEY, [
    ...chats,
    {
      peerId,
      messages: peer
        ? [
            {
              id: `welcome-${peerId}`,
              fromId: peerId,
              text: `Привет! Я ${peer.nickname}. Рада знакомству через NORA 👋`,
              at: Date.now(),
            },
          ]
        : [],
    },
  ])
}

export async function addFriend(peerId: string): Promise<void> {
  if (isApiEnabled()) {
    await socialApi.apiAcceptIncomingRequest(peerId)
    await refreshSocialFromApi()
    notifySocialChange()
    return
  }

  const ids = getFriendIds()
  if (ids.includes(peerId)) return
  writeJson(FRIENDS_KEY, [...ids, peerId])
  writeJson(
    OUTGOING_KEY,
    getOutgoingRequestIds().filter((id) => id !== peerId),
  )
  writeJson(
    INCOMING_KEY,
    getIncomingRequestIds().filter((id) => id !== peerId),
  )
  ensureChatThreadLocal(peerId)
  notifySocialChange()
}

export async function removeFriend(peerId: string): Promise<void> {
  if (isApiEnabled()) {
    await socialApi.apiRemoveFriend(peerId)
    await refreshSocialFromApi()
    notifySocialChange()
    return
  }

  writeJson(
    FRIENDS_KEY,
    getFriendIds().filter((id) => id !== peerId),
  )
  notifySocialChange()
}

export async function sendFriendRequest(peerId: string): Promise<void> {
  if (isApiEnabled()) {
    await socialApi.apiSendFriendRequest(peerId)
    await refreshSocialFromApi()
    notifySocialChange()
    return
  }

  if (isFriend(peerId)) return
  const outgoing = getOutgoingRequestIds()
  if (!outgoing.includes(peerId)) {
    writeJson(OUTGOING_KEY, [...outgoing, peerId])
  }
  notifySocialChange()
}

export async function cancelOutgoingRequest(peerId: string): Promise<void> {
  if (isApiEnabled()) {
    await socialApi.apiCancelOutgoingRequest(peerId)
    await refreshSocialFromApi()
    notifySocialChange()
    return
  }

  writeJson(
    OUTGOING_KEY,
    getOutgoingRequestIds().filter((id) => id !== peerId),
  )
  notifySocialChange()
}

export async function acceptIncomingRequest(peerId: string): Promise<void> {
  if (isApiEnabled()) {
    await socialApi.apiAcceptIncomingRequest(peerId)
    await refreshSocialFromApi()
    notifySocialChange()
    return
  }
  if (!hasIncomingRequest(peerId)) return
  await addFriend(peerId)
}

export async function rejectIncomingRequest(peerId: string): Promise<void> {
  if (isApiEnabled()) {
    await socialApi.apiRejectIncomingRequest(peerId)
    await refreshSocialFromApi()
    notifySocialChange()
    return
  }

  writeJson(
    INCOMING_KEY,
    getIncomingRequestIds().filter((id) => id !== peerId),
  )
  notifySocialChange()
}

export function getChatThreads(): ChatThread[] {
  if (isApiEnabled() && apiChats) return apiChats
  return readJson<ChatThread[]>(CHATS_KEY, [])
}

export function getThread(peerId: string): ChatThread | null {
  return getChatThreads().find((t) => t.peerId === peerId) ?? null
}

export async function sendMessage(
  peerId: string,
  fromId: string,
  text: string,
): Promise<ChatMessage> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Пустое сообщение')

  if (isApiEnabled()) {
    const msg = await socialApi.apiSendChatMessage(peerId, trimmed)
    await refreshSocialFromApi()
    notifySocialChange()
    return msg
  }

  const msg: ChatMessage = {
    id: `msg-${Date.now()}`,
    fromId,
    text: trimmed,
    at: Date.now(),
  }

  const threads = getChatThreads()
  const idx = threads.findIndex((t) => t.peerId === peerId)
  if (idx >= 0) {
    threads[idx] = {
      ...threads[idx],
      messages: [...threads[idx].messages, msg],
    }
  } else {
    threads.push({ peerId, messages: [msg] })
  }
  writeJson(CHATS_KEY, threads)
  notifySocialChange()
  return msg
}
