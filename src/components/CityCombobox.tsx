'use client'

import * as React from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useI18n } from '@/hooks/useI18n'
import {
  findCityByAnyName,
  findCityInList,
  resolveCityLabel,
  searchCitiesList,
} from '@/i18n/content/geo-cities'
import { getCities } from '@/lib/cities'
import type { City } from '@/lib/cities'

type CityComboboxProps = {
  value: string
  onChange: (cityName: string) => void
  placeholder: string
  label: string
  id?: string
}

export function CityCombobox({
  value,
  onChange,
  placeholder,
  label,
  id,
}: CityComboboxProps) {
  const { locale, t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const cities = React.useMemo(() => getCities(locale), [locale])
  const displayValue = React.useMemo(
    () => resolveCityLabel(value, locale),
    [value, locale],
  )
  const selectedCityId = React.useMemo(
    () => findCityByAnyName(value)?.id,
    [value],
  )

  React.useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const trimmed = search.trim()
  const matches = searchCitiesList(cities, trimmed, 8)
  const exact = trimmed ? findCityInList(cities, trimmed) : undefined
  const showSimilar =
    trimmed.length > 0 && !exact && matches.length > 0
  const showCustom =
    trimmed.length >= 2 && !exact && !matches.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    )

  function pick(city: City) {
    onChange(city.name)
    setOpen(false)
    setSearch('')
  }

  function pickCustom(name: string) {
    onChange(name.trim())
    setOpen(false)
    setSearch('')
  }

  function handleEnter() {
    if (!trimmed) return
    if (exact) {
      pick(exact)
      return
    }
    if (matches[0]) {
      pick(matches[0])
      return
    }
    pickCustom(trimmed)
  }

  return (
    <div className="relative z-20">
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger
          id={id}
          role="combobox"
          aria-expanded={open}
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'default' }),
            'h-12 w-full justify-between rounded-glass border border-[var(--nora-border-subtle)] px-3 font-normal shadow-glass hover:shadow-glass-lg',
          )}
        >
          <span className="truncate text-left">
            {displayValue || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
        </PopoverTrigger>
        <PopoverContent
          className="p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false}>
            <span className="sr-only">{label}</span>
            <CommandInput
              placeholder={t('combobox.searchCity')}
              value={search}
              onValueChange={setSearch}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleEnter()
                }
              }}
            />
            <CommandList>
              {trimmed.length === 0 ? (
                <CommandGroup heading={t('combobox.popular')}>
                  {searchCitiesList(cities, '', 10).map((c) => (
                    <CityItem
                      key={c.id}
                      city={c}
                      selected={selectedCityId === c.id}
                      onPick={() => pick(c)}
                    />
                  ))}
                </CommandGroup>
              ) : null}

              {exact ? (
                <CommandGroup heading={t('combobox.exactMatch')}>
                  <CityItem
                    city={exact}
                    selected={selectedCityId === exact.id}
                    onPick={() => pick(exact)}
                  />
                </CommandGroup>
              ) : null}

              {showSimilar ? (
                <CommandGroup heading={t('combobox.didYouMean')}>
                  {matches.map((c) => (
                    <CityItem
                      key={c.id}
                      city={c}
                      selected={selectedCityId === c.id}
                      onPick={() => pick(c)}
                    />
                  ))}
                </CommandGroup>
              ) : null}

              {showCustom ? (
                <CommandGroup>
                  <CommandItem
                    value={`custom-${trimmed}`}
                    onSelect={() => pickCustom(trimmed)}
                    className="text-sky-300"
                  >
                    {t('combobox.useCustom', { value: trimmed })}
                  </CommandItem>
                </CommandGroup>
              ) : null}

              {trimmed.length > 0 &&
              !exact &&
              matches.length === 0 &&
              trimmed.length < 2 ? (
                <p className="px-3 py-4 text-center text-sm text-[var(--nora-text-muted)]">
                  {t('combobox.cityTypeMore')}
                </p>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function CityItem({
  city,
  selected,
  onPick,
}: {
  city: City
  selected: boolean
  onPick: () => void
}) {
  return (
    <CommandItem
      value={city.id}
      onSelect={onPick}
      onMouseDown={(e) => {
        e.preventDefault()
        onPick()
      }}
    >
      <Check
        className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')}
      />
      <span className="flex flex-col">
        <span>{city.name}</span>
        <span className="text-[11px] text-[var(--nora-text-muted)]">
          {city.country}
        </span>
      </span>
    </CommandItem>
  )
}
