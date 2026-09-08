from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient


def test_explanation_pdf_and_reminder_runner():
    from app.db import Base, SessionLocal, engine
    from app.ingestion import upsert_grants
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    deadline = datetime.now(timezone.utc) + timedelta(days=30)
    record = {
        "external_id": "milestone4-001",
        "source_name": "Milestone 4 test source",
        "source_type": "fixture",
        "source_url": "https://example.org/source",
        "title": "Food access reportable fund",
        "funder": "Test Funder",
        "summary": "A test opportunity.",
        "eligibility_text": "Community groups should verify requirements.",
        "focus_areas": ["food access"],
        "eligible_regions": ["National"],
        "applicant_types": ["community group"],
        "amount_min_cents": 100000,
        "amount_max_cents": 500000,
        "deadline": deadline.isoformat(),
        "application_url": "https://example.org/apply",
        "canonical_url": "https://example.org/grants/milestone4-001",
    }
    with SessionLocal() as db:
        assert upsert_grants(db, [record]) == (1, 0)

    with TestClient(app) as client:
        signup = client.post(
            "/api/v1/auth/signup",
            json={"email": "milestone4@example.com", "password": "correct horse", "organization_name": "Food Group"},
        )
        assert signup.status_code == 201
        client.put(
            "/api/v1/organization",
            json={
                "name": "Food Group",
                "description": "Food access",
                "organization_type": "Community group",
                "regions": "National",
                "focus_areas": "food access",
                "annual_budget_cents": 1000000,
                "team_size": 3,
            },
        )
        grant = client.get("/api/v1/grants?page_size=50").json()["items"][0]
        saved = client.post("/api/v1/saved-grants", json={"grant_id": grant["id"]})
        assert saved.status_code == 201

        explanation = client.post(f"/api/v1/grants/{grant['id']}/explanation")
        assert explanation.status_code == 200
        assert explanation.json()["model"] == "deterministic-fallback"
        assert "estimated" in explanation.json()["explanation"]

        first_run = client.post("/api/v1/reminders/run")
        second_run = client.post("/api/v1/reminders/run")
        assert first_run.status_code == 200
        assert first_run.json()["created"] == 1
        assert second_run.json()["created"] == 0
        reminders = client.get("/api/v1/reminders")
        assert reminders.status_code == 200
        assert len(reminders.json()) == 1

        report = client.post("/api/v1/reports/pipeline")
        assert report.status_code == 200
        assert report.headers["content-type"] == "application/pdf"
        assert report.content.startswith(b"%PDF")
