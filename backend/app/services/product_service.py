"""Product service with business logic."""
from typing import List, Optional
from uuid import UUID
from supabase import Client
from app.repositories.product_repo import ProductRepository
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.logging import logger


class ProductService:
    """Service for product business logic."""
    
    def __init__(self, db: Client):
        self.repo = ProductRepository(db)
    
    async def create_product(self, product: ProductCreate) -> ProductResponse:
        """Create a new product with validation."""
        # #region agent log
        import json
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"product_service.py:16","message":"Service create_product entry","data":{"productData":product.model_dump()},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        # #endregion
        # Check SKU uniqueness
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"product_service.py:19","message":"Before SKU check","data":{"sku":product.sku},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        # #endregion
        existing_sku = await self.repo.get_product_by_sku(product.sku)
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"product_service.py:22","message":"After SKU check","data":{"existingSku":str(existing_sku)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        # #endregion
        if existing_sku:
            raise ValueError(f"Product with SKU {product.sku} already exists")
        
        # Check barcode uniqueness if provided
        if product.barcode:
            existing_barcode = await self.repo.get_product_by_barcode(product.barcode)
            if existing_barcode:
                raise ValueError(f"Product with barcode {product.barcode} already exists")
        
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"product_service.py:30","message":"Before repo.create_product","data":{"productData":product.model_dump()},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        # #endregion
        result = await self.repo.create_product(product)
        # #region agent log
        with open('e:\\posv3\\POSv3\\.cursor\\debug.log', 'a') as f:
            f.write(json.dumps({"location":"product_service.py:32","message":"After repo.create_product","data":{"result":str(result)},"timestamp":int(__import__('time').time()*1000),"sessionId":"debug-session","runId":"run1","hypothesisId":"C"}) + '\n')
        # #endregion
        return ProductResponse(**result)
    
    async def get_product(self, product_id: UUID) -> Optional[ProductResponse]:
        """Get a product by ID."""
        result = await self.repo.get_product(product_id)
        if result:
            return ProductResponse(**result)
        return None
    
    async def list_products(self) -> List[ProductResponse]:
        """List all products."""
        results = await self.repo.list_products()
        return [ProductResponse(**r) for r in results]
    
    async def update_product(self, product_id: UUID, product_update: ProductUpdate) -> Optional[ProductResponse]:
        """Update a product with validation."""
        # Check if product exists
        existing = await self.repo.get_product(product_id)
        if not existing:
            return None
        
        # Check SKU uniqueness if updating SKU
        if product_update.sku and product_update.sku != existing.get("sku"):
            existing_sku = await self.repo.get_product_by_sku(product_update.sku)
            if existing_sku and existing_sku["id"] != str(product_id):
                raise ValueError(f"Product with SKU {product_update.sku} already exists")
        
        # Check barcode uniqueness if updating barcode
        if product_update.barcode and product_update.barcode != existing.get("barcode"):
            existing_barcode = await self.repo.get_product_by_barcode(product_update.barcode)
            if existing_barcode and existing_barcode["id"] != str(product_id):
                raise ValueError(f"Product with barcode {product_update.barcode} already exists")
        
        result = await self.repo.update_product(product_id, product_update)
        if result:
            return ProductResponse(**result)
        return None
    
    async def deactivate_product(self, product_id: UUID) -> bool:
        """Deactivate a product (soft delete)."""
        existing = await self.repo.get_product(product_id)
        if not existing:
            return False
        
        return await self.repo.deactivate_product(product_id)

