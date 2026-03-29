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
    access_token_expire_minutes: int = 1440  # 24 hours
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # SMTP — Gmail: use an App Password (not your login password)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_start_tls: bool = True
    smtp_use_tls: bool = False

    # Twilio SMS
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""  # e.g. "+12015551234"

    # Razorpay
    razorpay_key_id: str = ""
    razorpay_key_secret: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
