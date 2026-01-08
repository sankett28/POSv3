"""Inventory schemas for stock management."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class InventoryLedgerEntry(BaseModel):
    """Schema for inventory ledger entry response."""
    id: UUID
    product_id: UUID
    quantity: int  # Signed: positive for stock add, negative for sale
    reference_type: str  # "STOCK_ADD" or "SALE"
    reference_id: Optional[UUID]  # bill_id for sales, None for stock additions
    created_at: datetime
    
    class Config:
        from_attributes = True


class StockResponse(BaseModel):
    """Schema for current stock response."""
    product_id: UUID
    product_name: str
    current_stock: int
    last_movement_at: Optional[datetime]


class StockHistoryResponse(BaseModel):
    """Schema for stock history response."""
    product_id: UUID
    movements: List[InventoryLedgerEntry]
    current_stock: int

