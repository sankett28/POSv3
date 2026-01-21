"""
Service layer for theme management.

Handles business logic, validation, and orchestration.
This is the authoritative layer - all LLM suggestions pass through here.
"""
from typing import Optional, Tuple
from supabase import Client
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
    
    def __init__(self, theme_repo: ThemeRepository = None, supabase: Client = None):
        """
        Initialize theme service.
        
        Args:
            theme_repo: Theme repository instance (optional if supabase is provided)
            supabase: Supabase client instance (optional if theme_repo is provided)
        """
        if theme_repo is not None:
            self.theme_repo = theme_repo
        elif supabase is not None:
            self.theme_repo = ThemeRepository(supabase)
        else:
            raise ValueError("Either theme_repo or supabase must be provided")
    
    async def create_theme(
        self,
        business_id: str,
        theme_mode: str,
        primary_color: str,
        secondary_color: Optional[str] = None,
        background_color: Optional[str] = None,
        foreground_color: Optional[str] = None,
        accent_color: Optional[str] = None,
        danger_color: Optional[str] = None,
        success_color: Optional[str] = None,
        warning_color: Optional[str] = None,
        branding_choice: str = 'manual',
        website_url: Optional[str] = None,
        brand_prompt: Optional[str] = None,
        changed_by_email: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> ThemeResponse:
        """
        Create a theme for a business during onboarding.
        
        This function handles conditional branding field storage based on branding_choice:
        - 'url': Stores website_url for theme extraction
        - 'prompt': Stores brand_prompt for AI-based theme generation
        - 'manual': Stores only manually selected theme colors
        
        Args:
            business_id: Business UUID (foreign key to businesses table)
            theme_mode: Theme mode ('light' or 'dark')
            primary_color: Primary brand color (hex, required)
            secondary_color: Secondary color (hex, optional)
            background_color: Background color (hex, optional)
            foreground_color: Foreground/text color (hex, optional)
            accent_color: Accent color (hex, optional)
            danger_color: Danger/error color (hex, optional)
            success_color: Success color (hex, optional)
            warning_color: Warning color (hex, optional)
            branding_choice: How branding was chosen ('url', 'prompt', 'manual')
            website_url: Website URL (stored when branding_choice is 'url')
            brand_prompt: Brand description (stored when branding_choice is 'prompt')
            changed_by_email: Email of user creating theme (for audit)
            ip_address: IP address of request (for audit)
        
        Returns:
            ThemeResponse containing the created theme record
        
        Raises:
            ValueError: If required fields are missing or validation fails
            Exception: If database operation fails
        
        Examples:
            >>> service = ThemeService(theme_repo)
            >>> # Manual theme selection
            >>> theme = await service.create_theme(
            ...     business_id="123e4567-e89b-12d3-a456-426614174000",
            ...     theme_mode="light",
            ...     primary_color="#912b48",
            ...     secondary_color="#ffffff",
            ...     background_color="#fff0f3",
            ...     foreground_color="#610027",
            ...     branding_choice="manual"
            ... )
            >>> 
            >>> # URL-based theme
            >>> theme = await service.create_theme(
            ...     business_id="123e4567-e89b-12d3-a456-426614174000",
            ...     theme_mode="light",
            ...     primary_color="#912b48",
            ...     branding_choice="url",
            ...     website_url="https://example.com"
            ... )
            >>> 
            >>> # Prompt-based theme
            >>> theme = await service.create_theme(
            ...     business_id="123e4567-e89b-12d3-a456-426614174000",
            ...     theme_mode="dark",
            ...     primary_color="#912b48",
            ...     branding_choice="prompt",
            ...     brand_prompt="Modern coffee shop with warm, inviting atmosphere"
            ... )
        
        Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
        """
        # Validate business_id
        if not business_id:
            raise ValueError("business_id is required")
        
        # Validate branding_choice
        valid_branding_choices = ['url', 'prompt', 'manual']
        if branding_choice not in valid_branding_choices:
            raise ValueError(
                f"Invalid branding_choice '{branding_choice}'. "
                f"Must be one of: {', '.join(valid_branding_choices)}"
            )
        
        # Set default colors based on theme_mode if not provided
        if secondary_color is None:
            secondary_color = "#ffffff" if theme_mode == "light" else "#1a1a1a"
        
        if background_color is None:
            background_color = "#ffffff" if theme_mode == "light" else "#0a0a0a"
        
        if foreground_color is None:
            foreground_color = "#000000" if theme_mode == "light" else "#ffffff"
        
        # Set default optional colors if not provided
        if accent_color is None:
            accent_color = "#b45a69"  # Default accent
        
        if danger_color is None:
            danger_color = "#ef4444"  # Default error red
        
        if success_color is None:
            success_color = "#22c55e"  # Default success green
        
        if warning_color is None:
            warning_color = "#f59e0b"  # Default warning orange
        
        # Determine source based on branding_choice
        source = 'manual'
        source_url = None
        
        if branding_choice == 'url':
            source = 'brand_api'
            source_url = website_url
            if not website_url:
                raise ValueError("website_url is required when branding_choice is 'url'")
        elif branding_choice == 'prompt':
            source = 'auto_generated'
            # brand_prompt is stored in business_configurations, not in theme
            if not brand_prompt:
                raise ValueError("brand_prompt is required when branding_choice is 'prompt'")
        
        try:
            # Create theme schema
            theme_create = ThemeCreate(
                primary_color=primary_color,
                secondary_color=secondary_color,
                background_color=background_color,
                foreground_color=foreground_color,
                accent_color=accent_color,
                danger_color=danger_color,
                success_color=success_color,
                warning_color=warning_color,
                source=source,
                source_url=source_url
            )
            
            # Validate theme colors
            validation_result = await self.validate_theme(theme_create)
            
            if not validation_result.is_valid:
                raise ValueError(
                    f"Theme validation failed: {', '.join(validation_result.errors)}"
                )
            
            # Create theme via repository
            created_theme = await self.theme_repo.create_theme(
                business_id=business_id,
                theme=theme_create,
                changed_by_email=changed_by_email,
                ip_address=ip_address
            )
            
            logger.info(
                f"Created theme for business {business_id} during onboarding "
                f"(branding_choice: {branding_choice}, source: {source})"
            )
            
            return created_theme
        
        except ValueError:
            # Re-raise validation errors as-is
            raise
        
        except Exception as e:
            logger.error(
                f"Error creating theme for business {business_id}: {e}"
            )
            # Check if it's an RLS policy violation
            error_str = str(e).lower()
            if 'policy' in error_str or '403' in error_str or 'permission' in error_str:
                raise PermissionError(
                    "Permission denied: Unable to create theme. "
                    "Please ensure you own this business."
                )
            raise
    
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
