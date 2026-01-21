"""
Service layer for business configuration management.

Handles business logic for creating and managing business configuration records,
including business type-specific field handling.
"""
from typing import Optional
from supabase import Client
from app.repositories.business_configuration_repo import BusinessConfigurationRepository
from app.schemas.business_configuration import (
    BusinessConfigurationCreate,
    BusinessConfigurationResponse
)
from app.core.logging import logger


class ConfigurationService:
    """Service for business configuration creation and management."""
    
    def __init__(self, supabase: Client):
        """
        Initialize configuration service.
        
        Args:
            supabase: Supabase client instance (with service role)
        """
        self.supabase = supabase
        self.repo = BusinessConfigurationRepository(supabase)
    
    async def create_configuration(
        self,
        business_id: str,
        business_type: str,
        revenue_range: str,
        has_gst: bool,
        gst_number: Optional[str] = None,
        service_charge: Optional[str] = None,
        billing_type: Optional[str] = None,
        price_type: Optional[str] = None,
        table_service: Optional[str] = None,
        kitchen_tickets: Optional[str] = None,
        restaurant_service_charge: Optional[str] = None,
        number_of_tables: Optional[int] = None,
        website_url: Optional[str] = None,
        brand_prompt: Optional[str] = None,
        branding_choice: str = 'manual'
    ) -> BusinessConfigurationResponse:
        """
        Create a new business configuration record.
        
        Handles business type-specific fields by converting 'yes'/'no' strings
        to boolean values and storing only relevant fields for each business type.
        
        Args:
            business_id: Business UUID (foreign key to businesses table)
            business_type: Type of business ('cafe', 'restaurant', 'cloud-kitchen')
            revenue_range: Revenue range ('less-10l', '10l-50l', '50l-2cr', '2cr-plus', 'not-sure')
            has_gst: Whether business has GST registration
            gst_number: GST registration number (required if has_gst is True)
            service_charge: Whether service charge is enabled (cafe) - 'yes' or 'no'
            billing_type: Billing type (cafe) - 'counter' or 'table'
            price_type: Price type (cafe) - 'inclusive' or 'exclusive'
            table_service: Whether table service is enabled (restaurant) - 'yes' or 'no'
            kitchen_tickets: Whether kitchen tickets are enabled (restaurant) - 'yes' or 'no'
            restaurant_service_charge: Whether service charge is enabled (restaurant) - 'yes' or 'no'
            number_of_tables: Number of tables (restaurant)
            website_url: Business website URL
            brand_prompt: Brand description prompt for AI theme generation
            branding_choice: How branding/theme was chosen ('url', 'prompt', 'manual')
        
        Returns:
            BusinessConfigurationResponse containing the created configuration record
        
        Raises:
            ValueError: If required fields are missing or invalid
            Exception: If database operation fails
        
        Examples:
            >>> service = ConfigurationService(supabase)
            >>> config = await service.create_configuration(
            ...     business_id="123e4567-e89b-12d3-a456-426614174000",
            ...     business_type="cafe",
            ...     revenue_range="10l-50l",
            ...     has_gst=True,
            ...     gst_number="22AAAAA0000A1Z5",
            ...     service_charge="yes",
            ...     billing_type="counter",
            ...     price_type="inclusive",
            ...     branding_choice="manual"
            ... )
            >>> print(config.business_type)
            'cafe'
        
        Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
        """
        # Validate business_id
        if not business_id:
            raise ValueError("business_id is required")
        
        # Convert 'yes'/'no' strings to boolean values for business type-specific fields
        service_charge_enabled = None
        table_service_enabled = None
        kitchen_tickets_enabled = None
        
        # Handle cafe-specific fields
        if business_type == 'cafe':
            if service_charge is not None:
                service_charge_enabled = service_charge == 'yes'
            
            # Validate required cafe fields
            if billing_type is None:
                raise ValueError("billing_type is required for cafe business type")
            if price_type is None:
                raise ValueError("price_type is required for cafe business type")
        
        # Handle restaurant-specific fields
        elif business_type == 'restaurant':
            if table_service is not None:
                table_service_enabled = table_service == 'yes'
            if kitchen_tickets is not None:
                kitchen_tickets_enabled = kitchen_tickets == 'yes'
            
            # Note: restaurant_service_charge is stored in service_charge_enabled field
            if restaurant_service_charge is not None:
                service_charge_enabled = restaurant_service_charge == 'yes'
            
            # Validate required restaurant fields
            if number_of_tables is None:
                raise ValueError("number_of_tables is required for restaurant business type")
        
        # cloud-kitchen handling can be added here when requirements are defined
        
        try:
            # Create configuration schema
            config_create = BusinessConfigurationCreate(
                business_type=business_type,
                revenue_range=revenue_range,
                has_gst=has_gst,
                gst_number=gst_number,
                service_charge_enabled=service_charge_enabled,
                billing_type=billing_type,
                price_type=price_type,
                table_service_enabled=table_service_enabled,
                kitchen_tickets_enabled=kitchen_tickets_enabled,
                number_of_tables=number_of_tables,
                website_url=website_url,
                brand_prompt=brand_prompt,
                branding_choice=branding_choice
            )
            
            # Create configuration via repository
            created_config = await self.repo.create(
                business_id=business_id,
                config=config_create
            )
            
            logger.info(
                f"Created configuration for business {business_id} "
                f"(type: {business_type})"
            )
            
            return created_config
        
        except Exception as e:
            logger.error(
                f"Error creating configuration for business {business_id}: {e}"
            )
            # Check if it's an RLS policy violation
            error_str = str(e).lower()
            if 'policy' in error_str or '403' in error_str or 'permission' in error_str:
                raise PermissionError(
                    "Permission denied: Unable to create configuration. "
                    "Please ensure you own this business."
                )
            raise
    
    async def get_configuration(
        self,
        business_id: str
    ) -> Optional[BusinessConfigurationResponse]:
        """
        Get configuration for a specific business.
        
        Args:
            business_id: Business UUID
        
        Returns:
            BusinessConfigurationResponse if found, None otherwise
        """
        try:
            return await self.repo.get_by_business_id(business_id)
        except Exception as e:
            logger.error(
                f"Error fetching configuration for business {business_id}: {e}"
            )
            raise
    
    async def configuration_exists(self, business_id: str) -> bool:
        """
        Check if a configuration exists for a business.
        
        Args:
            business_id: Business UUID
        
        Returns:
            True if configuration exists, False otherwise
        """
        try:
            config = await self.repo.get_by_business_id(business_id)
            return config is not None
        except Exception as e:
            logger.error(
                f"Error checking configuration existence for business {business_id}: {e}"
            )
            raise
