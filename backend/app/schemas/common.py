"""Common Pydantic schemas."""
from datetime import datetime
from uuid import UUID


class TimestampSchema:
    created_at: datetime
    updated_at: datetime


class PaginationParams:
    limit: int = 20
    offset: int = 0
