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
        # #region agent log
        import json
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"product_repo.py:15","message":"Repository create_product entry","data":{"productData":product.model_dump(),"dbType":str(type(self.db))},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
        # #endregion
        try:
            data = {
                "name": product.name,
                "sku": product.sku,
                "barcode": product.barcode,
                "selling_price": product.selling_price,
                "unit": product.unit,
                "is_active": product.is_active
            }
            logger.info(f"Attempting to insert product data: {data}")
            # #region agent log
            with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
                f.write(json.dumps({"location":"product_repo.py:27","message":"Before Supabase insert","data":{"insertData":data},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
            # #endregion
            # Run synchronous Supabase call in thread pool to avoid blocking event loop
            result = await asyncio.to_thread(
                lambda: self.db.table("products").insert(data).execute()
            )
            # #region agent log
            with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
                f.write(json.dumps({"location":"product_repo.py:29","message":"After Supabase insert","data":{"hasData":bool(result.data),"dataLength":len(result.data) if result.data else 0,"resultStr":str(result)[:200]},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
            # #endregion
            logger.info(f"Supabase insert result: {result}")
            logger.info(f"Result data: {result.data}")
            logger.info(f"Result status code: {getattr(result, 'status_code', 'N/A')}")
            if result.data:
                logger.info(f"Created product: {product.name} (SKU: {product.sku})")
                # #region agent log
                with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
                    f.write(json.dumps({"location":"product_repo.py:36","message":"Product created successfully","data":{"productId":result.data[0].get('id') if result.data else None},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
                # #endregion
                return result.data[0]
            logger.error(f"Failed to create product - no data returned. Result: {result}")
            # #region agent log
            with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
                f.write(json.dumps({"location":"product_repo.py:40","message":"No data returned from Supabase","data":{"resultStr":str(result)[:200]},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
            # #endregion
            raise ValueError("Failed to create product - no data returned from Supabase")
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            logger.error(f"Error type: {type(e)}")
            logger.error(f"Error details: {str(e)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            # #region agent log
            with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
                f.write(json.dumps({"location":"product_repo.py:47","message":"Exception in create_product","data":{"errorType":str(type(e)),"errorMessage":str(e),"traceback":traceback.format_exc()},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"D"}) + '\n')
            # #endregion
            raise
    
    async def get_product(self, product_id: UUID) -> Optional[dict]:
        """Get a product by ID."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("products").select("*").eq("id", str(product_id)).execute()
            )
            if result.data:
                return result.data[0]
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
    
    async def get_product_by_barcode(self, barcode: str) -> Optional[dict]:
        """Get a product by barcode."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("products").select("*").eq("barcode", barcode).execute()
            )
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting product by barcode {barcode}: {e}")
            raise
    
    async def get_product_by_sku(self, sku: str) -> Optional[dict]:
        """Get a product by SKU."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("products").select("*").eq("sku", sku).execute()
            )
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting product by SKU {sku}: {e}")
            raise

