"""Inventory ledger repository for stock operations."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.core.logging import logger


class InventoryLedgerRepository:
    """Repository for inventory ledger data access."""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def create_ledger_entry(
        self,
        product_id: UUID,
        quantity: int,
        reference_type: str,
        reference_id: Optional[UUID] = None
    ) -> dict:
        """Create a new inventory ledger entry."""
        try:
            data = {
                "product_id": str(product_id),
                "quantity": quantity,
                "reference_type": reference_type,
                "reference_id": str(reference_id) if reference_id else None
            }
            result = self.db.table("inventory_ledger").insert(data).execute()
            if result.data:
                logger.info(f"Created ledger entry: {reference_type} {quantity} for product {product_id}")
                return result.data[0]
            raise ValueError("Failed to create ledger entry")
        except Exception as e:
            logger.error(f"Error creating ledger entry: {e}")
            raise
    
    async def get_product_stock(self, product_id: UUID) -> int:
        """Calculate current stock for a product (SUM of quantity)."""
        try:
            result = self.db.table("inventory_ledger").select("quantity").eq("product_id", str(product_id)).execute()
            if result.data:
                total = sum(entry["quantity"] for entry in result.data)
                return total
            return 0
        except Exception as e:
            logger.error(f"Error calculating stock for product {product_id}: {e}")
            raise
    
    async def get_ledger_history(self, product_id: UUID, limit: int = 100) -> List[dict]:
        """Get ledger history for a product."""
        try:
            result = self.db.table("inventory_ledger").select("*").eq("product_id", str(product_id)).order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting ledger history for product {product_id}: {e}")
            raise
    
    async def get_all_stocks(self) -> List[dict]:
        """Get current stock for all products."""
        try:
            # Get all active products
            products_result = self.db.table("products").select("id, name").eq("is_active", True).execute()
            products = products_result.data or []
            
            # Calculate stock for each product
            stocks = []
            for product in products:
                product_id = product["id"]
                stock = await self.get_product_stock(UUID(product_id))
                
                # Get last movement time
                last_movement = self.db.table("inventory_ledger").select("created_at").eq("product_id", product_id).order("created_at", desc=True).limit(1).execute()
                last_movement_at = last_movement.data[0]["created_at"] if last_movement.data else None
                
                stocks.append({
                    "product_id": product_id,
                    "product_name": product["name"],
                    "current_stock": stock,
                    "last_movement_at": last_movement_at
                })
            
            return stocks
        except Exception as e:
            logger.error(f"Error getting all stocks: {e}")
            raise

