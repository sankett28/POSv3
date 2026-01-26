"""
Pydantic schemas for onboarding system.

All onboarding data transfer objects with validation.
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, Literal
from app.utils.color_validation import is_valid_hex, normalize_hex


class OnboardingRequest(BaseModel):
    """Schema for complete onboarding submission."""
    
    # Step 2: Business Info
    business_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Business name",
        examples=["Cafe Delight"]
    )
    business_type: Literal['cafe', 'restaurant', 'cloud-kitchen'] = Field(
        ...,
        description="Type of business"
    )
    revenue: Literal['less-10l', '10l-50l', '50l-2cr', '2cr-plus', 'not-sure'] = Field(
        ...,
        description="Revenue range"
    )
    has_gst: Literal['yes', 'no'] = Field(
        ...,
        description="Whether business has GST registration"
    )
    gst_number: Optional[str] = Field(
        None,
        description="GST number (required if has_gst is 'yes')",
        examples=["22AAAAA0000A1Z5"]
    )
    
    # Step 3: Cafe Configuration
    service_charge: Optional[Literal['yes', 'no']] = Field(
        None,
        description="Whether service charge is enabled (cafe)"
    )
    billing_type: Optional[Literal['counter', 'table']] = Field(
        None,
        description="Billing type (cafe)"
    )
    price_type: Optional[Literal['inclusive', 'exclusive']] = Field(
        None,
        description="Price type - tax inclusive or exclusive (cafe)"
    )
    
    # Step 3: Restaurant Configuration
    table_service: Optional[Literal['yes', 'no']] = Field(
        None,
        description="Whether table service is enabled (restaurant)"
    )
    kitchen_tickets: Optional[Literal['yes', 'no']] = Field(
        None,
        description="Whether kitchen tickets are enabled (restaurant)"
    )
    restaurant_service_charge: Optional[Literal['yes', 'no']] = Field(
        None,
        description="Whether service charge is enabled (restaurant)"
    )
    number_of_tables: Optional[int] = Field(
        None,
        ge=1,
        le=1000,
        description="Number of tables (restaurant)"
    )
    
    # Step 4: Branding
    website_url: Optional[str] = Field(
        None,
        description="Business website URL",
        examples=["https://example.com"]
    )
    brand_prompt: Optional[str] = Field(
        None,
        description="Brand description prompt for AI theme generation"
    )
    branding_choice: Optional[Literal['url', 'prompt', 'manual']] = Field(
        None,
        description="How branding/theme was chosen (optional - defaults to 'manual' if skipped)"
    )
    
    # Step 5: Theme (all optional - defaults applied if skipped)
    theme_mode: Optional[Literal['light', 'dark']] = Field(
        None,
        description="Theme mode (defaults to 'light' if not provided)"
    )
    primary_color: Optional[str] = Field(
        None,
        description="Primary brand color (hex) (defaults to #912b48 if not provided)",
        examples=["#912b48"]
    )
    secondary_color: Optional[str] = Field(
        None,
        description="Secondary color (hex)",
        examples=["#ffffff"]
    )
    background_color: Optional[str] = Field(
        None,
        description="Background color (hex)",
        examples=["#fff0f3"]
    )
    foreground_color: Optional[str] = Field(
        None,
        description="Foreground/text color (hex)",
        examples=["#610027"]
    )
    accent_color: Optional[str] = Field(
        None,
        description="Accent color (hex)",
        examples=["#b45a69"]
    )
    danger_color: Optional[str] = Field(
        None,
        description="Danger/error color (hex)",
        examples=["#ef4444"]
    )
    success_color: Optional[str] = Field(
        None,
        description="Success color (hex)",
        examples=["#22c55e"]
    )
    warning_color: Optional[str] = Field(
        None,
        description="Warning color (hex)",
        examples=["#f59e0b"]
    )
    
    @field_validator('gst_number')
    @classmethod
    def validate_gst_number_format(cls, v: Optional[str], info) -> Optional[str]:
        """
        Validate GST number format.
        
        Format: 2 digits (state) + 10 alphanumeric (PAN) + 1 digit (entity) + 1 letter (Z) + 1 alphanumeric (checksum)
        Example: 22AAAAA0000A1Z5
        
        Validates: Requirements 2.1, 2.2
        """
        if v is None:
            return None
        
        # Remove any whitespace
        v = v.strip()
        
        if not v:
            return None
        
        # GST format: 2 digits + 10 alphanumeric + 1 digit + 1 letter + 1 alphanumeric (15 chars total)
        import re
        gst_pattern = r'^\d{2}[A-Z0-9]{10}\d[A-Z][A-Z0-9]$'
        
        if not re.match(gst_pattern, v):
            raise ValueError(
                'GST number must match format: 2 digits + 10 alphanumeric characters + '
                '1 digit + 1 letter + 1 alphanumeric (e.g., 22AAAAA0000A1Z5)'
            )
        
        return v
    
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
        """
        Validate and normalize hex color codes.
        
        Validates: Requirements 2.1 (color validation)
        """
        if v is None:
            return None
        
        if not is_valid_hex(v):
            raise ValueError(
                f"Invalid hex color format: {v}. Must be 6-digit hex (e.g., #FF5733)"
            )
        
        return normalize_hex(v)
    
    @model_validator(mode='after')
    def validate_gst_requirement(self):
        """
        Validate GST number is provided when has_gst is 'yes'.
        
        Validates: Requirements 2.3, 2.4
        """
        if self.has_gst == 'yes' and not self.gst_number:
            raise ValueError('GST number is required when has_gst is "yes"')
        
        return self
    
    @model_validator(mode='after')
    def validate_business_type_fields(self):
        """
        Validate that required fields for the selected business type are provided.
        
        Validates: Requirements 12.5
        """
        if self.business_type == 'cafe':
            # Cafe requires: service_charge, billing_type, price_type
            if self.service_charge is None:
                raise ValueError('service_charge is required for cafe business type')
            if self.billing_type is None:
                raise ValueError('billing_type is required for cafe business type')
            if self.price_type is None:
                raise ValueError('price_type is required for cafe business type')
        
        elif self.business_type == 'restaurant':
            # Restaurant requires: table_service, kitchen_tickets, restaurant_service_charge, number_of_tables
            if self.table_service is None:
                raise ValueError('table_service is required for restaurant business type')
            if self.kitchen_tickets is None:
                raise ValueError('kitchen_tickets is required for restaurant business type')
            if self.restaurant_service_charge is None:
                raise ValueError('restaurant_service_charge is required for restaurant business type')
            if self.number_of_tables is None:
                raise ValueError('number_of_tables is required for restaurant business type')
        
        # cloud-kitchen validation can be added here when requirements are defined
        
        return self


class OnboardingResponse(BaseModel):
    """Schema for onboarding API response."""
    
    success: bool = Field(
        ...,
        description="Whether the onboarding was successful"
    )
    business_id: str = Field(
        ...,
        description="ID of the created business"
    )
    message: str = Field(
        ...,
        description="Success or error message",
        examples=["Onboarding completed successfully"]
    )
