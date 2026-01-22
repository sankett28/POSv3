"""
Service layer for onboarding management.

Handles onboarding completion with database transactions and cache invalidation.
Coordinates business, configuration, and theme creation with proper error handling.
"""
from typing import Dict, Optional
from supabase import Client
from app.services.cache_service import CacheService
from app.services.business_service import BusinessService
from app.services.configuration_service import ConfigurationService
from app.services.theme_service import ThemeService
from app.core.decorators import handle_database_error
from app.core.logging import logger


class OnboardingService:
    """
    Service for handling onboarding completion and cache invalidation.
    
    This service coordinates the complete onboarding process:
    - Creates business record
    - Creates business configuration
    - Creates theme
    - Updates user.onboarding_completed = True
    - Invalidates user cache
    
    Validates: Requirements 1.2, 5.1
    """
    
    def __init__(self, db_session: Client, cache_service: CacheService):
        """
        Initialize onboarding service with database and cache dependencies.
        
        Args:
            db_session: Supabase client instance
            cache_service: Cache service instance for cache operations
        
        Examples:
            >>> from supabase import create_client
            >>> import redis
            >>> db = create_client(url, key)
            >>> redis_client = redis.Redis(host='localhost', port=6379)
            >>> cache = CacheService(redis_client)
            >>> onboarding_service = OnboardingService(db, cache)
        
        Validates: Requirements 5.1
        """
        self.db = db_session
        self.cache = cache_service
        
        # Initialize sub-services
        self.business_service = BusinessService(db_session)
        self.config_service = ConfigurationService(db_session)
        self.theme_service = ThemeService(supabase=db_session)
    
    @handle_database_error
    async def complete_onboarding(
        self,
        user_id: str,
        business_data: Dict,
        config_data: Dict,
        theme_data: Dict
    ) -> Dict:
        """
        Complete onboarding process with transaction and cache invalidation.
        
        This method performs the following steps atomically:
        1. Create business record
        2. Create business configuration
        3. Create theme
        4. Update user.onboarding_completed = True
        5. Invalidate user cache
        
        If any step fails, the business record is deleted (CASCADE deletes related records).
        
        Args:
            user_id: User UUID who is completing onboarding
            business_data: Dictionary containing business information:
                - name: Business name (required)
                - website_url: Website URL (optional)
            config_data: Dictionary containing configuration information:
                - business_type: Type of business (required)
                - revenue_range: Revenue range (required)
                - has_gst: GST registration status (required)
                - gst_number: GST number (optional)
                - service_charge: Service charge setting (optional)
                - billing_type: Billing type (optional)
                - price_type: Price type (optional)
                - table_service: Table service setting (optional)
                - kitchen_tickets: Kitchen tickets setting (optional)
                - restaurant_service_charge: Restaurant service charge (optional)
                - number_of_tables: Number of tables (optional)
                - website_url: Website URL (optional)
                - brand_prompt: Brand prompt (optional)
                - branding_choice: Branding choice (optional)
            theme_data: Dictionary containing theme information:
                - theme_mode: Theme mode (optional, default: 'light')
                - primary_color: Primary color (optional)
                - secondary_color: Secondary color (optional)
                - background_color: Background color (optional)
                - foreground_color: Foreground color (optional)
                - accent_color: Accent color (optional)
                - danger_color: Danger color (optional)
                - success_color: Success color (optional)
                - warning_color: Warning color (optional)
                - branding_choice: Branding choice (optional)
                - website_url: Website URL (optional)
                - brand_prompt: Brand prompt (optional)
        
        Returns:
            Dictionary containing:
                - business_id: UUID of created business
                - message: Success message
        
        Raises:
            HTTPException: 400 for validation errors, 403 for permission errors, 
                          500 for server errors
        
        Examples:
            >>> business_data = {'name': 'My Cafe', 'website_url': 'https://mycafe.com'}
            >>> config_data = {
            ...     'business_type': 'cafe',
            ...     'revenue_range': '10l-50l',
            ...     'has_gst': True,
            ...     'gst_number': '22AAAAA0000A1Z5',
            ...     'service_charge': 'yes',
            ...     'billing_type': 'counter',
            ...     'price_type': 'inclusive'
            ... }
            >>> theme_data = {
            ...     'theme_mode': 'light',
            ...     'primary_color': '#912b48',
            ...     'secondary_color': '#ffffff'
            ... }
            >>> result = await onboarding_service.complete_onboarding(
            ...     user_id='123e4567-e89b-12d3-a456-426614174000',
            ...     business_data=business_data,
            ...     config_data=config_data,
            ...     theme_data=theme_data
            ... )
            >>> print(result['business_id'])
            '123e4567-e89b-12d3-a456-426614174000'
        
        Validates: Requirements 1.2, 5.1
        """
        business_id = None
        
        try:
            # Step 1: Create business record
            logger.info(f"Creating business for user {user_id}: {business_data.get('name')}")
            business = await self.business_service.create_business(
                name=business_data['name'],
                user_id=user_id,
                website_url=business_data.get('website_url'),
                is_active=True
            )
            business_id = business['id']
            logger.info(f"Business created successfully: {business_id}")
            
            # Step 2: Create configuration record (with rollback on failure)
            try:
                logger.info(f"Creating configuration for business {business_id}")
                await self.config_service.create_configuration(
                    business_id=business_id,
                    business_type=config_data['business_type'],
                    revenue_range=config_data['revenue_range'],
                    has_gst=config_data['has_gst'],
                    gst_number=config_data.get('gst_number'),
                    service_charge=config_data.get('service_charge'),
                    billing_type=config_data.get('billing_type'),
                    price_type=config_data.get('price_type'),
                    table_service=config_data.get('table_service'),
                    kitchen_tickets=config_data.get('kitchen_tickets'),
                    restaurant_service_charge=config_data.get('restaurant_service_charge'),
                    number_of_tables=config_data.get('number_of_tables'),
                    website_url=config_data.get('website_url'),
                    brand_prompt=config_data.get('brand_prompt'),
                    branding_choice=config_data.get('branding_choice', 'manual')
                )
                logger.info(f"Configuration created successfully for business {business_id}")
            except Exception as config_error:
                logger.error(f"Configuration creation failed: {config_error}")
                # Rollback: Delete the business (CASCADE will delete related records)
                await self._rollback_business(business_id)
                raise
            
            # Step 3: Create theme record (with rollback on failure)
            try:
                logger.info(f"Creating theme for business {business_id}")
                await self.theme_service.create_theme(
                    business_id=business_id,
                    theme_mode=theme_data.get('theme_mode', 'light'),
                    primary_color=theme_data.get('primary_color', '#912b48'),
                    secondary_color=theme_data.get('secondary_color', '#ffffff'),
                    background_color=theme_data.get('background_color', '#fff0f3'),
                    foreground_color=theme_data.get('foreground_color', '#610027'),
                    accent_color=theme_data.get('accent_color', '#b45a69'),
                    danger_color=theme_data.get('danger_color', '#ef4444'),
                    success_color=theme_data.get('success_color', '#22c55e'),
                    warning_color=theme_data.get('warning_color', '#f59e0b'),
                    branding_choice=theme_data.get('branding_choice', 'manual'),
                    website_url=theme_data.get('website_url'),
                    brand_prompt=theme_data.get('brand_prompt')
                )
                logger.info(f"Theme created successfully for business {business_id}")
            except Exception as theme_error:
                logger.error(f"Theme creation failed: {theme_error}")
                # Rollback: Delete the business (CASCADE will delete related records)
                await self._rollback_business(business_id)
                raise
            
            # Step 4: Update user.onboarding_completed = True
            try:
                logger.info(f"Updating onboarding_completed for user {user_id}")
                self.db.table('users').update({
                    'onboarding_completed': True
                }).eq('id', user_id).execute()
                logger.info(f"User {user_id} onboarding_completed set to True")
            except Exception as user_update_error:
                logger.error(f"User update failed: {user_update_error}")
                # Rollback: Delete the business (CASCADE will delete related records)
                await self._rollback_business(business_id)
                raise
            
            # Step 5: Invalidate user cache
            try:
                user_cache_key = self.cache.build_key('user', user_id)
                self.cache.invalidate(user_cache_key)
                logger.info(f"Invalidated cache for user {user_id}")
            except Exception as cache_error:
                # Cache invalidation failure should not break the flow
                logger.warning(f"Cache invalidation failed for user {user_id}: {cache_error}")
            
            logger.info(f"Onboarding completed successfully for user {user_id}, business {business_id}")
            
            return {
                'business_id': business_id,
                'message': 'Onboarding completed successfully'
            }
        
        except Exception as e:
            logger.error(f"Error during onboarding for user {user_id}: {e}", exc_info=True)
            raise
    
    async def _rollback_business(self, business_id: str) -> None:
        """
        Rollback helper: Delete business record (CASCADE deletes related records).
        
        Args:
            business_id: Business UUID to delete
        """
        try:
            logger.warning(f"Rolling back: Deleting business {business_id}")
            self.db.table('businesses').delete().eq('id', business_id).execute()
            logger.info(f"Rollback successful: Business {business_id} deleted")
        except Exception as rollback_error:
            logger.error(
                f"Rollback failed for business {business_id}: {rollback_error}",
                exc_info=True
            )
    
    @handle_database_error
    async def update_business_config(
        self,
        business_id: str,
        config_data: Dict
    ) -> Dict:
        """
        Update business configuration and invalidate cache.
        
        Args:
            business_id: Business UUID
            config_data: Dictionary containing configuration fields to update
        
        Returns:
            Dictionary containing updated configuration data
        
        Raises:
            HTTPException: 400 for validation errors, 403 for permission errors,
                          500 for server errors
        
        Examples:
            >>> config_data = {'service_charge': 'yes', 'billing_type': 'table'}
            >>> result = await onboarding_service.update_business_config(
            ...     business_id='123e4567-e89b-12d3-a456-426614174000',
            ...     config_data=config_data
            ... )
        
        Validates: Requirements 5.2
        """
        try:
            logger.info(f"Updating configuration for business {business_id}")
            
            # Update configuration in database
            response = self.db.table('business_configurations').update(
                config_data
            ).eq('business_id', business_id).execute()
            
            if not response.data:
                raise ValueError(f"Configuration not found for business {business_id}")
            
            updated_config = response.data[0]
            logger.info(f"Configuration updated successfully for business {business_id}")
            
            # Invalidate business config cache
            try:
                config_cache_key = self.cache.build_key('business', business_id, 'config')
                self.cache.invalidate(config_cache_key)
                logger.info(f"Invalidated config cache for business {business_id}")
            except Exception as cache_error:
                # Cache invalidation failure should not break the flow
                logger.warning(
                    f"Cache invalidation failed for business config {business_id}: {cache_error}"
                )
            
            return updated_config
        
        except Exception as e:
            logger.error(f"Error updating configuration for business {business_id}: {e}")
            raise
    
    @handle_database_error
    async def update_theme(
        self,
        business_id: str,
        theme_data: Dict
    ) -> Dict:
        """
        Update theme and invalidate cache.
        
        Args:
            business_id: Business UUID
            theme_data: Dictionary containing theme fields to update
        
        Returns:
            Dictionary containing updated theme data
        
        Raises:
            HTTPException: 400 for validation errors, 403 for permission errors,
                          500 for server errors
        
        Examples:
            >>> theme_data = {'primary_color': '#ff0000', 'theme_mode': 'dark'}
            >>> result = await onboarding_service.update_theme(
            ...     business_id='123e4567-e89b-12d3-a456-426614174000',
            ...     theme_data=theme_data
            ... )
        
        Validates: Requirements 5.3
        """
        try:
            logger.info(f"Updating theme for business {business_id}")
            
            # Update theme in database
            response = self.db.table('themes').update(
                theme_data
            ).eq('business_id', business_id).execute()
            
            if not response.data:
                raise ValueError(f"Theme not found for business {business_id}")
            
            updated_theme = response.data[0]
            logger.info(f"Theme updated successfully for business {business_id}")
            
            # Invalidate theme cache
            try:
                theme_cache_key = self.cache.build_key('business', business_id, 'theme')
                self.cache.invalidate(theme_cache_key)
                logger.info(f"Invalidated theme cache for business {business_id}")
            except Exception as cache_error:
                # Cache invalidation failure should not break the flow
                logger.warning(
                    f"Cache invalidation failed for business theme {business_id}: {cache_error}"
                )
            
            return updated_theme
        
        except Exception as e:
            logger.error(f"Error updating theme for business {business_id}: {e}")
            raise
