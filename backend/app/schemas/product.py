"""Product schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class ProductCreate(BaseModel):
    """Schema for creating a new product."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    barcode: Optional[str] = Field(None, max_length=100, description="Product barcode (optional)")
    price: float = Field(..., gt=0, description="Product price (must be greater than 0)")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure name is not just whitespace."""
        if not v.strip():
            raise ValueError("Product name cannot be empty")
        return v.strip()


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    barcode: Optional[str] = Field(None, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Ensure name is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError("Product name cannot be empty")
        return v.strip() if v else None


class ProductResponse(BaseModel):
    """Schema for product response."""
    id: UUID
    user_id: UUID
    name: str
    barcode: Optional[str]
    price: float
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

