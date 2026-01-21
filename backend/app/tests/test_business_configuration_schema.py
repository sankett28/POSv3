"""
Unit tests for business configuration schemas.

Tests validation logic for business configuration data models.
"""
import pytest
from pydantic import ValidationError
from app.schemas.business_configuration import (
    BusinessConfigurationCreate,
    BusinessConfigurationUpdate,
    BusinessConfigurationResponse
)


class TestBusinessConfigurationCreate:
    """Test BusinessConfigurationCreate schema validation."""
    
    def test_valid_cafe_configuration(self):
        """Test creating a valid cafe configuration."""
        config = BusinessConfigurationCreate(
            business_type='cafe',
            revenue_range='10l-50l',
            has_gst=True,
            gst_number='22AAAAA0000A1Z5',
            service_charge_enabled=True,
            billing_type='counter',
            price_type='inclusive',
            branding_choice='manual'
        )
        
        assert config.business_type == 'cafe'
        assert config.has_gst is True
        assert config.gst_number == '22AAAAA0000A1Z5'
        assert config.service_charge_enabled is True
    
    def test_valid_restaurant_configuration(self):
        """Test creating a valid restaurant configuration."""
        config = BusinessConfigurationCreate(
            business_type='restaurant',
            revenue_range='50l-2cr',
            has_gst=False,
            table_service_enabled=True,
            kitchen_tickets_enabled=True,
            number_of_tables=25,
            branding_choice='url',
            website_url='https://example.com'
        )
        
        assert config.business_type == 'restaurant'
        assert config.has_gst is False
        assert config.number_of_tables == 25
        assert config.website_url == 'https://example.com'
    
    def test_gst_number_required_when_has_gst_true(self):
        """Test that GST number is required when has_gst is true."""
        with pytest.raises(ValidationError) as exc_info:
            BusinessConfigurationCreate(
                business_type='cafe',
                revenue_range='less-10l',
                has_gst=True,
                gst_number=None,  # Missing GST number
                branding_choice='manual'
            )
        
        errors = exc_info.value.errors()
        assert any('GST number is required' in str(error['msg']) for error in errors)
    
    def test_invalid_gst_number_format(self):
        """Test that invalid GST number format is rejected."""
        with pytest.raises(ValidationError) as exc_info:
            BusinessConfigurationCreate(
                business_type='cafe',
                revenue_range='less-10l',
                has_gst=True,
                gst_number='INVALID123',  # Invalid format
                branding_choice='manual'
            )
        
        errors = exc_info.value.errors()
        assert any('GST number must match format' in str(error['msg']) for error in errors)
    
    def test_valid_gst_number_formats(self):
        """Test various valid GST number formats."""
        valid_gst_numbers = [
            '22AAAAA0000A1Z5',
            '27AABCU9603R1ZM',
            '09ABCDE1234F1Z5',
        ]
        
        for gst_number in valid_gst_numbers:
            config = BusinessConfigurationCreate(
                business_type='cafe',
                revenue_range='less-10l',
                has_gst=True,
                gst_number=gst_number,
                branding_choice='manual'
            )
            assert config.gst_number == gst_number
    
    def test_invalid_business_type(self):
        """Test that invalid business type is rejected."""
        with pytest.raises(ValidationError):
            BusinessConfigurationCreate(
                business_type='invalid_type',  # Invalid
                revenue_range='less-10l',
                has_gst=False,
                branding_choice='manual'
            )
    
    def test_invalid_revenue_range(self):
        """Test that invalid revenue range is rejected."""
        with pytest.raises(ValidationError):
            BusinessConfigurationCreate(
                business_type='cafe',
                revenue_range='invalid_range',  # Invalid
                has_gst=False,
                branding_choice='manual'
            )
    
    def test_number_of_tables_validation(self):
        """Test that number_of_tables is validated correctly."""
        # Valid range
        config = BusinessConfigurationCreate(
            business_type='restaurant',
            revenue_range='less-10l',
            has_gst=False,
            number_of_tables=50,
            branding_choice='manual'
        )
        assert config.number_of_tables == 50
        
        # Too low
        with pytest.raises(ValidationError):
            BusinessConfigurationCreate(
                business_type='restaurant',
                revenue_range='less-10l',
                has_gst=False,
                number_of_tables=0,  # Must be >= 1
                branding_choice='manual'
            )
        
        # Too high
        with pytest.raises(ValidationError):
            BusinessConfigurationCreate(
                business_type='restaurant',
                revenue_range='less-10l',
                has_gst=False,
                number_of_tables=1001,  # Must be <= 1000
                branding_choice='manual'
            )
    
    def test_optional_fields_can_be_none(self):
        """Test that optional fields can be None."""
        config = BusinessConfigurationCreate(
            business_type='cafe',
            revenue_range='less-10l',
            has_gst=False,
            service_charge_enabled=None,
            billing_type=None,
            price_type=None,
            website_url=None,
            brand_prompt=None,
            branding_choice='manual'
        )
        
        assert config.service_charge_enabled is None
        assert config.billing_type is None
        assert config.website_url is None


class TestBusinessConfigurationUpdate:
    """Test BusinessConfigurationUpdate schema validation."""
    
    def test_all_fields_optional(self):
        """Test that all fields are optional in update schema."""
        update = BusinessConfigurationUpdate()
        
        assert update.business_type is None
        assert update.revenue_range is None
        assert update.has_gst is None
    
    def test_partial_update(self):
        """Test updating only specific fields."""
        update = BusinessConfigurationUpdate(
            has_gst=True,
            gst_number='22AAAAA0000A1Z5'
        )
        
        assert update.has_gst is True
        assert update.gst_number == '22AAAAA0000A1Z5'
        assert update.business_type is None  # Not updated


class TestBusinessConfigurationResponse:
    """Test BusinessConfigurationResponse schema."""
    
    def test_response_includes_metadata(self):
        """Test that response includes id, business_id, and timestamps."""
        from datetime import datetime
        
        response = BusinessConfigurationResponse(
            id='123e4567-e89b-12d3-a456-426614174000',
            business_id='123e4567-e89b-12d3-a456-426614174001',
            business_type='cafe',
            revenue_range='less-10l',
            has_gst=False,
            branding_choice='manual',
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        assert response.id == '123e4567-e89b-12d3-a456-426614174000'
        assert response.business_id == '123e4567-e89b-12d3-a456-426614174001'
        assert isinstance(response.created_at, datetime)
        assert isinstance(response.updated_at, datetime)
