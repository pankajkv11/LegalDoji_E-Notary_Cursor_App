"""RBAC: role -> permissions."""
from app.models.enums import UserRole, Permission

ROLE_PERMISSIONS: dict[UserRole, list[Permission]] = {
    UserRole.USER: [
        Permission.DOCUMENT_READ,
        Permission.DOCUMENT_CREATE,
        Permission.DOCUMENT_UPDATE,
        Permission.DOCUMENT_DELETE,
        Permission.ORDER_READ,
        Permission.ORDER_CREATE,
        Permission.APPOINTMENT_READ,
        Permission.APPOINTMENT_CREATE,
        Permission.ADDRESS_READ,
        Permission.ADDRESS_CREATE,
        Permission.ADDRESS_UPDATE,
        Permission.ADDRESS_DELETE,
        Permission.NOTARY_APPLY,
    ],
    UserRole.NOTARY: [
        Permission.DOCUMENT_READ,
        Permission.ORDER_READ,
        Permission.APPOINTMENT_READ,
        Permission.APPOINTMENT_MANAGE,
        Permission.NOTARY_PROFILE,
        Permission.NOTARY_AVAILABILITY,
        Permission.ADDRESS_READ,
        Permission.ADDRESS_CREATE,
        Permission.ADDRESS_UPDATE,
        Permission.ADDRESS_DELETE,
    ],
    UserRole.ADMIN: [
        Permission.DOCUMENT_READ,
        Permission.DOCUMENT_CREATE,
        Permission.DOCUMENT_UPDATE,
        Permission.DOCUMENT_DELETE,
        Permission.ORDER_READ,
        Permission.ORDER_CREATE,
        Permission.APPOINTMENT_READ,
        Permission.APPOINTMENT_CREATE,
        Permission.APPOINTMENT_MANAGE,
        Permission.ADMIN_USERS,
        Permission.ADMIN_SETTINGS,
        Permission.ADMIN_REPORTS,
        Permission.ADMIN_APPLICATIONS,
        Permission.ADDRESS_READ,
        Permission.ADDRESS_CREATE,
        Permission.ADDRESS_UPDATE,
        Permission.ADDRESS_DELETE,
    ],
}


def get_permissions_for_role(role: UserRole) -> list[Permission]:
    return ROLE_PERMISSIONS.get(role, [])


def has_permission(role: UserRole, permission: Permission) -> bool:
    return permission in get_permissions_for_role(role)
