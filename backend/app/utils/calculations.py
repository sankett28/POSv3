"""Utility functions for calculations."""
from typing import List
from decimal import Decimal, ROUND_HALF_UP


def calculate_bill_total(items: List[dict]) -> float:
    """
    Calculate total bill amount from items.
    
    Args:
        items: List of items with 'quantity' and 'unit_price' or 'total_price'
    
    Returns:
        Total amount as float
    """
    total = Decimal("0")
    for item in items:
        if "total_price" in item:
            total += Decimal(str(item["total_price"]))
        else:
            quantity = Decimal(str(item.get("quantity", 0)))
            unit_price = Decimal(str(item.get("unit_price", 0)))
            total += quantity * unit_price
    
    return float(total.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def format_currency(amount: float) -> str:
    """
    Format amount as Indian Rupee currency.
    
    Args:
        amount: Amount to format
    
    Returns:
        Formatted string (e.g., "₹1,234.56")
    """
    return f"₹{amount:,.2f}"


def calculate_stock(ledger_entries: List[dict]) -> int:
    """
    Calculate current stock from ledger entries.
    
    Args:
        ledger_entries: List of ledger entries with 'quantity_change'
    
    Returns:
        Current stock as integer
    """
    return sum(entry.get("quantity_change", 0) for entry in ledger_entries)

