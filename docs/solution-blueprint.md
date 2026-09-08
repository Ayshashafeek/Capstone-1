# 10x Solution Blueprint: GrantBridge

> Working title: GrantBridge
> Document owner: Your Name Surname
> Date: 2026-09-08
> Repository: `Ayshashafeek/Capstone-1`

## 1. Decision summary

### Recommended idea

**GrantBridge: an explainable grant discovery and deadline planning assistant for small nonprofits and community organizations.**

### Problem

Small organizations depend on grants but often have no dedicated grants researcher. Opportunities are spread across many websites, eligibility rules are difficult to compare, and deadlines are easy to miss. Existing grant directories tend to be broad search engines or expensive professional tools. A missed deadline has a direct cost: staff time was spent searching, but no application was submitted.

### Target users

- Small nonprofits with one or two fundraising staff
- Community groups and social enterprises applying for public or foundation funding
- Volunteer grant writers who need a focused shortlist

The MVP is intentionally not for large enterprise grant departments, legal advice, or automatic application submission.

### Solution

GrantBridge imports a small, curated set of public grant sources, normalizes the data, filters opportunities by organization profile, and shows an explainable match score. A user can save opportunities, record status and notes, receive deadline reminders, and generate a funding pipeline report.

AI is optional and subordinate to the source data: it summarizes eligibility text and explains possible matches. Rule-based matching remains the reliable fallback and displays the source URL for verification.

### Key features

- Secure accounts and organization profiles
- Public grant ingestion from approved pages, RSS feeds, CSV files, or manual seed data
- Search and filters for geography, focus area, applicant type, amount, and deadline
- Explainable match score with matched and missing criteria
- Saved opportunities, status tracking, notes, and follow-up dates
- Dashboard showing upcoming deadlines and pipeline value
- Scheduled email or in-app deadline reminders
- PDF funding pipeline report
- Admin/source health view for failed imports and stale records

### Tech stack

- Frontend: React, TypeScript, Vite, React Router, TanStack Query, accessible CSS
- Backend: Python, FastAPI, Pydantic, SQLAlchemy, Alembic
- Database: PostgreSQL; SQLite for fast local tests if useful
- Authentication: Argon2 password hashing, short-lived access token plus refresh token stored in secure HTTP-only cookie
- Jobs: APScheduler locally; GitHub Actions cron or a free platform scheduled job in deployment
- Cache: Redis-compatible Upstash free tier where available; database-backed cache fallback
- PDF: WeasyPrint or ReportLab
- Email: SMTP during development; optional Resend free tier or owner-configured SMTP
- LLM: Ollama locally with a small open model; optional free hosted provider behind an adapter; deterministic templates when unavailable
- Testing: Pytest, HTTPX, Playwright, Vitest
- Deployment: Vercel or GitHub Pages-compatible frontend, Render/Railway-style free backend where available, Supabase free PostgreSQL, GitHub Actions cron

### Required 10x concepts

1. REST API endpoints for grants, profiles, saved opportunities, reports, and auth
2. Relational database with migrations and indexes
3. Authentication and role-based authorization
4. Background jobs for ingestion, reminders, cleanup, and reports
5. Reporting through PDF and scheduled summary email
6. Caching for source feeds and repeated searches
7. LLM integration for constrained explanations, with fallback
8. Web scraping or public-feed ingestion with rate limits and provenance
9. Deployment with separate frontend, API, database, and scheduled worker

### Expected outcome

A user can create an account, describe an organization, browse a curated grant catalogue, understand why an opportunity may fit, save it, track its status, and download a useful pipeline report. The demo should measure reduced search effort and visible deadline coverage rather than claiming funding success from a small capstone sample.

## 2. Ranked project ideas

Scores are from 1 to 5. Higher is better. Feasibility and free-build scores favor a reliable capstone MVP.

| Rank | Project | Impact | Depth | Feasibility | Portfolio | Concepts | Originality | Expansion | Free build | Total |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | GrantBridge | 5 | 5 | 4 | 5 | 5 | 4 | 5 | 5 | 38/40 |
| 2 | CivicSignal | 5 | 5 | 4 | 5 | 5 | 4 | 5 | 4 | 37/40 |
| 3 | AidMap | 5 | 4 | 4 | 5 | 5 | 4 | 5 | 4 | 36/40 |
| 4 | FoodLoop | 5 | 4 | 4 | 4 | 5 | 4 | 5 | 5 | 36/40 |
| 5 | ClinicQueue | 5 | 5 | 3 | 5 | 4 | 4 | 5 | 3 | 34/40 |
| 6 | RepairReady | 4 | 4 | 5 | 4 | 4 | 4 | 4 | 5 | 34/40 |
| 7 | StudySignal | 4 | 4 | 5 | 4 | 4 | 3 | 4 | 5 | 33/40 |

### 1. GrantBridge

