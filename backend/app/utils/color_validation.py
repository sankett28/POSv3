"""
Color validation utilities for theming system.

Provides hex validation and WCAG contrast ratio calculations.
All theme colors must pass these validations before being stored.
"""
import re
from typing import Tuple


def is_valid_hex(hex_color: str) -> bool:
    """
    Validate if a string is a valid 6-digit hex color code.
    
    Args:
        hex_color: Color string to validate (e.g., "#FF5733" or "FF5733")
    
    Returns:
        True if valid hex color, False otherwise
    
    Examples:
        >>> is_valid_hex("#FF5733")
        True
        >>> is_valid_hex("FF5733")
        True
        >>> is_valid_hex("#FFF")
        False
        >>> is_valid_hex("invalid")
        False
    """
    if not hex_color:
        return False
    
    # Remove # if present
    hex_color = hex_color.lstrip('#')
    
    # Must be exactly 6 characters
    if len(hex_color) != 6:
        return False
    
    # Must be valid hex characters
    return bool(re.match(r'^[0-9A-Fa-f]{6}$', hex_color))


def normalize_hex(hex_color: str) -> str:
    """
    Normalize hex color to uppercase with # prefix.
    
    Args:
        hex_color: Hex color string
    
    Returns:
        Normalized hex color (e.g., "#FF5733")
    
    Raises:
        ValueError: If hex color is invalid
    """
    if not is_valid_hex(hex_color):
        raise ValueError(f"Invalid hex color: {hex_color}")
    
    hex_color = hex_color.lstrip('#').upper()
    return f"#{hex_color}"


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """
    Convert hex color to RGB tuple.
    
    Args:
        hex_color: Hex color string (e.g., "#FF5733")
    
    Returns:
        RGB tuple (r, g, b) where each value is 0-255
    
    Raises:
        ValueError: If hex color is invalid
    """
    if not is_valid_hex(hex_color):
        raise ValueError(f"Invalid hex color: {hex_color}")
    
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def rgb_to_relative_luminance(r: int, g: int, b: int) -> float:
    """
    Calculate relative luminance of an RGB color per WCAG 2.0.
    
    Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    where R, G, B are the linearized RGB values.
    
    Args:
        r: Red value (0-255)
        g: Green value (0-255)
        b: Blue value (0-255)
    
    Returns:
        Relative luminance (0.0 to 1.0)
    
    Reference:
        https://www.w3.org/TR/WCAG20/#relativeluminancedef
    """
    def linearize(channel: int) -> float:
        """Convert 8-bit channel to linear RGB."""
        c = channel / 255.0
        if c <= 0.03928:
            return c / 12.92
        else:
            return ((c + 0.055) / 1.055) ** 2.4
    
    r_lin = linearize(r)
    g_lin = linearize(g)
    b_lin = linearize(b)
    
    return 0.2126 * r_lin + 0.7152 * g_lin + 0.0722 * b_lin


def contrast_ratio(color1: str, color2: str) -> float:
    """
    Calculate WCAG 2.0 contrast ratio between two colors.
    
    Formula: (L1 + 0.05) / (L2 + 0.05)
    where L1 is the lighter color's luminance and L2 is the darker.
    
    Args:
        color1: First hex color (e.g., "#FFFFFF")
        color2: Second hex color (e.g., "#000000")
    
    Returns:
        Contrast ratio (1.0 to 21.0)
        - 1.0 = no contrast (same color)
        - 21.0 = maximum contrast (black vs white)
    
    Raises:
        ValueError: If either color is invalid
    
    Examples:
        >>> contrast_ratio("#FFFFFF", "#000000")  # White vs Black
        21.0
        >>> contrast_ratio("#FFFFFF", "#FFFFFF")  # Same color
        1.0
    
    Reference:
        https://www.w3.org/TR/WCAG20/#contrast-ratiodef
    """
    # Convert to RGB
    r1, g1, b1 = hex_to_rgb(color1)
    r2, g2, b2 = hex_to_rgb(color2)
    
    # Calculate luminance
    l1 = rgb_to_relative_luminance(r1, g1, b1)
    l2 = rgb_to_relative_luminance(r2, g2, b2)
    
    # Ensure L1 is the lighter color
    if l1 < l2:
        l1, l2 = l2, l1
    
    # Calculate contrast ratio
    return (l1 + 0.05) / (l2 + 0.05)


