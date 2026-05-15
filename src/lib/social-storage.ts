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

/** Демо: входящие заявки при первом запуске */
function ensureDemoIncoming() {
  if (readJson(SOCIAL_SEEDED_KEY, false)) return
  const incoming = readJson<string[]>(INCOMING_KEY, [])
  if (incoming.length === 0) {
    writeJson(INCOMING_KEY, ['demo-2', 'demo-3'])
  }
  writeJson(SOCIAL_SEEDED_KEY, true)
}

export function getFriendIds(): string[] {
  ensureDemoIncoming()
  return readJson<string[]>(FRIENDS_KEY, [])
}

export function getOutgoingRequestIds(): string[] {
  ensureDemoIncoming()
  return readJson<string[]>(OUTGOING_KEY, [])
}

export function getIncomingRequestIds(): string[] {
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

function ensureChatThread(peerId: string) {
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

export function addFriend(peerId: string): void {
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
  ensureChatThread(peerId)
  notifySocialChange()
}

export function removeFriend(peerId: string): void {
  writeJson(
    FRIENDS_KEY,
    getFriendIds().filter((id) => id !== peerId),
  )
  notifySocialChange()
}

/** Отправить заявку в друзья (не сразу в друзья). */
export function sendFriendRequest(peerId: string): void {
  if (isFriend(peerId)) return
  const outgoing = getOutgoingRequestIds()
  if (!outgoing.includes(peerId)) {
    writeJson(OUTGOING_KEY, [...outgoing, peerId])
  }
  notifySocialChange()
}

export function cancelOutgoingRequest(peerId: string): void {
  writeJson(
    OUTGOING_KEY,
    getOutgoingRequestIds().filter((id) => id !== peerId),
  )
  notifySocialChange()
}

export function acceptIncomingRequest(peerId: string): void {
  if (!hasIncomingRequest(peerId)) return
  addFriend(peerId)
}

export function rejectIncomingRequest(peerId: string): void {
  writeJson(
    INCOMING_KEY,
    getIncomingRequestIds().filter((id) => id !== peerId),
  )
  notifySocialChange()
}

export function getChatThreads(): ChatThread[] {
  return readJson<ChatThread[]>(CHATS_KEY, [])
}

export function getThread(peerId: string): ChatThread | null {
  return getChatThreads().find((t) => t.peerId === peerId) ?? null
}

export function sendMessage(
  peerId: string,
  fromId: string,
  text: string,
): ChatMessage {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Пустое сообщение')

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
  return msg
}
