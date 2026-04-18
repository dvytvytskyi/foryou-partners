# DONE: Backend slices (Auth + Leads + Admin)

Дата: 2026-04-18

Оновлено: 2026-04-18 (board endpoint + forgot/reset + webhook sync + audit + unit/e2e)

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
  - повертає `accepted: true`
  - не розкриває, чи існує email
  - якщо user існує: генерує reset token, зберігає в Redis (TTL 1 година)
  - формує reset link і відправляє email через EmailService
- `POST /api/v1/auth/password/reset`
  - валідує reset token з Redis
  - оновлює пароль користувача (bcrypt)
  - інвалідує reset token
  - revoke всіх активних refresh-сесій користувача

Додано:
- JWT strategy
- JWT auth guard
- roles decorator/guard
- current-user decorator
- DTO для auth endpoint
- Email module/service (SendGrid/Postmark adapter)
- Використання Redis для password reset token flow

### 2. Leads slice
- `GET /api/v1/leads`
  - пагінація, фільтри, пошук, сортування
  - backend visibility filter: `tag_ids` OR `Источник` (`amocrm_source`)
- `GET /api/v1/leads/board`
  - kanban-подібна структура для UI (pipelines -> columns -> cards)
  - ті ж partner scope + visibility правила (tag/source)
  - підтримує `search`, `status`, `date_from`, `date_to`, `sort_dir`
  - підтримує `board_limit` (default 500, max 1000)
  - намагається тягнути live pipelines/statuses з amoCRM
  - fallback: якщо amoCRM pipelines недоступні, групує локально по `status`
- `GET /api/v1/leads/:id`
  - детальна картка
- `GET /api/v1/leads/:id/history`
  - історія статусів

Додано:
- Leads module/controller/service
- DTO для query параметрів
- partner scope resolver (admin вимагає `partner_id`)
- board response aggregation (pipeline/status columns)
- optional config key: `AMO_ACCESS_TOKEN` для live pipelines endpoint

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
  - `WebhookModule`
  - `AuditModule`
- Залишені й працюють:
  - ConfigModule
  - DatabaseModule
  - RedisModule
  - HealthModule

### 5. Data layer
- Prisma schema вже включає:
  - `partner_sources` (для `Источник`)
  - `lead_snapshots.amocrm_source`
  - `webhook_events`
  - `audit_logs`
  - усі таблиці з контракту

### 6. Webhook + Audit (дороблено)
- `POST /api/v1/webhook/amocrm`
  - перевірка підпису через `x-webhook-secret` (якщо `WEBHOOK_SECRET` заданий)
  - idempotency через унікальний `event_id` / `x-webhook-event-id`
  - події пишуться в `webhook_events`, duplicate запити ігноруються без помилки
  - бізнес-обробка payload:
    - витягує lead changes з webhook payload
    - upsert в `lead_snapshots` для релевантних партнерів (source/tag match або існуючий binding)
    - запис у `lead_status_history` при зміні статусу
  - статуси webhook event: `received -> processed|failed` + `error_message`
- Audit logging
  - глобальний interceptor для mutating-запитів (`POST|PUT|PATCH|DELETE`)
  - пише в `audit_logs`: actor, request_id, action, entity, status, duration, ip, user-agent, помилку (якщо була)
  - trace id (`X-Request-ID`) додається на всі HTTP запити

### 7. amoCRM pipelines reliability (дороблено)
- `GET /api/v1/leads/board`
  - додано Redis кеш pipelines (`amo:pipelines:v1`, TTL 120s)
  - додано авто-refresh access token через `AMO_REFRESH_TOKEN` (OAuth refresh flow)
  - підтримано retry при `401` від amoCRM pipelines API
  - додано retry/backoff для зовнішніх викликів (429/5xx/network) + warning/error логування

## Супутня документація
- Створено frontend інтеграційний гайд:
  - `docs/03-frontend-backend-integration.md`

## Технічна валідація
- Виконано: `npm run build` у `backend/`
- Виконано: `npm run db:generate` у `backend/`
- Виконано: `npm test -- --runInBand` у `backend/`
- Виконано: `npm run test:e2e` у `backend/`
- Статус: успішно (без compile помилок)

Покрито тестами:
- `auth.service.spec.ts`: refresh token reuse detection -> revoke all + `AUTH_FORBIDDEN`
- `leads.service.spec.ts`: admin без `partner_id` -> `VALIDATION_ERROR`
- `admin.controller.spec.ts`: RBAC metadata тільки `admin`
- `test/auth.e2e-spec.ts`: HTTP login endpoint (контракт відповіді)
- `test/webhook.e2e-spec.ts`: HTTP webhook endpoint (event_id/signature pass-through)

## Оновлення по підключенню БД (2026-04-18)
- `docker-compose.yml` оновлено: backend використовує зовнішній `DATABASE_URL` (цільовий сценарій: Neon/Postgres cloud).
- Додано initial Prisma migration:
  - `backend/prisma/migrations/20260418122000_init/migration.sql`
  - `backend/prisma/migrations/migration_lock.toml`
- Очищено `.env.example` від реальних секретів і залишено безпечні плейсхолдери.
- Config валідація синхронізована з AMO_* змінними.
- Додано optional `AMO_REFRESH_TOKEN` для OAuth token refresh.

## Production/Deploy уточнення (стан на 2026-04-18)
- Backend image переведено на `node:20-slim` для сумісності Prisma engine.
- У backend Docker build додано `prisma generate` перед `npm run build`.
- Healthcheck backend у compose переведено на `curl`.
- Redis працює тільки у внутрішній мережі compose (без зовнішнього bind-порту).
- На цільовому сервері використовується системний `nginx` + `certbot` (SSL), без Caddy-контейнера.

## Що лишилось (наступні задачі)
- Підключити enrichment lead даних з amoCRM API (контакти/брокер/custom fields) у webhook processing
- Розширити e2e сценарії до повних flow (refresh/logout/admin CRUD/leads board)
- Додати метрики/дашборд observability (latency, error rate, external API retry counters)
