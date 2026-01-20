"""Master API router combining all v1 routes."""
from fastapi import APIRouter
from app.api.v1 import auth, products, billing, health, categories, tax_groups, reports, themes
from app.api.admin import menu_import

api_router = APIRouter()

# Include all sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(billing.router, prefix="/bills", tags=["bills"])
api_router.include_router(categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(tax_groups.router, prefix="/tax-groups", tags=["tax-groups"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(themes.router, tags=["themes"])
api_router.include_router(health.router, tags=["health"])

# Admin routes
api_router.include_router(menu_import.router, prefix="/admin/menu", tags=["admin"])

