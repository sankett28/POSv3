"""Master API router combining all v1 routes."""
from fastapi import APIRouter
from app.api.v1 import auth, products, inventory, billing, health

api_router = APIRouter()

# Include all sub-routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
api_router.include_router(billing.router, prefix="/bills", tags=["billing"])
api_router.include_router(health.router, tags=["health"])

