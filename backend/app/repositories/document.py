"""Document and DocumentTemplate repositories."""
from sqlalchemy import select, desc, func, cast, String

from app.models.document import Document, DocumentTemplate
from app.models.enums import DocumentStatus, DocumentCategory
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    def __init__(self, session):
        super().__init__(session, Document)

    async def get_by_user(
        self,
        user_id: str,
        *,
        status: DocumentStatus | None = None,
        limit: int = 20,
        offset: int = 0,
    ):
        q = select(Document).where(
            cast(Document.user_id, String) == user_id,
            Document.deleted_at.is_(None),
        )
        if status is not None:
            q = q.where(Document.status == status)
        q = q.order_by(desc(Document.updated_at)).limit(limit).offset(offset)
        result = await self.session.execute(q)
        return list(result.scalars().all())

    async def count_by_user(self, user_id: str, status: DocumentStatus | None = None) -> int:
        q = select(func.count()).select_from(Document).where(
            cast(Document.user_id, String) == user_id,
            Document.deleted_at.is_(None),
        )
        if status is not None:
            q = q.where(Document.status == status)
        result = await self.session.execute(q)
        return result.scalar() or 0


class DocumentTemplateRepository(BaseRepository[DocumentTemplate]):
    def __init__(self, session):
        super().__init__(session, DocumentTemplate)

    async def get_by_slug(self, slug: str) -> DocumentTemplate | None:
        q = select(DocumentTemplate).where(
            DocumentTemplate.slug == slug,
            DocumentTemplate.deleted_at.is_(None),
        )
        result = await self.session.execute(q)
        return result.scalar_one_or_none()

    async def list_by_category(self, category: DocumentCategory | None = None):
        q = select(DocumentTemplate).where(DocumentTemplate.deleted_at.is_(None))
        if category is not None:
            q = q.where(DocumentTemplate.category == category)
        result = await self.session.execute(q)
        return list(result.scalars().all())
