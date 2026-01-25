"""Document service."""
import uuid
from app.models.document import Document, DocumentTemplate
from app.models.enums import DocumentStatus, DocumentCategory
from app.repositories.document import DocumentRepository, DocumentTemplateRepository


BASE_PRICE = 249
DELIVERY_FEE = 149


class DocumentService:
    def __init__(self, session):
        self.session = session
        self.repo = DocumentRepository(session)
        self.template_repo = DocumentTemplateRepository(session)

    async def create_draft(
        self,
        user_id: str,
        template_id: str,
        form_data: dict,
        title: str | None = None,
        current_step: int | None = None,
        draft_id: str | None = None,
    ) -> Document:
        template = await self.template_repo.get(template_id)
        if not template:
            raise ValueError("Template not found")
        if draft_id:
            existing = await self.repo.get(draft_id)
            if existing and existing.user_id == user_id and existing.status == DocumentStatus.DRAFT:
                existing.form_data = form_data
                existing.title = title or existing.title
                if current_step is not None:
                    existing.current_step = current_step
                await self.session.flush()
                await self.session.refresh(existing)
                return existing
        doc = Document(
            user_id=user_id,
            template_id=template_id,
            title=title or template.name,
            category=template.category,
            status=DocumentStatus.DRAFT,
            form_data=form_data,
            current_step=current_step or 1,
        )
        await self.repo.add(doc)
        return doc

    async def get_checkout_summary(
        self,
        document_id: str,
        user_id: str,
        coupon_code: str | None = None,
    ) -> dict:
        doc = await self.repo.get(document_id)
        if not doc or doc.user_id != user_id:
            raise ValueError("Document not found")
        subtotal = BASE_PRICE + DELIVERY_FEE
        discount = 0
        if coupon_code and coupon_code.strip().upper() == "SAVE10":
            discount = int(subtotal * 0.1)
        return {
            "base_price": BASE_PRICE,
            "delivery_fee": DELIVERY_FEE,
            "subtotal": subtotal,
            "discount": discount,
            "total": subtotal - discount,
            "coupon_applied": discount > 0,
        }

    async def list_templates(self, category: DocumentCategory | None = None):
        return await self.template_repo.list_by_category(category)

    async def get_template_by_slug(self, slug: str) -> DocumentTemplate | None:
        return await self.template_repo.get_by_slug(slug)
