"""Bill schemas for billing operations."""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class PaymentMethod(str, Enum):
    """Payment method options."""
    CASH = "CASH"
    UPI = "UPI"
    CARD = "CARD"


class BillItemCreate(BaseModel):
    """Schema for creating a bill item."""
    product_id: UUID = Field(..., description="Product ID")
    quantity: int = Field(..., gt=0, description="Quantity")
    unit_price: float = Field(..., ge=0, description="Unit price")
    
    @property
    def total_price(self) -> float:
        """Calculate total price for this item."""
        return self.quantity * self.unit_price


class BillCreate(BaseModel):
    """Schema for creating a bill."""
    items: List[BillItemCreate] = Field(..., min_length=1, description="Bill items")
    payment_method: PaymentMethod = Field(PaymentMethod.CASH, description="Payment method")
    
    @field_validator('items')
    @classmethod
    def validate_items(cls, v: List[BillItemCreate]) -> List[BillItemCreate]:
        """Ensure at least one item."""
        if not v:
            raise ValueError("Bill must have at least one item")
        return v


class BillItemResponse(BaseModel):
    """Schema for bill item response."""
    id: UUID
    bill_id: UUID
    product_id: UUID
    product_name: Optional[str] = None
    quantity: int
    unit_price: float
    total_price: float
    created_at: datetime
    
    class Config:
        from_attributes = True


class BillResponse(BaseModel):
    """Schema for bill response."""
    id: UUID
    user_id: Optional[UUID] = None  # Made optional since schema doesn't have user_id
    bill_number: str
    total_amount: float
    payment_method: str
    created_at: datetime
    items: List[BillItemResponse] = []
    
    class Config:
        from_attributes = True

