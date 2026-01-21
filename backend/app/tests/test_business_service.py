"""
Unit tests for business service.

Tests slug generation, collision handling, and business record creation.
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.business_service import BusinessService


class TestSlugGeneration:
    """Test slug generation from business names."""
    
    def test_basic_slug_generation(self):
        """Test basic slug generation with simple names."""
        service = BusinessService(MagicMock())
        
        assert service.generate_slug("My Cafe") == "my-cafe"
        assert service.generate_slug("Joe's Restaurant") == "joes-restaurant"
        assert service.generate_slug("The Coffee Shop") == "the-coffee-shop"
    
    def test_slug_with_special_characters(self):
        """Test slug generation removes special characters."""
        service = BusinessService(MagicMock())
        
        assert service.generate_slug("Café & Bistro") == "cafe-bistro"
        assert service.generate_slug("Pizza! Pizza!") == "pizza-pizza"
        assert service.generate_slug("100% Organic") == "100-organic"
    
    def test_slug_with_multiple_spaces(self):
        """Test slug generation handles multiple spaces."""
        service = BusinessService(MagicMock())
        
        assert service.generate_slug("My   Cafe") == "my-cafe"
        assert service.generate_slug("The  Best  Restaurant") == "the-best-restaurant"
    
    def test_slug_with_leading_trailing_spaces(self):
        """Test slug generation handles leading/trailing spaces."""
        service = BusinessService(MagicMock())
        
        assert service.generate_slug("  My Cafe  ") == "my-cafe"
        assert service.generate_slug("  Restaurant  ") == "restaurant"
    
    def test_slug_with_numbers(self):
        """Test slug generation preserves numbers."""
        service = BusinessService(MagicMock())
        
        assert service.generate_slug("Cafe 123") == "cafe-123"
        assert service.generate_slug("24/7 Store") == "247-store"
    
    def test_slug_with_unicode(self):
        """Test slug generation handles unicode characters."""
        service = BusinessService(MagicMock())
        
        # Unicode characters should be normalized to ASCII equivalents
        assert service.generate_slug("Café Français") == "cafe-francais"
        assert service.generate_slug("日本料理") == "business"  # Falls back to 'business'
    
    def test_slug_empty_after_cleaning(self):
        """Test slug generation handles names that become empty after cleaning."""
        service = BusinessService(MagicMock())
        
        # Should fall back to 'business'
        assert service.generate_slug("!!!") == "business"
        assert service.generate_slug("@#$%") == "business"
        assert service.generate_slug("   ") == "business"


class TestSlugCollisionHandling:
    """Test slug collision detection and handling."""
    
    @pytest.mark.asyncio
    async def test_check_slug_exists_true(self):
        """Test checking if a slug exists returns True when it does."""
        mock_supabase = MagicMock()
        mock_response = MagicMock()
        mock_response.data = [{'id': '123'}]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        service = BusinessService(mock_supabase)
        exists = await service.check_slug_exists("my-cafe")
        
        assert exists is True
        mock_supabase.table.assert_called_once_with('businesses')
    
    @pytest.mark.asyncio
    async def test_check_slug_exists_false(self):
        """Test checking if a slug exists returns False when it doesn't."""
        mock_supabase = MagicMock()
        mock_response = MagicMock()
        mock_response.data = []
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        service = BusinessService(mock_supabase)
        exists = await service.check_slug_exists("my-cafe")
        
        assert exists is False
    
    @pytest.mark.asyncio
    async def test_generate_unique_slug_no_collision(self):
        """Test generating unique slug when base slug is available."""
        mock_supabase = MagicMock()
        mock_response = MagicMock()
        mock_response.data = []  # Slug doesn't exist
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        service = BusinessService(mock_supabase)
        slug = await service.generate_unique_slug("My Cafe")
        
        assert slug == "my-cafe"
    
    @pytest.mark.asyncio
    async def test_generate_unique_slug_with_collision(self):
        """Test generating unique slug when base slug exists."""
        mock_supabase = MagicMock()
        
        # First call: base slug exists
        # Second call: slug-1 doesn't exist
        mock_responses = [
            MagicMock(data=[{'id': '123'}]),  # Base slug exists
            MagicMock(data=[])  # slug-1 doesn't exist
        ]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = mock_responses
        
        service = BusinessService(mock_supabase)
        slug = await service.generate_unique_slug("My Cafe")
        
        assert slug == "my-cafe-1"
    
    @pytest.mark.asyncio
    async def test_generate_unique_slug_multiple_collisions(self):
        """Test generating unique slug with multiple collisions."""
        mock_supabase = MagicMock()
        
        # Base slug and slug-1 exist, slug-2 doesn't
        mock_responses = [
            MagicMock(data=[{'id': '123'}]),  # Base slug exists
            MagicMock(data=[{'id': '456'}]),  # slug-1 exists
            MagicMock(data=[])  # slug-2 doesn't exist
        ]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = mock_responses
        
        service = BusinessService(mock_supabase)
        slug = await service.generate_unique_slug("My Cafe")
        
        assert slug == "my-cafe-2"
    
    @pytest.mark.asyncio
    async def test_generate_unique_slug_max_attempts_exceeded(self):
        """Test that max attempts limit is enforced."""
        mock_supabase = MagicMock()
        
        # All slugs exist
        mock_response = MagicMock(data=[{'id': '123'}])
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_response
        
        service = BusinessService(mock_supabase)
        
        with pytest.raises(Exception) as exc_info:
            await service.generate_unique_slug("My Cafe", max_attempts=5)
        
        assert "Unable to generate unique slug" in str(exc_info.value)
        assert "after 5 attempts" in str(exc_info.value)


