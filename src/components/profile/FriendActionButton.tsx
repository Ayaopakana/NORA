'use client'

import { Check, Clock, UserCheck, UserPlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/hooks/useI18n'
import {
  acceptIncomingRequest,
  cancelOutgoingRequest,
  rejectIncomingRequest,
  removeFriend,
  sendFriendRequest,
} from '@/lib/social-storage'

type FriendActionButtonProps = {
  peerId: string
  friend: boolean
  outgoing: boolean
  incoming: boolean
  size?: 'sm' | 'default'
  className?: string
}

export function FriendActionButton({
  peerId,
  friend,
  outgoing,
  incoming,
  size = 'sm',
  className,
}: FriendActionButtonProps) {
  const { t } = useI18n()

  if (friend) {
    return (
      <Button
        type="button"
        variant="secondary"
        size={size}
        className={className ?? 'shrink-0 gap-1'}
        onClick={() => removeFriend(peerId)}
      >
        <UserCheck className="h-4 w-4" />
        {t('search.inFriends')}
      </Button>
    )
  }

  if (incoming) {
    return (
      <div className={className ?? 'flex shrink-0 gap-1'}>
        <Button
          type="button"
          size={size}
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
        size={size}
        className={className ?? 'shrink-0 gap-1'}
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
      size={size}
      className={className ?? 'shrink-0 gap-1'}
      onClick={() => sendFriendRequest(peerId)}
    >
      <UserPlus className="h-4 w-4" />
      {t('search.add')}
    </Button>
  )
}
