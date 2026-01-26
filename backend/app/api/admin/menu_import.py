"""Menu import API endpoint for bulk CSV/XLSX upload."""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from io import BytesIO
import pandas as pd
from app.core.database import get_supabase
from app.api.v1.auth import get_current_user_id
from app.repositories.product_repo import ProductRepository
from app.repositories.category_repo import CategoryRepository
from app.repositories.tax_group_repo import TaxGroupRepository
from app.schemas.product import ProductCreate
from app.schemas.category import CategoryCreate
from supabase import Client
from app.core.logging import logger
from uuid import UUID
from pydantic import BaseModel


router = APIRouter()


class ImportResponse(BaseModel):
    """Response schema for menu import."""
    status: str
    inserted_items: int = 0
    inserted_categories: int = 0
    errors: List[str] = []


# Required columns (case-sensitive)
REQUIRED_COLUMNS = ["category_name", "item_name", "price", "tax_group_code"]
OPTIONAL_COLUMNS = ["is_active"]


async def validate_file(file: UploadFile) -> None:
    """Validate file type."""
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided"
        )
    
    if not (file.filename.endswith(".csv") or file.filename.endswith(".xlsx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV or XLSX files are allowed"
        )


async def load_dataframe(file: UploadFile) -> pd.DataFrame:
    """Load file into pandas DataFrame."""
    contents = await file.read()
    
    if file.filename.endswith(".csv"):
        df = pd.read_csv(BytesIO(contents))
    elif file.filename.endswith(".xlsx"):
        df = pd.read_excel(BytesIO(contents), engine='openpyxl')
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only CSV or XLSX files are allowed"
        )
    
    return df


def validate_columns(df: pd.DataFrame) -> List[str]:
    """Validate that all required columns exist."""
    errors = []
    df_columns = [col.strip() for col in df.columns.tolist()]
    
    for required_col in REQUIRED_COLUMNS:
        if required_col not in df_columns:
            errors.append(f"Missing required column: {required_col}")
    
    return errors


def validate_rows(
    df: pd.DataFrame,
    tax_group_map: dict,
    category_map: dict
) -> tuple[List[dict], List[str]]:
    """
    Validate all rows and return valid rows + errors.
    
    Returns:
        (valid_rows, errors)
    """
    errors = []
    valid_rows = []
    
    for idx, row in df.iterrows():
        row_num = idx + 2  # +2 because: 0-indexed + 1 for header row
        row_errors = []
        
        # Validate item_name
        item_name = str(row.get("item_name", "")).strip()
        if not item_name:
            row_errors.append(f"Row {row_num}: missing item_name")
        
        # Validate price
        try:
            price = float(row.get("price", 0))
            if price <= 0:
                row_errors.append(f"Row {row_num}: price must be > 0")
        except (ValueError, TypeError):
            row_errors.append(f"Row {row_num}: price must be numeric")
            price = None
        
        # Validate category_name
        category_name = str(row.get("category_name", "")).strip()
        if not category_name:
            row_errors.append(f"Row {row_num}: missing category_name")
        
        # Validate tax_group_code
        tax_group_code = str(row.get("tax_group_code", "")).strip()
        if not tax_group_code:
            row_errors.append(f"Row {row_num}: missing tax_group_code")
        elif tax_group_code not in tax_group_map:
            row_errors.append(f"Row {row_num}: invalid tax_group_code '{tax_group_code}' (must exist and be active)")
        
        # Validate is_active (optional, default True)
        is_active = True
        if "is_active" in row and pd.notna(row.get("is_active")):
            is_active_val = str(row.get("is_active", "")).strip().lower()
            if is_active_val in ["false", "0", "no", "n"]:
                is_active = False
        
        if row_errors:
            errors.extend(row_errors)
        else:
            valid_rows.append({
                "item_name": item_name,
                "price": price,
                "category_name": category_name,
                "tax_group_code": tax_group_code,
                "is_active": is_active,
                "row_num": row_num
            })
    
    return valid_rows, errors


