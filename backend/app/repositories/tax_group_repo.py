"""Tax group repository for database operations."""
import asyncio
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.core.logging import logger


class TaxGroupRepository:
    """Repository for tax group data access."""
    
    def __init__(self, db: Client):
        self.db = db
    
    async def get_tax_group(self, tax_group_id: UUID) -> Optional[dict]:
        """Get a tax group by ID."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("tax_groups").select("*").eq("id", str(tax_group_id)).execute()
            )
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting tax group {tax_group_id}: {e}")
            raise
    
    async def get_by_code(self, code: str) -> Optional[dict]:
        """Get a tax group by code (for system-level tax groups)."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("tax_groups")
                    .select("*")
                    .eq("code", code)
                    .execute()
            )
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error getting tax group by code {code}: {e}")
            raise
    
    async def get_active_tax_groups(self) -> List[dict]:
        """Get all active tax groups."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("tax_groups")
                    .select("*")
                    .eq("is_active", True)
                    .order("total_rate", desc=False)
                    .execute()
            )
            return result.data or []
        except Exception as e:
            logger.error(f"Error getting active tax groups: {e}")
            raise
    
    async def list_tax_groups(self) -> List[dict]:
        """List all tax groups (active and inactive)."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("tax_groups")
                    .select("*")
                    .order("total_rate", desc=False)
                    .execute()
            )
            return result.data or []
        except Exception as e:
            logger.error(f"Error listing tax groups: {e}")
            raise
    
    async def create_tax_group(self, tax_group_data: dict) -> dict:
        """Create a new tax group."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("tax_groups").insert(tax_group_data).execute()
            )
            if result.data:
                logger.info(f"Created tax group: {tax_group_data.get('name')}")
                return result.data[0]
            raise ValueError("Failed to create tax group")
        except Exception as e:
            logger.error(f"Error creating tax group: {e}")
            raise
    
    async def update_tax_group(self, tax_group_id: UUID, update_data: dict) -> Optional[dict]:
        """Update a tax group."""
        try:
            result = await asyncio.to_thread(
                lambda: self.db.table("tax_groups")
                    .update(update_data)
                    .eq("id", str(tax_group_id))
                    .execute()
            )
            if result.data:
                logger.info(f"Updated tax group {tax_group_id}")
                return result.data[0]
            return None
        except Exception as e:
            logger.error(f"Error updating tax group {tax_group_id}: {e}")
            raise

