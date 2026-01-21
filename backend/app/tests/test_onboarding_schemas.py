"""
Unit tests for onboarding Pydantic schemas.

Tests validation rules for OnboardingRequest and OnboardingResponse.
"""
import pytest
from pydantic import ValidationError
from app.schemas.onboarding import OnboardingRequest, OnboardingResponse


class TestOnboardingRequest:
    """Test OnboardingRequest schema validation."""
    
    def test_valid_cafe_onboarding(self):
        """Test valid cafe onboarding request."""
        data = {
            "business_name": "Cafe Delight",
            "business_type": "cafe",
            "revenue": "10l-50l",
            "has_gst": "yes",
            "gst_number": "22AAAAA0000A1Z5",
            "service_charge": "yes",
            "billing_type": "counter",
            "price_type": "inclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48",
            "secondary_color": "#ffffff",
            "background_color": "#fff0f3",
            "foreground_color": "#610027"
        }
        
        request = OnboardingRequest(**data)
        assert request.business_name == "Cafe Delight"
        assert request.business_type == "cafe"
        assert request.gst_number == "22AAAAA0000A1Z5"
        # Colors should be normalized
        assert request.primary_color == "#912B48"
    
    def test_valid_restaurant_onboarding(self):
        """Test valid restaurant onboarding request."""
        data = {
            "business_name": "Fine Dining",
            "business_type": "restaurant",
            "revenue": "50l-2cr",
            "has_gst": "no",
            "table_service": "yes",
            "kitchen_tickets": "yes",
            "restaurant_service_charge": "yes",
            "number_of_tables": 25,
            "branding_choice": "url",
            "website_url": "https://example.com",
            "theme_mode": "dark",
            "primary_color": "#912b48"
        }
        
        request = OnboardingRequest(**data)
        assert request.business_name == "Fine Dining"
        assert request.business_type == "restaurant"
        assert request.number_of_tables == 25
        assert request.has_gst == "no"
        assert request.gst_number is None
    
    def test_gst_number_required_when_has_gst_yes(self):
        """Test GST number is required when has_gst is 'yes'."""
        data = {
            "business_name": "Test Cafe",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "yes",
            # Missing gst_number
            "service_charge": "no",
            "billing_type": "counter",
            "price_type": "exclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            OnboardingRequest(**data)
        
        errors = exc_info.value.errors()
        assert any('GST number is required' in str(error['msg']) for error in errors)
    
    def test_gst_number_optional_when_has_gst_no(self):
        """Test GST number is optional when has_gst is 'no'."""
        data = {
            "business_name": "Test Cafe",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "no",
            # No gst_number provided
            "service_charge": "no",
            "billing_type": "counter",
            "price_type": "exclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        request = OnboardingRequest(**data)
        assert request.has_gst == "no"
        assert request.gst_number is None
    
    def test_invalid_gst_number_format(self):
        """Test invalid GST number format is rejected."""
        data = {
            "business_name": "Test Cafe",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "yes",
            "gst_number": "INVALID123",  # Invalid format
            "service_charge": "no",
            "billing_type": "counter",
            "price_type": "exclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            OnboardingRequest(**data)
        
        errors = exc_info.value.errors()
        assert any('GST number must match format' in str(error['msg']) for error in errors)
    
    def test_valid_gst_number_formats(self):
        """Test various valid GST number formats."""
        valid_gst_numbers = [
            "22AAAAA0000A1Z5",
            "27AABCU9603R1ZM",
            "09ABCDE1234F1Z5"
        ]
        
        for gst_number in valid_gst_numbers:
            data = {
                "business_name": "Test Cafe",
                "business_type": "cafe",
                "revenue": "less-10l",
                "has_gst": "yes",
                "gst_number": gst_number,
                "service_charge": "no",
                "billing_type": "counter",
                "price_type": "exclusive",
                "branding_choice": "manual",
                "theme_mode": "light",
                "primary_color": "#912b48"
            }
            
            request = OnboardingRequest(**data)
            assert request.gst_number == gst_number
    
    def test_invalid_hex_color(self):
        """Test invalid hex color is rejected."""
        data = {
            "business_name": "Test Cafe",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "no",
            "service_charge": "no",
            "billing_type": "counter",
            "price_type": "exclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "invalid"  # Invalid hex
        }
        
        with pytest.raises(ValidationError) as exc_info:
            OnboardingRequest(**data)
        
        errors = exc_info.value.errors()
        assert any('Invalid hex color format' in str(error['msg']) for error in errors)
    
    def test_hex_color_normalization(self):
        """Test hex colors are normalized to uppercase with #."""
        data = {
            "business_name": "Test Cafe",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "no",
            "service_charge": "no",
            "billing_type": "counter",
            "price_type": "exclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "912b48",  # Without #
            "secondary_color": "#ffffff"  # With #
        }
        
        request = OnboardingRequest(**data)
        assert request.primary_color == "#912B48"
        assert request.secondary_color == "#FFFFFF"
    
    def test_cafe_missing_required_fields(self):
        """Test cafe business type requires specific fields."""
        data = {
            "business_name": "Test Cafe",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "no",
            # Missing: service_charge, billing_type, price_type
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            OnboardingRequest(**data)
        
        errors = exc_info.value.errors()
        error_messages = [str(error['msg']) for error in errors]
        assert any('service_charge is required' in msg for msg in error_messages)
    
    def test_restaurant_missing_required_fields(self):
        """Test restaurant business type requires specific fields."""
        data = {
            "business_name": "Test Restaurant",
            "business_type": "restaurant",
            "revenue": "less-10l",
            "has_gst": "no",
            # Missing: table_service, kitchen_tickets, restaurant_service_charge, number_of_tables
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        with pytest.raises(ValidationError) as exc_info:
            OnboardingRequest(**data)
        
        errors = exc_info.value.errors()
        error_messages = [str(error['msg']) for error in errors]
        assert any('table_service is required' in msg for msg in error_messages)
    
    def test_number_of_tables_validation(self):
        """Test number_of_tables must be between 1 and 1000."""
        # Test too low
        data = {
            "business_name": "Test Restaurant",
            "business_type": "restaurant",
            "revenue": "less-10l",
            "has_gst": "no",
            "table_service": "yes",
            "kitchen_tickets": "yes",
            "restaurant_service_charge": "yes",
            "number_of_tables": 0,  # Too low
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        with pytest.raises(ValidationError):
            OnboardingRequest(**data)
        
        # Test too high
        data["number_of_tables"] = 1001  # Too high
        with pytest.raises(ValidationError):
            OnboardingRequest(**data)
        
        # Test valid
        data["number_of_tables"] = 50
        request = OnboardingRequest(**data)
        assert request.number_of_tables == 50
    
    def test_business_name_length_validation(self):
        """Test business name length constraints."""
        # Empty name
        data = {
            "business_name": "",
            "business_type": "cafe",
            "revenue": "less-10l",
            "has_gst": "no",
            "service_charge": "no",
            "billing_type": "counter",
            "price_type": "exclusive",
            "branding_choice": "manual",
            "theme_mode": "light",
            "primary_color": "#912b48"
        }
        
        with pytest.raises(ValidationError):
            OnboardingRequest(**data)
        
        # Too long name (>255 chars)
        data["business_name"] = "A" * 256
        with pytest.raises(ValidationError):
            OnboardingRequest(**data)
        
        # Valid length
        data["business_name"] = "Valid Cafe Name"
        request = OnboardingRequest(**data)
        assert request.business_name == "Valid Cafe Name"


class TestOnboardingResponse:
    """Test OnboardingResponse schema."""
    
    def test_valid_response(self):
        """Test valid onboarding response."""
        data = {
            "success": True,
            "business_id": "123e4567-e89b-12d3-a456-426614174000",
            "message": "Onboarding completed successfully"
        }
        
        response = OnboardingResponse(**data)
        assert response.success is True
        assert response.business_id == "123e4567-e89b-12d3-a456-426614174000"
        assert response.message == "Onboarding completed successfully"
    
    def test_error_response(self):
        """Test error response format."""
        data = {
            "success": False,
            "business_id": "",
            "message": "Failed to create business"
        }
        
        response = OnboardingResponse(**data)
        assert response.success is False
        assert response.message == "Failed to create business"
