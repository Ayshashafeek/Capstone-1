from fastapi.testclient import TestClient


def grant_record(external_id: str, title: str, focus: list[str], region: list[str]) -> dict:
    return {
        "external_id": external_id,
        "source_name": "Test source",
        "source_type": "fixture",
        "source_url": "https://example.org/source",
        "title": title,
        "funder": "Test Funder",
        "summary": "A test opportunity for community organizations.",
        "eligibility_text": "Verify current requirements.",
        "focus_areas": focus,
        "eligible_regions": region,
        "applicant_types": ["nonprofit"],
        "amount_min_cents": 100000,
        "amount_max_cents": 500000,
        "deadline": "2027-01-15T23:59:00Z",
        "application_url": "https://example.org/apply/" + external_id,
        "canonical_url": "https://example.org/grants/" + external_id,
    }


def test_grant_search_requires_auth_and_filters_results():
    from app.db import Base, SessionLocal, engine
    from app.ingestion import upsert_grants
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    records = [
        grant_record("housing", "Housing access pilot", ["housing"], ["Colombo"]),
        grant_record("education", "Youth learning spaces", ["education"], ["National"]),
    ]
    with SessionLocal() as db:
        assert upsert_grants(db, records) == (2, 0)
        assert upsert_grants(db, records) == (0, 2)

    with TestClient(app) as client:
        assert client.get("/api/v1/grants").status_code == 401
        signup = client.post(
            "/api/v1/auth/signup",
            json={"email": "catalogue@example.com", "password": "correct horse", "organization_name": "Catalogue Group"},
        )
        assert signup.status_code == 201

        all_grants = client.get("/api/v1/grants?page=1&page_size=1")
        assert all_grants.status_code == 200
        assert all_grants.json()["total"] == 2
        assert len(all_grants.json()["items"]) == 1

        filtered = client.get("/api/v1/grants?focus_area=housing&region=Colombo")
        assert filtered.status_code == 200
        assert filtered.json()["total"] == 1
        grant_id = filtered.json()["items"][0]["id"]
        assert filtered.json()["items"][0]["source_name"] == "Test source"

        detail = client.get(f"/api/v1/grants/{grant_id}")
        assert detail.status_code == 200
        assert detail.json()["title"] == "Housing access pilot"

        missing = client.get("/api/v1/grants/not-a-grant")
        assert missing.status_code == 404
