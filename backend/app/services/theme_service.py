"""
Service layer for theme management.

Handles business logic, validation, and orchestration.
This is the authoritative layer - all LLM suggestions pass through here.
"""
from typing import Optional, Tuple
from app.repositories.theme_repo import ThemeRepository
from app.schemas.theme import (
    ThemeCreate,
    ThemeUpdate,
    ThemeResponse,
    ThemePublic,
    ThemeValidationResult
)
from app.utils.color_validation import (
    validate_theme_colors,
    contrast_ratio,
    auto_correct_contrast
)
from app.core.logging import logger


class ThemeService:
    """Service for theme business logic and validation."""
    
    def __init__(self, theme_repo: ThemeRepository):
        """
        Initialize theme service.
        
        Args:
            theme_repo: Theme repository instance
        """
        self.theme_repo = theme_repo
    
    async def get_theme(self, business_id: str) -> ThemePublic:
        """
        Get theme for a business in public format.
        
        Returns empty object if no theme exists (frontend uses defaults).
        
        Args:
            business_id: Business UUID
        
        Returns:
            ThemePublic (empty if no theme)
        """
        theme = await self.theme_repo.get_theme_by_business_id(business_id)
        return ThemePublic.from_theme_response(theme)
    
    async def validate_theme(self, theme: ThemeCreate) -> ThemeValidationResult:
        """
        Validate theme colors for hex format and contrast ratios.
        
        This is the authoritative validation that all themes must pass.
        
        Args:
            theme: Theme to validate
        
        Returns:
            ThemeValidationResult with validation status and details
        """
        is_valid, errors = validate_theme_colors(
            primary=theme.primary_color,
            secondary=theme.secondary_color,
            background=theme.background_color,
            foreground=theme.foreground_color,
            accent=theme.accent_color,
            danger=theme.danger_color,
            success=theme.success_color,
            warning=theme.warning_color
        )
        
        # Calculate contrast ratios for reporting
        contrast_ratios = {}
        try:
            contrast_ratios['foreground_background'] = contrast_ratio(
                theme.foreground_color,
                theme.background_color
            )
            contrast_ratios['primary_background'] = contrast_ratio(
                theme.primary_color,
                theme.background_color
            )
        except Exception as e:
            logger.warning(f"Error calculating contrast ratios: {e}")
        
        # Generate warnings for borderline cases
        warnings = []
        if contrast_ratios.get('foreground_background', 0) < 7.0:
            warnings.append(
                "Foreground/background contrast is below AAA standard (7:1). "
                "Consider increasing contrast for better accessibility."
            )
        
        return ThemeValidationResult(
            is_valid=is_valid,
            errors=errors,
            warnings=warnings,
            contrast_ratios=contrast_ratios
        )
    
    async def create_or_update_theme(
        self,
        business_id: str,
        theme: ThemeCreate,
        changed_by_email: str = None,
        ip_address: str = None,
        auto_correct: bool = False
    ) -> Tuple[ThemeResponse, ThemeValidationResult]:
        """
        Create or update theme with validation.
        
        This is the main entry point for theme creation/updates.
        All themes (manual or LLM-generated) go through this method.
        
        Args:
            business_id: Business UUID
            theme: Theme data
            changed_by_email: Email of user making change
            ip_address: IP address of request
            auto_correct: If True, attempt to auto-correct invalid colors
        
        Returns:
            Tuple of (ThemeResponse, ThemeValidationResult)
        
        Raises:
            ValueError: If theme validation fails and auto_correct is False
        """
        # Validate theme
        validation_result = await self.validate_theme(theme)
        
        if not validation_result.is_valid:
            if auto_correct:
                # Attempt auto-correction
                logger.warning(
                    f"Theme validation failed for business {business_id}. "
                    f"Attempting auto-correction. Errors: {validation_result.errors}"
                )
                theme = await self._auto_correct_theme(theme)
                
                # Re-validate after correction
                validation_result = await self.validate_theme(theme)
                
                if not validation_result.is_valid:
                    raise ValueError(
                        f"Theme validation failed even after auto-correction: "
                        f"{', '.join(validation_result.errors)}"
                    )
            else:
                raise ValueError(
                    f"Theme validation failed: {', '.join(validation_result.errors)}"
                )
        
        # Validation passed - save theme
        theme_response = await self.theme_repo.upsert_theme(
            business_id=business_id,
            theme=theme,
            changed_by_email=changed_by_email,
            ip_address=ip_address
        )
        
        logger.info(
            f"Successfully saved theme for business {business_id}. "
            f"Source: {theme.source}"
        )
        
        return (theme_response, validation_result)
    
    async def update_theme_partial(
        self,
        business_id: str,
        theme_update: ThemeUpdate,
        changed_by_email: str = None,
        ip_address: str = None
    ) -> Tuple[ThemeResponse, ThemeValidationResult]:
        """
        Partially update theme (only specified fields).
        
        Validates the complete theme after applying updates.
        
        Args:
            business_id: Business UUID
            theme_update: Fields to update
            changed_by_email: Email of user making change
            ip_address: IP address of request
        
        Returns:
            Tuple of (ThemeResponse, ThemeValidationResult)
        
        Raises:
            ValueError: If theme not found or validation fails
        """
        # Get current theme
        current_theme = await self.theme_repo.get_theme_by_business_id(business_id)
        if not current_theme:
            raise ValueError(f"Theme not found for business {business_id}")
        
        # Apply updates to create complete theme for validation
        updated_theme = ThemeCreate(
            primary_color=theme_update.primary_color or current_theme.primary_color,
            secondary_color=theme_update.secondary_color or current_theme.secondary_color,
            background_color=theme_update.background_color or current_theme.background_color,
            foreground_color=theme_update.foreground_color or current_theme.foreground_color,
            accent_color=theme_update.accent_color or current_theme.accent_color,
            danger_color=theme_update.danger_color or current_theme.danger_color,
            success_color=theme_update.success_color or current_theme.success_color,
            warning_color=theme_update.warning_color or current_theme.warning_color,
            source=current_theme.source
        )
        
        # Validate complete theme
        validation_result = await self.validate_theme(updated_theme)
        
        if not validation_result.is_valid:
            raise ValueError(
                f"Theme validation failed: {', '.join(validation_result.errors)}"
            )
        
        # Update theme
        theme_response = await self.theme_repo.update_theme(
            business_id=business_id,
            theme_update=theme_update,
            changed_by_email=changed_by_email,
            ip_address=ip_address
        )
        
        return (theme_response, validation_result)
    
    async def delete_theme(
        self,
        business_id: str,
        changed_by_email: str = None,
        ip_address: str = None
    ) -> bool:
        """
        Delete theme for a business.
        
        Args:
            business_id: Business UUID
            changed_by_email: Email of user deleting theme
            ip_address: IP address of request
        
        Returns:
            True if deleted, False if not found
        """
        return await self.theme_repo.delete_theme(
            business_id=business_id,
            changed_by_email=changed_by_email,
            ip_address=ip_address
        )
    
    async def _auto_correct_theme(self, theme: ThemeCreate) -> ThemeCreate:
        """
        Attempt to auto-correct invalid theme colors.
        
        Strategy:
        1. Fix foreground/background contrast if insufficient
        2. Fix primary/background contrast if insufficient
        
        Args:
            theme: Theme with potential issues
        
        Returns:
            Corrected ThemeCreate
        """
        corrected_theme = theme.model_copy()
        
        # Check foreground/background contrast
        fg_bg_ratio = contrast_ratio(theme.foreground_color, theme.background_color)
        if fg_bg_ratio < 4.5:
            logger.info(
                f"Auto-correcting foreground color. "
                f"Original contrast: {fg_bg_ratio:.2f}:1"
            )
            corrected_theme.foreground_color = auto_correct_contrast(
                theme.foreground_color,
                theme.background_color,
                target_ratio=4.5
            )
        
        # Check primary/background contrast
        primary_bg_ratio = contrast_ratio(theme.primary_color, theme.background_color)
        if primary_bg_ratio < 3.0:
            logger.info(
                f"Auto-correcting primary color. "
                f"Original contrast: {primary_bg_ratio:.2f}:1"
            )
            # For primary, we can't just use black/white - keep original for now
            # In production, implement more sophisticated color adjustment
            logger.warning(
                "Primary color contrast too low but auto-correction not implemented. "
                "Consider manual adjustment."
            )
        
        return corrected_theme