async def get_or_create_category(
    category_name: str,
    category_repo: CategoryRepository,
    category_map: dict
) -> UUID:
    """Get existing category or create new one. Returns category_id."""
    # Check cache first
    if category_name in category_map:
        return category_map[category_name]
    
    # Check if category exists in database
    all_categories = await category_repo.list_categories()
    for cat in all_categories:
        if cat["name"].lower() == category_name.lower():
            category_id = UUID(cat["id"])
            category_map[category_name] = category_id
            return category_id
    
    # Create new category
    category_create = CategoryCreate(
        name=category_name,
        is_active=True,
        display_order=0
    )
    new_category = await category_repo.create_category(category_create)
    category_id = UUID(new_category["id"])
    category_map[category_name] = category_id
    return category_id


@router.post("/import", response_model=ImportResponse)
async def import_menu(
    file: UploadFile = File(...),
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Bulk import menu items from CSV or XLSX file.
    
    Required columns (case-sensitive):
    - category_name
    - item_name
    - price
    - tax_group_code
    
    Optional columns:
    - is_active (default: true)
    
    Only accessible to authenticated users (admin/owner in production).
    """
    try:
        # Validate file type
        await validate_file(file)
        
        # Load DataFrame
        df = await load_dataframe(file)
        
        if df.empty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File is empty"
            )
        
        # Validate columns
        column_errors = validate_columns(df)
        if column_errors:
            return ImportResponse(
                status="failed",
                errors=column_errors
            )
        
        # Initialize repositories
        tax_group_repo = TaxGroupRepository(db)
        category_repo = CategoryRepository(db)
        product_repo = ProductRepository(db)
        
        # Get all active tax groups and build code -> id map
        all_tax_groups = await tax_group_repo.get_active_tax_groups()
        tax_group_map = {}
        for tg in all_tax_groups:
            code = tg.get("code")
            if code:
                tax_group_map[code] = UUID(tg["id"])
        
        if not tax_group_map:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active tax groups with codes found. Please create tax groups with codes first."
            )
        
        # Get existing categories for caching
        all_categories = await category_repo.list_categories()
        category_map = {}
        for cat in all_categories:
            category_map[cat["name"]] = UUID(cat["id"])
        
        # Validate all rows
        valid_rows, validation_errors = validate_rows(df, tax_group_map, category_map)
        
        if validation_errors:
            return ImportResponse(
                status="failed",
                errors=validation_errors
            )
        
        # If we get here, all rows are valid
        # Now create categories and products
        inserted_categories = 0
        inserted_items = 0
        new_categories = set()
        
        # First pass: ensure all categories exist
        for row in valid_rows:
            category_name = row["category_name"]
            if category_name not in category_map:
                new_categories.add(category_name)
        
        # Create missing categories
        for category_name in new_categories:
            try:
                category_id = await get_or_create_category(
                    category_name,
                    category_repo,
                    category_map
                )
                inserted_categories += 1
            except Exception as e:
                logger.error(f"Error creating category {category_name}: {e}")
                return ImportResponse(
                    status="failed",
                    errors=[f"Failed to create category '{category_name}': {str(e)}"]
                )
        
        # Second pass: create all products
        for row in valid_rows:
            try:
                category_id = category_map[row["category_name"]]
                tax_group_id = tax_group_map[row["tax_group_code"]]
                
                product_create = ProductCreate(
                    name=row["item_name"],
                    selling_price=row["price"],
                    tax_group_id=tax_group_id,
                    category_id=category_id,
                    is_active=row["is_active"]
                )
                
                await product_repo.create_product(product_create)
                inserted_items += 1
            except Exception as e:
                logger.error(f"Error creating product {row['item_name']}: {e}")
                return ImportResponse(
                    status="failed",
                    errors=[f"Row {row['row_num']}: Failed to create product '{row['item_name']}': {str(e)}"]
                )
        
        return ImportResponse(
            status="success",
            inserted_items=inserted_items,
            inserted_categories=inserted_categories
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error importing menu: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import menu: {str(e)}"
        )

