<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

<!-- BEGIN:project-context -->
# Partner Portal — Project Context

## Що це за проєкт
Партнерський кабінет для агенції нерухомості **For You Real Estate**.
Зовнішній web-портал над amoCRM: партнери бачать свої ліди в реальному часі без доступу до CRM.

## Стек
- **Backend:** Node.js + NestJS, PostgreSQL, Redis, BullMQ
- **Frontend:** Next.js, Tailwind CSS + shadcn/ui
- **Auth:** Email/password + JWT access (15 хв) / refresh (30 днів) з rotation
- **Інтеграція:** amoCRM REST API v4, OAuth2 (read-only на MVP), вхідні webhooks
- **Email:** SendGrid або Postmark (провайдер абстрагований адаптером)
- **Deploy:** GitHub Actions CI/CD → Hetzner VPS, Docker Compose, Nginx/Caddy + TLS

## Ролі
- `partner_user` — бачить тільки свої ліди, налаштовує повідомлення
- `admin` — керує партнерами, прив'язує теги, управляє доступами

## Головне правило доступу до лідів
Лід належить партнеру якщо виконується хоча б одна умова (бізнес-правило уточнюється):
1. Перетин `lead.tag_ids ∩ partner.tag_ids ≠ ∅`
2. Поле `Источник` в amoCRM відповідає дозволеним джерелам партнера

Backend виконує подвійну фільтрацію — навіть якщо amoCRM поверне зайве.
Відповідальний брокер **не впливає** на видимість ліда.

## Архітектурні обмеження MVP
- Портал **read-only** для лідів (не змінює дані в amoCRM)
- Frontend ніколи не отримує amoCRM токени
- amoCRM API: ліміт 7 req/sec → rate limiter + черга

## API Base URL
`/api/v1`

Ключові endpoint:
- `POST /auth/login` / `POST /auth/refresh` / `POST /auth/logout`
- `GET /leads` (фільтри: status, search, date, sort; пагінація 20/стор)
- `GET /leads/:id` / `GET /leads/:id/history`
- `GET /profile` / `PUT /profile/notifications`
- `GET|POST|PUT /admin/partners`
- `POST /webhook/amocrm`

## Схема БД (PostgreSQL) — ключові таблиці
- `users` — id, email, password_hash, role, partner_id, is_active
- `partners` — id, name, is_active
- `partner_tags` — partner_id, amocrm_tag_id (unique pair)
- `partner_sources` — partner_id, amocrm_source (allowed sources per partner) ← додано
- `refresh_sessions` — user_id, refresh_token_hash, expires_at, revoked_at
- `lead_snapshots` — external_lead_id, partner_id, title, status, budget, city, contact_*, broker_*, synced_at
- `lead_status_history` — external_lead_id, from_status, to_status, changed_at
- `notification_prefs` — user_id, on_status_change, on_broker_change
- `webhook_events` — event_id (unique), payload, status (received|processed|failed)
- `audit_logs` — request_id, actor_user_id, action, entity_type, metadata

## Помилки (стандартний формат)
```json
{ "error": { "code": "AUTH_FORBIDDEN", "message": "...", "request_id": "..." } }
```
Ключові коди: `AUTH_INVALID_CREDENTIALS`, `AUTH_TOKEN_EXPIRED`, `AUTH_FORBIDDEN`,
`LEAD_NOT_FOUND`, `ACCESS_DENIED_PARTNER_SCOPE`, `VALIDATION_ERROR`, `RATE_LIMITED`

## Документація проєкту
Детальні документи у папці `docs/`:
- `docs/01-contract-and-foundation.md` — повний API контракт, схема БД, auth flow, правила тегів
- `docs/02-components-catalog.md` — повний каталог frontend/backend компонентів з пріоритетами

## Порядок реалізації (vertical slices)
1. Каркас: Config, Database, Redis, AppShell, AuthLayout
2. Auth slice: login/refresh/logout + ProtectedRoute + RoleGate
3. Leads slice: list + filters + pagination + tag/source filtering
4. Lead details: details/history + broker contact CTA
5. Admin slice: partners CRUD + tag/source binding
6. Webhook + email notifications
7. CI/CD hardening + observability

## Security baseline
HTTPS, CORS allowlist, Helmet, bcrypt, JWT rotation, refresh reuse detection,
rate limiting на auth/webhook, input validation (class-validator/zod), IDOR prevention через PartnerScopeGuard.
<!-- END:project-context -->
