# GrantBridge

GrantBridge is a free, open-source grant discovery and planning assistant for small nonprofits and community organizations.

It collects public grant opportunities, ranks them against an organization's profile, explains the match, and helps the team track deadlines and produce a simple funding pipeline report.

## Why this project

Small organizations often have limited fundraising staff. Grant information is scattered across government and foundation websites, deadlines are easy to miss, and a search result rarely explains whether an opportunity is genuinely suitable. GrantBridge turns public information into a focused, auditable workflow without pretending to make funding decisions for the organization.

## Planned MVP

- Account signup, login, and organization profile
- Curated public grant source ingestion
- Normalized grant search with filters
- Explainable profile-to-grant matching
- Optional local LLM explanations with deterministic fallback
- Saved opportunities and deadline reminders
- Dashboard and downloadable PDF funding pipeline report
- Free deployment with a React frontend, FastAPI backend, and PostgreSQL

## Repository plan

- `docs/solution-blueprint.md` - complete project proposal and implementation blueprint
- `frontend/` - React and TypeScript application
- `backend/` - FastAPI application and background jobs
- `database/` - migrations and seed data
- `services/` - ingestion, matching, reporting, and notification modules
- `tests/` - unit, API, integration, and frontend tests

## Milestone workflow

Each milestone should end with a working demo, a short entry in the changelog, and a GitHub commit/push. Do not begin the next milestone until the current definition of done is met.

See the [complete blueprint](docs/solution-blueprint.md) for the ranked alternatives, architecture, API contract, database design, five milestones, daily roadmap, and submission checklist.

## Status

Milestone 2 complete: authentication, organization profile setup, a 30-record source-backed grant catalogue, idempotent seed ingestion, authenticated search/filter/pagination endpoints, and a responsive catalogue interface are implemented. Matching and saved pipeline workflows begin in Milestone 3.

## Run locally

Backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload
```

Seed the demonstration catalogue in a separate backend terminal:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m app.ingestion
```

Frontend, in a second terminal:

```powershell
cd frontend
npm run dev
```

The frontend runs at `http://localhost:5173` and the API at `http://localhost:8000`.
