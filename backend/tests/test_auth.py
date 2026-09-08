from pathlib import Path

from fastapi.testclient import TestClient


def test_auth_and_profile_flow(tmp_path: Path, monkeypatch):
    database_path = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{database_path}")

    from app.config import settings
    settings.database_url = f"sqlite:///{database_path}"

    from app.db import Base, engine
    from app.main import app

    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    with TestClient(app) as client:
        unauthenticated = client.get("/api/v1/auth/me")
        assert unauthenticated.status_code == 401

        signup = client.post(
            "/api/v1/auth/signup",
            json={"email": "owner@example.com", "password": "correct horse", "organization_name": "Harbor Community"},
        )
        assert signup.status_code == 201
        assert signup.json()["organization"]["name"] == "Harbor Community"

        update = client.put(
            "/api/v1/organization",
            json={
                "name": "Harbor Community Network",
                "description": "A local support organization.",
                "organization_type": "Community group",
                "regions": "Colombo",
                "focus_areas": "Housing, food access",
                "annual_budget_cents": 2500000,
                "team_size": 4,
            },
        )
        assert update.status_code == 200
        assert update.json()["focus_areas"] == "Housing, food access"

        logout = client.post("/api/v1/auth/logout")
        assert logout.status_code == 204
        assert client.get("/api/v1/auth/me").status_code == 401

        login = client.post(
            "/api/v1/auth/login",
            json={"email": "owner@example.com", "password": "correct horse"},
        )
        assert login.status_code == 200
        assert login.json()["user"]["email"] == "owner@example.com"


def test_duplicate_email_is_rejected():
    from app.main import app

    with TestClient(app) as client:
        first = client.post(
            "/api/v1/auth/signup",
            json={"email": "duplicate@example.com", "password": "correct horse", "organization_name": "One"},
        )
        second = client.post(
            "/api/v1/auth/signup",
            json={"email": "duplicate@example.com", "password": "correct horse", "organization_name": "Two"},
        )
        assert first.status_code == 201
        assert second.status_code == 409
