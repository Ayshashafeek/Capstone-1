from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(database_url: str) -> str:
    """Use the installed Psycopg 3 driver for unqualified PostgreSQL URLs."""
    if database_url.startswith("postgres://"):
        return "postgresql+psycopg://" + database_url.removeprefix("postgres://")
    if database_url.startswith("postgresql://"):
        return "postgresql+psycopg://" + database_url.removeprefix("postgresql://")
    return database_url


class Settings(BaseSettings):
    app_name: str = "GrantBridge API"
    database_url: str = "sqlite:///./grantbridge.db"
    app_secret_key: str = "change-this-development-secret"
    frontend_origin: str = "http://localhost:5173"
    cookie_secure: bool = False
    session_days: int = 7

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
