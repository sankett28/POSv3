"""
Tests for color validation utilities.

Verifies hex validation and WCAG 2.0 contrast calculations.
"""
import pytest
from app.utils.color_validation import (
    is_valid_hex,
    normalize_hex,
    hex_to_rgb,
    contrast_ratio,
    validate_contrast,
    validate_theme_colors
)


class TestHexValidation:
    """Test hex color validation."""
    
    def test_valid_hex_with_hash(self):
        """Test valid hex with # prefix."""
        assert is_valid_hex("#FF5733") is True
        assert is_valid_hex("#000000") is True
        assert is_valid_hex("#FFFFFF") is True
    
    def test_valid_hex_without_hash(self):
        """Test valid hex without # prefix."""
        assert is_valid_hex("FF5733") is True
        assert is_valid_hex("000000") is True
        assert is_valid_hex("FFFFFF") is True
    
    def test_valid_hex_lowercase(self):
        """Test valid hex with lowercase letters."""
        assert is_valid_hex("#ff5733") is True
        assert is_valid_hex("abc123") is True
    
    def test_invalid_hex_short(self):
        """Test invalid hex - too short."""
        assert is_valid_hex("#FFF") is False
        assert is_valid_hex("FFF") is False
    
    def test_invalid_hex_long(self):
        """Test invalid hex - too long."""
        assert is_valid_hex("#FF57331") is False
        assert is_valid_hex("FF57331") is False
    
    def test_invalid_hex_characters(self):
        """Test invalid hex - invalid characters."""
        assert is_valid_hex("#GGGGGG") is False
        assert is_valid_hex("ZZZZZZ") is False
        assert is_valid_hex("invalid") is False
    
    def test_invalid_hex_empty(self):
        """Test invalid hex - empty string."""
        assert is_valid_hex("") is False
        assert is_valid_hex(None) is False


class TestHexNormalization:
    """Test hex color normalization."""
    
    def test_normalize_with_hash(self):
        """Test normalization with # prefix."""
        assert normalize_hex("#ff5733") == "#FF5733"
        assert normalize_hex("#FF5733") == "#FF5733"
    
    def test_normalize_without_hash(self):
        """Test normalization without # prefix."""
        assert normalize_hex("ff5733") == "#FF5733"
        assert normalize_hex("FF5733") == "#FF5733"
    
    def test_normalize_invalid(self):
        """Test normalization with invalid hex."""
        with pytest.raises(ValueError):
            normalize_hex("invalid")
        with pytest.raises(ValueError):
            normalize_hex("#FFF")


class TestRGBConversion:
    """Test hex to RGB conversion."""
    
    def test_hex_to_rgb_black(self):
        """Test conversion of black."""
        assert hex_to_rgb("#000000") == (0, 0, 0)
    
    def test_hex_to_rgb_white(self):
        """Test conversion of white."""
        assert hex_to_rgb("#FFFFFF") == (255, 255, 255)
    
    def test_hex_to_rgb_red(self):
        """Test conversion of red."""
        assert hex_to_rgb("#FF0000") == (255, 0, 0)
    
    def test_hex_to_rgb_custom(self):
        """Test conversion of custom color."""
        assert hex_to_rgb("#912b48") == (145, 43, 72)


class TestContrastRatio:
    """Test WCAG 2.0 contrast ratio calculations."""
    
    def test_contrast_black_white(self):
        """Test maximum contrast (black vs white)."""
        ratio = contrast_ratio("#000000", "#FFFFFF")
        assert abs(ratio - 21.0) < 0.1  # Should be exactly 21:1
    
    def test_contrast_white_black(self):
        """Test maximum contrast (white vs black - order shouldn't matter)."""
        ratio = contrast_ratio("#FFFFFF", "#000000")
        assert abs(ratio - 21.0) < 0.1
    
    def test_contrast_same_color(self):
        """Test no contrast (same color)."""
        ratio = contrast_ratio("#FF5733", "#FF5733")
        assert abs(ratio - 1.0) < 0.1  # Should be exactly 1:1
    
    def test_contrast_brand_colors(self):
        """Test contrast of actual brand colors."""
        # Foreground (#610027) vs Background (#fff0f3)
        ratio = contrast_ratio("#610027", "#fff0f3")
        assert ratio >= 4.5  # Should meet AA normal text
        
        # Primary (#912b48) vs Background (#fff0f3)
        ratio = contrast_ratio("#912b48", "#fff0f3")
        assert ratio >= 3.0  # Should meet AA large text


