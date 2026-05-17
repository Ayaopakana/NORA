import type { Locale } from '@/i18n/config'
import {
  findCountryByAnyName,
  findCountryInList,
  getCountries,
  searchCountriesList,
} from '@/i18n/content/geo-countries'

/** @deprecated use getCountries(locale) */
export type Country = { code: string; name: string }

export const COUNTRIES = getCountries('ru')

export { getCountries, findCountryByAnyName }

export function searchCountries(
  query: string,
  limit = 10,
  locale: Locale = 'ru',
): Country[] {
  return searchCountriesList(getCountries(locale), query, limit)
}

export function findCountryByName(
  name: string,
  locale: Locale = 'ru',
): Country | undefined {
  return findCountryInList(getCountries(locale), name)
}
