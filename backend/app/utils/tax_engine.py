"""Tax calculation engine for GST-compliant billing.

This module provides a pure calculation utility for tax computations.
It handles:
- Inclusive and exclusive pricing
- CGST/SGST split for Indian GST
- Precise decimal calculations

CORE PRINCIPLES:
- NO database access
- NO side effects
- Pure functions only
- Use Decimal for precision
- TaxEngine is the ONLY place for tax math
"""
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Literal
from dataclasses import dataclass


@dataclass
class TaxGroupConfig:
    """Configuration for a tax group."""
    name: str
    total_rate: Decimal
    split_type: Literal['GST_50_50', 'NO_SPLIT']
    is_tax_inclusive: bool


@dataclass
class LineItemTaxResult:
    """Result of tax calculation for a single line item."""
    taxable_value: Decimal  # Price before tax (for exclusive) or extracted price (for inclusive)
    tax_amount: Decimal      # Total tax amount
    cgst_amount: Decimal     # Central GST (50% of tax for GST_50_50)
    sgst_amount: Decimal     # State GST (50% of tax for GST_50_50)
    line_total: Decimal      # Final amount including tax


@dataclass
class BillSummary:
    """Summary of tax calculations for an entire bill."""
    subtotal: Decimal        # Sum of all taxable_value
    total_tax: Decimal       # Sum of all tax_amount
    total_cgst: Decimal      # Sum of all cgst_amount
    total_sgst: Decimal      # Sum of all sgst_amount
    total_amount: Decimal    # Final bill total


class TaxEngine:
    """Pure tax calculation engine with no side effects."""
    
    @staticmethod
    def _round_currency(value: Decimal) -> Decimal:
        """Round to 2 decimal places for currency."""
        return value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    @staticmethod
    def _split_tax(tax_amount: Decimal, split_type: Literal['GST_50_50', 'NO_SPLIT']) -> tuple[Decimal, Decimal]:
        """Split tax amount into CGST and SGST.
        
        Args:
            tax_amount: Total tax amount
            split_type: How to split the tax
            
        Returns:
            Tuple of (cgst_amount, sgst_amount)
        """
        if split_type == 'GST_50_50':
            # Split 50/50 for CGST and SGST
            half = tax_amount / Decimal('2')
            cgst = TaxEngine._round_currency(half)
            sgst = tax_amount - cgst  # Ensure cgst + sgst = tax_amount exactly
            return (cgst, sgst)
        else:  # NO_SPLIT
            # No split - all tax goes to a single component (use CGST for reporting)
            return (tax_amount, Decimal('0'))
    
    @staticmethod
    def calculate_line_item(
        unit_price: Decimal,
        quantity: int,
        tax_group: TaxGroupConfig
    ) -> LineItemTaxResult:
        """Calculate tax for a single line item.
        
        Args:
            unit_price: Price per unit (may be inclusive or exclusive of tax)
            quantity: Quantity of items
            tax_group: Tax group configuration
            
        Returns:
            LineItemTaxResult with all calculated tax values
        """
        if quantity <= 0:
            raise ValueError("Quantity must be greater than 0")
        
        if tax_group.total_rate < 0:
            raise ValueError("Tax rate cannot be negative")
        
        # Round unit price to 2 decimal places
        unit_price = TaxEngine._round_currency(unit_price)
        
        if tax_group.is_tax_inclusive:
            # INCLUSIVE PRICING: Price includes tax
            # Extract tax from the total price
            line_total = TaxEngine._round_currency(unit_price * Decimal(quantity))
            
            if tax_group.total_rate == 0:
                # No tax - everything is taxable value
                taxable_value = line_total
                tax_amount = Decimal('0')
            else:
                # Calculate taxable value by extracting tax
                # taxable_value = line_total / (1 + tax_rate / 100)
                tax_multiplier = Decimal('1') + (tax_group.total_rate / Decimal('100'))
                taxable_value = TaxEngine._round_currency(line_total / tax_multiplier)
                tax_amount = line_total - taxable_value
                tax_amount = TaxEngine._round_currency(tax_amount)
        else:
            # EXCLUSIVE PRICING: Price excludes tax
            # Add tax to the base price
            taxable_value = TaxEngine._round_currency(unit_price * Decimal(quantity))
            
            if tax_group.total_rate == 0:
                # No tax
                tax_amount = Decimal('0')
                line_total = taxable_value
            else:
                # Calculate tax amount
                # tax_amount = taxable_value × (tax_rate / 100)
                tax_amount = TaxEngine._round_currency(
                    taxable_value * (tax_group.total_rate / Decimal('100'))
                )
                line_total = taxable_value + tax_amount
                line_total = TaxEngine._round_currency(line_total)
        
        # Split tax into CGST and SGST
        cgst_amount, sgst_amount = TaxEngine._split_tax(tax_amount, tax_group.split_type)
        
        # Ensure line_total = taxable_value + tax_amount (accounting for rounding)
        # Recalculate line_total to ensure consistency
        calculated_total = taxable_value + tax_amount
        if abs(calculated_total - line_total) > Decimal('0.01'):
            line_total = calculated_total
        
        return LineItemTaxResult(
            taxable_value=taxable_value,
            tax_amount=tax_amount,
            cgst_amount=cgst_amount,
            sgst_amount=sgst_amount,
            line_total=TaxEngine._round_currency(line_total)
        )
    
    @staticmethod
    def generate_bill_summary(
        line_items: List[LineItemTaxResult]
    ) -> BillSummary:
        """Generate summary for an entire bill from line items.
        
        Args:
            line_items: List of tax calculation results for each line item
            
        Returns:
            BillSummary with aggregated totals
        """
        if not line_items:
            return BillSummary(
                subtotal=Decimal('0'),
                total_tax=Decimal('0'),
                total_cgst=Decimal('0'),
                total_sgst=Decimal('0'),
                total_amount=Decimal('0')
            )
        
        # Sum all values
        subtotal = sum(item.taxable_value for item in line_items)
        total_tax = sum(item.tax_amount for item in line_items)
        total_amount = sum(item.line_total for item in line_items)
        
        # Round totals
        subtotal = TaxEngine._round_currency(subtotal)
        total_tax = TaxEngine._round_currency(total_tax)
        total_amount = TaxEngine._round_currency(total_amount)
        
        # Derive CGST/SGST from total_tax (balanced split)
        # This ensures cgst + sgst = total_tax exactly, eliminating rounding drift
        half = total_tax / Decimal('2')
        total_cgst = TaxEngine._round_currency(half)
        total_sgst = total_tax - total_cgst  # Ensure exact balance
        
        return BillSummary(
            subtotal=subtotal,
            total_tax=total_tax,
            total_cgst=total_cgst,
            total_sgst=total_sgst,
            total_amount=total_amount
        )

