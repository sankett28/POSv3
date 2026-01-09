"""Billing service with snapshot-based bill creation."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.bill_repo import BillRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.bill import BillCreate, BillResponse, BillItemResponse, PaymentMethod
from app.core.logging import logger


class BillingService:
    """Service for billing business logic."""
    
    def __init__(self, db: Client):
        self.bill_repo = BillRepository(db)
        self.product_repo = ProductRepository(db)
        self.db = db
    
    async def _get_category_name(self, category_id: Optional[UUID]) -> Optional[str]:
        """Get category name by ID."""
        if not category_id:
            return None
        try:
            import asyncio
            result = await asyncio.to_thread(
                lambda: self.db.table("categories").select("name").eq("id", str(category_id)).execute()
            )
            if result.data:
                return result.data[0]["name"]
            return None
        except Exception as e:
            logger.warning(f"Error getting category {category_id}: {e}")
            return None
    
    async def create_bill(self, bill_data: BillCreate, user_id: UUID) -> BillResponse:
        """
        Create a bill with snapshot-based product data.
        
        This operation:
        1. Validates all products exist and are active
        2. Snapshots product information (name, category, price, tax_rate)
        3. Calculates tax for each item
        4. Calculates bill totals (subtotal, tax_amount, total_amount)
        5. Creates bill with totals
        6. Creates bill items with all snapshot fields
        
        All product data is snapshotted to ensure historical accuracy.
        """
        # Step 1: Validate all products exist and are active
        product_data = {}
        for item in bill_data.items:
            product = await self.product_repo.get_product(item.product_id)
            if not product:
                raise ValueError(f"Product {item.product_id} not found")
            
            # Check if product is active
            if not product.get("is_active", True):
                raise ValueError(f"Product {product['name']} is not active")
            
            # Get category name if category_id exists
            category_name = None
            if product.get("category_id"):
                category_name = await self._get_category_name(UUID(product["category_id"]))
            
            # Use current product price if not specified
            unit_price = item.unit_price if item.unit_price > 0 else float(product["selling_price"])
            
            # Get tax rate (default to 0 if not present)
            tax_rate = float(product.get("tax_rate", 0.0))
            
            # Calculate line values
            quantity = item.quantity
            line_subtotal = quantity * unit_price
            tax_amount = line_subtotal * (tax_rate / 100.0)
            line_total = line_subtotal + tax_amount
            
            product_data[item.product_id] = {
                "product": product,
                "unit_price": unit_price,
                "quantity": quantity,
                "product_name": product["name"],
                "category_name": category_name,
                "tax_rate": tax_rate,
                "line_subtotal": line_subtotal,
                "tax_amount": tax_amount,
                "line_total": line_total
            }
        
        # Step 2: Calculate bill totals
        subtotal = sum(data["line_subtotal"] for data in product_data.values())
        tax_amount = sum(data["tax_amount"] for data in product_data.values())
        total_amount = subtotal + tax_amount
        
        # Step 3: Create bill with totals
        bill = await self.bill_repo.create_bill(
            user_id=user_id,
            subtotal=subtotal,
            tax_amount=tax_amount,
            total_amount=total_amount,
            payment_method=bill_data.payment_method
        )
        bill_id = UUID(bill["id"])
        
        # Step 4: Create bill items with all snapshot fields
        bill_items = []
        for item in bill_data.items:
            data = product_data[item.product_id]
            
            # Create bill item with all snapshot fields
            bill_item = await self.bill_repo.create_bill_item(
                bill_id=bill_id,
                product_id=item.product_id,
                quantity=data["quantity"],
                unit_price=data["unit_price"],
                product_name_snapshot=data["product_name"],
                category_name_snapshot=data["category_name"],
                tax_rate=data["tax_rate"],
                tax_amount=data["tax_amount"],
                line_subtotal=data["line_subtotal"],
                line_total=data["line_total"]
            )
            bill_items.append(bill_item)
        
        # Step 5: Build response
        items_response = []
        for item in bill_items:
            items_response.append(
                BillItemResponse(
                    id=UUID(item["id"]),
                    bill_id=UUID(item["bill_id"]),
                    product_id=UUID(item["product_id"]),
                    product_name=item.get("product_name_snapshot") or product_data[UUID(item["product_id"])]["product_name"],
                    category_name=item.get("category_name_snapshot"),
                    quantity=item["quantity"],
                    unit_price=float(item.get("selling_price") or item.get("unit_price", 0)),
                    tax_rate=float(item.get("tax_rate", 0)),
                    tax_amount=float(item.get("tax_amount", 0)),
                    line_subtotal=float(item.get("line_subtotal", 0)),
                    total_price=float(item.get("line_total") or item.get("total_price", 0)),
                    created_at=item["created_at"]
                )
            )
        
        return BillResponse(
            id=UUID(bill["id"]),
            user_id=None,  # Schema doesn't have user_id, set to None
            bill_number=bill["bill_number"],
            subtotal=float(bill["subtotal"]),
            tax_amount=float(bill["tax_amount"]),
            total_amount=float(bill["total_amount"]),
            payment_method=bill["payment_method"],
            created_at=bill["created_at"],
            items=items_response
        )
    
    async def get_bill(self, bill_id: UUID, user_id: UUID) -> BillResponse:
        """Get a bill by ID."""
        bill = await self.bill_repo.get_bill(bill_id, user_id)
        if not bill:
            raise ValueError(f"Bill {bill_id} not found")
        
        items = [
            BillItemResponse(
                id=UUID(item["id"]),
                bill_id=UUID(item["bill_id"]),
                product_id=UUID(item["product_id"]),
                product_name=item.get("product_name"),
                category_name=item.get("category_name"),
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                tax_rate=item.get("tax_rate", 0),
                tax_amount=item.get("tax_amount", 0),
                line_subtotal=item.get("line_subtotal", 0),
                total_price=item["total_price"],
                created_at=item["created_at"]
            )
            for item in bill.get("items", [])
        ]
        
        return BillResponse(
            id=UUID(bill["id"]),
            user_id=None,  # Schema doesn't have user_id, set to None
            bill_number=bill["bill_number"],
            subtotal=float(bill["subtotal"]),
            tax_amount=float(bill["tax_amount"]),
            total_amount=float(bill["total_amount"]),
            payment_method=bill["payment_method"],
            created_at=bill["created_at"],
            items=items
        )
    
    async def list_bills(self, user_id: UUID, limit: int = 100) -> List[BillResponse]:
        """List all bills for a user."""
        bills = await self.bill_repo.list_bills(user_id, limit)
        return [
            BillResponse(
                id=UUID(bill["id"]),
                user_id=None,  # Schema doesn't have user_id, set to None
                bill_number=bill["bill_number"],
                subtotal=float(bill["subtotal"]),
                tax_amount=float(bill["tax_amount"]),
                total_amount=float(bill["total_amount"]),
                payment_method=bill["payment_method"],
                created_at=bill["created_at"],
                items=[]  # Items not included in list view
            )
            for bill in bills
        ]

