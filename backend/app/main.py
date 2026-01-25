"""FastAPI application entrypoint."""
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from strawberry.fastapi import GraphQLRouter
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.session import get_async_session
from app.graphql.schema import schema
from app.graphql.context import Context
from app.core.security import decode_token
from app.repositories.user import UserRepository
from app.admin.views import admin

settings = get_settings()


async def get_graphql_context(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
) -> Context:
    user = None
    auth = request.headers.get("Authorization")
    if auth and auth.startswith("Bearer "):
        token = auth[7:].strip()
        payload = decode_token(token)
        if payload and payload.get("type") == "access" and payload.get("sub"):
            repo = UserRepository(session)
            user = await repo.get(payload["sub"])
    return Context(session=session, user=user)


graphql_app = GraphQLRouter(
    schema,
    path=settings.graphql_path,
    context_getter=get_graphql_context,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # shutdown hooks if any


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graphql_app, prefix=settings.api_v1_prefix)
admin.mount_to(app)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.exception_handler(PermissionError)
async def permission_handler(request: Request, exc: PermissionError):
    return JSONResponse(
        status_code=403,
        content={"detail": str(exc)},
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)},
    )
