"""Seed initial data for the application."""
import asyncio
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import AsyncSessionLocal
from app.models.document import DocumentTemplate
from app.models.content import Service, FAQ, PricingPlan
from app.models.enums import DocumentCategory, FAQCategory


async def seed_data(session: AsyncSession):
    """Seed initial data into the database."""
    
    # Seed Document Templates
    templates = [
        {
            "slug": "flat-rental-agreement",
            "name": "Flat Rental Agreement",
            "category": DocumentCategory.PROPERTY,
            "steps": [
                {"id": 1, "title": "Property Details", "fields": ["property_address", "property_type", "area"]},
                {"id": 2, "title": "Tenant Details", "fields": ["tenant_name", "tenant_phone", "tenant_email"]},
                {"id": 3, "title": "Rental Terms", "fields": ["rent_amount", "security_deposit", "lease_period"]},
                {"id": 4, "title": "Review & Confirm", "fields": []}
            ],
            "default_values": {},
            "field_configs": {}
        },
        {
            "slug": "house-rental-agreement",
            "name": "House Rental Agreement",
            "category": DocumentCategory.PROPERTY,
            "steps": [
                {"id": 1, "title": "Property Details", "fields": ["property_address", "property_type", "area"]},
                {"id": 2, "title": "Tenant Details", "fields": ["tenant_name", "tenant_phone", "tenant_email"]},
                {"id": 3, "title": "Rental Terms", "fields": ["rent_amount", "security_deposit", "lease_period"]},
                {"id": 4, "title": "Review & Confirm", "fields": []}
            ],
            "default_values": {},
            "field_configs": {}
        },
        {
            "slug": "affidavit-general",
            "name": "General Affidavit",
            "category": DocumentCategory.PERSONAL,
            "steps": [
                {"id": 1, "title": "Personal Information", "fields": ["full_name", "address", "date_of_birth"]},
                {"id": 2, "title": "Affidavit Details", "fields": ["purpose", "statement"]},
                {"id": 3, "title": "Review & Confirm", "fields": []}
            ],
            "default_values": {},
            "field_configs": {}
        },
        {
            "slug": "power-of-attorney",
            "name": "Power of Attorney",
            "category": DocumentCategory.PERSONAL,
            "steps": [
                {"id": 1, "title": "Principal Details", "fields": ["principal_name", "principal_address"]},
                {"id": 2, "title": "Agent Details", "fields": ["agent_name", "agent_address"]},
                {"id": 3, "title": "Authority Details", "fields": ["authority_scope", "validity_period"]},
                {"id": 4, "title": "Review & Confirm", "fields": []}
            ],
            "default_values": {},
            "field_configs": {}
        },
        {
            "slug": "employment-contract",
            "name": "Employment Contract",
            "category": DocumentCategory.BUSINESS,
            "steps": [
                {"id": 1, "title": "Employer Details", "fields": ["company_name", "company_address"]},
                {"id": 2, "title": "Employee Details", "fields": ["employee_name", "employee_address", "designation"]},
                {"id": 3, "title": "Employment Terms", "fields": ["salary", "joining_date", "probation_period"]},
                {"id": 4, "title": "Review & Confirm", "fields": []}
            ],
            "default_values": {},
            "field_configs": {}
        },
    ]
    
    for template_data in templates:
        existing = await session.execute(
            select(DocumentTemplate).where(
                DocumentTemplate.slug == template_data["slug"],
                DocumentTemplate.deleted_at.is_(None)
            )
        )
        if not existing.scalar_one_or_none():
            template = DocumentTemplate(
                id=str(uuid.uuid4()),
                slug=template_data["slug"],
                name=template_data["name"],
                category=template_data["category"],
                steps=template_data["steps"],
                default_values=template_data["default_values"],
                field_configs=template_data["field_configs"],
            )
            session.add(template)
    
    # Seed Services
    services = [
        {
            "name": "Document Creation",
            "description": "Create legal documents using our comprehensive template library",
            "price": "₹249",
            "base_price": 249,
            "delivery_fee": None,
            "flow": ["Select Template", "Fill Details", "Review", "Download"],
            "features": ["50+ Templates", "Auto-save", "Legal Compliance"],
            "includes": ["Digital Document", "PDF Download", "Email Copy"],
            "popular": True
        },
        {
            "name": "Video Notarization",
            "description": "Get your documents notarized via secure video call with verified notaries",
            "price": "₹999",
            "base_price": 999,
            "delivery_fee": None,
            "flow": ["Schedule Appointment", "Video Call", "Notarization", "Download"],
            "features": ["Verified Notaries", "Secure Video", "Legal Validity"],
            "includes": ["Video Session", "Digital Signature", "Recording"],
            "popular": True
        },
        {
            "name": "Physical Delivery",
            "description": "Get your notarized documents delivered to your doorstep",
            "price": "₹149",
            "base_price": 149,
            "delivery_fee": 149,
            "flow": ["Select Address", "Print & Pack", "Ship", "Deliver"],
            "features": ["Fast Delivery", "Secure Packaging", "Tracking"],
            "includes": ["Printed Copy", "Courier Service", "Tracking Number"],
            "popular": False
        },
    ]
    
    for service_data in services:
        existing = await session.execute(
            select(Service).where(
                Service.name == service_data["name"],
                Service.deleted_at.is_(None)
            )
        )
        if not existing.scalar_one_or_none():
            service = Service(
                id=str(uuid.uuid4()),
                **service_data
            )
            session.add(service)
    
    # Seed FAQs
    faqs = [
        {
            "category": FAQCategory.GENERAL,
            "question": "Are the documents legally valid?",
            "answer": "Yes, absolutely! All documents notarized through our platform are court-accepted and legally binding across India. Our notaries are registered, verified, and authorized to provide notarization services."
        },
        {
            "category": FAQCategory.GENERAL,
            "question": "Which states do you cover?",
            "answer": "We have pan-India coverage with verified notaries available in all major cities across 28 states and UTs. You can use our services from anywhere in India."
        },
        {
            "category": FAQCategory.DOCUMENTS,
            "question": "What types of documents can I create?",
            "answer": "We offer 50+ document templates including rental agreements, affidavits, power of attorney, wills, NDAs, employment contracts, partnership deeds, and more. You can also upload your own documents for notarization."
        },
        {
            "category": FAQCategory.DOCUMENTS,
            "question": "Can I upload my own document instead of using a template?",
            "answer": "Yes! You can upload existing documents in PDF or Word format. Our notaries will review and notarize them during the video session."
        },
        {
            "category": FAQCategory.NOTARIZATION,
            "question": "How does video notarization work?",
            "answer": "You join a secure video call with a verified notary, show your ID for verification, review the document together, and the notary digitally signs it. The entire session is recorded for legal validity."
        },
        {
            "category": FAQCategory.PRICING,
            "question": "How much does it cost?",
            "answer": "Document Creation: ₹249 (includes template and digital document). Video Notarization: ₹999 (includes online consultation with notary). Physical Delivery: +₹149. E-stamp charges are additional and vary by state."
        },
        {
            "category": FAQCategory.DELIVERY,
            "question": "How do I get my document after notarization?",
            "answer": "You can download your notarized document immediately as a PDF. If you opted for physical delivery (+₹149), we'll print and courier it to your address within 3-5 business days."
        },
    ]
    
    for faq_data in faqs:
        existing = await session.execute(
            select(FAQ).where(
                FAQ.question == faq_data["question"],
                FAQ.deleted_at.is_(None)
            )
        )
        if not existing.scalar_one_or_none():
            faq = FAQ(
                id=str(uuid.uuid4()),
                **faq_data
            )
            session.add(faq)
    
    # Seed Pricing Plans
    pricing_plans = [
        {
            "name": "Basic",
            "price": "₹249",
            "amount": 249,
            "period": "per document",
            "features": ["Document Creation", "Digital Download", "Email Copy"],
            "popular": False,
            "cta": "Get Started"
        },
        {
            "name": "Standard",
            "price": "₹999",
            "amount": 999,
            "period": "per document",
            "features": ["Document Creation", "Video Notarization", "Digital Download", "Email Copy"],
            "popular": True,
            "cta": "Most Popular"
        },
        {
            "name": "Premium",
            "price": "₹1,148",
            "amount": 1148,
            "period": "per document",
            "features": ["Document Creation", "Video Notarization", "Physical Delivery", "Digital Download", "Email Copy", "Tracking"],
            "popular": False,
            "cta": "Get Premium"
        },
    ]
    
    for plan_data in pricing_plans:
        existing = await session.execute(
            select(PricingPlan).where(
                PricingPlan.name == plan_data["name"],
                PricingPlan.deleted_at.is_(None)
            )
        )
        if not existing.scalar_one_or_none():
            plan = PricingPlan(
                id=str(uuid.uuid4()),
                **plan_data
            )
            session.add(plan)
    
    await session.commit()
    print("✅ Seed data created successfully!")


async def main():
    """Main function to run seed."""
    async with AsyncSessionLocal() as session:
        try:
            await seed_data(session)
        except Exception as e:
            await session.rollback()
            print(f"❌ Error seeding data: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
