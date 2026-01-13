"""Category schemas for request/response validation."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class CategoryCreate(BaseModel):
    """Schema for creating a new category."""
    name: str = Field(..., min_length=1, max_length=255, description="Category name")
    is_active: bool = Field(True, description="Whether the category is active")
    display_order: int = Field(0, description="Display order for sorting")
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Ensure name is not just whitespace."""
        if not v.strip():
            raise ValueError("Category name cannot be empty")
        return v.strip()


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    is_active: Optional[bool] = None
    display_order: Optional[int] = None
    
    @field_validator('name')
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Ensure name is not just whitespace if provided."""
        if v is not None and not v.strip():
            raise ValueError("Category name cannot be empty")
        return v.strip() if v else None


class CategoryResponse(BaseModel):
    """Schema for category response."""
    id: UUID
    name: str
    is_active: bool
    display_order: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

