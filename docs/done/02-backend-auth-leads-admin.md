# DONE: Backend slices (Auth + Leads + Admin)

Дата: 2026-04-18

## Реалізовано

### 1. Auth slice (end-to-end)
- `POST /api/v1/auth/login`
  - перевірка email/password
  - видача `access_token` + `refresh_token`
  - створення `refresh_sessions` запису
- `POST /api/v1/auth/refresh`
  - валідація refresh token
  - rotation refresh token
  - reuse detection (при невідповідності revoke всіх активних сесій)
- `POST /api/v1/auth/logout`
  - revoke поточної refresh-сесії
- `POST /api/v1/auth/password/forgot`
  - endpoint-заглушка (accepted)
- `POST /api/v1/auth/password/reset`
  - endpoint-заглушка (no content)

Додано:
- JWT strategy
- JWT auth guard
- roles decorator/guard
- current-user decorator
- DTO для auth endpoint

### 2. Leads slice
- `GET /api/v1/leads`
  - пагінація, фільтри, пошук, сортування
  - backend visibility filter: `tag_ids` OR `Источник` (`amocrm_source`)
- `GET /api/v1/leads/:id`
  - детальна картка
- `GET /api/v1/leads/:id/history`
  - історія статусів

Додано:
- Leads module/controller/service
- DTO для query параметрів
- partner scope resolver (admin вимагає `partner_id`)

### 3. Admin slice (partners/tags/sources CRUD)
- `GET /api/v1/admin/partners`
- `POST /api/v1/admin/partners`
  - створення партнера
  - прив'язка `tag_ids`
  - прив'язка `source_values`
  - опційне створення `partner_user`
- `PUT /api/v1/admin/partners/:id`
  - update name/is_active
  - повна заміна tags/sources binding

Додано:
- Admin module/controller/service
- DTO create/update partner
- role restriction: тільки `admin`

### 4. Core backend wiring
- `AppModule` підключено до:
  - `ThrottlerModule`
  - `AuthModule`
  - `LeadsModule`
  - `AdminModule`
- Залишені й працюють:
  - ConfigModule
  - DatabaseModule
  - RedisModule
  - HealthModule

### 5. Data layer
- Prisma schema вже включає:
  - `partner_sources` (для `Источник`)
  - `lead_snapshots.amocrm_source`
  - усі таблиці з контракту

## Супутня документація
- Створено frontend інтеграційний гайд:
  - `docs/03-frontend-backend-integration.md`

## Технічна валідація
- Виконано: `npm run build` у `backend/`
- Виконано: `npm run db:generate` у `backend/`
- Статус: успішно (без compile помилок)

## Оновлення по підключенню БД (2026-04-18)
- `docker-compose.yml` оновлено: backend більше не перезаписує `DATABASE_URL` жорстко під локальний postgres.
- Додано fallback-логіку:
  - якщо `DATABASE_URL` заданий (Neon/Supabase/інша хмара), backend працює з ним;
  - якщо ні, використовується локальний postgres у compose.
- Додано initial Prisma migration:
  - `backend/prisma/migrations/20260418122000_init/migration.sql`
  - `backend/prisma/migrations/migration_lock.toml`
- Очищено `.env.example` від реальних секретів і залишено безпечні плейсхолдери.
- Config валідація синхронізована з AMO_* змінними.

## Що лишилось (наступні задачі)
- Реально застосувати міграції у цільовій БД: `npm run db:migrate`
- Додати webhook module (idempotency + processing)
- Реалізувати forgot/reset password з email провайдером
- Додати audit logging middleware/service
- Додати інтеграційні тести для auth rotation, partner scope, admin RBAC
