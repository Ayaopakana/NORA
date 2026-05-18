# NORA API

Отдельный бэкенд для фронта Next.js (`http://localhost:3000`).

## Быстрый старт

```bash
cd server
cp .env.example .env
npm install
npm run db:push
npm run dev
```

API: `http://localhost:3001`  
Проверка: `curl http://localhost:3001/health`

## Фронт

В корне проекта в `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Запуск обоих процессов (два терминала):

```bash
# терминал 1
cd server && npm run dev

# терминал 2
npm run dev
```

## Эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Проверка сервиса |
| POST | `/auth/register` | Регистрация |
| POST | `/auth/login` | Вход |
| GET | `/auth/me` | Текущий пользователь (Bearer) |
| PATCH | `/users/me` | Обновление профиля |
| GET/PATCH | `/users/me/settings` | Уведомления |
| POST | `/users/me/password` | Смена пароля |
| DELETE | `/users/me` | Удаление аккаунта |
| GET | `/users/search?q=` | Поиск людей |
| GET | `/users/:id/profile` | Публичный профиль |
| GET/POST/DELETE | `/routes` | Сохранённые маршруты |
| GET/POST | `/social/*` | Друзья, заявки, чат |
| GET/POST/PUT | `/places/*` | Отзывы и лайки мест |
| GET | `/map/places/coords` | Кэш координат мест (2GIS geocode) |
| POST | `/map/route` | Пешеходная геометрия маршрута (2GIS) |
| POST | `/map/places/refresh` | Прогнать геокодер по каталогу (только dev) |

## 2GIS (гибрид)

Карта на фронте остаётся **MapLibre + OpenFreeMap**. 2GIS используется только на бэкенде:

1. **Геокодинг** мест планера → `server/data/place-coords.json`
2. **Маршрут по дорогам** (пешком) для линии на карте

В `server/.env`:

```env
DGIS_API_KEY=ваш_ключ_из_platform.2gis.ru
```

Один раз заполнить координаты (~20 запросов, пауза 1 с):

```bash
cd server
npm run geocode:places
```

Или через API (dev): `POST http://localhost:3001/map/places/refresh`

Без ключа приложение работает как раньше: демо-координаты и прямые линии маршрута.

## База данных

По умолчанию SQLite (`server/prisma/dev.db`). Для PostgreSQL смените `provider` в `prisma/schema.prisma` и `DATABASE_URL` в `.env`.