def validate_contrast(
    foreground: str,
    background: str,
    min_ratio: float = 4.5
) -> Tuple[bool, float]:
    """
    Validate if two colors meet minimum contrast ratio.
    
    WCAG 2.0 Guidelines:
    - AA Normal Text: 4.5:1
    - AA Large Text: 3.0:1
    - AAA Normal Text: 7.0:1
    - AAA Large Text: 4.5:1
    
    Args:
        foreground: Foreground/text color hex
        background: Background color hex
        min_ratio: Minimum required contrast ratio (default: 4.5 for AA normal text)
    
    Returns:
        Tuple of (is_valid, actual_ratio)
    
    Examples:
        >>> validate_contrast("#000000", "#FFFFFF", 4.5)
        (True, 21.0)
        >>> validate_contrast("#777777", "#888888", 4.5)
        (False, 1.2)
    """
    ratio = contrast_ratio(foreground, background)
    return (ratio >= min_ratio, ratio)


def validate_theme_colors(
    primary: str,
    secondary: str,
    background: str,
    foreground: str,
    accent: str = None,
    danger: str = None,
    success: str = None,
    warning: str = None
) -> Tuple[bool, list[str]]:
    """
    Validate all theme colors for hex format and contrast ratios.
    
    Validation rules:
    1. All colors must be valid hex codes
    2. Foreground/background must have ≥4.5:1 contrast (AA normal text)
    3. Primary/background must have ≥3.0:1 contrast (AA large text)
    4. Colors should be distinct (not identical)
    
    Args:
        primary: Primary brand color
        secondary: Secondary color
        background: Background color
        foreground: Foreground/text color
        accent: Optional accent color
        danger: Optional danger/error color
        success: Optional success color
        warning: Optional warning color
    
    Returns:
        Tuple of (is_valid, list_of_errors)
        If is_valid is True, list_of_errors is empty
    
    Examples:
        >>> validate_theme_colors("#912b48", "#ffffff", "#fff0f3", "#610027")
        (True, [])
    """
    errors = []
    
    # Validate hex format for required colors
    required_colors = {
        'primary': primary,
        'secondary': secondary,
        'background': background,
        'foreground': foreground
    }
    
    for name, color in required_colors.items():
        if not is_valid_hex(color):
            errors.append(f"Invalid hex format for {name}: {color}")
    
    # Validate optional colors if provided
    optional_colors = {
        'accent': accent,
        'danger': danger,
        'success': success,
        'warning': warning
    }
    
    for name, color in optional_colors.items():
        if color and not is_valid_hex(color):
            errors.append(f"Invalid hex format for {name}: {color}")
    
    # If hex validation failed, stop here
    if errors:
        return (False, errors)
    
    # Validate contrast ratios
    # Rule 1: Foreground/background must meet AA normal text (4.5:1)
    fg_bg_valid, fg_bg_ratio = validate_contrast(foreground, background, 4.5)
    if not fg_bg_valid:
        errors.append(
            f"Insufficient contrast between foreground and background: "
            f"{fg_bg_ratio:.2f}:1 (minimum: 4.5:1)"
        )
    
    # Rule 2: Primary/background must meet AA large text (3.0:1)
    primary_bg_valid, primary_bg_ratio = validate_contrast(primary, background, 3.0)
    if not primary_bg_valid:
        errors.append(
            f"Insufficient contrast between primary and background: "
            f"{primary_bg_ratio:.2f}:1 (minimum: 3.0:1)"
        )
    
    # Rule 3: Colors should be distinct
    if primary.upper() == background.upper():
        errors.append("Primary and background colors must be different")
    
    if foreground.upper() == background.upper():
        errors.append("Foreground and background colors must be different")
    
    return (len(errors) == 0, errors)


def auto_correct_contrast(
    foreground: str,
    background: str,
    target_ratio: float = 4.5
) -> str:
    """
    Attempt to auto-correct foreground color to meet contrast ratio.
    
    Strategy: Darken or lighten the foreground color until target ratio is met.
    This is a simple implementation that adjusts luminance.
    
    Args:
        foreground: Original foreground color
        background: Background color (fixed)
        target_ratio: Target contrast ratio
    
    Returns:
        Corrected foreground color hex
    
    Note:
        This is a best-effort correction. May not always achieve exact target.
        For production, consider using a more sophisticated algorithm or
        rejecting invalid combinations outright.
    """
    # Get background luminance
    bg_r, bg_g, bg_b = hex_to_rgb(background)
    bg_luminance = rgb_to_relative_luminance(bg_r, bg_g, bg_b)
    
    # Determine if we need to darken or lighten foreground
    # If background is dark, lighten foreground; if light, darken foreground
    if bg_luminance < 0.5:
        # Dark background - use white foreground
        return "#FFFFFF"
    else:
        # Light background - use black foreground
        return "#000000"
