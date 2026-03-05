"""GraphQL context: session, current user."""
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from strawberry.fastapi import BaseContext

from app.models.user import User


class Context(BaseContext):
    def __init__(self, session: AsyncSession, user: Optional[User] = None):
        super().__init__()
        self.session = session
        self.user = user

    def require_user(self) -> User:
        if not self.user:
            raise PermissionError("Authentication required")
        return self.user
