"""Product schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class ProductCreate(BaseModel):
    """Schema for creating a new product."""
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    sku: str = Field(..., min_length=1, max_length=100, description="Product SKU (unique identifier)")
    barcode: Optional[str] = Field(None, max_length=100, description="Product barcode (optional, unique)")
    selling_price: float = Field(..., gt=0, description="Product selling price (must be greater than 0)")
    unit: Literal["pcs", "kg", "litre"] = Field(..., description="Product unit of measurement")
    is_active: bool = Field(True, description="Whether the product is active")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure name is not just whitespace."""
        if not v.strip():
            raise ValueError("Product name cannot be empty")
        return v.strip()
    
    @field_validator('sku')
    @classmethod
    def validate_sku(cls, v: str) -> str:
        """Ensure SKU is not just whitespace."""
        if not v.strip():
            raise ValueError("Product SKU cannot be empty")
        return v.strip()


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    barcode: Optional[str] = Field(None, max_length=100)
    selling_price: Optional[float] = Field(None, gt=0)
    unit: Optional[Literal["pcs", "kg", "litre"]] = None
    is_active: Optional[bool] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Ensure name is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError("Product name cannot be empty")
        return v.strip() if v else None
    
    @field_validator('sku')
    @classmethod
    def validate_sku(cls, v: Optional[str]) -> Optional[str]:
        """Ensure SKU is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError("Product SKU cannot be empty")
        return v.strip() if v else None


class ProductResponse(BaseModel):
    """Schema for product response."""
    id: UUID
    name: str
    sku: str
    barcode: Optional[str]
    selling_price: float
    unit: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

