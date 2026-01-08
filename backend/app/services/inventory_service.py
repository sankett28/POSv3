"""Inventory service with business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.inventory_ledger_repo import InventoryLedgerRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.inventory import StockResponse, InventoryLedgerEntry
from app.core.logging import logger


class InventoryService:
    """Service for inventory business logic."""
    
    def __init__(self, db: Client):
        self.ledger_repo = InventoryLedgerRepository(db)
        self.product_repo = ProductRepository(db)
    
    async def add_stock(
        self,
        product_id: UUID,
        quantity: int
    ) -> InventoryLedgerEntry:
        """Add stock (incoming movement)."""
        # Validate quantity
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        # Validate product exists
        product = await self.product_repo.get_product(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")
        
        # Create incoming ledger entry with positive quantity
        result = await self.ledger_repo.create_ledger_entry(
            product_id=product_id,
            quantity=quantity,
            reference_type="STOCK_ADD"
        )
        
        return InventoryLedgerEntry(**result)
    
    async def deduct_stock(
        self,
        product_id: UUID,
        quantity: int,
        reference_id: Optional[UUID] = None
    ) -> InventoryLedgerEntry:
        """Deduct stock (outgoing movement) with validation."""
        # Validate quantity
        if quantity <= 0:
            raise ValueError("Quantity must be positive")
        
        # Validate product exists
        product = await self.product_repo.get_product(product_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")
        
        # Check current stock
        current_stock = await self.ledger_repo.get_product_stock(product_id)
        if current_stock < quantity:
            raise ValueError(f"Insufficient stock. Available: {current_stock}, Requested: {quantity}")
        
        # Create outgoing ledger entry (negative quantity)
        result = await self.ledger_repo.create_ledger_entry(
            product_id=product_id,
            quantity=-quantity,
            reference_type="SALE",
            reference_id=reference_id
        )
        
        return InventoryLedgerEntry(**result)
    
    async def get_current_stock(self, product_id: UUID) -> int:
        """Get current stock for a product."""
        return await self.ledger_repo.get_product_stock(product_id)
    
    async def get_all_stocks(self) -> List[StockResponse]:
        """Get current stock for all products."""
        results = await self.ledger_repo.get_all_stocks()
        return [
            StockResponse(
                product_id=UUID(r["product_id"]),
                product_name=r["product_name"],
                current_stock=r["current_stock"],
                last_movement_at=r.get("last_movement_at")
            )
            for r in results
        ]
    
    async def get_stock_history(self, product_id: UUID, limit: int = 100) -> List[InventoryLedgerEntry]:
        """Get stock movement history for a product."""
        results = await self.ledger_repo.get_ledger_history(product_id, limit)
        return [InventoryLedgerEntry(**r) for r in results]

