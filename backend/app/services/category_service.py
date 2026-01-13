"""Category service with business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.category_repo import CategoryRepository
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.core.logging import logger


class CategoryService:
    """Service for category business logic."""
    
    def __init__(self, db: Client):
        self.repo = CategoryRepository(db)
    
    async def create_category(self, category: CategoryCreate) -> CategoryResponse:
        """Create a new category with validation."""
        # Check name uniqueness
        existing = await self.repo.list_categories()
        if any(cat["name"].lower() == category.name.lower() for cat in existing):
            raise ValueError(f"Category with name '{category.name}' already exists")
        
        result = await self.repo.create_category(category)
        return CategoryResponse(**result)
    
    async def get_category(self, category_id: UUID) -> Optional[CategoryResponse]:
        """Get a category by ID."""
        result = await self.repo.get_category(category_id)
        if result:
            return CategoryResponse(**result)
        return None
    
    async def list_categories(self) -> List[CategoryResponse]:
        """List all categories."""
        results = await self.repo.list_categories()
        return [CategoryResponse(**r) for r in results]
    
    async def update_category(self, category_id: UUID, category_update: CategoryUpdate) -> Optional[CategoryResponse]:
        """Update a category with validation."""
        # Check if category exists
        existing = await self.repo.get_category(category_id)
        if not existing:
            return None
        
        # Check name uniqueness if updating name
        if category_update.name and category_update.name.lower() != existing.get("name", "").lower():
            all_categories = await self.repo.list_categories()
            if any(cat["name"].lower() == category_update.name.lower() and str(cat["id"]) != str(category_id) for cat in all_categories):
                raise ValueError(f"Category with name '{category_update.name}' already exists")
        
        result = await self.repo.update_category(category_id, category_update)
        if result:
            return CategoryResponse(**result)
        return None
    
    async def deactivate_category(self, category_id: UUID) -> bool:
        """Deactivate a category (soft delete)."""
        existing = await self.repo.get_category(category_id)
        if not existing:
            return False
        
        return await self.repo.deactivate_category(category_id)

