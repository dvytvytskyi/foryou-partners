# Partner Portal: Контракт і каркас (Phase 0)

## 1) Мета документа
Зафіксувати базовий технічний фундамент перед реалізацією MVP:
- API-контракти між frontend і backend
- ролі та модель доступів
- схему БД
- auth flow (JWT access/refresh)
- правила ізоляції доступу до лідів по тегах

Цей документ є source of truth для старту розробки та рев'ю.

---

## 2) Архітектурні межі (MVP)
- Портал є зовнішнім web-інтерфейсом над amoCRM.
- На MVP портал працює в режимі read-only для лідів (без запису змін у amoCRM).
- Видимість лідів визначається лише перетином тегів amoCRM і тегів партнера.
- Інтеграція з amoCRM відбувається тільки через backend.
- Frontend ніколи не отримує amoCRM токени.

---

## 3) Ролі і права доступу

### 3.1 Ролі
- partner_user: користувач партнера, бачить лише свої ліди.
- admin: внутрішній адміністратор For You Real Estate, керує партнерами і тегами.

### 3.2 Матриця доступу
- partner_user:
  - може: login/logout/refresh, читати список своїх лідів, відкривати картку свого ліда, переглядати історію статусів, керувати власними notification settings.
  - не може: переглядати чужі ліди, управляти партнерами, змінювати теги інших партнерів.
- admin:
  - може: всі можливості partner_user + CRUD партнерів, прив'язка tag_ids, керування доступами партнерів.

