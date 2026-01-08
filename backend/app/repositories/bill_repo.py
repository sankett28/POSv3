"""Bill repository for billing operations."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.schemas.bill import BillCreate, PaymentMethod
from app.core.logging import logger


class BillRepository:
    """Repository for bill data access."""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def create_bill(
        self,
        user_id: UUID,
        total_amount: float,
        payment_method: PaymentMethod,
        bill_number: Optional[str] = None
    ) -> dict:
        """Create a new bill."""
        try:
            # Generate bill number if not provided
            if not bill_number:
                bill_number_result = self.db.rpc("generate_bill_number", {"user_uuid": str(user_id)}).execute()
                if bill_number_result.data:
                    bill_number = bill_number_result.data
                else:
                    # Fallback if RPC fails
                    bill_count = self.db.table("bills").select("id", count="exact").eq("user_id", str(user_id)).execute()
                    count = bill_count.count or 0
                    from datetime import datetime
                    bill_number = f"BILL-{datetime.now().strftime('%Y%m%d')}-{count + 1:04d}"
            
            data = {
                "user_id": str(user_id),
                "bill_number": bill_number,
                "total_amount": total_amount,
                "payment_method": payment_method.value
            }
            result = self.db.table("bills").insert(data).execute()
            if result.data:
                logger.info(f"Created bill {bill_number} for user {user_id}")
                return result.data[0]
            raise ValueError("Failed to create bill")
        except Exception as e:
            logger.error(f"Error creating bill: {e}")
            raise
    
    async def create_bill_item(
        self,
        bill_id: UUID,
        product_id: UUID,
        quantity: int,
        unit_price: float,
        total_price: float
    ) -> dict:
        """Create a bill item."""
        try:
            data = {
                "bill_id": str(bill_id),
                "product_id": str(product_id),
                "quantity": quantity,
                "unit_price": unit_price,
                "total_price": total_price
            }
            result = self.db.table("bill_items").insert(data).execute()
            if result.data:
                return result.data[0]
            raise ValueError("Failed to create bill item")
        except Exception as e:
            logger.error(f"Error creating bill item: {e}")
            raise
    
    async def get_bill(self, bill_id: UUID, user_id: UUID) -> Optional[dict]:
        """Get a bill by ID with items."""
        try:
            # Get bill
            bill_result = self.db.table("bills").select("*").eq("id", str(bill_id)).eq("user_id", str(user_id)).execute()
            if not bill_result.data:
                return None
            
            bill = bill_result.data[0]
            
            # Get bill items with product names
            items_result = self.db.table("bill_items").select(
                "*, products:product_id(name)"
            ).eq("bill_id", str(bill_id)).execute()
            
            items = []
            for item in items_result.data or []:
                item_data = {
                    "id": item["id"],
                    "bill_id": item["bill_id"],
                    "product_id": item["product_id"],
                    "product_name": item.get("products", {}).get("name") if isinstance(item.get("products"), dict) else None,
                    "quantity": item["quantity"],
                    "unit_price": float(item["unit_price"]),
                    "total_price": float(item["total_price"]),
                    "created_at": item["created_at"]
                }
                items.append(item_data)
            
            bill["items"] = items
            return bill
        except Exception as e:
            logger.error(f"Error getting bill {bill_id}: {e}")
            raise
    
    async def list_bills(self, user_id: UUID, limit: int = 100) -> List[dict]:
        """List all bills for a user."""
        try:
            result = self.db.table("bills").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).limit(limit).execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Error listing bills for user {user_id}: {e}")
            raise

