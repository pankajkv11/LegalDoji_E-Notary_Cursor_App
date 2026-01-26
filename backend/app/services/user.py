"""User service."""
from app.models.user import User
from app.models.enums import UserRole
from app.core.permissions import get_permissions_for_role
from app.repositories.user import UserRepository


class UserService:
    def __init__(self, session):
        self.session = session
        self.repo = UserRepository(session)

    async def get_me(self, user_id: str) -> User | None:
        # Use get() instead of get_by_id_with_relations to avoid type mismatch
        # The relations are loaded via lazy="joined" in the model
        return await self.repo.get(user_id)

    async def get_by_id(self, user_id: str) -> User | None:
        return await self.repo.get(user_id)

    def permissions_for_user(self, user: User) -> list[str]:
        perms = get_permissions_for_role(user.role)
        return [p.value for p in perms]
