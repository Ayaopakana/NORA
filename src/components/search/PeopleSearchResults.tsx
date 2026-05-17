'use client'

import {
  Check,
  Clock,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
import { useI18n } from '@/hooks/useI18n'
import { useSocialRefresh } from '@/hooks/useSocialRefresh'
import { DEMO_USERS } from '@/lib/demoUsers'
import {
  acceptIncomingRequest,
  cancelOutgoingRequest,
  getFriendIds,
  hasIncomingRequest,
  hasOutgoingRequest,
  isFriend,
  rejectIncomingRequest,
  removeFriend,
  sendFriendRequest,
} from '@/lib/social-storage'

type DemoUser = (typeof DEMO_USERS)[number]

type PeopleSearchResultsProps = {
  query: string
  compact?: boolean
}

export function PeopleSearchResults({ query, compact }: PeopleSearchResultsProps) {
  const { user } = useAuth()
  const { t } = useI18n()
  useSocialRefresh()

  const friendIds = getFriendIds()

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return DEMO_USERS.filter((u) => {
      if (u.id === user?.id) return false
      if (!q) return true
      const hay = `${u.nickname} ${u.bio} ${u.city} ${u.interests.join(' ')}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, user?.id])

  if (!user) return null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!compact ? (
        <div className="border-b border-[var(--nora-border-subtle)] px-3 pb-2 pt-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-500 dark:text-sky-400">
            {t('search.community')}
          </p>
          <p className="mt-0.5 text-xs text-[var(--nora-text-muted)]">{t('search.subtitle')}</p>
        </div>
      ) : null}

      {friendIds.length > 0 ? (
        <p className="px-3 py-2 text-xs text-[var(--nora-text-muted)]">
          {t('search.friendsCount', { count: String(friendIds.length) })} ·{' '}
          <Link href="/chat" className="text-sky-400 hover:underline">
            {t('search.openChat')}
          </Link>
        </p>
      ) : null}

      <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto px-2 pb-2 pt-1">
        {results.map((u) => (
          <SearchResultRow key={u.id} user={u} />
        ))}
      </ul>

      {results.length === 0 ? (
        <p className="px-3 pb-3 text-center text-sm text-[var(--nora-text-muted)]">
          {t('search.empty')}
        </p>
      ) : null}
    </div>
  )
}

function SearchResultRow({ user: u }: { user: DemoUser }) {
  const friend = isFriend(u.id)
  const outgoing = hasOutgoingRequest(u.id)
  const incoming = hasIncomingRequest(u.id)

  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--nora-border)] glass-panel p-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-lg"
        aria-hidden
      >
        {u.avatarEmoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--nora-text)]">@{u.nickname}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--nora-text-muted)]">{u.bio}</p>
        <p className="mt-1 text-[11px] text-sky-300/80">
          {u.city}
          {u.mbti ? ` · ${u.mbti}` : ''}
        </p>
      </div>
      <FriendActionButton
        peerId={u.id}
        friend={friend}
        outgoing={outgoing}
        incoming={incoming}
      />
    </li>
  )
}

function FriendActionButton({
  peerId,
  friend,
  outgoing,
  incoming,
}: {
  peerId: string
  friend: boolean
  outgoing: boolean
  incoming: boolean
}) {
  const { t } = useI18n()

  if (friend) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0 gap-1"
        onClick={() => removeFriend(peerId)}
      >
        <UserCheck className="h-4 w-4" />
        {t('search.inFriends')}
      </Button>
    )
  }

  if (incoming) {
    return (
      <div className="flex shrink-0 gap-1">
        <Button
          type="button"
          size="sm"
          className="gap-1"
          onClick={() => acceptIncomingRequest(peerId)}
        >
          <Check className="h-4 w-4" />
          {t('search.accept')}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('search.reject')}
          onClick={() => rejectIncomingRequest(peerId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (outgoing) {
    return (
      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="shrink-0 gap-1"
        onClick={() => cancelOutgoingRequest(peerId)}
      >
        <Clock className="h-4 w-4" />
        {t('search.outgoing')}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      className="shrink-0 gap-1"
      onClick={() => sendFriendRequest(peerId)}
    >
      <UserPlus className="h-4 w-4" />
      {t('search.add')}
    </Button>
  )
}
