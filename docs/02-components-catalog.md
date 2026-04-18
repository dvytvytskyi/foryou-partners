# Partner Portal: Повний каталог компонентів

## 1) Мета документа
Цей документ фіксує повний список компонентів, які потрібно реалізувати для Partner Portal:
- frontend компоненти (UI + feature + layout)
- backend компоненти (модулі, сервіси, guards, jobs)
- інтеграційні компоненти (amoCRM, email)
- data/security/infra компоненти

Документ структурований так, щоб команда могла планувати реалізацію по MVP і наступних ітераціях.

---

## 2) Принципи декомпозиції
- Component-first: спочатку базові UI primitives, потім доменні feature-компоненти.
- Vertical slices: кожна фіча містить frontend + backend + data + tests.
- Security-by-default: кожен компонент має враховувати авторизацію і tenant-ізоляцію.
- Observable-by-default: ключові компоненти мають логування/метрики/trace-id.

---

## 3) Frontend компоненти (Next.js)

## 3.1 App shell і роутинг
1. AppShell
- Що робить: загальна рамка застосунку (header/sidebar/content).
- Де використовується: всі авторизовані сторінки.
- Пріоритет: MVP.

2. AuthLayout
- Що робить: окремий layout для login/reset flow.
- Пріоритет: MVP.

3. ProtectedRoute
- Що робить: перевірка auth state + redirect на login.
- Пріоритет: MVP.

4. RoleGate
- Що робить: обмежує доступ до admin-секцій за роллю.
- Пріоритет: MVP.

## 3.2 Design tokens і primitives
1. ThemeTokens
- Кольори, spacing, border radius, typography, shadows.
- Пріоритет: MVP.

2. Typography
- Компоненти: Heading, Text, Label, Caption.
- Пріоритет: MVP.

3. Button
- Варіанти: primary, secondary, ghost, danger; loading state.
- Пріоритет: MVP.

4. Input
- Стани: default, error, disabled.
- Пріоритет: MVP.

5. PasswordInput
- Показ/приховати пароль, validation hints.
- Пріоритет: MVP.

6. Select
- Single/multi режим для фільтрів.
- Пріоритет: MVP.

7. Checkbox / Switch
- Для notification settings.
- Пріоритет: MVP.

8. Badge
- Для статусів лідів.
- Пріоритет: MVP.

9. Card
- Універсальний контейнер для блоків UI.
- Пріоритет: MVP.

10. Modal / Drawer
- Підтвердження дій, форми редагування.
- Пріоритет: Phase 2.

11. Table
- Базовий табличний контейнер із head/body/cell.
- Пріоритет: MVP.

12. Pagination
- Перемикання сторінок, page size.
- Пріоритет: MVP.

13. Tabs
- Для профілю/налаштувань (за потреби).
- Пріоритет: Phase 2.

14. Skeleton
- Placeholder під час завантаження.
- Пріоритет: MVP.

15. EmptyState
- Відображення відсутності даних.
- Пріоритет: MVP.

16. ErrorState
- Повідомлення про помилку з retry action.
- Пріоритет: MVP.

17. Toast/Alert
- Транзакційний фідбек після дій.
- Пріоритет: MVP.

## 3.3 Auth feature-компоненти
1. LoginForm
- Поля: email, password; submit, validation.
- Пріоритет: MVP.

2. ForgotPasswordForm
- Запит reset email.
- Пріоритет: MVP.

3. ResetPasswordForm
- Встановлення нового пароля по токену.
- Пріоритет: MVP.

4. SessionRefreshHandler
- Непомітне оновлення access token.
- Пріоритет: MVP.

## 3.4 Leads feature-компоненти
1. LeadsPageHeader
- Назва сторінки, кнопка Refresh, summary counters.
- Пріоритет: MVP.

2. LeadFiltersBar
- Фільтри: статус, дата, пошук, сортування.
- Пріоритет: MVP.

3. LeadsTable
- Таблиця лідів партнера.
- Пріоритет: MVP.

4. LeadRow
- Один рядок таблиці.
- Пріоритет: MVP.

5. LeadStatusBadge
- Візуалізація статусу воронки.
- Пріоритет: MVP.

6. LeadContactCell
- Контактне ім'я + телефон.
- Пріоритет: MVP.

7. LeadsPaginationPanel
- Пагінація і лічильник total.
- Пріоритет: MVP.

8. LeadDetailsPanel
- Деталі ліда.
- Пріоритет: MVP.

9. LeadHistoryTimeline
- Історія змін статусів.
- Пріоритет: MVP.

10. BrokerContactCard
- Дані брокера + CTA написати.
- Пріоритет: MVP.

11. ContactBrokerAction
- Deep link на WhatsApp/mailto.
- Пріоритет: MVP.

## 3.5 Profile/Admin feature-компоненти
1. ProfileCard
- Базова інформація користувача.
- Пріоритет: MVP.

2. NotificationSettingsForm
- Тумблери по типах повідомлень.
- Пріоритет: MVP.

