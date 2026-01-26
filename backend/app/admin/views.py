"""Starlette Admin ModelViews for E-Notary."""
from starlette_admin.contrib.sqla import Admin, ModelView

from app.db.session import sync_engine
from app.models.user import User, Role
from app.models.document import Document, DocumentTemplate
from app.models.order import Order, Payment, Delivery
from app.models.appointment import Appointment
from app.models.address import Address
from app.models.notary import Notary, NotaryApplication
from app.models.content import Service, FAQ, ContactSubmission, Review, PricingPlan
from app.models.admin import AdminSettings


admin = Admin(sync_engine, title="E-Notary Admin")

admin.add_view(ModelView(User, icon="fa fa-users", label="Users"))
admin.add_view(ModelView(Role, icon="fa fa-user-tag", label="Roles"))
admin.add_view(ModelView(Notary, icon="fa fa-balance-scale", label="Notaries"))
admin.add_view(ModelView(NotaryApplication, icon="fa fa-file-alt", label="Notary Applications"))
admin.add_view(ModelView(Document, icon="fa fa-file", label="Documents"))
admin.add_view(ModelView(DocumentTemplate, icon="fa fa-file-code", label="Document Templates"))
admin.add_view(ModelView(Order, icon="fa fa-shopping-cart", label="Orders"))
admin.add_view(ModelView(Payment, icon="fa fa-credit-card", label="Payments"))
admin.add_view(ModelView(Delivery, icon="fa fa-truck", label="Deliveries"))
admin.add_view(ModelView(Appointment, icon="fa fa-calendar-check", label="Appointments"))
admin.add_view(ModelView(Address, icon="fa fa-map-marker-alt", label="Addresses"))
admin.add_view(ModelView(Service, icon="fa fa-briefcase", label="Services"))
admin.add_view(ModelView(FAQ, icon="fa fa-question-circle", label="FAQs"))
admin.add_view(ModelView(ContactSubmission, icon="fa fa-envelope", label="Contact Submissions"))
admin.add_view(ModelView(Review, icon="fa fa-star", label="Reviews"))
admin.add_view(ModelView(PricingPlan, icon="fa fa-tag", label="Pricing Plans"))
admin.add_view(ModelView(AdminSettings, icon="fa fa-cog", label="Admin Settings"))
