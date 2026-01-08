"""Product API routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from uuid import UUID
from app.core.database import get_supabase
from app.services.product_service import ProductService
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from supabase import Client
from app.core.logging import logger


router = APIRouter()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product: ProductCreate,
    db: Client = Depends(get_supabase)
):
    """Create a new product."""
    # #region agent log
    import json
    with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
        f.write(json.dumps({"location":"products.py:16","message":"API route create_product entry","data":{"productData":product.model_dump(),"dbType":str(type(db))},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"B"}) + '\n')
    # #endregion
    try:
        logger.info(f"Received product creation request: {product.model_dump()}")
        logger.info(f"Supabase client type: {type(db)}")
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"products.py:25","message":"Before service.create_product","data":{"productData":product.model_dump()},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"B"}) + '\n')
        # #endregion
        service = ProductService(db)
        result = await service.create_product(product)
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"products.py:29","message":"After service.create_product","data":{"result":str(result)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"B"}) + '\n')
        # #endregion
        logger.info(f"Product created successfully: {result}")
        return result
    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )


@router.get("", response_model=List[ProductResponse])
async def list_products(
    db: Client = Depends(get_supabase)
):
    """List all products."""
    try:
        service = ProductService(db)
        results = await service.list_products()
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
    db: Client = Depends(get_supabase)
):
    """Get a product by ID."""
    try:
        service = ProductService(db)
        result = await service.get_product(product_id)
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
    db: Client = Depends(get_supabase)
):
    """Update a product."""
    try:
        service = ProductService(db)
        result = await service.update_product(product_id, product_update)
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
async def deactivate_product(
    product_id: UUID,
    db: Client = Depends(get_supabase)
):
    """Deactivate a product (soft delete)."""
    try:
        service = ProductService(db)
        success = await service.deactivate_product(product_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deactivating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate product"
        )


@router.get("/barcode/{barcode}", response_model=ProductResponse)
async def get_product_by_barcode(
    barcode: str,
    db: Client = Depends(get_supabase)
):
    """Get a product by barcode."""
    try:
        from app.repositories.product_repo import ProductRepository
        repo = ProductRepository(db)
        result = await repo.get_product_by_barcode(barcode)
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

