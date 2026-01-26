"""FastAPI dependencies."""
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.graphql.context import Context
from app.core.security import decode_token
from app.repositories.user import UserRepository

security = HTTPBearer(auto_error=False)


async def get_context(
    session: AsyncSession,
    credentials: Optional[HTTPAuthorizationCredentials] = None,
) -> Context:
    user = None
    if credentials and credentials.credentials:
        payload = decode_token(credentials.credentials)
        if payload and payload.get("type") == "access" and payload.get("sub"):
            repo = UserRepository(session)
            user = await repo.get(payload["sub"])
    return Context(session=session, user=user)


async def get_async_db():
    from app.db.session import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
