"""
Service layer for business management.

Handles business logic for creating and managing business records,
including slug generation and collision handling.
"""
import re
import unicodedata
from typing import Optional
from supabase import Client
from app.core.logging import logger


class BusinessService:
    """Service for business record creation and management."""
    
    def __init__(self, supabase: Client):
        """
        Initialize business service.
        
        Args:
            supabase: Supabase client instance (with service role)
        """
        self.supabase = supabase
    
    def generate_slug(self, business_name: str) -> str:
        """
        Generate a URL-safe slug from a business name.
        
        Converts the business name to lowercase and replaces spaces with hyphens.
        Removes any characters that are not lowercase letters, numbers, or hyphens.
        Normalizes unicode characters to ASCII equivalents.
        
        Args:
            business_name: The business name to convert
        
        Returns:
            URL-safe slug string
        
        Examples:
            "My Cafe" -> "my-cafe"
            "Joe's Restaurant!" -> "joes-restaurant"
            "Café & Bistro" -> "cafe-bistro"
        """
        # Normalize unicode characters to ASCII equivalents
        # NFD = Canonical Decomposition (separates base characters from accents)
        # Then filter out combining characters (accents)
        normalized = unicodedata.normalize('NFD', business_name)
        ascii_text = ''.join(char for char in normalized if unicodedata.category(char) != 'Mn')
        
        # Convert to lowercase
        slug = ascii_text.lower()
        
        # Replace spaces with hyphens
        slug = slug.replace(' ', '-')
        
        # Remove any character that is not a-z, 0-9, or hyphen
        slug = re.sub(r'[^a-z0-9-]', '', slug)
        
        # Replace multiple consecutive hyphens with a single hyphen
        slug = re.sub(r'-+', '-', slug)
        
        # Remove leading and trailing hyphens
        slug = slug.strip('-')
        
        # Ensure slug is not empty
        if not slug:
            slug = 'business'
        
        return slug
    
    async def check_slug_exists(self, slug: str) -> bool:
        """
        Check if a slug already exists in the database.
        
        Args:
            slug: The slug to check
        
        Returns:
            True if slug exists, False otherwise
        """
        try:
            response = self.supabase.table('businesses') \
                .select('id') \
                .eq('slug', slug) \
                .execute()
            
            return len(response.data) > 0
        
        except Exception as e:
            logger.error(f"Error checking slug existence: {e}")
            raise
    
    async def generate_unique_slug(self, business_name: str, max_attempts: int = 100) -> str:
        """
        Generate a unique slug, handling collisions with numeric suffixes.
        
        If the base slug already exists, appends "-1", "-2", etc. until a unique
        slug is found.
        
        Args:
            business_name: The business name to convert
            max_attempts: Maximum number of attempts to find a unique slug
        
        Returns:
            Unique slug string
        
        Raises:
            Exception: If unable to find a unique slug after max_attempts
        
        Examples:
            If "my-cafe" exists:
            "My Cafe" -> "my-cafe-1"
            
            If "my-cafe" and "my-cafe-1" exist:
            "My Cafe" -> "my-cafe-2"
        """
        base_slug = self.generate_slug(business_name)
        
        # Check if base slug is available
        if not await self.check_slug_exists(base_slug):
            return base_slug
        
        # Try with numeric suffixes
        for i in range(1, max_attempts + 1):
            candidate_slug = f"{base_slug}-{i}"
            
            if not await self.check_slug_exists(candidate_slug):
                logger.info(
                    f"Slug collision detected for '{base_slug}'. "
                    f"Using '{candidate_slug}' instead."
                )
                return candidate_slug
        
        # If we get here, we've exhausted all attempts
        raise Exception(
            f"Unable to generate unique slug for '{business_name}' "
            f"after {max_attempts} attempts"
        )
    
    async def create_business(
        self,
        name: str,
        owner_id: str,
        website_url: Optional[str] = None,
        is_active: bool = True
    ) -> dict:
        """
        Create a new business record with a unique slug.
        
        Generates a slug from the business name and handles collisions automatically.
        
        Args:
            name: Business name (required)
            owner_id: User ID who owns this business (required for RLS)
            website_url: Optional website URL
            is_active: Whether the business is active (default: True)
        
        Returns:
            Dictionary containing the created business record with keys:
            - id: UUID of the created business
            - name: Business name
            - slug: Generated unique slug
            - owner_id: Owner user ID
            - website_url: Website URL (if provided)
            - is_active: Active status
            - created_at: Creation timestamp
            - updated_at: Update timestamp
        
        Raises:
            ValueError: If name is empty or invalid
            Exception: If database operation fails
        
        Examples:
            >>> service = BusinessService(supabase)
            >>> business = await service.create_business(
            ...     name="My Cafe",
            ...     owner_id="user-uuid-here",
            ...     website_url="https://mycafe.com"
            ... )
            >>> print(business['slug'])
            'my-cafe'
        """
        # Validate business name
        if not name or not name.strip():
            raise ValueError("Business name cannot be empty")
        
        # Validate owner_id
        if not owner_id or not owner_id.strip():
            raise ValueError("Owner ID cannot be empty")
        
        # Generate unique slug
        slug = await self.generate_unique_slug(name)
        
        try:
            # Prepare business data
            business_data = {
                'name': name.strip(),
                'slug': slug,
                'owner_id': owner_id,
                'is_active': is_active
            }
            
            # Add website_url if provided
            if website_url:
                business_data['website_url'] = website_url
            
            # Insert business record
            response = self.supabase.table('businesses') \
                .insert(business_data) \
                .execute()
            
            if not response.data:
                raise Exception("Failed to create business - no data returned")
            
            created_business = response.data[0]
            
            logger.info(
                f"Created business '{name}' with slug '{slug}' "
                f"(ID: {created_business['id']}, Owner: {owner_id})"
            )
            
            return created_business
        
        except Exception as e:
            logger.error(f"Error creating business '{name}': {e}")
            # Check if it's an RLS policy violation
            if 'policy' in str(e).lower() or '403' in str(e):
                raise ValueError(
                    "Permission denied: Unable to create business. "
                    "Please ensure you are authenticated."
                )
            raise
    
    async def get_business_by_id(self, business_id: str) -> Optional[dict]:
        """
        Get a business record by ID.
        
        Args:
            business_id: Business UUID
        
        Returns:
            Business record dictionary if found, None otherwise
        """
        try:
            response = self.supabase.table('businesses') \
                .select('*') \
                .eq('id', business_id) \
                .single() \
                .execute()
            
            if response.data:
                return response.data
            return None
        
        except Exception as e:
            # Not found is expected - return None
            if 'PGRST116' in str(e):  # Supabase "not found" error code
                return None
            logger.error(f"Error fetching business {business_id}: {e}")
            raise
    
    async def get_business_by_slug(self, slug: str) -> Optional[dict]:
        """
        Get a business record by slug.
        
        Args:
            slug: Business slug
        
        Returns:
            Business record dictionary if found, None otherwise
        """
        try:
            response = self.supabase.table('businesses') \
                .select('*') \
                .eq('slug', slug) \
                .single() \
                .execute()
            
            if response.data:
                return response.data
            return None
        
        except Exception as e:
            # Not found is expected - return None
            if 'PGRST116' in str(e):  # Supabase "not found" error code
                return None
            logger.error(f"Error fetching business by slug '{slug}': {e}")
            raise
