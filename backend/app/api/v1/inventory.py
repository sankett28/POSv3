"""Inventory API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.core.database import get_supabase
from app.services.inventory_service import InventoryService
from app.schemas.inventory import StockResponse, InventoryLedgerEntry
from supabase import Client
from app.core.logging import logger
from pydantic import BaseModel


router = APIRouter()


class AddStockRequest(BaseModel):
    """Request to add stock."""
    product_id: UUID
    quantity: int


class DeductStockRequest(BaseModel):
    """Request to deduct stock."""
    product_id: UUID
    quantity: int


@router.post("/add-stock", response_model=InventoryLedgerEntry, status_code=status.HTTP_201_CREATED)
async def add_stock(
    request: AddStockRequest,
    db: Client = Depends(get_supabase)
):
    """Add stock (incoming movement)."""
    try:
        service = InventoryService(db)
        result = await service.add_stock(
            product_id=request.product_id,
            quantity=request.quantity
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add stock"
        )


@router.post("/deduct-stock", response_model=InventoryLedgerEntry, status_code=status.HTTP_201_CREATED)
async def deduct_stock(
    request: DeductStockRequest,
    db: Client = Depends(get_supabase)
):
    """Deduct stock (outgoing movement) with validation."""
    try:
        service = InventoryService(db)
        result = await service.deduct_stock(
            product_id=request.product_id,
            quantity=request.quantity
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error deducting stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deduct stock"
        )


@router.get("/stock/{product_id}", response_model=dict)
async def get_stock(
    product_id: UUID,
    db: Client = Depends(get_supabase)
):
    """Get current stock for a product."""
    try:
        service = InventoryService(db)
        stock = await service.get_current_stock(product_id)
        return {"product_id": str(product_id), "current_stock": stock}
    except Exception as e:
        logger.error(f"Error getting stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get stock"
        )


@router.get("/stocks", response_model=List[StockResponse])
async def get_all_stocks(
    db: Client = Depends(get_supabase)
):
    """Get current stock for all products."""
    try:
        service = InventoryService(db)
        results = await service.get_all_stocks()
        return results
    except Exception as e:
        logger.error(f"Error getting all stocks: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get stocks"
        )


@router.get("/history/{product_id}", response_model=List[InventoryLedgerEntry])
async def get_stock_history(
    product_id: UUID,
    limit: int = 100,
    db: Client = Depends(get_supabase)
):
    """Get stock movement history for a product."""
    try:
        service = InventoryService(db)
        results = await service.get_stock_history(product_id, limit)
        return results
    except Exception as e:
        logger.error(f"Error getting stock history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get stock history"
        )

