"""GraphQL context: session, current user."""
from dataclasses import dataclass, field
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.fastapi import BaseContext

from app.models.user import User


@dataclass
class Context(BaseContext):
    session: AsyncSession
    user: Optional[User] = None

    def require_user(self) -> User:
        if not self.user:
            raise PermissionError("Authentication required")
        return self.user
