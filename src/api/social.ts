import type { ChatMessage, ChatThread } from '@/lib/social-storage'
import { apiFetch } from '@/api/client'
import { parseJson } from '@/api/json'

export async function apiGetFriendIds(): Promise<string[]> {
  const res = await apiFetch('/social/friends')
  const data = await parseJson<{ ids: string[] }>(res)
  return data.ids
}

export async function apiGetOutgoingRequestIds(): Promise<string[]> {
  const res = await apiFetch('/social/requests/outgoing')
  const data = await parseJson<{ ids: string[] }>(res)
  return data.ids
}

export async function apiGetIncomingRequestIds(): Promise<string[]> {
  const res = await apiFetch('/social/requests/incoming')
  const data = await parseJson<{ ids: string[] }>(res)
  return data.ids
}

export async function apiSendFriendRequest(peerId: string): Promise<void> {
  const res = await apiFetch('/social/requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peerId }),
  })
  await parseJson(res)
}

export async function apiCancelOutgoingRequest(peerId: string): Promise<void> {
  const res = await apiFetch(
    `/social/requests/outgoing/${encodeURIComponent(peerId)}`,
    { method: 'DELETE' },
  )
  await parseJson(res)
}

export async function apiAcceptIncomingRequest(peerId: string): Promise<void> {
  const res = await apiFetch(
    `/social/requests/${encodeURIComponent(peerId)}/accept`,
    { method: 'POST' },
  )
  await parseJson(res)
}

export async function apiRejectIncomingRequest(peerId: string): Promise<void> {
  const res = await apiFetch(
    `/social/requests/${encodeURIComponent(peerId)}/reject`,
    { method: 'POST' },
  )
  await parseJson(res)
}

export async function apiRemoveFriend(peerId: string): Promise<void> {
  const res = await apiFetch(`/social/friends/${encodeURIComponent(peerId)}`, {
    method: 'DELETE',
  })
  await parseJson(res)
}

export async function apiGetChatThreads(): Promise<ChatThread[]> {
  const res = await apiFetch('/social/chats')
  const data = await parseJson<{ threads: ChatThread[] }>(res)
  return data.threads
}

export async function apiGetChatThread(peerId: string): Promise<ChatThread | null> {
  const res = await apiFetch(`/social/chats/${encodeURIComponent(peerId)}`)
  if (res.status === 404) return null
  const data = await parseJson<{ thread: ChatThread }>(res)
  return data.thread
}

export async function apiSendChatMessage(
  peerId: string,
  text: string,
): Promise<ChatMessage> {
  const res = await apiFetch(
    `/social/chats/${encodeURIComponent(peerId)}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    },
  )
  const data = await parseJson<{ message: ChatMessage }>(res)
  return data.message
}
