'use client'

import Link from 'next/link'
import { Check, MessageCircle, UserMinus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useSocialRefresh } from '@/hooks/useSocialRefresh'
import { findDemoUser } from '@/lib/demoUsers'
import {
  acceptIncomingRequest,
  cancelOutgoingRequest,
  getFriendIds,
  getIncomingRequestIds,
  getOutgoingRequestIds,
  rejectIncomingRequest,
  removeFriend,
} from '@/lib/social-storage'
import { cn } from '@/lib/utils'

type Tab = 'friends' | 'incoming' | 'outgoing'

export function ProfileSocialSection() {
  useSocialRefresh()
  const [tab, setTab] = useState<Tab>('friends')

  const friends = getFriendIds()
  const incoming = getIncomingRequestIds()
  const outgoing = getOutgoingRequestIds()

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'friends', label: 'Друзья', count: friends.length },
    { id: 'incoming', label: 'Запросы', count: incoming.length },
    { id: 'outgoing', label: 'Исходящие', count: outgoing.length },
  ]

  const list =
    tab === 'friends' ? friends : tab === 'incoming' ? incoming : outgoing

  return (
    <section className="mb-6 rounded-2xl border border-[var(--nora-border)] glass-panel p-4">
      <h2 className="text-sm font-semibold text-[var(--nora-text)]">
        Друзья и заявки
      </h2>
      <p className="mt-1 text-xs text-[var(--nora-text-muted)]">
        Подтверждённые друзья, входящие и отправленные заявки.
      </p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors',
              tab === t.id
                ? 'border-sky-400/70 bg-sky-400/15 text-sky-100'
                : 'border-[var(--nora-border)] text-[var(--nora-text-muted)]',
            )}
          >
            {t.label}
            {t.count > 0 ? (
              <span className="ml-1.5 rounded-full bg-sky-400/25 px-1.5 text-[11px]">
                {t.count}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-4 text-center text-sm text-[var(--nora-text-muted)]">
          {tab === 'friends'
            ? 'Пока нет друзей.'
            : tab === 'incoming'
              ? 'Нет входящих заявок.'
              : 'Нет исходящих заявок.'}
          {tab === 'friends' ? (
            <>
              {' '}
              <Link href="/search" className="text-sky-400 hover:underline">
                Найти людей
              </Link>
            </>
          ) : null}
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {list.map((peerId) => {
            const peer = findDemoUser(peerId)
            if (!peer) return null
            return (
              <li
                key={peerId}
                className="flex items-center gap-3 rounded-xl border border-[var(--nora-border)] bg-[var(--nora-surface)]/50 p-3"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-lg">
                  {peer.avatarEmoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--nora-text)]">
                    @{peer.nickname}
                  </p>
                  <p className="truncate text-xs text-[var(--nora-text-muted)]">
                    {peer.bio}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {tab === 'friends' ? (
                    <>
                      <Button size="icon" variant="secondary" asChild>
                        <Link href="/chat" aria-label="Чат">
                          <MessageCircle className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Удалить из друзей"
                        onClick={() => removeFriend(peerId)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </>
                  ) : tab === 'incoming' ? (
                    <>
                      <Button
                        size="icon"
                        aria-label="Принять"
                        onClick={() => acceptIncomingRequest(peerId)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Отклонить"
                        onClick={() => rejectIncomingRequest(peerId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => cancelOutgoingRequest(peerId)}
                    >
                      Отменить
                    </Button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
