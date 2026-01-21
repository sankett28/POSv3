"""
Unit tests for theme service.

Tests theme creation for onboarding flow, including conditional branding
field storage and validation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.theme_service import ThemeService
from app.schemas.theme import ThemeResponse, ThemeValidationResult
from datetime import datetime


class TestThemeCreation:
    """Test theme creation for onboarding."""
    
    @pytest.mark.asyncio
    async def test_create_theme_manual_success(self):
        """Test successful manual theme creation."""
        mock_repo = AsyncMock()
        
        # Mock validation result
        mock_validation = ThemeValidationResult(
            is_valid=True,
            errors=[],
            warnings=[],
            contrast_ratios={'foreground_background': 7.5}
        )
        
        # Mock repository response
        mock_theme = ThemeResponse(
            id='theme-123',
            business_id='business-123',
            primary_color='#912b48',
            secondary_color='#ffffff',
            background_color='#fff0f3',
            foreground_color='#610027',
            accent_color='#b45a69',
            danger_color='#ef4444',
            success_color='#22c55e',
            warning_color='#f59e0b',
            source='manual',
            source_url=None,
            is_validated=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create_theme.return_value = mock_theme
        
        service = ThemeService(theme_repo=mock_repo)
        
        # Mock validate_theme method
        service.validate_theme = AsyncMock(return_value=mock_validation)
        
        theme = await service.create_theme(
            business_id='business-123',
            theme_mode='light',
            primary_color='#912b48',
            secondary_color='#ffffff',
            background_color='#fff0f3',
            foreground_color='#610027',
            branding_choice='manual'
        )
        
        assert theme.id == 'theme-123'
        assert theme.business_id == 'business-123'
        assert theme.primary_color == '#912B48'  # Normalized to uppercase
        assert theme.source == 'manual'
        assert theme.source_url is None
        
        # Verify repository was called correctly
        mock_repo.create_theme.assert_called_once()
        call_args = mock_repo.create_theme.call_args
        assert call_args.kwargs['business_id'] == 'business-123'
    
    @pytest.mark.asyncio
    async def test_create_theme_url_branding(self):
        """Test theme creation with URL-based branding."""
        mock_repo = AsyncMock()
        
        # Mock validation result
        mock_validation = ThemeValidationResult(
            is_valid=True,
            errors=[],
            warnings=[],
            contrast_ratios={}
        )
        
        # Mock repository response
        mock_theme = ThemeResponse(
            id='theme-123',
            business_id='business-123',
            primary_color='#912b48',
            secondary_color='#ffffff',
            background_color='#ffffff',
            foreground_color='#000000',
            accent_color='#b45a69',
            danger_color='#ef4444',
            success_color='#22c55e',
            warning_color='#f59e0b',
            source='brand_api',
            source_url='https://example.com',
            is_validated=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create_theme.return_value = mock_theme
        
        service = ThemeService(theme_repo=mock_repo)
        service.validate_theme = AsyncMock(return_value=mock_validation)
        
        theme = await service.create_theme(
            business_id='business-123',
            theme_mode='light',
            primary_color='#912b48',
            branding_choice='url',
            website_url='https://example.com'
        )
        
        assert theme.source == 'brand_api'
        assert theme.source_url == 'https://example.com'
    
    @pytest.mark.asyncio
    async def test_create_theme_prompt_branding(self):
        """Test theme creation with prompt-based branding."""
        mock_repo = AsyncMock()
        
        # Mock validation result
        mock_validation = ThemeValidationResult(
            is_valid=True,
            errors=[],
            warnings=[],
            contrast_ratios={}
        )
        
        # Mock repository response
        mock_theme = ThemeResponse(
            id='theme-123',
            business_id='business-123',
            primary_color='#912b48',
            secondary_color='#1a1a1a',
            background_color='#0a0a0a',
            foreground_color='#ffffff',
            accent_color='#b45a69',
            danger_color='#ef4444',
            success_color='#22c55e',
            warning_color='#f59e0b',
            source='auto_generated',
            source_url=None,
            is_validated=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create_theme.return_value = mock_theme
        
        service = ThemeService(theme_repo=mock_repo)
        service.validate_theme = AsyncMock(return_value=mock_validation)
        
        theme = await service.create_theme(
            business_id='business-123',
            theme_mode='dark',
            primary_color='#912b48',
            branding_choice='prompt',
            brand_prompt='Modern coffee shop with warm atmosphere'
        )
        
        assert theme.source == 'auto_generated'
        assert theme.source_url is None
    
    @pytest.mark.asyncio
    async def test_create_theme_missing_business_id(self):
        """Test theme creation fails without business_id."""
        mock_repo = AsyncMock()
        service = ThemeService(theme_repo=mock_repo)
        
        with pytest.raises(ValueError, match="business_id is required"):
            await service.create_theme(
                business_id='',
                theme_mode='light',
                primary_color='#912b48',
                branding_choice='manual'
            )
    
    @pytest.mark.asyncio
    async def test_create_theme_invalid_branding_choice(self):
        """Test theme creation fails with invalid branding_choice."""
        mock_repo = AsyncMock()
        service = ThemeService(theme_repo=mock_repo)
        
        with pytest.raises(ValueError, match="Invalid branding_choice"):
            await service.create_theme(
                business_id='business-123',
                theme_mode='light',
                primary_color='#912b48',
                branding_choice='invalid'
            )
    
    @pytest.mark.asyncio
    async def test_create_theme_url_without_website_url(self):
        """Test theme creation fails when branding_choice is 'url' but website_url is missing."""
        mock_repo = AsyncMock()
        service = ThemeService(theme_repo=mock_repo)
        
        with pytest.raises(ValueError, match="website_url is required"):
            await service.create_theme(
                business_id='business-123',
                theme_mode='light',
                primary_color='#912b48',
                branding_choice='url'
            )
    
    @pytest.mark.asyncio
    async def test_create_theme_prompt_without_brand_prompt(self):
        """Test theme creation fails when branding_choice is 'prompt' but brand_prompt is missing."""
        mock_repo = AsyncMock()
        service = ThemeService(theme_repo=mock_repo)
        
        with pytest.raises(ValueError, match="brand_prompt is required"):
            await service.create_theme(
                business_id='business-123',
                theme_mode='light',
                primary_color='#912b48',
                branding_choice='prompt'
            )
    
    @pytest.mark.asyncio
    async def test_create_theme_validation_failure(self):
        """Test theme creation fails when validation fails."""
        mock_repo = AsyncMock()
        
        # Mock validation failure
        mock_validation = ThemeValidationResult(
            is_valid=False,
            errors=['Primary color contrast too low'],
            warnings=[],
            contrast_ratios={}
        )
        
        service = ThemeService(theme_repo=mock_repo)
        service.validate_theme = AsyncMock(return_value=mock_validation)
        
        with pytest.raises(ValueError, match="Theme validation failed"):
            await service.create_theme(
                business_id='business-123',
                theme_mode='light',
                primary_color='#ffffff',
                background_color='#ffffff',
                branding_choice='manual'
            )
    
    @pytest.mark.asyncio
    async def test_create_theme_default_colors_light_mode(self):
        """Test that default colors are set correctly for light mode."""
        mock_repo = AsyncMock()
        
        # Mock validation result
        mock_validation = ThemeValidationResult(
            is_valid=True,
            errors=[],
            warnings=[],
            contrast_ratios={}
        )
        
        # Mock repository response
        mock_theme = ThemeResponse(
            id='theme-123',
            business_id='business-123',
            primary_color='#912b48',
            secondary_color='#ffffff',
            background_color='#ffffff',
            foreground_color='#000000',
            accent_color='#b45a69',
            danger_color='#ef4444',
            success_color='#22c55e',
            warning_color='#f59e0b',
            source='manual',
            source_url=None,
            is_validated=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create_theme.return_value = mock_theme
        
        service = ThemeService(theme_repo=mock_repo)
        service.validate_theme = AsyncMock(return_value=mock_validation)
        
        theme = await service.create_theme(
            business_id='business-123',
            theme_mode='light',
            primary_color='#912b48',
            branding_choice='manual'
        )
        
        # Verify validate_theme was called with default colors
        call_args = service.validate_theme.call_args
        theme_create = call_args.args[0]
        assert theme_create.secondary_color == '#FFFFFF'  # Normalized to uppercase
        assert theme_create.background_color == '#FFFFFF'
        assert theme_create.foreground_color == '#000000'
    
    @pytest.mark.asyncio
    async def test_create_theme_default_colors_dark_mode(self):
        """Test that default colors are set correctly for dark mode."""
        mock_repo = AsyncMock()
        
        # Mock validation result
        mock_validation = ThemeValidationResult(
            is_valid=True,
            errors=[],
            warnings=[],
            contrast_ratios={}
        )
        
        # Mock repository response
        mock_theme = ThemeResponse(
            id='theme-123',
            business_id='business-123',
            primary_color='#912b48',
            secondary_color='#1a1a1a',
            background_color='#0a0a0a',
            foreground_color='#ffffff',
            accent_color='#b45a69',
            danger_color='#ef4444',
            success_color='#22c55e',
            warning_color='#f59e0b',
            source='manual',
            source_url=None,
            is_validated=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        mock_repo.create_theme.return_value = mock_theme
        
        service = ThemeService(theme_repo=mock_repo)
        service.validate_theme = AsyncMock(return_value=mock_validation)
        
        theme = await service.create_theme(
            business_id='business-123',
            theme_mode='dark',
            primary_color='#912b48',
            branding_choice='manual'
        )
        
        # Verify validate_theme was called with default colors
        call_args = service.validate_theme.call_args
        theme_create = call_args.args[0]
        assert theme_create.secondary_color == '#1A1A1A'  # Normalized to uppercase
        assert theme_create.background_color == '#0A0A0A'
        assert theme_create.foreground_color == '#FFFFFF'
