"""Product schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class ProductCreate(BaseModel):
    """Schema for creating a new product."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    selling_price: float = Field(..., gt=0, description="Product selling price (must be greater than 0)")
    tax_rate: float = Field(0.0, ge=0, le=100, description="Tax rate percentage (0-100)")
    category_id: Optional[UUID] = Field(None, description="Optional category assignment")
    unit: Optional[Literal["pcs", "kg", "litre", "cup", "plate", "bowl", "serving", "piece", "bottle", "can"]] = Field(None, description="Optional unit of measurement")
    is_active: bool = Field(True, description="Whether the product is active")
    
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
    selling_price: Optional[float] = Field(None, gt=0)
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    category_id: Optional[UUID] = None
    unit: Optional[Literal["pcs", "kg", "litre", "cup", "plate", "bowl", "serving", "piece", "bottle", "can"]] = None
    is_active: Optional[bool] = None
    
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
    name: str
    selling_price: float
    tax_rate: float
    category_id: Optional[UUID]
    unit: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

