# GrantBridge Architecture

```text
React/Vite frontend
        |
        | HTTPS JSON + HTTP-only session cookie
        v
FastAPI API --------------------> ReportLab PDF generator
        |
        +--> SQLAlchemy --> SQLite locally / PostgreSQL in deployment
        +--> Curated source ingestion and normalized grant records
        +--> Deterministic match service
        +--> Reminder runner and in-app reminder records
        +--> Optional AI adapter boundary; deterministic fallback is default
```

The frontend owns presentation and form state. The backend owns authorization, matching, data validation, report generation, and source provenance. A user can only access records through their organization ownership constraint. The catalogue can operate without an LLM or paid API.

## Production boundary

The local SQLite default keeps onboarding free and simple. Production should use PostgreSQL, a strong secret, HTTPS, secure cookies, and a scheduled job runner. The `/health` endpoint is a liveness check; `/ready` verifies the database connection.