- **Problem:** Small nonprofits cannot efficiently discover, compare, and track public grant opportunities.
- **Users:** Nonprofit staff, community groups, volunteer grant writers.
- **Solution:** Curated public-source ingestion, explainable matching, deadline workflow, and reports.
- **Features:** Profile, searchable catalogue, match reasons, saved pipeline, reminders, PDF report, source health.
- **Why it matters:** Staff time is scarce and missed deadlines directly reduce funding opportunities.
- **Difference:** It focuses on explainability, provenance, and a small organization's workflow instead of being a generic grant search engine.
- **Technologies:** React, FastAPI, PostgreSQL, SQLAlchemy, background jobs, Redis-compatible cache, PDF generator, optional Ollama.
- **Concepts:** REST API, database, auth, jobs, PDF/email reporting, caching, LLM, scraping/feeds, deployment.
- **Database:** PostgreSQL with users, organizations, grants, sources, matches, saved opportunities, reminders, reports, and job runs.
- **Services:** Public government/foundation pages or feeds, SMTP, optional local/hosted LLM.
- **Jobs:** Source refresh daily; reminders daily; stale-record cleanup weekly; report generation on demand.
- **LLM/RAG:** Retrieve the stored grant text and organization profile, then produce a constrained explanation with citations to stored fields. No open-ended legal or funding advice.
- **Deployment:** Static frontend, free API host, free PostgreSQL, GitHub Actions scheduled ingestion.
- **Difficulty:** Medium-high, but bounded if sources are limited to 3-5.
- **MVP:** One organization per account, 3 sources, 30-100 normalized grants, matching, saved pipeline, reminders, PDF.
- **Future:** Team collaboration, more sources, application workspace, outcome analytics, multilingual summaries.
- **Portfolio value:** Demonstrates full-stack product design, data ingestion, AI boundaries, background processing, and measurable workflow value.

### 2. CivicSignal

- **Problem:** Residents often learn about local public meetings, consultations, and service changes too late.
- **Users:** Residents, neighborhood associations, local journalists.
- **Solution:** Collect official notices and meetings, classify them by topic/location, and send a personalized digest.
- **Features:** Municipality/source registry, keyword and area subscriptions, calendar, notice summaries, email digest, source links.
- **Why it matters:** Public participation and awareness suffer when information is fragmented across government sites.
- **Difference:** A provenance-first digest for one city or district rather than a broad social feed.
- **Technologies:** React, FastAPI, PostgreSQL, RSS/HTML parsers, cron, email, optional LLM summarizer.
- **Concepts:** REST, DB, auth, scraping, jobs, email reporting, cache, LLM, deployment.
- **Difficulty:** Medium-high because public sites vary and location matching is messy.
- **MVP:** One municipality, two official sources, subscriptions, daily digest, source citations.
- **Future:** Multi-city support, calendar integration, accessibility alerts, multilingual digests.
- **Portfolio value:** Strong civic-tech story and data pipeline, but requires careful source maintenance.

### 3. AidMap

- **Problem:** People seeking food, housing, legal, or social support struggle to find current and eligible local services.
- **Users:** Community workers, help desks, and residents.
- **Solution:** Search verified service records and provide source-backed eligibility explanations.
- **Features:** Service directory, filters, map/list view, freshness indicators, referral notes, printable referral sheet.
- **Why it matters:** Wrong or outdated referrals waste time for people already under pressure.
- **Difference:** Freshness and verification workflow are first-class features; the assistant must show sources and uncertainty.
- **Technologies:** React, FastAPI, PostgreSQL/PostGIS if available, geocoding from OpenStreetMap, jobs, optional RAG.
- **Concepts:** REST, DB, auth, jobs, scraping/import, reporting, cache, RAG, deployment.
- **Difficulty:** Medium-high due to data quality and sensitive user context.
- **MVP:** One region, manually verified seed data, directory search, freshness flags, referral PDF.
- **Future:** Partner editing, multilingual access, SMS, route planning.
- **Portfolio value:** High impact, but requires strong disclaimers and data governance.

### 4. FoodLoop

- **Problem:** Local food businesses and community kitchens waste usable surplus while nearby organizations need food.
- **Users:** Donors, food rescue groups, community kitchens.
- **Solution:** Match surplus listings to verified recipient capacity and pickup windows.
- **Features:** Listings, pickup slots, status tracking, notifications, donor/recipient roles, monthly waste-diversion report.
- **Why it matters:** It can reduce waste and improve food access.
- **Difference:** Capacity and pickup feasibility are part of matching, not just a listing board.
- **Technologies:** React, FastAPI, PostgreSQL, jobs, email, webhook adapter, PDF metrics.
- **Concepts:** REST, DB, auth, jobs, reporting, caching, webhooks, deployment.
- **Difficulty:** Medium; real-world logistics and notifications increase scope.
- **MVP:** One campus or neighborhood, manual confirmations, no payments or live delivery.
- **Future:** Route optimization, partner APIs, temperature/safety logs.
- **Portfolio value:** Excellent product story, but harder to demonstrate without real partners.

