# E-Notary Backend (Phase 2)

FastAPI + Strawberry GraphQL + PostgreSQL + SQLAlchemy + Alembic + Starlette Admin + Docker.

## Structure

```
app/
├── main.py              # FastAPI app, GraphQL router, JWT, admin mount
├── graphql/
│   ├── schema.py        # Strawberry schema
│   ├── queries.py       # GraphQL queries
│   ├── mutations.py     # GraphQL mutations
│   ├── types.py         # Strawberry types
│   ├── inputs.py        # Input types
│   ├── context.py       # Request context (session, user)
│   └── resolvers/
│       └── helpers.py   # ORM → GQL mappers
├── models/              # SQLAlchemy models
├── schemas/             # Pydantic schemas (auth, etc.)
├── services/            # Auth, user, document, order
├── repositories/        # DB CRUD
├── db/
│   ├── session.py       # Async + sync engines, sessions
│   └── base.py          # Base, mixins
├── core/
│   ├── config.py        # Settings
│   ├── security.py      # JWT, password hashing
│   └── permissions.py   # RBAC
└── admin/               # Starlette Admin views
```

## Run locally

1. **PostgreSQL**  
   Create DB `enotary` and set env (or use `.env.example`):

   ```bash
   export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/enotary
   export DATABASE_URL_SYNC=postgresql://postgres:postgres@localhost:5432/enotary
   export SECRET_KEY=your-secret-key
   ```

2. **Venv + deps**

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. **Migrations**

   ```bash
   alembic -c alembic.ini upgrade head
   ```

4. **API**

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

- **GraphQL:** `http://localhost:8000/api/v1/graphql`  
- **Health:** `http://localhost:8000/health`  
- **Admin:** `http://localhost:8000/admin`

## Docker

```bash
docker compose -f docker-compose.yml up -d
```

- **db:** PostgreSQL 16 on `5432`  
- **migrate:** Runs `alembic upgrade head` once  
- **api:** FastAPI on `8000` (depends on db + migrate)

## Auth

- **Login:** `mutation { login(input: { method: EMAIL, email: "...", password: "..." }) { accessToken, user { id email } } }`  
- **Signup:** `mutation { signup(input: { name, email, phone, password, acceptTerms: true }) { ... } }`  
- **Refresh:** `mutation { refreshToken(input: { refreshToken: "..." }) { ... } }`  
- Send `Authorization: Bearer <access_token>` for protected operations.

## Phase 1 schema

GraphQL types, queries, and mutations align with `graphql-schema-phase1.json`.
