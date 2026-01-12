"""Reports API routes."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from app.core.database import get_supabase
from app.api.v1.auth import get_current_user_id
from supabase import Client
from app.core.logging import logger
from pydantic import BaseModel


router = APIRouter()


class TaxSummaryItem(BaseModel):
    """Tax summary item grouped by tax rate."""
    tax_rate_snapshot: float
    tax_group_name: Optional[str] = None
    total_taxable_value: float
    total_cgst: float
    total_sgst: float
    total_tax: float
    item_count: int


class TaxSummaryResponse(BaseModel):
    """Tax summary response."""
    start_date: str
    end_date: str
    summary: List[TaxSummaryItem]
    grand_total_taxable_value: float
    grand_total_cgst: float
    grand_total_sgst: float
    grand_total_tax: float


@router.get("/tax-summary", response_model=TaxSummaryResponse)
async def get_tax_summary(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    db: Client = Depends(get_supabase),
    user_id: str = Depends(get_current_user_id)
):
    """
    Get tax summary report grouped by tax rate snapshot.
    
    This endpoint queries bill_items snapshots directly - NO recalculation.
    All values are summed from stored snapshot fields for audit compliance.
    """
    try:
        import asyncio
        
        # Parse dates
        try:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use YYYY-MM-DD"
            )
        
        # Query bill_items with tax snapshots
        # Group by tax_rate_snapshot and sum all tax values
        result = await asyncio.to_thread(
            lambda: db.table("bill_items")
                .select("tax_rate_snapshot, tax_group_name_snapshot, taxable_value, cgst_amount, sgst_amount, tax_amount")
                .gte("created_at", start_dt.isoformat())
                .lte("created_at", end_dt.isoformat())
                .execute()
        )
        
        if not result.data:
            return TaxSummaryResponse(
                start_date=start_date,
                end_date=end_date,
                summary=[],
                grand_total_taxable_value=0.0,
                grand_total_cgst=0.0,
                grand_total_sgst=0.0,
                grand_total_tax=0.0
            )
        
        # Group by tax_rate_snapshot
        grouped = {}
        for item in result.data:
            tax_rate = float(item.get("tax_rate_snapshot", 0))
            if tax_rate not in grouped:
                grouped[tax_rate] = {
                    "tax_rate_snapshot": tax_rate,
                    "tax_group_name": item.get("tax_group_name_snapshot"),
                    "total_taxable_value": 0.0,
                    "total_cgst": 0.0,
                    "total_sgst": 0.0,
                    "total_tax": 0.0,
                    "item_count": 0
                }
            
            grouped[tax_rate]["total_taxable_value"] += float(item.get("taxable_value", 0))
            grouped[tax_rate]["total_cgst"] += float(item.get("cgst_amount", 0))
            grouped[tax_rate]["total_sgst"] += float(item.get("sgst_amount", 0))
            grouped[tax_rate]["total_tax"] += float(item.get("tax_amount", 0))
            grouped[tax_rate]["item_count"] += 1
        
        # Convert to list and calculate grand totals
        summary_items = []
        grand_total_taxable_value = 0.0
        grand_total_cgst = 0.0
        grand_total_sgst = 0.0
        grand_total_tax = 0.0
        
        for tax_rate in sorted(grouped.keys()):
            item = grouped[tax_rate]
            summary_items.append(TaxSummaryItem(**item))
            grand_total_taxable_value += item["total_taxable_value"]
            grand_total_cgst += item["total_cgst"]
            grand_total_sgst += item["total_sgst"]
            grand_total_tax += item["total_tax"]
        
        return TaxSummaryResponse(
            start_date=start_date,
            end_date=end_date,
            summary=summary_items,
            grand_total_taxable_value=grand_total_taxable_value,
            grand_total_cgst=grand_total_cgst,
            grand_total_sgst=grand_total_sgst,
            grand_total_tax=grand_total_tax
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating tax summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate tax summary"
        )