3. ChangePasswordForm
- Зміна пароля в профілі.
- Пріоритет: Phase 2.

4. AdminPartnersTable
- Список партнерів для admin.
- Пріоритет: MVP.

5. PartnerForm
- Створення/редагування партнера.
- Пріоритет: MVP.

6. PartnerTagEditor
- Прив'язка amocrm tag_ids до партнера.
- Пріоритет: MVP.

7. PartnerUserInviteForm
- Створення partner_user з тимчасовим паролем.
- Пріоритет: Phase 2.

## 3.6 Frontend data-layer компоненти
1. ApiClient
- Typed HTTP client для /api/v1.
- Пріоритет: MVP.

2. AuthStore
- Поточний користувач, токени, logout state.
- Пріоритет: MVP.

3. QueryCacheManager
- Кешування та revalidation запитів.
- Пріоритет: MVP.

4. ErrorMapper
- Мапінг API error.code у людські повідомлення.
- Пріоритет: MVP.

5. PermissionHooks
- useRole/useCanAccessAdmin/usePartnerScope.
- Пріоритет: MVP.

---

## 4) Backend компоненти (NestJS)

## 4.1 Core модулі
1. AppModule
- Збірка всіх модулів, глобальна конфігурація.
- Пріоритет: MVP.

2. ConfigModule
- ENV, валідація конфігу, feature flags.
- Пріоритет: MVP.

3. DatabaseModule
- Підключення PostgreSQL, migrations.
- Пріоритет: MVP.

4. RedisModule
- Кеш і технічні ключі/ліміти/черги.
- Пріоритет: MVP.

5. HealthModule
- /health, /ready endpoints.
- Пріоритет: MVP.

## 4.2 Auth компоненти
1. AuthController
- login/refresh/logout/password endpoints.
- Пріоритет: MVP.

2. AuthService
- Валідація credentials, issue/rotate/revoke токенів.
- Пріоритет: MVP.

3. JwtAccessStrategy
- Перевірка access token.
- Пріоритет: MVP.

4. RefreshTokenService
- Робота з refresh_sessions, reuse detection.
- Пріоритет: MVP.

5. PasswordResetService
- Forgot/reset flow.
- Пріоритет: MVP.

6. BcryptPasswordHasher
- Hash/verify паролів.
- Пріоритет: MVP.

7. AuthRateLimiter
- Захист login/reset від brute force.
- Пріоритет: MVP.

## 4.3 RBAC і доступ
1. RolesGuard
- Доступ до endpoint за роллю.
- Пріоритет: MVP.

2. PartnerScopeGuard
- Контроль partner isolation при запитах лідів.
- Пріоритет: MVP.

3. AccessPolicyService
- Єдине місце правил доступу (role + partner scope).
- Пріоритет: MVP.

## 4.4 Leads компоненти
1. LeadsController
- GET /leads, GET /leads/:id, GET /leads/:id/history.
- Пріоритет: MVP.

2. LeadsService
- Бізнес-логіка списку і деталей лідів.
- Пріоритет: MVP.

3. LeadFilteringService
- Серверна фільтрація по tag_ids + query params.
- Пріоритет: MVP.

4. LeadHistoryService
- Агрегація історії статусів.
- Пріоритет: MVP.

5. LeadSnapshotRepository
- Операції з lead_snapshots.
- Пріоритет: MVP.

## 4.5 Partners/Admin компоненти
1. AdminPartnersController
- GET/POST/PUT /admin/partners.
- Пріоритет: MVP.

2. PartnersService
- CRUD партнера, валідація стану.
- Пріоритет: MVP.

3. PartnerTagsService
- Прив'язка і синхронізація amocrm_tag_id.
- Пріоритет: MVP.

4. PartnerUsersService
- Створення/деактивація partner_user.
- Пріоритет: Phase 2.

## 4.6 Profile/Notifications компоненти
1. ProfileController
- GET /profile, PUT /profile/notifications.
- Пріоритет: MVP.

2. NotificationPrefsService
- Збереження налаштувань повідомлень.
- Пріоритет: MVP.

3. NotificationDispatcher
- Відправка email при подіях.
- Пріоритет: Phase 2.

## 4.7 amoCRM інтеграція
1. AmoCrmAuthService
- OAuth2 token management.
- Пріоритет: MVP.

2. AmoCrmApiClient
- Обгортка API запитів у amoCRM.
- Пріоритет: MVP.

3. AmoCrmRateLimitService
- Тротлінг запитів (до 7 req/sec).
- Пріоритет: MVP.

4. AmoCrmQueueWorker
- Черга і retry/backoff для викликів.
- Пріоритет: MVP.

5. AmoCrmMapper
- Мапінг зовнішніх DTO у внутрішні моделі.
- Пріоритет: MVP.

## 4.8 Webhook компоненти
1. WebhookController
- POST /webhook/amocrm.
- Пріоритет: MVP.

2. WebhookSignatureVerifier
- Перевірка секрет-підпису.
- Пріоритет: MVP.

3. WebhookDedupService
- Ідемпотентність по event_id.
- Пріоритет: MVP.

