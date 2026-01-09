"""Category repository for database operations."""
import asyncio
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.core.logging import logger


class CategoryRepository:
    """Repository for category data access."""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def create_category(self, category: CategoryCreate) -> dict:
        """Create a new category."""
        try:
            data = {
                "name": category.name,
                "is_active": category.is_active,
                "display_order": category.display_order
            }
            logger.info(f"Attempting to insert category data: {data}")
            result = await asyncio.to_thread(
                lambda: self.db.table("categories").insert(data).execute()
            )
            if result.data:
                logger.info(f"Created category: {category.name}")
                return result.data[0]
            raise ValueError("Failed to create category - no data returned from Supabase")
        except Exception as e:
            logger.error(f"Error creating category: {e}")
            raise
    
    async def get_category(self, category_id: UUID) -> Optional[dict]:
        """Get a category by ID."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("categories").select("*").eq("id", str(category_id)).execute()
            )
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting category {category_id}: {e}")
            raise
    
    async def list_categories(self) -> List[dict]:
        """List all categories."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("categories").select("*").order("display_order", desc=False).order("name", desc=False).execute()
            )
            return result.data or []
        except Exception as e:
            logger.error(f"Error listing categories: {e}")
            raise
    
    async def update_category(self, category_id: UUID, category_update: CategoryUpdate) -> Optional[dict]:
        """Update a category."""
        try:
            update_data = category_update.model_dump(exclude_unset=True)
            if not update_data:
                return await self.get_category(category_id)
            
            result = await asyncio.to_thread(
                lambda: self.db.table("categories").update(update_data).eq("id", str(category_id)).execute()
            )
            if result.data:
                logger.info(f"Updated category {category_id}")
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating category {category_id}: {e}")
            raise
    
    async def deactivate_category(self, category_id: UUID) -> bool:
        """Deactivate a category (soft delete)."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("categories").update({"is_active": False}).eq("id", str(category_id)).execute()
            )
            if result.data:
                logger.info(f"Deactivated category {category_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deactivating category {category_id}: {e}")
            raise

