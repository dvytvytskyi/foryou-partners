# Frontend Integration Guide (Auth + Leads + Admin)

## 1. Base settings
- API base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api/v1`)
- Auth scheme: Bearer access token + refresh token rotation
- Error format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "request_id": "..."
  }
}
```

## 2. Auth flow on frontend

### 2.1 Login
`POST /auth/login`

Request:

```json
{
  "email": "partner@example.com",
  "password": "StrongPass123"
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "partner@example.com",
    "role": "partner_user",
    "partner_id": "uuid"
  }
}
```

Frontend behavior:
- Save `user` + `refresh_token` in store/session persistence.
- Keep `access_token` in memory and attach as `Authorization: Bearer ...`.

### 2.2 Refresh
`POST /auth/refresh`

Request:

```json
{
  "refresh_token": "..."
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 900
}
```

Frontend behavior:
- Axios interceptor retries once after 401.
- Replace both access and refresh tokens after successful refresh.
- If refresh fails -> clear auth state and redirect to `/login`.

### 2.3 Logout
`POST /auth/logout`

Request:

```json
{
  "refresh_token": "..."
}
```

Response: `204 No Content`

Frontend behavior:
- Always clear local auth state even if network request fails.

## 3. Leads integration

### 3.1 List
`GET /leads`

Query params:
- `page`, `page_size`
- `status` (single or comma-separated)
- `search`
- `date_from`, `date_to`
- `sort_by` (`updated_at` | `created_at`)
- `sort_dir` (`asc` | `desc`)
- `partner_id` (only for admin context)

Response:

```json
{
  "items": [
    {
      "id": "12345",
      "title": "Lead title",
      "status": "new",
      "budget": 120000,
      "city": "Warsaw",
      "contact_name": "John",
      "contact_phone": "+48...",
      "broker_name": "Broker Name",
      "updated_at": "2026-04-18T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

Visibility logic on backend:
- lead is visible if match by `tag_ids` OR by `Источник` (amocrm_source), based on partner bindings.

### 3.2 Lead details
`GET /leads/:id`

Response includes:
- base fields (`title`, `status`, `budget`, `city`, `comment`)
- `contact`
- `broker`
- `tags`
- `source`

### 3.3 Lead history
`GET /leads/:id/history`

Response:

```json
{
  "items": [
    {
      "from_status": "new",
      "to_status": "in_progress",
      "changed_at": "2026-04-18T11:00:00.000Z",
      "changed_by": "broker"
    }
  ]
}
```

## 4. Admin partners integration

All admin endpoints require role `admin`.

### 4.1 Get partners
`GET /admin/partners`

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Partner A",
      "tag_ids": [123, 456],
      "source_values": ["facebook", "broker_referral"],
      "users_count": 2,
      "is_active": true
    }
  ]
}
```

### 4.2 Create partner
`POST /admin/partners`

Request:

```json
{
  "name": "Partner A",
  "tag_ids": [123, 456],
  "source_values": ["facebook"],
  "user": {
    "email": "partner-user@example.com",
    "temp_password": "TempPass123"
  }
}
```

Response:

```json
{
  "id": "uuid"
}
```

### 4.3 Update partner
`PUT /admin/partners/:id`

Request supports partial update:

```json
{
  "name": "Partner A Updated",
  "tag_ids": [123],
  "source_values": ["facebook", "google_ads"],
  "is_active": true
}
```

Response:

```json
{
  "id": "uuid",
  "updated_at": "2026-04-18T12:00:00.000Z"
}
```

## 5. Frontend implementation checklist
- Implement `LoginForm` using `/auth/login`.
- Wire `SessionRefreshHandler` to `/auth/refresh`.
- Add `logout` action to AppShell.
- Build `LeadsTable` + `LeadFiltersBar` based on `GET /leads`.
- Build `LeadDetailsPanel` + `LeadHistoryTimeline` using details/history endpoints.
- Build `AdminPartnersTable`, `PartnerForm`, `PartnerTagEditor`, `PartnerSourceEditor` using admin endpoints.
- Map `error.code` to friendly UI messages.

## 6. Notes for QA
- partner_user should never access `/admin/*`.
- partner_user should see only leads matched by partner tag/source bindings.
- refresh token rotation must invalidate previous refresh token.
- if refresh token reused (compromised), backend revokes active sessions and returns forbidden.
