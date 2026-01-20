"""
Pydantic schemas for theming system.

All theme data transfer objects with validation.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from app.utils.color_validation import is_valid_hex, normalize_hex


class ThemeBase(BaseModel):
    """Base theme schema with core semantic colors."""
    
    primary_color: str = Field(
        ...,
        description="Primary brand color (hex)",
        examples=["#912b48"]
    )
    secondary_color: str = Field(
        ...,
        description="Secondary color (hex)",
        examples=["#ffffff"]
    )
    background_color: str = Field(
        ...,
        description="Main background color (hex)",
        examples=["#fff0f3"]
    )
    foreground_color: str = Field(
        ...,
        description="Primary text/foreground color (hex)",
        examples=["#610027"]
    )
    accent_color: Optional[str] = Field(
        None,
        description="Optional accent color (hex)",
        examples=["#b45a69"]
    )
    danger_color: Optional[str] = Field(
        None,
        description="Optional danger/error color (hex)",
        examples=["#ef4444"]
    )
    success_color: Optional[str] = Field(
        None,
        description="Optional success color (hex)",
        examples=["#22c55e"]
    )
    warning_color: Optional[str] = Field(
        None,
        description="Optional warning color (hex)",
        examples=["#f59e0b"]
    )
    
    @field_validator(
        'primary_color',
        'secondary_color',
        'background_color',
        'foreground_color',
        'accent_color',
        'danger_color',
        'success_color',
        'warning_color'
    )
    @classmethod
    def validate_hex_color(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize hex color codes."""
        if v is None:
            return None
        
        if not is_valid_hex(v):
            raise ValueError(f"Invalid hex color format: {v}. Must be 6-digit hex (e.g., #FF5733)")
        
        return normalize_hex(v)


class ThemeCreate(ThemeBase):
    """Schema for creating a new theme."""
    
    source: str = Field(
        default="manual",
        description="Theme source: manual, auto_generated, or brand_api"
    )
    source_url: Optional[str] = Field(
        None,
        description="Source URL if auto-generated from website"
    )
    
    @field_validator('source')
    @classmethod
    def validate_source(cls, v: str) -> str:
        """Validate theme source."""
        allowed_sources = ['manual', 'auto_generated', 'brand_api']
        if v not in allowed_sources:
            raise ValueError(f"Invalid source. Must be one of: {', '.join(allowed_sources)}")
        return v


class ThemeUpdate(BaseModel):
    """Schema for updating an existing theme (all fields optional)."""
    
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    background_color: Optional[str] = None
    foreground_color: Optional[str] = None
    accent_color: Optional[str] = None
    danger_color: Optional[str] = None
    success_color: Optional[str] = None
    warning_color: Optional[str] = None
    
    @field_validator(
        'primary_color',
        'secondary_color',
        'background_color',
        'foreground_color',
        'accent_color',
        'danger_color',
        'success_color',
        'warning_color'
    )
    @classmethod
    def validate_hex_color(cls, v: Optional[str]) -> Optional[str]:
        """Validate and normalize hex color codes."""
        if v is None:
            return None
        
        if not is_valid_hex(v):
            raise ValueError(f"Invalid hex color format: {v}")
        
        return normalize_hex(v)


class ThemeResponse(ThemeBase):
    """Schema for theme API responses."""
    
    id: str
    business_id: str
    source: str
    source_url: Optional[str] = None
    is_validated: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ThemePublic(BaseModel):
    """
    Public theme schema for frontend consumption.
    
    Returns only the color values without metadata.
    This is what the frontend uses to apply themes.
    """
    
    primary: Optional[str] = None
    secondary: Optional[str] = None
    background: Optional[str] = None
    foreground: Optional[str] = None
    accent: Optional[str] = None
    danger: Optional[str] = None
    success: Optional[str] = None
    warning: Optional[str] = None
    
    @classmethod
    def from_theme_response(cls, theme: Optional[ThemeResponse]) -> "ThemePublic":
        """Convert ThemeResponse to public format."""
        if not theme:
            return cls()  # Return empty object if no theme
        
        return cls(
            primary=theme.primary_color,
            secondary=theme.secondary_color,
            background=theme.background_color,
            foreground=theme.foreground_color,
            accent=theme.accent_color,
            danger=theme.danger_color,
            success=theme.success_color,
            warning=theme.warning_color
        )


class ThemeGenerateRequest(BaseModel):
    """Schema for auto-generating theme from website URL."""
    
    website_url: str = Field(
        ...,
        description="Website URL to extract brand colors from",
        examples=["https://example.com"]
    )
    
    @field_validator('website_url')
    @classmethod
    def validate_url(cls, v: str) -> str:
        """Basic URL validation."""
        if not v.startswith(('http://', 'https://')):
            raise ValueError("URL must start with http:// or https://")
        return v


class ThemeValidationResult(BaseModel):
    """Schema for theme validation results."""
    
    is_valid: bool
    errors: list[str] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
    contrast_ratios: dict[str, float] = Field(default_factory=dict)


class ThemeAuditLog(BaseModel):
    """Schema for theme audit log entries."""
    
    id: str
    business_id: str
    changed_by_user_id: Optional[str] = None
    changed_by_email: Optional[str] = None
    old_theme: Optional[dict] = None
    new_theme: dict
    change_type: str
    change_reason: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