### 5. ClinicQueue

- **Problem:** Free or low-cost clinics spend time coordinating walk-in demand and appointment capacity.
- **Users:** Clinic coordinators and patients.
- **Solution:** Lightweight intake, queue visibility, appointment reminders, and demand reports.
- **Features:** Role-based dashboard, queue states, capacity settings, reminders, daily report.
- **Why it matters:** Better coordination can reduce waiting and no-shows.
- **Difference:** Designed for small clinics without enterprise scheduling software.
- **Technologies:** React, FastAPI, PostgreSQL, auth, jobs, email/SMS adapter, audit log.
- **Concepts:** REST, DB, auth, jobs, reporting, cache, deployment.
- **Difficulty:** High because health data and privacy rules matter.
- **MVP:** Synthetic data only, no medical records, coordinator dashboard and reminders.
- **Future:** Interoperability, multilingual forms, analytics.
- **Portfolio value:** Technically deep but should be avoided if privacy scope cannot be handled well.

### 6. RepairReady

- **Problem:** People discard appliances because they cannot diagnose likely repairability or find a nearby repair option.
- **Users:** Households, repair cafes, independent technicians.
- **Solution:** Guided symptom intake, repairability hints, parts/manual links, and repair referral.
- **Features:** Device catalogue, symptom tree, manual retrieval, estimate request, repair history.
- **Why it matters:** Repair extends product life and reduces waste.
- **Difference:** Combines structured diagnostics with local repair discovery instead of generic AI chat.
- **Technologies:** React, FastAPI, PostgreSQL, document retrieval, optional local LLM, jobs, PDF checklist.
- **Concepts:** REST, DB, auth, RAG, jobs, reporting, cache, deployment.
- **Difficulty:** Medium and feasible with synthetic/device seed data.
- **MVP:** 3 appliance types, structured symptom flow, source-backed suggestions, referral list.
- **Future:** Image diagnosis, parts inventory, technician marketplace.
- **Portfolio value:** Good AI/product demonstration with lower social risk.

### 7. StudySignal

- **Problem:** Students receive scattered course announcements and miss deadlines or required preparation.
- **Users:** Students and small learning communities.
- **Solution:** Import course notices, extract dates, and produce a prioritized weekly plan.
- **Features:** Course setup, announcement import, deadline extraction, calendar, weekly digest, source links.
- **Why it matters:** Reduces cognitive load and missed academic work.
- **Difference:** Emphasizes extraction with links back to the original announcement, not a chatbot that invents course content.
- **Technologies:** React, FastAPI, PostgreSQL, jobs, calendar export, optional LLM, cache.
- **Concepts:** REST, DB, auth, jobs, LLM, reporting/digest, deployment.
- **Difficulty:** Medium and easiest to demo with seed content.
- **MVP:** Manual paste or CSV import, extraction, reminders, weekly dashboard.
- **Future:** LMS integrations, study recommendations, team spaces.
- **Portfolio value:** Feasible and polished, though less original than the top options.

### Why GrantBridge is the best choice

GrantBridge has the strongest balance of impact, depth, and controllable scope. The data is public, the first version can work with a small curated set, and every advanced concept supports the user workflow. It also produces a visual before/after demo: scattered opportunities become a ranked, explainable, deadline-aware pipeline.

**Runner-up: CivicSignal.** It is equally compelling for civic-tech, but source variability and city-specific parsing create more maintenance risk. Choose it only if a municipality and official sources are already available.

## 3. System architecture

```text
Browser
  |
  | HTTPS JSON API
  v
React + TypeScript frontend
  |
  v
FastAPI backend
  |-- Auth service: Argon2 + secure cookie tokens
  |-- Grant service: search, match, save, status
  |-- Report service: PDF pipeline report
  |-- AI service: retrieval + constrained explanation + fallback
  |-- Admin service: sources, imports, job runs
  |
  +--> PostgreSQL: users, organizations, grants, pipeline, audit data
  +--> Cache: search results, source responses, AI explanations
  +--> SMTP/email adapter: reminders and reports
  +--> Ollama or optional hosted free LLM adapter

Scheduled worker / GitHub Actions cron
  |-- fetch approved sources
  |-- parse and normalize
  |-- deduplicate and expire stale records
  |-- calculate matches
  |-- send reminders
  +-- record job results and metrics
```

### Data flow

1. A scheduled job fetches an approved source with a timeout, user agent, rate limit, and cached response.
2. The parser converts source-specific data to a common grant schema and stores provenance, raw text hash, and `last_verified_at`.
3. A normalization step deduplicates records using source ID, canonical URL, and title/deadline similarity.
4. The matching service compares organization profile fields with structured grant fields and stores reasons, not only a number.
5. The frontend requests paginated grants and displays source links and freshness.
6. On an explanation request, the AI service retrieves only the stored grant text and profile fields, creates a constrained prompt, validates the response, and falls back to templates.
7. A daily worker finds due reminders and sends email or creates in-app notifications.
8. The report service reads saved pipeline data and renders a PDF on demand.

