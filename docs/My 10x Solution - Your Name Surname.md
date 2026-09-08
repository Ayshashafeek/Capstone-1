# My 10x Solution - Your Name Surname

## Executive summary

GrantBridge is a web application that helps small nonprofits and community organizations discover, understand, and track grant opportunities. It combines a source-backed grant catalogue with organization profiles, explainable matching, saved opportunities, reminders, fit explanations, and PDF reporting.

The project was created to solve a practical problem: organizations with limited fundraising capacity often lose time searching across disconnected websites and miss opportunities because deadlines and eligibility requirements are difficult to compare. GrantBridge turns that scattered process into a focused funding pipeline.

## 1. Problem

Small nonprofits and community organizations rely on grants to fund programs, but they frequently do not have a dedicated grants researcher. Information is distributed across government, foundation, and community websites. Each opportunity may use different terminology, eligibility rules, geographic requirements, funding ranges, and deadlines.

The current process is often manual:

1. Search many websites and copy links into documents or spreadsheets.
2. Read long eligibility descriptions to decide whether an opportunity might fit.
3. Try to remember deadlines and follow-up tasks.
4. Track application status separately from the original opportunity.

This creates several problems:

- Valuable staff time is spent searching instead of preparing applications.
- Opportunities are difficult to compare consistently.
- Deadlines can be missed.
- A search result does not explain why it may fit a particular organization.
- Notes, decisions, and application status become scattered across files.

The problem is meaningful because a missed grant deadline can directly reduce the funding available for community programs.

## 2. Why I chose this problem

I chose this problem because it affects organizations that create public value but often operate with limited staff and technology budgets. It also offered a strong opportunity to build a complete product rather than a generic CRUD application.

The project connects a real workflow with several useful engineering concepts: authentication, a relational database, data ingestion, REST APIs, explainable matching, reminders, reporting, and deployment. Each technology supports a user need instead of being added only to increase the technology count.

## 3. Target users

The primary users are:

- Small nonprofit staff members responsible for fundraising
- Volunteer grant writers
- Community groups and social enterprises applying for local or public funding

The MVP is designed for one organization per account. It is not intended to make legal decisions, guarantee eligibility, automatically submit applications, or replace official funder instructions.

## 4. Proposed solution

GrantBridge gives each organization a private workspace. The user first describes the organization’s mission, type, regions served, focus areas, budget, and team size.

The user can then browse a normalized catalogue of public grant opportunities. Each opportunity includes its title, funder, summary, eligibility text, focus areas, eligible regions, funding range, deadline, official application link, and verification date.

GrantBridge compares the organization profile with the structured grant information. It displays an explainable match score and reasons such as:

- Focus area matches
- Service region appears eligible
- Organization type appears eligible
- Criteria that still need verification

The user can save an opportunity into a funding pipeline, change its status, add notes, and track follow-up work. The application also generates a fit explanation, creates deadline reminders, and produces a PDF report of the saved pipeline.

## 5. How the solution solves the problem

GrantBridge addresses the original problems directly:

| Problem | GrantBridge solution | Value |
|---|---|---|
| Grant information is scattered | A normalized catalogue with source links | Less time spent collecting basic information |
| Opportunities are hard to compare | Common fields for focus, region, deadline, amount, and applicant type | Faster shortlisting |
| Users do not know why a grant may fit | Deterministic score with visible match reasons | More transparent decisions |
| Deadlines are easy to miss | Saved grants and reminder records for 30, 14, and 3-day windows | Better deadline visibility |
| Notes and statuses are scattered | Organization-scoped funding pipeline | One place for follow-up work |
| Reports take time to assemble | Downloadable PDF pipeline report | Easier internal review and sharing |

The system does not claim that a high score means an organization is eligible. It helps users prioritize research and always directs them back to the official source for verification.

## 6. Implemented features

### Authentication and organization profile

- Signup and login
- Argon2 password hashing
- HTTP-only session cookies
- Protected organization profile
- Organization ownership checks

### Grant catalogue

- 30 curated demonstration grant records
- Source provenance and verification dates
- Search by keyword
- Focus-area and region filters
- Pagination
- Official application links
- Idempotent seed ingestion

### Matching and pipeline

- Deterministic match scores
- Match reasons and missing criteria
- Save and remove opportunities
- Saved, reviewing, applied, rejected, won, and archived statuses
- Notes and follow-up dates
- Dashboard totals and pipeline ceiling

### AI, reminders, and reporting

- Source-grounded fit explanation
- Deterministic fallback that works without a paid API
- Idempotent deadline reminder generation
- In-app reminder records
- PDF funding pipeline report

## 7. MVP boundaries

The MVP intentionally uses one organization per account, a limited curated catalogue, and an optional AI layer. It does not include team invitations, automatic application writing, payment processing, SMS, a mobile application, or a large vector database.

These boundaries make it possible to complete and demonstrate a reliable working product within the capstone timeline.

## 8. Architecture and database

