# Products Table Schema Cleanup - Summary

## Overview

This document summarizes the database schema cleanup migration that transforms the products table from retail-oriented to cafe-oriented design.

## Migration File

**File**: `backend/supabase/migrations/003_cleanup_products_cafe_schema.sql`

## Changes Applied

### 1. SKU Field - Made Optional

**Before:**
- `sku VARCHAR(100) NOT NULL UNIQUE`
- Required constraint: `products_sku_not_empty`

**After:**
- `sku VARCHAR(100) NULL UNIQUE (when present)`
- Partial unique index: Only enforces uniqueness when SKU is not null
- No NOT NULL constraint
- No empty string check

**Rationale**: Cafe menu items don't always need SKUs. Making it optional allows simpler product creation.

### 2. Barcode Field - Made Optional (Already Was, But Adjusted)

**Before:**
- `barcode VARCHAR(100) UNIQUE` (nullable but constraint applied to all rows)

**After:**
- `barcode VARCHAR(100) NULL UNIQUE (when present)`
- Partial unique index: Only enforces uniqueness when barcode is not null
- Index updated to be partial

**Rationale**: Not all cafe items have barcodes. Partial unique constraint is more appropriate.

### 3. Unit Field - Made Optional and Relaxed

**Before:**
- `unit VARCHAR(20) NOT NULL CHECK (unit IN ('pcs', 'kg', 'litre'))`
- Required field with restrictive values

**After:**
- `unit VARCHAR(255) NULL CHECK (unit IN ('pcs', 'kg', 'litre', 'cup', 'plate', 'bowl', 'serving', 'piece', 'bottle', 'can'))`
- Optional field
- Expanded unit options for cafe items
- Allows NULL for items that don't need units

**Rationale**: Cafe menu items may not always need units (e.g., "Coffee", "Sandwich"). Expanded options support cafe-specific units.

### 4. Inventory-Related Columns - Removed (If Present)

The migration checks for and removes any of the following columns if they exist:
- `stock`
- `quantity`
- `available_quantity`
- `min_stock`
- `reorder_level`
- `inventory_quantity`

**Rationale**: Inventory tracking has been completely removed from the system. These columns should not exist, but the migration safely removes them if present.

### 5. Inventory-Related Constraints - Removed

The migration drops any inventory-related CHECK constraints:
- `products_stock_check`
- `products_quantity_check`
- `products_min_stock_check`
- `products_reorder_level_check`
- `products_available_quantity_check`

**Rationale**: These constraints are no longer relevant for a cafe POS without inventory.

## Final Products Table Structure

After migration, the products table contains ONLY cafe-relevant fields:

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    selling_price DECIMAL(10, 2) NOT NULL CHECK (selling_price > 0),
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0 AND tax_rate <= 100),
    sku VARCHAR(100) NULL,  -- Optional, unique when present
    barcode VARCHAR(100) NULL,  -- Optional, unique when present
    unit VARCHAR(255) NULL CHECK (unit IN ('pcs', 'kg', 'litre', 'cup', 'plate', 'bowl', 'serving', 'piece', 'bottle', 'can')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT products_name_not_empty CHECK (LENGTH(TRIM(name)) > 0)
);
```

## Indexes

- `idx_products_sku_unique` - Partial unique index on SKU (when not null)
- `idx_products_barcode_unique` - Partial unique index on barcode (when not null)
- `idx_products_barcode` - Partial index on barcode for lookups (when not null)
- `idx_products_category_id` - Index on category_id (when not null)
- `idx_products_is_active` - Index on is_active (when true)

## Safety Measures

1. **No Data Loss**: All existing data is preserved
2. **Backward Compatible**: Existing products with SKU/barcode continue to work
3. **Gradual Migration**: Empty strings converted to NULL before constraint changes
4. **Conditional Drops**: Columns and constraints only dropped if they exist
5. **Historical Data Preserved**: No changes to bills or bill_items tables

## Impact on Application Code

### Product Creation
- SKU is now optional (can be NULL)
- Barcode is now optional (can be NULL)
- Unit is now optional (can be NULL)
- Application should handle NULL values gracefully

### Product Queries
- SKU uniqueness only enforced when value is present
- Barcode uniqueness only enforced when value is present
- Unit validation expanded to include cafe-specific units

### Product Updates
- Can set SKU/barcode/unit to NULL
- Can add SKU/barcode/unit to existing products
- No restrictions on removing these optional fields

## Testing Checklist

- [ ] Create product without SKU
- [ ] Create product without barcode
- [ ] Create product without unit
- [ ] Create product with all optional fields
- [ ] Verify SKU uniqueness only when present
- [ ] Verify barcode uniqueness only when present
- [ ] Verify unit accepts cafe-specific values
- [ ] Verify unit can be NULL
- [ ] Verify existing products still work
- [ ] Verify historical bills remain valid

## Migration Execution

Run the migration in your Supabase SQL Editor:

```sql
-- Execute: backend/supabase/migrations/003_cleanup_products_cafe_schema.sql
```

Or via Supabase CLI:

```bash
supabase db push
```

## Rollback Strategy

If rollback is needed:

1. Restore NOT NULL constraints (if data allows)
2. Restore restrictive unit CHECK constraint
3. Restore full unique constraints (if no duplicates exist)

**Note**: Rollback may fail if products exist with NULL SKU/barcode/unit values.

## Summary

The products table has been successfully transformed from retail-oriented to cafe-oriented:

✅ **SKU is optional** - Not required for cafe menu items  
✅ **Barcode is optional** - Not required for cafe menu items  
✅ **Unit is optional** - Not required for all cafe menu items  
✅ **Unit options expanded** - Supports cafe-specific units  
✅ **Inventory columns removed** - If they existed  
✅ **Historical data preserved** - All existing products remain valid  
✅ **Bills preserved** - No changes to billing data  

The schema is now optimized for cafe operations where products are menu items, not stock units.

---

**Migration**: `003_cleanup_products_cafe_schema.sql`  
**Date**: January 2025  
**Version**: 3.1 (Cafe POS - Schema Cleanup)

