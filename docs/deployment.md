# Deployment Guide

## Free deployment shape

- Frontend: Vercel project rooted at `frontend/`, using `vercel.json`.
- Backend: Render-style Docker web service using `backend/Dockerfile` and `render.yaml`.
- Database: Supabase free PostgreSQL database. Set its connection string as `DATABASE_URL`.
- Scheduled reminders: GitHub Actions can call `POST /api/v1/reminders/run` daily with an authenticated job endpoint in a future hardening pass. The current endpoint is user-triggered and idempotent for the demo.

Free-tier limits change. Record the provider, plan, and deployment date in the final capstone document.

## Backend variables

```text
DATABASE_URL=postgresql+psycopg://...
APP_SECRET_KEY=<long random value>
FRONTEND_ORIGIN=https://your-frontend.example
COOKIE_SECURE=true
SESSION_DAYS=7
```

The current requirements do not include a PostgreSQL driver because local development uses SQLite. Add `psycopg[binary]` to `backend/requirements.txt` before connecting a production PostgreSQL database, then rebuild the service.

## Frontend variable

```text
VITE_API_URL=https://your-api.example
```

## Deployment checklist

1. Create the PostgreSQL database and set `DATABASE_URL`.
2. Set a unique `APP_SECRET_KEY`; never use the development default.
3. Set the exact frontend origin and enable `COOKIE_SECURE=true`.
4. Deploy the backend and verify `/health`, `/ready`, and `/docs`.
5. Run the seed command once against the intended database if demonstration records are needed.
6. Deploy the frontend with `VITE_API_URL` pointing to the backend.
7. Create a demo account, complete its profile, save a grant, generate an explanation, and download a PDF.
8. Confirm no secrets appear in Git history, browser bundles, or logs.
