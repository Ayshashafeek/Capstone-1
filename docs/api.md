# GrantBridge API

Base URL: `http://localhost:8000`

Interactive OpenAPI documentation is available at `/docs` when the FastAPI server is running.

## Public endpoints

- `GET /health` - liveness probe
- `GET /ready` - database-backed readiness probe
- `POST /api/v1/auth/signup` - create an account and organization
- `POST /api/v1/auth/login` - create a session

## Authenticated endpoints

Authentication uses the `session_token` HTTP-only cookie.

- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/organization`
- `PUT /api/v1/organization`
- `GET /api/v1/grants`
- `GET /api/v1/grants/{grant_id}`
- `POST /api/v1/grants/{grant_id}/explanation`
- `GET /api/v1/saved-grants`
- `POST /api/v1/saved-grants`
- `PATCH /api/v1/saved-grants/{saved_id}`
- `DELETE /api/v1/saved-grants/{saved_id}`
- `GET /api/v1/dashboard`
- `POST /api/v1/reminders/run`
- `GET /api/v1/reminders`
- `POST /api/v1/reports/pipeline`

## Example catalogue request

```text
GET /api/v1/grants?search=housing&region=Colombo&page=1&page_size=6
```

Responses include source URL, verification date, match score, match reasons, missing criteria, and saved state. The API returns structured errors as `{ "detail": "..." }` for invalid or unauthorized requests.
