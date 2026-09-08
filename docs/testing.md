# Testing Evidence

## Automated checks

- Backend: `cd backend; .\\.venv\\Scripts\\python.exe -m pytest -q`
- Frontend: `cd frontend; npm run build`
- Static diagnostics: VS Code diagnostics over `backend/app` and `frontend/src`

## Covered behavior

- Signup, login, logout, password hashing, and duplicate email rejection
- Protected organization profile and ownership boundary
- Idempotent grant ingestion and duplicate-safe catalogue records
- Search, focus-area, region, pagination, and grant detail responses
- Explainable matching and saved-grant workflow
- Status, notes, dashboard totals, and deletion
- Deterministic explanation fallback
- Calendar-based reminder windows and idempotency
- PDF content type and generated file signature

## Manual acceptance path

1. Create an account.
2. Complete focus areas, regions, and organization type.
3. Browse the catalogue and inspect source links.
4. Save a high-match grant.
5. Open Funding pipeline and change its status.
6. Add a note and request an explanation.
7. Check reminders and download the pipeline PDF.
8. Verify the layout at a narrow mobile viewport and keyboard-tab through form controls.
