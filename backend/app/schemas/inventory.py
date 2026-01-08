"""Inventory schemas for stock management."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class MovementType(str, Enum):
    """Inventory movement types."""
    INCOMING = "INCOMING"
    OUTGOING = "OUTGOING"


class StockMovement(BaseModel):
    """Schema for creating a stock movement."""
    product_id: UUID = Field(..., description="Product ID")
    quantity: int = Field(..., gt=0, description="Quantity (positive for incoming, will be negated for outgoing)")
    movement_type: MovementType = Field(..., description="Type of movement")
    notes: Optional[str] = Field(None, description="Optional notes")


class InventoryLedgerEntry(BaseModel):
    """Schema for inventory ledger entry response."""
    id: UUID
    product_id: UUID
    user_id: UUID
    quantity_change: int
    movement_type: str
    reference_id: Optional[UUID]
    notes: Optional[str]
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

