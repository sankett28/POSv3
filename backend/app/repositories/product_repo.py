"""Product repository for database operations."""
import asyncio
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.schemas.product import ProductCreate, ProductUpdate
from app.core.logging import logger


class ProductRepository:
    """Repository for product data access."""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def create_product(self, product: ProductCreate) -> dict:
        """Create a new product."""
        try:
            data = {
                "name": product.name,
                "selling_price": product.selling_price,
                "tax_group_id": str(product.tax_group_id),
                "is_active": product.is_active
            }
            
            # Only include optional fields if provided
            if product.category_id:
                data["category_id"] = str(product.category_id)
            if product.unit:
                data["unit"] = product.unit
            
            logger.info(f"Attempting to insert product data: {data}")
            
            # Run synchronous Supabase call in thread pool to avoid blocking event loop
            result = await asyncio.to_thread(
                lambda: self.db.table("products").insert(data).execute()
            )
            
            logger.info(f"Supabase insert result: {result}")
            if result.data:
                logger.info(f"Created product: {product.name}")
                return result.data[0]
            
            logger.error(f"Failed to create product - no data returned. Result: {result}")
            raise ValueError("Failed to create product - no data returned from Supabase")
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            raise
    
    async def get_product(self, product_id: UUID) -> Optional[dict]:
        """Get a product by ID with tax group data."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("products").select("*").eq("id", str(product_id)).execute()
            )
            if result.data:
                product = result.data[0]
                
                # Fetch tax group if tax_group_id exists
                if product.get("tax_group_id"):
                    try:
                        tax_group_result = await asyncio.to_thread(
                            lambda: self.db.table("tax_groups")
                                .select("*")
                                .eq("id", product["tax_group_id"])
                                .execute()
                        )
                        if tax_group_result.data:
                            product["tax_group"] = tax_group_result.data[0]
                    except Exception as e:
                        logger.warning(f"Error fetching tax group for product {product_id}: {e}")
                        # Continue without tax group data
                
                return product
            return None
        except Exception as e:
            logger.error(f"Error getting product {product_id}: {e}")
            raise
    
    async def list_products(self) -> List[dict]:
        """List all products."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("products").select("*").order("created_at", desc=True).execute()
            )
            return result.data or []
        except Exception as e:
            logger.error(f"Error listing products: {e}")
            raise
    
    async def update_product(self, product_id: UUID, product_update: ProductUpdate) -> Optional[dict]:
        """Update a product."""
        try:
            update_data = product_update.model_dump(exclude_unset=True)
            
            # Convert UUID fields to strings if present
            if "category_id" in update_data and update_data["category_id"]:
                update_data["category_id"] = str(update_data["category_id"])
            if "tax_group_id" in update_data and update_data["tax_group_id"]:
                update_data["tax_group_id"] = str(update_data["tax_group_id"])
            
            if not update_data:
                return await self.get_product(product_id)
            
            result = await asyncio.to_thread(
                lambda: self.db.table("products").update(update_data).eq("id", str(product_id)).execute()
            )
            if result.data:
                logger.info(f"Updated product {product_id}")
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating product {product_id}: {e}")
            raise
    
    async def deactivate_product(self, product_id: UUID) -> bool:
        """Deactivate a product (soft delete)."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("products").update({"is_active": False}).eq("id", str(product_id)).execute()
            )
            if result.data:
                logger.info(f"Deactivated product {product_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deactivating product {product_id}: {e}")
            raise
    

