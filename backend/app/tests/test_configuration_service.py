"""
Unit tests for configuration service.

Tests configuration creation, business type-specific field handling,
and validation logic.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.configuration_service import ConfigurationService
from app.schemas.business_configuration import BusinessConfigurationResponse
from datetime import datetime


class TestConfigurationCreation:
    """Test configuration record creation."""
    
    @pytest.mark.asyncio
    async def test_create_cafe_configuration_success(self):
        """Test successful cafe configuration creation."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        # Mock repository response
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=True,
            gst_number='22AAAAA0000A1Z5',
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=True,
            gst_number='22AAAAA0000A1Z5',
            service_charge='yes',
            billing_type='counter',
            price_type='inclusive',
            branding_choice='manual'
        )
        
        assert config.business_id == 'business-123'
        assert config.business_type == 'cafe'
        assert config.service_charge_enabled is True
        assert config.billing_type == 'counter'
        assert config.price_type == 'inclusive'
        
        # Verify repository was called with correct data
        mock_repo.create.assert_called_once()
        call_args = mock_repo.create.call_args
        assert call_args.kwargs['business_id'] == 'business-123'
        assert call_args.kwargs['config'].service_charge_enabled is True
    
    @pytest.mark.asyncio
    async def test_create_cafe_configuration_service_charge_no(self):
        """Test cafe configuration with service charge disabled."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=False,
            billing_type='table',
            price_type='exclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            service_charge='no',
            billing_type='table',
            price_type='exclusive',
            branding_choice='manual'
        )
        
        assert config.service_charge_enabled is False
    
    @pytest.mark.asyncio
    async def test_create_restaurant_configuration_success(self):
        """Test successful restaurant configuration creation."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='restaurant',
            revenue_range='50l-2cr',
            has_gst=True,
            gst_number='27AABCU9603R1ZM',
            service_charge_enabled=True,
            billing_type=None,
            price_type=None,
            table_service_enabled=True,
            kitchen_tickets_enabled=True,
            number_of_tables=25,
            website_url='https://restaurant.com',
            brand_prompt=None,
            branding_choice='url',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='restaurant',
            revenue_range='50l-2cr',
            has_gst=True,
            gst_number='27AABCU9603R1ZM',
            table_service='yes',
            kitchen_tickets='yes',
            restaurant_service_charge='yes',
            number_of_tables=25,
            website_url='https://restaurant.com',
            branding_choice='url'
        )
        
        assert config.business_type == 'restaurant'
        assert config.table_service_enabled is True
        assert config.kitchen_tickets_enabled is True
        assert config.service_charge_enabled is True
        assert config.number_of_tables == 25
        assert config.website_url == 'https://restaurant.com'
    
    @pytest.mark.asyncio
    async def test_create_restaurant_configuration_no_service_charge(self):
        """Test restaurant configuration with service charge disabled."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='restaurant',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=False,
            billing_type=None,
            price_type=None,
            table_service_enabled=False,
            kitchen_tickets_enabled=False,
            number_of_tables=10,
            website_url=None,
            brand_prompt='Modern Italian restaurant',
            branding_choice='prompt',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='restaurant',
            revenue_range='10l-50l',
            has_gst=False,
            table_service='no',
            kitchen_tickets='no',
            restaurant_service_charge='no',
            number_of_tables=10,
            brand_prompt='Modern Italian restaurant',
            branding_choice='prompt'
        )
        
        assert config.service_charge_enabled is False
        assert config.table_service_enabled is False
        assert config.kitchen_tickets_enabled is False


class TestConfigurationValidation:
    """Test configuration validation logic."""
    
    @pytest.mark.asyncio
    async def test_create_configuration_missing_business_id(self):
        """Test that missing business_id raises ValueError."""
        service = ConfigurationService(MagicMock())
        
        with pytest.raises(ValueError) as exc_info:
            await service.create_configuration(
                business_id='',
                business_type='cafe',
                revenue_range='10l-50l',
                has_gst=False,
                branding_choice='manual'
            )
        
        assert "business_id is required" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_cafe_missing_billing_type(self):
        """Test that cafe without billing_type raises ValueError."""
        service = ConfigurationService(MagicMock())
        
        with pytest.raises(ValueError) as exc_info:
            await service.create_configuration(
                business_id='business-123',
                business_type='cafe',
                revenue_range='10l-50l',
                has_gst=False,
                service_charge='yes',
                price_type='inclusive',
                branding_choice='manual'
            )
        
        assert "billing_type is required for cafe" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_cafe_missing_price_type(self):
        """Test that cafe without price_type raises ValueError."""
        service = ConfigurationService(MagicMock())
        
        with pytest.raises(ValueError) as exc_info:
            await service.create_configuration(
                business_id='business-123',
                business_type='cafe',
                revenue_range='10l-50l',
                has_gst=False,
                service_charge='yes',
                billing_type='counter',
                branding_choice='manual'
            )
        
        assert "price_type is required for cafe" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_restaurant_missing_number_of_tables(self):
        """Test that restaurant without number_of_tables raises ValueError."""
        service = ConfigurationService(MagicMock())
        
        with pytest.raises(ValueError) as exc_info:
            await service.create_configuration(
                business_id='business-123',
                business_type='restaurant',
                revenue_range='10l-50l',
                has_gst=False,
                table_service='yes',
                kitchen_tickets='yes',
                restaurant_service_charge='no',
                branding_choice='manual'
            )
        
        assert "number_of_tables is required for restaurant" in str(exc_info.value)


class TestBusinessTypeSpecificFields:
    """Test business type-specific field handling."""
    
    @pytest.mark.asyncio
    async def test_cafe_fields_stored_restaurant_fields_null(self):
        """Test that cafe configuration stores cafe fields and nulls restaurant fields."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            service_charge='yes',
            billing_type='counter',
            price_type='inclusive',
            branding_choice='manual'
        )
        
        # Cafe fields should be set
        assert config.service_charge_enabled is True
        assert config.billing_type == 'counter'
        assert config.price_type == 'inclusive'
        
        # Restaurant fields should be None
        assert config.table_service_enabled is None
        assert config.kitchen_tickets_enabled is None
        assert config.number_of_tables is None
    
    @pytest.mark.asyncio
    async def test_restaurant_fields_stored_cafe_fields_null(self):
        """Test that restaurant configuration stores restaurant fields and nulls cafe fields."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='restaurant',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=False,
            billing_type=None,
            price_type=None,
            table_service_enabled=True,
            kitchen_tickets_enabled=True,
            number_of_tables=15,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='restaurant',
            revenue_range='10l-50l',
            has_gst=False,
            table_service='yes',
            kitchen_tickets='yes',
            restaurant_service_charge='no',
            number_of_tables=15,
            branding_choice='manual'
        )
        
        # Restaurant fields should be set
        assert config.table_service_enabled is True
        assert config.kitchen_tickets_enabled is True
        assert config.number_of_tables == 15
        assert config.service_charge_enabled is False
        
        # Cafe-specific fields should be None
        assert config.billing_type is None
        assert config.price_type is None


class TestConfigurationRetrieval:
    """Test configuration retrieval methods."""
    
    @pytest.mark.asyncio
    async def test_get_configuration_found(self):
        """Test retrieving configuration when it exists."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.get_by_business_id.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.get_configuration('business-123')
        
        assert config is not None
        assert config.business_id == 'business-123'
        mock_repo.get_by_business_id.assert_called_once_with('business-123')
    
    @pytest.mark.asyncio
    async def test_get_configuration_not_found(self):
        """Test retrieving configuration when it doesn't exist."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        mock_repo.get_by_business_id.return_value = None
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.get_configuration('nonexistent-business')
        
        assert config is None
    
    @pytest.mark.asyncio
    async def test_configuration_exists_true(self):
        """Test checking if configuration exists returns True when it does."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.get_by_business_id.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        exists = await service.configuration_exists('business-123')
        
        assert exists is True
    
    @pytest.mark.asyncio
    async def test_configuration_exists_false(self):
        """Test checking if configuration exists returns False when it doesn't."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        mock_repo.get_by_business_id.return_value = None
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        exists = await service.configuration_exists('nonexistent-business')
        
        assert exists is False


class TestBrandingFields:
    """Test branding field handling."""
    
    @pytest.mark.asyncio
    async def test_create_configuration_with_website_url(self):
        """Test configuration creation with website URL."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url='https://mycafe.com',
            brand_prompt=None,
            branding_choice='url',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            service_charge='yes',
            billing_type='counter',
            price_type='inclusive',
            website_url='https://mycafe.com',
            branding_choice='url'
        )
        
        assert config.website_url == 'https://mycafe.com'
        assert config.branding_choice == 'url'
    
    @pytest.mark.asyncio
    async def test_create_configuration_with_brand_prompt(self):
        """Test configuration creation with brand prompt."""
        mock_supabase = MagicMock()
        mock_repo = AsyncMock()
        
        mock_config = BusinessConfigurationResponse(
            id='config-123',
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            gst_number=None,
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            table_service_enabled=None,
            kitchen_tickets_enabled=None,
            number_of_tables=None,
            website_url=None,
            brand_prompt='A cozy neighborhood cafe with artisan coffee',
            branding_choice='prompt',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create.return_value = mock_config
        
        service = ConfigurationService(mock_supabase)
        service.repo = mock_repo
        
        config = await service.create_configuration(
            business_id='business-123',
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=False,
            service_charge='yes',
            billing_type='counter',
            price_type='inclusive',
            brand_prompt='A cozy neighborhood cafe with artisan coffee',
            branding_choice='prompt'
        )
        
        assert config.brand_prompt == 'A cozy neighborhood cafe with artisan coffee'
        assert config.branding_choice == 'prompt'
