"""
Repository layer for business configuration data access.

Handles all database operations for business configurations.
Uses Supabase client with service role for RLS bypass.
"""
from typing import Optional
from supabase import Client
from app.schemas.business_configuration import (
    BusinessConfigurationCreate,
    BusinessConfigurationUpdate,
    BusinessConfigurationResponse
)
from app.core.logging import logger


class BusinessConfigurationRepository:
    """Repository for business configuration database operations."""
    
    def __init__(self, supabase: Client):
        """
        Initialize business configuration repository.
        
        Args:
            supabase: Supabase client instance (with service role)
        """
        self.supabase = supabase
    
    async def get_by_business_id(self, business_id: str) -> Optional[BusinessConfigurationResponse]:
        """
        Get configuration for a specific business.
        
        Args:
            business_id: Business UUID
        
        Returns:
            BusinessConfigurationResponse if found, None otherwise
        """
        try:
            response = self.supabase.table('business_configurations') \
                .select('*') \
                .eq('business_id', business_id) \
                .single() \
                .execute()
            
            if response.data:
                return BusinessConfigurationResponse(**response.data)
            return None
        
        except Exception as e:
            # Not found is expected - return None
            if 'PGRST116' in str(e):  # Supabase "not found" error code
                return None
            logger.error(f"Error fetching configuration for business {business_id}: {e}")
            raise
    
    async def create(
        self,
        business_id: str,
        config: BusinessConfigurationCreate
    ) -> BusinessConfigurationResponse:
        """
        Create a new business configuration.
        
        Args:
            business_id: Business UUID
            config: Configuration data to create
        
        Returns:
            Created BusinessConfigurationResponse
        
        Raises:
            Exception: If creation fails (e.g., duplicate business_id)
        """
        try:
            # Prepare configuration data
            config_data = {
                'business_id': business_id,
                'business_type': config.business_type,
                'revenue_range': config.revenue_range,
                'has_gst': config.has_gst,
                'gst_number': config.gst_number,
                'service_charge_enabled': config.service_charge_enabled,
                'billing_type': config.billing_type,
                'price_type': config.price_type,
                'table_service_enabled': config.table_service_enabled,
                'kitchen_tickets_enabled': config.kitchen_tickets_enabled,
                'number_of_tables': config.number_of_tables,
                'website_url': config.website_url,
                'brand_prompt': config.brand_prompt,
                'branding_choice': config.branding_choice
            }
            
            # Insert configuration
            response = self.supabase.table('business_configurations') \
                .insert(config_data) \
                .execute()
            
            if not response.data:
                raise Exception("Failed to create business configuration")
            
            created_config = BusinessConfigurationResponse(**response.data[0])
            
            logger.info(f"Created configuration for business {business_id}")
            return created_config
        
        except Exception as e:
            logger.error(f"Error creating configuration for business {business_id}: {e}")
            raise
    
    async def update(
        self,
        business_id: str,
        config_update: BusinessConfigurationUpdate
    ) -> BusinessConfigurationResponse:
        """
        Update an existing business configuration.
        
        Args:
            business_id: Business UUID
            config_update: Configuration fields to update
        
        Returns:
            Updated BusinessConfigurationResponse
        
        Raises:
            Exception: If update fails or configuration not found
        """
        try:
            # Get current configuration to verify it exists
            current_config = await self.get_by_business_id(business_id)
            if not current_config:
                raise Exception(f"Configuration not found for business {business_id}")
            
            # Prepare update data (only include non-None fields)
            update_data = {}
            if config_update.business_type is not None:
                update_data['business_type'] = config_update.business_type
            if config_update.revenue_range is not None:
                update_data['revenue_range'] = config_update.revenue_range
            if config_update.has_gst is not None:
                update_data['has_gst'] = config_update.has_gst
            if config_update.gst_number is not None:
                update_data['gst_number'] = config_update.gst_number
            if config_update.service_charge_enabled is not None:
                update_data['service_charge_enabled'] = config_update.service_charge_enabled
            if config_update.billing_type is not None:
                update_data['billing_type'] = config_update.billing_type
            if config_update.price_type is not None:
                update_data['price_type'] = config_update.price_type
            if config_update.table_service_enabled is not None:
                update_data['table_service_enabled'] = config_update.table_service_enabled
            if config_update.kitchen_tickets_enabled is not None:
                update_data['kitchen_tickets_enabled'] = config_update.kitchen_tickets_enabled
            if config_update.number_of_tables is not None:
                update_data['number_of_tables'] = config_update.number_of_tables
            if config_update.website_url is not None:
                update_data['website_url'] = config_update.website_url
            if config_update.brand_prompt is not None:
                update_data['brand_prompt'] = config_update.brand_prompt
            if config_update.branding_choice is not None:
                update_data['branding_choice'] = config_update.branding_choice
            
            if not update_data:
                # No fields to update
                return current_config
            
            # Update configuration
            response = self.supabase.table('business_configurations') \
                .update(update_data) \
                .eq('business_id', business_id) \
                .execute()
            
            # Re-fetch the updated configuration
            updated_config = await self.get_by_business_id(business_id)
            if not updated_config:
                raise Exception("Failed to update configuration - not found after update")
            
            logger.info(f"Updated configuration for business {business_id}")
            return updated_config
        
        except Exception as e:
            logger.error(f"Error updating configuration for business {business_id}: {e}")
            raise
    
    async def delete(self, business_id: str) -> bool:
        """
        Delete a business configuration.
        
        Note: This is typically not needed as configurations are cascade deleted
        when the business is deleted.
        
        Args:
            business_id: Business UUID
        
        Returns:
            True if deleted, False if not found
        """
        try:
            # Check if configuration exists
            current_config = await self.get_by_business_id(business_id)
            if not current_config:
                return False
            
            # Delete configuration
            response = self.supabase.table('business_configurations') \
                .delete() \
                .eq('business_id', business_id) \
                .execute()
            
            logger.info(f"Deleted configuration for business {business_id}")
            return True
        
        except Exception as e:
            logger.error(f"Error deleting configuration for business {business_id}: {e}")
            raise
    
    async def upsert(
        self,
        business_id: str,
        config: BusinessConfigurationCreate
    ) -> BusinessConfigurationResponse:
        """
        Create or update configuration (upsert operation).
        
        Args:
            business_id: Business UUID
            config: Configuration data
        
        Returns:
            BusinessConfigurationResponse (created or updated)
        """
        existing_config = await self.get_by_business_id(business_id)
        
        if existing_config:
            # Update existing configuration
            config_update = BusinessConfigurationUpdate(
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
                branding_choice=config.branding_choice
            )
            return await self.update(
                business_id=business_id,
                config_update=config_update
            )
        else:
            # Create new configuration
            return await self.create(
                business_id=business_id,
                config=config
            )
