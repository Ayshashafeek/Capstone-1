from app.config import normalize_database_url


def test_plain_postgresql_url_uses_psycopg3():
    assert normalize_database_url("postgresql://user:pass@host:5432/db") == "postgresql+psycopg://user:pass@host:5432/db"
    assert normalize_database_url("postgres://user:pass@host:5432/db") == "postgresql+psycopg://user:pass@host:5432/db"


def test_explicit_and_sqlite_urls_are_preserved():
    explicit = "postgresql+psycopg://user:pass@host:5432/db"
    assert normalize_database_url(explicit) == explicit
    assert normalize_database_url("sqlite:///./grantbridge.db") == "sqlite:///./grantbridge.db"