## 4. Database design

PostgreSQL is the production database. UUIDs are used for public identifiers; timestamps are stored in UTC.

### `users`

- `id UUID PRIMARY KEY`
- `email VARCHAR(320) UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `role VARCHAR(20) NOT NULL DEFAULT 'member'` (`member`, `admin`)
- `is_active BOOLEAN NOT NULL DEFAULT true`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

Indexes: unique lower-case email, `is_active`.

### `organizations`

- `id UUID PRIMARY KEY`
- `owner_id UUID NOT NULL REFERENCES users(id)`
- `name VARCHAR(200) NOT NULL`
- `description TEXT`
- `organization_type VARCHAR(80)`
- `regions JSONB NOT NULL DEFAULT '[]'`
- `focus_areas JSONB NOT NULL DEFAULT '[]'`
- `annual_budget_cents INTEGER`
- `team_size SMALLINT`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

Indexes: `owner_id`, GIN indexes on `regions` and `focus_areas` if query volume justifies them.

### `grant_sources`

- `id UUID PRIMARY KEY`
- `name VARCHAR(200) NOT NULL`
- `source_type VARCHAR(20) NOT NULL` (`rss`, `csv`, `html`, `manual`)
- `url TEXT NOT NULL`
- `is_active BOOLEAN NOT NULL DEFAULT true`
- `last_success_at TIMESTAMPTZ`
- `last_error TEXT`
- `created_at TIMESTAMPTZ NOT NULL`

Index: `is_active`.

### `grants`

- `id UUID PRIMARY KEY`
- `source_id UUID REFERENCES grant_sources(id)`
- `external_id VARCHAR(300)`
- `title VARCHAR(300) NOT NULL`
- `funder VARCHAR(200) NOT NULL`
- `summary TEXT NOT NULL`
- `eligibility_text TEXT`
- `focus_areas JSONB NOT NULL DEFAULT '[]'`
- `eligible_regions JSONB NOT NULL DEFAULT '[]'`
- `applicant_types JSONB NOT NULL DEFAULT '[]'`
- `amount_min_cents INTEGER`
- `amount_max_cents INTEGER`
- `deadline TIMESTAMPTZ`
- `application_url TEXT NOT NULL`
- `canonical_url TEXT NOT NULL`
- `content_hash CHAR(64)`
- `last_verified_at TIMESTAMPTZ NOT NULL`
- `status VARCHAR(20) NOT NULL DEFAULT 'active'`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

Indexes: `deadline`, `status`, `funder`, unique `(source_id, external_id)`, unique `canonical_url`, full-text index on title/summary/eligibility.

### `saved_grants`

- `id UUID PRIMARY KEY`
- `organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE`
- `grant_id UUID REFERENCES grants(id) ON DELETE CASCADE`
- `status VARCHAR(30) NOT NULL DEFAULT 'saved'` (`saved`, `reviewing`, `applied`, `rejected`, `won`, `archived`)
- `notes TEXT`
- `target_amount_cents INTEGER`
- `follow_up_at TIMESTAMPTZ`
- `created_at TIMESTAMPTZ NOT NULL`
- `updated_at TIMESTAMPTZ NOT NULL`

Unique `(organization_id, grant_id)`. Index `(organization_id, status)` and `follow_up_at`.

### `match_results`

- `id UUID PRIMARY KEY`
- `organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE`
- `grant_id UUID REFERENCES grants(id) ON DELETE CASCADE`
- `score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100)`
- `matched_criteria JSONB NOT NULL`
- `missing_criteria JSONB NOT NULL`
- `explanation TEXT`
- `explanation_model VARCHAR(100)`
- `calculated_at TIMESTAMPTZ NOT NULL`

Unique `(organization_id, grant_id)`. Index `(organization_id, score DESC)`.

### `reminders`

- `id UUID PRIMARY KEY`
- `saved_grant_id UUID REFERENCES saved_grants(id) ON DELETE CASCADE`
- `user_id UUID REFERENCES users(id) ON DELETE CASCADE`
- `remind_at TIMESTAMPTZ NOT NULL`
- `channel VARCHAR(20) NOT NULL DEFAULT 'in_app'`
- `sent_at TIMESTAMPTZ`
- `status VARCHAR(20) NOT NULL DEFAULT 'pending'`

Index `(status, remind_at)`.

### `job_runs`

- `id UUID PRIMARY KEY`
- `job_name VARCHAR(100) NOT NULL`
- `started_at TIMESTAMPTZ NOT NULL`
- `finished_at TIMESTAMPTZ`
- `status VARCHAR(20) NOT NULL`
- `records_seen INTEGER DEFAULT 0`
- `records_changed INTEGER DEFAULT 0`
- `error_message TEXT`

Index `(job_name, started_at DESC)`.

### `reports`

- `id UUID PRIMARY KEY`
- `organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE`
- `requested_by UUID REFERENCES users(id)`
- `report_type VARCHAR(30) NOT NULL`
- `file_path TEXT`
- `created_at TIMESTAMPTZ NOT NULL`
- `expires_at TIMESTAMPTZ`

### ER-style relationship description

`User` owns one or more `Organization` records. An `Organization` saves many `Grant` records through `SavedGrant`. A `Grant` belongs to one `GrantSource` and can have many `MatchResult` records across organizations. A `SavedGrant` can have many `Reminder` records. `User`, `Organization`, `GrantSource`, and jobs are independently auditable.

## 5. API design

All protected endpoints require an authenticated session cookie. JSON errors use `{ "error": { "code": "...", "message": "..." } }`.

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/signup` | Create user and organization | No |
| POST | `/api/v1/auth/login` | Start session | No |
| POST | `/api/v1/auth/logout` | Revoke session | Yes |
| GET | `/api/v1/auth/me` | Current user | Yes |
| GET | `/api/v1/organization` | Read profile | Yes |
| PUT | `/api/v1/organization` | Update profile | Yes |
| GET | `/api/v1/grants` | Paginated search/filter | Yes |
| GET | `/api/v1/grants/{grant_id}` | Grant details and source | Yes |
| POST | `/api/v1/grants/{grant_id}/explanation` | Generate match explanation | Yes |
| GET | `/api/v1/saved-grants` | List pipeline | Yes |
| POST | `/api/v1/saved-grants` | Save a grant | Yes |
| PATCH | `/api/v1/saved-grants/{id}` | Update status/notes/follow-up | Yes |
| DELETE | `/api/v1/saved-grants/{id}` | Remove saved grant | Yes |
| POST | `/api/v1/reminders` | Create reminder | Yes |
| GET | `/api/v1/dashboard` | Upcoming deadlines and summary | Yes |
| POST | `/api/v1/reports/pipeline` | Generate PDF report | Yes |
| GET | `/api/v1/reports/{id}` | Download report | Yes |
| GET | `/api/v1/admin/job-runs` | View import health | Admin |
| POST | `/api/v1/admin/sources/{id}/run` | Trigger source refresh | Admin |
| GET | `/health` | Liveness/readiness check | No |

