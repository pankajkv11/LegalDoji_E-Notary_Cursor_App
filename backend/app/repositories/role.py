"""Role repository."""
from app.models.user import Role
from app.repositories.base import BaseRepository


class RoleRepository(BaseRepository[Role]):
    def __init__(self, session):
        super().__init__(session, Role)
