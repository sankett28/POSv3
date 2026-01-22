"""
Unit tests for OnboardingService.

Tests the onboarding service methods including cache integration.
"""
import pytest
from unittest.mock import Mock, AsyncMock, patch
from app.services.onboarding_service import OnboardingService


class TestOnboardingService:
    """Test suite for OnboardingService."""
    
    @pytest.fixture
    def mock_db(self):
        """Create a mock database client."""
        db = Mock()
        db.table = Mock(return_value=db)
        db.update = Mock(return_value=db)
        db.eq = Mock(return_value=db)
        db.execute = Mock(return_value=Mock(data=[{'id': 'test-id'}]))
        return db
    
    @pytest.fixture
    def mock_cache(self):
        """Create a mock cache service."""
        cache = Mock()
        cache.build_key = Mock(return_value='test:key')
        cache.invalidate = Mock(return_value=True)
        cache.get = Mock(return_value=None)
        cache.set = Mock(return_value=True)
        return cache
    
    @pytest.fixture
    def onboarding_service(self, mock_db, mock_cache):
        """Create an OnboardingService instance with mocked dependencies."""
        return OnboardingService(mock_db, mock_cache)
    
    def test_init_accepts_cache_service(self, mock_db, mock_cache):
        """Test that OnboardingService __init__ accepts CacheService."""
        service = OnboardingService(mock_db, mock_cache)
        
        assert service.db == mock_db
        assert service.cache == mock_cache
        assert service.business_service is not None
        assert service.config_service is not None
        assert service.theme_service is not None
    
    @pytest.mark.asyncio
    async def test_complete_onboarding_creates_business(self, onboarding_service, mock_db):
        """Test that complete_onboarding creates a business record."""
        # Mock the business service
        with patch.object(
            onboarding_service.business_service,
            'create_business',
            new_callable=AsyncMock
        ) as mock_create_business:
            mock_create_business.return_value = {'id': 'business-123'}
            
            # Mock the config service
            with patch.object(
                onboarding_service.config_service,
                'create_configuration',
                new_callable=AsyncMock
            ) as mock_create_config:
                mock_create_config.return_value = {'id': 'config-123'}
                
                # Mock the theme service
                with patch.object(
                    onboarding_service.theme_service,
                    'create_theme',
                    new_callable=AsyncMock
                ) as mock_create_theme:
                    mock_create_theme.return_value = {'id': 'theme-123'}
                    
                    # Mock the database update for user
                    mock_db.table.return_value = mock_db
                    mock_db.update.return_value = mock_db
                    mock_db.eq.return_value = mock_db
                    mock_db.execute.return_value = Mock(data=[{'id': 'user-123'}])
                    
                    # Call complete_onboarding
                    result = await onboarding_service.complete_onboarding(
                        user_id='user-123',
                        business_data={'name': 'Test Business'},
                        config_data={
                            'business_type': 'cafe',
                            'revenue_range': '10l-50l',
                            'has_gst': True
                        },
                        theme_data={'theme_mode': 'light'}
                    )
                    
                    # Verify business was created
                    mock_create_business.assert_called_once()
                    assert result['business_id'] == 'business-123'
    
    @pytest.mark.asyncio
    async def test_complete_onboarding_invalidates_cache(
        self,
        onboarding_service,
        mock_cache,
        mock_db
    ):
        """Test that complete_onboarding invalidates user cache."""
        # Mock all the service methods
        with patch.object(
            onboarding_service.business_service,
            'create_business',
            new_callable=AsyncMock
        ) as mock_create_business:
            mock_create_business.return_value = {'id': 'business-123'}
            
            with patch.object(
                onboarding_service.config_service,
                'create_configuration',
                new_callable=AsyncMock
            ):
                with patch.object(
                    onboarding_service.theme_service,
                    'create_theme',
                    new_callable=AsyncMock
                ):
                    # Mock the database update
                    mock_db.table.return_value = mock_db
                    mock_db.update.return_value = mock_db
                    mock_db.eq.return_value = mock_db
                    mock_db.execute.return_value = Mock(data=[{'id': 'user-123'}])
                    
                    # Call complete_onboarding
                    await onboarding_service.complete_onboarding(
                        user_id='user-123',
                        business_data={'name': 'Test Business'},
                        config_data={
                            'business_type': 'cafe',
                            'revenue_range': '10l-50l',
                            'has_gst': True
                        },
                        theme_data={'theme_mode': 'light'}
                    )
                    
                    # Verify cache was invalidated
                    mock_cache.build_key.assert_called_with('user', 'user-123')
                    mock_cache.invalidate.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_update_business_config_invalidates_cache(
        self,
        onboarding_service,
        mock_cache,
        mock_db
    ):
        """Test that update_business_config invalidates config cache."""
        # Mock the database update
        mock_db.table.return_value = mock_db
        mock_db.update.return_value = mock_db
        mock_db.eq.return_value = mock_db
        mock_db.execute.return_value = Mock(data=[{'id': 'config-123'}])
        
        # Call update_business_config
        result = await onboarding_service.update_business_config(
            business_id='business-123',
            config_data={'service_charge': 'yes'}
        )
        
        # Verify cache was invalidated
        mock_cache.build_key.assert_called_with('business', 'business-123', 'config')
        mock_cache.invalidate.assert_called_once()
        assert result['id'] == 'config-123'
    
    @pytest.mark.asyncio
    async def test_update_theme_invalidates_cache(
        self,
        onboarding_service,
        mock_cache,
        mock_db
    ):
        """Test that update_theme invalidates theme cache."""
        # Mock the database update
        mock_db.table.return_value = mock_db
        mock_db.update.return_value = mock_db
        mock_db.eq.return_value = mock_db
        mock_db.execute.return_value = Mock(data=[{'id': 'theme-123'}])
        
        # Call update_theme
        result = await onboarding_service.update_theme(
            business_id='business-123',
            theme_data={'primary_color': '#ff0000'}
        )
        
        # Verify cache was invalidated
        mock_cache.build_key.assert_called_with('business', 'business-123', 'theme')
        mock_cache.invalidate.assert_called_once()
        assert result['id'] == 'theme-123'
    
    @pytest.mark.asyncio
    async def test_complete_onboarding_updates_user_onboarding_completed(
        self,
        onboarding_service,
        mock_db
    ):
        """Test that complete_onboarding sets user.onboarding_completed to True."""
        # Mock all the service methods
        with patch.object(
            onboarding_service.business_service,
            'create_business',
            new_callable=AsyncMock
        ) as mock_create_business:
            mock_create_business.return_value = {'id': 'business-123'}
            
            with patch.object(
                onboarding_service.config_service,
                'create_configuration',
                new_callable=AsyncMock
            ):
                with patch.object(
                    onboarding_service.theme_service,
                    'create_theme',
                    new_callable=AsyncMock
                ):
                    # Mock the database update
                    mock_db.table.return_value = mock_db
                    mock_db.update.return_value = mock_db
                    mock_db.eq.return_value = mock_db
                    mock_db.execute.return_value = Mock(data=[{'id': 'user-123'}])
                    
                    # Call complete_onboarding
                    await onboarding_service.complete_onboarding(
                        user_id='user-123',
                        business_data={'name': 'Test Business'},
                        config_data={
                            'business_type': 'cafe',
                            'revenue_range': '10l-50l',
                            'has_gst': True
                        },
                        theme_data={'theme_mode': 'light'}
                    )
                    
                    # Verify user update was called with onboarding_completed=True
                    mock_db.table.assert_any_call('users')
                    mock_db.update.assert_called_with({'onboarding_completed': True})
                    mock_db.eq.assert_called_with('id', 'user-123')
