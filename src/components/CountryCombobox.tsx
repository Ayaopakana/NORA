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
  findCountryInList,
  searchCountriesList,
} from '@/i18n/content/geo-countries'
import type { Country } from '@/lib/countries'

type CountryComboboxProps = {
  countries: Country[]
  value: string
  onChange: (code: string) => void
  placeholder: string
  label: string
  id?: string
}

export function CountryCombobox({
  countries,
  value,
  onChange,
  placeholder,
  label,
  id,
}: CountryComboboxProps) {
  const { t } = useI18n()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selected = countries.find((c) => c.code === value)

  React.useEffect(() => {
    if (!open) setSearch('')
  }, [open])

  const trimmed = search.trim()
  const pool = countries.length ? countries : []
  const matches = searchCountriesList(pool, trimmed, 10)
  const exact = trimmed ? findCountryInList(pool, trimmed) : undefined
  const exactInPool = Boolean(exact)
  const showSimilar =
    trimmed.length > 0 && !exactInPool && matches.length > 0

  function pick(code: string) {
    onChange(code)
    setOpen(false)
    setSearch('')
  }

  function handleEnter() {
    if (!trimmed) return
    if (exactInPool && exact) {
      pick(exact.code)
      return
    }
    if (matches[0]) {
      pick(matches[0].code)
      return
    }
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
            {selected ? selected.name : placeholder}
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
              placeholder={t('combobox.searchCountry')}
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
                <CommandGroup>
                  {pool.slice(0, 12).map((c) => (
                    <CountryItem
                      key={c.code}
                      country={c}
                      selected={value === c.code}
                      onPick={() => pick(c.code)}
                    />
                  ))}
                </CommandGroup>
              ) : null}

              {exactInPool && exact ? (
                <CommandGroup heading={t('combobox.exactMatch')}>
                  <CountryItem
                    country={exact}
                    selected={value === exact.code}
                    onPick={() => pick(exact.code)}
                  />
                </CommandGroup>
              ) : null}

              {showSimilar ? (
                <CommandGroup heading={t('combobox.didYouMean')}>
                  {matches.map((c) => (
                    <CountryItem
                      key={c.code}
                      country={c}
                      selected={value === c.code}
                      onPick={() => pick(c.code)}
                    />
                  ))}
                </CommandGroup>
              ) : null}

              {trimmed.length > 0 && !exactInPool && matches.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-[var(--nora-text-muted)]">
                  {t('combobox.countryNotFound')}
                </p>
              ) : null}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function CountryItem({
  country,
  selected,
  onPick,
}: {
  country: Country
  selected: boolean
  onPick: () => void
}) {
  return (
    <CommandItem
      value={country.code}
      onSelect={onPick}
      onMouseDown={(e) => {
        e.preventDefault()
        onPick()
      }}
    >
      <Check
        className={cn('mr-2 h-4 w-4', selected ? 'opacity-100' : 'opacity-0')}
      />
      {country.name}
    </CommandItem>
  )
}