class TestBusinessCreation:
    """Test business record creation."""
    
    @pytest.mark.asyncio
    async def test_create_business_success(self):
        """Test successful business creation."""
        mock_supabase = MagicMock()
        
        # Mock slug check (slug doesn't exist)
        mock_slug_response = MagicMock(data=[])
        
        # Mock business creation
        mock_create_response = MagicMock()
        mock_create_response.data = [{
            'id': '123e4567-e89b-12d3-a456-426614174000',
            'name': 'My Cafe',
            'slug': 'my-cafe',
            'website_url': 'https://mycafe.com',
            'is_active': True,
            'created_at': '2024-01-01T00:00:00Z',
            'updated_at': '2024-01-01T00:00:00Z'
        }]
        
        # Setup mock chain
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_slug_response
        mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_create_response
        
        service = BusinessService(mock_supabase)
        business = await service.create_business(
            name="My Cafe",
            website_url="https://mycafe.com"
        )
        
        assert business['id'] == '123e4567-e89b-12d3-a456-426614174000'
        assert business['name'] == 'My Cafe'
        assert business['slug'] == 'my-cafe'
        assert business['website_url'] == 'https://mycafe.com'
        assert business['is_active'] is True
    
    @pytest.mark.asyncio
    async def test_create_business_without_website(self):
        """Test business creation without website URL."""
        mock_supabase = MagicMock()
        
        # Mock slug check
        mock_slug_response = MagicMock(data=[])
        
        # Mock business creation
        mock_create_response = MagicMock()
        mock_create_response.data = [{
            'id': '123e4567-e89b-12d3-a456-426614174000',
            'name': 'My Cafe',
            'slug': 'my-cafe',
            'is_active': True,
            'created_at': '2024-01-01T00:00:00Z',
            'updated_at': '2024-01-01T00:00:00Z'
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_slug_response
        mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_create_response
        
        service = BusinessService(mock_supabase)
        business = await service.create_business(name="My Cafe")
        
        assert business['name'] == 'My Cafe'
        assert 'website_url' not in business or business.get('website_url') is None
    
    @pytest.mark.asyncio
    async def test_create_business_empty_name(self):
        """Test that empty business name raises ValueError."""
        service = BusinessService(MagicMock())
        
        with pytest.raises(ValueError) as exc_info:
            await service.create_business(name="")
        
        assert "Business name cannot be empty" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_business_whitespace_name(self):
        """Test that whitespace-only business name raises ValueError."""
        service = BusinessService(MagicMock())
        
        with pytest.raises(ValueError) as exc_info:
            await service.create_business(name="   ")
        
        assert "Business name cannot be empty" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_create_business_trims_name(self):
        """Test that business name is trimmed."""
        mock_supabase = MagicMock()
        
        # Mock slug check
        mock_slug_response = MagicMock(data=[])
        
        # Mock business creation
        mock_create_response = MagicMock()
        mock_create_response.data = [{
            'id': '123e4567-e89b-12d3-a456-426614174000',
            'name': 'My Cafe',
            'slug': 'my-cafe',
            'is_active': True,
            'created_at': '2024-01-01T00:00:00Z',
            'updated_at': '2024-01-01T00:00:00Z'
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_slug_response
        mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_create_response
        
        service = BusinessService(mock_supabase)
        business = await service.create_business(name="  My Cafe  ")
        
        assert business['name'] == 'My Cafe'
    
    @pytest.mark.asyncio
    async def test_create_business_with_slug_collision(self):
        """Test business creation when slug collision occurs."""
        mock_supabase = MagicMock()
        
        # Mock slug checks: first exists, second doesn't
        mock_slug_responses = [
            MagicMock(data=[{'id': '999'}]),  # Base slug exists
            MagicMock(data=[])  # slug-1 doesn't exist
        ]
        
        # Mock business creation
        mock_create_response = MagicMock()
        mock_create_response.data = [{
            'id': '123e4567-e89b-12d3-a456-426614174000',
            'name': 'My Cafe',
            'slug': 'my-cafe-1',
            'is_active': True,
            'created_at': '2024-01-01T00:00:00Z',
            'updated_at': '2024-01-01T00:00:00Z'
        }]
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = mock_slug_responses
        mock_supabase.table.return_value.insert.return_value.execute.return_value = mock_create_response
        
        service = BusinessService(mock_supabase)
        business = await service.create_business(name="My Cafe")
        
        assert business['slug'] == 'my-cafe-1'


class TestBusinessRetrieval:
    """Test business record retrieval."""
    
    @pytest.mark.asyncio
    async def test_get_business_by_id_found(self):
        """Test retrieving business by ID when it exists."""
        mock_supabase = MagicMock()
        mock_response = MagicMock()
        mock_response.data = {
            'id': '123e4567-e89b-12d3-a456-426614174000',
            'name': 'My Cafe',
            'slug': 'my-cafe',
            'is_active': True
        }
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        service = BusinessService(mock_supabase)
        business = await service.get_business_by_id('123e4567-e89b-12d3-a456-426614174000')
        
        assert business is not None
        assert business['id'] == '123e4567-e89b-12d3-a456-426614174000'
        assert business['name'] == 'My Cafe'
    
    @pytest.mark.asyncio
    async def test_get_business_by_id_not_found(self):
        """Test retrieving business by ID when it doesn't exist."""
        mock_supabase = MagicMock()
        
        # Simulate Supabase "not found" error
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("PGRST116")
        
        service = BusinessService(mock_supabase)
        business = await service.get_business_by_id('nonexistent-id')
        
        assert business is None
    
    @pytest.mark.asyncio
    async def test_get_business_by_slug_found(self):
        """Test retrieving business by slug when it exists."""
        mock_supabase = MagicMock()
        mock_response = MagicMock()
        mock_response.data = {
            'id': '123e4567-e89b-12d3-a456-426614174000',
            'name': 'My Cafe',
            'slug': 'my-cafe',
            'is_active': True
        }
        
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = mock_response
        
        service = BusinessService(mock_supabase)
        business = await service.get_business_by_slug('my-cafe')
        
        assert business is not None
        assert business['slug'] == 'my-cafe'
        assert business['name'] == 'My Cafe'
    
    @pytest.mark.asyncio
    async def test_get_business_by_slug_not_found(self):
        """Test retrieving business by slug when it doesn't exist."""
        mock_supabase = MagicMock()
        
        # Simulate Supabase "not found" error
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("PGRST116")
        
        service = BusinessService(mock_supabase)
        business = await service.get_business_by_slug('nonexistent-slug')
        
        assert business is None
