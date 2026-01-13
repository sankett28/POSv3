"""Billing service with snapshot-based bill creation."""
from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from supabase import Client
from app.repositories.bill_repo import BillRepository
from app.repositories.product_repo import ProductRepository
from app.repositories.tax_group_repo import TaxGroupRepository
from app.utils.tax_engine import TaxEngine, TaxGroupConfig
from app.schemas.bill import BillCreate, BillResponse, BillItemResponse, PaymentMethod
from app.core.logging import logger


class BillingService:
    """Service for billing business logic."""
    
    def __init__(self, db: Client):
        self.bill_repo = BillRepository(db)
        self.product_repo = ProductRepository(db)
        self.tax_group_repo = TaxGroupRepository(db)
        self.tax_engine = TaxEngine()
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
        Create a bill with snapshot-based product data using TaxEngine.
        
        This operation:
        1. Validates all products exist and are active
        2. Fetches tax groups for each product
        3. Calculates tax using TaxEngine (the ONLY place for tax math)
        4. Snapshots ALL tax values (taxable_value, cgst_amount, sgst_amount, etc.)
        5. Creates bill with totals
        6. Creates bill items with all snapshot fields
        
        All product and tax data is snapshotted to ensure historical accuracy.
        TaxEngine is the ONLY place where tax calculations occur.
        """
        # Step 1: Validate all products exist and are active, fetch tax groups
        product_data = {}
        line_item_results = []
        
        for item in bill_data.items:
            product = await self.product_repo.get_product(item.product_id)
            if not product:
                raise ValueError(f"Product {item.product_id} not found")
            
            # Check if product is active
            if not product.get("is_active", True):
                raise ValueError(f"Product {product['name']} is not active")
            
            # Get tax group
            tax_group_id = product.get("tax_group_id")
            if not tax_group_id:
                raise ValueError(f"Product {product['name']} does not have a tax group assigned")
            
            tax_group_data = await self.tax_group_repo.get_tax_group(UUID(tax_group_id))
            if not tax_group_data:
                raise ValueError(f"Tax group {tax_group_id} not found for product {product['name']}")
            
            if not tax_group_data.get("is_active", True):
                raise ValueError(f"Tax group '{tax_group_data['name']}' is not active")
            
            # Get category name if category_id exists
            category_name = None
            if product.get("category_id"):
                category_name = await self._get_category_name(UUID(product["category_id"]))
            
            # Use current product price if not specified
            unit_price = item.unit_price if item.unit_price > 0 else float(product["selling_price"])
            quantity = item.quantity
            
            # Step 2: Prepare TaxEngine input
            tax_group_config = TaxGroupConfig(
                name=tax_group_data["name"],
                total_rate=Decimal(str(tax_group_data["total_rate"])),
                split_type=tax_group_data["split_type"],
                is_tax_inclusive=tax_group_data["is_tax_inclusive"]
            )
            
            # Step 3: Calculate tax using TaxEngine (ONLY place for tax math)
            tax_result = self.tax_engine.calculate_line_item(
                unit_price=Decimal(str(unit_price)),
                quantity=quantity,
                tax_group=tax_group_config
            )
            
            line_item_results.append(tax_result)
            
            product_data[item.product_id] = {
                "product": product,
                "tax_group": tax_group_data,
                "tax_group_config": tax_group_config,
                "unit_price": unit_price,
                "quantity": quantity,
                "product_name": product["name"],
                "category_name": category_name,
                "tax_result": tax_result
            }
        
        # Step 4: Generate bill summary using TaxEngine
        bill_summary = self.tax_engine.generate_bill_summary(line_item_results)
        
        # Step 5: Create bill with totals
        bill = await self.bill_repo.create_bill(
            user_id=user_id,
            subtotal=float(bill_summary.subtotal),
            tax_amount=float(bill_summary.total_tax),
            total_amount=float(bill_summary.total_amount),
            payment_method=bill_data.payment_method
        )
        bill_id = UUID(bill["id"])
        
        # Step 6: Create bill items with ALL snapshot fields
        bill_items = []
        for item in bill_data.items:
            data = product_data[item.product_id]
            tax_result = data["tax_result"]
            tax_group_config = data["tax_group_config"]
            
            # Create bill item with ALL tax snapshot fields
            bill_item = await self.bill_repo.create_bill_item(
                bill_id=bill_id,
                product_id=item.product_id,
                quantity=data["quantity"],
                unit_price=data["unit_price"],
                product_name_snapshot=data["product_name"],
                category_name_snapshot=data["category_name"],
                tax_rate=float(tax_group_config.total_rate),  # Keep for backward compatibility
                tax_amount=float(tax_result.tax_amount),
                line_subtotal=float(tax_result.taxable_value),
                line_total=float(tax_result.line_total),
                # New tax snapshot fields
                tax_group_name_snapshot=tax_group_config.name,
                tax_rate_snapshot=float(tax_group_config.total_rate),
                is_tax_inclusive_snapshot=tax_group_config.is_tax_inclusive,
                taxable_value=float(tax_result.taxable_value),
                cgst_amount=float(tax_result.cgst_amount),
                sgst_amount=float(tax_result.sgst_amount)
            )
            bill_items.append(bill_item)
        
        # Step 7: Build response
        items_response = []
        for item in bill_items:
            data = product_data[UUID(item["product_id"])]
            items_response.append(
                BillItemResponse(
                    id=UUID(item["id"]),
                    bill_id=UUID(item["bill_id"]),
                    product_id=UUID(item["product_id"]),
                    product_name=item.get("product_name_snapshot") or data["product_name"],
                    category_name=item.get("category_name_snapshot"),
                    quantity=item["quantity"],
                    unit_price=float(item.get("selling_price") or item.get("unit_price", 0)),
                    tax_rate=float(item.get("tax_rate_snapshot") or item.get("tax_rate", 0)),
                    tax_amount=float(item.get("tax_amount", 0)),
                    line_subtotal=float(item.get("taxable_value") or item.get("line_subtotal", 0)),
                    total_price=float(item.get("line_total") or item.get("total_price", 0)),
                    cgst_amount=float(item.get("cgst_amount", 0)),
                    sgst_amount=float(item.get("sgst_amount", 0)),
                    tax_group_name=item.get("tax_group_name_snapshot"),
                    is_tax_inclusive=bool(item.get("is_tax_inclusive_snapshot", False)),
                    created_at=item["created_at"]
                )
            )
        
        return BillResponse(
            id=UUID(bill["id"]),
            user_id=None,  # Schema doesn't have user_id, set to None
            bill_number=bill["bill_number"],
            subtotal=float(bill["subtotal"]),
            tax_amount=float(bill["tax_amount"]),
            cgst=float(bill_summary.total_cgst),
            sgst=float(bill_summary.total_sgst),
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
                cgst_amount=item.get("cgst_amount", 0),
                sgst_amount=item.get("sgst_amount", 0),
                tax_group_name=item.get("tax_group_name"),
                is_tax_inclusive=item.get("is_tax_inclusive", False),
                created_at=item["created_at"]
            )
            for item in bill.get("items", [])
        ]
        
        # Derive balanced CGST/SGST from total_tax (matching TaxEngine logic)
        tax_amount_decimal = Decimal(str(bill["tax_amount"]))
        half = tax_amount_decimal / Decimal('2')
        cgst = float(TaxEngine._round_currency(half))
        sgst = float(tax_amount_decimal - Decimal(str(cgst)))
        
        return BillResponse(
            id=UUID(bill["id"]),
            user_id=None,  # Schema doesn't have user_id, set to None
            bill_number=bill["bill_number"],
            subtotal=float(bill["subtotal"]),
            tax_amount=float(bill["tax_amount"]),
            cgst=cgst,
            sgst=sgst,
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

