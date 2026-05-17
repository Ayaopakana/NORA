import type { Locale } from '../config'

export type FaqItem = { id: string; question: string; answer: string }

const FAQ: Record<Locale, FaqItem[]> = {
  ru: [
    {
      id: 'what',
      question: 'Что такое NORA?',
      answer:
        'NORA — Navigation Organized Route Assistant: адаптивный навигатор, который учитывает настроение, бюджет и ваш ментальный паспорт, чтобы подбирать места, маршруты и людей рядом.',
    },
    {
      id: 'partners',
      question: 'Как работают партнёры (кофейни и заведения)?',
      answer:
        'Мы сотрудничаем с локальными заведениями: список — в настройках, раздел «Партнёры». Там же бонусы и скидки. Покажите экран NORA на кассе или назовите промокод из карточки партнёра.',
    },
    {
      id: 'friends',
      question: 'Как найти людей и добавить в друзья?',
      answer:
        'Откройте вкладку «Поиск», введите никнейм или интересы и нажмите «Добавить». После принятия заявки (в демо — сразу) вы сможете писать в чат.',
    },
    {
      id: 'chat',
      question: 'Чат — это безопасно?',
      answer:
        'Сообщения в текущей версии хранятся локально в браузере (демо). В продакшене планируется шифрование и модерация. Не делитесь паролями и точным адресом дома.',
    },
    {
      id: 'map',
      question: 'Нужен ли интернет для карты?',
      answer:
        'Для онлайн-карты в NORA нужен интернет. Для офлайн-навигации рекомендуем Organic Maps — те же данные OpenStreetMap.',
    },
    {
      id: 'privacy',
      question: 'Куда уходят мои данные?',
      answer:
        'Профиль, зоны и друзья сейчас сохраняются в localStorage на вашем устройстве. После подключения сервера вы сможете управлять приватностью в настройках паспорта.',
    },
  ],
  en: [
    {
      id: 'what',
      question: 'What is NORA?',
      answer:
        'NORA — Navigation Organized Route Assistant: an adaptive navigator that uses your mood, budget, and mental passport to suggest places, routes, and people nearby.',
    },
    {
      id: 'partners',
      question: 'How do partner venues work?',
      answer:
        'We work with local venues listed under Settings → Partners, with perks and discounts. Show NORA at checkout or use the promo from the partner card.',
    },
    {
      id: 'friends',
      question: 'How do I find people and add friends?',
      answer:
        'Open Search, enter a nickname or interests, and tap Add. After the request is accepted (instant in the demo), you can chat.',
    },
    {
      id: 'chat',
      question: 'Is chat safe?',
      answer:
        'Messages in this demo are stored locally in your browser. Production will add encryption and moderation. Do not share passwords or your home address.',
    },
    {
      id: 'map',
      question: 'Do I need internet for the map?',
      answer:
        'NORA’s online map needs internet. For offline navigation we recommend Organic Maps with the same OpenStreetMap data.',
    },
    {
      id: 'privacy',
      question: 'Where does my data go?',
      answer:
        'Profile, zones, and friends are saved in localStorage on your device for now. Server sync and privacy controls will come in settings later.',
    },
  ],
  ky: [
    {
      id: 'what',
      question: 'NORA деген эмне?',
      answer:
        'NORA — Navigation Organized Route Assistant: көңүл-күй, бюджет жана менталдык паспортуңузду эске алган адаптивдүү навигатор.',
    },
    {
      id: 'partners',
      question: 'Өнөктөштөр кантип иштейт?',
      answer:
        'Жергиликтүү жайлар «Жөндөөлөр → Өнөктөштөр» бөлүмүндө. Бонустар жана арзандатуулар ошол жерде. Кассада NORA экранын көрсөтүңүз.',
    },
    {
      id: 'friends',
      question: 'Адамдарды кантип табам?',
      answer:
        '«Издөө» өтмөгүн ачыңыз, ник же кызыкчылыктарды жазыңыз жана «Кошуу» баскычын басыңыз. Демодо дароо чатка жазсаңыз болот.',
    },
    {
      id: 'chat',
      question: 'Чат коопсузбу?',
      answer:
        'Билдирүүлөр демодо браузерде сакталат. Сырсөздү жана үй дарегин бөлүшпөңүз.',
    },
    {
      id: 'map',
      question: 'Карта үчүн интернет керекпи?',
      answer:
        'Онлайн карта үчүн интернет керек. Офлайн үчүн Organic Maps сунушталат.',
    },
    {
      id: 'privacy',
      question: 'Маалыматтарым кайда сакталат?',
      answer:
        'Профиль, зоналар жана достор азыр түзмөгүңүздөгү localStorageта. Кийинчерээк жөндөөлөрдөн башкаруу мүмкүн болот.',
    },
  ],
  ko: [
    {
      id: 'what',
      question: 'NORA가 무엇인가요?',
      answer:
        'NORA는 기분, 예산, 멘털 패스포트를 반영해 장소·경로·주변 사람을 추천하는 적응형 내비게이터입니다.',
    },
    {
      id: 'partners',
      question: '파트너 할인은 어떻게 쓰나요?',
      answer:
        '설정 → 파트너에서 제휴 장소와 혜택을 확인하세요. 계산대에서 NORA 화면을 보여주거나 프로모 코드를 사용하세요.',
    },
    {
      id: 'friends',
      question: '사람을 찾고 친구로 추가하려면?',
      answer:
        '검색 탭에서 닉네임이나 관심사를 입력하고 추가를 누르세요. 데모에서는 바로 채팅할 수 있습니다.',
    },
    {
      id: 'chat',
      question: '채팅은 안전한가요?',
      answer:
        '데모에서는 메시지가 브라우저에만 저장됩니다. 비밀번호나 집 주소는 공유하지 마세요.',
    },
    {
      id: 'map',
      question: '지도에 인터넷이 필요한가요?',
      answer:
        '온라인 지도에는 인터넷이 필요합니다. 오프라인은 Organic Maps를 권장합니다.',
    },
    {
      id: 'privacy',
      question: '내 데이터는 어디로 가나요?',
      answer:
        '프로필·구역·친구는 현재 기기의 localStorage에 저장됩니다. 이후 설정에서 관리할 수 있습니다.',
    },
  ],
}

export function getFaqItems(locale: Locale): FaqItem[] {
  return FAQ[locale] ?? FAQ.ru
}