### Request and response examples

`GET /api/v1/grants?focus_area=housing&region=Colombo&deadline_before=2026-12-31&page=1&page_size=20`

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Community Housing Support Fund",
      "funder": "Example Foundation",
      "deadline": "2026-11-30T23:59:00Z",
      "amount_max_cents": 2500000,
      "match_score": 82,
      "match_reasons": ["focus area matches", "region is eligible"],
      "source_url": "https://example.org/grant"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 1
}
```

Common errors: `400` invalid filters or body, `401` unauthenticated, `403` wrong organization/admin role, `404` missing record, `409` duplicate save, `422` validation failure, `429` too many AI or source requests, `503` temporary dependency failure.

## 6. Authentication and authorization

1. Signup validates email and password, hashes the password with Argon2id, creates the user and organization, and sets a secure HTTP-only session cookie.
2. Login verifies the Argon2 hash and creates a short-lived access session. Refresh rotation is used if a separate refresh token is implemented.
3. Cookies use `Secure`, `HttpOnly`, `SameSite=Lax`, and a CSRF token for state-changing browser requests.
4. Passwords are never logged or stored in plaintext. Login attempts are rate limited.
5. `member` users can only access their own organization, saved grants, reminders, and reports. `admin` users can manage sources and inspect job health but cannot read unrelated private notes unless explicitly needed.
6. Every protected query includes the organization ownership constraint. IDs from the client are never trusted as authorization.
7. Logout revokes the session. Password reset is Phase 2 unless the hosting/demo requirements make it necessary.

## 7. Background jobs

| Job | Frequency | Purpose | Failure handling |
|---|---|---|---|
| `refresh_sources` | Daily at 02:00 UTC | Fetch and normalize 3-5 approved sources | Retry once, record failed source, keep prior data |
| `recalculate_matches` | After profile/source changes, plus nightly | Update scores and reasons | Record job run; show stale calculation time |
| `send_deadline_reminders` | Daily at 08:00 UTC | Send reminders for 30, 14, and 3-day windows | Idempotency key prevents duplicates |
| `expire_grants` | Daily | Mark past or removed grants inactive | Never delete provenance |
| `cleanup_reports` | Weekly | Remove expired generated files | Keep report metadata |
| `source_health_summary` | Weekly | Create admin health summary | Dashboard warning if failures persist |

Use a single worker process for the MVP. A scheduled GitHub Actions workflow can call an authenticated admin endpoint or run a worker command. This avoids introducing a message broker before one is needed.

## 8. AI/LLM component

### Exact use case

When a user opens a grant, provide a short explanation of why it may or may not fit their organization and what should be verified before applying.

### Input and retrieval

- Organization: focus areas, regions, type, team size, budget
- Grant: title, summary, eligibility text, regions, applicant types, deadline, amount
- Structured match result and source URL

The service retrieves only these stored fields. This is a small RAG pattern over authoritative, application-specific records, not a general web search chatbot.

### Prompt strategy

Require JSON with `summary`, `matched_points`, `missing_or_uncertain_points`, and `verification_questions`. Tell the model to use only supplied text, say "unknown" when evidence is absent, avoid legal/funding guarantees, and never invent a deadline or eligibility rule.

### Output validation and fallback

Pydantic validates the JSON schema, limits length, strips unsupported claims, and stores the model name and timestamp. If the model times out, returns invalid JSON, or is unavailable, templates generated from the structured match result produce a useful explanation. The source URL is always shown.

### Free options

- Development/demo: Ollama running locally with a small open model.
- Optional hosted demo: a free-tier provider behind an environment-configured adapter, subject to its current limits.
- Core functionality: rule-based matching and templates, so the app remains usable without any API key or paid service.

Do not send passwords, private notes, or unnecessary personal data to an external model. AI output is assistance, not an eligibility decision.

## 9. Reporting

### Funding pipeline report

A user can click **Generate report** to create a PDF containing:

- Organization name and report date
- Count of saved opportunities by status
- Upcoming deadlines sorted by urgency
- Funder, grant title, amount, match score, and status
- Matched criteria and missing/verify criteria
- Follow-up dates and notes
- Source/application URLs
- Data freshness timestamp and a disclaimer to verify official requirements

The report is generated on demand and optionally attached to a weekly email summary. In-app reports remain downloadable for seven days in the MVP.

## 10. Caching

- **Source responses:** Cache for 12 hours per source URL to reduce load and respect public sites. Invalidate on a manual admin refresh.
- **Grant search results:** Cache normalized query keys for 5 minutes. Invalidate when a source refresh changes grant records.
- **Match results:** Persist in `match_results`; recalculate when the profile or grant content hash changes.
- **AI explanations:** Cache by `(organization_id, grant_id, grant_content_hash, profile_hash)` for 24 hours. Invalidate on relevant data changes.
- **Dashboard summary:** Cache for 60 seconds per organization.

Use Redis-compatible storage when available. A database cache table or in-process cache is acceptable for a single-instance MVP; correctness must not depend on the cache.

## 11. Deployment

### Free deployment plan

- Frontend: Vercel or another free static host connected to GitHub.
- Backend: free-tier Render-style web service or a free container host. Configure health checks and accept cold starts for the capstone demo.
- Database: Supabase free PostgreSQL with a separate development database or schema.
- Cron: GitHub Actions scheduled workflow calling the protected job endpoint, or the backend host's free scheduled job if available.
- Cache: optional free Redis-compatible service. Disable it and use database fallback if limits change.
- Email: SMTP supplied by the user for development; email can be disabled and replaced by in-app notifications in the public demo.
- LLM: local Ollama for development; hosted adapter is optional. The demo must still work with AI disabled.

Free tiers change, so record the exact providers and limits used in the README at deployment time. No paid API or subscription should be required to run the MVP.

### Environment variables

```text
DATABASE_URL
APP_SECRET_KEY
FRONTEND_ORIGIN
COOKIE_SECURE
SMTP_HOST
SMTP_PORT
SMTP_USERNAME
SMTP_PASSWORD
EMAIL_FROM
REDIS_URL
LLM_PROVIDER=ollama|none|hosted
LLM_BASE_URL
LLM_MODEL
CRON_SECRET
SENTRY_DSN=optional
```

Never commit `.env` files or real credentials. Provide `.env.example` with placeholder values.

## 12. Five milestones

### Milestone 1: Working account and profile slice

- **Goal:** A user can sign up, log in, and save an organization profile.
- **Features:** React shell, FastAPI health endpoint, PostgreSQL migrations, auth, profile form.
- **Concepts:** REST, database, authentication/authorization, deployment skeleton.
- **Expected output:** Deployed or locally runnable app with a protected profile page.
- **Definition of done:** Signup/login/logout work; passwords are hashed; unauthorized profile access returns `401`; tests cover auth and ownership.

### Milestone 2: Grant catalogue and ingestion

- **Goal:** A user can browse real, sourced grant records.
- **Features:** Common grant schema, seed data, one parser, source provenance, filters, pagination, admin import command.
- **Concepts:** REST, database indexes, scraping/feed ingestion, background job, caching.
- **Expected output:** At least 30 test or public grant records with source links and freshness timestamps.
- **Definition of done:** Repeat imports do not create duplicates; a failed source is visible; catalogue search works on mobile and desktop.

### Milestone 3: Explainable matching and pipeline

- **Goal:** The catalogue becomes useful for one organization's decisions.
- **Features:** Rule-based score, match reasons, saved grants, statuses, notes, follow-up dates, dashboard.
- **Concepts:** Business rules, authorization, persisted workflow, cache invalidation.
- **Expected output:** A user can move an opportunity from saved to reviewing/applied and understand the score.
- **Definition of done:** Profile changes update matches; users cannot see another organization's pipeline; score tests cover positive, negative, and incomplete cases.

### Milestone 4: AI explanation, reminders, and report

- **Goal:** Reduce interpretation and tracking effort.
- **Features:** Optional LLM adapter, validation/fallback, daily reminder job, in-app/email notification, PDF pipeline report.
- **Concepts:** LLM/RAG, background jobs, reporting, email, error handling.
- **Expected output:** A generated PDF and a useful explanation even when the model is turned off.
- **Definition of done:** Invalid/failed model output falls back safely; duplicate reminders are prevented; PDF contains source links and deadlines.

### Milestone 5: Polish, deployment, and evidence

- **Goal:** Make the project portfolio-ready and reproducible.
- **Features:** Responsive UI polish, accessibility pass, loading/error states, API docs, CI, production deployment, demo seed account/data, screenshots.
- **Concepts:** Deployment, testing, observability, documentation.
- **Expected output:** Public demo, GitHub repository, architecture diagram, test report, and capstone document.
- **Definition of done:** Fresh clone setup works from README; CI passes; demo flow works; no secrets are committed; limitations are documented.

### Push routine after every milestone

```text
# inspect changes
git status
git diff --stat

