"""Tax groups API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.core.database import get_supabase
from app.services.tax_group_service import TaxGroupService
from app.schemas.tax_group import TaxGroupCreate, TaxGroupUpdate, TaxGroupResponse
from app.api.v1.auth import get_current_user_id
from supabase import Client
from app.core.logging import logger


router = APIRouter()


@router.get("", response_model=List[TaxGroupResponse])
async def list_tax_groups(
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """List all tax groups (active and inactive)."""
    try:
        service = TaxGroupService(db)
        results = await service.list_tax_groups()
        return results
    except Exception as e:
        logger.error(f"Error listing tax groups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list tax groups"
        )


@router.get("/active", response_model=List[TaxGroupResponse])
async def get_active_tax_groups(
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Get all active tax groups."""
    try:
        service = TaxGroupService(db)
        results = await service.get_active_tax_groups()
        return results
    except Exception as e:
        logger.error(f"Error getting active tax groups: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get active tax groups"
        )


@router.get("/{tax_group_id}", response_model=TaxGroupResponse)
async def get_tax_group(
    tax_group_id: UUID,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Get a tax group by ID."""
    try:
        service = TaxGroupService(db)
        result = await service.get_tax_group(tax_group_id)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tax group not found"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tax group {tax_group_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get tax group"
        )


@router.post("", response_model=TaxGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_tax_group(
    tax_group: TaxGroupCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new tax group.
    
    Note: Currently requires authentication. In production, this should be
    restricted to Admin/Owner roles only.
    """
    try:
        service = TaxGroupService(db)
        result = await service.create_tax_group(tax_group)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating tax group: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create tax group"
        )


@router.put("/{tax_group_id}", response_model=TaxGroupResponse)
async def update_tax_group(
    tax_group_id: UUID,
    tax_group_update: TaxGroupUpdate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Update a tax group.
    
    Note: Currently requires authentication. In production, this should be
    restricted to Admin/Owner roles only.
    
    Important: Updating a tax group does NOT affect past bills. Only new bills
    will use the updated tax group configuration.
    """
    try:
        service = TaxGroupService(db)
        result = await service.update_tax_group(tax_group_id, tax_group_update)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tax group not found"
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating tax group {tax_group_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update tax group"
        )