class TestContrastValidation:
    """Test contrast validation against WCAG standards."""
    
    def test_validate_contrast_pass_aa(self):
        """Test validation passing AA standard."""
        is_valid, ratio = validate_contrast("#000000", "#FFFFFF", 4.5)
        assert is_valid is True
        assert ratio >= 4.5
    
    def test_validate_contrast_fail_aa(self):
        """Test validation failing AA standard."""
        is_valid, ratio = validate_contrast("#CCCCCC", "#FFFFFF", 4.5)
        assert is_valid is False
        assert ratio < 4.5
    
    def test_validate_contrast_pass_aaa(self):
        """Test validation passing AAA standard."""
        is_valid, ratio = validate_contrast("#000000", "#FFFFFF", 7.0)
        assert is_valid is True
        assert ratio >= 7.0


class TestThemeValidation:
    """Test complete theme validation."""
    
    def test_valid_theme(self):
        """Test validation of valid theme."""
        is_valid, errors = validate_theme_colors(
            primary="#912b48",
            secondary="#ffffff",
            background="#fff0f3",
            foreground="#610027"
        )
        assert is_valid is True
        assert len(errors) == 0
    
    def test_invalid_hex_format(self):
        """Test validation with invalid hex format."""
        is_valid, errors = validate_theme_colors(
            primary="invalid",
            secondary="#ffffff",
            background="#fff0f3",
            foreground="#610027"
        )
        assert is_valid is False
        assert any("Invalid hex format" in error for error in errors)
    
    def test_insufficient_contrast(self):
        """Test validation with insufficient contrast."""
        is_valid, errors = validate_theme_colors(
            primary="#912b48",
            secondary="#ffffff",
            background="#ffffff",  # White background
            foreground="#ffffff"   # White text - no contrast!
        )
        assert is_valid is False
        assert any("Insufficient contrast" in error for error in errors)
    
    def test_identical_colors(self):
        """Test validation with identical colors."""
        is_valid, errors = validate_theme_colors(
            primary="#ffffff",
            secondary="#ffffff",
            background="#ffffff",
            foreground="#ffffff"
        )
        assert is_valid is False
        assert any("must be different" in error for error in errors)
    
    def test_valid_theme_with_optional_colors(self):
        """Test validation with optional colors."""
        is_valid, errors = validate_theme_colors(
            primary="#912b48",
            secondary="#ffffff",
            background="#fff0f3",
            foreground="#610027",
            accent="#b45a69",
            danger="#ef4444",
            success="#22c55e",
            warning="#f59e0b"
        )
        assert is_valid is True
        assert len(errors) == 0
    
    def test_invalid_optional_color(self):
        """Test validation with invalid optional color."""
        is_valid, errors = validate_theme_colors(
            primary="#912b48",
            secondary="#ffffff",
            background="#fff0f3",
            foreground="#610027",
            accent="invalid"
        )
        assert is_valid is False
        assert any("Invalid hex format for accent" in error for error in errors)


class TestEdgeCases:
    """Test edge cases and boundary conditions."""
    
    def test_hex_case_insensitive(self):
        """Test that hex validation is case-insensitive."""
        assert is_valid_hex("#ff5733") is True
        assert is_valid_hex("#FF5733") is True
        assert is_valid_hex("#Ff5733") is True
    
    def test_normalize_preserves_uppercase(self):
        """Test that normalization converts to uppercase."""
        assert normalize_hex("#ff5733") == "#FF5733"
        assert normalize_hex("ff5733") == "#FF5733"
    
    def test_contrast_ratio_symmetric(self):
        """Test that contrast ratio is symmetric."""
        ratio1 = contrast_ratio("#000000", "#FFFFFF")
        ratio2 = contrast_ratio("#FFFFFF", "#000000")
        assert abs(ratio1 - ratio2) < 0.01
    
    def test_theme_validation_with_none_optional(self):
        """Test theme validation with None for optional colors."""
        is_valid, errors = validate_theme_colors(
            primary="#912b48",
            secondary="#ffffff",
            background="#fff0f3",
            foreground="#610027",
            accent=None,
            danger=None,
            success=None,
            warning=None
        )
        assert is_valid is True
        assert len(errors) == 0
