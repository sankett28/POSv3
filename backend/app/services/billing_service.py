"""Billing service with atomic bill creation."""
from typing import List
from uuid import UUID
from supabase import Client
from app.repositories.bill_repo import BillRepository
from app.repositories.product_repo import ProductRepository
from app.services.inventory_service import InventoryService
from app.schemas.bill import BillCreate, BillResponse, BillItemResponse, PaymentMethod
from app.core.logging import logger


class BillingService:
    """Service for billing business logic."""
    
    def __init__(self, db: Client):
        self.bill_repo = BillRepository(db)
        self.product_repo = ProductRepository(db)
        self.inventory_service = InventoryService(db)
    
    async def create_bill(self, bill_data: BillCreate, user_id: UUID) -> BillResponse:
        """
        Create a bill atomically with stock deduction.
        
        This operation:
        1. Validates all products exist
        2. Validates stock availability for all items
        3. Creates bill
        4. Creates bill items
        5. Creates inventory ledger entries (outgoing)
        
        If any step fails, the operation should rollback (Supabase transactions).
        """
        # Step 1: Validate all products exist and get current prices
        product_data = {}
        for item in bill_data.items:
            product = await self.product_repo.get_product(item.product_id)
            if not product:
                raise ValueError(f"Product {item.product_id} not found")
            
            # Use current product price if not specified
            unit_price = item.unit_price if item.unit_price > 0 else float(product["selling_price"])
            product_data[item.product_id] = {
                "product": product,
                "unit_price": unit_price,
                "quantity": item.quantity
            }
        
        # Step 2: Validate stock availability for all items
        for product_id, data in product_data.items():
            current_stock = await self.inventory_service.get_current_stock(product_id)
            if current_stock < data["quantity"]:
                raise ValueError(
                    f"Insufficient stock for product {data['product']['name']}. "
                    f"Available: {current_stock}, Requested: {data['quantity']}"
                )
        
        # Step 3: Calculate total amount
        total_amount = sum(
            data["quantity"] * data["unit_price"]
            for data in product_data.values()
        )
        
        # Step 4: Create bill
        bill = await self.bill_repo.create_bill(
            user_id=user_id,
            total_amount=total_amount,
            payment_method=bill_data.payment_method
        )
        bill_id = UUID(bill["id"])
        
        # Step 5: Create bill items and deduct stock (atomic operations)
        bill_items = []
        for item in bill_data.items:
            data = product_data[item.product_id]
            unit_price = data["unit_price"]
            quantity = data["quantity"]
            total_price = quantity * unit_price
            
            # Create bill item
            bill_item = await self.bill_repo.create_bill_item(
                bill_id=bill_id,
                product_id=item.product_id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price
            )
            bill_items.append(bill_item)
            
            # Deduct stock (create outgoing ledger entry)
            await self.inventory_service.deduct_stock(
                product_id=item.product_id,
                quantity=quantity,
                reference_id=bill_id
            )
        
        # Step 6: Build response
        items_response = []
        for item in bill_items:
            product = product_data[UUID(item["product_id"])]["product"]
            # Handle both field names for compatibility (repository maps DB fields)
            items_response.append(
                BillItemResponse(
                    id=UUID(item["id"]),
                    bill_id=UUID(item["bill_id"]),
                    product_id=UUID(item["product_id"]),
                    product_name=product["name"],
                    quantity=item["quantity"],
                    unit_price=float(item.get("selling_price") or item.get("unit_price", 0)),
                    total_price=float(item.get("line_total") or item.get("total_price", 0)),
                    created_at=item["created_at"]
                )
            )
        
        return BillResponse(
            id=UUID(bill["id"]),
            user_id=None,  # Schema doesn't have user_id, set to None
            bill_number=bill["bill_number"],
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
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                total_price=item["total_price"],
                created_at=item["created_at"]
            )
            for item in bill.get("items", [])
        ]
        
        return BillResponse(
            id=UUID(bill["id"]),
            user_id=None,  # Schema doesn't have user_id, set to None
            bill_number=bill["bill_number"],
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
                total_amount=float(bill["total_amount"]),
                payment_method=bill["payment_method"],
                created_at=bill["created_at"],
                items=[]  # Items not included in list view
            )
            for bill in bills
        ]

