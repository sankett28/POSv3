"""Product API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.core.database import get_supabase
from app.services.product_service import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.api.v1.auth import get_current_user_id
from supabase import Client
from app.core.logging import logger


router = APIRouter()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new product."""
    try:
        service = ProductService(db)
        result = await service.create_product(product, UUID(user_id))
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )


@router.get("", response_model=List[ProductResponse])
async def list_products(
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """List all products for the current user."""
    try:
        service = ProductService(db)
        results = await service.list_products(UUID(user_id))
        return results
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list products"
        )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: UUID,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Get a product by ID."""
    try:
        service = ProductService(db)
        result = await service.get_product(product_id, UUID(user_id))
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product"
        )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_update: ProductUpdate,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Update a product."""
    try:
        service = ProductService(db)
        result = await service.update_product(product_id, UUID(user_id), product_update)
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Delete a product."""
    try:
        service = ProductService(db)
        success = await service.delete_product(product_id, UUID(user_id))
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )


@router.get("/barcode/{barcode}", response_model=ProductResponse)
async def get_product_by_barcode(
    barcode: str,
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """Get a product by barcode."""
    try:
        service = ProductService(db)
        # This would need a method in the service
        from app.repositories.product_repo import ProductRepository
        repo = ProductRepository(db)
        result = await repo.get_product_by_barcode(barcode, UUID(user_id))
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        return ProductResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting product by barcode: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get product"
        )

