# Inventory Removal - Architectural Refactor Summary

## Overview

This document summarizes the architectural decision to completely remove inventory tracking from the Cafe POS system. The system has been refactored from a retail POS with inventory management to a pure **SALES + TAX + REPORTING** system.

## Decision Rationale

### Why Remove Inventory?

1. **Cafe Operations Reality**
   - Cafes operate at high speed - staff need to bill quickly
   - Many items are made-to-order, making stock tracking impractical
   - Menu availability is better managed manually via active/inactive flags

2. **System Focus**
   - Primary goal: Accurate billing and tax compliance
   - Secondary goal: Comprehensive sales and tax reports
   - Inventory tracking was adding complexity without core value

3. **Audit and Compliance**
   - Tax values must be frozen at sale time for compliance
   - Financial records must be immutable
   - Reports must be accurate and historical
   - Inventory tracking was not contributing to these goals

4. **Simplicity**
   - Reduced system complexity
   - Faster development cycles
   - Clearer data model (orders as single source of truth)
   - Better performance (fewer tables, simpler queries)

## What Changed

### Documentation Updates

1. **BUSINESS_LOGIC.md**
   - Removed all inventory references
   - Redefined core entities (products = menu items, not stock units)
   - Added category logic for menu organization
   - Emphasized tax snapshot and product snapshot requirements
   - Clarified that inventory does not exist

2. **ARCHITECTURE.md**
   - Removed inventory from system diagrams
   - Updated core flow: `UI → Orders → Tax Calculation → Storage → Reports`
   - Added section explaining why inventory was removed
   - Emphasized snapshot-based architecture for historical accuracy

### Database Changes

**Migration: `002_remove_inventory_add_tax_categories.sql`**

#### 1. Inventory Ledger Deprecation
- `inventory_ledger` table marked as deprecated with comments
- Table NOT dropped (preserves historical data if needed)
- Foreign key constraints relaxed (no blocking dependencies)
- Application logic should no longer reference this table

#### 2. Categories Table (New)
- Owner-managed menu categories
- Fields: `id`, `name`, `is_active`, `display_order`, `created_at`, `updated_at`
- Optional organization tool for products
- Category names are snapshotted in bill_items for historical accuracy

#### 3. Products Table Updates
- Added `tax_rate` (DECIMAL 0-100) - required for tax calculation
- Added `category_id` (FK to categories) - optional menu organization
- Added `updated_at` - menu items can change over time
- Products are now pure menu items with no stock concept

#### 4. Bills Table Updates
- Added `subtotal` - amount before tax
- Added `tax_amount` - total tax for the order (frozen at sale time)
- Constraint: `total_amount = subtotal + tax_amount`
- Complete financial record in single table

#### 5. Bill Items Table Updates
- Added `tax_rate` - snapshot at sale time
- Added `tax_amount` - calculated and frozen at sale time
- Added `line_subtotal` - price × quantity before tax
- Added `product_name_snapshot` - product name at sale time
- Added `category_name_snapshot` - category name at sale time (nullable)
- Constraint: `line_total = line_subtotal + tax_amount`
- Complete historical record with all snapshots

## Key Architectural Principles

### 1. Orders Are Single Source of Truth
- All financial data comes from `bills` and `bill_items`
- Reports query only orders
- No inventory calculations in reports
- Complete audit trail from orders

### 2. Tax Values Are Frozen
- Tax rate and amount calculated at sale time
- Stored in `bill_items` as permanent snapshots
- Never change after order creation
- Ensures tax compliance and accurate reporting

### 3. Product Information Is Snapshotted
- Product name, category, price, tax_rate captured at sale time
- Stored in `bill_items` as permanent snapshots
- Ensures historical accuracy even if products change
- Reports use snapshots, not current product data

### 4. Menu Availability Is Manual
- Controlled by `products.is_active` flag
- Owner manually manages availability
- No automatic stock-based logic
- Simple, fast, owner-controlled

### 5. No Inventory Tracking
- No stock levels
- No quantity on hand
- No stock movements
- No inventory adjustments
- System is SALES + TAX + REPORTING only

## Migration Strategy

### Data Migration
- Existing `bills` records: `subtotal = total_amount`, `tax_amount = 0` (legacy)
- Existing `bill_items` records: snapshots populated from current products
- `inventory_ledger` preserved but deprecated (historical data)

### Application Migration (Future)
- Remove all inventory service logic
- Remove inventory API endpoints
- Remove inventory UI components
- Update billing service to remove inventory checks
- Update reports to use snapshots only

## Benefits

### 1. Simplicity
- Fewer tables to maintain
- Simpler queries
- Clearer data model
- Reduced codebase complexity

### 2. Performance
- Faster billing (no stock checks)
- Faster reports (no inventory joins)
- Simpler database schema
- Better query performance

### 3. Accuracy
- Tax values frozen at sale time
- Product information snapshotted
- Historical accuracy guaranteed
- No inventory-related discrepancies

### 4. Compliance
- Immutable financial records
- Complete audit trail
- Tax compliance through frozen values
- Accurate historical reporting

## What Remains

### Core Tables
- `categories` - Menu organization (new)
- `products` - Menu items
- `bills` - Orders (single source of truth)
- `bill_items` - Order line items with snapshots

### Deprecated (Not Dropped)
- `inventory_ledger` - Marked deprecated, preserved for historical data

## Next Steps

1. **Application Code Updates** (Future)
   - Remove inventory service logic
   - Remove inventory API endpoints
   - Update billing service to use snapshots
   - Update reports to use snapshots

2. **UI Updates** (Future)
   - Remove inventory management pages
   - Update product management to include categories
   - Update billing UI to show tax breakdown
   - Update reports to use snapshot data

3. **Testing**
   - Test bill creation with tax calculation
   - Test product snapshot functionality
   - Test category assignment
   - Test report generation with snapshots

## Summary

The system has been refactored from a retail POS with inventory management to a pure cafe POS focused on:
- **Accurate billing** - Orders are immutable financial records
- **Tax compliance** - Tax values frozen at sale time
- **Comprehensive reporting** - Reports derived exclusively from orders
- **Historical accuracy** - Product information snapshotted at sale time

**Inventory does not exist in the system.** The system is now a **SALES + TAX + REPORTING** system only.

---

**Migration File**: `backend/supabase/migrations/002_remove_inventory_add_tax_categories.sql`  
**Date**: January 2025  
**Version**: 3.0 (Cafe POS - Inventory Removed)