4. WebhookProcessor
- Обробка status/assignee update.
- Пріоритет: MVP.

5. WebhookDeadLetterHandler
- Обробка помилкових/нерозібраних подій.
- Пріоритет: Phase 2.

## 4.9 Audit/Observability компоненти
1. RequestIdMiddleware
- Генерація/прийом request_id.
- Пріоритет: MVP.

2. AuditLogService
- Запис дій користувачів і admin операцій.
- Пріоритет: MVP.

3. IntegrationLogService
- Логи викликів до amoCRM (timestamp, partner_id, status).
- Пріоритет: MVP.

4. MetricsService
- latency/error-rate/webhook-lag.
- Пріоритет: Phase 2.

---

## 5) Data і persistence компоненти
1. ORM Layer (Prisma або TypeORM)
- Сутності, репозиторії, транзакції.
- Пріоритет: MVP.

2. Migration Runner
- Міграції БД в CI/CD і на деплої.
- Пріоритет: MVP.

3. Seed Scripts
- Початковий admin, демо-партнер (тільки non-prod).
- Пріоритет: MVP.

4. CacheKeyFactory
- Уніфікований формат ключів Redis.
- Пріоритет: MVP.

5. DataRetentionJob
- Архівація/чистка webhook_events/audit_logs.
- Пріоритет: Phase 2.

---

## 6) Security компоненти
1. JwtKeyManager
- Керування active/next секретами JWT.
- Пріоритет: MVP.

2. SecretProvider
- Доступ до секретів середовища.
- Пріоритет: MVP.

3. InputValidationLayer
- DTO validation + sanitization.
- Пріоритет: MVP.

4. CorsPolicy
- Allowlist доменів.
- Пріоритет: MVP.

5. HelmetSecurityHeaders
- Базові security headers.
- Пріоритет: MVP.

6. AbuseProtection
- IP/user-based rate limiting для критичних endpoint.
- Пріоритет: MVP.

7. AccessAnomalyDetector
- Базові евристики підозрілих auth активностей.
- Пріоритет: Phase 2.

---

## 7) CI/CD і DevOps компоненти
1. GitHub Actions: ci.yml
- lint + typecheck + tests + build.
- Пріоритет: MVP.

2. GitHub Actions: deploy-staging.yml
- Docker build/push + deploy на Hetzner staging.
- Пріоритет: MVP.

3. GitHub Actions: deploy-prod.yml
- Manual approval + production deploy + health check.
- Пріоритет: MVP.

4. Dockerfiles
- Окремо для frontend/backend.
- Пріоритет: MVP.

5. Docker Compose (server)
- app/api/postgres/redis/reverse-proxy.
- Пріоритет: MVP.

6. Reverse Proxy Config (Nginx/Caddy)
- TLS termination, routing, compression.
- Пріоритет: MVP.

7. Backup Job
- Nightly backup БД + перевірка restore.
- Пріоритет: MVP.

8. Alerting Integrations
- Slack/Telegram алерти по health/deploy fail.
- Пріоритет: Phase 2.

---

## 8) Тестові компоненти
1. Unit tests
- Сервіси auth, filtering, policy, webhook dedup.
- Пріоритет: MVP.

2. Integration tests
- API + БД + Redis сценарії.
- Пріоритет: MVP.

3. E2E tests (frontend+backend)
- Login, leads list/detail/history, admin partners.
- Пріоритет: MVP.

4. Contract tests
- Валідація API DTO і error contracts.
- Пріоритет: MVP.

5. Performance smoke
- Список 1000+ лідів, оцінка latency.
- Пріоритет: Phase 2.

---

## 9) MVP-чекліст компонентів (must-have)
Обов'язкові для першого релізу:
1. Frontend: AppShell, ProtectedRoute, LoginForm, LeadFiltersBar, LeadsTable, LeadDetailsPanel, LeadHistoryTimeline, AdminPartnersTable, PartnerTagEditor, NotificationSettingsForm.
2. Backend: AuthController/AuthService, RolesGuard, PartnerScopeGuard, LeadsController/LeadsService, AdminPartnersController, AmoCrmApiClient, AmoCrmRateLimitService, WebhookController, WebhookDedupService.
3. Data/Security: users/partners/partner_tags/refresh_sessions/lead_snapshots/lead_status_history/webhook_events/audit_logs, validation, rate limiting, JWT rotation.
4. DevOps: ci.yml, deploy-staging.yml, deploy-prod.yml, Dockerfiles, reverse proxy TLS.

---

## 10) Порядок реалізації компонентів (рекомендований)
1. Каркас проекту: Config, Database, Redis, App shell, Auth layout.
2. Auth slice: login/refresh/logout + ProtectedRoute + RoleGate.
3. Leads slice: list + filters + pagination + backend filtering by tags.
4. Lead details slice: details/history + broker contact CTA.
5. Admin slice: partners list/create/update + tag binding.
6. Webhook + notification preferences.
7. CI/CD hardening + observability + performance tuning.
