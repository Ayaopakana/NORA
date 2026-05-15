'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
import { findDemoUser } from '@/lib/demoUsers'
import {
  getChatThreads,
  getFriendIds,
  sendMessage,
  type ChatThread,
} from '@/lib/social-storage'
import { cn } from '@/lib/utils'

export default function ChatPage() {
  return (
    <RequireAuth>
      <ChatContent />
    </RequireAuth>
  )
}

function ChatContent() {
  const { user } = useAuth()
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activePeer, setActivePeer] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const refresh = () => setThreads(getChatThreads())

  useEffect(() => {
    refresh()
  }, [])

  const friendIds = getFriendIds()

  const activeThread = threads.find((t) => t.peerId === activePeer)
  const activePeerUser = activePeer ? findDemoUser(activePeer) : null

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread?.messages.length, activePeer])

  if (!user) return null

  function handleSend() {
    if (!activePeer || !draft.trim()) return
    sendMessage(activePeer, user!.id, draft)
    setDraft('')
    refresh()
  }

  if (activePeer && activePeerUser) {
    return (
      <PageShell className="flex max-w-lg flex-col pb-0">
        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActivePeer(null)}
            className="rounded-lg p-2 text-[var(--nora-text-muted)] hover:bg-white/5 hover:text-[var(--nora-text)]"
            aria-label="Назад к списку"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <span className="text-xl" aria-hidden>
            {activePeerUser.avatarEmoji}
          </span>
          <div>
            <p className="font-semibold">@{activePeerUser.nickname}</p>
            <p className="text-xs text-[var(--nora-text-muted)]">онлайн · демо-чат</p>
          </div>
        </div>

        <div className="mb-20 flex min-h-[50vh] flex-1 flex-col gap-2 overflow-y-auto rounded-2xl border border-[var(--nora-border)] glass-panel p-3">
          {(activeThread?.messages ?? []).map((m) => {
            const mine = m.fromId === user.id
            return (
              <div
                key={m.id}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 text-sm',
                  mine
                    ? 'ml-auto bg-sky-500/25 text-sky-50'
                    : 'mr-auto bg-[var(--nora-surface)] text-[var(--nora-text)]',
                )}
              >
                {m.text}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        <form
          className="fixed inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom,0px))] z-20 mx-auto flex max-w-lg gap-2 border-t border-[var(--nora-border)] glass-panel-strong px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Сообщение…"
            className="glass-input min-w-0 flex-1 px-3 py-2.5 text-sm"
          />
          <Button type="submit" size="icon" disabled={!draft.trim()} aria-label="Отправить">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          Сообщения
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Чат</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Переписка с людьми из списка друзей. Сначала добавьте кого-нибудь в{' '}
          <Link href="/search" className="text-sky-400 hover:underline">
            поиске
          </Link>
          .
        </p>
      </header>

      {friendIds.length === 0 ? (
        <div className="rounded-2xl border border-[var(--nora-border)] glass-panel p-6 text-center text-sm text-[var(--nora-text-muted)]">
          <p>Пока нет друзей для чата.</p>
          <Button asChild className="mt-4">
            <Link href="/search">Найти людей</Link>
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {friendIds.map((peerId) => {
            const peer = findDemoUser(peerId)
            if (!peer) return null
            const thread = threads.find((t) => t.peerId === peerId)
            const last = thread?.messages[thread.messages.length - 1]
            return (
              <li key={peerId}>
                <button
                  type="button"
                  onClick={() => setActivePeer(peerId)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[var(--nora-border)] glass-panel p-4 text-left transition-colors hover:border-sky-400/35"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-400/10 text-lg">
                    {peer.avatarEmoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[var(--nora-text)]">
                      @{peer.nickname}
                    </p>
                    <p className="truncate text-xs text-[var(--nora-text-muted)]">
                      {last?.text ?? 'Напишите первое сообщение'}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </PageShell>
  )
}
