# Светлый — сайт благотворительной организации

Официальный сайт АНБО «Светлый» (Ярославль) — помощь бездомным и попавшим в беду животным: [lightyar.ru](https://lightyar.ru)

## Стек

- **Next.js 16** (App Router, Server Components, ISR)
- **React 19**, TypeScript
- **Tailwind CSS 4**
- **Framer Motion** + Lenis (анимации и плавный скролл)
- Данные — из [Strapi 5](https://github.com/Konnichiwaeien/lightyar-backend) через REST API

## Запуск

```bash
npm ci
cp .env.example .env.development.local   # заполнить STRAPI_READ_TOKEN и STRAPI_API_URL; NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm run dev                  # http://localhost:3000
```

Бэкенд должен быть запущен локально (см. репозиторий lightyar-backend, `docker compose -f docker-compose.dev.yml up`).

## Структура

- `app/` — страницы (главная, `/pets`, `/campaigns`, `/news`, `/about`)
- `components/` — секции и UI-компоненты (kebab-case)
- `lib/api/` — клиент Strapi и сервисы данных
- `lib/helpers/` — нормализация данных, справочники пород
- `docs/` — стандарты разработки и документация проекта

## Деплой

GitHub Actions проверяет линтер, тесты, TypeScript и компиляцию без подключения к CMS. Полная сборка страниц с данными Strapi выполняется на VPS с серверным файлом окружения до переключения приложения на новую версию.

Пуш в `master` запускает GitHub Actions workflow (`.github/workflows/deploy.yml`): сборка на сервере и запуск или перезапуск через PM2 (порт 3000, конфиг — `ecosystem.config.js`). Перед переключением версия проверяется на временном порту 3004. Nginx направляет запросы к сайту на `127.0.0.1:3000`.
