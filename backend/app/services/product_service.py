"""Product service with business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.logging import logger


class ProductService:
    """Service for product business logic."""
    
    def __init__(self, db: Client):
        self.repo = ProductRepository(db)
    
    async def create_product(self, product: ProductCreate) -> ProductResponse:
        """Create a new product with validation."""
        result = await self.repo.create_product(product)
        return ProductResponse(**result)
    
    async def get_product(self, product_id: UUID) -> Optional[ProductResponse]:
        """Get a product by ID."""
        result = await self.repo.get_product(product_id)
        if result:
            return ProductResponse(**result)
        return None
    
    async def list_products(self) -> List[ProductResponse]:
        """List all products."""
        results = await self.repo.list_products()
        return [ProductResponse(**r) for r in results]
    
    async def update_product(self, product_id: UUID, product_update: ProductUpdate) -> Optional[ProductResponse]:
        """Update a product with validation."""
        # Check if product exists
        existing = await self.repo.get_product(product_id)
        if not existing:
            return None
        
        result = await self.repo.update_product(product_id, product_update)
        if result:
            return ProductResponse(**result)
        return None
    
    async def deactivate_product(self, product_id: UUID) -> bool:
        """Deactivate a product (soft delete)."""
        existing = await self.repo.get_product(product_id)
        if not existing:
            return False
        
        return await self.repo.deactivate_product(product_id)

