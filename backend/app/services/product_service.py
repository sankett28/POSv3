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
    
    async def create_product(self, product: ProductCreate, user_id: UUID) -> ProductResponse:
        """Create a new product with validation."""
        # Check barcode uniqueness if provided
        if product.barcode:
            existing = await self.repo.get_product_by_barcode(product.barcode, user_id)
            if existing:
                raise ValueError(f"Product with barcode {product.barcode} already exists")
        
        result = await self.repo.create_product(product, user_id)
        return ProductResponse(**result)
    
    async def get_product(self, product_id: UUID, user_id: UUID) -> Optional[ProductResponse]:
        """Get a product by ID."""
        result = await self.repo.get_product(product_id, user_id)
        if result:
            return ProductResponse(**result)
        return None
    
    async def list_products(self, user_id: UUID) -> List[ProductResponse]:
        """List all products for a user."""
        results = await self.repo.list_products(user_id)
        return [ProductResponse(**r) for r in results]
    
    async def update_product(self, product_id: UUID, user_id: UUID, product_update: ProductUpdate) -> Optional[ProductResponse]:
        """Update a product with validation."""
        # Check if product exists
        existing = await self.repo.get_product(product_id, user_id)
        if not existing:
            return None
        
        # Check barcode uniqueness if updating barcode
        if product_update.barcode and product_update.barcode != existing.get("barcode"):
            existing_barcode = await self.repo.get_product_by_barcode(product_update.barcode, user_id)
            if existing_barcode and existing_barcode["id"] != str(product_id):
                raise ValueError(f"Product with barcode {product_update.barcode} already exists")
        
        result = await self.repo.update_product(product_id, user_id, product_update)
        if result:
            return ProductResponse(**result)
        return None
    
    async def delete_product(self, product_id: UUID, user_id: UUID) -> bool:
        """Delete a product."""
        existing = await self.repo.get_product(product_id, user_id)
        if not existing:
            return False
        
        await self.repo.delete_product(product_id, user_id)
        return True

