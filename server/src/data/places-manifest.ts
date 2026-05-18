/** Список мест планера для геокодирования через 2GIS (один раз → кэш). */
export type PlaceManifestEntry = {
  id: string
  query: string
  /** Запасной запрос, если основной даёт неточную точку */
  fallbackQuery?: string
}

export const PLACES_GEOCODE_MANIFEST: PlaceManifestEntry[] = [
  { id: 'calm-1', query: 'Бишкек, Sierra Coffee, ул. Киевская 107' },
  { id: 'calm-2', query: 'Бишкек, парк Дубовый, бульвар Эркиндик' },
  { id: 'calm-3', query: 'Бишкек, Kitap.kg, проспект Чуй 124' },
  { id: 'calm-4', query: 'Бишкек, площадь Ала-Тоо' },
  { id: 'energy-1', query: 'Бишкек, Ошский базар, ул. Айни 14' },
  { id: 'energy-2', query: 'Бишкек, площадь Ала-Тоо' },
  { id: 'energy-3', query: 'Бишкек, парк Победы' },
  { id: 'energy-4', query: 'Бишкек, Supara Ethno-Complex, ул. Карасаева 1' },
  { id: 'energy-5', query: 'Бишкек, Bar 12, ул. Киевская 77' },
  { id: 'tired-1', query: 'Бишкек, Coffee 3.0, ул. Токтогула 87' },
  { id: 'tired-2', query: 'Бишкек, бульвар Эркиндик' },
  { id: 'tired-3', query: 'Бишкек, Faiza, ул. Жибек-Жолу 555' },
  { id: 'tired-4', query: 'Бишкек, чайхана Бухара, ул. Ибраимова 103' },
  { id: 'anxious-1', query: 'Бишкек, парк им. Панфилова' },
  { id: 'anxious-2', query: 'Бишкек, сквер у филармонии, пр. Чуй 245' },
  { id: 'anxious-3', query: 'Бишкек, ботанический сад, ул. Коенкозова' },
  { id: 'anxious-4', query: 'Бишкек, Ants Cafe, ул. Ахунбаева 127' },
  {
    id: 'event-calm-1',
    query: 'Кыргызстан, этнокомплекс Дордой, Кашка-Суу',
  },
  { id: 'event-energy-1', query: 'Бишкек, Орто-Сай, проспект Чуй' },
]
