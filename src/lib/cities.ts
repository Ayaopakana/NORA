import type { Locale } from '@/i18n/config'
import {
  findCityByAnyName,
  findCityInList,
  getCities,
  resolveCityLabel,
  searchCitiesList,
} from '@/i18n/content/geo-cities'

export type City = {
  id: string
  name: string
  country: string
}

/** @deprecated use getCities(locale) */
export const CITIES = getCities('ru')

export { getCities, findCityByAnyName, resolveCityLabel }

export function searchCities(
  query: string,
  limit = 10,
  locale: Locale = 'ru',
): City[] {
  return searchCitiesList(getCities(locale), query, limit)
}

export function findCityByName(
  name: string,
  locale: Locale = 'ru',
): City | undefined {
  return findCityInList(getCities(locale), name)
}