# stage only the completed milestone
git add README.md docs/ frontend/ backend/ database/ services/ tests/
git commit -m "milestone N: short description"
git push origin main
```

Use a separate branch only if the program requires pull requests. Before pushing, run the milestone's focused tests and update the changelog or milestone notes.

## 13. MVP versus future scope

### MVP: must build

- One account owns one organization profile
- Three to five curated public sources or a documented seed importer
- 30-100 normalized grants with provenance
- Search, filters, pagination, and source links
- Rule-based explainable matching
- Saved grants with status, notes, and follow-up date
- Dashboard with upcoming deadlines
- Daily in-app reminders; email as a configured optional channel
- On-demand PDF pipeline report
- Optional LLM explanation with deterministic fallback
- Auth, ownership checks, migrations, tests, CI, and free deployment

### Phase 2: only if time remains

- Multiple team members and invitations
- More than five source adapters
- Full text semantic embeddings and vector database
- Browser extension or external integrations
- Application document workspace
- Calendar sync and SMS
- Funding outcome analytics
- Multi-language translation
- Automated source discovery
- Automatic application writing or submission

Do not add payments, a mobile app, real-time collaboration, or a large vector platform to the MVP.

## 14. Suggested GitHub structure

```text
Capstone-1/
|-- README.md
|-- LICENSE
|-- .gitignore
|-- .env.example
|-- docker-compose.yml
|-- docs/
|   |-- solution-blueprint.md
|   |-- architecture.md
|   |-- api.md
|   |-- database.md
|   |-- testing.md
|   |-- milestones/
|   |   |-- milestone-01.md
|   |   |-- milestone-02.md
|   |   `-- ...
|   `-- screenshots/
|-- frontend/
|   |-- package.json
|   |-- src/
|   |-- public/
|   `-- tests/
|-- backend/
|   |-- pyproject.toml
|   |-- app/
|   |   |-- api/
|   |   |-- core/
|   |   |-- models/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- workers/
|   `-- tests/
|-- database/
|   |-- migrations/
|   `-- seed/
|-- services/
|   |-- ingestion/
|   |-- matching/
|   |-- reporting/
|   `-- notifications/
|-- tests/
|   |-- integration/
|   `-- fixtures/
|-- .github/
|   `-- workflows/
|       |-- ci.yml
|       `-- scheduled-jobs.yml
`-- CHANGELOG.md
```

## 15. Testing strategy

- **Unit tests:** Matching score, normalization, deduplication, deadline windows, prompt/output validation, report data shaping.
- **API tests:** Auth, pagination, filters, CRUD, status transitions, error response shape, rate limiting.
- **Authentication tests:** Password hashing, invalid login, session expiration, logout, CSRF, ownership isolation, admin-only endpoints.
- **Database tests:** Migrations from empty database, unique constraints, cascading deletion, indexes used by important queries.
- **Integration tests:** Import source fixture to normalized grant to match result; reminder job idempotency; report generation; LLM failure fallback.
- **Frontend tests:** Login form validation, grant filter state, loading/error/empty states, save/status update, accessible labels.
- **End-to-end smoke test:** Signup, profile, search, save, update status, generate report.
- **Manual checks:** Mobile layout, keyboard navigation, source-link verification, stale data warning, no secrets in bundle/logs.

Quality gates: no failing tests, no critical authorization issue, API docs updated, and at least one screenshot/demo path for each completed milestone.

## 16. Final document outline

Create `docs/My 10x Solution - Your Name Surname.md` with these sections:

1. Title and executive summary
2. Problem and evidence from user interviews or desk research
3. Why I chose this problem
4. Target users and user journey
5. Proposed solution and measurable value
6. MVP features and explicit non-goals
7. Architecture diagram and data flow
8. Database design and API design
9. Technologies and why each was selected
10. 10x concepts implemented, mapped to features
11. Implementation approach and milestone evidence
12. AI/LLM boundaries, fallback, and responsible use
13. Testing strategy and results
14. Deployment process and operational limitations
15. Challenges, trade-offs, and lessons learned
16. Results: screenshots, demo metrics, test counts, and response times
17. Security, privacy, and data-quality considerations
18. Future improvements
19. Conclusion and links to repository/demo

Use evidence instead of inflated claims. For example: number of normalized grants, import success rate, median search response time, number of passing tests, and time needed to create a report from a seeded account.

## 17. Day-by-day roadmap

This is a 15-day implementation plan. Adjust the dates to the actual capstone calendar; do not expand the MVP when a day slips.

| Day | Work | Deliverable |
|---:|---|---|
| 1 | Confirm user/problem, create repo structure, define MVP, collect 10-20 source examples | README, issue board, problem notes |
| 2 | Scaffold FastAPI, React, database connection, environment handling, CI skeleton | Health endpoint and frontend shell |
| 3 | Implement migrations, user model, Argon2 auth, session cookie | Signup/login tests |
| 4 | Organization profile API and form, ownership checks | Protected profile flow; push Milestone 1 |
| 5 | Define grant schema, seed fixtures, source adapter interface | Normalized seed catalogue |
| 6 | Implement first two source adapters, provenance, deduplication | Repeatable import command |
| 7 | Add search/filter API, pagination, cache, catalogue UI | Browsable sourced catalogue; push Milestone 2 |
| 8 | Implement matching rules and explanation reasons | Match score tests |
| 9 | Add saved grants, status changes, notes, follow-up dates | Working pipeline workflow |
| 10 | Add dashboard and profile-triggered recalculation | Useful daily view; push Milestone 3 |
| 11 | Add LLM adapter, constrained prompt, schema validation, fallback | AI explanation demo with model off/on |
| 12 | Add reminder job, notification records, PDF report | Reminder and report flow; push Milestone 4 |
| 13 | Responsive/accessibility polish, empty/error/loading states, admin health view | Portfolio-quality UI |
| 14 | Deploy frontend/API/database, configure cron, run smoke tests, remove secrets | Public demo URL |
| 15 | Write final document, capture screenshots/metrics, update README and changelog, CI check | Final submission; push Milestone 5 |

## 18. Final submission checklist

### Product

- [ ] A visitor can understand the problem and target user in under one minute.
- [ ] Demo account or seed data makes the main workflow immediately visible.
- [ ] Search, matching, saving, reminders, and PDF report work end to end.
- [ ] Official source links and freshness timestamps are visible.
- [ ] AI can be disabled without breaking the MVP.

### Engineering

- [ ] REST API is documented with OpenAPI or `docs/api.md`.
- [ ] Database migrations run from an empty database.
- [ ] Authorization is tested for organization isolation.
- [ ] Background jobs are idempotent and failures are recorded.
- [ ] Cache has a safe fallback and invalidation rules.
- [ ] CI runs frontend and backend tests.
- [ ] Health endpoint and deployment instructions work.

### GitHub

- [ ] Repository has a clear README, screenshots, architecture diagram, and demo link.
- [ ] Five milestone commits are visible and meaningful.
- [ ] No `.env`, tokens, passwords, or private user data are committed.
- [ ] Issues or project board show scope decisions and completed work.
- [ ] License and contribution notes are present if the project is public.

### Capstone document

- [ ] Document is titled `My 10x Solution - Your Name Surname`.
- [ ] Problem, users, solution, features, architecture, technologies, concepts, challenges, results, and future work are covered.
- [ ] Results include concrete measurements and limitations.
- [ ] Screenshots and links point to the deployed app and repository.
- [ ] The document distinguishes implemented features from planned features.

## 19. Scope guardrails

- Start with one region and three to five sources.
- Keep one organization per account until the MVP is stable.
- Prefer stored structured fields over a vector database.
- Prefer in-app notifications over adding SMS.
- Treat every source and AI result as untrusted until displayed with provenance or validated output.
- A smaller deployed workflow with tests is a stronger capstone than a larger unfinished platform.
