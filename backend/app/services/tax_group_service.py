"""Tax group service for business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.tax_group_repo import TaxGroupRepository
from app.schemas.tax_group import TaxGroupCreate, TaxGroupUpdate, TaxGroupResponse
from app.core.logging import logger


class TaxGroupService:
    """Service for tax group business logic."""
    
    def __init__(self, db: Client):
        self.tax_group_repo = TaxGroupRepository(db)
        self.db = db
    
    async def create_tax_group(self, tax_group: TaxGroupCreate) -> TaxGroupResponse:
        """Create a new tax group."""
        try:
            # Check if name already exists
            existing_groups = await self.tax_group_repo.list_tax_groups()
            for group in existing_groups:
                if group["name"].lower() == tax_group.name.lower():
                    raise ValueError(f"Tax group with name '{tax_group.name}' already exists")
            
            data = {
                "name": tax_group.name,
                "total_rate": tax_group.total_rate,
                "split_type": tax_group.split_type,
                "is_tax_inclusive": tax_group.is_tax_inclusive,
                "is_active": tax_group.is_active
            }
            
            result = await self.tax_group_repo.create_tax_group(data)
            return TaxGroupResponse(**result)
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error creating tax group: {e}")
            raise
    
    async def get_tax_group(self, tax_group_id: UUID) -> Optional[TaxGroupResponse]:
        """Get a tax group by ID."""
        try:
            result = await self.tax_group_repo.get_tax_group(tax_group_id)
            if result:
                return TaxGroupResponse(**result)
            return None
        except Exception as e:
            logger.error(f"Error getting tax group {tax_group_id}: {e}")
            raise
    
    async def list_tax_groups(self) -> List[TaxGroupResponse]:
        """List all tax groups."""
        try:
            results = await self.tax_group_repo.list_tax_groups()
            return [TaxGroupResponse(**group) for group in results]
        except Exception as e:
            logger.error(f"Error listing tax groups: {e}")
            raise
    
    async def get_active_tax_groups(self) -> List[TaxGroupResponse]:
        """Get all active tax groups."""
        try:
            results = await self.tax_group_repo.get_active_tax_groups()
            return [TaxGroupResponse(**group) for group in results]
        except Exception as e:
            logger.error(f"Error getting active tax groups: {e}")
            raise
    
    async def update_tax_group(
        self,
        tax_group_id: UUID,
        tax_group_update: TaxGroupUpdate
    ) -> Optional[TaxGroupResponse]:
        """Update a tax group."""
        try:
            # Check if tax group exists
            existing = await self.tax_group_repo.get_tax_group(tax_group_id)
            if not existing:
                return None
            
            # If name is being updated, check for conflicts
            if tax_group_update.name is not None:
                existing_groups = await self.tax_group_repo.list_tax_groups()
                for group in existing_groups:
                    if (group["id"] != str(tax_group_id) and 
                        group["name"].lower() == tax_group_update.name.lower()):
                        raise ValueError(f"Tax group with name '{tax_group_update.name}' already exists")
            
            # Validate: If deactivating, check if any products use this tax group
            if tax_group_update.is_active is False:
                import asyncio
                result = await asyncio.to_thread(
                    lambda: self.db.table("products")
                        .select("id", count="exact")
                        .eq("tax_group_id", str(tax_group_id))
                        .execute()
                )
                if result.count and result.count > 0:
                    raise ValueError(
                        f"Cannot deactivate tax group: {result.count} product(s) are using this tax group. "
                        "Please reassign products to another tax group first."
                    )
            
            update_data = tax_group_update.model_dump(exclude_unset=True)
            if not update_data:
                return await self.get_tax_group(tax_group_id)
            
            result = await self.tax_group_repo.update_tax_group(tax_group_id, update_data)
            if result:
                return TaxGroupResponse(**result)
            return None
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error updating tax group {tax_group_id}: {e}")
            raise

