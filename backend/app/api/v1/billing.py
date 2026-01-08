"""Billing API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.core.database import get_supabase
from app.services.billing_service import BillingService
from app.schemas.bill import BillCreate, BillResponse
from app.api.v1.auth import get_current_user_id
from supabase import Client
from app.core.logging import logger


router = APIRouter()


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    bill_data: BillCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Create a new bill atomically with stock deduction.
    
    This operation:
    1. Validates all products exist
    2. Validates stock availability
    3. Creates bill and items
    4. Deducts stock from inventory
    """
    try:
        service = BillingService(db)
        result = await service.create_bill(bill_data, UUID(user_id))
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating bill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create bill"
        )


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(
    bill_id: UUID,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Get a bill by ID with items."""
    try:
        service = BillingService(db)
        result = await service.get_bill(bill_id, UUID(user_id))
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        logger.error(f"Error getting bill: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get bill"
        )


@router.get("", response_model=List[BillResponse])
async def list_bills(
    limit: int = 100,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """List all bills for the current user."""
    try:
        service = BillingService(db)
        results = await service.list_bills(UUID(user_id), limit)
        return results
    except Exception as e:
        logger.error(f"Error listing bills: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list bills"
        )

