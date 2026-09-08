# Milestone 5 Evidence

## Goal

Make GrantBridge reproducible, testable, deployable, and ready for portfolio review.

## Completed

- GitHub Actions CI for backend tests and frontend build
- Backend Dockerfile and deployment manifest
- Frontend Vercel configuration and environment example
- `/health` liveness and `/ready` database readiness checks
- API, architecture, deployment, and testing documentation
- Manual acceptance path for the complete user workflow
- README updated with Milestone 5 status and deployment shape

## Definition of done

- [x] Fresh setup commands are documented
- [x] Backend tests pass locally and in CI configuration
- [x] Frontend production build passes
- [x] No secrets or generated build artifacts are tracked
- [x] Deployment variables and limitations are documented
- [x] A reviewer can trace the main workflow from signup to PDF report

## Known limitations

- The current demo catalogue is curated seed data and must be verified before real use.
- Reminder execution is user-triggered in the MVP; a daily hosted cron should call it after deployment hardening.
- Production PostgreSQL requires adding a PostgreSQL driver before deployment.
- The default AI behavior is deterministic and source-grounded; an external model adapter is intentionally optional.
