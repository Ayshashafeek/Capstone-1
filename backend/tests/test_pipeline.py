from fastapi.testclient import TestClient


def test_matching_save_update_dashboard_and_delete():
    from app.db import Base, SessionLocal, engine
    from app.ingestion import upsert_grants
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    record = {
        "external_id": "pipeline-001",
        "source_name": "Pipeline test source",
        "source_type": "fixture",
        "source_url": "https://example.org/source",
        "title": "Housing access pilot",
        "funder": "Test Funder",
        "summary": "A test opportunity.",
        "eligibility_text": "Community groups should verify requirements.",
        "focus_areas": ["housing"],
        "eligible_regions": ["Colombo"],
        "applicant_types": ["community group"],
        "amount_min_cents": 100000,
        "amount_max_cents": 500000,
        "deadline": "2027-01-15T23:59:00Z",
        "application_url": "https://example.org/apply",
        "canonical_url": "https://example.org/grants/pipeline-001",
    }
    with SessionLocal() as db:
        assert upsert_grants(db, [record]) == (1, 0)

    with TestClient(app) as client:
        signup = client.post(
            "/api/v1/auth/signup",
            json={"email": "pipeline@example.com", "password": "correct horse", "organization_name": "Harbor Group"},
        )
        assert signup.status_code == 201
        client.put(
            "/api/v1/organization",
            json={
                "name": "Harbor Group",
                "description": "Housing support",
                "organization_type": "Community group",
                "regions": "Colombo",
                "focus_areas": "housing",
                "annual_budget_cents": 1000000,
                "team_size": 3,
            },
        )
        catalogue = client.get("/api/v1/grants?focus_area=housing")
        assert catalogue.status_code == 200
        item = catalogue.json()["items"][0]
        assert item["match_score"] == 100
        assert item["is_saved"] is False

        saved = client.post("/api/v1/saved-grants", json={"grant_id": item["id"]})
        assert saved.status_code == 201
        saved_id = saved.json()["id"]
        assert saved.json()["grant"]["is_saved"] is True

        duplicate = client.post("/api/v1/saved-grants", json={"grant_id": item["id"]})
        assert duplicate.status_code == 201
        assert duplicate.json()["id"] == saved_id

        updated = client.patch(
            f"/api/v1/saved-grants/{saved_id}",
            json={"status": "applied", "notes": "Prepare budget narrative", "follow_up_at": "2026-12-01T09:00:00Z"},
        )
        assert updated.status_code == 200
        assert updated.json()["status"] == "applied"

        dashboard = client.get("/api/v1/dashboard")
        assert dashboard.status_code == 200
        assert dashboard.json()["saved_count"] == 1
        assert dashboard.json()["applied_count"] == 1
        assert dashboard.json()["pipeline_amount_cents"] == 500000

        deleted = client.delete(f"/api/v1/saved-grants/{saved_id}")
        assert deleted.status_code == 204
        assert client.get("/api/v1/saved-grants").json() == []
