"""Inventory service with business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.inventory_ledger_repo import InventoryLedgerRepository
from app.repositories.product_repo import ProductRepository
from app.schemas.inventory import StockMovement, MovementType, StockResponse, InventoryLedgerEntry
from app.core.logging import logger


class InventoryService:
    """Service for inventory business logic."""
    
    def __init__(self, db: Client):
        self.ledger_repo = InventoryLedgerRepository(db)
        self.product_repo = ProductRepository(db)
    
    async def add_stock(
        self,
        product_id: UUID,
        user_id: UUID,
        quantity: int,
        notes: Optional[str] = None
    ) -> InventoryLedgerEntry:
        """Add stock (incoming movement)."""
        # Validate product exists
        product = await self.product_repo.get_product(product_id, user_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")
        
        # Create incoming ledger entry
        result = await self.ledger_repo.create_ledger_entry(
            product_id=product_id,
            user_id=user_id,
            quantity_change=quantity,
            movement_type=MovementType.INCOMING,
            notes=notes
        )
        
        return InventoryLedgerEntry(**result)
    
    async def deduct_stock(
        self,
        product_id: UUID,
        user_id: UUID,
        quantity: int,
        reference_id: Optional[UUID] = None,
        notes: Optional[str] = None
    ) -> InventoryLedgerEntry:
        """Deduct stock (outgoing movement) with validation."""
        # Validate product exists
        product = await self.product_repo.get_product(product_id, user_id)
        if not product:
            raise ValueError(f"Product {product_id} not found")
        
        # Check current stock
        current_stock = await self.ledger_repo.get_product_stock(product_id, user_id)
        if current_stock < quantity:
            raise ValueError(f"Insufficient stock. Available: {current_stock}, Requested: {quantity}")
        
        # Create outgoing ledger entry (negative quantity)
        result = await self.ledger_repo.create_ledger_entry(
            product_id=product_id,
            user_id=user_id,
            quantity_change=-quantity,
            movement_type=MovementType.OUTGOING,
            reference_id=reference_id,
            notes=notes
        )
        
        return InventoryLedgerEntry(**result)
    
    async def get_current_stock(self, product_id: UUID, user_id: UUID) -> int:
        """Get current stock for a product."""
        return await self.ledger_repo.get_product_stock(product_id, user_id)
    
    async def get_all_stocks(self, user_id: UUID) -> List[StockResponse]:
        """Get current stock for all products."""
        results = await self.ledger_repo.get_all_stocks(user_id)
        return [
            StockResponse(
                product_id=UUID(r["product_id"]),
                product_name=r["product_name"],
                current_stock=r["current_stock"],
                last_movement_at=r.get("last_movement_at")
            )
            for r in results
        ]
    
    async def get_stock_history(self, product_id: UUID, user_id: UUID, limit: int = 100) -> List[InventoryLedgerEntry]:
        """Get stock movement history for a product."""
        results = await self.ledger_repo.get_ledger_history(product_id, user_id, limit)
        return [InventoryLedgerEntry(**r) for r in results]