The frontend is a React and TypeScript application built with Vite. It communicates with a FastAPI backend through authenticated JSON REST endpoints. The backend uses SQLAlchemy and supports SQLite locally and PostgreSQL for deployment.

The main records are:

- `users`: accounts, password hashes, roles, and active state
- `organizations`: mission and funding context used for matching
- `grant_sources`: source names, URLs, and ingestion health
- `grants`: normalized opportunity data and provenance
- `saved_grants`: organization-specific pipeline records
- `match_results`: explainable matching data
- `reminders`: deadline reminder records

The full architecture diagram is available in [docs/architecture.md](architecture.md).

## 9. Technologies and 10x concepts

- **REST API:** FastAPI endpoints for authentication, grants, saved opportunities, reminders, reports, and health checks.
- **Database:** SQLAlchemy models with SQLite locally and PostgreSQL support for deployment.
- **Authentication and authorization:** Argon2 password hashing, HTTP-only session cookies, and organization ownership rules.
- **Data ingestion:** A repeatable importer normalizes curated grant records and avoids duplicates.
- **Background-job concept:** Reminder generation is idempotent and ready to be called by a scheduled worker or cron job.
- **Reporting:** ReportLab generates a downloadable PDF funding pipeline report.
- **Caching decision:** The MVP keeps correctness independent of caching and avoids introducing a cache service before it is needed.
- **AI/LLM concept:** The explanation service uses source-grounded inputs and a deterministic fallback. An external model can be added behind the same service boundary later.
- **Deployment:** GitHub Actions CI, Docker backend configuration, Render-style deployment configuration, Vercel frontend configuration, health checks, and environment variables.

## 10. Implementation approach

The project was built in five incremental milestones:

1. Authentication and organization profile: commit `647bc5f`
2. Grant catalogue and ingestion: commit `1ee9fcc`
3. Matching and funding pipeline: commit `659f6b3`
4. Explanations, reminders, and reports: commit `84ef20e`
5. Deployment and portfolio evidence: commit `6b20d2a`

After deployment testing, the PostgreSQL driver and connection handling were improved in commits `eb6609d`, `c4c8304`, and `b2d692f`.

## 11. Testing and results

The backend includes tests for:

- Authentication and protected profile access
- Duplicate email rejection
- Grant ingestion and deduplication
- Catalogue filters and pagination
- Match scoring
- Saved grant status and notes
- Dashboard totals
- Reminder idempotency
- Explanation fallback
- PDF report generation
- PostgreSQL URL normalization

The final local validation produced seven passing backend tests and a successful Vite production build. The frontend and backend also report no editor diagnostics in the checked source directories.

The demonstration catalogue contains 30 curated records. These records are intended to demonstrate the product workflow and must be verified against official funder sources before real operational use.

## 12. Challenges and trade-offs

### Public data quality

Grant websites can change structure and may contain incomplete information. The application stores provenance and verification dates so users can inspect the original source instead of treating imported data as permanent truth.

### SQLite and PostgreSQL

SQLite makes local setup simple, while PostgreSQL is more appropriate for deployment. The application supports both through SQLAlchemy and includes the Psycopg driver for PostgreSQL.

### Direct Supabase networking

Render could not reach the IPv6 address returned by Supabase’s direct database host. The deployment guide now recommends Supabase’s Session Pooler, which is more suitable for hosted service networking.

### AI reliability

The AI feature is intentionally constrained. The application can produce a useful explanation without an external model, and the source URL remains visible. This prevents the MVP from depending on a paid API or unsupported model output.

### Scope control

Team collaboration, automatic application writing, SMS, and advanced semantic search were excluded from the MVP to protect delivery of the core workflow.

## 13. Responsible use and limitations

GrantBridge is a planning assistant, not a funding authority. Users must verify current eligibility, deadlines, amounts, and application instructions on the official funder website.

The application does not automatically submit applications. It does not make legal decisions or guarantee that an organization will qualify. Passwords are hashed, session cookies are HTTP-only, and users are restricted to their own organization’s private pipeline.

The public demonstration data is curated sample data. It is not a guarantee that the listed opportunities are currently open.

## 14. Future improvements

- Team members and organization invitations
- More public source adapters
- Hosted scheduled reminder jobs
- Optional local or hosted LLM provider
- Calendar integration
- Email reminders
- Application document workspace
- Historical funding analytics
- Better source freshness monitoring

## 15. Conclusion

GrantBridge solves a concrete workflow problem for small organizations: it reduces the effort required to find, compare, understand, and track grant opportunities.

The value of the solution is measurable through workflow indicators such as the number of normalized opportunities, the time required to create a shortlist, the number of saved opportunities with visible deadlines, the number of passing tests, and the time required to generate a PDF report.

The project links are:

- GitHub repository: `https://github.com/Ayshashafeek/Capstone-1`
- Live frontend: `YOUR_VERCEL_URL`
- Live backend: `YOUR_RENDER_URL`
- API documentation: `YOUR_RENDER_URL/docs`
