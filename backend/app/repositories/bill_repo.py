"""Bill repository for billing operations."""
import asyncio
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
        user_id: UUID,  # Kept for API compatibility but not used
        subtotal: float,
        tax_amount: float,
        total_amount: float,
        payment_method: PaymentMethod,
        bill_number: Optional[str] = None
    ) -> dict:
        """Create a new bill with subtotal and tax_amount."""
        try:
            # Generate bill number if not provided
            if not bill_number:
                # Simplified bill number generation without user_id dependency
                bill_count = await asyncio.to_thread(
                    lambda: self.db.table("bills").select("id", count="exact").execute()
                )
                count = bill_count.count or 0
                from datetime import datetime
                bill_number = f"BILL-{datetime.now().strftime('%Y%m%d')}-{count + 1:04d}"
            
            data = {
                "bill_number": bill_number,
                "subtotal": subtotal,
                "tax_amount": tax_amount,
                "total_amount": total_amount,
                "payment_method": payment_method.value
            }
            result = await asyncio.to_thread(
                lambda: self.db.table("bills").insert(data).execute()
            )
            if result.data:
                logger.info(f"Created bill {bill_number}")
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
        product_name_snapshot: str,
        category_name_snapshot: Optional[str],
        tax_rate: float,
        tax_amount: float,
        line_subtotal: float,
        line_total: float
    ) -> dict:
        """Create a bill item with all snapshot fields."""
        try:
            data = {
                "bill_id": str(bill_id),
                "product_id": str(product_id),
                "quantity": quantity,
                "selling_price": unit_price,  # Database uses selling_price
                "product_name_snapshot": product_name_snapshot,
                "category_name_snapshot": category_name_snapshot,
                "tax_rate": tax_rate,
                "tax_amount": tax_amount,
                "line_subtotal": line_subtotal,
                "line_total": line_total
            }
            result = await asyncio.to_thread(
                lambda: self.db.table("bill_items").insert(data).execute()
            )
            if result.data:
                return result.data[0]
            raise ValueError("Failed to create bill item")
        except Exception as e:
            logger.error(f"Error creating bill item: {e}")
            raise
    
    async def get_bill(self, bill_id: UUID, user_id: UUID) -> Optional[dict]:
        """Get a bill by ID with items using snapshot fields."""
        try:
            # Get bill - removed user_id filter since schema doesn't have it
            bill_result = await asyncio.to_thread(
                lambda: self.db.table("bills").select("*").eq("id", str(bill_id)).execute()
            )
            if not bill_result.data:
                return None
            
            bill = bill_result.data[0]
            
            # Get bill items with snapshot fields (no join needed)
            items_result = await asyncio.to_thread(
                lambda: self.db.table("bill_items").select("*").eq("bill_id", str(bill_id)).execute()
            )
            
            items = []
            for item in items_result.data or []:
                # Use all snapshot fields from bill_items
                item_data = {
                    "id": item["id"],
                    "bill_id": item["bill_id"],
                    "product_id": item["product_id"],
                    "product_name": item.get("product_name_snapshot"),  # Use snapshot
                    "category_name": item.get("category_name_snapshot"),  # Category snapshot
                    "quantity": item["quantity"],
                    "unit_price": float(item["selling_price"]),  # Map from database field
                    "tax_rate": float(item.get("tax_rate", 0)),  # Tax rate snapshot
                    "tax_amount": float(item.get("tax_amount", 0)),  # Tax amount snapshot
                    "line_subtotal": float(item.get("line_subtotal", 0)),  # Line subtotal snapshot
                    "total_price": float(item["line_total"]),    # Map from database field
                    "created_at": item["created_at"]
                }
                items.append(item_data)
            
            bill["items"] = items
            return bill
        except Exception as e:
            logger.error(f"Error getting bill {bill_id}: {e}")
            raise
    
    async def list_bills(self, user_id: UUID, limit: int = 100) -> List[dict]:
        """List all bills with their items."""
        try:
            # Removed user_id filter since schema doesn't have it
            # Fetch bills
            bills_result = await asyncio.to_thread(
                lambda: self.db.table("bills").select("id", "*").order("created_at", desc=True).limit(limit).execute()
            )
            
            bills_data = bills_result.data or []
            
            if not bills_data:
                return []
            
            # Extract bill IDs for fetching items
            bill_ids = [bill["id"] for bill in bills_data]
            
            # Fetch all bill items for the retrieved bills in one go
            items_result = await asyncio.to_thread(
                lambda: self.db.table("bill_items").select("*").in_("bill_id", bill_ids).execute()
            )
            
            all_items = items_result.data or []
            
            # Group items by bill_id
            items_by_bill_id = {}
            for item in all_items:
                bill_id = item["bill_id"]
                if bill_id not in items_by_bill_id:
                    items_by_bill_id[bill_id] = []
                # Map database fields to schema fields
                item_data = {
                    "id": item["id"],
                    "bill_id": item["bill_id"],
                    "product_id": item["product_id"],
                    "product_name": item.get("product_name_snapshot"),
                    "category_name": item.get("category_name_snapshot"),
                    "quantity": item["quantity"],
                    "unit_price": float(item["selling_price"]),
                    "tax_rate": float(item.get("tax_rate", 0)),
                    "tax_amount": float(item.get("tax_amount", 0)),
                    "line_subtotal": float(item.get("line_subtotal", 0)),
                    "total_price": float(item["line_total"]),
                    "created_at": item["created_at"]
                }
                items_by_bill_id[bill_id].append(item_data)
            
            # Attach items to their respective bills
            for bill in bills_data:
                bill["items"] = items_by_bill_id.get(bill["id"], [])
            
            return bills_data
        except Exception as e:
            logger.error(f"Error listing bills: {e}")
            raise

