"""
Pydantic schemas for business configuration.

Data transfer objects for business onboarding configuration with validation.
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Literal
from datetime import datetime


class BusinessConfigurationBase(BaseModel):
    """Base business configuration schema with core fields."""
    
    business_type: Literal['cafe', 'restaurant', 'cloud-kitchen'] = Field(
        ...,
        description="Type of business"
    )
    revenue_range: Literal['less-10l', '10l-50l', '50l-2cr', '2cr-plus', 'not-sure'] = Field(
        ...,
        description="Estimated annual revenue range"
    )
    has_gst: bool = Field(
        ...,
        description="Whether the business is GST registered"
    )
    gst_number: Optional[str] = Field(
        None,
        max_length=15,
        description="GST registration number (required when has_gst is true)"
    )
    
    # Cafe configuration
    service_charge_enabled: Optional[bool] = Field(
        None,
        description="Cafe only: Whether service charge is enabled"
    )
    billing_type: Optional[Literal['counter', 'table']] = Field(
        None,
        description="Cafe only: Billing type"
    )
    price_type: Optional[Literal['inclusive', 'exclusive']] = Field(
        None,
        description="Cafe only: Price type (inclusive or exclusive of tax)"
    )
    
    # Restaurant configuration
    table_service_enabled: Optional[bool] = Field(
        None,
        description="Restaurant only: Whether table service is enabled"
    )
    kitchen_tickets_enabled: Optional[bool] = Field(
        None,
        description="Restaurant only: Whether kitchen tickets are enabled"
    )
    number_of_tables: Optional[int] = Field(
        None,
        ge=1,
        le=1000,
        description="Restaurant only: Number of tables (1-1000)"
    )
    
    # Branding
    website_url: Optional[str] = Field(
        None,
        description="Business website URL"
    )
    brand_prompt: Optional[str] = Field(
        None,
        description="Brand description prompt for AI-based theme generation"
    )
    branding_choice: Literal['url', 'prompt', 'manual'] = Field(
        ...,
        description="How the business theme was chosen"
    )
    
    # Financial configuration
    tax_rate: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description="Default tax rate percentage for the business (0-100)"
    )
    currency: Optional[str] = Field(
        None,
        min_length=3,
        max_length=3,
        description="ISO 4217 currency code (3 characters, e.g., USD, INR, EUR)"
    )
    
    @field_validator('gst_number')
    @classmethod
    def validate_gst_number(cls, v: Optional[str], info) -> Optional[str]:
        """
        Validate GST number format and requirement.
        
        Format: 2 digits + 10 alphanumeric + 1 letter + 1 digit + 1 letter + 1 digit
        Example: 22AAAAA0000A1Z5
        """
        # Get has_gst from the data being validated
        has_gst = info.data.get('has_gst')
        
        # If has_gst is true, gst_number is required
        if has_gst and not v:
            raise ValueError('GST number is required when has_gst is true')
        
        # If has_gst is false, gst_number should be None or empty
        if not has_gst and v:
            # Allow it but could warn - for now just accept it
            pass
        
        # Validate format if provided
        if v:
            import re
            # Format: 2 digits + 10 alphanumeric (PAN) + 1 digit (entity) + 1 letter (Z) + 1 alphanumeric (checksum)
            # Total: 15 characters
            # Example: 22AAAAA0000A1Z5 or 27AABCU9603R1ZM
            pattern = r'^[0-9]{2}[A-Z0-9]{10}[0-9][A-Z][A-Z0-9]$'
            if not re.match(pattern, v.upper()):
                raise ValueError(
                    'GST number must match format: 2 digits + 10 alphanumeric + '
                    '1 digit + 1 letter + 1 alphanumeric (e.g., 22AAAAA0000A1Z5)'
                )
            # Normalize to uppercase
            v = v.upper()
        
        return v


class BusinessConfigurationCreate(BusinessConfigurationBase):
    """Schema for creating a new business configuration."""
    pass


class BusinessConfigurationUpdate(BaseModel):
    """Schema for updating an existing business configuration (all fields optional)."""
    
    business_type: Optional[Literal['cafe', 'restaurant', 'cloud-kitchen']] = None
    revenue_range: Optional[Literal['less-10l', '10l-50l', '50l-2cr', '2cr-plus', 'not-sure']] = None
    has_gst: Optional[bool] = None
    gst_number: Optional[str] = Field(None, max_length=15)
    
    # Cafe configuration
    service_charge_enabled: Optional[bool] = None
    billing_type: Optional[Literal['counter', 'table']] = None
    price_type: Optional[Literal['inclusive', 'exclusive']] = None
    
    # Restaurant configuration
    table_service_enabled: Optional[bool] = None
    kitchen_tickets_enabled: Optional[bool] = None
    number_of_tables: Optional[int] = Field(None, ge=1, le=1000)
    
    # Branding
    website_url: Optional[str] = None
    brand_prompt: Optional[str] = None
    branding_choice: Optional[Literal['url', 'prompt', 'manual']] = None
    
    # Financial configuration
    tax_rate: Optional[float] = Field(None, ge=0, le=100)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)


class BusinessConfigurationResponse(BusinessConfigurationBase):
    """Schema for business configuration API responses."""
    
    id: str
    business_id: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}


class BusinessConfigurationPublic(BaseModel):
    """
    Public business configuration schema for frontend consumption.
    
    Returns configuration data without internal metadata.
    """
    
    business_type: str
    revenue_range: str
    has_gst: bool
    gst_number: Optional[str] = None
    
    # Cafe configuration
    service_charge_enabled: Optional[bool] = None
    billing_type: Optional[str] = None
    price_type: Optional[str] = None
    
    # Restaurant configuration
    table_service_enabled: Optional[bool] = None
    kitchen_tickets_enabled: Optional[bool] = None
    number_of_tables: Optional[int] = None
    
    # Branding
    website_url: Optional[str] = None
    brand_prompt: Optional[str] = None
    branding_choice: str
    
    # Financial configuration
    tax_rate: Optional[float] = None
    currency: Optional[str] = None
    
    @classmethod
    def from_response(cls, config: Optional[BusinessConfigurationResponse]) -> Optional["BusinessConfigurationPublic"]:
        """Convert BusinessConfigurationResponse to public format."""
        if not config:
            return None
        
        return cls(
            business_type=config.business_type,
            revenue_range=config.revenue_range,
            has_gst=config.has_gst,
            gst_number=config.gst_number,
            service_charge_enabled=config.service_charge_enabled,
            billing_type=config.billing_type,
            price_type=config.price_type,
            table_service_enabled=config.table_service_enabled,
            kitchen_tickets_enabled=config.kitchen_tickets_enabled,
            number_of_tables=config.number_of_tables,
            website_url=config.website_url,
            brand_prompt=config.brand_prompt,
            branding_choice=config.branding_choice,
            tax_rate=config.tax_rate,
            currency=config.currency
        )