### 3.3 Політика авторизації
- Перевірка role-based доступу на рівні endpoint guard.
- Перевірка tenant/partner-ізоляції на рівні сервісу (додатковий бар'єр проти IDOR).

---

## 4) API контракти (v1)
Base URL: /api/v1
Формат: JSON
Auth: Bearer access token

### 4.1 Auth
1. POST /auth/login
- Призначення: вхід по email/паролю
- Request:
  - email: string
  - password: string
- Response 200:
  - access_token: string
  - refresh_token: string
  - expires_in: number
  - user:
    - id: uuid
    - role: partner_user | admin
    - partner_id: uuid | null

2. POST /auth/refresh
- Призначення: ротація refresh/access токенів
- Request:
  - refresh_token: string
- Response 200:
  - access_token: string
  - refresh_token: string
  - expires_in: number

3. POST /auth/logout
- Призначення: інвалідація поточної refresh-сесії
- Request:
  - refresh_token: string
- Response 204

4. POST /auth/password/forgot
- Призначення: ініціація reset flow
- Request:
  - email: string
- Response 202

5. POST /auth/password/reset
- Призначення: встановлення нового пароля по одноразовому токену
- Request:
  - token: string
  - new_password: string
- Response 204

### 4.2 Leads
1. GET /leads
- Призначення: список лідів з фільтрами
- Query:
  - page: number (default 1)
  - page_size: number (default 20, max 100)
  - status: string[] (optional)
  - search: string (optional, пошук по імені)
  - date_from: ISO datetime (optional)
  - date_to: ISO datetime (optional)
  - sort_by: updated_at | created_at
  - sort_dir: asc | desc
- Response 200:
  - items: LeadListItem[]
  - pagination:
    - page: number
    - page_size: number
    - total: number

LeadListItem:
- id: string (external amoCRM lead id)
- title: string
- status: string
- budget: number | null
- city: string | null
- contact_name: string | null
- contact_phone: string | null
- broker_name: string | null
- updated_at: ISO datetime

2. GET /leads/:id
- Призначення: детальна картка ліда
- Response 200:
  - id: string
  - title: string
  - status: string
  - created_at: ISO datetime
  - updated_at: ISO datetime
  - budget: number | null
  - city: string | null
  - comment: string | null
  - contact:
    - name: string | null
    - phone: string | null
    - email: string | null
  - broker:
    - name: string | null
    - phone: string | null
    - email: string | null
  - tags: string[]

3. GET /leads/:id/history
- Призначення: історія зміни статусів
- Response 200:
  - items:
    - from_status: string | null
    - to_status: string
    - changed_at: ISO datetime
    - changed_by: string | null

### 4.3 Profile
1. GET /profile
- Response 200:
  - user_id: uuid
  - email: string
  - role: partner_user | admin
  - partner_id: uuid | null
  - notification_settings:
    - on_status_change: boolean
    - on_broker_change: boolean

2. PUT /profile/notifications
- Request:
  - on_status_change: boolean
  - on_broker_change: boolean
- Response 200:
  - on_status_change: boolean
  - on_broker_change: boolean

### 4.4 Admin
1. GET /admin/partners
- Доступ: admin
- Response 200:
  - items:
    - id: uuid
    - name: string
    - tag_ids: number[]
    - users_count: number
    - is_active: boolean

2. POST /admin/partners
- Доступ: admin
- Request:
  - name: string
  - tag_ids: number[]
  - users:
    - email: string
    - temp_password: string
- Response 201:
  - id: uuid

3. PUT /admin/partners/:id
- Доступ: admin
- Request:
  - name: string (optional)
  - tag_ids: number[] (optional)
  - is_active: boolean (optional)
- Response 200:
  - id: uuid
  - updated_at: ISO datetime

### 4.5 Webhook
1. POST /webhook/amocrm
- Призначення: вхідні події зі зміною статусу/відповідального
- Безпека: secret signature + allowlist IP (за можливості)
- Response 202

### 4.6 Стандарти помилок
Усі помилки повертаються у форматі:
- error:
  - code: string
  - message: string
  - request_id: string

Основні коди:
- AUTH_INVALID_CREDENTIALS
- AUTH_TOKEN_EXPIRED
- AUTH_FORBIDDEN
- LEAD_NOT_FOUND
- ACCESS_DENIED_PARTNER_SCOPE
- VALIDATION_ERROR
- RATE_LIMITED
- INTERNAL_ERROR

---

## 5) Схема БД (PostgreSQL)

### 5.1 Таблиці
1. users
- id uuid pk
- email varchar unique not null
- password_hash varchar not null
- role varchar not null (partner_user | admin)
- partner_id uuid null fk -> partners.id
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz

2. partners
- id uuid pk
- name varchar not null
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz

3. partner_tags
- id bigserial pk
- partner_id uuid not null fk -> partners.id
- amocrm_tag_id bigint not null
- created_at timestamptz
- unique(partner_id, amocrm_tag_id)

4. refresh_sessions
- id uuid pk
- user_id uuid not null fk -> users.id
- refresh_token_hash varchar not null
- expires_at timestamptz not null
- revoked_at timestamptz null
- user_agent varchar null
- ip inet null
- created_at timestamptz

5. lead_snapshots
- id bigserial pk
- external_lead_id bigint not null
- partner_id uuid not null fk -> partners.id
- title varchar not null
- status varchar not null
- budget numeric null
- city varchar null
- contact_name varchar null
- contact_phone varchar null
- broker_name varchar null
- broker_phone varchar null
- updated_at_source timestamptz not null
- synced_at timestamptz not null
- unique(external_lead_id, partner_id)

6. lead_status_history
- id bigserial pk
- external_lead_id bigint not null
- partner_id uuid not null fk -> partners.id
- from_status varchar null
- to_status varchar not null
- changed_at timestamptz not null
- changed_by varchar null
- created_at timestamptz

7. notification_prefs
- user_id uuid pk fk -> users.id
- on_status_change boolean default true
- on_broker_change boolean default true
- updated_at timestamptz not null

8. webhook_events
- id bigserial pk
- event_id varchar unique not null
- source varchar not null
- payload jsonb not null
- received_at timestamptz not null
- processed_at timestamptz null
- status varchar not null (received | processed | failed)
- error_message text null

9. audit_logs
- id bigserial pk
- request_id varchar not null
- actor_user_id uuid null
- actor_role varchar null
- action varchar not null
- entity_type varchar not null
- entity_id varchar null
- metadata jsonb null
- created_at timestamptz not null

### 5.2 Індекси
- users(email)
- users(partner_id)
- partner_tags(partner_id)
- lead_snapshots(partner_id, updated_at_source desc)
- lead_snapshots(external_lead_id)
- lead_status_history(partner_id, changed_at desc)
- webhook_events(status, received_at)
- audit_logs(created_at desc)

---

## 6) Auth flow (JWT access/refresh)

### 6.1 Login flow
1. Користувач відправляє email/password на /auth/login.
2. Backend перевіряє password_hash (bcrypt).
3. Backend створює access token (short TTL, наприклад 15 хв).
4. Backend створює refresh token (long TTL, наприклад 30 днів) і зберігає hash у refresh_sessions.
5. Frontend зберігає токени без доступу третіх сторін (рекомендовано secure cookie або in-memory + refresh cookie).

### 6.2 Refresh flow
1. Frontend надсилає refresh token на /auth/refresh.
2. Backend валідує токен і знаходить активну сесію.
3. Виконується rotation: старий refresh revoke, новий refresh issue.
4. Повертається новий access і refresh.

### 6.3 Logout flow
1. Frontend викликає /auth/logout з refresh token.
2. Backend позначає refresh session revoked.
3. Після logout refresh більше недійсний.

### 6.4 Password reset
1. /auth/password/forgot генерує одноразовий токен з коротким TTL.
2. Email містить лінк на reset.
3. /auth/password/reset приймає token + new_password.
4. Backend скидає всі активні refresh sessions користувача.

---

## 7) Правила доступу до лідів по тегах

### 7.1 Базове правило
Lead доступний користувачу партнера тоді і тільки тоді, коли існує перетин:
- lead.tag_ids ∩ partner.tag_ids != порожньо

### 7.2 Де перевіряється
- На рівні сервісу перед поверненням будь-якого ліда у /leads, /leads/:id, /leads/:id/history.
- Додаткова перевірка виконується навіть після фільтрації запиту до amoCRM.

### 7.3 Псевдоалгоритм
1. Отримати partner_tag_ids з БД.
2. Запросити ліди з amoCRM (із первинним фільтром за тегом, якщо API дозволяє).
3. Для кожного ліда перевірити перетин тегів локально.
4. Повернути лише дозволені ліди.
5. Для endpoint з id перед поверненням конкретного ліда окремо перевірити перетин; інакше 403.

### 7.4 Інваріанти безпеки
- Відповідальний брокер не впливає на видимість у порталі.
- Зміна tag_ids партнера в адмінці має вступати в силу одразу.
- При відсутності tag_ids партнер не бачить жодного ліда.

---

## 8) Нефункціональні вимоги, що впливають на каркас
- Продуктивність: список лідів до 3 сек при великому обсязі.
- Кешування: Redis TTL 60 сек для read-патернів.
- Ліміти amoCRM: не перевищувати 7 req/sec (rate limiter + queue).
- Спостережуваність: request_id, audit trail, метрики latency/error.
- Безпека: HTTPS, CORS allowlist, валідація DTO, ротація секретів, захист auth endpoint від brute force.

---

## 9) Definition of Ready для старту коду
Вважати Phase 0 завершеним, коли:
- узгоджено ролі і матрицю доступів;
- затверджено перелік endpoint і формати DTO;
- затверджено схему БД і ключові індекси;
- описаний auth flow і політика refresh rotation;
- формалізоване правило tag-based ізоляції та edge cases.

Після цього команда переходить до vertical slices:
1) Auth,
2) Leads list,
3) Lead details/history,
4) Admin partners/tags.
