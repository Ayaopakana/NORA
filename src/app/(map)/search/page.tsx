'use client'

import { motion } from 'framer-motion'
import {
  Search as SearchIcon,
  UserPlus,
  UserCheck,
  Clock,
  Check,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { RequireAuth } from '@/components/RequireAuth'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/useAuth'
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

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchContent />
    </RequireAuth>
  )
}

function SearchContent() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
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
    <PageShell>
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-400">
          Сообщество
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Поиск людей</h1>
        <p className="mt-2 text-sm text-[var(--nora-text-muted)]">
          Найдите людей с похожими интересами и отправьте заявку в друзья. После
          подтверждения можно писать в чат.
        </p>
      </header>

      <label className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--nora-border)] glass-panel px-3 py-2">
        <SearchIcon className="h-5 w-5 shrink-0 text-sky-400" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Никнейм, интересы, город…"
          className="min-w-0 flex-1 bg-transparent text-sm text-[var(--nora-text)] outline-none placeholder:text-[var(--nora-text-muted)]"
        />
      </label>

      {friendIds.length > 0 ? (
        <p className="mb-3 text-xs text-[var(--nora-text-muted)]">
          В друзьях: {friendIds.length} ·{' '}
          <Link href="/chat" className="text-sky-400 hover:underline">
            открыть чат
          </Link>
        </p>
      ) : null}

      <ul className="space-y-3">
        {results.map((u, i) => (
          <SearchResultRow key={u.id} user={u} index={i} />
        ))}
      </ul>

      {results.length === 0 ? (
        <p className="mt-6 text-center text-sm text-[var(--nora-text-muted)]">
          Никого не найдено. Попробуйте другой запрос.
        </p>
      ) : null}
    </PageShell>
  )
}

type DemoUser = (typeof DEMO_USERS)[number]

function SearchResultRow({ user: u, index: i }: { user: DemoUser; index: number }) {
  const friend = isFriend(u.id)
  const outgoing = hasOutgoingRequest(u.id)
  const incoming = hasIncomingRequest(u.id)

  return (
    <motion.li
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.04 }}
      className="flex items-center gap-3 rounded-2xl border border-[var(--nora-border)] glass-panel p-4"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-400/10 text-xl"
        aria-hidden
      >
        {u.avatarEmoji}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-[var(--nora-text)]">@{u.nickname}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-[var(--nora-text-muted)]">
          {u.bio}
        </p>
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
    </motion.li>
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
        В друзьях
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
          Принять
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Отклонить"
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
        Заявка
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
      Добавить
    </Button>
  )
}
