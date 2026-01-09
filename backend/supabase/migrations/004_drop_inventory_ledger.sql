-- Migration: Drop Inventory Ledger Table
-- This migration removes the deprecated inventory_ledger table
-- Since inventory tracking has been completely removed from the system

BEGIN;

-- ============================================================================
-- DROP INVENTORY LEDGER TABLE
-- ============================================================================
-- The inventory_ledger table was deprecated in migration 002
-- and is no longer needed since inventory tracking is completely removed

DROP TABLE IF EXISTS inventory_ledger;

-- ============================================================================
-- CLEANUP COMMENTS
-- ============================================================================
-- Remove any remaining comments about the deprecated table
-- (This is mainly for documentation purposes)

COMMENT ON TABLE products IS 'Menu items for cafe POS. Products are menu items, not stock units. Inventory does not exist in this system.';

COMMIT;
