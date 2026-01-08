"""Product repository for database operations."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.logging import logger


class ProductRepository:
    """Repository for product data access."""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def create_product(self, product: ProductCreate, user_id: UUID) -> dict:
        """Create a new product."""
        try:
            data = {
                "user_id": str(user_id),
                "name": product.name,
                "barcode": product.barcode,
                "price": product.price
            }
            result = self.db.table("products").insert(data).execute()
            if result.data:
                logger.info(f"Created product: {product.name} for user {user_id}")
                return result.data[0]
            raise ValueError("Failed to create product")
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            raise
    
    async def get_product(self, product_id: UUID, user_id: UUID) -> Optional[dict]:
        """Get a product by ID."""
        try:
            result = self.db.table("products").select("*").eq("id", str(product_id)).eq("user_id", str(user_id)).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting product {product_id}: {e}")
            raise
    
    async def list_products(self, user_id: UUID) -> List[dict]:
        """List all products for a user."""
        try:
            result = self.db.table("products").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error listing products for user {user_id}: {e}")
            raise
    
    async def update_product(self, product_id: UUID, user_id: UUID, product_update: ProductUpdate) -> Optional[dict]:
        """Update a product."""
        try:
            update_data = product_update.model_dump(exclude_unset=True)
            if not update_data:
                return await self.get_product(product_id, user_id)
            
            result = self.db.table("products").update(update_data).eq("id", str(product_id)).eq("user_id", str(user_id)).execute()
            if result.data:
                logger.info(f"Updated product {product_id}")
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {e}")
            raise
    
    async def delete_product(self, product_id: UUID, user_id: UUID) -> bool:
        """Delete a product."""
        try:
            result = self.db.table("products").delete().eq("id", str(product_id)).eq("user_id", str(user_id)).execute()
            logger.info(f"Deleted product {product_id}")
            return True
        except Exception as e:
            logger.error(f"Error deleting product {product_id}: {e}")
            raise
    
    async def get_product_by_barcode(self, barcode: str, user_id: UUID) -> Optional[dict]:
        """Get a product by barcode."""
        try:
            result = self.db.table("products").select("*").eq("barcode", barcode).eq("user_id", str(user_id)).execute()
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting product by barcode {barcode}: {e}")
            raise

