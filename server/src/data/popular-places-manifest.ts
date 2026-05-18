import type { PlaceManifestEntry } from './places-manifest.js'

/**
 * Популярные POI Бишкека: парки, отели, кафе, бары, ТРЦ, культура.
 * Геокодируются в server/data/place-coords.json (пропуск уже сохранённых).
 */
export const POPULAR_PLACES_MANIFEST: PlaceManifestEntry[] = [
  // Парки и отдых на воздухе
  { id: 'poi-park-panfilov', query: 'Бишкек, парк им. Панфилова' },
  { id: 'poi-park-pobedy', query: 'Бишкек, парк Победы' },
  { id: 'poi-park-dubovy', query: 'Бишкек, парк Дубовый' },
  { id: 'poi-park-ata-turk', query: 'Бишкек, парк Ататюрка' },
  { id: 'poi-park-botanic', query: 'Бишкек, ботанический сад' },
  { id: 'poi-park-molodezhny', query: 'Бишкек, парк Молодёжный' },
  { id: 'poi-park-ak-keme', query: 'Бишкек, парк Ак-Кеме, проспект Манаса 8' },
  { id: 'poi-bulvar-erkendik', query: 'Бишкек, бульвар Эркиндик' },
  { id: 'poi-skver-toktogul', query: 'Бишкек, сквер им. Токтогула' },
  { id: 'poi-ploshchad-ala-too', query: 'Бишкек, площадь Ала-Тоо' },
  {
    id: 'poi-park-yuzhny',
    query: 'Бишкек, Южный парк, микрорайон Восток-5',
  },
  {
    id: 'poi-zoo',
    query: 'Бишкек, зоопарк, проспект Молодёжный 3',
    fallbackQuery: 'Бишкек, зоологический сад, ул. Раззакова 37',
  },

  // Отели
  {
    id: 'poi-hotel-hyatt',
    query: 'Бишкек, Hyatt Regency Bishkek, ул. Токтогула 107',
  },
  { id: 'poi-hotel-orion', query: 'Бишкек, Orion Hotel, проспект Манаса 158' },
  { id: 'poi-hotel-plaza', query: 'Бишкек, Plaza Hotel, пр. Манаса 49' },
  { id: 'poi-hotel-ambassador', query: 'Бишкек, Ambassador Hotel, пр. Молодёжная 113' },
  { id: 'poi-hotel-smart', query: 'Бишкек, Smart Hotel, ул. Токтогула 105' },
  { id: 'poi-hotel-damas', query: 'Бишкек, Damas Hotel, ул. Боконбаева 129' },
  {
    id: 'poi-hotel-ak-keme',
    query: 'Бишкек, отель Ак-Кеме, проспект Манаса 8',
  },
  { id: 'poi-hotel-solutel', query: 'Бишкек, Solutel Hotel, ул. Боконбаева 125' },
  { id: 'poi-hotel-novotel', query: 'Бишкек, Novotel Bishkek City Center, пр. Манаса 16' },

  // Кафе и кофейни
  { id: 'poi-cafe-sierra', query: 'Бишкек, Sierra Coffee, ул. Киевская 107' },
  { id: 'poi-cafe-coffee30', query: 'Бишкек, Coffee 3.0, ул. Токтогула 87' },
  { id: 'poi-cafe-ants', query: 'Бишкек, Ants Cafe, ул. Ахунбаева 127' },
  { id: 'poi-cafe-skovoroda', query: 'Бишкек, Сковорода, проспект Чуй 150' },
  { id: 'poi-cafe-casa', query: 'Бишкек, Casa Coffee, ул. Абдрахманова 144' },
  { id: 'poi-cafe-coffee-mood', query: 'Бишкек, Coffee Mood, пр. Чуй 126' },
  { id: 'poi-cafe-gap', query: 'Бишкек, Gap Food, пр. Чуй 164' },
  { id: 'poi-cafe-teplo', query: 'Бишкек, кафе Тепло, ул. Ахунбаева 113' },

  // Рестораны и общепит
  { id: 'poi-rest-supara', query: 'Бишкек, Supara Ethno-Complex, ул. Карасаева 1' },
  { id: 'poi-rest-faiza', query: 'Бишкек, Faiza, ул. Жибек-Жолу 555' },
  { id: 'poi-rest-buhara', query: 'Бишкек, чайхана Бухара, ул. Ибраимова 103' },
  {
    id: 'poi-rest-navigator',
    query: 'Бишкек, ресторан Navigator, проспект Манаса 57',
  },
  { id: 'poi-rest-chicken-star', query: 'Бишкек, Chicken Star, пр. Чуй 127' },
  { id: 'poi-rest-arzu', query: 'Бишкек, Arzu, ул. Ибраимова 78' },
  {
    id: 'poi-rest-ethno-complex',
    query: 'Бишкек, этно-комплекс Алай, ул. Карасаева 51',
  },
  { id: 'poi-rest-mughal', query: 'Бишкек, Mughal, пр. Чуй 127' },
  { id: 'poi-rest-navat', query: 'Бишкек, Navat, проспект Чуй 96' },
  {
    id: 'poi-rest-old-bukhara',
    query: 'Бишкек, ресторан Old Bukhara, ул. Ибраимова',
  },

  // Бары и ночная жизнь
  { id: 'poi-bar-12', query: 'Бишкек, Bar 12, ул. Киевская 77' },
  { id: 'poi-bar-save-the-ales', query: 'Бишкек, Save the Ales, ул. Московская 189' },
  { id: 'poi-bar-ipub', query: 'Бишкек, I-Pub, ул. Киевская 107' },
  { id: 'poi-bar-metro-pub', query: 'Бишкек, Metro Pub, ул. Панфилова 148' },
  { id: 'poi-bar-pinta', query: 'Бишкек, Pinta Pub, ул. Коенкозова 75' },
  { id: 'poi-bar-garage', query: 'Бишкек, Garage Pub, ул. Киевская 87' },
  { id: 'poi-bar-klub-kvartira', query: 'Бишкек, клуб Квартира, ул. Киевская 109' },
  { id: 'poi-bar-promzona', query: 'Бишкек, Promzona, ул. Щербакова 1' },

  // Торговые центры
  {
    id: 'poi-mall-bishkek-park',
    query: 'Бишкек, торговый центр Bishkek Park, проспект Чуй',
  },
  { id: 'poi-mall-asia-mall', query: 'Бишкек, Asia Mall, проспект Манаса 62' },
  { id: 'poi-mall-tsum', query: 'Бишкек, ЦУМ' },
  { id: 'poi-mall-dordoi-plaza', query: 'Бишкек, Dordoi Plaza' },
  { id: 'poi-mall-globus', query: 'Бишкек, торговый центр Globus' },
  { id: 'poi-mall-vesna', query: 'Бишкек, торговый центр Весна' },

  // Рынки
  { id: 'poi-market-osh', query: 'Бишкек, Ошский базар, ул. Айни 14' },
  { id: 'poi-market-dordoi', query: 'Бишкек, рынок Дордой, село Сокулук' },
  { id: 'poi-market-ortosai', query: 'Бишкек, Орто-Сай, проспект Чуй' },

  // Культура и музеи
  { id: 'poi-culture-philharmonic', query: 'Бишкек, Кыргызская национальная филармония' },
  { id: 'poi-culture-opera', query: 'Бишкек, театр оперы и балета' },
  { id: 'poi-culture-history-museum', query: 'Бишкек, Государственный исторический музей' },
  { id: 'poi-culture-art-museum', query: 'Бишкек, музей изобразительных искусств' },
  { id: 'poi-culture-russian-theatre', query: 'Бишкек, русский драматический театр' },
  {
    id: 'poi-culture-manas',
    query: 'Бишкек, памятник Манаса, площадь Манаса',
  },

  // Спорт и развлечения
  {
    id: 'poi-fun-aquapark',
    query: 'Бишкек, аквапарк Ак-Кеме, проспект Манаса 8',
  },
  { id: 'poi-fun-ice-palace', query: 'Бишкек, ледовый дворец, ул. Юргенева 11' },
  { id: 'poi-fun-spartak-stadium', query: 'Бишкек, стадион Спартак' },
  { id: 'poi-fun-dordoi-ethno', query: 'Кыргызстан, этнокомплекс Дордой, Кашка-Суу' },

  // Коворкинги и книги
  { id: 'poi-work-kitap', query: 'Бишкек, Kitap.kg, проспект Чуй 124' },
  { id: 'poi-work-impact-hub', query: 'Бишкек, Impact Hub, ул. Исанова 78' },
  { id: 'poi-work-fablab', query: 'Бишкек, FabLab KG, пр. Чуй 124' },
]
