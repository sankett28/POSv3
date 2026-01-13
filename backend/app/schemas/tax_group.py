"""Tax group schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID


class TaxGroupCreate(BaseModel):
    """Schema for creating a new tax group."""
    name: str = Field(..., min_length=1, max_length=255, description="Tax group name")
    total_rate: float = Field(..., ge=0, le=100, description="Total tax rate percentage (0-100)")
    split_type: Literal['GST_50_50', 'NO_SPLIT'] = Field(
        'GST_50_50',
        description="How to split tax: GST_50_50 (CGST/SGST split) or NO_SPLIT"
    )
    is_tax_inclusive: bool = Field(
        False,
        description="true = price includes tax, false = price excludes tax"
    )
    is_active: bool = Field(True, description="Whether the tax group is active")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure name is not just whitespace."""
        if not v.strip():
            raise ValueError("Tax group name cannot be empty")
        return v.strip()


class TaxGroupUpdate(BaseModel):
    """Schema for updating a tax group."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    total_rate: Optional[float] = Field(None, ge=0, le=100)
    split_type: Optional[Literal['GST_50_50', 'NO_SPLIT']] = None
    is_tax_inclusive: Optional[bool] = None
    is_active: Optional[bool] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Ensure name is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError("Tax group name cannot be empty")
        return v.strip() if v else None


class TaxGroupResponse(BaseModel):
    """Schema for tax group response."""
    id: UUID
    name: str
    total_rate: float
    split_type: str
    is_tax_inclusive: bool
    is_active: bool
    code: Optional[str] = None  # System-level code (e.g., SERVICE_CHARGE_GST)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

