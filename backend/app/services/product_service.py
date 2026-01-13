"""Product service with business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.product_repo import ProductRepository
from app.repositories.tax_group_repo import TaxGroupRepository
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
    
    async def bulk_update_tax_group_by_category(self, category_id: UUID, tax_group_id: UUID) -> int:
        """Bulk update tax group for all products in a category."""
        try:
            # Validate the tax group exists and is active
            tax_group_repo = TaxGroupRepository(self.repo.db)
            tax_group = await tax_group_repo.get_tax_group(tax_group_id)
            if not tax_group:
                raise ValueError(f"Tax group {tax_group_id} not found")
            if not tax_group.get("is_active", True):
                raise ValueError(f"Tax group '{tax_group.get('name')}' is not active")
            
            # Get all products from repository
            all_products = await self.repo.list_products()
            
            # Filter products by category_id
            category_products = [
                p for p in all_products 
                if p.get("category_id") == str(category_id)
            ]
            
            if not category_products:
                logger.info(f"No products found in category {category_id}")
                return 0
            
            # Update each product's tax_group_id
            updated_count = 0
            for product in category_products:
                try:
                    product_update = ProductUpdate(tax_group_id=tax_group_id)
                    result = await self.repo.update_product(UUID(product["id"]), product_update)
                    if result:
                        updated_count += 1
                except Exception as e:
                    logger.warning(f"Failed to update product {product['id']}: {e}")
                    # Continue with other products even if one fails
            
            logger.info(f"Bulk updated {updated_count} products in category {category_id} with tax group {tax_group_id}")
            return updated_count
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error bulk updating products by category: {e}")
            raise

