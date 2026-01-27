"""Application configuration."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """App settings from env."""

    app_name: str = "E-Notary API"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"
    graphql_path: str = "/graphql"

    # Database (override via DATABASE_URL / DATABASE_URL_SYNC)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/enotary"
    database_url_sync: str = "postgresql://postgres:postgres@localhost:5432/enotary"

    # JWT
    secret_key: str = "change-me-in-production-use-openssl-rand-hex-32"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # CORS - explicitly list frontend origins for credentials support
    cors_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:3003",
    ]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
