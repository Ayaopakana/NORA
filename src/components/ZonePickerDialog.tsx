'use client'

import type { Map as MapLibreMap } from 'maplibre-gl'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MapboxSurface } from '@/components/map/MapboxSurface'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { ZoneKey, ZonePoint } from '@/types/user'

type ZonePickerDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  zone: ZoneKey
  title: string
  initial?: ZonePoint | null
  onSave: (point: ZonePoint) => void
}

const zoneCopy: Record<
  ZoneKey,
  { title: string; description: string }
> = {
  home: {
    title: 'Дом',
    description: 'Нажмите на карту, чтобы отметить, где вы живёте.',
  },
  school: {
    title: 'Учёба',
    description: 'Отметьте кампус или место, где вы учитесь.',
  },
  work: {
    title: 'Работа',
    description: 'Отметьте офис или основную рабочую точку.',
  },
}

export function ZonePickerDialog({
  open,
  onOpenChange,
  zone,
  title,
  initial,
  onSave,
}: ZonePickerDialogProps) {
  const [picked, setPicked] = useState<ZonePoint | null>(null)
  const mapRef = useRef<MapLibreMap | null>(null)

  const handlePick = useCallback((p: { lng: number; lat: number }) => {
    setPicked(p)
  }, [])

  useEffect(() => {
    if (!open) {
      setPicked(null)
      return
    }
    setPicked(initial ?? null)
  }, [open, initial])

  const copy = zoneCopy[zone]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="p-6 pb-2">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{copy.description}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="h-[min(52vh,360px)] w-full border-y border-[var(--nora-border)]">
          {open ? (
            <MapboxSurface
              className="h-full w-full"
              pickPoint={handlePick}
              markers={
                picked
                  ? [
                      {
                        id: 'pick',
                        lng: picked.lng,
                        lat: picked.lat,
                        color: '#38bdf8',
                      },
                    ]
                  : initial
                    ? [
                        {
                          id: 'initial',
                          lng: initial.lng,
                          lat: initial.lat,
                          color: '#64748b',
                        },
                      ]
                    : []
              }
              onMap={(map) => {
                mapRef.current = map
                const target = picked ?? initial
                if (target) {
                  map.jumpTo({ center: [target.lng, target.lat], zoom: 14 })
                }
              }}
            />
          ) : null}
        </div>
        <DialogFooter className="flex flex-row items-center justify-between gap-2 p-4">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            type="button"
            disabled={!picked}
            onClick={() => {
              if (!picked) return
              onSave(picked)
              onOpenChange(false)
            }}
          >
            Сохранить точку
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
